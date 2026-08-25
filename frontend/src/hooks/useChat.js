import { useState, useEffect } from 'react';

export function useChat() {
  const [threads, setThreads] = useState([]);
  const [currentThreadId, setCurrentThreadId] = useState(null);
  const [currentTitle, setCurrentTitle] = useState('New Conversation');
  const [messages, setMessages] = useState([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState(null);
  const [threadToDelete, setThreadToDelete] = useState(null);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);

  // Fetch all conversation threads from API
  const fetchThreads = async () => {
    try {
      const res = await fetch('/api/threads');
      const data = await res.json();
      if (data.success && Array.isArray(data.threads)) {
        setThreads(data.threads);
      }
    } catch (err) {
      console.error('Failed to fetch threads:', err);
    }
  };

  // Select existing thread and load history
  const handleSelectThread = async (threadId, updateUrl = true) => {
    setCurrentThreadId(threadId);
    if (updateUrl) {
      window.history.pushState({}, '', `/${threadId}`);
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/thread/${threadId}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
        setCurrentTitle(data.title || 'Conversation');
        const lastAssistantMsg = [...(data.messages || [])].reverse().find((m) => m.role === 'assistant');
        setActiveAgent(lastAssistantMsg ? lastAssistantMsg.agent : null);
      }
    } catch (err) {
      console.error('Failed to load thread messages:', err);
    } finally {
      setLoading(false);
    }
  };

  // Start a brand new chat thread -> Opens Interview Modal
  const handleNewChat = (openModal = true, updateUrl = true) => {
    setCurrentThreadId(null);
    setCurrentTitle('New Conversation');
    setMessages([]);
    setActiveAgent(null);
    setInputPrompt('');
    if (openModal) {
      setIsInterviewModalOpen(true);
    }
    if (updateUrl) {
      window.history.pushState({}, '', '/');
    }
  };

  // Start a general developer chat without interview modal
  const handleStartGeneralChat = () => {
    setIsInterviewModalOpen(false);
    handleNewChat(false, true);
  };

  // Submit modal data to start an AI Interview session
  const handleStartInterview = async ({ jobDescription, roleTitle, candidateCv }) => {
    setLoading(true);
    try {
      const res = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          roleTitle,
          candidateCv,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setCurrentThreadId(data.threadId);
        setCurrentTitle(data.title);
        setActiveAgent(data.agent || 'interviewer');
        setMessages(data.messages || []);
        setIsInterviewModalOpen(false);

        window.history.pushState({}, '', `/${data.threadId}`);
        fetchThreads();
      } else {
        alert(data.message || 'Failed to start interview session');
      }
    } catch (err) {
      console.error('Start interview API error:', err);
      alert('Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  // Trigger modal confirmation for deleting thread
  const confirmDeleteThread = (threadId, e) => {
    if (e) e.stopPropagation();
    setThreadToDelete(threadId);
  };

  // Cancel deletion
  const cancelDeleteThread = () => {
    setThreadToDelete(null);
  };

  // Execute deletion after user confirms in modal
  const executeDeleteThread = async () => {
    if (!threadToDelete) return;
    const targetId = threadToDelete;
    setThreadToDelete(null);

    try {
      const res = await fetch(`/api/thread/${targetId}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        if (currentThreadId === targetId) {
          handleNewChat(false);
        }
        fetchThreads();
      }
    } catch (err) {
      console.error('Failed to delete thread:', err);
    }
  };

  // Initial load & URL routing check
  useEffect(() => {
    fetchThreads();

    const pathId = window.location.pathname.substring(1);
    if (pathId) {
      handleSelectThread(pathId, false);
    } else {
      // Don't auto-open modal on initial page load if clean root, or open if desired
      handleNewChat(false, false);
    }

    // Synchronize browser Back / Forward buttons
    const handlePopState = () => {
      const currentPathId = window.location.pathname.substring(1);
      if (currentPathId) {
        handleSelectThread(currentPathId, false);
      } else {
        handleNewChat(false, false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Submit prompt to /api/chat
  const handleSendMessage = async (textToSend) => {
    const prompt = textToSend || inputPrompt;
    if (!prompt || prompt.trim() === '' || loading) return;

    const userMsg = { role: 'user', content: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: currentThreadId || undefined,
          message: prompt,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const assistantMsg = {
          role: 'assistant',
          content: data.response,
          agent: data.agent,
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setCurrentThreadId(data.threadId);
        setCurrentTitle(data.title || prompt.substring(0, 40));
        setActiveAgent(data.agent);

        // Update URL to match threadId
        window.history.pushState({}, '', `/${data.threadId}`);

        // Refresh sidebar threads list
        fetchThreads();
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `⚠️ Error: ${data.message || 'Failed to generate response.'}`,
            agent: 'general',
          },
        ]);
      }
    } catch (err) {
      console.error('Chat API Error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ Network Error: Unable to connect to backend server. Make sure the backend service is running.',
          agent: 'general',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return {
    threads,
    currentThreadId,
    currentTitle,
    messages,
    inputPrompt,
    setInputPrompt,
    loading,
    activeAgent,
    threadToDelete,
    isInterviewModalOpen,
    setIsInterviewModalOpen,
    handleSelectThread,
    handleNewChat,
    handleStartGeneralChat,
    handleStartInterview,
    confirmDeleteThread,
    cancelDeleteThread,
    executeDeleteThread,
    handleSendMessage,
  };
}
