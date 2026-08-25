import dotenv from "dotenv";
import OpenAI, { toFile } from "openai";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Transcribe audio buffer using OpenAI Whisper model
 * @param {Buffer} audioBuffer - Audio binary buffer from request
 * @param {string} filename - Original filename or generated name
 * @param {string} mimeType - Audio mime type (e.g., 'audio/webm', 'audio/wav', 'audio/mp3')
 * @returns {Promise<string>} Transcribed text string
 */
export const transcribeAudio = async (audioBuffer, filename = "audio.webm", mimeType = "audio/webm") => {
  try {
    const file = await toFile(audioBuffer, filename, { type: mimeType });
    const response = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language: "en",
    });
    return response.text || "";
  } catch (error) {
    console.error("OpenAI Whisper Error:", error);
    throw new Error(`Speech-to-text failed: ${error.message}`);
  }
};

/**
 * Generate speech audio from text using OpenAI TTS
 * @param {string} text - Text prompt to read
 * @param {string} voice - OpenAI voice ('alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer')
 * @returns {Promise<Buffer>} MP3 Audio Buffer
 */
export const generateSpeech = async (text, voice = "alloy") => {
  try {
    const validVoices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
    const selectedVoice = validVoices.includes(voice) ? voice : "alloy";

    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: selectedVoice,
      input: text,
      response_format: "mp3",
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
  } catch (error) {
    console.error("OpenAI TTS Error:", error);
    throw new Error(`Text-to-speech failed: ${error.message}`);
  }
};
