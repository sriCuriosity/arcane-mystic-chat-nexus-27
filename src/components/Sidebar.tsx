import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FilterTag, Message } from "@/types/chat";
import { X, Plus, ChevronLeft, ChevronRight, Search } from "lucide-react";
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
  const [filterTags, setFilterTags] = useState<FilterTag[]>([
    { id: "1", label: "Category/Type", type: "category" },
    { id: "2", label: "Visual/Design", type: "visual" },
  ]);
  const [newFilterValue, setNewFilterValue] = useState("");
  const [isAddingFilter, setIsAddingFilter] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const addFilter = () => {
    if (newFilterValue.trim()) {
      setFilterTags([
        ...filterTags,
        {
          id: Date.now().toString(),
          label: newFilterValue,
          type: "category",
        },
      ]);
      setNewFilterValue("");
      setIsAddingFilter(false);
    }
  };

  const removeFilter = (id: string) => {
    setFilterTags(filterTags.filter((tag) => tag.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addFilter();
    } else if (e.key === "Escape") {
      setIsAddingFilter(false);
      setNewFilterValue("");
    }
  };

  return (
    <div
      className={cn(
        "flex h-[calc(100vh-4rem)] bg-sidebar relative transition-all duration-300",
        isOpen ? "w-60" : "w-16"
      )}
    >
      <div className="flex flex-col flex-grow p-4 overflow-y-auto">
        {/* Search Button */}
        <div className="mb-6">
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

        {/* Filter Tags Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            {isOpen && <span className="text-sm font-medium">Filter Tags</span>}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsAddingFilter(true)}
              className={cn(!isOpen && "w-full")}
            >
              <Plus size={16} />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {filterTags.map((tag) => (
              <div
                key={tag.id}
                className={cn(
                  "filter-tag",
                  !isOpen && "w-full justify-center"
                )}
              >
                {isOpen && <span>{tag.label}</span>}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1"
                  onClick={() => removeFilter(tag.id)}
                >
                  <X size={12} />
                </Button>
              </div>
            ))}
          </div>

          {isAddingFilter && (
            <div className="mt-2">
              <input
                type="text"
                value={newFilterValue}
                onChange={(e) => setNewFilterValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add new filter..."
                className="w-full px-2 py-1 text-sm bg-sidebar-accent rounded-md focus:outline-none focus:ring-1 focus:ring-sidebar-ring"
                autoFocus
              />
            </div>
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
    </div>
  );
};

export default Sidebar;
