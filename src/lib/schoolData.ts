export const availableClasses = ["SS1", "SS2", "SS3"] as const;

export const offeredSubjects = [
  "Mathematics",
  "English Language",
  "Biology",
  "Chemistry",
  "Physics",
  "Further Mathematics",
  "Economics",
  "Government",
  "Literature in English",
  "Commerce",
  "Accounting",
  "Civic Education",
  "Computer Studies",
  "Geography",
  "Agricultural Science",
  "French",
];

export type PersonRole = "student" | "teacher";

export interface JoinRequest {
  id: string;
  name: string;
  role: PersonRole;
  detail: string;
  requested: string;
}

export interface TeachingAssignment {
  className: string;
  subject: string;
}

export interface ManagedPerson {
  id: string;
  name: string;
  role: PersonRole;
  className: string;
  teachingAssignments: TeachingAssignment[];
  enabled: boolean;
}

export interface SchoolWorkspace {
  subjects: string[];
  requests: JoinRequest[];
  students: ManagedPerson[];
  teachers: ManagedPerson[];
}

const sampleRequests: JoinRequest[] = [
  { id: "r1", name: "Amara Eze", role: "student", detail: "JSS 2A", requested: "10 minutes ago" },
  { id: "r2", name: "Tunde Bakare", role: "teacher", detail: "Mathematics", requested: "35 minutes ago" },
  { id: "r3", name: "Ngozi Obi", role: "student", detail: "SS 1B", requested: "1 hour ago" },
  { id: "r4", name: "Ibrahim Musa", role: "student", detail: "JSS 3C", requested: "2 hours ago" },
  { id: "r5", name: "Funke Adeyemi", role: "teacher", detail: "English Language", requested: "Yesterday" },
];

const sampleStudents: ManagedPerson[] = [
  { id: "s1", name: "Chidi Okeke", role: "student", className: "SS 2A", teachingAssignments: [], enabled: true },
  { id: "s2", name: "Blessing Etim", role: "student", className: "JSS 3B", teachingAssignments: [], enabled: true },
  { id: "s3", name: "Emeka Nwosu", role: "student", className: "SS 1C", teachingAssignments: [], enabled: true },
  { id: "s4", name: "Sadiq Lawal", role: "student", className: "JSS 2A", teachingAssignments: [], enabled: true },
  { id: "s5", name: "Zainab Bello", role: "student", className: "SS 3B", teachingAssignments: [], enabled: true },
  { id: "s6", name: "Kelechi Amadi", role: "student", className: "JSS 1C", teachingAssignments: [], enabled: true },
];

function storageKey(email: string) {
  return `komi.school-workspace:${email.trim().toLowerCase()}`;
}

export function getSchoolWorkspace(email: string): SchoolWorkspace {
  const raw = localStorage.getItem(storageKey(email));
  if (!raw) {
    const workspace: SchoolWorkspace = {
      subjects: [],
      requests: sampleRequests.map((request) => ({ ...request })),
      students: sampleStudents.map((student) => ({ ...student })),
      teachers: [],
    };
    saveSchoolWorkspace(email, workspace);
    return workspace;
  }

  try {
    const workspace = JSON.parse(raw) as SchoolWorkspace;
    if (
      !Array.isArray(workspace.subjects) ||
      !Array.isArray(workspace.requests) ||
      !Array.isArray(workspace.students) ||
      !Array.isArray(workspace.teachers)
    ) {
      throw new Error("The saved school dashboard data has an invalid format.");
    }
    const subjectCatalog: ReadonlySet<string> = new Set(offeredSubjects);
    const normalized: SchoolWorkspace = {
      ...workspace,
      subjects: workspace.subjects.filter((subject) => subjectCatalog.has(subject)),
      students: workspace.students.map((student) => ({
        ...student,
        teachingAssignments: Array.isArray(student.teachingAssignments) ? student.teachingAssignments : [],
      })),
      teachers: workspace.teachers.map((teacher) => ({
        ...teacher,
        teachingAssignments: Array.isArray(teacher.teachingAssignments)
          ? teacher.teachingAssignments.filter(
              (assignment) =>
                subjectCatalog.has(assignment.subject) &&
                workspace.subjects.includes(assignment.subject) &&
                availableClasses.includes(assignment.className as (typeof availableClasses)[number]),
            )
          : [],
      })),
    };
    saveSchoolWorkspace(email, normalized);
    return normalized;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("The saved school dashboard data could not be read. Clear this school's browser data and try again.");
    }
    throw error;
  }
}

export function saveSchoolWorkspace(email: string, workspace: SchoolWorkspace) {
  localStorage.setItem(storageKey(email), JSON.stringify(workspace));
}
