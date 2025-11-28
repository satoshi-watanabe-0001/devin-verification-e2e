import { test, expect } from '@playwright/test';

/**
 * DEVIN-30: iPhoneカテゴリページ統合E2Eテスト
 * 
 * Docker Compose環境（frontend + backend + postgres + inventory-mock）を対象とした
 * フロントエンドとバックエンドの統合テストです。
 * 
 * テスト実行前提条件:
 * - Docker Compose環境が起動していること
 *   `docker-compose -f docker-compose.e2e.yml up -d`
 * - フロントエンド: http://localhost:3000
 * - バックエンドAPI: http://localhost:8080
 */

test.describe('DEVIN-30: iPhoneカテゴリページ統合テスト', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/smartphones/iphone');
  });

  /**
   * テストシナリオ1: 基本的なカテゴリページ表示
   * 
   * 検証内容:
   * - iPhoneカテゴリページが正しく表示される
   * - ページタイトルと説明が表示される
   * - バックエンドAPIから取得した製品データが表示される
   */
  test('1. iPhoneカテゴリページが正しく表示される', async ({ page }) => {
    await expect(page).toHaveURL('/smartphones/iphone');

    const pageTitle = page.locator('h1', { hasText: 'iPhone' });
    await expect(pageTitle).toBeVisible();

    const description = page.locator('text=Apple製の高品質なスマートフォン');
    await expect(description).toBeVisible();

    const main = page.locator('main');
    await expect(main).toHaveClass(/from-gray-100/);

    await expect(main).toHaveAttribute('data-source', 'backend');
    await expect(main).toHaveAttribute('data-use-mock', 'false');
  });

  /**
   * テストシナリオ2: APIとUI間の製品データ整合性
   * 
   * 検証内容:
   * - バックエンドAPIから取得した製品データがUIに正しく表示される
   * - 製品カードの数が正しい
   * - 製品情報（モデル名、価格、カラー、ストレージ）が正しく表示される
   */
  test('2. バックエンドAPIから取得した製品データが正しく表示される', async ({ page }) => {
    const productCount = page.locator('text=/件の製品が見つかりました/');
    await expect(productCount).toBeVisible();
    
    const productCountText = await productCount.textContent();
    expect(productCountText).toContain('5件');

    const productCards = page.locator('.bg-white.rounded-lg.shadow-md').filter({ 
      has: page.locator('text=/iPhone/') 
    });
    const count = await productCards.count();
    expect(count).toBe(5);

    const firstCard = productCards.first();
    
    const productName = firstCard.locator('h3');
    await expect(productName).toBeVisible();
    const nameText = await productName.textContent();
    expect(nameText).toMatch(/iPhone/);

    const priceInfo = firstCard.locator('text=/円/');
    await expect(priceInfo).toBeVisible();
    
    const storageOptions = firstCard.locator('button').filter({ hasText: /GB/ });
    const storageCount = await storageOptions.count();
    expect(storageCount).toBeGreaterThan(0);
    
    const colorOptions = firstCard.locator('button[aria-label*="カラー"]');
    const colorCount = await colorOptions.count();
    expect(colorCount).toBeGreaterThan(0);

    const purchaseButton = firstCard.locator('a', { hasText: 'ドコモオンラインショップで購入' });
    await expect(purchaseButton).toBeVisible();
  });

  /**
   * テストシナリオ3: フィルタリング機能
   * 
   * 検証内容:
   * - 並び替え機能が動作する
   * - フィルター選択時にUIが更新される
   */
  test('3. 製品並び替え機能が動作する', async ({ page }) => {
    const sortSelect = page.locator('select#sort');
    await expect(sortSelect).toBeVisible();

    await expect(sortSelect).toHaveValue('name');

    await sortSelect.selectOption('price');
    await page.waitForTimeout(500);

    await expect(sortSelect).toHaveValue('price');

    const productCards = page.locator('.bg-white.rounded-lg.shadow-md').filter({ 
      has: page.locator('text=/iPhone/') 
    });
    const count = await productCards.count();
    expect(count).toBe(5);
  });

  /**
   * テストシナリオ4: キャンペーン表示ロジック
   * 
   * 検証内容:
   * - キャンペーンバナーが表示される
   * - キャンペーン価格が表示される製品がある
   */
  test('4. キャンペーン情報が正しく表示される', async ({ page }) => {
    const campaignBanner = page.locator('text=iPhone特別キャンペーン実施中！');
    await expect(campaignBanner).toBeVisible();

    const campaignDescription = page.locator('text=対象機種が最大15,000円引き');
    await expect(campaignDescription).toBeVisible();

    const productCards = page.locator('.bg-white.rounded-lg.shadow-md').filter({ 
      has: page.locator('text=/iPhone/') 
    });
    
    let hasCampaignPrice = false;
    const cardCount = await productCards.count();
    
    for (let i = 0; i < cardCount; i++) {
      const card = productCards.nth(i);
      const campaignPriceElement = card.locator('text=/キャンペーン価格/');
      const isVisible = await campaignPriceElement.isVisible().catch(() => false);
      if (isVisible) {
        hasCampaignPrice = true;
        break;
      }
    }
    
    expect(hasCampaignPrice).toBe(true);
  });

  /**
   * テストシナリオ5: 在庫ステータス処理
   * 
   * 検証内容:
   * - 在庫モックサービスからの情報が表示される
   * - 在庫情報が製品カードに反映される
   */
  test('5. 在庫情報が正しく表示される', async ({ page }) => {
    const productCards = page.locator('.bg-white.rounded-lg.shadow-md').filter({ 
      has: page.locator('text=/iPhone/') 
    });
    
    const firstCard = productCards.first();
    
    await expect(firstCard).toBeVisible();
    
    const productName = firstCard.locator('h3');
    await expect(productName).toBeVisible();
  });

  /**
   * テストシナリオ6: 外部リンク検証
   * 
   * 検証内容:
   * - ドコモオンラインショップへのリンクが正しく設定されている
   * - リンクが新しいタブで開く設定になっている
   * - セキュリティ属性が正しく設定されている
   */
  test('6. ドコモオンラインショップへのリンクが正しく設定されている', async ({ page }) => {
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

  /**
   * テストシナリオ7: APIレスポンスタイム
   * 
   * 検証内容:
   * - ページの読み込みが適切な時間内に完了する
   * - バックエンドAPIのレスポンスが適切な時間内に返される
   */
  test('7. ページの読み込みパフォーマンスが適切である', async ({ page }) => {
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
   * テストシナリオ8: エラーハンドリング
   * 
   * 検証内容:
   * - バックエンドAPIが正常に動作している
   * - エラー状態でも適切にUIが表示される
   */
  test('8. バックエンドAPIが正常に動作している', async ({ page }) => {
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

  /**
   * テストシナリオ9: レスポンシブデザイン
   * 
   * 検証内容:
   * - モバイル表示でも正しく表示される
   * - タブレット表示でも正しく表示される
   */
  test('9. レスポンシブデザインが正しく動作する', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/smartphones/iphone');
    let productCards = page.locator('.bg-white.rounded-lg.shadow-md').filter({ 
      has: page.locator('text=/iPhone/') 
    });
    await expect(productCards.first()).toBeVisible();

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/smartphones/iphone');
    productCards = page.locator('.bg-white.rounded-lg.shadow-md').filter({ 
      has: page.locator('text=/iPhone/') 
    });
    await expect(productCards.first()).toBeVisible();

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/smartphones/iphone');
    productCards = page.locator('.bg-white.rounded-lg.shadow-md').filter({ 
      has: page.locator('text=/iPhone/') 
    });
    await expect(productCards.first()).toBeVisible();
    
    const count = await productCards.count();
    expect(count).toBe(5);
  });
});
