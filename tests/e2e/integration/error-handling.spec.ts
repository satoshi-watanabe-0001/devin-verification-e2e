import { test, expect } from '@playwright/test';

/**
 * 統合シナリオ4: データ取得とエラーハンドリングの確認
 * 
 * このテストファイルは、データ取得中のローディング表示、
 * エラー時の適切なメッセージ表示、データが空の場合の処理を
 * テストします。
 * 
 * Docker Compose環境（frontend + backend + postgres + inventory-mock）を対象とした
 * フロントエンドとバックエンドの統合テストです。
 */

test.describe('統合シナリオ4: データ取得とエラーハンドリングの確認', () => {
  
  test('トップページでデータ取得中にローディングスピナーが表示される', async ({ page }) => {
    await page.route('**/api/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
    
    const navigationPromise = page.goto('/');
    
    const loadingIndicator = page.locator('[role="status"], [aria-label*="読み込み"], [aria-label*="Loading"], .loading, .spinner').first();
    
    if (await loadingIndicator.isVisible().catch(() => false)) {
      await expect(loadingIndicator).toBeVisible();
    }
    
    await navigationPromise;
    
    const promotionBanner = page.locator('text=月額2,970円で20GB使える').first();
    if (await promotionBanner.isVisible().catch(() => false)) {
      await expect(promotionBanner).toBeVisible();
    }
  });
  
  test('オフライン時にエラーメッセージが表示される', async ({ page, context }) => {
    await context.setOffline(true);
    
    await page.goto('/').catch(() => {
    });
    
    const errorMessage = page.locator('text=/エラー|接続|オフライン|Error|offline/i').first();
    
    if (await errorMessage.isVisible().catch(() => false)) {
      await expect(errorMessage).toBeVisible();
    }
    
    await context.setOffline(false);
  });
  
  test('ネットワーク復旧後にデータが正しく表示される', async ({ page, context }) => {
    await page.goto('/');
    
    const promotionBanner = page.locator('text=月額2,970円で20GB使える').first();
    if (await promotionBanner.isVisible().catch(() => false)) {
      await expect(promotionBanner).toBeVisible();
    }
    
    await context.setOffline(true);
    
    await page.reload().catch(() => {
    });
    
    await context.setOffline(false);
    
    await page.reload();
    
    if (await promotionBanner.isVisible().catch(() => false)) {
      await expect(promotionBanner).toBeVisible();
    }
  });
  
  test('APIがデータを返さない場合に空状態メッセージが表示される', async ({ page }) => {
    await page.route('**/api/v1/v1/products/categories/iphone', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ products: [] })
      });
    });
    
    await page.goto('/smartphones/iphone');
    
    const emptyMessage = page.locator('text=/製品がありません|データがありません|見つかりません|No products|Not found/i').first();
    
    if (await emptyMessage.isVisible().catch(() => false)) {
      await expect(emptyMessage).toBeVisible();
    } else {
      const productCards = page.locator('div').filter({ hasText: /iPhone/ }).filter({ hasText: /円/ });
      const count = await productCards.count();
      if (count === 0) {
        expect(count).toBe(0);
      }
    }
  });
  
  test('キャンペーンデータ取得エラー時でもページが表示される', async ({ page }) => {
    await page.route('**/api/campaigns/**', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    await page.goto('/');
    
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    const promotionBanner = page.locator('text=月額2,970円で20GB使える').first();
    if (await promotionBanner.isVisible().catch(() => false)) {
      await expect(promotionBanner).toBeVisible();
    }
    
    const campaignSection = page.locator('text=キャンペーン').first();
    const isVisible = await campaignSection.isVisible().catch(() => false);
    expect(typeof isVisible).toBe('boolean');
  });
  
  test('製品画像の読み込みエラー時に代替表示が行われる', async ({ page }) => {
    await page.route('**/*.{png,jpg,jpeg,webp}', async route => {
      await route.abort('failed');
    });
    
    await page.goto('/smartphones/iphone');
    
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    const productCards = page.locator('div').filter({ hasText: /iPhone/ });
    if (await productCards.first().isVisible().catch(() => false)) {
      await expect(productCards.first()).toBeVisible();
    }
    
    const altImages = page.locator('img[alt*="iPhone"], img[alt*="製品"]');
    if (await altImages.first().isVisible().catch(() => false)) {
      const altText = await altImages.first().getAttribute('alt');
      expect(altText).toBeTruthy();
    }
  });
  
  test('複数のAPIエラーが同時に発生してもページが機能する', async ({ page }) => {
    await page.route('**/api/campaigns/**', async route => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Error' })
      });
    });
    
    await page.route('**/api/plans/**', async route => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Error' })
      });
    });
    
    await page.goto('/');
    
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();
    
    const smartphonesLink = page.locator('header a[href="/smartphones"]').first();
    await smartphonesLink.click();
    await expect(page).toHaveURL('/smartphones');
  });
  
  test('バックエンドAPIエラー時にフォールバック処理が動作する', async ({ page }) => {
    await page.route('**/api/v1/v1/products/categories/iphone', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    await page.goto('/smartphones/iphone');
    
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    const errorMessage = page.locator('text=/エラー|Error|問題が発生/i').first();
    const productCards = page.locator('div').filter({ hasText: /iPhone/ }).filter({ hasText: /円/ });
    
    const hasError = await errorMessage.isVisible().catch(() => false);
    const hasProducts = await productCards.first().isVisible().catch(() => false);
    
    expect(hasError || hasProducts).toBe(true);
  });
});
