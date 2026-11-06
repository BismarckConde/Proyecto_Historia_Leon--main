import { test, expect } from "@playwright/test";

test("filtros, ficha inferior y teclado", async ({ page }) => {
  await page.route("https://*.tile.openstreetmap.org/**", route => route.abort());
  await page.goto("/explorar");
  const marker = page.locator(".place-marker").first();
  await marker.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".map-sheet")).toBeVisible();
  await expect(page.locator("#map-place-title")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator(".map-sheet")).toHaveCount(0);
  await expect(marker).toBeFocused();
  const chips = page.getByRole("group", { name: "Filtrar por tema" });
  await chips.getByRole("button").nth(1).click();
  await expect(chips.getByRole("button").nth(1)).toHaveAttribute("aria-pressed", "true");
  await chips.getByRole("button", { name: "Todos los temas" }).click();
  await expect(page.locator(".grid .card")).toHaveCount(8);
});

test("navegación móvil al alcance y quiz sin doble respuesta", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/actividad");
  const nav = await page.getByRole("navigation", { name: "Navegación principal" }).boundingBox();
  expect(nav!.y).toBeGreaterThan(650);
  await expect(page.getByRole("button", { name: "Comprobar respuesta" })).toBeDisabled();
  const options = page.locator(".quiz-option");
  await options.nth(1).click();
  await expect(page.locator(".quiz-feedback")).toHaveCount(0);
  await options.first().click();
  await page.getByRole("button", { name: "Comprobar respuesta" }).click();
  const message = await page.locator(".quiz-feedback").textContent();
  await options.nth(1).dispatchEvent("click");
  await expect(page.locator(".quiz-feedback")).toHaveText(message!);
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "1");
  await page.goto("/explorar");
  await page.goto("/actividad");
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "1");
  await expect(page.locator(".quiz-feedback")).toContainText("Respuesta correcta");
});

test("PWA: recarga y rutas nunca visitadas sin conexión", async ({ page, context }) => {
  await page.goto("http://127.0.0.1:4187/");
  await expect(page.getByRole("status")).toContainText("Guía guardada", { timeout: 20000 });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);
  await page.goto("http://127.0.0.1:4187/explorar");
  await expect(page.getByRole("heading", { name: "Explorar León", exact: true })).toBeVisible();
  await expect(page.locator(".place-marker")).toHaveCount(2);
  await expect(page.locator(".map-message")).toContainText("Mapa básico local");
  await page.reload();
  await expect(page.locator(".grid .card")).toHaveCount(8);
  await page.goto("http://127.0.0.1:4187/lugares/catedral");
  await expect(page.getByRole("heading", { name: "Catedral de León", exact: true })).toBeVisible();
  await page.goto("http://127.0.0.1:4187/actividad");
  await expect(page.locator(".quiz-option")).toHaveCount(2);
  await context.setOffline(false);
});

test("adaptación de las pantallas principales", async ({ page }) => {
  await page.route("https://*.tile.openstreetmap.org/**", route => route.abort());
  for (const width of [1440, 1024, 768, 390]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 900 });
    for (const route of ["/", "/explorar", "/tiempo", "/rutas/origenes", "/actividad"]) {
      await page.goto(route);
      await expect(page.locator("h1")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
});

test("ficha por estados y ubicación solicitada solo al tocar el control", async ({ page, context }) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 12.434, longitude: -86.878 });
  await page.route("https://*.tile.openstreetmap.org/**", route => route.abort());
  await page.goto("/explorar");
  await page.locator(".place-marker").first().click();
  await expect(page.locator(".sheet-compact")).toBeVisible();
  await page.getByRole("button", { name: "Ver detalles" }).click();
  await expect(page.locator(".sheet-details")).toBeVisible();
  await page.getByRole("button", { name: "Leer historia" }).click();
  await expect(page.locator(".sheet-history").first()).toBeVisible();
  await page.getByRole("button", { name: "Contraer ficha" }).click();
  await page.getByRole("button", { name: "Mi ubicación" }).click();
  await expect(page.locator(".distance-label")).toContainText("en línea recta");
  await expect(page.locator(".distance-label")).toContainText("No es distancia caminando");
});
