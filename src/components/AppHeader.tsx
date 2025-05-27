import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { User, MessageSquare, History, BookOpen, Folder, Plus, FolderOpen, Edit3, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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

interface ChatFolder {
  id: string;
  name: string;
  chats: { id: string; messages: Message[] }[];
  createdAt: string;
}

const AppHeader = ({ messages, onLoadChat, currentChatId, onNewChat }: AppHeaderProps) => {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState("");
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  // Get active folder from localStorage
  const getActiveFolder = () => {
    return localStorage.getItem('activeFolderId') || 'default';
  };

  const [activeFolderId, setActiveFolderId] = useState(getActiveFolder());

  // Get folders and organize chats
  const { folders, unorganizedChats } = useMemo(() => {
    const savedFolders = JSON.parse(localStorage.getItem('chatFolders') || '[]') as ChatFolder[];
    
    // Ensure default folder exists
    const defaultFolder: ChatFolder = {
      id: 'default',
      name: 'General',
      chats: [],
      createdAt: new Date().toISOString()
    };

    // Get all chats from localStorage
    const allChats: { id: string; messages: Message[]; folderId?: string }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('chat_')) {
        const chatId = key.replace('chat_', '');
        const chatData = localStorage.getItem(key);
        if (chatData) {
          const parsedData = JSON.parse(chatData);
          // Check if this is the new format with folder info
          if (parsedData.messages && Array.isArray(parsedData.messages)) {
            allChats.push({
              id: chatId,
              messages: parsedData.messages,
              folderId: parsedData.folderId || 'default'
            });
          } else {
            // Old format - just messages array
            allChats.push({
              id: chatId,
              messages: parsedData,
              folderId: 'default'
            });
          }
        }
      }
    }

    // Organize chats into folders
    const foldersMap = new Map<string, ChatFolder>();
    foldersMap.set('default', defaultFolder);
    
    savedFolders.forEach(folder => {
      foldersMap.set(folder.id, { ...folder, chats: [] });
    });

    // Sort chats by timestamp
    allChats.sort((a, b) => {
      const aTime = new Date(a.messages[0]?.timestamp || 0).getTime();
      const bTime = new Date(b.messages[0]?.timestamp || 0).getTime();
      return bTime - aTime;
    });

    // Assign chats to folders
    allChats.forEach(chat => {
      const folderId = chat.folderId || 'default';
      const folder = foldersMap.get(folderId);
      if (folder) {
        folder.chats.push({ id: chat.id, messages: chat.messages });
      }
    });

    return {
      folders: Array.from(foldersMap.values()),
      unorganizedChats: []
    };
  }, [messages, activeFolderId]);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: ChatFolder = {
        id: Date.now().toString(),
        name: newFolderName.trim(),
        chats: [],
        createdAt: new Date().toISOString()
      };

      const savedFolders = JSON.parse(localStorage.getItem('chatFolders') || '[]');
      savedFolders.push(newFolder);
      localStorage.setItem('chatFolders', JSON.stringify(savedFolders));

      setNewFolderName("");
      setIsCreatingFolder(false);
    }
  };

  const handleEditFolder = (folderId: string, newName: string) => {
    if (newName.trim() && folderId !== 'default') {
      const savedFolders = JSON.parse(localStorage.getItem('chatFolders') || '[]');
      const updatedFolders = savedFolders.map((folder: ChatFolder) =>
        folder.id === folderId ? { ...folder, name: newName.trim() } : folder
      );
      localStorage.setItem('chatFolders', JSON.stringify(updatedFolders));
      setEditingFolderId(null);
      setEditingFolderName("");
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    if (folderId === 'default') return;

    // Move all chats from deleted folder to default
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      folder.chats.forEach(chat => {
        const chatData = {
          messages: chat.messages,
          folderId: 'default'
        };
        localStorage.setItem(`chat_${chat.id}`, JSON.stringify(chatData));
      });
    }

    const savedFolders = JSON.parse(localStorage.getItem('chatFolders') || '[]');
    const updatedFolders = savedFolders.filter((folder: ChatFolder) => folder.id !== folderId);
    localStorage.setItem('chatFolders', JSON.stringify(updatedFolders));

    if (activeFolderId === folderId) {
      setActiveFolderId('default');
      localStorage.setItem('activeFolderId', 'default');
    }
  };

  const handleSelectFolder = (folderId: string) => {
    setActiveFolderId(folderId);
    localStorage.setItem('activeFolderId', folderId);
  };

  const handleNewChat = () => {
    // Save current chat to active folder if it has messages
    if (messages.length > 0 && currentChatId) {
      const chatData = {
        messages: messages,
        folderId: activeFolderId
      };
      localStorage.setItem(`chat_${currentChatId}`, JSON.stringify(chatData));
    }
    
    // Set the active folder for new chats
    localStorage.setItem('newChatFolderId', activeFolderId);
    
    // Call the original onNewChat
    onNewChat();
  };

  const handleLoadChat = (chatId: string) => {
    // Save current chat before loading new one
    if (messages.length > 0 && currentChatId && currentChatId !== chatId) {
      const chatData = {
        messages: messages,
        folderId: activeFolderId
      };
      localStorage.setItem(`chat_${currentChatId}`, JSON.stringify(chatData));
    }
    
    onLoadChat(chatId);
  };

  // Helper function to save chat with current active folder
  const saveChatToActiveFolder = (chatId: string, chatMessages: Message[]) => {
    const chatData = {
      messages: chatMessages,
      folderId: activeFolderId
    };
    localStorage.setItem(`chat_${chatId}`, JSON.stringify(chatData));
  };

  // Expose this function to parent component if needed
  React.useEffect(() => {
    // Store the save function globally so other components can use it
    (window as any).saveChatToActiveFolder = saveChatToActiveFolder;
  }, [activeFolderId]);

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
            <DropdownMenuContent align="center" className="w-[380px]">
              <div className="flex items-center justify-between p-3 border-b">
                <h3 className="font-semibold">Chat History</h3>
                <Button variant="outline" size="sm" onClick={handleNewChat}>
                  New Chat
                </Button>
              </div>

              {/* Folder Management */}
              <div className="p-3 border-b">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">Folders</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCreatingFolder(true)}
                    className="h-6 w-6 p-0"
                  >
                    <Plus size={12} />
                  </Button>
                </div>

                {/* Create new folder input */}
                {isCreatingFolder && (
                  <div className="flex items-center gap-2 mb-2">
                    <Input
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Folder name"
                      className="h-7 text-xs"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateFolder();
                        if (e.key === 'Escape') {
                          setIsCreatingFolder(false);
                          setNewFolderName("");
                        }
                      }}
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={handleCreateFolder}
                    >
                      <Check size={10} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => {
                        setIsCreatingFolder(false);
                        setNewFolderName("");
                      }}
                    >
                      <X size={10} />
                    </Button>
                  </div>
                )}

                {/* Folder List */}
                <div className="space-y-1 max-h-[120px] overflow-y-auto">
                  {folders.map((folder) => (
                    <div
                      key={folder.id}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-200 group",
                        activeFolderId === folder.id
                          ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200 shadow-lg shadow-blue-500/20"
                          : "hover:bg-accent/50"
                      )}
                      onClick={() => handleSelectFolder(folder.id)}
                    >
                      <div className="flex items-center gap-2">
                        {activeFolderId === folder.id ? (
                          <FolderOpen 
                            size={14} 
                            className={cn(
                              "text-blue-600 drop-shadow-sm",
                              activeFolderId === folder.id && "animate-pulse"
                            )} 
                          />
                        ) : (
                          <Folder size={14} className="text-muted-foreground" />
                        )}
                        
                        {editingFolderId === folder.id ? (
                          <Input
                            value={editingFolderName}
                            onChange={(e) => setEditingFolderName(e.target.value)}
                            className="h-6 text-xs w-24"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleEditFolder(folder.id, editingFolderName);
                              if (e.key === 'Escape') {
                                setEditingFolderId(null);
                                setEditingFolderName("");
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <span 
                            className={cn(
                              "text-xs font-medium",
                              activeFolderId === folder.id ? "text-blue-700 font-semibold" : "text-foreground"
                            )}
                          >
                            {folder.name}
                          </span>
                        )}
                        
                        <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                          {folder.chats.length}
                        </Badge>
                      </div>

                      {folder.id !== 'default' && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {editingFolderId === folder.id ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditFolder(folder.id, editingFolderName);
                                }}
                              >
                                <Check size={8} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingFolderId(null);
                                  setEditingFolderName("");
                                }}
                              >
                                <X size={8} />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingFolderId(folder.id);
                                  setEditingFolderName(folder.name);
                                }}
                              >
                                <Edit3 size={8} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 text-red-500 hover:text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteFolder(folder.id);
                                }}
                              >
                                <X size={8} />
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat History for Active Folder */}
              <div className="max-h-[300px] overflow-y-auto">
                <div className="p-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {folders.find(f => f.id === activeFolderId)?.name || 'General'} Chats
                    </span>
                  </div>
                  
                  {folders.find(f => f.id === activeFolderId)?.chats.length === 0 ? (
                    <div className="text-center py-4 text-xs text-muted-foreground">
                      No chats in this folder
                    </div>
                  ) : (
                    folders.find(f => f.id === activeFolderId)?.chats.map((chat) => {
                      const firstMessage = chat.messages[0];
                      const lastMessage = chat.messages[chat.messages.length - 1];
                      return (
                        <DropdownMenuItem
                          key={chat.id}
                          className={cn(
                            "flex flex-col items-start p-3 cursor-pointer",
                            currentChatId === chat.id && "bg-accent"
                          )}
                          onClick={() => handleLoadChat(chat.id)}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <MessageSquare size={12} className="text-muted-foreground" />
                            <span className="text-xs font-medium line-clamp-1">
                              {firstMessage?.content.length > 30 
                                ? firstMessage.content.substring(0, 30) + '...' 
                                : firstMessage?.content || 'New Chat'}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground ml-4">
                            {lastMessage?.timestamp 
                              ? new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : 'No messages'}
                          </span>
                        </DropdownMenuItem>
                      );
                    })
                  )}
                </div>
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