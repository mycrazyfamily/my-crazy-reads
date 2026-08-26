// LeaveFormDialog v1.1  (chantier D2)
// Changelog v1.1 : DEUX VARIANTES, parce que les deux situations ne meritent pas le meme
//   message et qu'en promettre trop serait mentir.
//     'brouillon' : formulaire enfant en CREATION. Un brouillon est reellement conserve
//                   (ChildProfileFormContext v1.5), on peut donc rassurer sans reserve.
//     'perte'     : toutes les autres pages (ajout et modification de proche, animal,
//                   doudou, lieu, et modification d'enfant). Aucun brouillon n'y existe :
//                   la saisie en cours sera bel et bien perdue, on le dit franchement.
//   Le bouton de confirmation change de ton avec la variante : « Quitter » quand rien n'est
//   perdu, « Quitter sans enregistrer » quand quelque chose l'est.
// LeaveFormDialog v1.0
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
  /** 'brouillon' = la saisie est conservee. 'perte' = elle ne l'est pas. Defaut : 'brouillon'. */
  variante?: 'brouillon' | 'perte';
};

const TEXTES = {
  brouillon: {
    titre: 'Vous quittez le formulaire',
    corps:
      "Pas d'inquiétude, tout ce que vous avez saisi est conservé. " +
      'Vous retrouverez votre progression en revenant.',
    confirmer: 'Quitter',
  },
  perte: {
    titre: 'Vous quittez le formulaire',
    corps:
      "Vos saisies en cours ne seront pas conservées. " +
      'Si vous partez maintenant, il faudra tout ressaisir.',
    confirmer: 'Quitter sans enregistrer',
  },
} as const;

const LeaveFormDialog: React.FC<LeaveFormDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  variante = 'brouillon',
}) => {
  const t = TEXTES[variante];
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.titre}</AlertDialogTitle>
          <AlertDialogDescription>{t.corps}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Continuer la saisie</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{t.confirmer}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LeaveFormDialog;
