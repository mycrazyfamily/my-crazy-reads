# Sauvegarde des Edge Functions non versionnées

Copie exacte, prise le **24/09/2026** dans le dashboard Supabase (onglet Code de chaque fonction), des trois Edge Functions qui n'existaient nulle part ailleurs. Chacune tient en un seul fichier `index.ts`.

**Ce dossier n'est jamais déployé.** Il est volontairement hors de `supabase/functions` : aucun outil ne doit pouvoir redéployer ces fonctions depuis le dépôt avec des réglages par défaut. En particulier, `stripe-webhook` redéployée avec la vérification du JWT activée refuserait tous les appels de Stripe, et les paiements ne seraient plus enregistrés.

**À tenir à jour** : toute modification d'une de ces fonctions dans Supabase doit être recopiée ici le jour même.

## Les trois fonctions

| Fonction | Rôle | Vérification du JWT | Appelée par |
|---|---|---|---|
| `stripe-webhook` (v2.2) | Enregistre abonnements, renouvellements, échecs de paiement, résiliations et achats cadeaux | **Désactivée** | Stripe, endpoint `mcf-stripe-webhook` (5 événements) |
| `trigger-book-factory` | Lance la fabrication d'un livre dans n8n | Activée | Dashboard admin `mcf-book-magic`, bouton « Lancer » |
| `lock-overdue-books` | Verrouille les livres dont la date limite de personnalisation est passée | Activée | n8n `MCF_Lock_Overdue_Books`, chaque jour à 2 h, identifiant `Supabase Service Role Full` |

## Secrets lus par chaque fonction

Seuls les noms figurent dans le code, jamais les valeurs. `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont fournis automatiquement par Supabase.

- `stripe-webhook` : `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `N8N_GIFT_WEBHOOK_URL` (facultatif : une adresse de repli est écrite dans le code), `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- `trigger-book-factory` : `N8N_WEBHOOK_SECRET` (doit correspondre à l'identifiant `Header Auth account 4` du déclencheur de la Book Factory), `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- `lock-overdue-books` : `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

## Prérequis en base pour `stripe-webhook`

Colonne `stripe_subscription_id` et son index unique, table `webhook_anomalies`, fonctions SQL `get_user_id_by_email` et `generate_book_requests_for_child`, colonnes `stripe_status`, `payment_failed_at`, `payment_attempt_count`. Tous présents au 24/09/2026.

## Restaurer une fonction

1. Supabase, Edge Functions, ouvrir la fonction (ou la créer avec **exactement** le même nom).
2. Onglet Code : remplacer le contenu d'`index.ts` par celui de ce dossier, puis « Deploy updates ».
3. Réglages de la fonction : remettre la vérification du JWT comme indiqué dans le tableau.
4. Edge Functions, Secrets : vérifier que les secrets listés ci-dessus existent.
5. Tester : pour `stripe-webhook`, renvoyer un événement récent depuis Stripe et vérifier la réponse 200 ; pour `lock-overdue-books`, exécuter le workflow n8n à la main ; pour `trigger-book-factory`, lancer un livre de test depuis le dashboard admin.
