// pages/ChatPage.tsx
import { useState, useEffect } from "react";
import AppHeader from "@/components/AppHeader";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import MessageInput from "@/components/MessageInput";
import { useChatLogic } from "@/hooks/useChatLogic";

export default function ChatPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const {
    messages,
    isLoading,
    handleSendMessage,
    handleTextToSpeech,
    toggleStarMessage,
    handleNewChat,
    loadChat,
    currentChatId,
    starredMessages,
    currentlyPlaying,
  } = useChatLogic();

  // Auto-reload once on first mount if not already reloaded
  /*useEffect(() => {
    if (!window.location.hash.includes("#reloaded")) {
      window.location.hash = "#reloaded";
      window.location.reload();
    }
  }, []);*/

  // Clean up the hash after reload
  useEffect(() => {
    if (window.location.hash === "#reloaded") {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen min-h-0 bg-background">
      <AppHeader 
        messages={messages}
        onLoadChat={loadChat}
        currentChatId={currentChatId}
        onNewChat={handleNewChat}
      />
      <div className="flex flex-row flex-1 min-h-0 overflow-hidden pt-20">
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          starredMessages={starredMessages}
          messages={messages}
          onToggleStar={toggleStarMessage}
          onMessageClick={() => {}}
          onNewChat={handleNewChat}
        />
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <ChatArea
            messages={messages}
            isLoading={isLoading}
            onToggleStar={toggleStarMessage}
            onPlayMessage={handleTextToSpeech}
            currentlyPlaying={currentlyPlaying}
          />
          <MessageInput onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
}
