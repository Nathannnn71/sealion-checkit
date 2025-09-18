import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignUp from "./pages/SignUp";
import AccountPurpose from "./pages/AccountPurpose";
import LanguageSelection from "./pages/LanguageSelection";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Assignment from "./pages/Assignment";
import EssayChecker from "./components/EssayChecker";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/account-purpose" element={<AccountPurpose />} />
          <Route path="/language-selection" element={<LanguageSelection />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assignment/:id" element={<Assignment />} />
          <Route path="/essay-checker" element={<EssayChecker />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
