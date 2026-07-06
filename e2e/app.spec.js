import { test, expect } from '@playwright/test';

test.describe('Eyepiece Calculator E2E Tests', () => {
  test('should render simple setup tab default layout and show computed stats', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page.locator('h1')).toHaveText('Eyepiece Planner');

    // Check exit pupil controls are rendered (not telescope spec inputs)
    await expect(page.locator('#epmin')).toBeVisible();
    await expect(page.locator('#epmax')).toBeVisible();
    await expect(page.locator('#step-mode-select')).toBeVisible();

    // Default eyepiece count should be calculated (telescope auto-selected)
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

    // Personal limit controls should be visible in advanced mode
    await expect(page.locator('#personal-ep-limit')).toBeVisible();
    await expect(page.locator('#enforce-personal-limit')).toBeVisible();
  });

  test('should trigger error outlines on range violations', async ({ page }) => {
    await page.goto('/');

    // Min and max are directly visible in simple mode
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

    // Switch to advanced to access personal limit controls
    await page.click('button:has-text("Advanced Setup")');

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

    // Verify exit pupil inputs have loaded parameters
    await expect(page.locator('#epmin')).toHaveValue('1');
    await expect(page.locator('#epmax')).toHaveValue('6');
  });

  test('should display EP/FL toggles in advanced mode and plain labels in simple mode', async ({ page }) => {
    await page.goto('/');

    // In simple mode, there should be plain labels, no segmented toggle buttons for min/max
    const minModeToggle = page.locator('#min-mode-toggle');
    await expect(minModeToggle).not.toBeVisible();

    // Switch to advanced
    await page.click('button:has-text("Advanced Setup")');

    // In advanced mode, segmented toggles should be visible
    await expect(minModeToggle).toBeVisible();
    await expect(page.locator('#max-mode-toggle')).toBeVisible();

    // Switch back to simple
    await page.click('button:has-text("Simple Setup")');
    await expect(minModeToggle).not.toBeVisible();
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

    // 2. Select 80mm Refractor -> Stats should update (telescope is auto-synced)
    await page.click('[data-testid="telescope-tab-tele_default_2"]');
    // Verify a stat updated (eyepiece count should be recalculated)
    const countVal = await page.locator('#out-count').textContent();
    expect(countVal).not.toBe('—');

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

    // 4. Edit the telescope
    await page.click('.telescope-tab-btn-wrap.active [data-testid^="edit-telescope-"]');
    await page.locator('#modal-label').fill('My Custom Scope (Edited)');
    await page.click('button:has-text("Save Telescope")');
    
    await expect(page.locator('.telescope-tab-btn-wrap.active .telescope-tab-name')).toHaveText('My Custom Scope (Edited)');

    // 5. Delete the telescope (promptless)
    await page.click('.telescope-tab-btn-wrap.active [data-testid^="delete-telescope-"]');

    // Tab should be removed
    await expect(page.locator('.telescope-tab-name', { hasText: 'My Custom Scope (Edited)' })).not.toBeVisible();
  });

  test('should preserve high-precision aperture and format correctly on unit toggles', async ({ page }) => {
    await page.goto('/');

    // 1. Click Add Telescope
    await page.click('[data-testid="add-telescope-btn"]');

    // 2. Select 'in' unit and enter 24 inches, f/3, 1829mm focal length
    await page.click('#modal-unit-toggle >> button:has-text("in")');
    await page.locator('#modal-aperture').fill('24');
    await page.locator('#modal-fratio').fill('3');
    await page.locator('#modal-flength').fill('1829');
    await page.locator('#modal-label').fill('24" F/3 Scope');
    await page.click('button:has-text("Save Telescope")');

    // 3. Edit the newly added telescope
    await page.click('.telescope-tab-btn-wrap.active [data-testid^="edit-telescope-"]');

    // 4. Verify initial state is MM and 609.6 (since 24 * 25.4 = 609.6)
    await expect(page.locator('#modal-unit-toggle >> button:has-text("mm")')).toHaveClass(/active/);
    await expect(page.locator('#modal-aperture')).toHaveValue('609.6');

    // 5. Toggle to inches -> value should display as 24
    await page.click('#modal-unit-toggle >> button:has-text("in")');
    await expect(page.locator('#modal-aperture')).toHaveValue('24');

    // 6. Toggle to MM again -> value should remain exactly 609.6 (not rounded up to 610)
    await page.click('#modal-unit-toggle >> button:has-text("mm")');
    await expect(page.locator('#modal-aperture')).toHaveValue('609.6');

    // 7. Toggle to inches again -> value should display as 24
    await page.click('#modal-unit-toggle >> button:has-text("in")');
    await expect(page.locator('#modal-aperture')).toHaveValue('24');

    // 8. Toggle to MM and enter exactly 610
    await page.click('#modal-unit-toggle >> button:has-text("mm")');
    await page.locator('#modal-aperture').fill('610');

    // 9. Toggle to inches -> displays as 24 (since 610 / 25.4 = 24.0157... which formats as 24)
    await page.click('#modal-unit-toggle >> button:has-text("in")');
    await expect(page.locator('#modal-aperture')).toHaveValue('24');

    // 10. Toggle back to MM -> value should display as exactly 610 (not rounded down to 609.6)
    await page.click('#modal-unit-toggle >> button:has-text("mm")');
    await expect(page.locator('#modal-aperture')).toHaveValue('610');
  });
});
