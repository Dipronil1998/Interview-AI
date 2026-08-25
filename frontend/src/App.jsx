import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import ConfirmModal from './components/ConfirmModal';
import InterviewModal from './components/InterviewModal';
import { useChat } from './hooks/useChat';
import { useVoice } from './hooks/useVoice';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const {
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
  } = useChat();

  const voiceProps = useVoice();
  const { autoPlayTTS, speakText } = voiceProps;

  // Auto-play TTS when a new assistant message is received
  useEffect(() => {
    if (autoPlayTTS && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        speakText(lastMessage.content, lastMessage._id || `msg-${messages.length - 1}`);
      }
    }
  }, [messages, autoPlayTTS, speakText]);

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        threads={threads}
        currentThreadId={currentThreadId}
        onSelectThread={handleSelectThread}
        onNewChat={handleNewChat}
        onDeleteThread={confirmDeleteThread}
        isOpen={sidebarOpen}
      />

      {/* Main Chat Interface */}
      <main className="main-chat">
        <Header
          activeTitle={currentTitle}
          activeAgent={activeAgent}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          voiceProps={voiceProps}
        />

        <MessageList
          messages={messages}
          loading={loading}
          voiceProps={voiceProps}
          onSelectSuggestion={(promptText) => {
            setInputPrompt(promptText);
            handleSendMessage(promptText);
          }}
        />

        <ChatInput
          inputPrompt={inputPrompt}
          setInputPrompt={setInputPrompt}
          onSendMessage={handleSendMessage}
          loading={loading}
          voiceProps={voiceProps}
        />
      </main>

      {/* Start AI Interview Modal (Triggered on New Chat) */}
      <InterviewModal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        onStartInterview={handleStartInterview}
        onStartGeneralChat={handleStartGeneralChat}
        loading={loading}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!threadToDelete}
        title="Delete Conversation?"
        message="Are you sure you want to delete this thread? All associated chat history will be permanently removed."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={executeDeleteThread}
        onCancel={cancelDeleteThread}
      />
    </div>
  );
}
