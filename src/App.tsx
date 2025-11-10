import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { DataProvider } from "@/contexts/DataContext";
import { AppLayout } from "@/layouts/AppLayout";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import DoctorDebug from "./pages/DoctorDebug";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DataProvider>
      <TooltipProvider>
        <Toaster
          position="top-right"
          theme="dark"
          richColors
          closeButton
          expand
          visibleToasts={3}
          toastOptions={{
            duration: 2200,
            className:
              "rounded-xl border border-white/10 bg-[var(--modal-bg,#0F1117)] text-white shadow-xl",
            style: {
              boxShadow: "0 10px 30px rgba(0,0,0,.35)",
              backdropFilter: "blur(6px)",
            },
          }}
        />
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/debug/doctor" element={<DoctorDebug />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </DataProvider>
  </QueryClientProvider>
);

export default App;
