import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, FileText, UserCheck, Code, CheckCircle } from 'lucide-react';

export default function InterviewModal({
  isOpen,
  onClose,
  onStartInterview,
  onStartGeneralChat,
  loading,
}) {
  const [jobDescription, setJobDescription] = useState('');
  const [candidateCv, setCandidateCv] = useState(null);
  const [cvJsonText, setCvJsonText] = useState('');
  const [cvError, setCvError] = useState(null);
  const [activeTab, setActiveTab] = useState('jd'); // 'jd' | 'cv'
  const textareaRef = useRef(null);

  // Fetch current candidate CV on mount & reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setJobDescription('');
      fetch('/api/cv')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.cv) {
            setCandidateCv(data.cv);
            setCvJsonText(JSON.stringify(data.cv, null, 2));
          }
        })
        .catch((err) => console.error('Failed to load candidate CV:', err));
    }
  }, [isOpen]);

  // Auto-focus textarea when opening or switching to JD tab
  useEffect(() => {
    if (isOpen && activeTab === 'jd' && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleCvJsonChange = (e) => {
    const val = e.target.value;
    setCvJsonText(val);
    try {
      const parsed = JSON.parse(val);
      setCandidateCv(parsed);
      setCvError(null);
    } catch (err) {
      setCvError('Invalid JSON format');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!jobDescription.trim()) return;

    onStartInterview({
      jobDescription,
      candidateCv,
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="interview-modal-container">
        {/* Header */}
        <div className="interview-modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <Sparkles size={22} />
            </div>
            <div>
              <h2 className="modal-title">Start AI Interview</h2>
              <p className="modal-subtitle">
                Paste your Job Description (JD) to start an interactive mock interview matched against your Candidate CV (JSON).
              </p>
            </div>
          </div>

          <button className="modal-close-btn" onClick={onClose} title="Close Modal">
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="modal-tabs">
          <button
            className={`modal-tab ${activeTab === 'jd' ? 'active' : ''}`}
            onClick={() => setActiveTab('jd')}
          >
            <FileText size={16} />
            <span>1. Job Description (JD)</span>
          </button>
          <button
            className={`modal-tab ${activeTab === 'cv' ? 'active' : ''}`}
            onClick={() => setActiveTab('cv')}
          >
            <UserCheck size={16} />
            <span>2. Candidate CV (JSON)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {activeTab === 'jd' ? (
            <div className="form-group">
              <div className="label-row">
                <label className="input-label">Paste Job Description (JD):</label>
                <span className="char-count">{jobDescription.length} chars</span>
              </div>
              <textarea
                ref={textareaRef}
                className="modal-textarea"
                rows={8}
                placeholder="Paste complete Job Description text here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                autoFocus
                required
              />
            </div>
          ) : (
            <div className="cv-json-section">
              <div className="cv-header-bar">
                <label className="input-label">Candidate CV Data (JSON):</label>
                {cvError ? (
                  <span className="cv-error-badge">⚠️ {cvError}</span>
                ) : (
                  <span className="cv-valid-badge">
                    <CheckCircle size={14} /> Valid JSON
                  </span>
                )}
              </div>
              <p className="cv-help-text">
                This JSON CV will be passed to the AI Interviewer agent to evaluate your experience and technical skills during the voice interview.
              </p>
              <textarea
                className="modal-textarea code-font"
                rows={12}
                value={cvJsonText}
                onChange={handleCvJsonChange}
                spellCheck="false"
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                onClose();
                onStartGeneralChat();
              }}
            >
              <Code size={16} />
              <span>Standard Dev Chat</span>
            </button>

            <button
              type="submit"
              className="btn-primary-glow"
              disabled={loading || !jobDescription.trim() || (activeTab === 'cv' && !!cvError)}
            >
              <Sparkles size={18} />
              <span>{loading ? 'Initializing Interview...' : '🚀 Start AI Voice Interview'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
