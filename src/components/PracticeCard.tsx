import { useState } from "react";

interface Question {
  prompt: string;
  options: string[];
  answer: number;
  why: string;
}

const questions: Question[] = [
  {
    prompt: "A recipe uses ¾ cup of milk for 6 pancakes. How much milk do 8 pancakes need?",
    options: ["⅞ cup", "1 cup", "1¼ cups"],
    answer: 1,
    why: "One pancake needs ⅛ cup (¾ ÷ 6), so eight need 8 × ⅛ = 1 cup.",
  },
  {
    prompt: "Which fraction is greater?",
    options: ["⅔", "⅝", "They're equal"],
    answer: 0,
    why: "Over a common denominator of 24, ⅔ = 16/24 and ⅝ = 15/24.",
  },
  {
    prompt: "What is 15% of 80?",
    options: ["10", "12", "15"],
    answer: 1,
    why: "10% of 80 is 8 and 5% is 4, so 15% is 12.",
  },
];

const POINTS = 10;

export default function PracticeCard() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const q = questions[index];
  const answered = picked !== null;
  const correct = picked === q.answer;

  function pick(i: number) {
    setPicked(i);
    if (i === q.answer) {
      setXp((x) => x + POINTS);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  }

  function next() {
    setIndex((i) => (i + 1) % questions.length);
    setPicked(null);
  }

  return (
    <div className="relative rounded-3xl border border-line bg-white p-5 shadow-xl shadow-ink/10 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold">
        <span>
          Question {index + 1} of {questions.length}
        </span>
        <div className="flex gap-2">
          <span className="rounded-full bg-sun/40 px-3 py-1">{xp} XP</span>
          <span className="rounded-full bg-cobalt/10 px-3 py-1 text-cobalt">Streak {streak}</span>
        </div>
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-line" aria-hidden="true">
        <div
          className="h-full rounded-full bg-cobalt transition-all"
          style={{ width: `${((index + (answered ? 1 : 0.35)) / questions.length) * 100}%` }}
        />
      </div>

      <h2 className="mt-6 font-display text-xl font-bold leading-snug sm:text-2xl">{q.prompt}</h2>

      <div className="mt-5 space-y-2.5">
        {q.options.map((option, i) => {
          const isPicked = picked === i;
          const isAnswer = q.answer === i;
          let style = "border-line bg-white hover:border-cobalt";
          if (answered && isAnswer) style = "border-mint bg-mint/10";
          else if (answered && isPicked) style = "border-danger bg-danger/5";
          else if (answered) style = "border-line bg-white opacity-60";

          return (
            <button
              key={option}
              type="button"
              disabled={answered}
              onClick={() => pick(i)}
              className={`flex w-full items-center justify-between gap-3 rounded-xl border-2 px-4 py-3.5 text-left font-semibold transition-colors disabled:cursor-default ${style}`}
            >
              {option}
              {answered && isAnswer && <span className="shrink-0 text-sm text-mint-dark">Correct</span>}
              {answered && isPicked && !isAnswer && <span className="shrink-0 text-sm text-danger">Not quite</span>}
            </button>
          );
        })}
      </div>

      <div role="status" aria-live="polite" className="mt-5 min-h-[8.5rem]">
        {answered && (
          <>
            <p className="text-ink/80">{q.why}</p>
            <p className="mt-3 text-sm font-semibold">
              {correct
                ? `+${POINTS} XP. Your streak is now ${streak}.`
                : "Your streak reset, but you can start a new one."}
            </p>
            <button
              type="button"
              onClick={next}
              className="mt-3 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink/90"
            >
              Next question
            </button>
          </>
        )}
      </div>
    </div>
  );
}
