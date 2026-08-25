import { transcribeAudio, generateSpeech } from "../services/voice.service.js";

/**
 * Transcribe Audio File / Blob
 * POST /api/voice/transcribe
 */
export const transcribeAudioController = async (req, res) => {
  try {
    let audioBuffer;
    let filename = "recording.webm";
    let mimeType = "audio/webm";

    if (req.file) {
      audioBuffer = req.file.buffer;
      filename = req.file.originalname || filename;
      mimeType = req.file.mimetype || mimeType;
    } else if (req.body && req.body.audioBase64) {
      const base64Data = req.body.audioBase64.replace(/^data:audio\/\w+;base64,/, "");
      audioBuffer = Buffer.from(base64Data, "base64");
      if (req.body.mimeType) mimeType = req.body.mimeType;
    } else {
      return res.status(400).json({
        success: false,
        message: "No audio file or base64 audio data provided",
      });
    }

    const transcript = await transcribeAudio(audioBuffer, filename, mimeType);

    return res.json({
      success: true,
      text: transcript,
    });
  } catch (error) {
    console.error("Transcribe Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to transcribe audio",
    });
  }
};

/**
 * Generate Speech Audio from Text (TTS)
 * POST /api/voice/tts
 */
export const generateSpeechController = async (req, res) => {
  try {
    const { text, voice = "alloy" } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        success: false,
        message: "text string is required for TTS",
      });
    }

    // Truncate long text if necessary to prevent oversized TTS payloads
    const sanitizedText = text.substring(0, 4000);

    const audioBuffer = await generateSpeech(sanitizedText, voice);

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audioBuffer.length,
      "Cache-Control": "public, max-age=86400",
    });

    return res.send(audioBuffer);
  } catch (error) {
    console.error("TTS Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate speech",
    });
  }
};
