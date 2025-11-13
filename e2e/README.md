# Tests E2E avec Playwright 🎭

Ce dossier contient les tests end-to-end (E2E) de l'application MCF, réalisés avec [Playwright](https://playwright.dev/).

## 📋 Prérequis

- Node.js installé
- Dépendances du projet installées (`npm install`)
- Application en cours d'exécution sur `http://localhost:8080`

## 🚀 Installation

Les dépendances Playwright sont déjà dans le projet. Il suffit d'installer les navigateurs :

```bash
npx playwright install
```

Cela téléchargera les navigateurs Chromium, Firefox et WebKit nécessaires aux tests.

## ▶️ Lancer les tests

### Mode headless (sans interface)

```bash
npm run test:e2e
```

Ou directement avec Playwright :

```bash
npx playwright test
```

### Mode UI (interface visuelle)

Pour voir les tests s'exécuter en temps réel avec une interface interactive :

```bash
npm run test:e2e:ui
```

Ou :

```bash
npx playwright test --ui
```

### Mode debug

Pour déboguer un test spécifique :

```bash
npx playwright test --debug
```

### Lancer un test spécifique

```bash
npx playwright test child-profile-creation
```

## 📊 Consulter les résultats

### Rapport HTML

Après l'exécution des tests, générer et ouvrir le rapport :

```bash
npx playwright show-report
```

Le rapport contient :
- ✅ Tests réussis
- ❌ Tests échoués
- 📸 Captures d'écran en cas d'erreur
- 🎥 Vidéos des tests échoués
- 📝 Traces détaillées

### Logs et captures

Les captures d'écran et vidéos sont automatiquement sauvegardées dans :
- `test-results/` : résultats bruts
- `playwright-report/` : rapport HTML

## 🧪 Tests disponibles

### `child-profile-creation.spec.ts`

Test complet de création d'un profil enfant :

1. **Informations de base** : prénom, genre, date de naissance
2. **Personnalité** : taille, superpouvoirs
3. **Famille** : ajout d'un proche (ex: Maman)
4. **Animaux** : ajout d'un animal de compagnie (ex: Chien)
5. **Doudous/Jouets** : (étape passée dans ce test)
6. **Univers favoris** : (étape passée dans ce test)
7. **Lieux de vie** : ajout d'un lieu (ex: Maison)
8. **Récapitulatif** : validation finale

Le test vérifie ensuite que :
- L'enfant apparaît dans l'espace famille
- Les données sont correctement enregistrées dans Supabase :
  - `child_profiles`
  - `family_members` + `child_family_members`
  - `child_pets`
  - `places` + `child_places`

## 🔧 Configuration

La configuration se trouve dans `playwright.config.ts` :

- **Timeout** : 60 secondes par test
- **Navigateurs** : Chromium (par défaut), Firefox et WebKit disponibles
- **Captures** : Automatiques en cas d'échec
- **Traces** : Activées lors des retries
- **Base URL** : `http://localhost:8080` (modifiable via `PLAYWRIGHT_BASE_URL`)

## 🔐 Authentification

Les tests utilisent un compte de test automatiquement créé ou réutilisé.

Variables d'environnement (optionnelles) :
- `TEST_USER_EMAIL` : email du compte de test (défaut: `test-e2e@mcf.test`)
- `TEST_USER_PASSWORD` : mot de passe (défaut: `TestPassword123!`)

La session est sauvegardée dans `e2e/.auth/user.json` pour éviter de se reconnecter à chaque test.

## 📝 Écrire un nouveau test

Créer un fichier dans `e2e/` avec l'extension `.spec.ts` :

```typescript
import { test, expect } from '@playwright/test';

test.describe('Mon nouveau test', () => {
  test.use({ storageState: 'e2e/.auth/user.json' }); // Si authentification nécessaire

  test('Doit faire quelque chose', async ({ page }) => {
    await page.goto('/ma-page');
    await expect(page.locator('text=Mon élément')).toBeVisible();
  });
});
```

## 🐛 Debugging

### Voir les traces d'un test échoué

```bash
npx playwright show-trace test-results/<nom-du-test>/trace.zip
```

### Mode pas à pas

```bash
npx playwright test --debug
```

### Inspecter un élément

Dans le test, ajouter :

```typescript
await page.pause(); // Met le test en pause pour inspection
```

## 📚 Ressources

- [Documentation Playwright](https://playwright.dev/)
- [Best practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Selectors Guide](https://playwright.dev/docs/selectors)

## 🚦 CI/CD

Pour intégrer les tests dans une CI (GitHub Actions, GitLab CI, etc.) :

```yaml
# Exemple GitHub Actions
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## 🧹 Nettoyage

Les tests se nettoient automatiquement après leur exécution (suppression des données de test créées).

Pour nettoyer manuellement les données de test :

```bash
# Supprimer les résultats de tests
rm -rf test-results/
rm -rf playwright-report/

# Supprimer le cache d'authentification
rm -rf e2e/.auth/
```

---

✨ Happy testing! 🎭
