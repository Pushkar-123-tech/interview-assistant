import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const InterviewSetup = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [resume, setResume] = useState(null);

  const [config, setConfig] = useState({
    role: "",
    type: "Technical",
    experience: "Fresher",
    difficulty: "Intermediate",
    questions: "10",
    duration: "20",
    useResume: true,
    useJobDescription: false,
    voiceInterview: true,
    cameraAnalysis: false,
    jobDescription: "",
  });

  /* =========================================
     UPDATE CONFIG
  ========================================= */

  const updateConfig = (key, value) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /* =========================================
     RESUME UPLOAD
  ========================================= */

  const handleResumeChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a PDF, DOC or DOCX file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Resume must be smaller than 10 MB.");
      return;
    }

    setResume(file);
  };

  const removeResume = () => {
    setResume(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =========================================
     START INTERVIEW
  ========================================= */

  const handleContinue = () => {
    if (!config.role.trim()) {
      alert("Please enter your Job Role / Position.");
      return;
    }

    const interviewData = {
      ...config,

      role: config.role.trim(),

      resume: resume
        ? {
            name: resume.name,
            size: resume.size,
            type: resume.type,
          }
        : null,
    };

    sessionStorage.setItem(
      "interviewConfig",
      JSON.stringify(interviewData)
    );

    navigate("/interview/device-check");
  };

  return (
    <div className="min-h-screen bg-[#f7f5ef] text-[#071936]">

      <div className="mx-auto min-h-screen max-w-[1500px] px-6 py-8 lg:px-12">

        {/* =====================================================
            BACK
        ===================================================== */}

        <button
          type="button"
          onClick={() => navigate("/dashboard/interview")}
          className="mb-8 flex cursor-pointer items-center gap-2 text-sm font-medium text-[#61718b] transition hover:text-[#ff5a1f]"
        >
          <span className="text-lg hover:text-[#ff5a1f]">←</span>
          Back to interview
        </button>

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-8 rounded-[28px] border border-[#ded9cf] bg-[#fffdfa] px-8 py-8 shadow-[0_8px_30px_rgba(20,20,20,0.03)] lg:px-10">

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

            <div>

              <p className="mb-3 text-xs font-bold tracking-[0.22em] text-[#ff5a1f]">
                INTERVIEW SETUP
              </p>

              <h1 className="text-4xl font-bold tracking-tight text-[#071936] md:text-5xl">
                Build your{" "}
                <span className="text-[#ff5a1f]">
                interview
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-[#61718b]">
                Customize your mock interview so the questions match your
                target role, experience, resume and goals.
              </p>

            </div>

            {/* Step */}
            <div className="flex w-fit items-center gap-3 rounded-full border border-[#e2ddd4] bg-[#f8f5ed] px-5 py-3">

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff0e9] text-sm font-bold text-[#ff5a1f]">
                01
              </div>

              <div>
                <p className="text-xs font-semibold text-[#071936]">
                  Interview Setup
                </p>

                <p className="text-[11px] text-[#718097]">
                  Configure your experience
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            MAIN GRID
        ===================================================== */}

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">

          {/* ===================================================
              LEFT — CONFIGURATION
          =================================================== */}

          <div className="rounded-[28px] border border-[#ded9cf] bg-[#fffdfa] p-8 shadow-[0_8px_30px_rgba(20,20,20,0.03)] lg:p-10">

            {/* Section Header */}

            <div className="mb-8">

              <p className="text-xs font-bold tracking-[0.2em] text-[#ff5a1f]">
                INTERVIEW CONFIGURATION
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#071936]">
                Tell us what you want to practice
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#718097]">
                We'll use these settings to personalize your AI interview.
              </p>

            </div>

            {/* =================================================
                JOB ROLE
            ================================================== */}

            <div>

              <label className="mb-3 block text-sm font-semibold text-[#071936]">
                Job Role / Position
              </label>

              <input
                type="text"
                value={config.role}
                onChange={(e) =>
                  updateConfig("role", e.target.value)
                }
                placeholder="e.g. Full Stack Developer"
                className="w-full rounded-xl border border-[#ded9cf] bg-[#f8f5ed] px-5 py-4 text-base text-[#071936] outline-none transition placeholder:text-[#9aa3b1] focus:border-[#ff5a1f] focus:ring-4 focus:ring-[#ff5a1f]/10"
              />

            </div>

            {/* =================================================
                INTERVIEW TYPE
            ================================================== */}

            <div className="mt-7">

              <label className="mb-3 block text-sm font-semibold">
                Interview Type
              </label>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

                {[
                  "Technical",
                  "HR",
                  "Behavioral",
                  "Mixed",
                ].map((type) => {

                  const active = config.type === type;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        updateConfig("type", type)
                      }
                      className={`cursor-pointer rounded-xl border px-4 py-4 text-sm font-semibold transition ${
                        active
                          ? "border-[#ff5a1f] bg-[#fff0e9] text-[#ff5a1f]"
                          : "border-[#ded9cf] bg-[#f8f5ed] text-[#61718b] hover:border-[#ff5a1f] hover:text-[#ff5a1f]"
                      }`}
                    >
                      {active && (
                        <span className="mr-2 text-xs">
                          ●
                        </span>
                      )}

                      {type}
                    </button>
                  );
                })}

              </div>

            </div>

            {/* =================================================
                EXPERIENCE + DIFFICULTY
            ================================================== */}

            <div className="mt-7 grid gap-6 md:grid-cols-2">

              {/* Experience */}

              <div>

                <label className="mb-3 block text-sm font-semibold">
                  Experience Level
                </label>

                <select
                  value={config.experience}
                  onChange={(e) =>
                    updateConfig(
                      "experience",
                      e.target.value
                    )
                  }
                  className="w-full cursor-pointer rounded-xl border border-[#ded9cf] bg-[#f8f5ed] px-5 py-4 text-base outline-none focus:border-[#ff5a1f]"
                >
                  <option value="Fresher">
                    Fresher
                  </option>

                  <option value="0-1 Years">
                    0–1 Years
                  </option>

                  <option value="1-3 Years">
                    1–3 Years
                  </option>

                  <option value="3-5 Years">
                    3–5 Years
                  </option>

                  <option value="5+ Years">
                    5+ Years
                  </option>
                </select>

              </div>

              {/* Difficulty */}

              <div>

                <label className="mb-3 block text-sm font-semibold">
                  Difficulty
                </label>

                <div className="grid grid-cols-3 gap-2">

                  {[
                    "Easy",
                    "Intermediate",
                    "Hard",
                  ].map((level) => {

                    const active =
                      config.difficulty === level;

                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() =>
                          updateConfig(
                            "difficulty",
                            level
                          )
                        }
                        className={`cursor-pointer rounded-xl border px-2 py-4 text-sm font-semibold transition ${
                          active
                            ? "border-[#ff5a1f] bg-[#fff0e9] text-[#ff5a1f]"
                            : "border-[#ded9cf] bg-[#f8f5ed] text-[#61718b] hover:border-[#ff5a1f]"
                        }`}
                      >
                        {level}
                      </button>
                    );
                  })}

                </div>

              </div>

            </div>

            {/* =================================================
                QUESTIONS + DURATION
            ================================================== */}

            <div className="mt-7 grid gap-6 md:grid-cols-2">

              <div>

                <label className="mb-3 block text-sm font-semibold">
                  Number of Questions
                </label>

                <select
                  value={config.questions}
                  onChange={(e) =>
                    updateConfig(
                      "questions",
                      e.target.value
                    )
                  }
                  className="w-full cursor-pointer rounded-xl border border-[#ded9cf] bg-[#f8f5ed] px-5 py-4 text-base outline-none focus:border-[#ff5a1f]"
                >
                  <option value="5">
                    5 Questions
                  </option>

                  <option value="10">
                    10 Questions
                  </option>

                  <option value="15">
                    15 Questions
                  </option>

                  <option value="20">
                    20 Questions
                  </option>
                </select>

              </div>

              <div>

                <label className="mb-3 block text-sm font-semibold">
                  Interview Duration
                </label>

                <select
                  value={config.duration}
                  onChange={(e) =>
                    updateConfig(
                      "duration",
                      e.target.value
                    )
                  }
                  className="w-full cursor-pointer rounded-xl border border-[#ded9cf] bg-[#f8f5ed] px-5 py-4 text-base outline-none focus:border-[#ff5a1f]"
                >
                  <option value="15">
                    15 minutes
                  </option>

                  <option value="20">
                    20 minutes
                  </option>

                  <option value="30">
                    30 minutes
                  </option>

                  <option value="45">
                    45 minutes
                  </option>
                </select>

              </div>

            </div>

            {/* =================================================
                RESUME
            ================================================== */}

            <div
              className={`mt-7 rounded-2xl border p-6 transition ${
                config.useResume
                  ? "border-[#ffd0c0] bg-[#fff8f4]"
                  : "border-[#ded9cf] bg-[#f8f5ed]"
              }`}
            >

              <div className="flex items-start justify-between gap-4">

                <div className="flex gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff0e9] text-lg text-[#ff5a1f]">
                    ↑
                  </div>

                  <div>

                    <p className="text-sm font-semibold">
                      Use My Resume
                    </p>

                    <p className="mt-1 text-sm text-[#718097]">
                      Generate personalized questions from your resume
                    </p>

                  </div>

                </div>

                <Toggle
                  enabled={config.useResume}
                  onClick={() =>
                    updateConfig(
                      "useResume",
                      !config.useResume
                    )
                  }
                />

              </div>

              {config.useResume && (

                <div className="mt-5">

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeChange}
                    className="hidden"
                  />

                  {!resume ? (

                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      className="w-full cursor-pointer rounded-xl border border-dashed border-[#d5cfc4] bg-[#fffdfa] px-5 py-6 text-center transition hover:border-[#ff5a1f] hover:bg-[#fff8f4]"
                    >

                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#fff0e9] text-lg text-[#ff5a1f]">
                        ↑
                      </div>

                      <p className="mt-3 text-sm font-semibold">
                        Upload your resume
                      </p>

                      <p className="mt-1 text-xs text-[#8a94a5]">
                        PDF, DOC or DOCX · Maximum 10 MB
                      </p>

                    </button>

                  ) : (

                    <div className="flex items-center justify-between rounded-xl border border-[#ded9cf] bg-white px-4 py-4">

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#fff0e9] text-xs font-bold text-[#ff5a1f]">
                          CV
                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold">
                            {resume.name}
                          </p>

                          <p className="mt-1 text-xs text-[#8a94a5]">
                            {(resume.size / 1024 / 1024).toFixed(2)} MB
                          </p>

                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={removeResume}
                        className="ml-3 cursor-pointer text-sm font-semibold text-[#ff5a1f] hover:underline"
                      >
                        Remove
                      </button>

                    </div>

                  )}

                </div>

              )}

            </div>

            {/* =================================================
                JOB DESCRIPTION
            ================================================== */}

            <div
              className={`mt-5 rounded-2xl border p-6 transition ${
                config.useJobDescription
                  ? "border-[#ffd0c0] bg-[#fff8f4]"
                  : "border-[#ded9cf] bg-[#f8f5ed]"
              }`}
            >

              <div className="flex items-start justify-between gap-4">

                <div className="flex gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff0e9] text-lg text-[#ff5a1f]">
                    ◎
                  </div>

                  <div>

                    <p className="text-sm font-semibold">
                      Use Job Description
                    </p>

                    <p className="mt-1 text-sm text-[#718097]">
                      Generate questions based on the job requirements
                    </p>

                  </div>

                </div>

                <Toggle
                  enabled={config.useJobDescription}
                  onClick={() =>
                    updateConfig(
                      "useJobDescription",
                      !config.useJobDescription
                    )
                  }
                />

              </div>

              {config.useJobDescription && (

                <textarea
                  value={config.jobDescription}
                  onChange={(e) =>
                    updateConfig(
                      "jobDescription",
                      e.target.value
                    )
                  }
                  placeholder="Paste the target job description here..."
                  rows={5}
                  className="mt-5 w-full resize-none rounded-xl border border-[#ded9cf] bg-white px-5 py-4 text-sm leading-6 outline-none placeholder:text-[#9aa3b1] focus:border-[#ff5a1f]"
                />

              )}

            </div>

            {/* =================================================
                VOICE + CAMERA
            ================================================== */}

            <div className="mt-5 grid gap-5 md:grid-cols-2">

              <FeatureCard
                icon="🎙"
                title="Voice Interview"
                description="Answer questions using your voice"
                enabled={config.voiceInterview}
                onClick={() =>
                  updateConfig(
                    "voiceInterview",
                    !config.voiceInterview
                  )
                }
              />

              <FeatureCard
                icon="◉"
                title="Camera Analysis"
                description="Analyze confidence and expressions"
                enabled={config.cameraAnalysis}
                onClick={() =>
                  updateConfig(
                    "cameraAnalysis",
                    !config.cameraAnalysis
                  )
                }
              />

            </div>

          </div>

          {/* ===================================================
              RIGHT — INTERVIEW SUMMARY
          =================================================== */}

          <div className="h-fit rounded-[28px] border border-[#ded9cf] bg-[#fffdfa] p-8 shadow-[0_8px_30px_rgba(20,20,20,0.03)] lg:p-10">

            {/* Header */}

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-bold tracking-[0.2em] text-[#ff5a1f]">
                  INTERVIEW PREVIEW
                </p>

                <p className="mt-2 text-sm text-[#718097]">
                  Your selected configuration
                </p>

              </div>

              <span className="rounded-full bg-[#edf9f1] px-3 py-1.5 text-xs font-semibold text-[#168449]">
                READY
              </span>

            </div>

            {/* Preview */}

            <div className="mt-8 flex h-[250px] items-center justify-center rounded-[22px] border border-[#e3ded5] bg-[#f4f1e9]">

              <div className="text-center">

                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#071936] text-2xl font-semibold text-white shadow-lg">
                  AI
                </div>

                <p className="mt-5 text-base font-semibold text-[#071936]">
                  AI Interviewer
                </p>

                <p className="mt-1 text-sm text-[#718097]">
                  Ready to interview you
                </p>

                <div className="mt-4 flex justify-center gap-1.5">

                  <span className="h-1.5 w-1.5 rounded-full bg-[#ff5a1f]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ff5a1f]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ff5a1f]" />

                </div>

              </div>

            </div>

            {/* Summary */}

            <div className="mt-7">

              <p className="mb-4 text-sm font-semibold">
                Interview Summary
              </p>

              <div className="space-y-3">

                <SummaryRow
                  label="Role"
                  value={
                    config.role || "Not selected"
                  }
                />

                <SummaryRow
                  label="Type"
                  value={config.type}
                />

                <SummaryRow
                  label="Experience"
                  value={config.experience}
                />

                <SummaryRow
                  label="Difficulty"
                  value={config.difficulty}
                />

                <SummaryRow
                  label="Questions"
                  value={config.questions}
                />

                <SummaryRow
                  label="Duration"
                  value={`${config.duration} minutes`}
                />

              </div>

            </div>

            {/* Features */}

            <div className="mt-7 border-t border-[#ebe7df] pt-6">

              <p className="mb-4 text-sm font-semibold">
                Enabled Features
              </p>

              <div className="flex flex-wrap gap-2">

                {config.useResume && (
                  <Badge>
                    Resume
                  </Badge>
                )}

                {config.useJobDescription && (
                  <Badge>
                    Job Description
                  </Badge>
                )}

                {config.voiceInterview && (
                  <Badge>
                    Voice
                  </Badge>
                )}

                {config.cameraAnalysis && (
                  <Badge>
                    Camera Analysis
                  </Badge>
                )}

              </div>

            </div>

            {/* Start */}

            <button
              type="button"
              disabled={!config.role.trim()}
              onClick={handleContinue}
              className="mt-8 w-full cursor-pointer rounded-xl bg-[#ff5a1f] px-6 py-4 text-base font-semibold text-white shadow-[0_8px_20px_rgba(255,90,31,0.18)] transition duration-200 hover:bg-[#e94d16] hover:shadow-[0_10px_25px_rgba(255,90,31,0.25)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Start Interview →
            </button>

            <p className="mt-3 text-center text-xs text-[#8a94a5]">
              Camera and microphone will be checked next
            </p>

          </div>

        </div>

      </div>
    </div>
  );
};


