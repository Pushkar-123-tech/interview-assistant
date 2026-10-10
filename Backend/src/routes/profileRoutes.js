import express from "express";
import { getProfile, upsertProfile } from "../controllers/profileController.js";

const router = express.Router();

router.get('/:id', getProfile);
router.post('/', upsertProfile);

export default router;
