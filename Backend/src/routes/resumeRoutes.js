import express from "express";
import multer from "multer";
import { analyzeResume } from "../controllers/resumeController.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post("/analyze", upload.single("resume"), analyzeResume);

export default router;
