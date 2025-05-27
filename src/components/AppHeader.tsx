import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { User, MessageSquare, History, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "@/components/Icons";
import LibraryModal from './LibraryModal';
import Cube3DIcon from './Cube3DIcon';
import { Message } from "@/types/chat";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  messages: Message[];
  onLoadChat: (chatId: string) => void;
  currentChatId: string;
  onNewChat: () => void;
}

const AppHeader = ({ messages, onLoadChat, currentChatId, onNewChat }: AppHeaderProps) => {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  // Get chat histories from localStorage
  const chatHistories = useMemo(() => {
    const histories: { id: string; messages: Message[] }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('chat_')) {
        const chatId = key.replace('chat_', '');
        const messages = localStorage.getItem(key);
        if (messages) {
          histories.push({
            id: chatId,
            messages: JSON.parse(messages)
          });
        }
      }
    }
    return histories.sort((a, b) => {
      const aTime = new Date(a.messages[0]?.timestamp || 0).getTime();
      const bTime = new Date(b.messages[0]?.timestamp || 0).getTime();
      return bTime - aTime;
    });
  }, [messages]);

  return (
    <>
      <header className="fixed top-0 left-0 w-full flex justify-between items-center px-6 py-4 border-b border-border/40 bg-background/80 backdrop-blur-md shadow-sm transition-colors duration-200">
        {/* Left - Brand */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2.5 rounded-xl flex items-center justify-center text-white shadow-lg">
              <MessageSquare size={20} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ChatAI
              </h1>
              <p className="text-xs text-muted-foreground">Intelligent Assistant</p>
            </div>
          </div>
        </div>

        {/* Center - Navigation */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 px-4"
              >
                <History size={16} />
                <span className="hidden sm:inline">History</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-[300px]">
              <div className="flex items-center justify-between p-2">
                <h3 className="font-semibold">Recent Chats</h3>
                <Button variant="outline" size="sm" onClick={onNewChat}>New Chat</Button>
              </div>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-y-auto">
                {chatHistories.map((chat) => {
                  const firstMessage = chat.messages[0];
                  const lastMessage = chat.messages[chat.messages.length - 1];
                  return (
                    <DropdownMenuItem
                      key={chat.id}
                      className={cn(
                        "flex flex-col items-start p-3 cursor-pointer",
                        currentChatId === chat.id && "bg-accent"
                      )}
                      onClick={() => onLoadChat(chat.id)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <MessageSquare size={14} className="text-muted-foreground" />
                        <span className="text-sm font-medium line-clamp-1">
                          {firstMessage?.content.length > 30 
                            ? firstMessage.content.substring(0, 30) + '...' 
                            : firstMessage?.content || 'New Chat'}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground ml-6">
                        {lastMessage?.timestamp 
                          ? new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'No messages'}
                      </span>
                    </DropdownMenuItem>
                  );
                })}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsLibraryOpen(true)}
            className="flex items-center gap-2 px-4"
          >
            <BookOpen size={16} />
            <span className="hidden sm:inline">Library</span>
          </Button>
        </div>

        {/* Right - User Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-slate-700" />
            )}
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 p-0 [&_svg]:!size-8"
            onClick={() => navigate("/")}
          >
            <Cube3DIcon />
          </Button>

          <div className="bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full w-9 h-9 flex items-center justify-center text-white cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105" 
          onClick={() => navigate("/CharacterShowcase")}
          >
            🤖
          </div>
        </div>
      </header>

      <LibraryModal 
        isOpen={isLibraryOpen} 
        onClose={() => setIsLibraryOpen(false)} 
      />
    </>
  );
};

export default AppHeader;
