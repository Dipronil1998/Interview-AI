import React from 'react';
import { Bot, Code, Bug, Database, FileText } from 'lucide-react';

export default function WelcomeScreen({ onSelectSuggestion }) {
  const suggestions = [
    {
      icon: <Code size={20} style={{ color: '#38bdf8' }} />,
      title: 'Code Agent',
      desc: 'Build a responsive React data table component with search and sorting.',
      prompt: 'Build a responsive React data table component with search and sorting.',
    },
    {
      icon: <Bug size={20} style={{ color: '#fb7185' }} />,
      title: 'Debug Agent',
      desc: 'Fix Unhandled Promise Rejection in Node.js Express async handler.',
      prompt: 'How do I fix Unhandled Promise Rejections in Node.js Express async route handlers?',
    },
    {
      icon: <Database size={20} style={{ color: '#34d399' }} />,
      title: 'Database Agent',
      desc: 'Design an optimized MongoDB Mongoose schema with index recommendations.',
      prompt: 'Design an optimized MongoDB Mongoose schema for an e-commerce order management system with indexing advice.',
    },
    {
      icon: <FileText size={20} style={{ color: '#c084fc' }} />,
      title: 'Documentation Agent',
      desc: 'Write a comprehensive README.md with setup and OpenAPI endpoint specs.',
      prompt: 'Write a complete production-ready README.md for a Node.js REST API service with setup instructions.',
    },
  ];

  return (
    <div className="welcome-container">
      <div className="welcome-icon">
        <Bot size={34} />
      </div>

      <h1 className="welcome-title">Developer Assistant AI</h1>
      <p className="welcome-subtitle">
        Powered by Orchestrator, Code, Debug, Database, and Documentation specialized agents. Ask any coding, debugging, or database question.
      </p>

      <div className="suggestions-grid">
        {suggestions.map((item, index) => (
          <div
            key={index}
            className="suggestion-card"
            onClick={() => onSelectSuggestion(item.prompt)}
          >
            <div className="suggestion-header">
              {item.icon}
              <span>{item.title}</span>
            </div>
            <div className="suggestion-desc">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
