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
import CollectionPublic from "./pages/CollectionPublic";
import NotFound from "./pages/NotFound";
import PublicPortfolio404 from "./components/PublicPortfolio404";
import OfflineIndicator from "./components/OfflineIndicator";
import { AuthProvider } from "@/hooks/useAuth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <OfflineIndicator />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/ferramentas" element={<Ferramentas />} />
            <Route path="/referencias" element={<Referencias />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/portfolio/:username" element={<PortfolioPublic />} />
            <Route path="/c/:username/:slug" element={<CollectionPublic />} />
            {/* Isolated public 404 for portfolio/collection links — MUST stay
                above the global catch-all so a broken link never leaks the acervo. */}
            <Route path="/c/*" element={<PublicPortfolio404 />} />
            <Route path="/portfolio/*" element={<PublicPortfolio404 />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
