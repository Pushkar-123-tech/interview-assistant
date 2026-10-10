const InterviewProgress = ({ current, total }) => {
  const safeTotal = total > 0 ? total : 1;
  const percentage = Math.min(
    100,
    Math.max(0, (current / safeTotal) * 100)
  );

  return (
    <div className="mt-6">
      <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
        <span>
          Question {current} of {total}
        </span>

        <span>{Math.round(percentage)}%</span>
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-zinc-200">
        <div
          className="h-full rounded-full bg-zinc-900 transition-all duration-500"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
};

export default InterviewProgress;