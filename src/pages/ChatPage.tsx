import { useState, useRef } from "react";
import AppHeader from "@/components/AppHeader";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import MessageInput from "@/components/MessageInput";
import { Message } from "@/types/chat";
import { toast } from "sonner";

const SONAR_API_URL = "https://api.perplexity.ai/chat/completions";
const SONAR_API_TOKEN = "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"; 

const ChatPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const aiContent = await fetchSonarAIResponse(content);
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: aiContent,
        sender: "ai",
        timestamp: new Date(),
        starred: false,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          content: "Sorry, I couldn't get a response from the AI.",
          sender: "ai",
          timestamp: new Date(),
          starred: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch response from Sonar AI API
  const fetchSonarAIResponse = async (userMessage: string): Promise<string> => {
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SONAR_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { role: "system", content: "Be precise and concise." },
          { role: "user", content: userMessage },
        ],
      }),
    };

    const response = await fetch(SONAR_API_URL, options);
    if (!response.ok) throw new Error("API error");
    const data = await response.json();
    // Adjust this according to the actual API response structure
    return data.choices?.[0]?.message?.content || "No response from AI.";
  };

  // Handle starring/unstarring a message
  const toggleStarMessage = (messageId: string) => {
    setMessages(
      messages.map((message) => {
        if (message.id === messageId) {
          const newStarredState = !message.starred;
          
          // Show toast notification
          if (newStarredState) {
            toast.success("Message starred and saved to your collection");
          } else {
            toast.info("Message removed from starred collection");
          }
          
          return { ...message, starred: newStarredState };
        }
        return message;
      })
    );
  };

  // Handle clicking a message in search/starred view
  const handleMessageClick = (messageId: string) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
      // Add a temporary highlight effect
      messageElement.classList.add("highlight-message");
      setTimeout(() => {
        messageElement.classList.remove("highlight-message");
      }, 2000);
    }
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

  // Get only starred messages for the sidebar
  const starredMessages = messages.filter(message => message.starred);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <AppHeader />
      <div className="flex flex-grow overflow-hidden">
        <Sidebar 
          isOpen={sidebarOpen} 
          toggleSidebar={toggleSidebar} 
          starredMessages={starredMessages}
          messages={messages}
          onToggleStar={toggleStarMessage}
          onMessageClick={handleMessageClick}
        />
        <div className="flex-grow flex flex-col">
          <ChatArea 
            messages={messages} 
            isLoading={isLoading} 
            onToggleStar={toggleStarMessage} 
          />
          <MessageInput onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
