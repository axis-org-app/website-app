import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { schoolTypeLabels } from "../lib/auth";

type PersonRole = "student" | "teacher";

interface JoinRequest {
  id: string;
  name: string;
  role: PersonRole;
  detail: string;
  requested: string;
}

interface ActiveStudent {
  id: string;
  name: string;
  className: string;
  lastActive: string;
  live: boolean;
  points: number;
  submitted: number;
}

// SAMPLE DATA: replace with calls to your backend.
const initialRequests: JoinRequest[] = [
  { id: "r1", name: "Amara Eze", role: "student", detail: "JSS 2A", requested: "10 minutes ago" },
  { id: "r2", name: "Tunde Bakare", role: "teacher", detail: "Mathematics", requested: "35 minutes ago" },
  { id: "r3", name: "Ngozi Obi", role: "student", detail: "SS 1B", requested: "1 hour ago" },
  { id: "r4", name: "Ibrahim Musa", role: "student", detail: "JSS 3C", requested: "2 hours ago" },
  { id: "r5", name: "Funke Adeyemi", role: "teacher", detail: "English Language", requested: "Yesterday" },
];

const activeStudents: ActiveStudent[] = [
  { id: "s1", name: "Chidi Okeke", className: "SS 2A", lastActive: "Active now", live: true, points: 1840, submitted: 12 },
  { id: "s2", name: "Blessing Etim", className: "JSS 3B", lastActive: "Active now", live: true, points: 1625, submitted: 11 },
  { id: "s3", name: "Emeka Nwosu", className: "SS 1C", lastActive: "6 minutes ago", live: false, points: 1410, submitted: 9 },
  { id: "s4", name: "Sadiq Lawal", className: "JSS 2A", lastActive: "22 minutes ago", live: false, points: 1290, submitted: 10 },
  { id: "s5", name: "Zainab Bello", className: "SS 3B", lastActive: "1 hour ago", live: false, points: 1175, submitted: 8 },
  { id: "s6", name: "Kelechi Amadi", className: "JSS 1C", lastActive: "2 hours ago", live: false, points: 980, submitted: 7 },
];

function Stat({ label, value, note }: { label: string; value: number | string; note?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 sm:p-5">
      <p className="text-sm font-semibold text-ink/70">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold sm:text-4xl">{value}</p>
      {note && <p className="mt-1 text-sm text-ink/70">{note}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { account, logOut } = useAuth();
  const [requests, setRequests] = useState<JoinRequest[]>(initialRequests);
  const [approved, setApproved] = useState<Record<PersonRole, number>>({ student: 412, teacher: 27 });
  const [notice, setNotice] = useState("");

  if (!account) return <Navigate to="/login" replace />;

  function resolve(request: JoinRequest, approve: boolean) {
    setRequests((list) => list.filter((r) => r.id !== request.id));
    if (approve) setApproved((a) => ({ ...a, [request.role]: a[request.role] + 1 }));
    setNotice(`${request.name} ${approve ? "approved" : "declined"}.`);
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
          <Link to="/" aria-label="Learnly home">
            <Logo />
          </Link>
          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden max-w-[16rem] truncate text-sm font-semibold sm:block">{account.schoolName}</span>
            <button
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
          Welcome, {account.adminName.split(" ")[0]}
        </h1>
        <p className="mt-2 text-ink/70">
          {account.schoolName} · {schoolTypeLabels[account.schoolType]}
        </p>

        <p className="mt-6 rounded-xl border border-sun/70 bg-sun/20 px-4 py-3 text-sm">
          This dashboard shows sample data. Connect it to your backend to see your school's real activity and requests.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Stat label="Students active today" value={128} note={`of ${approved.student} approved`} />
          <Stat label="Teachers active today" value={14} note={`of ${approved.teacher} approved`} />
          <Stat label="Waiting for approval" value={requests.length} />
          <Stat label="Assessments submitted this week" value={342} />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.15fr]">
          {/* Approvals */}
          <section aria-labelledby="approvals-title">
            <h2 id="approvals-title" className="text-xl font-bold">
              Approval requests
            </h2>
            <p
              role="status"
              aria-live="polite"
              className={`mt-1 text-sm ${notice ? "font-semibold text-cobalt" : "text-ink/70"}`}
            >
              {notice || "People who asked to join your school from the app."}
            </p>
            {requests.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-line bg-white px-5 py-10 text-center">
                <p className="font-semibold">No requests waiting</p>
                <p className="mt-1 text-sm text-ink/70">New requests from the app will show up here.</p>
              </div>
            ) : (
              <ul className="mt-5 divide-y divide-line rounded-2xl border border-line bg-white">
                {requests.map((r) => (
                  <li key={r.id} className="flex flex-col gap-3 px-4 py-4 sm:px-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{r.name}</p>
                        <p className="text-sm text-ink/70">
                          {r.detail} · {r.requested}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                          r.role === "student" ? "bg-cobalt/10 text-cobalt" : "bg-mint/15 text-mint-dark"
                        }`}
                      >
                        {r.role === "student" ? "Student" : "Teacher"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => resolve(r, true)}
                        aria-label={`Approve ${r.name}`}
                        className="flex-1 rounded-lg bg-cobalt px-4 py-2 text-sm font-semibold text-white hover:bg-cobalt-dark sm:flex-none"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => resolve(r, false)}
                        aria-label={`Decline ${r.name}`}
                        className="flex-1 rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:border-ink/30 sm:flex-none"
                      >
                        Decline
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Active students */}
          <section aria-labelledby="students-title">
            <h2 id="students-title" className="text-xl font-bold">
              Active students
            </h2>
            <p className="mt-1 text-sm text-ink/70">Students who have used the app most recently.</p>
            <ul className="mt-5 divide-y divide-line rounded-2xl border border-line bg-white">
              {activeStudents.map((s) => (
                <li key={s.id} className="flex items-center gap-3 px-4 py-4 sm:px-5">
                  <span
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-cobalt/10 font-bold text-cobalt"
                    aria-hidden="true"
                  >
                    {s.name[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{s.name}</p>
                    <p className="text-sm text-ink/70">{s.className}</p>
                  </div>
                  <div className="hidden w-24 text-right text-sm sm:block">
                    <p className="font-semibold">{s.points.toLocaleString()} pts</p>
                    <p className="text-ink/70">{s.submitted} submitted</p>
                  </div>
                  <p className="flex w-28 shrink-0 items-center justify-end gap-1.5 text-right text-sm font-medium">
                    {s.live && <span className="size-2 shrink-0 rounded-full bg-mint" aria-hidden="true" />}
                    <span className={s.live ? "" : "text-ink/70"}>{s.lastActive}</span>
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
