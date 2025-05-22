import { Message } from "@/types/chat";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Copy, Check, Code, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ChatAreaProps {
  messages: Message[];
  isLoading?: boolean;
  onToggleStar: (messageId: string) => void;
}

interface ParsedResponse {
  response: string;
  code?: string;
}

const ChatArea = ({ messages, isLoading, onToggleStar }: ChatAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const parseAIResponse = (content: string): ParsedResponse | null => {
    try {
      const jsonMatch = content.match(/```json\s*({[\s\S]*?})\s*```/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[1];
        return JSON.parse(jsonStr);
      }

      if (content.trim().startsWith("{") && content.trim().endsWith("}")) {
        return JSON.parse(content);
      }

      return null;
    } catch (error) {
      console.error("Error parsing AI response:", error);
      return null;
    }
  };

  const handleCopy = async (content: string, messageId: string, isCode = false) => {
    try {
      await navigator.clipboard.writeText(content);
      if (isCode) {
        setCopiedCodeId(messageId);
        setTimeout(() => setCopiedCodeId(null), 2000);
      } else {
        setCopiedMessageId(messageId);
        setTimeout(() => setCopiedMessageId(null), 2000);
      }

      toast.success(`${isCode ? "Code" : "Message"} copied to clipboard`, {
        duration: 2000,
        className: "bg-green-500 text-white",
      });
    } catch (err) {
      toast.error(`Failed to copy ${isCode ? "code" : "message"}`, {
        duration: 2000,
        className: "bg-red-500 text-white",
      });
    }
  };

  const handleStar = (messageId: string, isStarred: boolean) => {
    onToggleStar(messageId);
    toast.success(
      isStarred
        ? "Message removed from starred collection"
        : "Message starred and saved to your collection",
      {
        duration: 2000,
        className: "bg-yellow-500 text-white",
      }
    );
  };

  const renderAIMessage = (message: Message) => {
    const parsedResponse = parseAIResponse(message.content);

    if (parsedResponse) {
      return (
        <div className="w-full">
          <div className="bg-muted text-foreground rounded-2xl rounded-tl-sm p-4 mb-3">
            <p className="whitespace-pre-wrap">{parsedResponse.response}</p>
          </div>

          {parsedResponse.code && (
            <Card className="mt-3">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Code size={16} />
                  Learning Technique Visualization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="preview" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="preview" className="flex items-center gap-2">
                      <Eye size={14} />
                      Preview
                    </TabsTrigger>
                    <TabsTrigger value="code" className="flex items-center gap-2">
                      <Code size={14} />
                      HTML Code
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="preview" className="mt-4">
                    <div className="border rounded-lg overflow-hidden">
                      <iframe
                        srcDoc={parsedResponse.code}
                        className="w-full h-96 border-0"
                        sandbox="allow-scripts"
                        title="Learning Technique Preview"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="code" className="mt-4">
                    <div className="relative">
                      <SyntaxHighlighter
                        language="html"
                        style={oneDark}
                        customStyle={{
                          padding: "1rem",
                          borderRadius: "0.5rem",
                          fontSize: "0.875rem",
                        }}
                      >
                        {parsedResponse.code}
                      </SyntaxHighlighter>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => handleCopy(parsedResponse.code!, message.id, true)}
                      >
                        {copiedCodeId === message.id ? (
                          <>
                            <Check size={14} className="mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={14} className="mr-1" />
                            Copy Code
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    return (
      <div className="bg-muted text-foreground rounded-2xl rounded-tl-sm p-4">
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
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
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              id={`message-${message.id}`}
              className={cn(
                "flex flex-col mb-6 transition-colors duration-200 group",
                message.sender === "user" ? "items-end" : "items-start"
              )}
            >
              <div className="flex items-start gap-3 w-full max-w-[90%]">
                {message.sender === "ai" && (
                  <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                    <AvatarImage src="/ai-avatar.png" alt="AI" />
                    <AvatarFallback className="bg-primary/10 text-primary">AI</AvatarFallback>
                  </Avatar>
                )}

                <div className="flex flex-col w-full">
                  {message.sender === "user" ? (
                    <div className="bg-primary/10 text-primary-foreground rounded-2xl rounded-tr-sm p-4 ml-auto">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  ) : (
                    renderAIMessage(message)
                  )}

                  <div className="flex items-center justify-between mt-2 px-1">
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(message.timestamp)}
                    </span>

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
                              onClick={() => {
                                const parsed = parseAIResponse(message.content);
                                const contentToCopy = parsed ? parsed.response : message.content;
                                handleCopy(contentToCopy, message.id);
                              }}
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
