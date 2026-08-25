import React, { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import WelcomeScreen from './WelcomeScreen';
import ThinkingIndicator from './ThinkingIndicator';

export default function MessageList({ messages, loading, onSelectSuggestion, voiceProps }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  return (
    <div className="messages-container">
      {messages.length === 0 ? (
        <WelcomeScreen onSelectSuggestion={onSelectSuggestion} />
      ) : (
        <div className="messages-wrapper">
          {messages.map((msg, index) => (
            <MessageItem key={index} index={index} message={msg} voiceProps={voiceProps} />
          ))}

          {loading && <ThinkingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
