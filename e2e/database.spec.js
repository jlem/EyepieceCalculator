import { test, expect } from '@playwright/test';

test.describe('Eyepiece Database Tab E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Click on the "Eyepiece Database" navigation tab
    await page.click('button:has-text("Eyepiece Database")');
  });

  test('should render database page container without headers', async ({ page }) => {
    // Check main container
    await expect(page.locator('[data-testid="database-tab"]')).toBeVisible();

    // Headers and tips should NOT be present
    await expect(page.locator('h2')).not.toBeVisible();
    await expect(page.locator('.help-box')).not.toBeVisible();
  });

  test('should load the eyepiece table with default pagination', async ({ page }) => {
    // Table should be visible
    const table = page.locator('[data-testid="database-table"]');
    await expect(table).toBeVisible();

    // Results count should show default page size (100) and large total count
    const countText = page.locator('[data-testid="results-count"]');
    await expect(countText).toContainText('Showing 1 to 100 of');

    // First page button (active) should be highlighted
    const firstPageBtn = page.locator('[data-testid="page-num-1"]');
    await expect(firstPageBtn).toHaveClass(/activePageButton/);
  });

  test('should filter eyepieces fuzzily using Name filter', async ({ page }) => {
    // Get the name filter input (first input in the header cells)
    const nameInput = page.locator('thead input').first();
    await expect(nameInput).toBeVisible();

    // Search for "12 TV Delos"
    await nameInput.fill('12 TV Delos');

    // Wait for the debounced filter to trigger
    const countText = page.locator('[data-testid="results-count"]');
    // It should filter down to a very small set (should be exactly 1 or 2 matching)
    await expect(countText).toContainText('Showing 1 to');
    
    // Verify the table contains Delos
    const tableBody = page.locator('tbody');
    await expect(tableBody).toContainText('Tele Vue');
    await expect(tableBody).toContainText('Delos');
    await expect(tableBody).toContainText('12mm');
  });

  test('should filter numerically using comparison operators', async ({ page }) => {
    // Select the Focal Length filter input (4th input box)
    const inputs = page.locator('thead input');
    const flInput = inputs.nth(3); // FL is index 3

    // Fill filter with "> 40"
    await flInput.fill('> 40');

    // Wait for filter application
    const countText = page.locator('[data-testid="results-count"]');
    await expect(countText).toContainText('eyepieces');

    // Check results are greater than 40
    const tableBody = page.locator('tbody');
    await expect(tableBody).toContainText('mm');
  });

  test('should support column sorting', async ({ page }) => {
    // Click header "FL" label to sort by focal length ascending
    await page.click('th:has-text("FL") > div');

    // Table rows should sort. Let's get the first cell of the FL column
    // The columns are: Name (0), Brand (1), Line (2), FL (3)
    const firstRowFLCell = page.locator('tbody tr').first().locator('td').nth(3);
    
    // Focal length should be small (e.g. 2mm or 3mm)
    await expect(firstRowFLCell).toContainText('mm');
    const flText = await firstRowFLCell.textContent();
    const flVal = parseFloat(flText || '0');
    expect(flVal).toBeLessThan(10); // should be a short focal length at the top of ASC list

    // Click again to sort descending
    await page.click('th:has-text("FL") > div');
    await page.waitForTimeout(200); // short wait for sort
    
    // First cell should now be a large focal length (e.g. 50mm, 55mm, 56mm)
    const firstRowFLCellDesc = page.locator('tbody tr').first().locator('td').nth(3);
    const flTextDesc = await firstRowFLCellDesc.textContent();
    const flValDesc = parseFloat(flTextDesc || '0');
    expect(flValDesc).toBeGreaterThan(40); // large focal length at top of DESC list
  });

  test('should paginate through pages and change page size', async ({ page }) => {
    // Check initial count text
    const countText = page.locator('[data-testid="results-count"]');
    await expect(countText).toContainText('Showing 1 to 100 of');

    // Go to next page
    await page.click('[data-testid="page-next"]');
    await expect(countText).toContainText('Showing 101 to 200 of');

    // Change page size to 25
    await page.selectOption('[data-testid="page-size-select"]', '25');
    await expect(countText).toContainText('Showing 1 to 25 of');
  });
});
