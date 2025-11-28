import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E統合テスト設定
 * 
 * Docker Compose環境（frontend + backend + postgres + inventory-mock）を対象とした
 * 統合E2Eテストの実行環境を定義します。
 * 
 * DEVIN-30: フロントエンドとバックエンドの統合テスト
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  timeout: 60 * 1000,
  
  fullyParallel: false, // Docker Compose環境を共有するため並列実行しない
  
  forbidOnly: !!process.env.CI,
  
  retries: process.env.CI ? 2 : 0,
  
  workers: 1, // Docker Compose環境を共有するため1ワーカーのみ
  
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    trace: 'on',
    
    screenshot: 'on',
    
    video: 'on',
    
    navigationTimeout: 30 * 1000,
    
    actionTimeout: 15 * 1000,
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

});
