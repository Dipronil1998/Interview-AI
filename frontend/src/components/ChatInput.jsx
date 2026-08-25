import React, { useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2 } from 'lucide-react';

export default function ChatInput({
  inputPrompt,
  setInputPrompt,
  onSendMessage,
  loading,
  voiceProps = {},
}) {
  const textareaRef = useRef(null);
  const {
    isListening = false,
    startListening = () => {},
    stopListening = () => {},
    audioLevel = 0,
    micError = null,
  } = voiceProps;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputPrompt.trim() && !loading) {
        onSendMessage();
      }
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((text) => {
        setInputPrompt(text);
      });
    }
  };

  return (
    <div className="input-container">
      {micError && (
        <div className="mic-error-banner">
          <span>⚠️ {micError}</span>
        </div>
      )}

      {isListening && (
        <div className="listening-indicator-bar">
          <div className="listening-pulse-dot" />
          <span className="listening-label">Listening for voice instructions...</span>
          <div className="audio-wave-visualizer">
            <div
              className="wave-bar"
              style={{ height: `${Math.max(20, audioLevel * 0.8)}%` }}
            />
            <div
              className="wave-bar"
              style={{ height: `${Math.max(30, audioLevel * 1.1)}%` }}
            />
            <div
              className="wave-bar"
              style={{ height: `${Math.max(25, audioLevel * 0.9)}%` }}
            />
          </div>
        </div>
      )}

      <div className={`input-box ${isListening ? 'listening-active-box' : ''}`}>
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          placeholder={
            isListening
              ? '🎤 Speak now... your speech will be converted to text...'
              : 'Ask anything or click 🎤 to give voice instructions...'
          }
          rows={2}
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <div className="input-actions">
          <span className="input-hints">
            Press <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for line break, or 🎤 for Voice
          </span>

          <div className="action-buttons-group">
            <button
              type="button"
              className={`mic-btn ${isListening ? 'listening-active' : ''}`}
              onClick={handleMicClick}
              title={isListening ? 'Stop Listening' : 'Voice Instruction (Speech-to-Text)'}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <button
              type="button"
              className="send-btn"
              onClick={() => onSendMessage()}
              disabled={!inputPrompt.trim() || loading}
              title="Send Message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
