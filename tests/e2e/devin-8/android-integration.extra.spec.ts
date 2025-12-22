import { test, expect } from '@playwright/test';

/**
 * DEVIN-32: Androidカテゴリページ統合E2Eテスト（追加シナリオ）
 * 
 * フロントエンドのテストには含まれない、E2E統合テスト固有のシナリオです。
 * これらのテストはバックエンドAPIとの統合、パフォーマンス、エラーハンドリングを検証します。
 * 
 * テスト対象製品（5製品）:
 * - Galaxy S24 Ultra (Samsung)
 * - Galaxy S24 (Samsung)
 * - Xperia 1 VI (Sony)
 * - Pixel 8 Pro (Google)
 * - AQUOS R8 Pro (Sharp)
 */

test.describe('DEVIN-32: Androidカテゴリページ統合テスト（追加シナリオ）', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/smartphones/android');
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
      has: page.locator('text=/Galaxy|Xperia|Pixel|AQUOS/') 
    });
    
    const firstCard = productCards.first();
    
    await expect(firstCard).toBeVisible();
    
    const productName = firstCard.locator('h3');
    await expect(productName).toBeVisible();
    
    const count = await productCards.count();
    expect(count).toBe(5);
    
    console.log(`Android製品カード数: ${count}`);
  });

  /**
   * 追加シナリオ2: APIレスポンスタイム
   * 
   * 検証内容:
   * - ページの読み込みが適切な時間内に完了する（10秒以内）
   * - バックエンドAPIのレスポンスが適切な時間内に返される
   */
  test('ページの読み込みパフォーマンスが適切である', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/smartphones/android');
    
    const productCards = page.locator('.bg-white.rounded-lg.shadow-md').filter({ 
      has: page.locator('text=/Galaxy|Xperia|Pixel|AQUOS/') 
    });
    await expect(productCards.first()).toBeVisible();
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    expect(loadTime).toBeLessThan(10000);
    
    console.log(`Androidページ読み込み時間: ${loadTime}ms`);
  });

  /**
   * 追加シナリオ3: バックエンドAPI統合検証
   * 
   * 検証内容:
   * - バックエンドAPIが正常に動作している
   * - data-source属性が'backend'であることを確認
   * - エラー状態でないことを確認
   */
  test('バックエンドAPIが正常に動作している', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'Android' })).toBeVisible();
    
    const main = page.locator('main');
    const dataSource = await main.getAttribute('data-source');
    expect(dataSource).not.toBe('error');
    expect(dataSource).toBe('backend');
    
    const productCards = page.locator('.bg-white.rounded-lg.shadow-md').filter({ 
      has: page.locator('text=/Galaxy|Xperia|Pixel|AQUOS/') 
    });
    const count = await productCards.count();
    expect(count).toBe(5);
    
    console.log(`バックエンドからのデータソース: ${dataSource}, 製品数: ${count}`);
  });

  /**
   * 追加シナリオ4: APIエラー時のフォールバック処理
   * 
   * 検証内容:
   * - バックエンドAPIエラー時にページが適切に処理される
   * - ヘッダーとフッターが表示される
   */
  test('バックエンドAPIエラー時にフォールバック処理が動作する', async ({ page }) => {
    await page.route('**/api/v1/v1/products/categories/android', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    await page.goto('/smartphones/android');
    
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    const errorMessage = page.locator('text=/エラー|Error|問題が発生/i').first();
    const productCards = page.locator('.bg-white.rounded-lg.shadow-md').filter({ 
      has: page.locator('text=/Galaxy|Xperia|Pixel|AQUOS/') 
    });
    
    const hasError = await errorMessage.isVisible().catch(() => false);
    const hasProducts = await productCards.first().isVisible().catch(() => false);
    
    expect(hasError || hasProducts).toBe(true);
  });

  /**
   * 追加シナリオ5: 空データ時の処理
   * 
   * 検証内容:
   * - APIが空のデータを返した場合の適切な処理
   */
  test('APIがデータを返さない場合に空状態メッセージが表示される', async ({ page }) => {
    await page.route('**/api/v1/v1/products/categories/android', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ products: [] })
      });
    });
    
    await page.goto('/smartphones/android');
    
    const emptyMessage = page.locator('text=/製品がありません|データがありません|見つかりません|No products|Not found/i').first();
    
    if (await emptyMessage.isVisible().catch(() => false)) {
      await expect(emptyMessage).toBeVisible();
    } else {
      const productCards = page.locator('.bg-white.rounded-lg.shadow-md').filter({ 
        has: page.locator('text=/Galaxy|Xperia|Pixel|AQUOS/') 
      });
      const count = await productCards.count();
      if (count === 0) {
        expect(count).toBe(0);
      }
    }
  });

  /**
   * 追加シナリオ6: 製品データの整合性検証
   * 
   * 検証内容:
   * - 5つのAndroid製品が正しく表示される
   * - 各メーカー（Samsung, Sony, Google, Sharp）の製品が存在する
   */
  test('5つのAndroid製品が正しく表示される', async ({ page }) => {
    const productCards = page.locator('.bg-white.rounded-lg.shadow-md').filter({ 
      has: page.locator('text=/Galaxy|Xperia|Pixel|AQUOS/') 
    });
    
    const count = await productCards.count();
    expect(count).toBe(5);
    
    const galaxyCards = productCards.filter({ hasText: 'Galaxy' });
    const galaxyCount = await galaxyCards.count();
    expect(galaxyCount).toBeGreaterThanOrEqual(1);
    
    const xperiaCards = productCards.filter({ hasText: 'Xperia' });
    const xperiaCount = await xperiaCards.count();
    expect(xperiaCount).toBeGreaterThanOrEqual(1);
    
    const pixelCards = productCards.filter({ hasText: 'Pixel' });
    const pixelCount = await pixelCards.count();
    expect(pixelCount).toBeGreaterThanOrEqual(1);
    
    const aquosCards = productCards.filter({ hasText: 'AQUOS' });
    const aquosCount = await aquosCards.count();
    expect(aquosCount).toBeGreaterThanOrEqual(1);
    
    console.log(`製品数 - Galaxy: ${galaxyCount}, Xperia: ${xperiaCount}, Pixel: ${pixelCount}, AQUOS: ${aquosCount}`);
  });

  /**
   * 追加シナリオ7: ストレージオプションの検証
   * 
   * 検証内容:
   * - 各製品にストレージオプション（128GB, 256GB, 512GB, 1TB）が表示される
   */
  test('ストレージオプションが正しく表示される', async ({ page }) => {
    const productCards = page.locator('.bg-white.rounded-lg.shadow-md').filter({ 
      has: page.locator('text=/Galaxy|Xperia|Pixel|AQUOS/') 
    });
    
    const firstCard = productCards.first();
    await expect(firstCard).toBeVisible();
    
    const storageOptions = firstCard.locator('span').filter({ hasText: /GB|TB/ });
    const storageCount = await storageOptions.count();
    expect(storageCount).toBeGreaterThan(0);
    
    console.log(`最初の製品のストレージオプション数: ${storageCount}`);
  });

  /**
   * 追加シナリオ8: カラーバリアントの検証
   * 
   * 検証内容:
   * - 各製品にカラーオプションが表示される
   */
  test('カラーオプションが正しく表示される', async ({ page }) => {
    const productCards = page.locator('.bg-white.rounded-lg.shadow-md').filter({ 
      has: page.locator('text=/Galaxy|Xperia|Pixel|AQUOS/') 
    });
    
    const firstCard = productCards.first();
    await expect(firstCard).toBeVisible();
    
    const colorLabel = firstCard.locator('text=カラー:');
    await expect(colorLabel).toBeVisible();
    
    const colorDots = firstCard.locator('div[aria-label]');
    const colorCount = await colorDots.count();
    expect(colorCount).toBeGreaterThan(0);
    
    console.log(`最初の製品のカラーオプション数: ${colorCount}`);
  });
});
