// src/utils/deliveryMonth.ts — v1.1 — 11/08/2026
//
// Changelog v1.1 :
//   [1] SEUIL 20 -> 10. Contrainte imprimeur : entre la cloture, la generation
//       des livres, la relecture, l'envoi a l'imprimeur, l'impression et la
//       poste, le 20 ne laissait pas assez de marge pour une livraison en
//       debut de mois suivant.
//   [2] BUG DE DEBORDEMENT corrige. `setMonth()` conserve le JOUR du mois : si
//       ce jour n'existe pas dans le mois cible, la date deborde sur le mois
//       suivant. Un client s'abonnant le 29, 30 ou 31 decembre se voyait
//       annoncer « mars » alors qu'il serait livre en fevrier :
//           new Date('2026-12-31').setMonth(13)  ->  31 fevrier  ->  3 mars
//       On construit desormais directement le 1er du mois cible, jour qui
//       existe toujours, et le constructeur Date normalise le depassement
//       d'annee tout seul.
//
// ⚠️ CETTE REGLE EXISTE A TROIS ENDROITS, dans trois executions differentes.
//    Elles doivent rester d'accord :
//      1. SQL   generate_book_requests_for_child  -> personalization_deadline
//      2. ICI                                     -> mois annonce au client
//      3. n8n   MCF_Email_Confirmation, node « Construire le mail »
//    Toute modification du jour doit etre repercutee sur les trois.

/**
 * Jour du mois de fabrication jusqu'auquel le parent peut personnaliser son
 * livre. Au-dela, le livre part avec son theme standard.
 */
export const PERSONALIZATION_DEADLINE_DAY = 10;

/**
 * Mois de livraison du PREMIER livre, en toutes lettres (« septembre »).
 *
 * Regle produit : un abonnement souscrit APRES le 10 du mois N ne donne pas de
 * livre en N+1 — le delai de production est trop court. Le premier livre
 * arrive en N+2.
 * Le jour du seuil lui-meme reste inclus : s'abonner LE 10 donne bien N+1.
 */
export const getFirstDeliveryMonth = (): string => {
  const today = new Date();
  const offset = today.getDate() > PERSONALIZATION_DEADLINE_DAY ? 2 : 1;

  // v1.1 [2] — on vise le 1er du mois cible plutot que de decaler la date du
  // jour : le 1er existe dans tous les mois, donc aucun debordement possible.
  const delivery = new Date(today.getFullYear(), today.getMonth() + offset, 1);

  return delivery.toLocaleDateString('fr-FR', { month: 'long' });
};
