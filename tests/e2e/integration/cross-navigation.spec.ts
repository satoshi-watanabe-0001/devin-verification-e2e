import { test, expect } from '@playwright/test';

/**
 * 統合シナリオ5: カテゴリ間クロスナビゲーション確認
 * 
 * このテストファイルは、製品カテゴリページ間のナビゲーションが
 * 正しく機能することをテストします。
 * 
 * Docker Compose環境（frontend + backend + postgres + inventory-mock）を対象とした
 * フロントエンドとバックエンドの統合テストです。
 */

test.describe('統合シナリオ5: カテゴリ間クロスナビゲーション確認', () => {
  
  test('iPhoneページからAndroidページへの遷移確認', async ({ page }) => {
    await page.goto('/smartphones/iphone');
    await expect(page).toHaveURL('/smartphones/iphone');
    
    const pageTitle = page.locator('h1', { hasText: 'iPhone' });
    await expect(pageTitle).toBeVisible();
    
    await page.goto('/smartphones/android');
    await expect(page).toHaveURL('/smartphones/android');
    
    const androidTitle = page.locator('h1', { hasText: 'Android' });
    await expect(androidTitle).toBeVisible();
    
    const description = page.locator('text=さまざまなメーカーから選べるAndroidスマートフォン');
    await expect(description).toBeVisible();
    
    const main = page.locator('main');
    await expect(main).toHaveClass(/from-green-100/);
    
    const productCount = page.locator('text=/件の製品が見つかりました/');
    await expect(productCount).toBeVisible();
  });

  test('AndroidページからiPhoneページへの遷移確認', async ({ page }) => {
    await page.goto('/smartphones/android');
    await expect(page).toHaveURL('/smartphones/android');
    
    const androidTitle = page.locator('h1', { hasText: 'Android' });
    await expect(androidTitle).toBeVisible();
    
    await page.goto('/smartphones/iphone');
    await expect(page).toHaveURL('/smartphones/iphone');
    
    const iphoneTitle = page.locator('h1', { hasText: 'iPhone' });
    await expect(iphoneTitle).toBeVisible();
    
    const description = page.locator('text=Apple製の高品質なスマートフォン');
    await expect(description).toBeVisible();
    
    const main = page.locator('main');
    await expect(main).toHaveClass(/from-gray-100/);
  });

  test('ドコモ認定リユース品ページへの遷移確認', async ({ page }) => {
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

  test('無効なブランドページの404処理確認', async ({ page }) => {
    await page.goto('/smartphones/invalid-brand');
    
    const notFoundText = page.locator('text=404');
    await expect(notFoundText).toBeVisible();
    
    const errorMessage = page.locator('text=/This page could not be found/');
    await expect(errorMessage).toBeVisible();
  });

  test('全カテゴリページ間の連続遷移確認', async ({ page }) => {
    await page.goto('/smartphones/iphone');
    await expect(page.locator('h1', { hasText: 'iPhone' })).toBeVisible();
    
    await page.goto('/smartphones/android');
    await expect(page.locator('h1', { hasText: 'Android' })).toBeVisible();
    
    await page.goto('/smartphones/docomo-certified');
    await expect(page.locator('h1', { hasText: 'ドコモ認定リユース品' })).toBeVisible();
    
    await page.goto('/smartphones/iphone');
    await expect(page.locator('h1', { hasText: 'iPhone' })).toBeVisible();
  });
});
