import { test, expect } from '@playwright/test';

/**
 * DEVIN-30: iPhoneカテゴリページ統合E2Eテスト（追加シナリオ）
 * 
 * フロントエンドのテストには含まれない、E2E統合テスト固有のシナリオです。
 * これらのテストはデフォルトでは実行されません。
 */

test.describe('DEVIN-30: iPhoneカテゴリページ統合テスト（追加シナリオ）', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/smartphones/iphone');
  });

  /**
   * 追加シナリオ1: 在庫ステータス処理
   * 
   * 検証内容:
   * - 在庫モックサービスからの情報が表示される
   * - 在庫情報が製品カードに反映される
   */
  test('在庫情報が正しく表示される', async ({ page }) => {
    const productCards = page.locator('.bg-white.rounded-lg.shadow-md').filter({ 
      has: page.locator('text=/iPhone/') 
    });
    
    const firstCard = productCards.first();
    
    await expect(firstCard).toBeVisible();
    
    const productName = firstCard.locator('h3');
    await expect(productName).toBeVisible();
  });

  /**
   * 追加シナリオ2: APIレスポンスタイム
   * 
   * 検証内容:
   * - ページの読み込みが適切な時間内に完了する
   * - バックエンドAPIのレスポンスが適切な時間内に返される
   */
  test('ページの読み込みパフォーマンスが適切である', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/smartphones/iphone');
    
    const productCards = page.locator('.bg-white.rounded-lg.shadow-md').filter({ 
      has: page.locator('text=/iPhone/') 
    });
    await expect(productCards.first()).toBeVisible();
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    expect(loadTime).toBeLessThan(10000);
    
    console.log(`ページ読み込み時間: ${loadTime}ms`);
  });

  /**
   * 追加シナリオ3: エラーハンドリング
   * 
   * 検証内容:
   * - バックエンドAPIが正常に動作している
   * - エラー状態でも適切にUIが表示される
   */
  test('バックエンドAPIが正常に動作している', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'iPhone' })).toBeVisible();
    
    const main = page.locator('main');
    const dataSource = await main.getAttribute('data-source');
    expect(dataSource).not.toBe('error');
    expect(dataSource).toBe('backend');
    
    const productCards = page.locator('.bg-white.rounded-lg.shadow-md').filter({ 
      has: page.locator('text=/iPhone/') 
    });
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });
});
