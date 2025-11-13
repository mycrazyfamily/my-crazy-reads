import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright pour les tests E2E de MCF
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  
  // Temps maximum par test
  timeout: 60 * 1000,
  
  // Temps maximum pour les assertions
  expect: {
    timeout: 10000
  },
  
  // Configuration du lancement des tests
  fullyParallel: false, // Tests séquentiels pour éviter les conflits DB
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  
  // Reporter
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],
  
  // Configuration partagée pour tous les projets
  use: {
    // URL de base de l'application
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8080',
    
    // Capture des traces en cas d'échec
    trace: 'on-first-retry',
    
    // Capture des screenshots en cas d'échec
    screenshot: 'only-on-failure',
    
    // Enregistrement vidéo en cas d'échec
    video: 'retain-on-failure',
  },

  // Configuration des projets (navigateurs)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Décommenter pour tester sur d'autres navigateurs
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

  // Serveur de développement (optionnel)
  // Décommenter si vous voulez que Playwright lance automatiquement le serveur
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:8080',
  //   reuseExistingServer: !process.env.CI,
  // },
});
