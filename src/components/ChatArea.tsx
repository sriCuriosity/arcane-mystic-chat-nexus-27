
import { Message } from "@/types/chat";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ChatAreaProps {
  messages: Message[];
  isLoading?: boolean;
}

const ChatArea = ({ messages, isLoading }: ChatAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-grow overflow-y-auto p-6 gradient-bg">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
          <h3 className="text-lg font-medium mb-2">No messages yet</h3>
          <p className="text-sm">Start a conversation by typing a message below</p>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex flex-col",
                message.sender === "user" ? "items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  message.sender === "user"
                    ? "message-bubble-user"
                    : "message-bubble-ai"
                )}
              >
                <div className="flex items-start mb-1">
                  <span className="text-xs font-semibold">
                    {message.sender === "ai" ? "💡 Mystical AI:" : "👤 You:"}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              <span className="text-xs text-muted-foreground mb-4">
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
          ))}
          {isLoading && (
            <div className="message-bubble-ai animate-pulse">
              <div className="flex space-x-2">
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-.5s]"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default ChatArea;
