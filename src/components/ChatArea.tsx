import { Message } from "@/types/chat";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Copy, Check, Code, Eye, Download, Image, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const parseAIResponse = (content: string): ParsedResponse | null => {
    try {
      // Try to find JSON within the content
      const jsonMatch = content.match(/```json\s*({[\s\S]*?})\s*```/) || 
                       content.match(/json\s*({[\s\S]*?})\s*/) ||
                       content.match(/({[\s\S]*?})/);
      
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
      });
    } catch (err) {
      toast.error(`Failed to copy ${isCode ? "code" : "message"}`, {
        duration: 2000,
      });
    }
  };

  const downloadAsImage = async (htmlContent: string, messageId: string) => {
    setDownloadingId(messageId);
    
    try {
      // Dynamic import for better bundle size
      const html2canvas = (await import('html2canvas')).default;
      
      // Create a temporary iframe to render the HTML
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.width = '1200px';
      iframe.style.height = '800px';
      document.body.appendChild(iframe);

      // Write HTML content to iframe
      iframe.contentDocument?.open();
      iframe.contentDocument?.write(htmlContent);
      iframe.contentDocument?.close();

      // Wait for content to load
      await new Promise(resolve => {
        iframe.onload = resolve;
        setTimeout(resolve, 2000); // Fallback timeout
      });

      // Capture the iframe content
      const canvas = await html2canvas(iframe.contentDocument?.body || document.body, {
        width: 1200,
        height: 800,
        scale: 2,
        useCORS: true,
        allowTaint: false,
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `study-tool-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      // Cleanup
      document.body.removeChild(iframe);
      
      toast.success("Study tool downloaded as image!", { duration: 3000 });
    } catch (error) {
      console.error("Error downloading as image:", error);
      toast.error("Failed to download as image. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const downloadAsPDF = async (htmlContent: string, messageId: string) => {
    setDownloadingId(messageId);
    
    try {
      // Dynamic imports
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).jsPDF;
      
      // Create temporary iframe
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.width = '1200px';
      iframe.style.height = '800px';
      document.body.appendChild(iframe);

      iframe.contentDocument?.open();
      iframe.contentDocument?.write(htmlContent);
      iframe.contentDocument?.close();

      await new Promise(resolve => {
        iframe.onload = resolve;
        setTimeout(resolve, 2000);
      });

      const canvas = await html2canvas(iframe.contentDocument?.body || document.body, {
        width: 1200,
        height: 800,
        scale: 2,
        useCORS: true,
        allowTaint: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`study-tool-${Date.now()}.pdf`);

      document.body.removeChild(iframe);
      
      toast.success("Study tool downloaded as PDF!", { duration: 3000 });
    } catch (error) {
      console.error("Error downloading as PDF:", error);
      toast.error("Failed to download as PDF. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleStar = (messageId: string, isStarred: boolean) => {
    onToggleStar(messageId);
    toast.success(
      isStarred
        ? "Message removed from starred collection"
        : "Message starred and saved to your collection",
      { duration: 2000 }
    );
  };

  const renderAIMessage = (message: Message) => {
    const parsedResponse = parseAIResponse(message.content);

    if (parsedResponse && parsedResponse.code) {
      return (
        <div className="w-full">
          <div className="bg-muted text-foreground rounded-2xl rounded-tl-sm p-4 mb-3">
            <p className="whitespace-pre-wrap">{parsedResponse.response}</p>
          </div>

          <Card className="mt-3">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Code size={16} />
                  Interactive Study Tool
                </CardTitle>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={downloadingId === message.id}
                    >
                      {downloadingId === message.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download size={14} className="mr-2" />
                          Download
                        </>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem 
                      onClick={() => downloadAsImage(parsedResponse.code!, message.id)}
                      disabled={downloadingId === message.id}
                    >
                      <Image size={14} className="mr-2" />
                      Download as PNG
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => downloadAsPDF(parsedResponse.code!, message.id)}
                      disabled={downloadingId === message.id}
                    >
                      <FileText size={14} className="mr-2" />
                      Download as PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
                  <div className="border rounded-lg overflow-hidden bg-white">
                    <iframe
                      srcDoc={parsedResponse.code}
                      className="w-full h-96 border-0"
                      sandbox="allow-scripts"
                      title="Interactive Study Tool"
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
                        maxHeight: "400px",
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
              <div className="flex items-start gap-3 w-full max-w-[95%]">
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
              <div className="bg-muted rounded-2xl rounded-tl-sm p-4">
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