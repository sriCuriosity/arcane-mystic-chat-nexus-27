
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Send, Smile, PaperclipIcon } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

const MessageInput = ({ onSendMessage }: MessageInputProps) => {
  const [message, setMessage] = useState("");

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

  return (
    <div className="border-t border-border p-4 bg-background">
      <div className="flex items-center gap-2 max-w-3xl mx-auto">
        <div className="flex-grow relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full h-10 py-2 px-4 pr-20 bg-secondary rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-arcane"
            rows={1}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Smile size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Insert emoji</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <PaperclipIcon size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Attach file</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <Button
          onClick={handleSend}
          size="icon" 
          disabled={!message.trim()}
          className="bg-arcane hover:bg-arcane-hover text-white"
        >
          <Send size={18} />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
