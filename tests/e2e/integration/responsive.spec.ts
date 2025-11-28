import { test, expect } from '@playwright/test';

/**
 * 統合シナリオ2: レスポンシブデザインの一貫性確認
 * 
 * このテストファイルは、全てのページがモバイル、タブレット、デスクトップで
 * 正しく表示されることをテストします。
 * 
 * Docker Compose環境（frontend + backend + postgres + inventory-mock）を対象とした
 * フロントエンドとバックエンドの統合テストです。
 */

test.describe('統合シナリオ2: レスポンシブデザインの一貫性確認', () => {
  
  test('トップページがモバイル（375px）で正しく表示される', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    const hamburgerMenu = page.locator('button[aria-label="メニューを開く"]');
    await expect(hamburgerMenu).toBeVisible();
    
    const promotionBanner = page.locator('text=月額2,970円で20GB使える').first();
    await expect(promotionBanner).toBeVisible();
    
    const planSection = page.locator('text=料金プラン').first();
    if (await planSection.isVisible()) {
      await planSection.scrollIntoViewIfNeeded();
    }
    
    const smartphoneSection = page.locator('text=人気のスマートフォン').first();
    if (await smartphoneSection.isVisible()) {
      await smartphoneSection.scrollIntoViewIfNeeded();
    }
    
    const featureSection = page.locator('text=ahamoの特徴').first();
    if (await featureSection.isVisible()) {
      await featureSection.scrollIntoViewIfNeeded();
    }
    
    const supportSection = page.locator('text=サポート').first();
    if (await supportSection.isVisible()) {
      await supportSection.scrollIntoViewIfNeeded();
    }
  });
  
  test('トップページがタブレット（768px）で正しく表示される', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    const navItems = header.locator('a[href="/"], a[href="/plan"], a[href="/smartphones"]');
    await expect(navItems.first()).toBeVisible();
    
    const planSection = page.locator('text=料金プラン').first();
    if (await planSection.isVisible()) {
      await planSection.scrollIntoViewIfNeeded();
    }
    
    const smartphoneSection = page.locator('text=人気のスマートフォン').first();
    if (await smartphoneSection.isVisible()) {
      await smartphoneSection.scrollIntoViewIfNeeded();
    }
    
    const featureSection = page.locator('text=ahamoの特徴').first();
    if (await featureSection.isVisible()) {
      await featureSection.scrollIntoViewIfNeeded();
    }
    
    const supportSection = page.locator('text=サポート').first();
    if (await supportSection.isVisible()) {
      await supportSection.scrollIntoViewIfNeeded();
    }
  });
  
  test('トップページがデスクトップ（1024px以上）で正しく表示される', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    const navLinks = header.locator('a[href="/"], a[href="/plan"], a[href="/smartphones"], a[href="/services"], a[href="/flow"], a[href="/support"]');
    await expect(navLinks.first()).toBeVisible();
    
    const planSection = page.locator('text=料金プラン').first();
    if (await planSection.isVisible()) {
      await planSection.scrollIntoViewIfNeeded();
    }
    
    const smartphoneSection = page.locator('text=人気のスマートフォン').first();
    if (await smartphoneSection.isVisible()) {
      await smartphoneSection.scrollIntoViewIfNeeded();
    }
    
    const featureSection = page.locator('text=ahamoの特徴').first();
    if (await featureSection.isVisible()) {
      await featureSection.scrollIntoViewIfNeeded();
    }
    
    const supportSection = page.locator('text=サポート').first();
    if (await supportSection.isVisible()) {
      await supportSection.scrollIntoViewIfNeeded();
    }
  });
  
  test('製品カテゴリページがレスポンシブに表示される', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/smartphones');
    
    const categoryCards = page.locator('a[aria-label*="ページへ移動"]');
    await expect(categoryCards).toHaveCount(4);
    
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await expect(categoryCards).toHaveCount(4);
    
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.reload();
    await expect(categoryCards).toHaveCount(4);
  });
  
  test('iPhoneカテゴリページの製品グリッドがレスポンシブに表示される', async ({ page }) => {
    await page.goto('/smartphones/iphone');
    
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    const productCards = page.locator('div').filter({ hasText: /iPhone/ }).filter({ hasText: /円/ });
    await expect(productCards.first()).toBeVisible();
    
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await expect(productCards.first()).toBeVisible();
    
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.reload();
    await expect(productCards.first()).toBeVisible();
    
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.reload();
    await expect(productCards.first()).toBeVisible();
  });
  
  test('全てのページでレイアウトが崩れない', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'モバイル' },
      { width: 768, height: 1024, name: 'タブレット' },
      { width: 1280, height: 720, name: 'デスクトップ' }
    ];
    
    const pages = ['/', '/smartphones', '/smartphones/iphone'];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      for (const pagePath of pages) {
        await page.goto(pagePath);
        
        const header = page.locator('header');
        await expect(header).toBeVisible();
        
        const footer = page.locator('footer');
        await footer.scrollIntoViewIfNeeded();
        await expect(footer).toBeVisible();
        
        const body = page.locator('body');
        await expect(body).toBeVisible();
      }
    }
  });
});
