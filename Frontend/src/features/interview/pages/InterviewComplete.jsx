import { useNavigate } from "react-router-dom";

const scores = [
  { label: "Communication", value: 86 },
  { label: "Technical", value: 79 },
  { label: "Confidence", value: 84 },
  { label: "Answer quality", value: 80 },
];

const InterviewComplete = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8f8f6] px-6 py-10 text-zinc-900 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-zinc-400">
          04 / COMPLETE
        </p>

        <div className="mt-14 grid gap-14 lg:grid-cols-2">
          <div>
            <h1 className="text-5xl font-medium tracking-tight">
              Interview
              <br />
              complete.
            </h1>

            <p className="mt-6 max-w-md leading-7 text-zinc-500">
              Great work. Your answers have been analyzed and your interview
              report is ready.
            </p>

            <div className="mt-10 flex gap-3">
              <button
                className="rounded-full bg-zinc-900 px-7 py-3 text-sm font-medium text-white"
              >
                View full analysis
              </button>

              <button
                onClick={() => navigate("/dashboard")}
                className="rounded-full border border-zinc-300 px-7 py-3 text-sm"
              >
                Dashboard
              </button>
            </div>
          </div>

          <div className="rounded-[32px] border border-zinc-200 bg-white p-8 shadow-sm">
            <p className="text-sm text-zinc-500">Interview score</p>

            <div className="mt-3 text-6xl font-medium">
              82
              <span className="text-2xl text-zinc-300">/100</span>
            </div>

            <div className="mt-10 space-y-6">
              {scores.map((score) => (
                <div key={score.label}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>{score.label}</span>
                    <span>{score.value}</span>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className="h-full bg-zinc-900"
                      style={{ width: `${score.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewComplete;