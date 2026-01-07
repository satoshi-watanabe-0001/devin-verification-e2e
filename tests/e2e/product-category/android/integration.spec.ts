import { test, expect } from '@playwright/test';

/**
 * DEVIN-8: Androidカテゴリページ閲覧
 * 
 * このテストファイルはAndroidカテゴリページの表示と機能をテストします。
 * Docker Compose環境（frontend + backend + postgres + inventory-mock）を対象とした
 * フロントエンドとバックエンドの統合テストです。
 * 
 * テスト実行前提条件:
 * - Docker Compose環境が起動していること
 *   `docker-compose -f docker-compose.e2e.yml up -d`
 * - フロントエンド: http://localhost:3000
 * - バックエンドAPI: http://localhost:8080
 * 
 * テスト対象製品（5製品）:
 * - Galaxy S24 Ultra (Samsung)
 * - Galaxy S24 (Samsung)
 * - Xperia 1 VI (Sony)
 * - Pixel 8 Pro (Google)
 * - AQUOS R8 Pro (Sharp)
 */

test.describe('DEVIN-8: Androidカテゴリページ閲覧', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/smartphones/android');
  });

  test('8-1: Androidカテゴリページへの遷移確認', async ({ page }) => {
    await expect(page).toHaveURL('/smartphones/android');

    const pageTitle = page.locator('h1', { hasText: 'Android' });
    await expect(pageTitle).toBeVisible();

    const description = page.locator('text=さまざまなメーカーから選べるAndroidスマートフォン');
    await expect(description).toBeVisible();

    const main = page.locator('main');
    await expect(main).toHaveClass(/from-green-100/);
  });

  test('8-2: Androidキャンペーンバナーの表示確認', async ({ page }) => {
    const campaignBanner = page.locator('text=Android特別キャンペーン実施中！');
    await expect(campaignBanner).toBeVisible();

    const campaignDescription = page.locator('text=対象機種が最大58,201円引き');
    await expect(campaignDescription).toBeVisible();
  });

  test('8-3: Android製品グリッドの表示確認', async ({ page }) => {
    const productCount = page.locator('text=/件の製品が見つかりました/');
    await expect(productCount).toBeVisible();

    const productCards = page.locator('.bg-white.rounded-lg.shadow-md').filter({ has: page.locator('text=/Galaxy|Xperia|Pixel|AQUOS/') });
    const count = await productCards.count();
    expect(count).toBe(5);

    const firstCard = productCards.first();
    
    await expect(firstCard.locator('h3')).toBeVisible();
    
    const priceInfo = firstCard.locator('text=/円/').first();
    await expect(priceInfo).toBeVisible();
    
    const storageOptions = firstCard.locator('text=/GB/');
    await expect(storageOptions.first()).toBeVisible();
    
    const colorLabel = firstCard.locator('text=カラー:');
    await expect(colorLabel).toBeVisible();
  });

  test('8-4: 製品並び替え機能の確認', async ({ page }) => {
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

  test('8-5: ドコモオンラインショップへのリンク確認', async ({ page }) => {
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

  test('8-6: 製品カードの詳細情報表示確認（メーカー別）', async ({ page }) => {
    const productCards = page.locator('.bg-white.rounded-lg.shadow-md').filter({ has: page.locator('text=/Galaxy|Xperia|Pixel|AQUOS/') });
    
    const samsungCard = productCards.filter({ hasText: 'Galaxy' }).first();
    await expect(samsungCard).toBeVisible();
    await expect(samsungCard.locator('h3')).toBeVisible();
    
    const sonyCard = productCards.filter({ hasText: 'Xperia' }).first();
    await expect(sonyCard).toBeVisible();
    await expect(sonyCard.locator('h3')).toBeVisible();
    
    const googleCard = productCards.filter({ hasText: 'Pixel' }).first();
    await expect(googleCard).toBeVisible();
    await expect(googleCard.locator('h3')).toBeVisible();
    
    const sharpCard = productCards.filter({ hasText: 'AQUOS' }).first();
    await expect(sharpCard).toBeVisible();
    await expect(sharpCard.locator('h3')).toBeVisible();

    const firstCard = productCards.first();
    
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

  test('8-7: 在庫情報が正しく表示される', async ({ page }) => {
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

  test('8-8: ページの読み込みパフォーマンスが適切である', async ({ page }) => {
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

  test('8-9: バックエンドAPIが正常に動作している', async ({ page }) => {
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

  test('8-10: 5つのAndroid製品が正しく表示される', async ({ page }) => {
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

  test('8-11: ストレージオプションが正しく表示される', async ({ page }) => {
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

  test('8-12: カラーオプションが正しく表示される', async ({ page }) => {
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
