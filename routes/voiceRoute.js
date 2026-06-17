// routes/voiceRoute.js
import express from "express";
import { handleVoiceCommand } from "../controllers/voiceController.js";

const router = express.Router();

// Public — no auth needed to talk to the assistant
router.post("/command", handleVoiceCommand);

export default router;