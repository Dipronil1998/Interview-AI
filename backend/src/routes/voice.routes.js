import express from "express";
import multer from "multer";
import {
  transcribeAudioController,
  generateSpeechController,
} from "../controllers/voice.controller.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max audio size for Whisper
  },
});

router.post("/transcribe", upload.single("audio"), transcribeAudioController);
router.post("/tts", generateSpeechController);

export default router;
