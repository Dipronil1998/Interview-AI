import React from 'react';
import { Plus, MessageSquare, Bot, Trash2, Sparkles } from 'lucide-react';

export default function Sidebar({
  threads,
  currentThreadId,
  onSelectThread,
  onNewChat,
  onDeleteThread,
  isOpen,
}) {
  return (
    <aside className={`sidebar ${!isOpen ? 'closed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Bot size={20} />
          </div>
          <span>Interview AI</span>
        </div>
      </div>

      {/* New Chat / Start Interview Button */}
      <button className="new-chat-btn" onClick={() => onNewChat(true)}>
        <Plus size={18} />
        <span>New AI Interview</span>
      </button>

      {/* Thread List */}
      <div className="threads-container">
        <div className="threads-label">Recent Sessions</div>

        {threads.length === 0 ? (
          <div style={{ padding: '1rem', fontSize: '0.825rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No interview sessions yet. Click "New AI Interview" to begin!
          </div>
        ) : (
          threads.map((t) => {
            const isActive = t.threadId === currentThreadId;
            const isInterview = t.isInterview;
            return (
              <div
                key={t.threadId}
                className={`thread-item ${isActive ? 'active' : ''} ${isInterview ? 'interview-item' : ''}`}
                onClick={() => onSelectThread(t.threadId)}
              >
                <div className="thread-info">
                  {isInterview ? (
                    <Sparkles size={16} style={{ flexShrink: 0, color: '#a855f7' }} />
                  ) : (
                    <MessageSquare size={16} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.6 }} />
                  )}
                  <span className="thread-title">{t.title}</span>
                </div>

                <button
                  className="delete-thread-btn"
                  onClick={(e) => onDeleteThread(t.threadId, e)}
                  title="Delete thread"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
