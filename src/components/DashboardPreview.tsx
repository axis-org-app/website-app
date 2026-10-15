const waiting = [
  { name: "Amara Eze", role: "Student", detail: "JSS 2A" },
  { name: "Tunde Bakare", role: "Teacher", detail: "Mathematics" },
  { name: "Ngozi Obi", role: "Student", detail: "SS 1B" },
];

/** A static picture of the school dashboard, used on the landing page. */
export default function DashboardPreview() {
  return (
    <div
      role="img"
      aria-label="Preview of the school dashboard: 128 students active today and three people waiting for approval"
      className="rounded-3xl border border-line bg-white p-4 shadow-xl shadow-ink/10 sm:p-6"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-paper p-4">
          <p className="text-sm font-semibold text-ink/70">Active students today</p>
          <p className="mt-1 font-display text-3xl font-bold">128</p>
        </div>
        <div className="rounded-2xl bg-sun/30 p-4">
          <p className="text-sm font-semibold text-ink/70">Waiting for approval</p>
          <p className="mt-1 font-display text-3xl font-bold">3</p>
        </div>
      </div>

      <p className="mt-5 text-sm font-bold">Approval requests</p>
      <ul className="mt-2 divide-y divide-line rounded-2xl border border-line">
        {waiting.map((p) => (
          <li key={p.name} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate font-semibold">{p.name}</p>
              <p className="text-sm text-ink/70">
                {p.role}, {p.detail}
              </p>
            </div>
            <div className="flex shrink-0 gap-2" aria-hidden="true">
              <span className="rounded-lg bg-cobalt px-3 py-1.5 text-sm font-semibold text-white">Approve</span>
              <span className="hidden rounded-lg border border-line px-3 py-1.5 text-sm font-semibold sm:inline">
                Decline
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
