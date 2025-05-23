import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FilterTag, Message } from "@/types/chat";
import { X, Plus, ChevronLeft, ChevronRight, Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import SearchModal from "./SearchModal";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  starredMessages: Message[];
  messages: Message[];
  onToggleStar: (messageId: string) => void;
  onMessageClick: (messageId: string) => void;
}

const Sidebar = ({ 
  isOpen, 
  toggleSidebar, 
  starredMessages,
  messages,
  onToggleStar,
  onMessageClick
}: SidebarProps) => {
  // Initialize filters from localStorage or use defaults
  const [filterTags, setFilterTags] = useState<FilterTag[]>(() => {
    try {
      const saved = localStorage.getItem("filters");
      const savedFilters: FilterTag[] = saved ? JSON.parse(saved) : [];
      return savedFilters.length > 0 ? savedFilters : [
        { id: "1", label: "Category/Type", type: "category" },
        { id: "2", label: "Visual/Design", type: "visual" },
      ];
    } catch (error) {
      return [
        { id: "1", label: "Category/Type", type: "category" },
        { id: "2", label: "Visual/Design", type: "visual" },
      ];
    }
  });

  const [newFilterValue, setNewFilterValue] = useState("");
  const [isAddingFilter, setIsAddingFilter] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  
  // Initialize selected model from localStorage or use default
  const [selectedModel, setSelectedModel] = useState(() => {
    try {
      return localStorage.getItem("selectedModel") || "GPT-4";
    } catch (error) {
      return "GPT-4";
    }
  });
  
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  const models = ["GPT-4", "Claude-3", "Gemini Pro", "LLaMA 2", "PaLM 2"];

  const addFilter = () => {
    if (newFilterValue.trim()) {
      const newFilter: FilterTag = {
        id: Date.now().toString(),
        label: newFilterValue,
        type: "category",
      };
      const updatedFilters = [...filterTags, newFilter];
      setFilterTags(updatedFilters);
      
      // Save to localStorage
      try {
        localStorage.setItem("filters", JSON.stringify(updatedFilters));
      } catch (error) {
        console.error("Failed to save filters to localStorage:", error);
      }
      
      setNewFilterValue("");
      setIsAddingFilter(false);
    }
  };

  const removeFilter = (id: string) => {
    const updatedFilters = filterTags.filter((tag) => tag.id !== id);
    setFilterTags(updatedFilters);
    
    // Update localStorage
    try {
      localStorage.setItem("filters", JSON.stringify(updatedFilters));
    } catch (error) {
      console.error("Failed to update filters in localStorage:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addFilter();
    } else if (e.key === "Escape") {
      setIsAddingFilter(false);
      setNewFilterValue("");
    }
  };

  const selectModel = (model: string) => {
    setSelectedModel(model);
    
    // Save to localStorage
    try {
      localStorage.setItem("selectedModel", model);
    } catch (error) {
      console.error("Failed to save selected model to localStorage:", error);
    }
    
    setIsModelDropdownOpen(false);
  };

  return (
    <div
      className={cn(
        "flex h-[calc(100vh-4rem)] bg-sidebar relative transition-all duration-300",
        isOpen ? "w-60" : "w-16"
      )}
    >
      <div className="flex flex-col flex-grow">
        {/* Search Button */}
        <div className="p-4 pb-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-full justify-start"
                onClick={() => setIsSearchModalOpen(true)}
              >
                <Search className="h-5 w-5" />
                {isOpen && <span className="ml-2">Search Messages</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Search and view starred messages
            </TooltipContent>
          </Tooltip>
        </div>

        {/* TOP SECTION - Filters */}
        <div className="flex-1 flex flex-col p-4 pt-6 min-h-0">
          <div className="flex items-center justify-between mb-3">
            {isOpen && <span className="text-sm font-medium">Filters</span>}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingFilter(true)}
              className={cn(
                "text-xs h-7",
                !isOpen && "w-full px-2"
              )}
            >
              <Plus size={12} className={isOpen ? "mr-1" : ""} />
              {isOpen && "Add"}
            </Button>
          </div>

          {/* Add Filter Input */}
          {isAddingFilter && (
            <div className="mb-3">
              <input
                type="text"
                value={newFilterValue}
                onChange={(e) => setNewFilterValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                  if (!newFilterValue.trim()) {
                    setIsAddingFilter(false);
                  }
                }}
                placeholder="Add new filter..."
                className="w-full px-2 py-1 text-sm bg-sidebar-accent rounded-md focus:outline-none focus:ring-1 focus:ring-sidebar-ring"
                autoFocus
              />
              <div className="flex gap-1 mt-2">
                <Button
                  size="sm"
                  onClick={addFilter}
                  className="text-xs h-6 px-2"
                >
                  Add
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAddingFilter(false);
                    setNewFilterValue("");
                  }}
                  className="text-xs h-6 px-2"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Scrollable Filter List */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {filterTags.map((tag) => (
              <div
                key={tag.id}
                className={cn(
                  "flex items-center justify-between bg-sidebar-accent rounded-full px-3 py-1.5 text-sm border transition-all duration-200 hover:bg-sidebar-border hover:-translate-y-0.5",
                  !isOpen && "justify-center px-2"
                )}
              >
                {isOpen && <span className="truncate">{tag.label}</span>}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                  onClick={() => removeFilter(tag.id)}
                >
                  <X size={10} />
                </Button>
              </div>
            ))}
            
            {filterTags.length === 0 && isOpen && (
              <div className="text-center text-muted-foreground py-8">
                <div className="text-2xl mb-2 opacity-50">🏷️</div>
                <p className="text-xs">No filters added yet</p>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM SECTION - Model Selector */}
        <div className="p-4 border-t bg-background/50">
          {isOpen && (
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              Model Selection
            </label>
          )}
          <div className="relative">
            <Button
              variant="outline"
              className={cn(
                "w-full justify-between text-sm h-9",
                !isOpen && "px-2"
              )}
              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            >
              <span className={cn("truncate", !isOpen && "sr-only")}>
                {isOpen ? selectedModel : selectedModel.charAt(0)}
              </span>
              <ChevronDown 
                size={14} 
                className={cn(
                  "transition-transform duration-200",
                  isModelDropdownOpen && "rotate-180"
                )} 
              />
            </Button>
            
            {isModelDropdownOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-popover border rounded-md shadow-lg z-10">
                {models.map((model) => (
                  <button
                    key={model}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors",
                      "first:rounded-t-md last:rounded-b-md",
                      selectedModel === model && "bg-accent font-medium"
                    )}
                    onClick={() => selectModel(model)}
                  >
                    {model}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {isOpen && (
            <p className="text-xs text-muted-foreground mt-1">
              Selected: {selectedModel}
            </p>
          )}
        </div>
      </div>

      {/* Toggle Sidebar Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-4 bg-background border rounded-full h-6 w-6"
        onClick={toggleSidebar}
      >
        {isOpen ? (
          <ChevronLeft size={14} />
        ) : (
          <ChevronRight size={14} />
        )}
      </Button>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        messages={messages}
        starredMessages={starredMessages}
        onToggleStar={onToggleStar}
        onMessageClick={onMessageClick}
      />

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--border));
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--border)) / 0.8;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;