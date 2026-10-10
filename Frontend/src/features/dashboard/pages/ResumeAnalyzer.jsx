import { useState } from "react";
import {
  Brain,
  CheckCircle2,
  FileText,
  LoaderCircle,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  X,
} from "lucide-react";

const ResumeAnalyzer = () => {
  const [resume, setResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const report = analysis?.report;

  const handleFile = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!/[.](pdf|docx)$/i.test(file.name)) {
      alert("Please upload a PDF or DOCX file.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Resume must be smaller than 10 MB.");
      event.target.value = "";
      return;
    }

    setResume(file);
    setAnalysis(null);
    setError("");
    setLoading(true);
    try {
      const body = new FormData();
      body.append("resume", file);
      body.append("jobDescription", jobDescription);
      const response = await fetch(`${API_URL}/api/resume/analyze`, { method: "POST", body });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Analysis failed.");
      setAnalysis(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const removeResume = () => {
    setResume(null);
    setAnalysis(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#F7F3EB]">
      <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 lg:px-8">
        <header className="mb-8 rounded-[24px] border border-[#D8D2C7] bg-[#FFFDF8] p-6 shadow-[0_18px_45px_rgba(15,23,42,0.05)] md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FF5A1F]">
                Resume Analyzer
              </p>
              <h1 className="mt-2 text-3xl font-black text-[#08142E] md:text-4xl">
                Review your resume with <span className="text-[#FF5A1F]">AI-style clarity</span>
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-[#64748B] md:text-base">
                Upload your resume for trained-model skill extraction, ATS scoring, and keyword coverage.
              </p>
            </div>
            <div className="rounded-2xl border border-[#D8D2C7] bg-[#F7F3EB] px-4 py-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#FF5A1F]" />
                <span className="text-sm font-semibold text-[#08142E]">Instant feedback</span>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[24px] border border-[#D8D2C7] bg-[#FFFDF8] p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-[#08142E]">Resume Upload</h2>
                <p className="mt-1 text-sm text-[#64748B]">
                  Add your resume to generate tailored insights.
                </p>
                <textarea
                  value={jobDescription}
                  onChange={(event) => setJobDescription(event.target.value)}
                  placeholder="Optional: paste the target job description for keyword matching"
                  className="mt-4 min-h-24 w-full rounded-2xl border border-[#D8D2C7] bg-[#F7F3EB] p-3 text-sm text-[#08142E] outline-none focus:border-[#FF5A1F]"
                />
              </div>
              <div className="rounded-full bg-[#FF5A1F]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#FF5A1F]">
                PDF / DOCX
              </div>
            </div>

            {!resume ? (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-[#D8D2C7] bg-[#F7F3EB] px-6 py-12 transition hover:border-[#FF5A1F] hover:bg-[#FFF5EE]">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                  <Upload size={22} className="text-[#08142E]" />
                </div>
                <p className="mt-4 text-base font-semibold text-[#08142E]">Upload your resume</p>
                <p className="mt-1 text-sm text-[#64748B]">PDF or DOCX up to 10 MB</p>
                <input type="file" accept=".pdf,.docx,application/pdf" onChange={handleFile} className="hidden" />
              </label>
            ) : (
              <div className="rounded-[24px] border border-[#D8D2C7] bg-[#F7F3EB] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <FileText size={20} className="text-[#08142E]" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#08142E]">{resume.name}</p>
                      <p className="mt-1 text-xs text-[#64748B]">{(resume.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button type="button" onClick={removeResume} className="rounded-full p-2 text-[#64748B] transition hover:bg-white hover:text-[#08142E]" aria-label="Remove resume">
                    <X size={17} />
                  </button>
                </div>

                <div className="mt-5 rounded-[20px] border border-[#D8D2C7] bg-[#FFFDF8] p-4">
                  <div className="flex items-center gap-2">
                    <Brain size={16} className="text-[#FF5A1F]" />
                    <p className="text-sm font-semibold text-[#08142E]">Resume Snapshot</p>
                  </div>
                  {loading ? (
                    <div className="mt-3 flex items-center gap-3" role="status" aria-live="polite">
                      <LoaderCircle size={18} className="shrink-0 animate-spin text-[#FF5A1F]" />
                      <div>
                        <p className="text-sm font-semibold text-[#08142E]">Analyzing your resume</p>
                        <p className="text-sm leading-6 text-[#475569]">Running skill extraction and ATS checks...</p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-[#475569]">{error || analysis?.summary}</p>
                  )}
                </div>
              </div>
            )}
          </section>

          <section className="space-y-6">
            <div className="rounded-[24px] border border-[#D8D2C7] bg-[#FFFDF8] p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
              <div className="mb-5 flex items-center gap-2">
                <TrendingUp size={18} className="text-[#FF5A1F]" />
                <h3 className="text-lg font-black text-[#08142E]">Analysis Overview</h3>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "ATS Match", value: analysis?.atsScore === "N/A" ? "N/A" : `${analysis?.atsScore ?? 0}%`, tone: "text-[#FF5A1F]" },
                  { label: "Impact Score", value: `${analysis?.impactScore ?? 0}%`, tone: "text-[#08142E]" },
                  { label: "Skill Coverage", value: analysis?.skillCoverage === "N/A" ? "N/A" : `${analysis?.skillCoverage ?? 0}%`, tone: "text-[#FF5A1F]" },
                  { label: "Interview Readiness", value: `${analysis?.interviewReadiness ?? 0}%`, tone: "text-[#08142E]" },
                ].map((item) => (
                  <div key={item.label} className="rounded-[18px] border border-[#D8D2C7] bg-[#F7F3EB] p-4">
                    <p className="text-sm text-[#64748B]">{item.label}</p>
                    <p className={`mt-2 text-2xl font-black ${item.tone}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#D8D2C7] bg-[#FFFDF8] p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
              <div className="mb-4 flex items-center gap-2">
                <Target size={18} className="text-[#FF5A1F]" />
                <h3 className="text-lg font-black text-[#08142E]">Keyword Alignment</h3>
              </div>
              <div className="space-y-2 text-sm leading-6 text-[#475569]">
                {analysis?.requiredSkills?.length > 0 && <p><span className="font-semibold text-[#08142E]">Required:</span> {analysis.requiredSkills.join(", ")}</p>}
                {analysis?.preferredSkills?.length > 0 && <p><span className="font-semibold text-[#08142E]">Preferred:</span> {analysis.preferredSkills.join(", ")}</p>}
                <p>
                  <span className="font-semibold text-[#08142E]">Matched:</span>{" "}
                  {analysis?.keywords?.length
                    ? analysis.keywords.join(", ")
                    : analysis
                      ? "No valid master-vocabulary JD skills matched."
                      : "Upload a resume and provide a job description to match skills."}
                </p>
              </div>
              {analysis?.missingKeywords?.length > 0 && (
                <p className="mt-4 text-sm text-[#B45309]">Missing from the resume: {analysis.missingKeywords.join(", ")}</p>
              )}
            </div>
          </section>
        </div>

        {report && (
          <section className="mt-6 rounded-[24px] border border-[#D8D2C7] bg-[#FFFDF8] p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-[#08142E]">Detailed Resume Report</h2>
                <p className="mt-1 text-sm text-[#64748B]">Resume evidence, role alignment, and report limitations.</p>
              </div>
              <span className="rounded-full bg-[#FF5A1F]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#FF5A1F]">
                {report.jdAnalysis?.provided
                  ? `${report.ats?.validJobKeywordCount ?? 0} valid JD skills`
                  : "No JD provided"}
              </span>
            </div>

            <div className="space-y-6 divide-y divide-[#E5E0D7]">
              <section className="pt-1">
                <h3 className="text-base font-black text-[#08142E]">Resume Overview</h3>
                <p className="mt-2 max-w-5xl text-sm leading-6 text-[#475569]">
                  {report.overview?.summary || analysis.summary || "Resume summary unavailable."}
                </p>
                <div className="mt-4 grid gap-x-6 gap-y-4 border-y border-[#E5E0D7] py-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ["Words", report.overview?.wordCount ?? report.document?.wordCount ?? "N/A"],
                    ["Bullets", report.overview?.bulletCount ?? report.document?.bulletCount ?? "N/A"],
                    ["Detected skills", report.overview?.detectedSkillCount ?? report.model?.detectedSkillCount ?? "N/A"],
                    ["Sections", report.overview?.sections?.length ?? report.sections?.present?.length ?? "N/A"],
                    ["Average confidence", report.overview?.averageConfidence != null ? `${Math.round(report.overview.averageConfidence * 100)}%` : "N/A"],
                    ["Email", report.contact?.email ? "Present" : "Not detected"],
                    ["Phone", report.contact?.phone ? "Present" : "Not detected"],
                    ["LinkedIn", report.contact?.linkedin ? "Present" : "Not detected"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#64748B]">{label}</p>
                      <p className="mt-1 text-sm font-bold text-[#08142E]">{value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="pt-5">
                <h3 className="text-base font-black text-[#08142E]">Skill Analysis</h3>
                <div className="mt-3 grid gap-x-6 gap-y-5 md:grid-cols-2">
                  {Object.entries(report.skillAnalysis ?? {}).map(([category, skills]) => (
                    <div key={category}>
                      <h4 className="text-sm font-bold text-[#08142E]">{category}</h4>
                      {skills.length ? (
                        <ul className="mt-2 divide-y divide-[#EEEAE3]">
                          {skills.map((item) => (
                            <li key={`${category}-${item.skill}`} className="grid gap-1 py-2 text-sm sm:grid-cols-[minmax(0,1.2fr)_0.7fr_1fr_1fr] sm:gap-3">
                              <span className="font-semibold text-[#08142E]">{item.skill}</span>
                              <span className="text-[#475569]">{item.confidence == null ? "Confidence N/A" : `${Math.round(item.confidence * 100)}% confidence`}</span>
                              <span className="text-[#64748B]">{item.source}</span>
                              <span className={item.matchStatus === "Matched" ? "font-semibold text-emerald-700" : "text-[#64748B]"}>
                                {item.matchStatus === "Matched" ? "✓ Matched" : item.matchStatus === "Missing" ? "✗ Missing" : item.matchStatus}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : <p className="mt-2 text-sm text-[#64748B]">No skills in this category.</p>}
                    </div>
                  ))}
                </div>
              </section>

              <section className="pt-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-base font-black text-[#08142E]">JD Analysis</h3>
                  <p className="text-sm font-semibold text-[#475569]">
                    Required {report.jdAnalysis?.counts?.required ?? "N/A"} · Preferred {report.jdAnalysis?.counts?.preferred ?? "N/A"} · Overall {report.jdAnalysis?.counts?.overall ?? "N/A"}
                  </p>
                </div>
                {report.jdAnalysis?.provided ? (
                  <div className="mt-3 grid gap-5 md:grid-cols-2">
                    {["required", "preferred"].map((level) => (
                      <div key={level}>
                        <h4 className="text-sm font-bold capitalize text-[#08142E]">{level} skills</h4>
                        <ul className="mt-2 space-y-1.5 text-sm">
                          {(report.jdAnalysis[level] ?? []).map((item) => (
                            <li key={item.skill} className="flex gap-2 text-[#475569]">
                              <span className={item.status === "Matched" ? "font-bold text-emerald-700" : "font-bold text-[#B45309]"}>
                                {item.status === "Matched" ? "✓" : "✗"}
                              </span>
                              <span>{item.skill} · {item.status}</span>
                            </li>
                          ))}
                          {!report.jdAnalysis[level]?.length && <li className="text-[#64748B]">No valid skills detected.</li>}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : <p className="mt-2 text-sm text-[#64748B]">No job description supplied.</p>}
              </section>

              <section className="pt-5">
                <h3 className="text-base font-black text-[#08142E]">Education Analysis</h3>
                {report.educationAnalysis?.required?.length ? (
                  <div className="mt-2 space-y-2 text-sm">
                    {report.educationAnalysis.required.map((area) => {
                      const matched = report.educationAnalysis.matched?.includes(area);
                      return <p key={area} className={matched ? "text-emerald-700" : "text-[#B45309]"}>{matched ? "✓" : "✗"} {area} education requirement {matched ? "matched" : "not found in the Education section"}.</p>;
                    })}
                    <p className="text-[#64748B]">Detected in resume: {report.educationAnalysis.detected?.join(", ") || "None"}</p>
                  </div>
                ) : <p className="mt-2 text-sm text-[#64748B]">No CS, Computer Engineering, or Information Technology requirement was identified in the JD. Detected: {report.educationAnalysis?.detected?.join(", ") || "none"}.</p>}
              </section>

              <section className="pt-5">
                <h3 className="text-base font-black text-[#08142E]">Skill Gap Analysis</h3>
                <div className="mt-3 grid gap-5 md:grid-cols-2">
                  {[["Required gaps", report.skillGaps?.required], ["Preferred gaps", report.skillGaps?.preferred]].map(([label, gaps]) => (
                    <div key={label}>
                      <h4 className="text-sm font-bold text-[#08142E]">{label}</h4>
                      <p className="mt-2 text-sm text-[#475569]">{gaps?.length ? gaps.join(", ") : "None detected."}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="pt-5">
                <h3 className="text-base font-black text-[#08142E]">Resume Structure</h3>
                <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  {(report.sections?.details ?? []).map((section) => (
                    <li key={section.name} className={section.detected ? "text-emerald-700" : "text-[#B45309]"}>
                      {section.detected ? "✓" : "⚠"} {section.name}
                    </li>
                  ))}
                  {!report.sections?.details?.length && <li className="text-[#64748B]">Standalone section headings are unavailable.</li>}
                </ul>
              </section>

              <section className="pt-5">
                <h3 className="text-base font-black text-[#08142E]">Content Quality</h3>
                <div className="mt-3 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                  {(report.contentQuality ?? []).map((metric) => (
                    <div key={metric.name}>
                      <p className="text-sm font-bold text-[#08142E]">{metric.name}: {metric.value}</p>
                      <p className="mt-1 text-sm leading-5 text-[#64748B]">{metric.meaning}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="pt-5">
                <h3 className="text-base font-black text-[#08142E]">Impact Analysis</h3>
                <div className="mt-3 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                  {(report.impactAnalysis ?? []).map((metric) => (
                    <div key={metric.name}>
                      <p className="text-sm font-bold text-[#08142E]">{metric.name}: {Array.isArray(metric.value) ? metric.value.join(", ") : metric.value}</p>
                      <p className="mt-1 text-sm leading-5 text-[#64748B]">{metric.meaning}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="pt-5">
                <h3 className="text-base font-black text-[#08142E]">ATS Breakdown</h3>
                <div className="mt-3 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    ["Overall ATS", report.atsBreakdown?.overall ?? "N/A"],
                    ["Required match", report.atsBreakdown?.requiredMatch ?? "N/A"],
                    ["Preferred match", report.atsBreakdown?.preferredMatch ?? "N/A"],
                    ["JD keyword match", report.atsBreakdown?.jdKeywordMatch ?? "N/A"],
                    ["Education match", report.atsBreakdown?.educationMatch ?? "N/A"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#64748B]">{label}</p>
                      <p className="mt-1 text-lg font-black text-[#08142E]">{value}{label === "Overall ATS" && value !== "N/A" ? "%" : ""}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 max-w-5xl text-sm leading-6 text-[#475569]">{report.atsBreakdown?.explanation || "ATS scoring explanation unavailable."}</p>
              </section>

              <section className="pt-5">
                <h3 className="text-base font-black text-[#08142E]">Low Confidence Skills</h3>
                {(report.model?.lowConfidenceSkillDetails ?? []).length ? (
                  <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#475569]">
                    {report.model.lowConfidenceSkillDetails.map((skill) => (
                      <li key={skill.skill}>{skill.skill} · {Math.round(skill.confidence * 100)}%</li>
                    ))}
                  </ul>
                ) : <p className="mt-2 text-sm text-[#64748B]">No validated skills below 70% confidence.</p>}
              </section>

              <section className="pt-5">
                <h3 className="text-base font-black text-[#08142E]">Recommendations</h3>
                <ol className="mt-3 grid gap-x-8 gap-y-2 text-sm leading-6 text-[#475569] md:grid-cols-2">
                  {(report.recommendations ?? analysis.opportunities ?? []).map((item, index) => (
                    <li key={`${index}-${item}`}><span className="mr-2 font-bold text-[#FF5A1F]">{index + 1}.</span>{item}</li>
                  ))}
                </ol>
              </section>
            </div>
          </section>
        )}

        {analysis?.strengths?.length > 0 && (
          <section className="mt-6 rounded-[24px] border border-[#D8D2C7] bg-[#FFFDF8] p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
            <h2 className="text-lg font-black text-[#08142E]">Strengths</h2>
            <ul className="mt-3 grid gap-x-8 gap-y-2 text-sm text-[#475569] md:grid-cols-2">
              {analysis.strengths.map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#FF5A1F]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
