
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import { Toaster } from "sonner"

// Pages
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import CreateChildProfile from './pages/CreateChildProfile'
import StartAdventure from './pages/StartAdventure'
import FinishSubscription from './pages/FinishSubscription'
import ConfirmationPage from './pages/ConfirmationPage'
import FamilyDashboard from './pages/FamilyDashboard'

// Gift Flow Pages
import OffrirLivre from './pages/OffrirLivre'
import OffrirProfilEnfant from './pages/OffrirProfilEnfant'
import OffrirTheme from './pages/OffrirTheme'
import OffrirMessage from './pages/OffrirMessage'
import OffrirLivraison from './pages/OffrirLivraison'
import OffrirConfirmation from './pages/OffrirConfirmation'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/creer-profil-enfant" element={<CreateChildProfile />} />
          <Route path="/start-adventure" element={<StartAdventure />} />
          <Route path="/pret-a-demarrer" element={<StartAdventure />} />
          <Route path="/finaliser-abonnement" element={<FinishSubscription />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/espace-famille" element={<FamilyDashboard />} />

          {/* Gift book flow routes */}
          <Route path="/offrir-livre" element={<OffrirLivre />} />
          <Route path="/offrir/profil-enfant" element={<OffrirProfilEnfant />} />
          <Route path="/offrir/theme" element={<OffrirTheme />} />
          <Route path="/offrir/message" element={<OffrirMessage />} />
          <Route path="/offrir/livraison" element={<OffrirLivraison />} />
          <Route path="/offrir/confirmation" element={<OffrirConfirmation />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster 
          richColors 
          position="top-center"
          closeButton
        />
      </div>
    </Router>
  )
}

export default App
