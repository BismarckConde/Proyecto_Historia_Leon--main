import { test, expect } from "@playwright/test";
import catalog from "../src/data/catalog.json" with { type: "json" };
import { STORAGE_KEY, gradeQuiz, validateCatalog, completeLegacyCoordinates } from "../src/content";

test.beforeEach(async ({ page }) => {
  // These tests exercise local content independently of the connected remote draft.
  await page.route("**/rest/v1/content_catalog*", route => route.fulfill({ json: null }));
});

test("completa las seis ubicaciones del catálogo anterior y conserva ediciones", async ({ page }) => {
  const legacy = structuredClone(catalog);
  for (const place of legacy.places.slice(2)) {
    Object.assign(place, { latitude: null, longitude: null, coordinate_source: null });
  }
  legacy.places[2].description = "Descripción local editada";
  legacy.places[7].name = "Teatro Municipal ";
  const completed = completeLegacyCoordinates(validateCatalog(legacy));
  expect(completed.places[2].description).toBe("Descripción local editada");
  expect(completed.places.every(p => p.coordinate_source?.verified && p.latitude !== null && p.longitude !== null)).toBe(true);
  completed.places[2].latitude = 12.435;
  expect(completeLegacyCoordinates(completed).places[2].latitude).toBe(12.435);
  await page.addInitScript(({ key, data }) => localStorage.setItem(key, JSON.stringify(data)), { key: STORAGE_KEY, data: legacy });
  await page.route("https://*.tile.openstreetmap.org/**", route => route.abort());
  await page.goto("/explorar");
  await expect(page.locator(".place-marker")).toHaveCount(8);
  for (const place of catalog.places) {
    await page.locator(`.place-marker[data-place="${place.slug}"]`).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#map-place-title")).toHaveText(legacy.places.find(p => p.slug === place.slug)!.name.trim());
    await page.keyboard.press("Escape");
  }
  await page.getByLabel("Buscar un lugar").fill("recolección");
  await expect(page.locator(".place-marker")).toHaveCount(1);
});
test("inicio, buscador y ficha reales", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Iniciar recorrido" }).click();
  await expect(
    page.getByRole("heading", { name: "Explorar León", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Buscar un lugar").fill("catedral");
  await expect(page.locator(".grid .card")).toHaveCount(1);
  await page.getByRole("link", { name: "Ver lugar" }).click();
  await expect(
    page.getByRole("heading", { name: "Catedral de León", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Revisado con fuentes", { exact: true }),
  ).toBeVisible();
});
test("tema claro y oscuro se alternan y se conservan", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Cambiar a tema oscuro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Cambiar a tema claro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});
test("ilustración local y movimiento reducido", async ({ page }) => {
  await page.goto("/");
  const cathedral = page.getByRole("img", {
    name: "Ilustración tridimensional de la Catedral de León, Nicaragua",
  }).first();
  await expect(cathedral).toBeVisible();
  await expect
    .poll(() =>
      cathedral.evaluate(
        (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
      ),
    )
    .toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() =>
      cathedral.evaluate((image) => getComputedStyle(image).animationName),
    )
    .toBe("none");

  await page.goto("/lugares/catedral");
  await expect(page.locator(".cathedral-detail-image img")).toBeVisible();
});
test("filtro municipal y ruta digital reales", async ({ page }) => {
  await page.goto("/explorar");
  await page.locator(".advanced-filters > summary").click();
  await page
    .getByLabel("Municipio", { exact: true })
    .selectOption("La Paz Centro");
  await expect(page.locator(".grid .card")).toHaveCount(1);
  await page.goto("/rutas/origenes");
  await expect(page.getByText("Parada 1 de 2")).toBeVisible();
  await page.getByRole("button", { name: "Siguiente parada" }).click();
  await expect(page.getByText("Parada 2 de 2")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Catedral de León", exact: true }),
  ).toBeVisible();
});
test("actividad calificada localmente", async ({ page }) => {
  await page.goto("/actividad");
  for (const option of ["Como investigación por verificar", "Mediante la lista de lugares", "1524", "Rubén Darío"]) {
    await page.getByRole("button", { name: option, exact: true }).click();
    await page.getByRole("button", { name: "Comprobar respuesta" }).click();
    await expect(page.locator(".quiz-feedback")).toContainText("¡Respuesta correcta!");
    await page.getByRole("button", { name: /Siguiente pregunta|Finalizar actividad/ }).click();
  }
  await expect(page.getByRole("heading", { name: "Resultado: 4 de 4" })).toBeVisible();
  await page.getByRole("button", { name: "Repetir actividad" }).click();
  for (const option of ["Como un hecho histórico demostrado", "No se pueden consultar", "1967", "José de la Cruz Mena"]) {
    await page.getByRole("button", { name: option, exact: true }).click();
    await page.getByRole("button", { name: "Comprobar respuesta" }).click();
    await expect(page.locator(".quiz-feedback")).toContainText("Esta vez no");
    await page.getByRole("button", { name: /Siguiente pregunta|Finalizar actividad/ }).click();
  }
  await expect(page.getByRole("heading", { name: "Resultado: 0 de 4" })).toBeVisible();
});
test("línea del tiempo declara el contenido pendiente", async ({ page }) => {
  await page.addInitScript(({ key, data }) => {
    localStorage.setItem(key, JSON.stringify({ ...data, events: [] }));
  }, { key: STORAGE_KEY, data: catalog });
  await page.goto("/tiempo");
  await expect(
    page.getByText("Aún no hay acontecimientos con fechas verificadas.", {
      exact: false,
    }),
  ).toBeVisible();
});
test("mapa, mosaicos fallidos y línea del tiempo con datos reales del catálogo", async ({
  page,
}) => {
  await page.route("https://*.tile.openstreetmap.org/**", (route) =>
    route.abort(),
  );
  await page.goto("/explorar");
  await expect(page.locator(".place-marker")).toHaveCount(8);
  await page.locator('.place-marker[data-place="catedral"]').focus();
  await page.keyboard.press("Enter");
  await page
    .locator(".map-sheet")
    .getByRole("link", { name: "Abrir ficha" })
    .click();
  await expect(
    page.getByRole("heading", {
      name: /Catedral de León|Ruinas de León Viejo/,
      level: 1,
    }),
  ).toBeVisible();
  await page.goto("/tiempo");
  await expect(page.locator(".timeline li")).toHaveCount(4);
  await page
    .getByRole("link", { name: "Abrir ficha de Catedral de León" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Catedral de León", exact: true }),
  ).toBeVisible();
});
test("contenido local corrupto recuperable", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(key => localStorage.setItem(key, "JSON inválido"), STORAGE_KEY);
  await page.goto("/explorar");
  await expect(page.getByRole("alert")).toBeVisible();
  await page.evaluate(key => localStorage.removeItem(key), STORAGE_KEY);
  await page.getByRole("button", { name: "Reintentar" }).click();
  await expect(page.locator(".grid .card")).toHaveCount(8);
});

test("edición local, persistencia, exportación y restauración", async ({ page }) => {
  const apiRequests: string[] = [];
  page.on("request", request => { if (request.url().includes("/api/")) apiRequests.push(request.url()); });
  await page.goto("/admin");
  const edited = structuredClone(catalog);
  edited.places[0].name = "León Viejo editado";
  await page.getByLabel("Catálogo JSON", { exact: true }).fill(JSON.stringify(edited));
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Cambios guardados" })).toBeVisible();
  await page.goto("/lugares/leon-viejo");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("León Viejo editado");
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("León Viejo editado");
  await page.goto("/admin");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar JSON" }).click();
  expect((await downloadPromise).suggestedFilename()).toBe("catalog.json");
  await page.getByRole("button", { name: "Restaurar catálogo original" }).click();
  await page.getByRole("button", { name: "Confirmar restauración" }).click();
  await page.goto("/lugares/leon-viejo");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ruinas de León Viejo");
  expect(apiRequests).toEqual([]);
});

test("importación y validación conservan el catálogo ante errores", async ({ page }) => {
  await page.goto("/admin");
  const invalid = structuredClone(catalog);
  invalid.routes[0].stops[0].place_slug = "inexistente";
  await page.getByLabel("Importar catálogo JSON").setInputFiles({
    name: "invalid.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(invalid)),
  });
  await expect(page.getByRole("alert")).toContainText("referencia al lugar inexistente");
  const edited = structuredClone(catalog);
  edited.places[0].name = "Ficha importada";
  await page.getByLabel("Importar catálogo JSON").setInputFiles({
    name: "catalog.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(edited)),
  });
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await page.getByLabel("Catálogo JSON", { exact: true }).fill("{}");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.goto("/lugares/leon-viejo");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ficha importada");
});

test("enlaces inexistentes y actividad vacía", async ({ page }) => {
  await page.goto("/lugares/inexistente");
  await expect(page.getByRole("alert")).toContainText("No se encontró");
  await page.goto("/rutas/inexistente");
  await expect(page.getByRole("alert")).toContainText("No se encontró");
  await page.goto("/pagina-inexistente");
  await expect(page.getByRole("heading", { name: "Página no encontrada" })).toBeVisible();
  await page.evaluate(({ key, data }) => localStorage.setItem(key, JSON.stringify({ ...data, questions: [] })), { key: STORAGE_KEY, data: catalog });
  await page.goto("/actividad");
  await expect(page.getByRole("button", { name: "Finalizar actividad" })).toBeDisabled();
});

test("reglas editoriales del catálogo importado", () => {
  expect(() => validateCatalog(catalog)).not.toThrow();
  const badCoordinates = structuredClone(catalog);
  badCoordinates.places[0].latitude = 91;
  expect(() => validateCatalog(badCoordinates)).toThrow(/coordenadas/);
  const badSource = structuredClone(catalog);
  badSource.events[0].source.verified = false;
  expect(() => validateCatalog(badSource)).toThrow(/acontecimiento/);
  const badQuestion = structuredClone(catalog);
  badQuestion.questions[0].correct_index = 99;
  expect(() => validateCatalog(badQuestion)).toThrow(/pregunta/);
  const badUrl = structuredClone(catalog);
  badUrl.places[0].sources[0].url = "javascript:alert(1)";
  expect(() => validateCatalog(badUrl)).toThrow(/url/);
  expect(() => gradeQuiz({})).toThrow(/Responde todas/);
});
test("móvil y QR generado localmente", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/explorar");
  await expect(page.locator(".grid .card")).toHaveCount(8);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.goto("/feria");
  await page
    .getByLabel("Dirección de inicio o de una ruta")
    .fill("https://example.org/rutas/origenes");
  await page.getByRole("button", { name: "Generar QR" }).click();
  await expect(
    page.getByRole("img", {
      name: "Código QR de la dirección de la demostración",
    }),
  ).toBeVisible();
  await page
    .getByLabel("Dirección de inicio o de una ruta")
    .fill("http://localhost:5173");
  await page.getByRole("button", { name: "Generar QR" }).click();
  await expect(page.getByRole("alert")).toContainText("no localhost");
});
