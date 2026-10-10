    const InterviewConfig = ({ config, setConfig }) => {
  const update = (key, value) => {
    setConfig((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const inputStyle =
    "mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-500";

  return (
    <div>
      <h2 className="text-lg font-medium">Interview configuration</h2>

      <p className="mt-1 text-sm text-zinc-500">
        Tell us what kind of interview you want to practice.
      </p>

      <div className="mt-6">
        <label className="text-sm font-medium">Target role</label>

        <input
          value={config.role}
          onChange={(e) => update("role", e.target.value)}
          placeholder="e.g. Software Engineer"
          className={inputStyle}
        />
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Interview type</label>

          <select
            value={config.type}
            onChange={(e) => update("type", e.target.value)}
            className={inputStyle}
          >
            <option>Technical</option>
            <option>Behavioral</option>
            <option>HR</option>
            <option>Mixed</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Difficulty</label>

          <select
            value={config.difficulty}
            onChange={(e) => update("difficulty", e.target.value)}
            className={inputStyle}
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>
      </div>

      <div className="mt-5">
        <label className="text-sm font-medium">Duration</label>

        <select
          value={config.duration}
          onChange={(e) => update("duration", e.target.value)}
          className={inputStyle}
        >
          <option value="15">15 minutes</option>
          <option value="30">30 minutes</option>
          <option value="45">45 minutes</option>
          <option value="60">60 minutes</option>
        </select>
      </div>
    </div>
  );
};

export default InterviewConfig;