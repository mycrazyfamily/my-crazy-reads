// useLeaveFormGuard v1.2
// Changelog v1.2 : « QUITTER LE SITE ? » APRES UN ENREGISTREMENT REUSSI. AjouterProche et
//   ModifierProche repartent vers l'espace famille par un rechargement complet
//   (window.location.href). Le garde-fou beforeunload, toujours actif, faisait alors afficher
//   par Chrome « Les modifications ne seront peut-etre pas enregistrees » alors qu'elles
//   l'etaient. Pire : « Annuler » laissait le parent sur le formulaire, un second clic sur
//   « Enregistrer » creait un doublon (constate le 29/09 : deux « Gp Ladji »).
//   Nouvelle action libererSortie() : a appeler juste avant de quitter volontairement la
//   page apres un enregistrement. Elle arme le meme drapeau que la sortie confirmee, que
//   l'ecouteur beforeunload consulte desormais aussi.
// useLeaveFormGuard v1.1  (chantier D2)
// Changelog v1.1 : correctif du DOUBLE AVERTISSEMENT. Confirmer la sortie via le bouton
//   « Quitter » ouvrait la modale une seconde fois. Cause : l'entree d'historique factice
//   posee au montage. L'action de sortie consommait cette entree, ce qui declenchait un
//   popstate que notre propre ecouteur interceptait comme un « Précédent » du navigateur.
//   Deux verrous desormais : le drapeau sortieEnCoursRef est arme avant d'executer l'action,
//   et les appelants naviguent vers une route explicite plutot qu'en relatif (voir
//   NouvelEnfant v1.3).
// useLeaveFormGuard v1.0  (chantier D2)
// Intercepte les trois facons de quitter un formulaire en cours et, pour deux d'entre elles,
// laisse l'appelant afficher une modale rassurante avant de laisser partir.
//
// LES TROIS SORTIES, ET CE QU'ON PEUT EN FAIRE
//   1. Le bouton « Quitter » de la page. Entierement sous notre controle : l'appelant
//      appelle demanderSortie(action) au lieu de naviguer directement.
//   2. Le bouton « Précédent » du NAVIGATEUR. Interceptable via l'evenement popstate, a
//      condition d'avoir empile une entree d'historique factice au montage. C'est ce que
//      fait ce hook. Le texte de la modale est le notre.
//   3. La fermeture de l'onglet ou du navigateur. Passe par beforeunload. Le navigateur
//      IMPOSE son propre texte, « Voulez-vous vraiment quitter ce site ? » ou equivalent
//      selon le navigateur et la langue. Aucune personnalisation n'est possible, c'est une
//      restriction volontaire des navigateurs contre les sites qui retenaient l'internaute.
//
// POURQUOI UNE ENTREE D'HISTORIQUE FACTICE. Sans elle, un clic sur « Précédent » quitte la
// page avant que le moindre code ne s'execute : popstate arrive trop tard. En empilant une
// entree au montage, le premier « Précédent » consomme cette entree, reste sur la page, et
// declenche popstate. On peut alors demander confirmation. Si le parent confirme, on appelle
// history.back() une seconde fois pour partir reellement.
//
// LE HOOK N'AFFICHE RIEN. Il expose l'etat et les actions, l'appelant branche la modale
// (LeaveFormDialog). Ca permet de le reutiliser sur des ecrans a mise en page differente.
import { useCallback, useEffect, useRef, useState } from 'react';

type UseLeaveFormGuardOptions = {
  /** Faux pour desactiver completement le garde-fou (mode edition, formulaire vide...). */
  actif?: boolean;
};

export function useLeaveFormGuard({ actif = true }: UseLeaveFormGuardOptions = {}) {
  const [confirmationOuverte, setConfirmationOuverte] = useState(false);
  // Action a executer si le parent confirme la sortie. Stockee dans une ref pour que la
  // valeur lue au moment du clic soit la derniere posee, jamais une closure figee.
  const actionEnAttenteRef = useRef<(() => void) | null>(null);
  // Vrai pendant qu'on execute une sortie confirmee : evite que le popstate declenche par
  // notre propre history.back() rouvre la modale en boucle.
  const sortieEnCoursRef = useRef(false);

  // --- 3. Fermeture de l'onglet ou du navigateur -----------------------------------
  useEffect(() => {
    if (!actif) return;
    const handler = (e: BeforeUnloadEvent) => {
      // v1.2 : sortie voulue (enregistrement reussi ou sortie confirmee) : on laisse partir.
      if (sortieEnCoursRef.current) return;
      e.preventDefault();
      // Valeur historique attendue par certains navigateurs. Le texte affiche reste celui
      // du navigateur, pas celui-ci.
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [actif]);

  // --- 2. Bouton Précédent du navigateur -------------------------------------------
  useEffect(() => {
    if (!actif) return;

    // Entree factice : le premier « Précédent » la consomme sans quitter la page.
    window.history.pushState({ mcfGardeFou: true }, '');

    const onPopState = () => {
      if (sortieEnCoursRef.current) return;
      // On rempile aussitot pour rester sur la page pendant que le parent decide.
      window.history.pushState({ mcfGardeFou: true }, '');
      actionEnAttenteRef.current = () => {
        sortieEnCoursRef.current = true;
        // Deux crans : l'entree factice qu'on vient de rempiler, puis la vraie sortie.
        window.history.go(-2);
      };
      setConfirmationOuverte(true);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [actif]);

  // --- 1. Bouton « Quitter » de la page --------------------------------------------
  /** A appeler a la place de la navigation directe. Si le garde-fou est inactif, part tout de suite. */
  const demanderSortie = useCallback((action: () => void) => {
    if (!actif) {
      action();
      return;
    }
    actionEnAttenteRef.current = action;
    setConfirmationOuverte(true);
  }, [actif]);

  const confirmerSortie = useCallback(() => {
    setConfirmationOuverte(false);
    // v1.1 : on arme le drapeau AVANT d'executer l'action. Sans lui, une action qui
    // consomme une entree d'historique (navigate(-1), history.go) declenchait un popstate
    // que notre propre ecouteur interceptait, ce qui rouvrait la modale : il fallait
    // confirmer deux fois pour sortir.
    sortieEnCoursRef.current = true;
    const action = actionEnAttenteRef.current;
    actionEnAttenteRef.current = null;
    if (action) action();
  }, []);

  // v1.2 : a appeler juste avant de quitter la page de son plein gre, apres un enregistrement
  // reussi. Plus aucun avertissement ne se declenche ensuite.
  const libererSortie = useCallback(() => {
    sortieEnCoursRef.current = true;
  }, []);

  return {
    /** A passer a LeaveFormDialog. */
    confirmationOuverte,
    setConfirmationOuverte,
    /** A brancher sur le bouton « Quitter ». */
    demanderSortie,
    /** A passer a LeaveFormDialog comme onConfirm. */
    confirmerSortie,
    /** v1.2 : a appeler avant de quitter la page apres un enregistrement reussi. */
    libererSortie,
  };
}

export default useLeaveFormGuard;
