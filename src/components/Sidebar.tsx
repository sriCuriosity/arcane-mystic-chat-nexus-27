
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FilterTag } from "@/types/chat";
import { X, Plus, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const [filterTags, setFilterTags] = useState<FilterTag[]>([
    { id: "1", label: "Category/Type", type: "category" },
    { id: "2", label: "Visual/Design", type: "visual" },
  ]);
  const [newFilterValue, setNewFilterValue] = useState("");
  const [isAddingFilter, setIsAddingFilter] = useState(false);

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
        <div className="flex items-center mb-6">
          <Star className="text-yellow-500 mr-2" size={20} />
          {isOpen && <span className="text-sm font-medium">Starred messages</span>}
        </div>

        <div className="mb-4">
          {isOpen ? (
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground">FILTERS</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsAddingFilter(true)}
              >
                <Plus size={14} />
              </Button>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 mb-2"
                  onClick={() => setIsAddingFilter(true)}
                >
                  <Plus size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Add filter</TooltipContent>
            </Tooltip>
          )}

          {isAddingFilter && isOpen && (
            <div className="mb-3 flex">
              <input
                type="text"
                value={newFilterValue}
                onChange={(e) => setNewFilterValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add filter..."
                className="w-full rounded border bg-secondary border-border px-2 py-1 text-sm"
                autoFocus
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            {filterTags.map((tag) => (
              <div key={tag.id} className={cn("filter-tag", !isOpen && "w-8 h-8 p-0 justify-center")}>
                {isOpen ? (
                  <>
                    <span>{tag.label}</span>
                    <button
                      className="ml-auto text-xs hover:text-white"
                      onClick={() => removeFilter(tag.id)}
                    >
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-xs">{tag.label.charAt(0)}</span>
                    </TooltipTrigger>
                    <TooltipContent side="right">{tag.label}</TooltipContent>
                  </Tooltip>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 rounded-full bg-arcane hover:bg-arcane-hover z-10"
        onClick={toggleSidebar}
        aria-label={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
      >
        {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </Button>
    </div>
  );
};

export default Sidebar;
