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
const BACKEND_API_URL = "http://localhost:8081"; // Your backend for intent

const ChatPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const fetchIntentClassification = async (prompt: string) => {
    try {
      const response = await axios.post(`${BACKEND_API_URL}/classify-intent`, {
        prompt,
      });
      return response.data; // { intention: string | null, confidence: number }
    } catch (error) {
      console.error("Intent classification failed:", error);
      return { intention: null, confidence: 0 };
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

      let systemPrompt = "";

      if (intent.intention && intent.confidence >= threshold) {
  const recommendedToolsList = intent.recommended_tools
    .map(tool => `- ${tool.name}: ${tool.description} (confidence: ${tool.confidence})`)
    .join("\n");

  systemPrompt = `
You are a general AI assistant responding to a user intent identified as: "${intent.matched_intention}" (confidence: ${intent.confidence}).

The system has identified relevant techniques/tools:
${recommendedToolsList}

Your task is to return a **JSON** object with two fields:

1. "response": A clear, helpful explanation of this intent that is informative but neutral — do not give advice or motivation. Use formatting like **bold titles**, ✅ checklists, bullet points, or numbered steps if useful. Focus on describing what this task involves and how it is commonly approached in real-life scenarios.

2. "code": A **working HTML + CSS snippet** that visually represents the tools listed above. Use interactive formats like:
   - Flashcards (flip on click)
   - Roadmaps (step-by-step layout)
   - Mind maps (node-branch)
   - Timers, editors, visual grids, or sliders (depending on the tool)

🛑 Do NOT simply return tool names.
✅ Instead, render a **visual layout** of the tool’s *functionality or structure*.

Example output format:

{
  "response": "Learning Java typically involves...",
  "code": "<html>...interactive flashcards or roadmap layout...</html>"
}

⚠️ Ensure that:
- The HTML is complete and styled
- Each tool is represented visually
- No need to repeat the intent text in the output
`.trim();
}


 else {
        systemPrompt = `You are a fun, engaging, and emotionally aware AI. Your job is to make the user feel heard and entertained during casual conversations.

When they talk casually or ask random things, do one or more of the following:

1. Respond playfully, humorously, or thoughtfully depending on their mood.
2. Suggest a fun follow-up: a riddle, a curious question, a quote, or a casual quiz.
3. Occasionally, offer something small like:
   - “Want to play a word game?”
   - “Want a 30-sec fun fact?”
   - “Want a quick personality quiz?”

Keep it light. Don’t go deep into productivity unless asked. Think like a friendly AI companion.`;
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
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStarMessage = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              starred: !msg.starred,
            }
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
            console.log("Clicked message:", messageId);
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
