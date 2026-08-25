import { useState, useEffect, useRef, useCallback } from 'react';

export function useVoice() {
  // Speech Recognition (STT) state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [micError, setMicError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // Text-To-Speech (TTS) state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState(null);
  const [autoPlayTTS, setAutoPlayTTS] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState('webspeech'); // 'webspeech' | 'openai'
  const [selectedVoice, setSelectedVoice] = useState('alloy'); // OpenAI voice or browser voice

  // Refs for Web Speech & Audio context
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioElementRef = useRef(null);

  // Initialize SpeechRecognition if available
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.warn('Web Speech Recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setMicError(`Microphone error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        stopAudioAnalysis();
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Audio level analyzer for glowing/waving microphone visualizer
  const startAudioAnalysis = async (stream) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      analyser.fftSize = 64;
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (err) {
      console.warn('Could not initialize audio visualizer:', err);
    }
  };

  const stopAudioAnalysis = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  // Start Voice Recording & Speech-to-Text
  const startListening = useCallback(async (onTranscriptUpdate) => {
    setMicError(null);
    setTranscript('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    // Use Web Speech API if supported
    if (SpeechRecognition && recognitionRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        startAudioAnalysis(stream);

        recognitionRef.current.onresult = (event) => {
          let text = '';
          for (let i = 0; i < event.results.length; i++) {
            text += event.results[i][0].transcript;
          }
          setTranscript(text);
          if (onTranscriptUpdate) onTranscriptUpdate(text);
        };

        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setMicError('Microphone access denied or unavailable');
        console.error('Mic access error:', err);
      }
    } else {
      // Fallback to MediaRecorder + OpenAI Whisper API
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        startAudioAnalysis(stream);

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          stopAudioAnalysis();
          stream.getTracks().forEach((track) => track.stop());

          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const formData = new FormData();
          formData.append('audio', audioBlob, 'voice_input.webm');

          try {
            const res = await fetch('/api/voice/transcribe', {
              method: 'POST',
              body: formData,
            });
            const data = await res.json();
            if (data.success && data.text) {
              setTranscript(data.text);
              if (onTranscriptUpdate) onTranscriptUpdate(data.text);
            }
          } catch (err) {
            console.error('Whisper transcription error:', err);
            setMicError('Failed to transcribe audio on server');
          }
        };

        mediaRecorder.start();
        setIsListening(true);
      } catch (err) {
        setMicError('Microphone access denied or unavailable');
      }
    }
  }, []);

  // Stop Listening
  const stopListening = useCallback(() => {
    setIsListening(false);
    stopAudioAnalysis();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore if already stopped
      }
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // Text-To-Speech: Stop playing audio
  const stopSpeech = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    setIsSpeaking(false);
    setCurrentlySpeakingId(null);
  }, []);

  // Text-To-Speech: Speak text
  const speakText = useCallback(
    async (text, messageId = null) => {
      // If already speaking this message, stop it
      if (isSpeaking && currentlySpeakingId === messageId) {
        stopSpeech();
        return;
      }

      stopSpeech();
      if (!text || text.trim() === '') return;

      // Clean Markdown tags for cleaner spoken text
      const plainText = text
        .replace(/```[\s\S]*?```/g, 'Code block omitted.') // Skip code blocks in voice or summarize
        .replace(/`([^`]+)`/g, '$1')
        .replace(/[#*_\-\[\]()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (!plainText) return;

      setCurrentlySpeakingId(messageId);
      setIsSpeaking(true);

      if (selectedEngine === 'webspeech' && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(plainText);
        utterance.rate = 1.0;

        utterance.onend = () => {
          setIsSpeaking(false);
          setCurrentlySpeakingId(null);
        };

        utterance.onerror = () => {
          setIsSpeaking(false);
          setCurrentlySpeakingId(null);
        };

        window.speechSynthesis.speak(utterance);
      } else {
        // Server OpenAI TTS
        try {
          const response = await fetch('/api/voice/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: plainText.substring(0, 1000), voice: selectedVoice }),
          });

          if (!response.ok) throw new Error('TTS server error');

          const blob = await response.blob();
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          audioElementRef.current = audio;

          audio.onended = () => {
            setIsSpeaking(false);
            setCurrentlySpeakingId(null);
            URL.revokeObjectURL(audioUrl);
          };

          audio.onerror = () => {
            setIsSpeaking(false);
            setCurrentlySpeakingId(null);
          };

          audio.play();
        } catch (err) {
          console.error('OpenAI TTS Error, falling back to browser speech:', err);
          // Fallback to browser SpeechSynthesis
          if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(plainText);
            utterance.onend = () => {
              setIsSpeaking(false);
              setCurrentlySpeakingId(null);
            };
            window.speechSynthesis.speak(utterance);
          } else {
            setIsSpeaking(false);
            setCurrentlySpeakingId(null);
          }
        }
      }
    },
    [isSpeaking, currentlySpeakingId, selectedEngine, selectedVoice, stopSpeech]
  );

  const toggleAutoPlayTTS = useCallback(() => {
    setAutoPlayTTS((prev) => !prev);
  }, []);

  return {
    // STT
    isListening,
    transcript,
    micError,
    audioLevel,
    startListening,
    stopListening,

    // TTS
    isSpeaking,
    currentlySpeakingId,
    autoPlayTTS,
    toggleAutoPlayTTS,
    speakText,
    stopSpeech,
    selectedEngine,
    setSelectedEngine,
    selectedVoice,
    setSelectedVoice,
  };
}
