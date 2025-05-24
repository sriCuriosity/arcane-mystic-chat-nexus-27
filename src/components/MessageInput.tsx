import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Send, PaperclipIcon, Upload,Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const handleFileUpload = () => {
    // Create a hidden file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    
    // Trigger file selection
    input.click();
    
    // Handle file selection
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        // TODO: Handle file upload
        console.log('Selected files:', files);
      }
    };
  };

  const { isDarkMode, toggleTheme } = useTheme();

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
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <PaperclipIcon size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleFileUpload}>
                  <Upload size={16} className="mr-2" />
                  Upload from device
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