/* ============================================================
   TOGGLE
============================================================ */

const Toggle = ({ enabled, onClick }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onClick}
      className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition ${
        enabled
          ? "bg-[#ff5a1f]"
          : "bg-[#d5d0c7]"
      }`}
    >

      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
          enabled
            ? "left-6"
            : "left-1"
        }`}
      />

    </button>
  );
};


/* ============================================================
   FEATURE CARD
============================================================ */

const FeatureCard = ({
  icon,
  title,
  description,
  enabled,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full cursor-pointer items-center justify-between rounded-2xl border p-5 text-left transition ${
        enabled
          ? "border-[#ffd0c0] bg-[#fff8f4]"
          : "border-[#ded9cf] bg-[#f8f5ed]"
      }`}
    >

      <div className="flex items-center gap-4">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff0e9] text-lg text-[#ff5a1f]">
          {icon}
        </div>

        <div>

          <p className="text-sm font-semibold text-[#071936]">
            {title}
          </p>

          <p className="mt-1 text-sm text-[#718097]">
            {description}
          </p>

        </div>

      </div>

      <Toggle
        enabled={enabled}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      />

    </button>
  );
};


/* ============================================================
   SUMMARY ROW
============================================================ */

const SummaryRow = ({ label, value }) => {
  return (
    <div className="flex items-center justify-between rounded-xl bg-[#f8f5ed] px-4 py-3">

      <span className="text-sm text-[#718097]">
        {label}
      </span>

      <span className="max-w-[60%] truncate text-right text-sm font-semibold text-[#071936]">
        {value}
      </span>

    </div>
  );
};


/* ============================================================
   BADGE
============================================================ */

const Badge = ({ children }) => {
  return (
    <span className="rounded-full bg-[#fff0e9] px-3 py-1.5 text-xs font-semibold text-[#ff5a1f]">
      {children}
    </span>
  );
};


export default InterviewSetup;