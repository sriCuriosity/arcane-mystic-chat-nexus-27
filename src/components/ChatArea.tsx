
import { Message } from "@/types/chat";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatAreaProps {
  messages: Message[];
  isLoading?: boolean;
  onToggleStar: (messageId: string) => void;
}

const ChatArea = ({ messages, isLoading, onToggleStar }: ChatAreaProps) => {
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
                "flex flex-col mb-6",
                message.sender === "user" ? "items-end" : "items-start"
              )}
            >
              <div className="flex items-start gap-3 max-w-[85%]">
                {/* Show avatar only for AI messages */}
                {message.sender === "ai" && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src="/ai-avatar.png" alt="AI" />
                    <AvatarFallback className="bg-primary/10 text-primary">AI</AvatarFallback>
                  </Avatar>
                )}

                <div className="flex flex-col">
                  <div
                    className={cn(
                      "rounded-2xl p-4",
                      message.sender === "user"
                        ? "bg-primary/10 text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  
                  <div className="flex items-center mt-1 px-1">
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(message.timestamp)}
                    </span>

                    {/* Star button for AI messages only */}
                    {message.sender === "ai" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 ml-2" 
                        onClick={() => onToggleStar(message.id)}
                        aria-label={message.starred ? "Unstar message" : "Star message"}
                      >
                        <Star 
                          size={14} 
                          className={cn(
                            message.starred 
                              ? "fill-yellow-500 text-yellow-500" 
                              : "text-muted-foreground"
                          )} 
                        />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback className="bg-primary/10 text-primary">AI</AvatarFallback>
              </Avatar>
              <div className="message-bubble-ai animate-pulse">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                </div>
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
