
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/histoires" element={<NotFound />} />
          <Route path="/fonctionnement" element={<NotFound />} />
          <Route path="/abonnement" element={<NotFound />} />
          <Route path="/commencer" element={<NotFound />} />
          <Route path="/offrir" element={<NotFound />} />
          <Route path="/a-propos" element={<NotFound />} />
          <Route path="/faq" element={<NotFound />} />
          <Route path="/contact" element={<NotFound />} />
          <Route path="/blog" element={<NotFound />} />
          <Route path="/conditions-generales" element={<NotFound />} />
          <Route path="/confidentialite" element={<NotFound />} />
          <Route path="/livraison" element={<NotFound />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
