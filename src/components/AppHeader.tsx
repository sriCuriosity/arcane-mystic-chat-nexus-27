import { useState } from "react";
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

interface AppHeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  messages: Message[];
}

const AppHeader = ({ onToggleSidebar, sidebarOpen, messages }: AppHeaderProps) => {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  const toggleHistory = () => {
    if (isLibraryOpen) setIsLibraryOpen(false);
    setHistoryOpen(!historyOpen);
  };

  const toggleLibrary = () => {
    if (historyOpen) setHistoryOpen(false);
    setIsLibraryOpen(!isLibraryOpen);
  };

  return (
    <>
      <header className="flex justify-between items-center px-6 py-4 border-b border-border/40 bg-background/80 backdrop-blur-md shadow-sm transition-colors duration-200">
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
          <Button
            variant={historyOpen ? "secondary" : "ghost"}
            size="sm"
            onClick={toggleHistory}
            className="flex items-center gap-2 px-4"
          >
            <History size={16} />
            <span className="hidden sm:inline">History</span>
          </Button>

          <Button
            variant={isLibraryOpen ? "secondary" : "ghost"}
            size="sm"
            onClick={toggleLibrary}
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

      {/* History Panel */}
      {historyOpen && (
        <div className="border-b border-border/40 bg-background/95 backdrop-blur-sm animate-in slide-in-from-top-2 duration-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Recent Messages</h3>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {messages
                .filter(msg => msg.sender === "user")
                .slice(-3)
                .reverse()
                .map((message, i) => (
                  <div 
                    key={message.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer group mb-2"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium line-clamp-1">{message.content}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <MessageSquare size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      <LibraryModal 
        isOpen={isLibraryOpen} 
        onClose={() => setIsLibraryOpen(false)} 
      />
    </>
  );
};

export default AppHeader;
