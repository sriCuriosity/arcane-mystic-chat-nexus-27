
import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import MessageInput from "@/components/MessageInput";
import { Message } from "@/types/chat";

const ChatPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSendMessage = (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages([...messages, userMessage]);
    
    // Simulate AI response
    setIsLoading(true);
    
    setTimeout(() => {
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: getAIResponse(content),
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  // Simple AI response simulation
  const getAIResponse = (userMessage: string): string => {
    const responses = [
      "I've analyzed your request and found some interesting insights.",
      "That's a fascinating question. Let me explore it further.",
      "Based on my understanding, here's what I can tell you.",
      "I've processed your input and have some suggestions to share.",
      "Let me illuminate that topic for you with some mystical knowledge.",
    ];
    
    return `${responses[Math.floor(Math.random() * responses.length)]} 
    
Your message was: "${userMessage}"`;
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <AppHeader />
      <div className="flex flex-grow overflow-hidden">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex-grow flex flex-col">
          <ChatArea messages={messages} isLoading={isLoading} />
          <MessageInput onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
