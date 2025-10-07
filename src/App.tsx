
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import { Toaster } from "sonner"
import { AuthProvider } from './hooks/useAuth'
import AuthGuard from './components/AuthGuard'
import RouteGuard from './components/RouteGuard'
import SubscriptionGuard from './components/SubscriptionGuard'
import DevMenu from './components/DevMenu'

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
import StartAdventure from './pages/StartAdventure'
import FinishSubscription from './pages/FinishSubscription'
import ConfirmationPage from './pages/ConfirmationPage'
import FamilyDashboard from './pages/FamilyDashboard'
import Authentication from './pages/Authentication'
import Abonnement from './pages/Abonnement'

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

function App() {
  const isDev = false; // Protection activée en production
  console.log('App loaded, Auth components available:', 
    !!LoadingCallback, 
    !!Callback, 
    'LoadingCallback path:', LoadingCallback ? 'components/auth/LoadingCallback' : 'not found'
  );

  return (
    <AuthProvider>
      <Router>
        <div>
          <Routes>
            {/* Auth callback route - explicitly defined FIRST in the routes for priority */}
            <Route path="/auth/callback" element={<Callback />} />
            
            {/* Debug route for testing Callback component */}
            <Route path="/debug/callback" element={<CallbackDummy />} />
            
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/authentification" element={<Authentication />} />
            <Route path="/check-email" element={<CheckEmail />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Routes nécessitant l'authentification mais pas d'abonnement */}
            <Route path="/creer-profil-enfant" element={
              <RouteGuard bypassProtection={isDev}>
                <NouvelEnfant />
              </RouteGuard>
            } />
            <Route path="/abonnement" element={
              <RouteGuard bypassProtection={isDev}>
                <Abonnement />
              </RouteGuard>
            } />
            
            {/* Semi-protected routes - will redirect to auth before payment */}
            <Route path="/start-adventure" element={<StartAdventure />} />
            <Route path="/pret-a-demarrer" element={<StartAdventure />} />
            
            {/* Protected routes - require authentication */}
            <Route path="/finaliser-abonnement" element={
              <AuthGuard>
                <FinishSubscription />
              </AuthGuard>
            } />
            <Route path="/confirmation" element={
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
            
            <Route path="*" element={<NotFound />} />
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
  )
}

export default App
