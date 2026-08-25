import React, { useState } from 'react';
import {
  Menu,
  Sparkles,
  Code,
  Bug,
  Database,
  FileText,
  Cpu,
  Volume2,
  VolumeX,
  Settings2,
  Mic,
} from 'lucide-react';

export default function Header({
  activeTitle,
  activeAgent,
  onToggleSidebar,
  voiceProps = {},
}) {
  const [showSettings, setShowSettings] = useState(false);

  const {
    autoPlayTTS = false,
    toggleAutoPlayTTS = () => {},
    selectedEngine = 'webspeech',
    setSelectedEngine = () => {},
    selectedVoice = 'alloy',
    setSelectedVoice = () => {},
  } = voiceProps;

  const getAgentBadge = (agent) => {
    switch (agent?.toLowerCase()) {
      case 'code':
        return (
          <span className="agent-badge agent-code">
            <Code size={12} /> Code Agent
          </span>
        );
      case 'debug':
        return (
          <span className="agent-badge agent-debug">
            <Bug size={12} /> Debug Agent
          </span>
        );
      case 'database':
        return (
          <span className="agent-badge agent-database">
            <Database size={12} /> Database Agent
          </span>
        );
      case 'documentation':
        return (
          <span className="agent-badge agent-documentation">
            <FileText size={12} /> Docs Agent
          </span>
        );
      case 'interviewer':
        return (
          <span className="agent-badge agent-interviewer">
            <Sparkles size={12} /> AI Interviewer
          </span>
        );
      default:
        return (
          <span className="agent-badge agent-general">
            <Sparkles size={12} /> Multi-Agent
          </span>
        );
    }
  };

  return (
    <header className="chat-header">
      <div className="header-title-container">
        <button
          className="toggle-sidebar-btn"
          onClick={onToggleSidebar}
          title="Toggle Sidebar"
        >
          <Menu size={20} />
        </button>
        <span className="chat-title">{activeTitle || 'New Conversation'}</span>
      </div>

      <div className="header-badges">
        {activeAgent && getAgentBadge(activeAgent)}

        <div className="model-badge">
          <Cpu size={13} />
          <span>gpt-4o-mini</span>
        </div>

        <div className="voice-header-controls">
          <button
            type="button"
            className={`auto-tts-toggle ${autoPlayTTS ? 'active' : ''}`}
            onClick={toggleAutoPlayTTS}
            title={autoPlayTTS ? 'Auto-TTS Enabled (Click to disable)' : 'Auto-TTS Disabled (Click to enable)'}
          >
            {autoPlayTTS ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span>Auto-TTS</span>
          </button>

          <div className="settings-popover-wrapper">
            <button
              type="button"
              className="voice-settings-btn"
              onClick={() => setShowSettings(!showSettings)}
              title="Voice Settings"
            >
              <Settings2 size={14} />
            </button>

            {showSettings && (
              <div className="voice-settings-dropdown">
                <div className="dropdown-title">
                  <Mic size={13} /> Voice Engine & TTS Options
                </div>

                <div className="setting-row">
                  <label>TTS Engine:</label>
                  <select
                    value={selectedEngine}
                    onChange={(e) => setSelectedEngine(e.target.value)}
                  >
                    <option value="webspeech">Browser WebSpeech (Fast)</option>
                    <option value="openai">OpenAI TTS API (HD Voice)</option>
                  </select>
                </div>

                {selectedEngine === 'openai' && (
                  <div className="setting-row">
                    <label>OpenAI Voice:</label>
                    <select
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                    >
                      <option value="alloy">Alloy (Neutral)</option>
                      <option value="echo">Echo (Warm Male)</option>
                      <option value="fable">Fable (Expressive)</option>
                      <option value="onyx">Onyx (Deep Male)</option>
                      <option value="nova">Nova (Warm Female)</option>
                      <option value="shimmer">Shimmer (Clear Female)</option>
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
