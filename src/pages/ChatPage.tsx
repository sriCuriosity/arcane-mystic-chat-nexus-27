// pages/ChatPage.tsx
import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import MessageInput from "@/components/MessageInput";
import { useChatLogic } from "@/hooks/useChatLogic";

const ChatPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const {
    messages,
    isLoading,
    currentlyPlaying,
    handleSendMessage,
    handleTextToSpeech,
    toggleStarMessage,
    starredMessages,
  } = useChatLogic();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen flex-col">
      <AppHeader 
        onToggleSidebar={toggleSidebar} 
        sidebarOpen={sidebarOpen} 
        messages={messages}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          starredMessages={starredMessages}
          messages={messages}
          onToggleStar={toggleStarMessage}
          onMessageClick={(messageId) => {
            console.log("Message clicked:", messageId);
          }}
        />
        <main className="flex flex-col flex-grow overflow-y-auto">
          <ChatArea 
            messages={messages} 
            isLoading={isLoading}
            onToggleStar={toggleStarMessage}
            onPlayMessage={handleTextToSpeech}
            currentlyPlaying={currentlyPlaying}
          />
          <div className="flex flex-col min-w-0">
            <MessageInput 
              onSendMessage={handleSendMessage} 
              disabled={isLoading} 
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatPage;