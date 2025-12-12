import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, useTheme } from "next-themes";
import { DataProvider } from "@/contexts/DataContext";
import { AppLayout } from "@/layouts/AppLayout";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import DoctorDebug from "./pages/DoctorDebug";
import NotFound from "./pages/NotFound";
import SunoAiPromptMaker from "./pages/SunoAiPromptMaker";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

function ThemedToaster() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const currentTheme = theme === 'system' ? systemTheme : theme;

  return (
    <Toaster
      position="top-right"
      theme={currentTheme as "light" | "dark"}
      richColors
      closeButton
      expand
      visibleToasts={3}
      toastOptions={{
        duration: 2200,
        className:
          "rounded-xl border border-border bg-card text-card-foreground shadow-xl",
        style: {
          boxShadow: "0 10px 30px rgba(0,0,0,.35)",
          backdropFilter: "blur(6px)",
        },
      }}
    />
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider 
      attribute="class"
      defaultTheme="light"
      storageKey="youtube-analyzer-theme"
    >
      <DataProvider>
        <TooltipProvider>
          <ThemedToaster />
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/analytics/channel" replace />} />
              <Route path="/analytics/channel" element={<Index />} />
              <Route path="/analytics/video" element={<Index />} />
              <Route path="/analytics/compare" element={<Index />} />
              <Route path="/work-tool/suno-ai-prompt-maker" element={<SunoAiPromptMaker />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/debug/doctor" element={<DoctorDebug />} />
              <Route path="*" element={<Navigate to="/analytics/channel" replace />} />
            </Route>
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </DataProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
