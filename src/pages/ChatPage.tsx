// pages/ChatPage.tsx
import { useState } from "react";
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
  } = useChatLogic();

  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader 
        messages={messages}
        onLoadChat={loadChat}
        currentChatId={currentChatId}
        onNewChat={handleNewChat}
      />
      <div className="flex flex-row flex-1 overflow-hidden pt-20">
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          starredMessages={starredMessages}
          messages={messages}
          onToggleStar={toggleStarMessage}
          onMessageClick={() => {}}
          onNewChat={handleNewChat}
          onLoadChat={loadChat}
          currentChatId={currentChatId}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatArea
            messages={messages}
            isLoading={isLoading}
            onToggleStar={toggleStarMessage}
            onTextToSpeech={handleTextToSpeech}
            className="flex-grow overflow-y-auto"
          />
          <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}