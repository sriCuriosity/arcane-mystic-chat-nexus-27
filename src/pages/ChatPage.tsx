import axios from "axios";
import { useState, useEffect, useRef } from "react";
import AppHeader from "@/components/AppHeader";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import MessageInput from "@/components/MessageInput";
import { Message } from "@/types/chat";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

const SONAR_API_URL = "https://api.perplexity.ai/chat/completions";
const SONAR_API_TOKEN = "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";
const BACKEND_API_URL = "http://127.0.0.1:8000/classify-intent";

interface IntentResult {
  matched_intention: string | null;
  confidence: number;
  recommended_tools: Array<{
    name: string;
    description: string;
    confidence: number;
  }>;
}

interface CharacterData {
  characterId: number;
  name: string;
  role: string;
  systemPrompt: string;
  lifeStage: {
    stage: string;
    description: string;
  };
}

const ChatPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [characterData, setCharacterData] = useState<CharacterData | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const savedCharacter = localStorage.getItem("engagedCharacter");
    if (savedCharacter) {
      try {
        const parsedData = JSON.parse(savedCharacter);
        // Handle the array structure and get the first character
        const characterData = Array.isArray(parsedData) && parsedData.length > 0 ? parsedData[0] : null;
        if (characterData) {
          setCharacterData(characterData);
        }
      } catch (error) {
        console.error("Error parsing character data:", error);
      }
    }
  }, []);

  // Load messages and starred status from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error("Error parsing saved messages:", error);
      }
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const fetchIntentClassification = async (prompt: string): Promise<IntentResult> => {
    try {
      const response = await axios.post(`${BACKEND_API_URL}`, { prompt });
      console.log("Intent API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Intent classification failed:", error);
      return { matched_intention: null, confidence: 0, recommended_tools: [] };
    }
  };

  const fetchSonarAIResponse = async (userMessage: string, systemContent: string): Promise<string> => {
    const requestPayload = {
      model: "sonar",
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: userMessage },
      ],
    };

    console.log("Sending request to Sonar AI:", requestPayload);

    const response = await fetch(SONAR_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SONAR_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) throw new Error("Sonar API request failed");

    const data = await response.json();

    console.log("Sonar AI API response:", data);

    return data.choices?.[0]?.message?.content || "No response from Sonar AI.";
  };

  // ** KEEP YOUR ORIGINAL createOptimizedSystemPrompt UNCHANGED **
  const createOptimizedSystemPrompt = (intent: IntentResult) => {
    if (!intent.recommended_tools.length) {
      // fallback prompt if no tools recommended
      return `Return a JSON with two fields:

1. **response**: Helpful answer to user's intent: "${intent.matched_intention || "Unknown"}".
2. **code**: HTML + CSS code for a static website illustrating a useful method to address the user's query.

Be specific and relevant to the task.`;
    }

    // Pick top tool with highest confidence
    const topTool = intent.recommended_tools.reduce((prev, curr) =>
      curr.confidence > prev.confidence ? curr : prev
    );

    return `You are a helpful AI assistant.

User intent: "${intent.matched_intention}"
Top recommended tool:
- Name: ${topTool.name}
- Description: ${topTool.description}

Return a JSON with two fields:

1. "response": A helpful, concise explanation answering the user's intent.
2. "code": Complete HTML + CSS code for a static website section that visually demonstrates and explains the method "${topTool.name}" to help the user achieve their goal.
<html>...interactive flashcards or roadmap layout...</html>

Make the HTML self-contained, clean, modern, responsive, and visually appealing. Avoid external dependencies.

Only return the JSON object, no extra text.`;
  };

  // ** KEEP YOUR ORIGINAL createCasualSystemPrompt UNCHANGED **
  const createCasualSystemPrompt = () => {
    if (characterData && characterData.name && characterData.role && characterData.systemPrompt) {
      return `
You are ${characterData.name}, a ${characterData.role}.

Core Personality:
${characterData.systemPrompt}

${characterData.lifeStage ? `Current Life Stage: "${characterData.lifeStage.stage}"
${characterData.lifeStage.description}` : ''}

Behavior Guidelines:
- Stay in character and reflect both your core personality and current life stage.
- Respond briefly and clearly, avoiding unnecessary facts or digressions.
- Use language appropriate to your life stage and role.
- Keep the tone consistent (e.g., playful for child, witty for teen, professional for adult, wise for senior).
- Encourage learning with supportive and engaging answers.
      `.trim();
    }

    return `You are a friendly AI companion. Respond naturally and helpfully with a conversational tone.`;
  };

  const convertToSpeech = async (text: string, messageId: string) => {
    try {
      // If this message is already playing, stop it
      if (currentlyPlaying === messageId) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        setCurrentlyPlaying(null);
        return;
      }

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const toastId = toast.loading('Converting to speech...');

      const response = await fetch(`http://127.0.0.1:3000/speak`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Speech conversion failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create new audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Clean up the URL object after audio finishes playing
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setCurrentlyPlaying(null);
      };

      toast.dismiss(toastId);
      toast.success('Playing response');

      setCurrentlyPlaying(messageId);
      await audio.play();
    } catch (error) {
      console.error('Error converting to speech:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to convert response to speech');
      setCurrentlyPlaying(null);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) {
      toast.error('Please enter a message');
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      sender: "user",
      timestamp: new Date(),
      starred: false
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const intent = await fetchIntentClassification(content);
      const threshold = 0.3;

      let systemPrompt: string;
      let shouldShowIntentToast = false;

      if (intent.matched_intention && intent.confidence >= threshold) {
        systemPrompt = createOptimizedSystemPrompt(intent);
        shouldShowIntentToast = true;
      } else {
        systemPrompt = createCasualSystemPrompt();
      }

      const aiRawContent = await fetchSonarAIResponse(content, systemPrompt);

      let aiParsed: { response: string; code: string } = { response: aiRawContent, code: "" };
      try {
        const jsonStart = aiRawContent.indexOf("{");
        const jsonString = jsonStart >= 0 ? aiRawContent.slice(jsonStart) : aiRawContent;
        aiParsed = JSON.parse(jsonString);
      } catch (err) {
        console.warn("Failed to parse AI response as JSON, using raw content.", err);
        aiParsed = { response: aiRawContent, code: "" };
      }

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content:
          aiParsed.response +
          (aiParsed.code ? `\n\n### Render Code Below ###\n${aiParsed.code}` : ""),
        sender: "ai",
        timestamp: new Date(),
        starred: false
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (shouldShowIntentToast) {
        toast.success(
          `🎯 Detected: ${intent.matched_intention} (${Math.round(intent.confidence * 100)}% confidence)`
        );
      }
    } catch (error) {
      console.error("Error processing message:", error);
      toast.error("Failed to get a response from the AI");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <AppHeader onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          starredMessages={messages.filter(msg => msg.starred)}
          messages={messages}
          onToggleStar={(messageId) => {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === messageId ? { ...msg, starred: !msg.starred } : msg
              )
            );
          }}
          onMessageClick={(messageId) => {
            console.log("Message clicked:", messageId);
          }}
        />
        <main className="flex flex-col flex-grow overflow-y-auto">
          <ChatArea 
            messages={messages} 
            isLoading={isLoading}
            onToggleStar={(messageId) => {
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === messageId ? { ...msg, starred: !msg.starred } : msg
                )
              );
            }}
            onPlayMessage={(messageId, content) => convertToSpeech(content, messageId)}
            currentlyPlaying={currentlyPlaying}
          />
          <div className="flex flex-col min-w-0">
            <MessageInput onSendMessage={handleSendMessage} disabled={isLoading} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
