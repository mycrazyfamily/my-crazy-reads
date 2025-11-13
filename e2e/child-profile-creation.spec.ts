import { test, expect } from '@playwright/test';
import { supabase } from '../src/integrations/supabase/client';

/**
 * Test E2E : Création complète d'un profil enfant
 * 
 * Ce test vérifie le parcours complet d'ajout d'un enfant avec :
 * - Informations de base (prénom, genre, date de naissance)
 * - Ajout d'un proche
 * - Ajout d'un animal
 * - Ajout d'un lieu de vie
 * - Vérification des données dans Supabase
 * - Vérification de l'affichage dans l'espace famille
 */
test.describe('Création de profil enfant complet', () => {
  test.use({ storageState: 'e2e/.auth/user.json' });

  let childId: string;
  let familyId: string;

  test('Doit créer un enfant avec toutes ses données', async ({ page }) => {
    // Générer un prénom unique pour ce test
    const childFirstName = `TestEnfant${Date.now()}`;
    
    // 1. Aller sur la page d'ajout d'enfant
    await page.goto('/nouvel-enfant');
    await page.waitForLoadState('networkidle');

    // 2. ÉTAPE 1 : Informations de base
    await test.step('Remplir les informations de base', async () => {
      // Prénom
      await page.fill('input[name="firstName"]', childFirstName);
      
      // Genre (cliquer sur un des boutons radio)
      await page.click('text=Fille');
      
      // Date de naissance - utiliser les sélecteurs de date
      await page.click('text=Jour');
      await page.click('[role="option"]:has-text("15")');
      
      await page.click('text=Mois');
      await page.click('[role="option"]:has-text("Juin")');
      
      await page.click('text=Année');
      await page.click('[role="option"]:has-text("2020")');
      
      // Cliquer sur Suivant
      await page.click('button:has-text("Suivant")');
      await page.waitForTimeout(1000);
    });

    // 3. ÉTAPE 2 : Personnalité (on remplit le minimum)
    await test.step('Remplir la personnalité', async () => {
      // Sélectionner une taille relative
      await page.click('text=Dans la moyenne');
      
      // Sélectionner quelques superpouvoirs
      const firstSuperpower = page.locator('[data-testid="superpower-option"]').first();
      if (await firstSuperpower.count() > 0) {
        await firstSuperpower.click();
      }
      
      // Suivant
      await page.click('button:has-text("Suivant")');
      await page.waitForTimeout(1000);
    });

    // 4. ÉTAPE 3 : Famille - Ajouter un proche
    await test.step('Ajouter un proche', async () => {
      // Cliquer sur "Ajouter un proche"
      await page.click('button:has-text("Ajouter un proche")');
      await page.waitForTimeout(500);
      
      // Sélectionner le type de proche
      await page.click('text=Maman');
      await page.click('button:has-text("Suivant")');
      await page.waitForTimeout(500);
      
      // Remplir le prénom du proche
      await page.fill('input[placeholder*="prénom"]', 'MarieTest');
      
      // Apparence - cocher "Aucun détail physique particulier"
      const noDetailsCheckbox = page.locator('text=Aucun détail physique particulier');
      if (await noDetailsCheckbox.isVisible()) {
        await noDetailsCheckbox.click();
      }
      
      // Valider l'ajout du proche
      await page.click('button:has-text("Valider")');
      await page.waitForTimeout(1000);
      
      // Passer à l'étape suivante
      await page.click('button:has-text("Suivant")');
      await page.waitForTimeout(1000);
    });

    // 5. ÉTAPE 4 : Animaux - Ajouter un animal
    await test.step('Ajouter un animal', async () => {
      // Cliquer sur "Oui" pour la question "A un animal"
      await page.click('text=Oui');
      await page.waitForTimeout(500);
      
      // Cliquer sur "Ajouter un animal"
      await page.click('button:has-text("Ajouter un animal")');
      await page.waitForTimeout(500);
      
      // Sélectionner le type d'animal
      await page.click('text=Chien');
      await page.waitForTimeout(500);
      
      // Remplir le nom de l'animal
      await page.fill('input[placeholder*="nom"]', 'RexTest');
      
      // Valider l'animal
      await page.click('button:has-text("Valider")');
      await page.waitForTimeout(1000);
      
      // Suivant
      await page.click('button:has-text("Suivant")');
      await page.waitForTimeout(1000);
    });

    // 6. ÉTAPE 5 : Doudous/Jouets (on passe)
    await test.step('Passer l\'étape doudous', async () => {
      await page.click('button:has-text("Suivant")');
      await page.waitForTimeout(1000);
    });

    // 7. ÉTAPE 6 : Univers favoris (on passe)
    await test.step('Passer l\'étape univers', async () => {
      await page.click('button:has-text("Suivant")');
      await page.waitForTimeout(1000);
    });

    // 8. ÉTAPE 7 : Lieux - Ajouter un lieu
    await test.step('Ajouter un lieu', async () => {
      // Cliquer sur "Ajouter un lieu"
      await page.click('button:has-text("Ajouter un lieu")');
      await page.waitForTimeout(500);
      
      // Sélectionner le type de lieu
      await page.click('text=Maison');
      await page.waitForTimeout(500);
      
      // Remplir le nom du lieu
      await page.fill('input[placeholder*="lieu"]', 'Maison Test');
      
      // Remplir la ville
      const cityInput = page.locator('input[placeholder*="ville"]');
      if (await cityInput.isVisible()) {
        await cityInput.fill('Paris');
      }
      
      // Valider le lieu
      await page.click('button:has-text("Valider")');
      await page.waitForTimeout(1000);
      
      // Suivant
      await page.click('button:has-text("Suivant")');
      await page.waitForTimeout(1000);
    });

    // 9. ÉTAPE FINALE : Récapitulatif et validation
    await test.step('Valider le récapitulatif', async () => {
      // Vérifier que le prénom apparaît dans le récapitulatif
      await expect(page.locator(`text=${childFirstName}`)).toBeVisible();
      
      // Cliquer sur "Créer le profil" ou "Terminer"
      const submitButton = page.locator('button:has-text("Créer le profil"), button:has-text("Terminer")').first();
      await submitButton.click();
      
      // Attendre la redirection vers l'espace famille
      await page.waitForURL('**/espace-famille', { timeout: 15000 });
    });

    // 10. Vérifier que l'enfant apparaît dans l'espace famille
    await test.step('Vérifier l\'affichage dans l\'espace famille', async () => {
      // Attendre que la page soit chargée
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Vérifier que le prénom de l'enfant apparaît
      const childCard = page.locator(`text=${childFirstName}`);
      await expect(childCard).toBeVisible({ timeout: 10000 });
    });

    // 11. Vérifier les données dans Supabase
    await test.step('Vérifier les données dans Supabase', async () => {
      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      expect(user).not.toBeNull();

      // Récupérer l'enfant créé
      const { data: children, error: childError } = await supabase
        .from('child_profiles')
        .select('*')
        .eq('user_id', user!.id)
        .eq('first_name', childFirstName)
        .single();

      expect(childError).toBeNull();
      expect(children).not.toBeNull();
      expect(children?.first_name).toBe(childFirstName);
      expect(children?.gender).toBe('fille');
      
      childId = children!.id;
      familyId = children!.family_id!;

      // Vérifier le proche
      const { data: familyMembers, error: relativeError } = await supabase
        .from('child_family_members')
        .select('family_member_id, family_members(*)')
        .eq('child_id', childId);

      expect(relativeError).toBeNull();
      expect(familyMembers).not.toBeNull();
      expect(familyMembers!.length).toBeGreaterThan(0);
      const relative = familyMembers![0].family_members as any;
      expect(relative.name).toBe('MarieTest');

      // Vérifier l'animal
      const { data: pets, error: petError } = await supabase
        .from('child_pets')
        .select('*')
        .eq('child_id', childId);

      expect(petError).toBeNull();
      expect(pets).not.toBeNull();
      expect(pets!.length).toBeGreaterThan(0);
      expect(pets![0].name).toBe('RexTest');

      // Vérifier le lieu
      const { data: childPlaces, error: placeError } = await supabase
        .from('child_places')
        .select('place_id, places(*)')
        .eq('child_id', childId);

      expect(placeError).toBeNull();
      expect(childPlaces).not.toBeNull();
      expect(childPlaces!.length).toBeGreaterThan(0);
      const place = childPlaces![0].places as any;
      expect(place.label).toBe('Maison Test');
    });
  });

  // Nettoyage après le test
  test.afterAll(async () => {
    if (childId) {
      // Supprimer l'enfant de test (cascade supprimera les données liées)
      await supabase
        .from('child_profiles')
        .delete()
        .eq('id', childId);
      
      console.log(`✅ Nettoyage : enfant ${childId} supprimé`);
    }
  });
});
