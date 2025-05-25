// hooks/useChatLogic.ts
import { useState, useEffect, useRef } from "react";
import { Message } from "@/types/chat";
import { ApiService, IntentResult } from "@/services/apiService";
import { CharacterService } from "../services/characterService";
import { PromptService } from "../services/promptService";
import { toast } from "sonner";

export interface CharacterData {
  characterId: number;
  name: string;
  role: string;
  systemPrompt: string;
  voiceId: string;
  lifeStage: {
    stage: string;
    description: string;
  };
}

export interface ParsedAIResponse {
  response: string;
  code: string;
}

export const useChatLogic = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [characterData, setCharacterData] = useState<CharacterData | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load character data on mount
  useEffect(() => {
    const character = CharacterService.getEngagedCharacter();
    if (character) {
      setCharacterData(character);
    }
  }, []);

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = CharacterService.getSavedMessages();
    if (savedMessages.length > 0) {
      setMessages(savedMessages);
    }
  }, []);

  // Save messages to localStorage when they change
  useEffect(() => {
    CharacterService.saveMessages(messages);
  }, [messages]);

  /**
   * Parses AI response, attempting JSON first, falling back to raw content
   */
  const parseAIResponse = (rawContent: string): ParsedAIResponse => {
    try {
      const jsonStart = rawContent.indexOf("{");
      const jsonString = jsonStart >= 0 ? rawContent.slice(jsonStart) : rawContent;
      return JSON.parse(jsonString);
    } catch (err) {
      console.warn("Failed to parse AI response as JSON, using raw content.", err);
      return { response: rawContent, code: "" };
    }
  };

  /**
   * Handles the complete message sending flow
   */
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) {
      toast.error('Please enter a message');
      return;
    }

    // Add user message
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
      // Classify intent
      const intent = await ApiService.classifyIntent(content);
      const threshold = 0.3;

      // Determine system prompt based on intent
      let systemPrompt: string;
      let shouldShowIntentToast = false;

      if (intent.matched_intention && intent.confidence >= threshold) {
        systemPrompt = PromptService.createOptimizedSystemPrompt(intent);
        shouldShowIntentToast = true;
      } else {
        systemPrompt = PromptService.createCasualSystemPrompt(characterData);
      }

      // Get AI response
      const aiRawContent = await ApiService.getSonarResponse(content, systemPrompt);
      const aiParsed = parseAIResponse(aiRawContent);

      // Create AI message
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

      // Show intent detection toast if applicable
      if (shouldShowIntentToast) {
        toast.success(
          `🎯 Detected: ${intent.matched_intention} (${Math.round(intent.confidence * 100)}% confidence)`
        );
      }
    } catch (error) {
      console.error("Error handling message:", error);
      const errorMessage = error instanceof Error ? error.message : "Sorry, I couldn't process your request right now.";
      
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          content: errorMessage,
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

  /**
   * Handles text-to-speech conversion and playback
   */
  const handleTextToSpeech = async (text: string, messageId: string) => {
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
      
      // Get character data for voice
      const character = CharacterService.getEngagedCharacter();
      if (!character) {
        throw new Error('No character data available for voice conversion');
      }

      const audioBlob = await ApiService.convertToSpeech({
        text,
        character: {
          role: character.role,
          voiceId: character.voiceId
        }
      });

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      // Clean up when audio finishes
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

  /**
   * Toggles starred status of a message
   */
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

  return {
    messages,
    isLoading,
    characterData,
    currentlyPlaying,
    handleSendMessage,
    handleTextToSpeech,
    toggleStarMessage,
    starredMessages: messages.filter((msg) => msg.starred),
  };
};