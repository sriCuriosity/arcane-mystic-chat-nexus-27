import { Message } from "@/types/chat";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Copy, Check, Code, Eye, Download, Image, FileText, Sparkles, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Loader2 } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ChatAreaProps {
  messages: Message[];
  isLoading?: boolean;
  onToggleStar: (messageId: string) => void;
  onPlayMessage: (messageId: string, content: string) => void;
  currentlyPlaying: string | null;
}

interface ParsedResponse {
  response: string;
  code?: string;
}

const ChatArea = ({ messages, isLoading, onToggleStar, onPlayMessage, currentlyPlaying }: ChatAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    messages.length > 0 && messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTimestamp = (dateInput: string | number | Date) => {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(date.getTime())) {
      return "";
    }
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const parseAIResponse = (content: string): ParsedResponse | null => {
    try {
      // First try to find JSON content within markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*({[\s\S]*?})\s*```/) || 
                       content.match(/json\s*({[\s\S]*?})\s*/) ||
                       content.match(/```json\s*({[\s\S]*?})\s*```/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[1].trim();
        // Clean the string of any control characters
        const cleanedJson = jsonStr.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
        return JSON.parse(cleanedJson);
      }

      // If no code block found, try to parse the entire content as JSON
      if (content.trim().startsWith("{") && content.trim().endsWith("}")) {
        const cleanedContent = content.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
        return JSON.parse(cleanedContent);
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

      const imageData = canvas.toDataURL('image/png');
      
      // Store in localStorage
      const savedImages = JSON.parse(localStorage.getItem('savedImages') || '[]');
      const newImage = {
        id: Date.now(),
        data: imageData,
        timestamp: new Date().toISOString(),
        title: `Study Tool ${savedImages.length + 1}`
      };
      savedImages.push(newImage);
      localStorage.setItem('savedImages', JSON.stringify(savedImages));

      // Download the image
      const link = document.createElement('a');
      link.download = `study-tool-${Date.now()}.png`;
      link.href = imageData;
      link.click();

      document.body.removeChild(iframe);
      
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
        <div className="w-full space-y-4">
          <div className={cn(
            "rounded-2xl rounded-tl-md p-6 shadow-sm",
            isDarkMode ? "bg-slate-700 border border-slate-600 text-slate-200" : "bg-gradient-to-r from-white to-blue-50 border border-blue-100"
          )}>
            <div className="flex items-start gap-3 mb-3">
              <div className={cn("p-2 rounded-lg", isDarkMode ? "bg-slate-600" : "bg-blue-100")}>
                <Sparkles size={16} className={isDarkMode ? "text-blue-400" : "text-blue-600"} />
              </div>
              <div className="flex-1">
                <p className="leading-relaxed">{parsedResponse.response}</p>
              </div>
            </div>
          </div>

          <Card className={cn("border-0 shadow-lg", isDarkMode ? "bg-slate-800 text-slate-200" : "bg-gradient-to-br from-white to-slate-50")}>
            <CardHeader className={cn("pb-4 rounded-t-lg", isDarkMode ? "bg-slate-700 border-b border-slate-600" : "bg-gradient-to-r from-indigo-50 to-purple-50")}>
              <div className="flex items-center justify-between">
                <CardTitle className={cn("text-lg flex items-center gap-3", isDarkMode ? "text-slate-100" : "text-slate-800")}>
                  <div className={cn("p-2 rounded-lg", isDarkMode ? "bg-slate-600" : "bg-indigo-100")}>
                    <Code size={18} className={isDarkMode ? "text-indigo-400" : "text-indigo-600"} />
                  </div>
                  Interactive Study Tool
                </CardTitle>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={downloadingId === message.id}
                      className={cn("hover:bg-slate-50", isDarkMode && "bg-slate-600 text-slate-100 border-slate-500 hover:bg-slate-500")}
                    >
                      {downloadingId === message.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
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
                  <DropdownMenuContent className={isDarkMode ? "bg-slate-700 border-slate-600 text-slate-200" : ""}>
                    <DropdownMenuItem 
                      onClick={() => downloadAsImage(parsedResponse.code!, message.id)}
                      disabled={downloadingId === message.id}
                      className={isDarkMode ? "hover:bg-slate-600" : ""}
                    >
                      <Image size={14} className="mr-2" />
                      Download as PNG
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => downloadAsPDF(parsedResponse.code!, message.id)}
                      disabled={downloadingId === message.id}
                      className={isDarkMode ? "hover:bg-slate-600" : ""}
                    >
                      <FileText size={14} className="mr-2" />
                      Download as PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className={cn("rounded-xl overflow-hidden shadow-inner", isDarkMode ? "border-2 border-slate-600 bg-slate-700" : "border-2 border-slate-200 bg-white")}>
                <iframe
                  srcDoc={parsedResponse.code}
                  className="w-full h-96 border-0"
                  sandbox="allow-scripts"
                  title="Interactive Study Tool"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className={cn(
        "rounded-2xl rounded-tl-md p-6 shadow-sm",
        isDarkMode ? "bg-slate-700 border border-slate-600 text-slate-200" : "bg-gradient-to-r from-white to-blue-50 border border-blue-100"
      )}>
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-lg flex-shrink-0", isDarkMode ? "bg-slate-600" : "bg-blue-100")}>
            <Sparkles size={16} className={isDarkMode ? "text-blue-400" : "text-blue-600"} />
          </div>
          <div className="flex-1">
            <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("flex-1 flex flex-col h-full overflow-hidden", isDarkMode ? "bg-slate-900 text-slate-200" : "bg-gradient-to-br from-slate-50 via-white to-blue-50")}>
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className={cn("p-6 rounded-2xl shadow-lg border max-w-md", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles size={24} className="text-white" />
              </div>
              <h3 className={cn("text-xl font-semibold mb-3", isDarkMode ? "text-slate-100" : "text-slate-800")}>Start Your Conversation</h3>
              <p className={cn("leading-relaxed", isDarkMode ? "text-slate-300" : "text-slate-600")}>
                Ask me anything! I can help you learn, solve problems, or create interactive study materials.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                id={`message-${message.id}`}
                className={cn(
                  "flex flex-col mb-8 transition-all duration-200 group",
                  message.sender === "user" ? "items-end" : "items-start"
                )}
              >
                <div className="flex items-start gap-4 w-full max-w-[95%]">
                  {message.sender === "ai" && (
                    <Avatar className="h-10 w-10 mt-1 flex-shrink-0 shadow-md border-2 border-white">
                      <AvatarImage src="/ai-avatar.png" alt="AI" />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                        AI
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className="flex flex-col w-full">
                    {message.sender === "user" ? (
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-tr-md p-5 ml-auto shadow-lg">
                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      </div>
                    ) : (
                      renderAIMessage(message)
                    )}

                    <div className="flex items-center justify-between mt-3 px-2">
                      <span className={cn("text-xs font-medium", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                        {formatTimestamp(message.timestamp)}
                      </span>

                      {message.sender === "ai" && (
                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn("h-8 w-8 rounded-full", isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-100")}
                                onClick={() => handleStar(message.id, message.starred)}
                                aria-label={message.starred ? "Unstar message" : "Star message"}
                              >
                                <Star
                                  size={14}
                                  className={cn(
                                    "transition-colors duration-200",
                                    message.starred
                                      ? "fill-yellow-500 text-yellow-500"
                                      : isDarkMode ? "text-slate-500 hover:text-yellow-500" : "text-slate-400 hover:text-yellow-500"
                                  )}
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className={isDarkMode ? "bg-slate-700 border-slate-600 text-slate-200" : ""}>
                              {message.starred ? "Remove from starred" : "Add to starred"}
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn("h-8 w-8 rounded-full", isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-100")}
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
                                  <Copy size={14} className={isDarkMode ? "text-slate-500 hover:text-slate-400" : "text-slate-400 hover:text-slate-600"} />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className={isDarkMode ? "bg-slate-700 border-slate-600 text-slate-200" : ""}>
                              {copiedMessageId === message.id ? "Copied!" : "Copy message"}
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn("h-8 w-8 rounded-full", isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-100")}
                                onClick={() => onPlayMessage(message.id, message.content)}
                              >
                                {currentlyPlaying === message.id ? <Pause size={16} /> : <Play size={16} />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className={isDarkMode ? "bg-slate-700 border-slate-600 text-slate-200" : ""}>
                              {currentlyPlaying === message.id ? "Pause" : "Play"}
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
              <div className="flex items-start gap-4 mb-8">
                <Avatar className="h-10 w-10 mt-1 shadow-md border-2 border-white">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                    AI
                  </AvatarFallback>
                </Avatar>
                <div className={cn("border rounded-2xl rounded-tl-md p-6 shadow-sm", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}>
                  <div className="flex items-center gap-3">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                      <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                    </div>
                    <span className={cn("text-sm", isDarkMode ? "text-slate-400" : "text-slate-500")}>AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatArea;
