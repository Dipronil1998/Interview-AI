import React from 'react';
import { Bot } from 'lucide-react';

export default function ThinkingIndicator() {
  return (
    <div className="message-card">
      <div className="avatar assistant-avatar">
        <Bot size={18} />
      </div>
      <div className="message-body">
        <div className="thinking-card">
          <div className="thinking-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
          <span className="thinking-text">
            AI Interviewer is evaluating response...
          </span>
        </div>
      </div>
    </div>
  );
}
