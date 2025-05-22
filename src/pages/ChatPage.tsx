import axios from "axios";
import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import MessageInput from "@/components/MessageInput";
import { Message } from "@/types/chat";
import { toast } from "sonner";

const SONAR_API_URL = "https://api.perplexity.ai/chat/completions";
const SONAR_API_TOKEN = "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";
const BACKEND_API_URL = "http://localhost:8081";

interface IntentResult {
  matched_intention: string | null;
  confidence: number;
  recommended_tools: Array<{
    name: string;
    description: string;
    confidence: number;
  }>;
}

const ChatPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const fetchIntentClassification = async (prompt: string): Promise<IntentResult> => {
    try {
      const response = await axios.post(`${BACKEND_API_URL}/classify-intent`, {
        prompt,
      });
      return response.data;
    } catch (error) {
      console.error("Intent classification failed:", error);
      return { matched_intention: null, confidence: 0, recommended_tools: [] };
    }
  };

  const fetchSonarAIResponse = async (
    userMessage: string,
    systemContent: string
  ): Promise<string> => {
    const response = await fetch(SONAR_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SONAR_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { role: "system", content: systemContent },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) throw new Error("Sonar API request failed");

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "No response from Sonar AI.";
  };

  const createOptimizedSystemPrompt = (intent: IntentResult) => {
    const toolsList = intent.recommended_tools
      .slice(0, 3) // Limit to top 3 tools for efficiency
      .map(tool => `${tool.name}`)
      .join(", ");

    return `Intent: ${intent.matched_intention}
Tools: ${toolsList}

Return JSON:
{
  "response": "Brief explanation (2-3 sentences max)",
  "code": "Complete HTML with inline CSS/JS for interactive ${intent.matched_intention} tool using ${toolsList}. Make it functional, responsive, and visually appealing."
}

Requirements:
- Self-contained HTML
- Interactive elements
- Clean, modern design
- Mobile-friendly
- No external dependencies`;
  };

  const createCasualSystemPrompt = () => {
    return `You are a friendly AI companion. Respond naturally and engagingly. Keep it conversational and helpful. If appropriate, suggest fun activities like quizzes, games, or interesting facts.`;
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const intent = await fetchIntentClassification(content);
      const threshold = 0.6;

      let systemPrompt: string;
      let shouldShowIntentToast = false;

      if (intent.matched_intention && intent.confidence >= threshold) {
        systemPrompt = createOptimizedSystemPrompt(intent);
        shouldShowIntentToast = true;
      } else {
        systemPrompt = createCasualSystemPrompt();
      }

      const aiContent = await fetchSonarAIResponse(content, systemPrompt);

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: aiContent,
        sender: "ai",
        timestamp: new Date(),
        starred: false,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Show intent detection toast
      if (shouldShowIntentToast) {
        toast.success(
          `🎯 Detected: ${intent.matched_intention} (${Math.round(intent.confidence * 100)}% confidence)`,
          { duration: 3000 }
        );
      }

    } catch (error) {
      console.error("Error handling message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          content: "Sorry, I couldn't process your request right now.",
          sender: "ai",
          timestamp: new Date(),
          starred: false,
        },
      ]);
      toast.error("Failed to process your message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStarMessage = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, starred: !msg.starred }
          : msg
      )
    );

    const message = messages.find((msg) => msg.id === messageId);
    if (message) {
      toast[!message.starred ? "success" : "info"](
        !message.starred
          ? "Message starred and saved to your collection"
          : "Message removed from starred collection"
      );
    }
  };

  const starredMessages = messages.filter((msg) => msg.starred);

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
          onMessageClick={(messageId) => {
            // Placeholder for message click handler
            console.log("Message clicked:", messageId);
          }}
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