
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ChatPage from "./pages/ChatPage";
import CharacterShowcase from "./pages/CharacterShowcase";
import DomainSelector from "./pages/DomainSelector";
import { AuthPage } from "./pages/AuthPage";
import SettingsPage from "./components/SettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Route */}
              <Route path="/" element={<AuthPage />} />

              {/* Protected Routes */}
              <Route
                path="/DomainSelector"
                element={
                  <ProtectedRoute>
                    <DomainSelector />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/Chat"
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/CharacterShowcase"
                element={
                  <ProtectedRoute>
                    <CharacterShowcase />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
