import React from 'react';
import { Sparkles, Code, Terminal, Cpu, UserCheck } from 'lucide-react';

export default function WelcomeScreen({ onSelectSuggestion }) {
  const suggestions = [
    {
      icon: <Code size={20} style={{ color: '#38bdf8' }} />,
      title: 'Technical Coding Interview',
      desc: 'Practice live data structures, algorithms, and system coding questions.',
      prompt: 'I am ready for a technical coding interview. Please ask me a medium complexity algorithm problem.',
    },
    {
      icon: <Cpu size={20} style={{ color: '#fb7185' }} />,
      title: 'System Design Interview',
      desc: 'Architect scalable distributed systems, microservices, and database layers.',
      prompt: 'Let us conduct a System Design interview. Ask me to design a high-throughput real-time messaging application.',
    },
    {
      icon: <UserCheck size={20} style={{ color: '#34d399' }} />,
      title: 'Behavioral & Leadership',
      desc: 'Practice STAR format responses for situation, task, action, and results.',
      prompt: 'Start a behavioral interview. Ask me about a time I dealt with conflicting team priorities or technical debt.',
    },
    {
      icon: <Terminal size={20} style={{ color: '#c084fc' }} />,
      title: 'Fullstack & Web Architecture',
      desc: 'Deep dive into React, Node.js async performance, API contracts, and state management.',
      prompt: 'Let us start a Fullstack Software Engineer interview focusing on React and Node.js performance tuning.',
    },
  ];

  return (
    <div className="welcome-container">
      <div className="welcome-icon">
        <Sparkles size={34} />
      </div>

      <h1 className="welcome-title">AI Interviewer Assistant</h1>
      <p className="welcome-subtitle">
        Powered by dedicated AI Interview Agents. Evaluation is personalized against your Candidate CV and target Job Description.
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
