import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Ferramentas from "./pages/Ferramentas";
import Referencias from "./pages/Referencias";
import Portfolio from "./pages/Portfolio";
import PortfolioPublic from "./pages/PortfolioPublic";
import NotFound from "./pages/NotFound";
import OfflineIndicator from "./components/OfflineIndicator";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <OfflineIndicator />
      <BrowserRouter>
        <PortfolioAccessGuard />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/ferramentas" element={<Ferramentas />} />
          <Route path="/referencias" element={<Referencias />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/portfolio/:username" element={<PortfolioPublic />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
