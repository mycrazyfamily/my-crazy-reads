// LeaveFormDialog v1.0  (chantier D2)
// Modale de confirmation affichee quand le parent s'apprete a quitter un formulaire en cours.
//
// POURQUOI ELLE EXISTE. Le test utilisateur du 24/08 a montre que les parents hesitent a
// quitter un formulaire long : ils craignent de perdre leur saisie. Le brouillon est pourtant
// conserve depuis ChildProfileFormContext v1.5. Le role de cette modale n'est donc PAS de
// retenir le parent, c'est de le RASSURER : elle dit clairement que tout est garde, et le
// laisse partir en un clic.
//
// CE QU'ELLE NE COUVRE PAS. La fermeture de l'onglet ou du navigateur passe par l'evenement
// natif beforeunload, dont le texte est impose par le navigateur (« Voulez-vous vraiment
// quitter ce site ? »). Aucune modale personnalisee n'est possible dans ce cas, c'est une
// restriction des navigateurs. Voir useLeaveFormGuard.
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type LeaveFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Appelee quand le parent confirme qu'il veut partir. */
  onConfirm: () => void;
};

const LeaveFormDialog: React.FC<LeaveFormDialogProps> = ({ open, onOpenChange, onConfirm }) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Vous quittez le formulaire</AlertDialogTitle>
          <AlertDialogDescription>
            Pas d'inquiétude, tout ce que vous avez saisi est conservé.
            Vous retrouverez votre progression en revenant.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Continuer la saisie</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Quitter</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LeaveFormDialog;
