import initialCatalog from "./data/catalog.json" with { type: "json" };
import type { HistoricalEvent, Place, Question, Route, Source } from "./types";
import { supabase } from "./supabase";

export const STORAGE_KEY = "leon-en-el-tiempo.catalog.v1";
export type Catalog = {
  version: number;
  places: Omit<Place, "events">[];
  events: Omit<HistoricalEvent, "place_name">[];
  routes: (Omit<Route, "stops"> & {
    stops: { order: number; prompt: string; place_slug: string }[];
  })[];
  questions: (Question & {
    correct_index: number;
    explanation: string;
    source: Source | null;
    active: boolean;
  })[];
};

// Validate imported files and browser storage before rendering any content.
type Rule = (value: unknown, path: string) => void;
const fail = (path: string): never => { throw new Error(`Contenido inválido en ${path}.`); };
const string: Rule = (v, p) => { if (typeof v !== "string") fail(p); };
const boolean: Rule = (v, p) => { if (typeof v !== "boolean") fail(p); };
const number: Rule = (v, p) => { if (typeof v !== "number" || !Number.isFinite(v)) fail(p); };
const integer: Rule = (v, p) => { number(v, p); if (!Number.isInteger(v)) fail(p); };
const id: Rule = (v, p) => { integer(v, p); if ((v as number) < 1) fail(p); };
const nullable = (rule: Rule): Rule => (v, p) => { if (v !== null) rule(v, p); };
const array = (rule: Rule): Rule => (v, p) => {
  if (!Array.isArray(v)) fail(p);
  (v as unknown[]).forEach((item, i) => rule(item, `${p}[${i}]`));
};
const object = (fields: Record<string, Rule>): Rule => (v, p) => {
  if (!v || typeof v !== "object" || Array.isArray(v)) fail(p);
  for (const [key, rule] of Object.entries(fields)) rule((v as Record<string, unknown>)[key], `${p}.${key}`);
};
const choice = (...values: unknown[]): Rule => (v, p) => { if (!values.includes(v)) fail(p); };
const slug: Rule = (v, p) => { string(v, p); if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v as string)) fail(p); };
const url: Rule = (v, p) => {
  string(v, p);
  try { if (!["http:", "https:"].includes(new URL(v as string).protocol)) fail(p); }
  catch { fail(p); }
};
const source = object({ id, title: string, institution: string, url, verified: boolean,
  accessed_on: nullable(string), publication_date: string, notes: string });
const schema = object({
  version: choice(1),
  places: array(object({ id, name: string, slug, municipality: string, category: string,
    period: string, description: string, context: string, significance: string,
    review_status: choice("pending", "reviewed"), latitude: nullable(number), longitude: nullable(number),
    coordinate_source: nullable(source), sources: array(source),
    claims: array(object({ id, text: string, source, locator: string, kind: choice("fact", "oral", "proposal") })),
    media: array(object({ id, title: string, kind: choice("image", "audio", "document"), url,
      creator: string, license: string, permission_url: url, alt_text: string })),
  })),
  events: array(object({ id, title: string, year: integer, description: string,
    verified: boolean, source, place_slug: slug })),
  routes: array(object({ id, slug, title: string, description: string,
    stops: array(object({ order: id, prompt: string, place_slug: slug })) })),
  questions: array(object({ id, prompt: string, options: array(string), place__slug: slug,
    correct_index: integer, explanation: string, source: nullable(source), active: boolean })),
});

export function validateCatalog(value: unknown): Catalog {
  schema(value, "catálogo");
  const catalog = value as Catalog;
  const unique = (values: unknown[], path: string) => { if (new Set(values).size !== values.length) fail(path); };
  for (const key of ["places", "events", "routes", "questions"] as const) unique(catalog[key].map(x => x.id), `${key}: IDs duplicados`);
  unique(catalog.places.map(p => p.slug), "lugares: slugs duplicados");
  unique(catalog.routes.map(r => r.slug), "rutas: slugs duplicados");
  const slugs = new Set(catalog.places.map(p => p.slug));
  const placeExists = (slug: string) => { if (!slugs.has(slug)) fail(`referencia al lugar ${slug}`); };
  for (const p of catalog.places) {
    unique(p.claims.map(c => c.id), `${p.slug}: afirmaciones duplicadas`);
    unique(p.media.map(m => m.id), `${p.slug}: recursos duplicados`);
    if ((p.latitude === null) !== (p.longitude === null)) fail(`${p.slug}: se necesitan ambas coordenadas`);
    if (p.latitude !== null && (Math.abs(p.latitude) > 90 || Math.abs(p.longitude!) > 180 || !p.coordinate_source?.verified)) fail(`${p.slug}: coordenadas o fuente`);
    if (p.review_status === "reviewed" && !p.claims.some(c => c.source.verified)) fail(`${p.slug}: revisión sin afirmación respaldada`);
  }
  for (const e of catalog.events) {
    placeExists(e.place_slug);
    if (e.year < 0 || e.year > 2100 || (e.verified && !e.source.verified)) fail(`acontecimiento ${e.id}`);
  }
  for (const r of catalog.routes) {
    unique(r.stops.map(s => s.order), `${r.slug}: orden duplicado`);
    r.stops.forEach(s => placeExists(s.place_slug));
  }
  for (const q of catalog.questions) {
    placeExists(q.place__slug);
    if (q.options.length < 2 || q.options.some(x => !x.trim()) || q.correct_index < 0 || q.correct_index >= q.options.length) fail(`pregunta ${q.id}: opciones o respuesta`);
  }
  return catalog;
}

