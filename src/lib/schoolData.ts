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
  joinRequestId?: string;
  name: string;
  role: PersonRole;
  detail: string;
  requested: string;
}

export interface TeachingAssignment {
  className: string;
  subject: string;
  classId?: string;
  schoolSubjectId?: string;
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

const demoRequestIds = new Set(["r1", "r2", "r3", "r4", "r5"]);
const demoStudentIds = new Set(["s1", "s2", "s3", "s4", "s5", "s6"]);

function storageKey(email: string) {
  return `komi.school-workspace:${email.trim().toLowerCase()}`;
}

export function getSchoolWorkspace(email: string): SchoolWorkspace {
  const raw = localStorage.getItem(storageKey(email));
  if (!raw) {
    const workspace: SchoolWorkspace = {
      subjects: [],
      requests: [],
      students: [],
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
      // Remove seeded demo rows from existing browser storage and discard obsolete class labels.
      requests: workspace.requests.filter((request) => !demoRequestIds.has(request.id)),
      students: workspace.students
        .filter((student) => !demoStudentIds.has(student.id))
        .map((student) => ({
          ...student,
          className: availableClasses.includes(student.className as (typeof availableClasses)[number])
            ? student.className
            : "",
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
