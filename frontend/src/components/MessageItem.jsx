import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  User,
  Bot,
  Code,
  Bug,
  Database,
  FileText,
  Sparkles,
  Copy,
  Check,
  Volume2,
  Square,
} from 'lucide-react';

function CodeBlock({ language, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-header">
        <span>{language || 'code'}</span>
        <button className="copy-btn" onClick={handleCopy}>
          {copied ? (
            <>
              <Check size={13} style={{ color: '#10b981' }} />
              <span style={{ color: '#10b981' }}>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <pre>
        <code>{value}</code>
      </pre>
    </div>
  );
}

export default function MessageItem({ message, index, voiceProps = {} }) {
  const isUser = message.role === 'user';
  const messageId = message._id || `msg-${index}`;

  const {
    isSpeaking = false,
    currentlySpeakingId = null,
    speakText = () => {},
    stopSpeech = () => {},
  } = voiceProps;

  const isCurrentSpeaking = isSpeaking && currentlySpeakingId === messageId;

  const handleSpeakClick = () => {
    if (isCurrentSpeaking) {
      stopSpeech();
    } else {
      speakText(message.content, messageId);
    }
  };

  const renderAgentBadge = (agent) => {
    switch (agent?.toLowerCase()) {
      case 'code':
        return (
          <span className="agent-badge agent-code">
            <Code size={11} /> Code Agent
          </span>
        );
      case 'debug':
        return (
          <span className="agent-badge agent-debug">
            <Bug size={11} /> Debug Agent
          </span>
        );
      case 'database':
        return (
          <span className="agent-badge agent-database">
            <Database size={11} /> Database Agent
          </span>
        );
      case 'documentation':
        return (
          <span className="agent-badge agent-documentation">
            <FileText size={11} /> Docs Agent
          </span>
        );
      case 'general':
      case 'orchestrator':
        return (
          <span className="agent-badge agent-general">
            <Sparkles size={11} /> Orchestrator
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`message-card ${isCurrentSpeaking ? 'message-speaking-active' : ''}`}>
      <div className={`avatar ${isUser ? 'user-avatar' : 'assistant-avatar'}`}>
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>

      <div className="message-body">
        <div className="message-header">
          <div className="message-header-left">
            <span className="sender-name">{isUser ? 'You' : 'Assistant'}</span>
            {!isUser && renderAgentBadge(message.agent)}
          </div>

          {!isUser && (
            <div className="message-header-actions">
              <button
                type="button"
                className={`tts-play-btn ${isCurrentSpeaking ? 'speaking-active' : ''}`}
                onClick={handleSpeakClick}
                title={isCurrentSpeaking ? 'Stop Audio' : 'Listen to Response (TTS)'}
              >
                {isCurrentSpeaking ? (
                  <>
                    <Square size={12} />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 size={13} />
                    <span>Listen</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="message-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const codeString = String(children).replace(/\n$/, '');

                if (!inline && match) {
                  return <CodeBlock language={match[1]} value={codeString} />;
                }
                if (!inline && codeString.includes('\n')) {
                  return <CodeBlock language="text" value={codeString} />;
                }
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
