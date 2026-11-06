import { test, expect } from "@playwright/test";

test("regreso conserva filtros, vista compacta, posición y tarjeta", async ({ page }) => {
  await page.route("https://*.tile.openstreetmap.org/**", route => route.abort());
  await page.goto("/explorar");
  await page.getByLabel("Buscar un lugar").fill("catedral");
  await page.getByRole("button", { name: "Lista compacta", exact: true }).click();
  const link = page.getByRole("link", { name: "Ver lugar" });
  await link.scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);
  await link.click();
  const position = await page.evaluate(() => JSON.parse(sessionStorage.getItem('leon-journey:scroll:/explorar') || '0') as number);
  expect(position).toBeGreaterThan(200);
  await page.getByRole("link", { name: "Volver a los resultados" }).click();
  await expect(page.getByLabel("Buscar un lugar")).toHaveValue("catedral");
  await expect(page.getByRole("button", { name: "Lista compacta", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('.place-card.is-selected')).toHaveCount(1);
  await expect.poll(() => page.evaluate((saved) => Math.abs(scrollY - Math.min(saved, document.documentElement.scrollHeight - innerHeight)), position)).toBeLessThan(40);
  await expect(page.locator('.place-card.is-selected')).toBeInViewport();
  await expect(page.locator('.place-card h3 a')).toBeFocused();
});

test("selección de mapa y tamaño de ficha sobreviven al regreso", async ({ page }) => {
  await page.route("https://*.tile.openstreetmap.org/**", route => route.abort());
  await page.goto("/explorar");
  await page.locator('.place-marker').first().click();
  await page.getByRole('button', { name: 'Ver detalles' }).click();
  const title = await page.locator('#map-place-title').textContent();
  await page.locator('.map-sheet').getByRole('link', { name: 'Abrir ficha', exact: true }).click();
  await page.getByRole('link', { name: 'Volver a los resultados' }).click();
  await expect(page.locator('.sheet-details')).toBeVisible();
  await expect(page.locator('#map-place-title')).toHaveText(title!);
  await expect(page.locator('.selected-marker')).toHaveCount(1);
});

test("las rutas solo completan paradas mediante revisión explícita", async ({ page }) => {
  await page.goto('/rutas/origenes');
  await expect(page.getByText('0 de 2 paradas revisadas')).toBeVisible();
  await page.getByRole('button', { name: 'Marcar parada como revisada' }).click();
  await page.getByRole('button', { name: 'Siguiente parada' }).click();
  await page.getByRole('link', { name: 'Ver lugar' }).click();
  await page.getByRole('link', { name: 'Volver al recorrido' }).click();
  await expect(page.getByText('Parada 2 de 2')).toBeVisible();
  await expect(page.getByText('1 de 2 paradas revisadas')).toBeVisible();
  await page.getByRole('button', { name: 'Marcar parada como revisada' }).click();
  await page.getByRole('link', { name: 'Todas las rutas' }).click();
  await expect(page.getByRole('link', { name: 'Revisar recorrido' })).toBeVisible();
});
