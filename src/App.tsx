
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CreateChildProfile from "./pages/CreateChildProfile";
import StartAdventure from "./pages/StartAdventure";
import FinishSubscription from "./pages/FinishSubscription";
import ConfirmationPage from "./pages/ConfirmationPage";
import FamilyDashboard from "./pages/FamilyDashboard";

const App = () => {
  // Créer une nouvelle instance de QueryClient à l'intérieur du composant fonctionnel
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/creer-profil-enfant" element={<CreateChildProfile />} />
            <Route path="/pret-a-demarrer" element={<StartAdventure />} />
            <Route path="/finaliser-abonnement" element={<FinishSubscription />} />
            <Route path="/confirmation-abonnement" element={<ConfirmationPage />} />
            <Route path="/espace-famille" element={<FamilyDashboard />} />
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
};

export default App;
