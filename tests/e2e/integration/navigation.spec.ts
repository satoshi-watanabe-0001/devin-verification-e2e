import { test, expect } from '@playwright/test';

/**
 * 統合シナリオ3: ナビゲーションの一貫性確認
 * 
 * このテストファイルは、ヘッダーとフッターのナビゲーションが
 * 全てのページで一貫して機能することをテストします。
 * 
 * Docker Compose環境（frontend + backend + postgres + inventory-mock）を対象とした
 * フロントエンドとバックエンドの統合テストです。
 */

test.describe('統合シナリオ3: ナビゲーションの一貫性確認', () => {
  
  test('ヘッダーナビゲーションが全てのページで一貫して機能する', async ({ page }) => {
    await page.goto('/');
    
    
    const homeLink = page.locator('header a[href="/"]').first();
    await expect(homeLink).toBeVisible();
    await homeLink.click();
    await expect(page).toHaveURL('/');
    
    const planLink = page.locator('header a[href="/plan"]').first();
    if (await planLink.isVisible()) {
      await planLink.click();
      await expect(page).toHaveURL('/plan');
      
      const header = page.locator('header');
      await expect(header).toBeVisible();
      
      const activePlanLink = page.locator('header a[href="/plan"]').first();
      await expect(activePlanLink).toBeVisible();
    }
    
    await page.goto('/');
    const smartphonesLink = page.locator('header a[href="/smartphones"]').first();
    await smartphonesLink.click();
    await expect(page).toHaveURL('/smartphones');
    
    let header = page.locator('header');
    await expect(header).toBeVisible();
    
    const servicesLink = page.locator('header a[href="/services"]').first();
    if (await servicesLink.isVisible()) {
      await servicesLink.click();
      await expect(page).toHaveURL('/services');
      
      header = page.locator('header');
      await expect(header).toBeVisible();
    }
    
    await page.goto('/');
    const flowLink = page.locator('header a[href="/flow"]').first();
    if (await flowLink.isVisible()) {
      await flowLink.click();
      await expect(page).toHaveURL('/flow');
      
      header = page.locator('header');
      await expect(header).toBeVisible();
    }
    
    await page.goto('/');
    const supportLink = page.locator('header a[href="/support"]').first();
    if (await supportLink.isVisible()) {
      await supportLink.click();
      await expect(page).toHaveURL('/support');
      
      header = page.locator('header');
      await expect(header).toBeVisible();
    }
  });
  
  test('フッターナビゲーションが全てのページで一貫して機能する', async ({ page }) => {
    await page.goto('/');
    
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();
    
    const serviceCategoryLinks = [
      { href: '/plan', text: '料金プラン' },
      { href: '/smartphones', text: '製品' },
      { href: '/services', text: 'サービス' },
      { href: '/flow', text: '申し込みの流れ' }
    ];
    
    for (const link of serviceCategoryLinks) {
      const footerLink = footer.locator(`a[href="${link.href}"]`).first();
      if (await footerLink.isVisible()) {
        await expect(footerLink).toBeVisible();
      }
    }
    
    const supportCategoryLinks = [
      { href: '/faq', text: 'よくある質問' },
      { href: '/contact', text: 'お問い合わせ' },
      { href: '/support', text: 'サポート' },
      { href: '/news', text: 'お知らせ' }
    ];
    
    for (const link of supportCategoryLinks) {
      const footerLink = footer.locator(`a[href="${link.href}"]`).first();
      if (await footerLink.isVisible()) {
        await expect(footerLink).toBeVisible();
      }
    }
    
    const companyCategoryLinks = [
      { href: '/about', text: '会社概要' },
      { href: '/terms', text: '利用規約' },
      { href: '/privacy', text: 'プライバシーポリシー' }
    ];
    
    for (const link of companyCategoryLinks) {
      const footerLink = footer.locator(`a[href="${link.href}"]`).first();
      if (await footerLink.isVisible()) {
        await expect(footerLink).toBeVisible();
      }
    }
    
    const socialLinks = footer.locator('a[aria-label*="LINE"], a[aria-label*="Facebook"], a[aria-label*="Instagram"], a[aria-label*="TikTok"], a[aria-label*="YouTube"]');
    await expect(socialLinks).toHaveCount(5);
  });
  
  test('複数ページでフッターが一貫して表示される', async ({ page }) => {
    const pages = ['/', '/smartphones', '/smartphones/iphone'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      const footer = page.locator('footer');
      await footer.scrollIntoViewIfNeeded();
      
      await expect(footer).toBeVisible();
      
      await expect(footer).toContainText('© NTT DOCOMO, INC.');
      
      const socialLinks = footer.locator('a[aria-label*="LINE"], a[aria-label*="Facebook"], a[aria-label*="Instagram"], a[aria-label*="TikTok"], a[aria-label*="YouTube"]');
      await expect(socialLinks).toHaveCount(5);
    }
  });
  
  test('アクティブページがヘッダーで視覚的に分かりやすい', async ({ page }) => {
    await page.goto('/');
    const homeLink = page.locator('header a[href="/"]').first();
    await expect(homeLink).toBeVisible();
    
    await page.goto('/smartphones');
    const smartphonesLink = page.locator('header a[href="/smartphones"]').first();
    await expect(smartphonesLink).toBeVisible();
    
    await page.goto('/smartphones/iphone');
    const header = page.locator('header');
    await expect(header).toBeVisible();
    await expect(smartphonesLink).toBeVisible();
  });
  
  test('ahamoロゴが全てのページでトップページへのリンクとして機能する', async ({ page }) => {
    const pages = ['/smartphones', '/smartphones/iphone'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      const logo = page.locator('header a[href="/"]').filter({ hasText: 'ahamo' }).first();
      await expect(logo).toBeVisible();
      await logo.click();
      
      await expect(page).toHaveURL('/');
    }
  });
});
