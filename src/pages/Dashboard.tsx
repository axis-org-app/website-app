import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { schoolTypeLabels } from "../lib/auth";
import {
  availableClasses,
  getSchoolWorkspace,
  offeredSubjects,
  saveSchoolWorkspace,
  type JoinRequest,
  type ManagedPerson,
  type PersonRole,
  type SchoolWorkspace,
  type TeachingAssignment,
} from "../lib/schoolData";

const STUDENTS_PER_PAGE = 25;
const DASHBOARD_THEME_KEY = "komi.dashboard-theme";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 sm:p-5">
      <p className="text-sm font-semibold text-ink/70">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold sm:text-4xl">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const { account, logOut } = useAuth();
  const [workspace, setWorkspace] = useState<SchoolWorkspace | null>(() =>
    account ? getSchoolWorkspace(account.email) : null,
  );
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem(DASHBOARD_THEME_KEY) === "dark");
  const [notice, setNotice] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [studentClassFilter, setStudentClassFilter] = useState("");
  const [studentPage, setStudentPage] = useState(1);
  const [assignmentTeacherId, setAssignmentTeacherId] = useState("");
  const [assignmentClass, setAssignmentClass] = useState("");
  const [assignmentSubject, setAssignmentSubject] = useState("");
  const [pendingAssignment, setPendingAssignment] = useState<
    (TeachingAssignment & { teacherId: string; teacherName: string }) | null
  >(null);

  if (!account || !workspace) return <Navigate to="/login" replace />;
  const schoolAccount = account;
  const schoolWorkspace = workspace;

  function commitWorkspace(next: SchoolWorkspace) {
    saveSchoolWorkspace(schoolAccount.email, next);
    setWorkspace(next);
  }

  function resolve(request: JoinRequest, approve: boolean) {
    const next: SchoolWorkspace = {
      ...schoolWorkspace,
      requests: schoolWorkspace.requests.filter((item) => item.id !== request.id),
    };
    if (approve) {
      const person: ManagedPerson = {
        id: `${request.role}-${request.id}`,
        name: request.name,
        role: request.role,
        className: "",
        teachingAssignments: [],
        enabled: true,
      };
      if (request.role === "student") next.students = [...schoolWorkspace.students, person];
      else next.teachers = [...schoolWorkspace.teachers, person];
    }
    commitWorkspace(next);
    setNotice(`${request.name} ${approve ? "approved" : "declined"}.`);
  }

  function updatePerson(role: PersonRole, id: string, updates: Partial<ManagedPerson>) {
    const list = role === "student" ? schoolWorkspace.students : schoolWorkspace.teachers;
    const updatedList = list.map((person) => (person.id === id ? { ...person, ...updates } : person));
    commitWorkspace({
      ...schoolWorkspace,
      ...(role === "student" ? { students: updatedList } : { teachers: updatedList }),
    });
  }

  function requestAssignment() {
    const teacher = schoolWorkspace.teachers.find((person) => person.id === assignmentTeacherId);
    if (!teacher?.enabled || !assignmentClass || !schoolWorkspace.subjects.includes(assignmentSubject)) {
      setNotice("Select an enabled teacher, a class, and a subject your school offers.");
      return;
    }
    setPendingAssignment({
      teacherId: teacher.id,
      teacherName: teacher.name,
      className: assignmentClass,
      subject: assignmentSubject,
    });
  }

  function confirmAssignment() {
    if (!pendingAssignment) return;
    const teacher = schoolWorkspace.teachers.find((person) => person.id === pendingAssignment.teacherId);
    if (!teacher?.enabled || !schoolWorkspace.subjects.includes(pendingAssignment.subject)) {
      setPendingAssignment(null);
      setNotice("The teacher or subject is no longer available. Choose an enabled teacher and offered subject, then try again.");
      return;
    }
    if (
      teacher.teachingAssignments.some(
        (assignment) =>
          assignment.className === pendingAssignment.className &&
          assignment.subject === pendingAssignment.subject,
      )
    ) {
      setPendingAssignment(null);
      setNotice(`${teacher.name} is already assigned to teach ${pendingAssignment.subject} in ${pendingAssignment.className}.`);
      return;
    }
    updatePerson("teacher", teacher.id, {
      teachingAssignments: [
        ...teacher.teachingAssignments,
        { className: pendingAssignment.className, subject: pendingAssignment.subject },
      ],
    });
    setNotice(
      `${pendingAssignment.teacherName} assigned to teach ${pendingAssignment.subject} in ${pendingAssignment.className}.`,
    );
    setPendingAssignment(null);
    setAssignmentClass("");
    setAssignmentSubject("");
  }

  function toggleSchoolSubject(subject: string) {
    const isOffered = schoolWorkspace.subjects.includes(subject);
    commitWorkspace({
      ...schoolWorkspace,
      subjects: isOffered
        ? schoolWorkspace.subjects.filter((item) => item !== subject)
        : [...schoolWorkspace.subjects, subject],
      teachers: isOffered
        ? schoolWorkspace.teachers.map((teacher) => ({
            ...teacher,
            teachingAssignments: teacher.teachingAssignments.filter((assignment) => assignment.subject !== subject),
          }))
        : schoolWorkspace.teachers,
    });
    setNotice(`${subject} ${isOffered ? "removed from" : "added to"} your school's offered subjects.`);
  }

  const teacherCount = schoolWorkspace.teachers.length;
  const studentCount = schoolWorkspace.students.length;
  const normalizedStudentSearch = studentSearch.trim().toLocaleLowerCase();
  const filteredStudents = schoolWorkspace.students.filter((student) => {
    const matchesSearch = student.name.toLocaleLowerCase().includes(normalizedStudentSearch);
    const matchesClass =
      studentClassFilter === ""
        ? true
        : studentClassFilter === "unassigned"
          ? !student.className
          : student.className === studentClassFilter;
    return matchesSearch && matchesClass;
  });
  const studentPageCount = Math.max(1, Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE));
  const currentStudentPage = Math.min(studentPage, studentPageCount);
  const firstStudentIndex = (currentStudentPage - 1) * STUDENTS_PER_PAGE;
  const visibleStudents = filteredStudents.slice(firstStudentIndex, firstStudentIndex + STUDENTS_PER_PAGE);
  const studentClassOptions = [...new Set([
    ...availableClasses,
    ...schoolWorkspace.students.map((student) => student.className).filter(Boolean),
  ])];

  function toggleDarkMode() {
    const nextIsDarkMode = !isDarkMode;
    localStorage.setItem(DASHBOARD_THEME_KEY, nextIsDarkMode ? "dark" : "light");
    setIsDarkMode(nextIsDarkMode);
  }

  async function copySchoolCode() {
    try {
      await navigator.clipboard.writeText(schoolAccount.schoolCode);
      setNotice("School code copied to clipboard.");
    } catch {
      setNotice("Could not copy the school code. Check your browser clipboard permissions and try again.");
    }
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? "dashboard-dark" : ""}`}>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
          <Link to="/" aria-label="Komi Learning home">
            <Logo />
          </Link>
          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden max-w-[16rem] truncate text-sm font-semibold sm:block">{schoolAccount.schoolName}</span>
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-pressed={isDarkMode}
              className="grid size-10 shrink-0 place-items-center rounded-xl border border-line hover:border-ink/30"
            >
              {isDarkMode ? (
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5">
                  <circle cx="12" cy="12" r="4" />
                  <path strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
                </svg>
              ) : (
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.2 15.1A8.5 8.5 0 0 1 8.9 3.8 8.5 8.5 0 1 0 20.2 15.1Z" />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={logOut}
              className="shrink-0 rounded-xl border border-line px-4 py-2 text-sm font-semibold hover:border-ink/30"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Welcome, {schoolAccount.adminName.split(" ")[0]}
        </h1>
        <p className="mt-2 text-ink/70">
          {schoolAccount.schoolName} · {schoolTypeLabels[schoolAccount.schoolType]}
        </p>
        <div className="mt-5 inline-flex flex-col gap-1 rounded-xl border border-line bg-white px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
          <span className="text-sm font-semibold text-ink/70">School code</span>
          <div className="flex items-center gap-2">
            <code className="font-mono text-base font-bold tracking-wider">{schoolAccount.schoolCode}</code>
            <button
              type="button"
              onClick={copySchoolCode}
              aria-label="Copy school code"
              title="Copy school code"
              className="grid size-9 place-items-center rounded-lg border border-line hover:border-ink/30 hover:bg-ink/5"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4">
                <rect x="8" y="8" width="12" height="12" rx="2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
              </svg>
            </button>
          </div>
        </div>
        <p className="mt-5 rounded-xl border border-sun/70 bg-sun/20 px-4 py-3 text-sm">
          This demo saves dashboard data in this browser. Connect a backend to sync real school, student, and teacher
          accounts across devices.
        </p>
        <p role="status" aria-live="polite" className={`mt-4 min-h-5 text-sm ${notice ? "font-semibold text-cobalt" : ""}`}>
          {notice}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Stat label="Students" value={studentCount} />
          <Stat label="Teachers" value={teacherCount} />
          <Stat label="Waiting for approval" value={schoolWorkspace.requests.length} />
          <Stat label="School subjects" value={schoolWorkspace.subjects.length} />
        </div>

        <section className="mt-10" aria-labelledby="subjects-title">
          <h2 id="subjects-title" className="text-xl font-bold">Subjects offered</h2>
          <p className="mt-1 text-sm text-ink/70">
            Select the subjects your school offers. You can change these selections anytime.
          </p>
          <fieldset className="mt-4">
            <legend className="sr-only">Subjects your school offers</legend>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {offeredSubjects.map((subject) => (
                <label key={subject} className="flex cursor-pointer items-center gap-3 rounded-lg border border-line bg-white px-4 py-3 text-sm font-medium hover:border-cobalt">
                  <input
                    type="checkbox"
                    checked={schoolWorkspace.subjects.includes(subject)}
                    onChange={() => toggleSchoolSubject(subject)}
                    className="size-4 accent-cobalt"
                  />
                  {subject}
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        <section className="mt-10" aria-labelledby="approvals-title">
          <h2 id="approvals-title" className="text-xl font-bold">Approval requests</h2>
          <p className="mt-1 text-sm text-ink/70">Approve people joining your school from the app.</p>
          {schoolWorkspace.requests.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-line bg-white px-5 py-10 text-center">
              <p className="font-semibold">No requests waiting</p>
              <p className="mt-1 text-sm text-ink/70">New requests from the app will show up here.</p>
            </div>
          ) : (
            <ul className="mt-5 grid gap-3 md:grid-cols-2">
              {schoolWorkspace.requests.map((request) => (
                <li key={request.id} className="rounded-2xl border border-line bg-white p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{request.name}</p>
                      <p className="text-sm text-ink/70">{request.detail} · {request.requested}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                      request.role === "student" ? "bg-cobalt/10 text-cobalt" : "bg-mint/15 text-mint-dark"
                    }`}>
                      {request.role === "student" ? "Student" : "Teacher"}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => resolve(request, true)}
                      className="rounded-lg bg-cobalt px-4 py-2 text-sm font-semibold text-white hover:bg-cobalt-dark"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => resolve(request, false)}
                      className="rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:border-ink/30"
                    >
                      Decline
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-10" aria-labelledby="students-title">
          <h2 id="students-title" className="text-xl font-bold">All students ({studentCount})</h2>
          <p className="mt-1 text-sm text-ink/70">Assign an approved student to a class or disable their account.</p>
          <div className="mt-5 grid gap-3 rounded-2xl border border-line bg-white p-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="text-sm font-semibold">
              Search students
              <input
                type="search"
                value={studentSearch}
                onChange={(event) => {
                  setStudentSearch(event.target.value);
                  setStudentPage(1);
                }}
                placeholder="Search by student name"
                className="mt-1.5 h-11 w-full rounded-lg border border-line bg-white px-3 font-normal"
              />
            </label>
            <label className="text-sm font-semibold">
              Filter by class
              <select
                value={studentClassFilter}
                onChange={(event) => {
                  setStudentClassFilter(event.target.value);
                  setStudentPage(1);
                }}
                className="mt-1.5 h-11 w-full rounded-lg border border-line bg-white px-3 font-normal sm:w-56"
              >
                <option value="">All classes</option>
                <option value="unassigned">Unassigned</option>
                {studentClassOptions.map((className) => <option key={className} value={className}>{className}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-3 flex flex-col gap-3 text-sm text-ink/70 sm:flex-row sm:items-center sm:justify-between">
            <p aria-live="polite">
              {filteredStudents.length === 0
                ? "No students match your search and class filter."
                : `Showing ${firstStudentIndex + 1}–${Math.min(firstStudentIndex + STUDENTS_PER_PAGE, filteredStudents.length)} of ${filteredStudents.length} matching students`}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStudentPage(currentStudentPage - 1)}
                disabled={currentStudentPage === 1}
                className="rounded-lg border border-line px-3 py-2 font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span aria-current="page">Page {currentStudentPage} of {studentPageCount}</span>
              <button
                type="button"
                onClick={() => setStudentPage(currentStudentPage + 1)}
                disabled={currentStudentPage === studentPageCount}
                className="rounded-lg border border-line px-3 py-2 font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
          <ul className="mt-5 divide-y divide-line rounded-2xl border border-line bg-white">
            {visibleStudents.map((student) => {
              const classChoices: string[] = [...availableClasses];
              if (student.className && !classChoices.includes(student.className)) {
                classChoices.push(student.className);
              }
              return (
                <li key={student.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-cobalt/10 font-bold text-cobalt">
                      {student.name[0]}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{student.name}</p>
                      <p className={`text-sm ${student.enabled ? "text-ink/60" : "font-semibold text-danger"}`}>
                        {student.enabled ? "Enabled" : "Disabled"}
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm font-medium">
                    Class
                    <select
                      value={student.className}
                      onChange={(event) => updatePerson("student", student.id, { className: event.target.value })}
                      className="h-10 rounded-lg border border-line bg-white px-3"
                    >
                      <option value="">Unassigned</option>
                      {classChoices.map((className) => <option key={className} value={className}>{className}</option>)}
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() => updatePerson("student", student.id, { enabled: !student.enabled })}
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                      student.enabled ? "border-danger/30 text-danger hover:bg-danger/5" : "border-mint/40 text-mint-dark hover:bg-mint/10"
                    }`}
                  >
                    {student.enabled ? "Disable account" : "Enable account"}
                  </button>
                </li>
              );
            })}
            {studentCount === 0 && <li className="px-5 py-8 text-center text-sm text-ink/70">Approved students will appear here.</li>}
            {studentCount > 0 && filteredStudents.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-ink/70">Try another student name or class filter.</li>
            )}
          </ul>
        </section>

        <section className="mt-10" aria-labelledby="teachers-title">
          <h2 id="teachers-title" className="text-xl font-bold">All teachers ({teacherCount})</h2>
          <p className="mt-1 text-sm text-ink/70">Assign a specific subject to a specific class for a teacher.</p>
          <div className="mt-5 rounded-2xl border border-line bg-white p-4 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="text-sm font-semibold">
                Teacher
                <select
                  value={assignmentTeacherId}
                  onChange={(event) => setAssignmentTeacherId(event.target.value)}
                  className="mt-1.5 h-11 w-full rounded-lg border border-line bg-white px-3 font-normal"
                >
                  <option value="">Select a teacher</option>
                  {schoolWorkspace.teachers.filter((teacher) => teacher.enabled).map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold">
                Class
                <select
                  value={assignmentClass}
                  onChange={(event) => setAssignmentClass(event.target.value)}
                  className="mt-1.5 h-11 w-full rounded-lg border border-line bg-white px-3 font-normal"
                >
                  <option value="">Select a class</option>
                  {availableClasses.map((className) => <option key={className} value={className}>{className}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold">
                Subject
                <select
                  value={assignmentSubject}
                  onChange={(event) => setAssignmentSubject(event.target.value)}
                  className="mt-1.5 h-11 w-full rounded-lg border border-line bg-white px-3 font-normal"
                >
                  <option value="">Select a subject</option>
                  {schoolWorkspace.subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
                </select>
              </label>
            </div>
            <button
              type="button"
              onClick={requestAssignment}
              disabled={!assignmentTeacherId || !assignmentClass || !assignmentSubject}
              className="mt-4 rounded-lg bg-cobalt px-5 py-2.5 text-sm font-semibold text-white hover:bg-cobalt-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              Assign
            </button>
            {schoolWorkspace.teachers.filter((teacher) => teacher.enabled).length === 0 && (
              <p className="mt-3 text-sm text-ink/70">Approve and enable a teacher before creating an assignment.</p>
            )}
            {schoolWorkspace.subjects.length === 0 && (
              <p className="mt-3 text-sm text-ink/70">Select at least one subject in Subjects offered before creating an assignment.</p>
            )}
          </div>
          <ul className="mt-5 divide-y divide-line rounded-2xl border border-line bg-white">
            {schoolWorkspace.teachers.map((teacher) => (
              <li key={teacher.id} className="flex flex-col gap-4 px-4 py-4 sm:px-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-mint/15 font-bold text-mint-dark">
                      {teacher.name[0]}
                    </span>
                    <div>
                      <p className="truncate font-semibold">{teacher.name}</p>
                      <p className={`text-sm ${teacher.enabled ? "text-ink/60" : "font-semibold text-danger"}`}>
                        {teacher.enabled ? "Enabled" : "Disabled"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (teacher.enabled && assignmentTeacherId === teacher.id) setAssignmentTeacherId("");
                      updatePerson("teacher", teacher.id, { enabled: !teacher.enabled });
                    }}
                    className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-semibold ${
                      teacher.enabled ? "border-danger/30 text-danger hover:bg-danger/5" : "border-mint/40 text-mint-dark hover:bg-mint/10"
                    }`}
                  >
                    {teacher.enabled ? "Disable account" : "Enable account"}
                  </button>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Teaching assignments</h3>
                  {teacher.teachingAssignments.length === 0 ? (
                    <p className="mt-1 text-sm text-ink/60">No classes or subjects assigned yet.</p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {teacher.teachingAssignments.map((assignment, index) => (
                        <li
                          key={`${assignment.className}-${assignment.subject}`}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line px-3 py-2 text-sm"
                        >
                          <span><strong>{assignment.subject}</strong> · {assignment.className}</span>
                          <button
                            type="button"
                            onClick={() =>
                              updatePerson("teacher", teacher.id, {
                                teachingAssignments: teacher.teachingAssignments.filter((_, itemIndex) => itemIndex !== index),
                              })
                            }
                            aria-label={`Remove ${assignment.subject} assignment for ${assignment.className} from ${teacher.name}`}
                            className="font-semibold text-danger hover:underline"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
            {teacherCount === 0 && <li className="px-5 py-8 text-center text-sm text-ink/70">Approved teachers will appear here.</li>}
          </ul>
        </section>
      </main>
      {pendingAssignment && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-assignment-title"
            aria-describedby="confirm-assignment-description"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 id="confirm-assignment-title" className="text-xl font-bold">Confirm teacher assignment</h2>
            <p id="confirm-assignment-description" className="mt-3 text-sm leading-6 text-ink/80">
              Are you sure you want to assign the role of teaching <b>{pendingAssignment.subject}</b> to{" "}
              <b>{pendingAssignment.className}</b> to <b>{pendingAssignment.teacherName}</b>?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingAssignment(null)}
                className="rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:border-ink/30"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAssignment}
                className="rounded-lg bg-cobalt px-4 py-2 text-sm font-semibold text-white hover:bg-cobalt-dark"
              >
                Confirm assignment
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
