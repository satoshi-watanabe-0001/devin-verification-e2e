import { test, expect } from '@playwright/test';

/**
 * DEVIN-7: iPhoneカテゴリページ閲覧
 * 
 * このテストファイルはiPhoneカテゴリページの表示と機能をテストします。
 * Docker Compose環境（frontend + backend + postgres + inventory-mock）を対象とした
 * フロントエンドとバックエンドの統合テストです。
 * 
 * テスト実行前提条件:
 * - Docker Compose環境が起動していること
 *   `docker-compose -f docker-compose.e2e.yml up -d`
 * - フロントエンド: http://localhost:3000
 * - バックエンドAPI: http://localhost:8080
 */

test.describe('DEVIN-7: iPhoneカテゴリページ閲覧', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/smartphones/iphone');
  });

  test('7-1: iPhoneカテゴリページへの遷移確認', async ({ page }) => {
    await expect(page).toHaveURL('/smartphones/iphone');

    const pageTitle = page.locator('h1', { hasText: 'iPhone' });
    await expect(pageTitle).toBeVisible();

    const description = page.locator('text=Apple製の高品質なスマートフォン');
    await expect(description).toBeVisible();

    const main = page.locator('main');
    await expect(main).toHaveClass(/from-gray-100/);
  });

  test('7-2: iPhoneキャンペーンバナーの表示確認', async ({ page }) => {
    const campaignBanner = page.locator('text=iPhone特別キャンペーン実施中！');
    await expect(campaignBanner).toBeVisible();

    const campaignDescription = page.locator('text=対象機種が最大15,000円引き');
    await expect(campaignDescription).toBeVisible();
  });

  test('7-3: iPhone製品グリッドの表示確認', async ({ page }) => {
    const productCount = page.locator('text=/件の製品が見つかりました/');
    await expect(productCount).toBeVisible();

    const productCards = page.locator('.bg-white.rounded-lg.shadow-md').filter({ has: page.locator('text=/iPhone/') });
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);

    const firstCard = productCards.first();
    
    await expect(firstCard.locator('h3')).toBeVisible();
    
    const priceInfo = firstCard.locator('text=/円/').first();
    await expect(priceInfo).toBeVisible();
    
    const storageOptions = firstCard.locator('text=/GB/');
    await expect(storageOptions.first()).toBeVisible();
    
    const colorOptions = firstCard.locator('div[aria-label]').filter({ has: page.locator('text=/カラー/') });
    await expect(colorOptions.first()).toBeVisible();
  });

  test('7-4: 製品並び替え機能の確認', async ({ page }) => {
    const sortSelect = page.locator('select#sort');
    await expect(sortSelect).toBeVisible();

    await expect(sortSelect).toHaveValue('name');

    await sortSelect.selectOption('price');
    await page.waitForTimeout(500);

    await expect(sortSelect).toHaveValue('price');

    await sortSelect.selectOption('name');
    await page.waitForTimeout(500);

    await expect(sortSelect).toHaveValue('name');
  });

  test('7-5: ドコモオンラインショップへのリンク確認', async ({ page }) => {
    const purchaseButtons = page.locator('a', { hasText: 'ドコモオンラインショップで購入' });
    await expect(purchaseButtons.first()).toBeVisible();

    const firstButton = purchaseButtons.first();
    const href = await firstButton.getAttribute('href');
    expect(href).toContain('onlineshop.smt.docomo.ne.jp');

    const target = await firstButton.getAttribute('target');
    expect(target).toBe('_blank');

    const rel = await firstButton.getAttribute('rel');
    expect(rel).toContain('noopener');
    expect(rel).toContain('noreferrer');
  });

  test('7-6: Androidカテゴリページの表示確認', async ({ page }) => {
    await page.goto('/smartphones/android');

    await expect(page).toHaveURL('/smartphones/android');

    const pageTitle = page.locator('h1', { hasText: 'Android' });
    await expect(pageTitle).toBeVisible();

    const description = page.locator('text=さまざまなメーカーから選べるAndroidスマートフォン');
    await expect(description).toBeVisible();

    const main = page.locator('main');
    await expect(main).toHaveClass(/from-green-100/);

    const comingSoon = page.locator('text=製品一覧は準備中です');
    await expect(comingSoon).toBeVisible();
  });

  test('7-7: ドコモ認定リユース品ページの表示確認', async ({ page }) => {
    await page.goto('/smartphones/docomo-certified');

    await expect(page).toHaveURL('/smartphones/docomo-certified');

    const pageTitle = page.locator('h1', { hasText: 'ドコモ認定リユース品' });
    await expect(pageTitle).toBeVisible();

    const description = page.locator('text=厳格な検査をクリアした高品質なリユーススマートフォン');
    await expect(description).toBeVisible();

    const exchangeInfo = page.locator('text=30日以内無料交換可能');
    await expect(exchangeInfo).toBeVisible();

    const main = page.locator('main');
    await expect(main).toHaveClass(/from-emerald-100/);

    const comingSoon = page.locator('text=製品一覧は準備中です');
    await expect(comingSoon).toBeVisible();
  });

  test('7-8: 無効なブランドページの404処理確認', async ({ page }) => {
    await page.goto('/smartphones/invalid-brand');

    const notFoundText = page.locator('text=404');
    await expect(notFoundText).toBeVisible();

    const errorMessage = page.locator('text=/This page could not be found/');
    await expect(errorMessage).toBeVisible();
  });

  test('7-9: iPhoneページのレスポンシブ対応確認', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/smartphones/iphone');

    const grid = page.locator('.grid').filter({ has: page.locator('text=/iPhone/') });
    await expect(grid.first()).toBeVisible();

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/smartphones/iphone');
    await expect(grid.first()).toBeVisible();

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/smartphones/iphone');
    await expect(grid.first()).toBeVisible();

    const productCards = page.locator('.bg-white.rounded-lg.shadow-md').filter({ has: page.locator('text=/iPhone/') });
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('7-10: 製品カードの詳細情報表示確認', async ({ page }) => {
    const firstCard = page.locator('.bg-white.rounded-lg.shadow-md').filter({ has: page.locator('text=/iPhone/') }).first();
    await expect(firstCard).toBeVisible();

    const productName = firstCard.locator('h3');
    await expect(productName).toBeVisible();

    const regularPrice = firstCard.locator('text=/円/').first();
    await expect(regularPrice).toBeVisible();

    const storageButtons = firstCard.locator('span').filter({ hasText: /GB/ });
    const storageCount = await storageButtons.count();
    expect(storageCount).toBeGreaterThan(0);

    const colorDots = firstCard.locator('div[aria-label]');
    const colorCount = await colorDots.count();
    expect(colorCount).toBeGreaterThan(0);

    const purchaseButton = firstCard.locator('a', { hasText: 'ドコモオンラインショップで購入' });
    await expect(purchaseButton).toBeVisible();
  });
});
