import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..", "..", "..");
const analyzerScript = path.join(projectRoot, "ml_training", "resume_extraction", "resume_analyzer.py");

const runAnalyzer = (filePath, jobDescription = "") => new Promise((resolve, reject) => {
  const python = process.env.PYTHON_PATH || "python";
  const child = spawn(python, [analyzerScript, "--file", filePath, "--job-description", jobDescription], {
    cwd: projectRoot,
    windowsHide: true,
  });

  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => { stdout += chunk; });
  child.stderr.on("data", (chunk) => { stderr += chunk; });
  child.on("error", reject);
  child.on("close", (code) => {
    if (code !== 0) {
      reject(new Error(stderr || `Resume analyser exited with code ${code}`));
      return;
    }
    try {
      resolve(JSON.parse(stdout));
    } catch {
      reject(new Error(`Invalid analyser response: ${stdout || stderr}`));
    }
  });
});

export const analyzeResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Resume file is required." });
  }

  const extension = path.extname(req.file.originalname).toLowerCase();
  if (![".pdf", ".docx"].includes(extension)) {
    return res.status(400).json({ success: false, message: "Only PDF and DOCX files are supported." });
  }

  const temporaryFile = path.join(os.tmpdir(), `edi-resume-${randomUUID()}${extension}`);

  try {
    await fs.writeFile(temporaryFile, req.file.buffer);
    const analysis = await runAnalyzer(temporaryFile, req.body.jobDescription || "");
    return res.json({ success: true, fileName: req.file.originalname, ...analysis });
  } catch (error) {
    console.error("Resume analysis failed:", error);
    return res.status(500).json({
      success: false,
      message: "Resume analysis failed. Ensure the Python ML environment is available.",
      details: error.message,
    });
  } finally {
    await fs.rm(temporaryFile, { force: true }).catch(() => {});
  }
};
