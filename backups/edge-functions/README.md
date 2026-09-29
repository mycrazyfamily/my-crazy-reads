# Sauvegarde des Edge Functions non versionnées

Copies des huit Edge Functions qui n'existent pas dans `supabase/functions`. Chacune tient en un seul fichier `index.ts`. Mise à jour du **29/09/2026** (`stripe-webhook` v2.4 : adresse de livraison).

**Ce dossier n'est jamais déployé.** Il est volontairement hors de `supabase/functions` : aucun outil ne doit pouvoir redéployer ces fonctions depuis le dépôt avec des réglages par défaut.

**À tenir à jour** : toute modification d'une de ces fonctions dans Supabase doit être recopiée ici le jour même.

**Les cinq autres fonctions** (`create-checkout`, `check-subscription`, `cancel-subscription`, `reactivate-subscription`, `customer-portal`) sont dans `supabase/functions`. **Attention** : jusqu'au 29/09/2026, ces copies dataient de janvier à avril 2026 alors que la production avait évolué (report du prélèvement au 10, abonnements en essai, ciblage des résiliations). Elles ont été réalignées sur la production le 29/09/2026. Même règle qu'ici : toute modification faite dans Supabase doit y être recopiée le jour même. `send-email` est un reste inutilisé : les mails d'authentification passent par Brevo en SMTP.

## Les huit fonctions

| Fonction | Version | Rôle | Vérification du JWT | Appelée par | Contrôle de l'appelant |
|---|---|---|---|---|---|
| `stripe-webhook` | v2.4 | Abonnements, renouvellements, échecs de paiement, résiliations, achats cadeaux | **Désactivée** | Stripe, endpoint `mcf-stripe-webhook` (5 événements) | Signature Stripe |
| `trigger-book-factory` | v1.1 | Lance la fabrication d'un livre dans n8n | Activée | Dashboard admin, bouton « Lancer » | Administrateur uniquement (`is_mcf_admin()`) |
| `lock-overdue-books` | sans numéro | Verrouille les livres dont la date limite est passée | Activée | n8n `MCF_Lock_Overdue_Books`, chaque jour à 2 h | Aucun (voir plus bas) |
| `enrich-clothing` | v3.3 | Décrit la tenue d'un avatar (Gemini Vision) | **Activée, obligatoire** | Déclencheur `notify_enrich_clothing` (nouvel avatar) | Jeton de rôle `service_role` |
| `enrich-place-environment` | v2.2 | Ambiance et lieux emblématiques d'une ville ; modération des destinations libres | **Activée, obligatoire** | Déclencheur `notify_enrich_place` (création ou modification d'un lieu) | Jeton de rôle `service_role` |
| `create-gift-checkout` | sans numéro | Crée le paiement Stripe d'un cadeau | Activée | Page « Offrir » du site | Aucun, volontairement : on peut offrir sans compte |
| `get-gift-by-session` | sans numéro | Affiche la carte cadeau après paiement | Activée | Page de confirmation cadeau | Identifiant de session Stripe, impossible à deviner |
| `gift-card` | v1.1 | Carte cadeau en PDF, et image des nuages du mail cadeau | **Désactivée, obligatoire** | Page de confirmation cadeau (bouton « Télécharger »), n8n `MCF_Email_Gift_Confirmation` (pièce jointe), messageries (image) | Identifiant de session Stripe pour la page ; en-tête `X-MCF-Secret` pour n8n ; image publique, sans donnée |

**« Activée, obligatoire »** : ces deux fonctions lisent le rôle inscrit dans le jeton reçu, et c'est la vérification JWT de Supabase qui en garantit la signature. Désactiver ce réglage permettrait à n'importe qui de fabriquer un jeton se disant `service_role`.

**`gift-card` doit garder la vérification du JWT désactivée** : les messageries chargent l'image des nuages sans jeton, et n8n appelle avec son secret. La fonction fait elle-même ses contrôles.

`lock-overdue-books` n'a pas de contrôle de l'appelant : n'importe qui muni de la clé anon peut la déclencher. Elle ne fait que verrouiller les livres dont la date limite est déjà passée, ce que le passage quotidien ferait de toute façon.

## Secrets

Seuls les noms figurent dans le code. `SUPABASE_URL`, `SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY` sont fournis automatiquement par Supabase.

- `stripe-webhook` : `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `N8N_WEBHOOK_SECRET` (en-tête du mail cadeau), `N8N_GIFT_WEBHOOK_URL` (facultatif, adresse de repli dans le code). Depuis la v2.4, écrit aussi dans la table `shipping_addresses` (script `adresse_livraison_v1.sql`).
- `trigger-book-factory` : `N8N_WEBHOOK_SECRET` (doit correspondre à l'identifiant n8n `Header Auth account 4`), `SUPABASE_ANON_KEY`.
- `enrich-clothing`, `enrich-place-environment` : `GEMINI_API_KEY`.
- `create-gift-checkout` : `STRIPE_SECRET_KEY`. **Les identifiants de prix et de coupons sont écrits dans le code, ceux du mode test** : à remplacer au passage en Live.
- `get-gift-by-session` : rien de plus.
- `gift-card` : `N8N_WEBHOOK_SECRET` (mode n8n). Le PDF est dessiné avec les polices standard ; le dégradé et le nuage sont des images intégrées au code.

**Secret Vault `service_role_key`** : la clé service_role, lue par les déclencheurs `notify_enrich_clothing` et `notify_enrich_place` pour appeler les deux fonctions d'enrichissement. **Le jour où les clés changent, il faut mettre à jour ce secret**, sinon les enrichissements s'arrêtent (avec un avertissement en base, sans bloquer les mises à jour).

Le script qui a mis ces déclencheurs en place est dans `backups/sql/securite_cles_declencheurs_v1.sql`.

## Restaurer une fonction

1. Supabase, Edge Functions, ouvrir la fonction (ou la créer avec **exactement** le même nom).
2. Onglet Code : remplacer le contenu d'`index.ts` par celui de ce dossier, puis « Deploy updates ».
3. Réglages : remettre la vérification du JWT comme indiqué dans le tableau.
4. Edge Functions, Secrets : vérifier que les secrets listés existent.
5. Tester :
   - `stripe-webhook` : renvoyer un événement récent depuis Stripe, réponse 200 attendue ;
   - `lock-overdue-books` : exécuter le workflow n8n à la main ;
   - `trigger-book-factory` : lancer un livre de test depuis le dashboard admin ;
   - `enrich-clothing` : régénérer l'avatar d'un enfant de test, puis lire les logs ;
   - `enrich-place-environment` : changer la ville d'un lieu de test, puis lire les logs ;
   - fonctions cadeau : faire un achat cadeau en mode test ;
   - `gift-card` : ouvrir `…/functions/v1/gift-card?image=nuage` (un nuage blanc), puis `…/gift-card?session_id=<identifiant d'un achat>` (la carte PDF).
