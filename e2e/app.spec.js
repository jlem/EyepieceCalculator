import { test, expect } from '@playwright/test';

test.describe('Eyepiece Calculator E2E Tests', () => {
  test('should render simple setup tab default layout and show computed stats', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page.locator('h1')).toHaveText('Eyepiece Planner');

    // Check simple controls are rendered
    await expect(page.locator('#fratio')).toHaveValue('5');
    await expect(page.locator('#fl-ap-input')).toHaveValue('1000');

    // Default eyepiece count should be calculated
    const countVal = await page.locator('#out-count').textContent();
    expect(countVal).not.toBe('—');
  });

  test('should switch to advanced layout tab and display transition options', async ({ page }) => {
    await page.goto('/');

    // Switch to Advanced Setup
    await page.click('button:has-text("Advanced Setup")');

    // Transition slider and strategy cards should be visible
    await expect(page.locator('#adv-trans-slider')).toBeVisible();
    await expect(page.locator('#card-low')).toBeVisible();
    await expect(page.locator('#card-high')).toBeVisible();
  });

  test('should trigger error outlines on range violations', async ({ page }) => {
    await page.goto('/');

    // Open the closed wrapper first
    await page.click('#desc-range-link');

    // Input epMin >= epMax
    await page.locator('#epmin').fill('8');
    await page.locator('#epmax').fill('7');

    // Min wrapper should have error-active class
    const minWrapper = page.locator('#epmin-warning-wrapper');
    await expect(minWrapper).toHaveClass(/error-active/);

    // Outputs should clear
    await expect(page.locator('#out-count')).toHaveText('—');
  });

  test('should clamp values when Enforce limit is active', async ({ page }) => {
    await page.goto('/');

    // Open the closed wrapper first
    await page.click('#desc-range-link');

    // Set personal limit to 6mm
    await page.locator('#personal-ep-limit').fill('6');

    // Check Enforce limit
    await page.locator('#enforce-personal-limit').check();

    // Try to enter 7mm in max exit pupil
    await page.locator('#epmax').fill('7');

    // Should clamp back to 6
    await expect(page.locator('#epmax')).toHaveValue('6');

    // Transient overlay should be shown
    await expect(page.locator('#limit-enforced-overlay')).toHaveClass(/show/);
  });

  test('should restore inputs from URL hash parameters', async ({ page }) => {
    // Navigate with hash query params
    await page.goto('/#fr=8&mode=fl&val=1200&min=1.0&max=6.0&type=simple&strat=percent&step=35');

    // Verify inputs have loaded parameters
    await expect(page.locator('#fratio')).toHaveValue('8');
    await expect(page.locator('#fl-ap-input')).toHaveValue('1200');
    await expect(page.locator('#epmin')).toHaveValue('1');
    await expect(page.locator('#epmax')).toHaveValue('6');
  });

  test('should toggle pupil-range-wrapper open and closed under correct modes and subtitle link clicks', async ({ page }) => {
    await page.goto('/');

    const wrapper = page.locator('.pupil-range-wrapper');

    // 1. In Simple Setup mode on initial load, it should be closed
    await expect(wrapper).not.toHaveClass(/open/);

    // 2. Swapping to Advanced Setup should make it open
    await page.click('button:has-text("Advanced Setup")');
    await expect(wrapper).toHaveClass(/open/);

    // 3. Swapping back to Simple Setup should close it
    await page.click('button:has-text("Simple Setup")');
    await expect(wrapper).not.toHaveClass(/open/);

    // 4. Clicking the desc-range-link in the subtitle should open it
    await page.click('#desc-range-link');
    await expect(wrapper).toHaveClass(/open/);

    // 5. Check that epmin is focused
    await expect(page.locator('#epmin')).toBeFocused();

    // 6. Clicking desc-range-link again should close it
    await page.click('#desc-range-link');
    await expect(wrapper).not.toHaveClass(/open/);
  });

  test('should layout charts in 2x2 grid on medium viewports and wrap to 1x4 list on narrow viewports', async ({ page }) => {
    // 1. Set viewport to medium width (1000px wide)
    await page.setViewportSize({ width: 1000, height: 1000 });
    await page.goto('/');

    const grid = page.locator('.charts-grid');
    const firstChart = page.locator('.chart-container').first();

    const gridBox = await grid.boundingBox();
    const chartBox = await firstChart.boundingBox();

    expect(gridBox).not.toBeNull();
    expect(chartBox).not.toBeNull();
    
    // In 2-column layout, chart width is roughly half the grid width (accounting for gap)
    expect(chartBox.width).toBeLessThan(gridBox.width * 0.6);
    expect(chartBox.width).toBeGreaterThan(gridBox.width * 0.4);

    // 2. Set viewport to narrow width (400px wide)
    await page.setViewportSize({ width: 400, height: 800 });
    
    // In 1-column layout, chart width should span nearly the entire grid width
    const gridBoxNarrow = await grid.boundingBox();
    const chartBoxNarrow = await firstChart.boundingBox();
    
    expect(gridBoxNarrow).not.toBeNull();
    expect(chartBoxNarrow).not.toBeNull();
    expect(chartBoxNarrow.width).toBeGreaterThan(gridBoxNarrow.width * 0.9);
  });

  test('should manage telescopes (add, select, edit, delete)', async ({ page }) => {
    await page.goto('/');

    // 1. Verify default tabs are present
    await expect(page.locator('[data-testid="telescope-tab-tele_default_1"]')).toHaveText('8" Dobsonian');
    await expect(page.locator('[data-testid="telescope-tab-tele_default_2"]')).toHaveText('80mm Refractor');

    // 2. Select 80mm Refractor -> Focal ratio should become 7.5, Focal length should become 600
    await page.click('[data-testid="telescope-tab-tele_default_2"]');
    await expect(page.locator('#fratio')).toHaveValue('7.5');
    await expect(page.locator('#fl-ap-input')).toHaveValue('600');

    // 3. Add a new telescope
    await page.click('[data-testid="add-telescope-btn"]');
    await page.locator('#modal-label').fill('My Custom Scope');
    await page.locator('#modal-fratio').fill('4');
    await page.locator('#modal-flength').fill('800'); // should compute aperture = 200
    await expect(page.locator('#modal-aperture')).toHaveValue('200');
    
    // Save it
    await page.click('button:has-text("Save Telescope")');

    // Tab should now be present and active
    const newTabWrap = page.locator('.telescope-tab-btn-wrap.active');
    await expect(newTabWrap.locator('.telescope-tab-name')).toHaveText('My Custom Scope');

    // Main inputs should be updated to match new scope
    await expect(page.locator('#fratio')).toHaveValue('4');
    await expect(page.locator('#fl-ap-input')).toHaveValue('800');

    // 4. Edit the telescope
    await page.click('.telescope-tab-btn-wrap.active [data-testid^="edit-telescope-"]');
    await page.locator('#modal-label').fill('My Custom Scope (Edited)');
    await page.click('button:has-text("Save Telescope")');
    
    await expect(page.locator('.telescope-tab-btn-wrap.active .telescope-tab-name')).toHaveText('My Custom Scope (Edited)');

    // 5. Delete the telescope
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Are you sure you want to delete');
      await dialog.accept();
    });
    await page.click('.telescope-tab-btn-wrap.active [data-testid^="delete-telescope-"]');

    // Tab should be removed
    await expect(page.locator('.telescope-tab-name', { hasText: 'My Custom Scope (Edited)' })).not.toBeVisible();
  });
});
