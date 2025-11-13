import { test as setup } from '@playwright/test';
import { supabase } from '../../src/integrations/supabase/client';

const authFile = 'e2e/.auth/user.json';

/**
 * Setup d'authentification pour les tests E2E
 * Crée un utilisateur de test et sauvegarde la session
 */
setup('authenticate', async ({ page }) => {
  const testEmail = process.env.TEST_USER_EMAIL || 'test-e2e@mcf.test';
  const testPassword = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

  // Aller sur la page de connexion
  await page.goto('/authentication');

  // Attendre que la page soit chargée
  await page.waitForLoadState('networkidle');

  // Essayer de se connecter (l'utilisateur peut déjà exister)
  try {
    // Cliquer sur l'onglet de connexion si nécessaire
    const loginTab = page.locator('text=Se connecter').first();
    if (await loginTab.isVisible()) {
      await loginTab.click();
    }

    // Remplir le formulaire de connexion
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    
    // Soumettre
    await page.click('button[type="submit"]');

    // Attendre la redirection
    await page.waitForURL('**/espace-famille', { timeout: 10000 });
  } catch (error) {
    console.log('Connexion échouée, tentative de création de compte...');
    
    // Si la connexion échoue, créer un nouveau compte
    await page.goto('/authentication');
    
    // Cliquer sur l'onglet d'inscription
    const registerTab = page.locator('text=Créer un compte').first();
    if (await registerTab.isVisible()) {
      await registerTab.click();
    }

    // Remplir le formulaire d'inscription
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    
    // Soumettre
    await page.click('button[type="submit"]');

    // Attendre la redirection
    await page.waitForURL('**/espace-famille', { timeout: 10000 });
  }

  // Sauvegarder l'état de la session
  await page.context().storageState({ path: authFile });
});