// Complete the six legacy entries without replacing locally edited content or coordinates.
export function completeLegacyCoordinates(catalog: Catalog): Catalog {
  return { ...catalog, places: catalog.places.map(place => {
    if (place.latitude !== null || place.longitude !== null || place.coordinate_source !== null) return place;
    const original = initialCatalog.places.find(p => p.slug === place.slug && p.id === place.id && p.municipality === place.municipality);
    if (!original?.coordinate_source?.verified) return place;
    return { ...place, latitude: original.latitude, longitude: original.longitude,
      coordinate_source: structuredClone(original.coordinate_source) };
  }) };
}

export function loadCatalog(): Catalog {
  let saved: string | null;
  try { saved = localStorage.getItem(STORAGE_KEY); }
  catch { return validateCatalog(initialCatalog); }
  try { return completeLegacyCoordinates(validateCatalog(saved ? JSON.parse(saved) : initialCatalog)); }
  catch { throw new Error("Los contenidos locales no son válidos. Abre Administrar contenidos locales para corregirlos o restaurar el catálogo original."); }
}

export function saveCatalog(value: unknown) {
  const catalog = validateCatalog(value);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(catalog)); }
  catch { throw new Error("No se pudo guardar. Comprueba el espacio y los permisos de almacenamiento del navegador; exporta el JSON para conservar tus cambios."); }
}

export function originalCatalog(): Catalog { return structuredClone(validateCatalog(initialCatalog)); }

function resolvedContent(catalog: Catalog) {
  const events: HistoricalEvent[] = catalog.events.map(e => ({ ...e,
    place_name: catalog.places.find(p => p.slug === e.place_slug)!.name,
  })).sort((a, b) => a.year - b.year || a.id - b.id);
  const places: Place[] = catalog.places.map(p => ({ ...p,
    events: events.filter(e => e.place_slug === p.slug),
  })).sort((a, b) => a.name.localeCompare(b.name, "es"));
  const routes: Route[] = catalog.routes.map(r => ({ ...r, stops: r.stops.map(s => ({ ...s,
    place: places.find(p => p.slug === s.place_slug)!,
  })).sort((a, b) => a.order - b.order) }));
  return { places, events, routes, questions: catalog.questions.filter(q => q.active) };
}

export async function readContent<T>(path: string): Promise<T> {
  let catalog = loadCatalog();
  if (supabase && (typeof navigator === "undefined" || navigator.onLine)) {
    const { data: row } = await supabase.from("content_catalog").select("catalog").eq("id", 1).maybeSingle();
    if (row?.catalog) {
      try { catalog = completeLegacyCoordinates(validateCatalog(row.catalog)); saveCatalog(catalog); }
      catch { /* Keep the last valid local catalog if a remote draft is malformed. */ }
    }
  }
  const data = resolvedContent(catalog);
  const [collection, slug] = path.split("/");
  if (collection === "places" || collection === "routes") {
    const items = data[collection];
    const result = slug ? items.find(item => item.slug === slug) : items;
    if (!result) throw new Error("No se encontró este contenido. Vuelve al catálogo o a las rutas.");
    return result as T;
  }
  if (collection === "events" || collection === "questions") return data[collection] as T;
  throw new Error("Contenido no disponible.");
}

export function gradeQuestion(id: number, answer: number) {
  const q = loadCatalog().questions.find(q => q.active && q.id === id);
  if (!q || !Number.isInteger(answer) || answer < 0 || answer >= q.options.length) throw new Error("Selecciona una respuesta válida.");
  return { id: q.id, correct: answer === q.correct_index, correct_answer: q.options[q.correct_index], explanation: q.explanation, place_slug: q.place__slug };
}

export function gradeQuiz(answers: Record<string, number>) {
  const questions = loadCatalog().questions.filter(q => q.active);
  const results = questions.map(q => {
    const answer = answers[q.id];
    if (!Number.isInteger(answer) || answer < 0 || answer >= q.options.length) throw new Error("Responde todas las preguntas con una opción válida.");
    return { id: q.id, correct: answer === q.correct_index, correct_answer: q.options[q.correct_index],
      explanation: q.explanation, place_slug: q.place__slug };
  });
  return { score: results.filter(r => r.correct).length, total: results.length, results };
}
