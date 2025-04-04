
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import { Toaster } from "sonner"
import { AuthProvider } from './hooks/useAuth'
import AuthGuard from './components/AuthGuard'
import RouteGuard from './components/RouteGuard'
import SubscriptionGuard from './components/SubscriptionGuard'
import DevMenu from './components/DevMenu'

// Pages
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import CreateChildProfile from './pages/CreateChildProfile'
import StartAdventure from './pages/StartAdventure'
import FinishSubscription from './pages/FinishSubscription'
import ConfirmationPage from './pages/ConfirmationPage'
import FamilyDashboard from './pages/FamilyDashboard'
import Authentication from './pages/Authentication'
import Abonnement from './pages/Abonnement'

// Gift Flow Pages
import OffrirLivre from './pages/OffrirLivre'
import OffrirProfilEnfant from './pages/OffrirProfilEnfant'
import OffrirTheme from './pages/OffrirTheme'
import OffrirMessage from './pages/OffrirMessage'
import OffrirLivraison from './pages/OffrirLivraison'
import OffrirConfirmation from './pages/OffrirConfirmation'

function App() {
  // Définit si on est en mode développement
  const isDev = process.env.NODE_ENV === 'development' || true; // Forcé à true pour le moment

  return (
    <AuthProvider>
      <Router>
        <div>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/authentification" element={<Authentication />} />
            
            {/* Routes nécessitant l'authentification mais pas d'abonnement */}
            <Route path="/creer-profil-enfant" element={
              <RouteGuard bypassProtection={isDev}>
                <CreateChildProfile />
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
          
          {/* Afficher le menu développeur sur toutes les pages en mode développement */}
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
