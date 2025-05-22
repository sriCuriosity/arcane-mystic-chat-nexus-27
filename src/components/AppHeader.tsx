import { useState } from "react";
import { User } from "lucide-react"; // for user icon
import { Moon, Sun, Send, ChevronLeft, ChevronDown } from "./Icons"; // your icons

const AppHeader = () => {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleHistory = () => {
    if (libraryOpen) setLibraryOpen(false);
    setHistoryOpen(!historyOpen);
  };

  const toggleLibrary = () => {
    if (historyOpen) setHistoryOpen(false);
    setLibraryOpen(!libraryOpen);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <>
      <header className="flex justify-between items-center px-6 py-4 border-b border-border bg-background">
        {/* Left */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="bg-arcane p-2 rounded-md flex items-center justify-center text-white">
              <User size={20} />
            </div>
          </div>
        </div>

        {/* Center */}
        <div className="flex justify-center gap-4 flex-1 max-w-xs">
          <div
            className={`flex items-center gap-1 cursor-pointer px-3 py-2 rounded ${
              historyOpen ? "bg-muted" : ""
            }`}
            onClick={toggleHistory}
          >
            History <ChevronDown />
          </div>

          <div
            className={`flex items-center gap-1 cursor-pointer px-3 py-2 rounded ${
              libraryOpen ? "bg-muted" : ""
            }`}
            onClick={toggleLibrary}
          >
            Library <ChevronDown />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <button className="action-button" aria-label="Help">
            <Send />
          </button>
          <div className="character-logo bg-arcane rounded-full w-8 h-8 flex items-center justify-center text-white cursor-pointer select-none">
            🤖
          </div>
        </div>
      </header>

      {/* History Panel */}
      {historyOpen && (
        <div className="p-4 border-t border-border bg-background bg-opacity-90 backdrop-blur-sm">
          <div className="font-semibold mb-2">History</div>
          <div className="space-y-3">
            {[
              "How can I optimize my React application?",
              "What are the best practices for CSS Grid?",
              "Tell me about React hooks",
              "How to implement dark mode in React?",
              "What is the difference between useState and useReducer?",
            ].map((query, i) => (
              <div key={i} className="flex flex-col text-left space-y-1">
                <span className="text-xs opacity-70">{`${(i + 1) * 3}m ago`}</span>
                <span className="text-sm">{query}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Library Panel */}
      {libraryOpen && (
        <div className="p-4 border-t border-border bg-background">
          <div className="font-semibold mb-2">Image Library</div>
          <div className="grid grid-cols-4 gap-2">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center h-16 bg-muted rounded-md text-sm text-muted-foreground"
                >
                  Image {i + 1}
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );
};

export default AppHeader;
