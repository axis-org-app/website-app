import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PracticeCard from "../components/PracticeCard";
import DashboardPreview from "../components/DashboardPreview";

const steps = [
  { title: "Register your school", body: "Create your school's account on this website and your dashboard is ready." },
  { title: "People request to join", body: "Teachers and students sign up in the Learnly app and ask to join your school." },
  { title: "You approve them", body: "Approve each request from your dashboard, so only your own people get in." },
  { title: "Learning begins", body: "Teachers set assessments, and students submit, revise and earn rewards." },
];

const features = [
  {
    title: "Assessments",
    body: "Teachers set assessments and students submit them in the app, so there's nothing to collect on paper.",
  },
  {
    title: "Quizzes and flashcards",
    body: "Students revise with short quizzes and flashcards whenever they have a spare few minutes.",
  },
  {
    title: "Points and streaks",
    body: "Rewards turn daily revision into a game students want to keep playing.",
  },
  {
    title: "A dashboard for your school",
    body: "See which students are active, and approve every student and teacher who asks to join.",
  },
];

const schoolPoints = [
  "Every student and teacher needs your approval before they can use the app",
  "See who is actively learning, class by class",
  "Everything lives in one dashboard that you log in to on this website",
];

const audiences = {
  Students: [
    "Revise with quizzes and flashcards",
    "Submit assessments from your phone",
    "Earn points and keep your streak going",
    "Join as soon as your school approves you",
  ],
  Teachers: [
    "Set assessments for your classes",
    "Collect student submissions in one place",
    "Keep your students revising between lessons",
    "Join as soon as your school approves you",
  ],
} as const;

type Audience = keyof typeof audiences;

export default function Home() {
  const [tab, setTab] = useState<Audience>("Students");

  return (
    <div className="overflow-x-clip">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-10 sm:px-6 sm:pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:pt-20">
          <div>
            <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Assessments, quizzes and flashcards students want to open.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/75">
              Teachers set assessments and students submit them in the app. Students also revise with quizzes and
              flashcards, and earn rewards along the way. Your school stays in control from one dashboard.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/signup"
                className="rounded-xl bg-cobalt px-6 py-3.5 text-center font-semibold text-white transition-colors hover:bg-cobalt-dark"
              >
                Register your school
              </Link>
              <a
                href="#how"
                className="rounded-xl border border-line bg-white px-6 py-3.5 text-center font-semibold transition-colors hover:border-ink/30"
              >
                See how it works
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -right-2 -top-2 size-full rotate-2 rounded-3xl bg-sun sm:-right-3 sm:-top-3" aria-hidden="true" />
            <PracticeCard />
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-16 border-y border-line bg-white">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20">
            <h2 className="max-w-xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
              From registration to the first assessment
            </h2>
            <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <li key={s.title}>
                  <span className="font-display text-5xl font-bold text-cobalt">{i + 1}</span>
                  <h3 className="mt-3 text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink/75">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto grid max-w-6xl scroll-mt-16 gap-10 px-5 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Everything for teaching, studying and keeping track
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-ink/75">
              One app for students and teachers, and one dashboard for the school.
            </p>
          </div>
          <dl className="divide-y divide-line border-y border-line">
            {features.map((f) => (
              <div key={f.title} className="grid gap-1 py-6 sm:grid-cols-[13rem_1fr] sm:gap-8">
                <dt className="text-lg font-bold">{f.title}</dt>
                <dd className="leading-relaxed text-ink/75">{f.body}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Schools */}
        <section id="schools" className="scroll-mt-16 border-y border-line bg-white">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-6 sm:py-20 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Your school stays in control
              </h2>
              <p className="mt-4 max-w-md leading-relaxed text-ink/75">
                Schools are the only ones who register on this website. Students and teachers join from the app, and
                nobody gets in until you say so.
              </p>
              <ul className="mt-6 space-y-3">
                {schoolPoints.map((point) => (
                  <li key={point} className="flex gap-3">
                    <svg className="mt-1 size-5 shrink-0 text-cobalt" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="m4 10.5 4 4 8-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {point}
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className="mt-8 inline-block rounded-xl bg-cobalt px-6 py-3.5 font-semibold text-white transition-colors hover:bg-cobalt-dark"
              >
                Register your school
              </Link>
            </div>
            <DashboardPreview />
          </div>
        </section>

        {/* In the app */}
        <section id="app" className="scroll-mt-16 bg-ink text-white">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20">
            <h2 className="max-w-xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
              What students and teachers do in the app
            </h2>
            <div role="tablist" aria-label="Choose a role" className="mt-6 flex flex-wrap gap-2">
              {(Object.keys(audiences) as Audience[]).map((name) => (
                <button
                  key={name}
                  role="tab"
                  id={`tab-${name}`}
                  aria-selected={tab === name}
                  aria-controls={`panel-${name}`}
                  onClick={() => setTab(name)}
                  className={`rounded-full px-5 py-2.5 font-semibold transition-colors ${
                    tab === name ? "bg-sun text-ink" : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
            <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-8 max-w-2xl">
              <ul className="space-y-4 text-lg">
                {audiences[tab].map((point) => (
                  <li key={point} className="flex gap-3">
                    <svg className="mt-1.5 size-5 shrink-0 text-sun" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="m4 10.5 4 4 8-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-cobalt p-8 text-white md:flex-row md:items-center md:p-14">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Bring Learnly to your school</h2>
              <p className="mt-2 text-white/85">Register your school to get your dashboard.</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                to="/signup"
                className="rounded-xl bg-white px-6 py-3.5 text-center font-semibold text-cobalt transition-colors hover:bg-sun hover:text-ink"
              >
                Register your school
              </Link>
              <Link
                to="/login"
                className="rounded-xl border border-white/40 px-6 py-3.5 text-center font-semibold transition-colors hover:bg-white/10"
              >
                School login
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
