
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Send, Smile, PaperclipIcon } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isEmpty?: boolean;
}

const MessageInput = ({ onSendMessage, isEmpty = false }: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "24px";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = scrollHeight + "px";
    }
  }, [message]);

  return (
    <div className={`transition-all duration-300 ${isEmpty 
      ? 'max-w-2xl w-full mx-auto px-4'
      : 'border-t border-border bg-transparent w-full fixed bottom-0 left-0 right-0 p-4'}`}
    >
      <div className="relative w-full bg-background border border-input rounded-2xl shadow-sm max-w-3xl mx-auto">
        <div className="flex items-start space-x-2 px-4 py-3">
          <div className="flex-1 max-h-52 overflow-y-auto">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a message"
              className="w-full outline-none resize-none text-sm bg-transparent border-0 focus:ring-0 p-0 min-h-[24px] max-h-[200px]"
              style={{ overflow: message.split('\n').length > 5 ? 'auto' : 'hidden' }}
              rows={1}
            />
          </div>
          <div className="flex items-center gap-1 pt-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Smile size={18} className="text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Insert emoji</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <PaperclipIcon size={18} className="text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Attach file</TooltipContent>
            </Tooltip>
            <Button
              onClick={handleSend}
              size="icon"
              disabled={!message.trim()}
              className="bg-arcane hover:bg-arcane-hover text-white rounded-lg ml-1"
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;