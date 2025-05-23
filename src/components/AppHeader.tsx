import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sun,
  Moon,
  ChevronDown,
  Settings,
  History,
  LogOut,
  HelpCircle,
  ThumbsUp,
} from "lucide-react";

const AppHeader = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  return (
    <header className="flex justify-between items-center px-6 py-4 border-b border-border bg-background">
      {/* Left - Logo */}
      <div className="flex items-center gap-2">
        <div className="bg-arcane p-2 rounded-md flex items-center justify-center">
          <span className="text-white font-bold">AL</span>
        </div>
        <h1 className="text-xl font-bold text-arcane">Arcane Luminaries</h1>
      </div>

      {/* Right - Controls */}
      <div className="flex items-center gap-4">
        {/* History Dropdown */}
        <DropdownMenu open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-1">
              History
              <ChevronDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Recent</DropdownMenuLabel>
            <DropdownMenuItem>
              <History size={14} className="mr-2" />
              Solar Design Search
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Past</DropdownMenuLabel>
            <DropdownMenuItem>
              <Moon size={14} className="mr-2" />
              Dark Mode Research
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Library Dropdown */}
        <DropdownMenu open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-1">
              Library
              <ChevronDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Saved Templates</DropdownMenuItem>
            <DropdownMenuItem>Favorite Layouts</DropdownMenuItem>
            <DropdownMenuItem>My Collections</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Help & Feedback */}
        <Button variant="ghost" size="icon">
          <HelpCircle size={18} />
        </Button>

        <Button variant="ghost" size="icon">
          <ThumbsUp size={18} />
        </Button>

        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </Button>

        {/* 🤖 Character Button */}
        <div
          className="bg-arcane rounded-full w-8 h-8 flex items-center justify-center text-white cursor-pointer"
          onClick={() => navigate("/CharacterShowcase")}
        >
          🤖
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
