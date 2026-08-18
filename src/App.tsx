// App v1.1
// Changelog v1.1 : retrait de DEUX routes mortes et dangereuses, /finaliser-abonnement
//   et /confirmation-profil. Toutes deux protégées par AuthGuard, donc atteignables par
//   n'importe quel parent connecté tapant l'URL. Détail dans les commentaires en place.
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
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
import ConfirmationAbonnement from './pages/ConfirmationAbonnement'
import FamilyDashboard from './pages/FamilyDashboard'
import Authentication from './pages/Authentication'
import Abonnement from './pages/Abonnement'
import ComingSoon from './components/ComingSoon'
import APropos from './pages/APropos'

import CheckEmail from './pages/CheckEmail'
import ResetPassword from './pages/ResetPassword'

import ModifierProche from './pages/ModifierProche'
import ModifierAnimal from './pages/ModifierAnimal'
import AjouterAnimal from './pages/AjouterAnimal'
import AjouterProche from './pages/AjouterProche'
import AjouterLieu from './pages/AjouterLieu'
import ModifierLieu from './pages/ModifierLieu'
import AjouterDoudou from './pages/AjouterDoudou'
import ModifierDoudou from './pages/ModifierDoudou'
import NosHistoires from './pages/NosHistoires'
import CGVPage from './pages/CGVPage'
import CGUPage from './pages/CGUPage'
import ConfidentialitePage from './pages/ConfidentialitePage'
import ContactPage from './pages/ContactPage'
import FAQPage from './pages/FAQPage'
import Cadeau from './pages/Cadeau'
import CadeauConfirmation from './pages/CadeauConfirmation'

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
              {/* v1.1 — /finaliser-abonnement RETIRÉE. FinishSubscription était un faux
                  formulaire de paiement hérité du prototype : champs « Numéro de carte »,
                  « CVC », et un setTimeout qui déclarait le paiement réussi. Aucun Stripe.
                  La route était protégée par AuthGuard, donc atteignable par tout parent
                  connecté tapant l'URL : il aurait pu y saisir sa vraie carte. */}
              <Route path="/confirmation" element={
                <AuthGuard>
                  <ConfirmationAbonnement />
                </AuthGuard>
              } />
              {/* v1.1 — /confirmation-profil RETIRÉE. ConfirmationPage affichait des
                  données INVENTÉES et codées en dur (« Thomas », « 123 Rue de la Magie »,
                  7 ans). Remplacée depuis par ConfirmationAbonnement, qui lit le session_id
                  de Stripe. Elle aussi était atteignable par tout parent connecté. */}
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
              <Route path="/ajouter-doudou" element={
                <AuthGuard>
                  <AjouterDoudou />
                </AuthGuard>
              } />
              <Route path="/ajouter-doudou/:childId" element={
                <AuthGuard>
                  <AjouterDoudou />
                </AuthGuard>
              } />
              <Route path="/modifier-doudou/:childId/:comforterId" element={
                <AuthGuard>
                  <ModifierDoudou />
                </AuthGuard>
              } />

              {/* Debug route for testing Supabase */}

              {/* Gift book flow routes */}
              {/* Cadeau (abonnement offert) — remplace l'ancien flux /offrir-livre */}
              <Route path="/cadeau" element={<Cadeau />} />
              <Route path="/cadeau/confirmation" element={<CadeauConfirmation />} />
              {/* Anciennes routes du flux cadeau single-book — redirigées vers /cadeau */}
              <Route path="/offrir-livre" element={<Navigate to="/cadeau" replace />} />
              <Route path="/offrir/profil-enfant" element={<Navigate to="/cadeau" replace />} />
              <Route path="/offrir/theme" element={<Navigate to="/cadeau" replace />} />
              <Route path="/offrir/message" element={<Navigate to="/cadeau" replace />} />
              <Route path="/offrir/livraison" element={<Navigate to="/cadeau" replace />} />
              <Route path="/offrir/confirmation" element={<Navigate to="/cadeau" replace />} />
              
              {/* Routes nécessitant un abonnement actif */}
              <Route path="/mon-abonnement" element={
                <SubscriptionGuard>
                  <Abonnement />
                </SubscriptionGuard>
              } />
              
              {/* Pages à venir */}
              <Route path="/a-propos" element={<APropos />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/blog" element={<ComingSoon />} />

              {/* Pages légales */}
              <Route path="/cgv" element={<CGVPage />} />
              <Route path="/cgu" element={<CGUPage />} />
              <Route path="/confidentialite" element={<ConfidentialitePage />} />
              {/* Redirections des anciennes routes légales (liens/SEO existants) */}
              <Route path="/conditions-generales" element={<Navigate to="/cgv" replace />} />
              <Route path="/livraison" element={<Navigate to="/cgv" replace />} />

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
