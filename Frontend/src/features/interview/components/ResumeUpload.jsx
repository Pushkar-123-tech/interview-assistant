import { FileText, Upload, X } from "lucide-react";

const ResumeUpload = ({ resume, setResume }) => {
  const handleFile = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Only allow PDF
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      event.target.value = "";
      return;
    }

    // Maximum 10 MB
    if (file.size > 10 * 1024 * 1024) {
      alert("Resume must be smaller than 10 MB.");
      event.target.value = "";
      return;
    }

    setResume(file);
  };

  const removeResume = () => {
    setResume(null);
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-medium text-zinc-900">
          Resume
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Upload your resume to personalize your interview questions.
        </p>
      </div>

      {!resume ? (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-10 transition hover:border-zinc-400 hover:bg-zinc-100">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
            <Upload
              size={20}
              className="text-zinc-700"
            />
          </div>

          <p className="mt-4 text-sm font-medium text-zinc-900">
            Upload your resume
          </p>

          <p className="mt-1 text-xs text-zinc-400">
            PDF up to 10 MB
          </p>

          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFile}
            className="hidden"
          />
        </label>
      ) : (
        <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
              <FileText
                size={19}
                className="text-zinc-700"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-900">
                {resume.name}
              </p>

              <p className="mt-0.5 text-xs text-zinc-400">
                {(resume.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={removeResume}
            className="ml-4 rounded-full p-2 text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-900"
            aria-label="Remove resume"
          >
            <X size={17} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;