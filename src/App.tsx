
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './App.css'
import { Toaster } from "sonner"
import { AuthProvider } from './hooks/useAuth'

const queryClient = new QueryClient();
import AuthGuard from './components/AuthGuard'
import RouteGuard from './components/RouteGuard'
import SubscriptionGuard from './components/SubscriptionGuard'
import DevMenu from './components/DevMenu'
import ErrorBoundary from './components/util/ErrorBoundary'
import ScrollToTop from './components/ScrollToTop'

// Auth Components - Import at the TOP LEVEL to ensure bundling
import Callback from './pages/auth/Callback'
// 🔧 Force Callback.tsx inclusion
console.log("✅ App.tsx: Callback component forcé dans le bundle");
import LoadingCallback from './components/auth/LoadingCallback'
import CallbackDummy from './pages/debug/CallbackDummy'

// Pages
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import CreateChildProfile from './pages/CreateChildProfile'
import NouvelEnfant from './pages/NouvelEnfant'
import FinishSubscription from './pages/FinishSubscription'
import ConfirmationPage from './pages/ConfirmationPage'
import ConfirmationAbonnement from './pages/ConfirmationAbonnement'
import FamilyDashboard from './pages/FamilyDashboard'
import Authentication from './pages/Authentication'
import Abonnement from './pages/Abonnement'
import ComingSoon from './components/ComingSoon'
import APropos from './pages/APropos'

import CheckEmail from './pages/CheckEmail'
import ResetPassword from './pages/ResetPassword'

// Gift Flow Pages
import OffrirLivre from './pages/OffrirLivre'
import OffrirProfilEnfant from './pages/OffrirProfilEnfant'
import OffrirTheme from './pages/OffrirTheme'
import OffrirMessage from './pages/OffrirMessage'
import OffrirLivraison from './pages/OffrirLivraison'
import OffrirConfirmation from './pages/OffrirConfirmation'
import ModifierProche from './pages/ModifierProche'
import ModifierAnimal from './pages/ModifierAnimal'
import AjouterAnimal from './pages/AjouterAnimal'
import AjouterProche from './pages/AjouterProche'
import AjouterLieu from './pages/AjouterLieu'
import ModifierLieu from './pages/ModifierLieu'
import NosHistoires from './pages/NosHistoires'

function App() {
  const isDev = false; // Protection activée en production
  console.log('App loaded, Auth components available:', 
    !!LoadingCallback, 
    !!Callback, 
    'LoadingCallback path:', LoadingCallback ? 'components/auth/LoadingCallback' : 'not found'
  );

  return (
    <QueryClientProvider client={queryClient}>
    <ErrorBoundary fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Une erreur est survenue</h1>
          <p className="text-muted-foreground mb-4">
            L'application a rencontré une erreur. Veuillez rafraîchir la page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Rafraîchir la page
          </button>
        </div>
      </div>
    }>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <div>
            <Routes>
              {/* Auth callback route - explicitly defined FIRST in the routes for priority */}
              <Route path="/auth/callback" element={<Callback />} />
              
              {/* Debug route for testing Callback component */}
              <Route path="/debug/callback" element={<CallbackDummy />} />
              
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/histoires" element={<NosHistoires />} />
              <Route path="/authentification" element={<Authentication />} />
              <Route path="/check-email" element={<CheckEmail />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Routes nécessitant l'authentification mais pas d'abonnement */}
              <Route path="/creer-profil-enfant" element={
                <RouteGuard bypassProtection={isDev}>
                  <NouvelEnfant />
                </RouteGuard>
              } />
              <Route path="/abonnement" element={<Abonnement />} />
              
              {/* Protected routes - require authentication */}
              <Route path="/finaliser-abonnement" element={
                <AuthGuard>
                  <FinishSubscription />
                </AuthGuard>
              } />
              <Route path="/confirmation" element={
                <AuthGuard>
                  <ConfirmationAbonnement />
                </AuthGuard>
              } />
              <Route path="/confirmation-profil" element={
                <AuthGuard>
                  <ConfirmationPage />
                </AuthGuard>
              } />
              <Route path="/espace-famille" element={
                <AuthGuard>
                  <FamilyDashboard />
                </AuthGuard>
              } />
              <Route path="/modifier-proche/:childId/:relativeId" element={
                <AuthGuard>
                  <ModifierProche />
                </AuthGuard>
              } />
              <Route path="/modifier-animal/:childId/:petId" element={
                <AuthGuard>
                  <ModifierAnimal />
                </AuthGuard>
              } />
              <Route path="/ajouter-proche" element={
                <AuthGuard>
                  <AjouterProche />
                </AuthGuard>
              } />
              <Route path="/ajouter-proche/:childId" element={
                <AuthGuard>
                  <AjouterProche />
                </AuthGuard>
              } />
              <Route path="/ajouter-animal" element={
                <AuthGuard>
                  <AjouterAnimal />
                </AuthGuard>
              } />
              <Route path="/ajouter-animal/:childId" element={
                <AuthGuard>
                  <AjouterAnimal />
                </AuthGuard>
              } />
              <Route path="/ajouter-lieu" element={
                <AuthGuard>
                  <AjouterLieu />
                </AuthGuard>
              } />
              <Route path="/ajouter-lieu/:childId" element={
                <AuthGuard>
                  <AjouterLieu />
                </AuthGuard>
              } />
              <Route path="/modifier-lieu/:childId/:placeId" element={
                <AuthGuard>
                  <ModifierLieu />
                </AuthGuard>
              } />

              {/* Debug route for testing Supabase */}

              {/* Gift book flow routes */}
              <Route path="/offrir-livre" element={<OffrirLivre />} />
              <Route path="/offrir/profil-enfant" element={
                <RouteGuard bypassProtection={isDev}>
                  <OffrirProfilEnfant />
                </RouteGuard>
              } />
              <Route path="/offrir/theme" element={<OffrirTheme />} />
              <Route path="/offrir/message" element={<OffrirMessage />} />
              <Route path="/offrir/livraison" element={
                <AuthGuard>
                  <OffrirLivraison />
                </AuthGuard>
              } />
              <Route path="/offrir/confirmation" element={
                <AuthGuard>
                  <OffrirConfirmation />
                </AuthGuard>
              } />
              
              {/* Routes nécessitant un abonnement actif */}
              <Route path="/mon-abonnement" element={
                <SubscriptionGuard>
                  <Abonnement />
                </SubscriptionGuard>
              } />
              
              {/* Pages à venir */}
              <Route path="/fonctionnement" element={<ComingSoon />} />
              <Route path="/a-propos" element={<APropos />} />
              <Route path="/faq" element={<ComingSoon />} />
              <Route path="/contact" element={<ComingSoon />} />
              <Route path="/blog" element={<ComingSoon />} />
              <Route path="/conditions-generales" element={<ComingSoon />} />
              <Route path="/confidentialite" element={<ComingSoon />} />
              <Route path="/livraison" element={<ComingSoon />} />

              <Route path="*" element={<ComingSoon />} />
            </Routes>
            
            {isDev && <DevMenu />}
            
            <Toaster 
              richColors 
              position="top-center"
              closeButton
            />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
    </QueryClientProvider>
  )
}

export default App
