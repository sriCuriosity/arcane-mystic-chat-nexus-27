import { Message } from "@/types/chat";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ChatAreaProps {
  messages: Message[];
  isLoading?: boolean;
  onToggleStar: (messageId: string) => void;
}

const ChatArea = ({ messages, isLoading, onToggleStar }: ChatAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCopy = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      toast.success("Message copied to clipboard", {
        duration: 2000,
        className: "bg-green-500 text-white",
        style: {
          animation: "slide-in 0.2s ease-out",
        },
      });
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      toast.error("Failed to copy message", {
        duration: 2000,
        className: "bg-red-500 text-white",
        style: {
          animation: "slide-in 0.2s ease-out",
        },
      });
    }
  };

  const handleStar = (messageId: string, isStarred: boolean) => {
    onToggleStar(messageId);
    toast.success(
      isStarred ? "Message removed from starred collection" : "Message starred and saved to your collection",
      {
        duration: 2000,
        className: "bg-yellow-500 text-white",
        style: {
          animation: "slide-in 0.2s ease-out",
        },
      }
    );
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
              id={`message-${message.id}`}
              className={cn(
                "flex flex-col mb-6 transition-colors duration-200 group",
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
                  
                  <div className="flex items-center justify-between mt-1 px-1">
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(message.timestamp)}
                    </span>

                    {/* Action buttons - only visible on hover */}
                    {message.sender === "ai" && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-accent"
                              onClick={() => handleStar(message.id, message.starred)}
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
                          </TooltipTrigger>
                          <TooltipContent>
                            {message.starred ? "Remove from starred" : "Add to starred"}
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-accent"
                              onClick={() => handleCopy(message.content, message.id)}
                              aria-label="Copy message"
                            >
                              {copiedMessageId === message.id ? (
                                <Check size={14} className="text-green-500" />
                              ) : (
                                <Copy size={14} className="text-muted-foreground" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {copiedMessageId === message.id ? "Copied!" : "Copy message"}
                          </TooltipContent>
                        </Tooltip>
                      </div>
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
