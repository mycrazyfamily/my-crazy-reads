// NouvelEnfant v1.1
// Changelog v1.1 (chantier D2) : le bouton de sortie du formulaire enfant.
//   [1] « Retour » DEVIENT « Quitter », avec une croix a la place de la fleche. Deux boutons
//       portaient le meme mot sur le meme ecran : celui-ci ferme tout le formulaire, celui du
//       bas recule d'une etape. Les testeurs confondaient les deux. Le bouton du bas devient
//       « Étape précédente » (NavigationButtons v1.1) et garde la fleche.
//   [2] MODALE DE CONFIRMATION avant de partir, branchee sur useLeaveFormGuard. Elle couvre
//       le bouton « Quitter » et le bouton « Précédent » du NAVIGATEUR. La fermeture de
//       l'onglet passe par beforeunload, dont le texte est impose par le navigateur.
//       Son role n'est pas de retenir le parent mais de le RASSURER : le brouillon est
//       conserve depuis ChildProfileFormContext v1.5, encore fallait-il le lui dire.
//   [3] LE GARDE-FOU EST DESACTIVE EN MODE EDITION. Sur une fiche existante il n'y a pas de
//       brouillon (useSavedDraft vaut false quand editChildId est present) : promettre que
//       tout est conserve serait faux. En edition, « Quitter » sort directement.
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';
import CreateChildProfile from './CreateChildProfile';
import LeaveFormDialog from '@/components/childProfile/LeaveFormDialog';
import { useLeaveFormGuard } from '@/hooks/useLeaveFormGuard';
import 'react-datepicker/dist/react-datepicker.css';

const NouvelEnfant: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editChildId = searchParams.get('edit');

  // Le brouillon n'existe qu'en creation. En edition, pas de promesse de conservation,
  // donc pas de modale : voir [3] en tete de fichier.
  const gardeFouActif = !editChildId;

  const {
    confirmationOuverte,
    setConfirmationOuverte,
    demanderSortie,
    confirmerSortie,
  } = useLeaveFormGuard({ actif: gardeFouActif });

  const sortirVraiment = () => {
    // Si on est en mode édition, toujours retourner à l'espace famille
    if (editChildId) {
      navigate('/espace-famille');
    } else {
      // Sinon, essayer de revenir en arrière ou aller à l'espace famille
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/espace-famille');
      }
    }
  };

  const handleGoBack = () => {
    demanderSortie(sortirVraiment);
  };

  return (
    <div>
      <div className="container mx-auto px-4 pt-4">
        <Button 
          variant="ghost" 
          onClick={handleGoBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-mcf-primary hover:bg-mcf-mint/10 mb-4"
        >
          <X className="h-4 w-4" />
          Quitter
        </Button>
      </div>

      <LeaveFormDialog
        open={confirmationOuverte}
        onOpenChange={setConfirmationOuverte}
        onConfirm={confirmerSortie}
      />

      <CreateChildProfile 
        key={editChildId ? `edit-${editChildId}` : 'create-new'}
        isGiftMode={false} 
        nextPath="/espace-famille"
        initialStep={0}
        editMode={!!editChildId}
        editChildId={editChildId || undefined}
        useSavedDraft={!editChildId}
      />
    </div>
  );
};

export default NouvelEnfant;
