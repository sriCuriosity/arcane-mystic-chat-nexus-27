
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sun, Moon, ChevronDown, Settings, History, LogOut, HelpCircle, ThumbsUp } from "lucide-react";

const AppHeader = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  return (
    <header className="flex justify-between items-center px-6 py-4 border-b border-border bg-background">
      <div className="flex items-center gap-2">
        <div className="bg-arcane p-2 rounded-md flex items-center justify-center">
          <span className="text-white font-bold">AL</span>
        </div>
        <h1 className="text-xl font-bold text-arcane">Arcane Luminaries</h1>
      </div>

      <div className="flex items-center gap-4">
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

        <Button variant="ghost" size="icon">
          <HelpCircle size={18} />
        </Button>

        <Button variant="ghost" size="icon">
          <ThumbsUp size={18} />
        </Button>

        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage src="" />
              <AvatarFallback className="bg-arcane text-white">AL</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Settings size={14} className="mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <History size={14} className="mr-2" />
              History
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut size={14} className="mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AppHeader;
