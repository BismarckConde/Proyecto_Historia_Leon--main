import { useState } from "react";

const memory = new Map<string, unknown>();
export function recall<T>(key: string, fallback: T): T {
  try { return JSON.parse(sessionStorage.getItem("leon-journey:" + key) || "null") ?? memory.get(key) ?? fallback; }
  catch { return (memory.get(key) as T) ?? fallback; }
}
export function remember(key: string, value: unknown) {
  memory.set(key, value);
  try { sessionStorage.setItem("leon-journey:" + key, JSON.stringify(value)); } catch { /* In-memory navigation remains available. */ }
}
export function useJourneyText(key: string, initial = "") {
  const [value, update] = useState(() => { const saved = recall(key, initial); return typeof saved === "string" ? saved : initial; });
  return [value, (next: string) => { remember(key, next); update(next); }] as const;
}
export type RouteProgress = { step: number; reviewed: string[]; signature: string };
export function routeProgress(slug: string, stops: string[]): RouteProgress {
  const signature = JSON.stringify(stops);
  const empty = { step: 0, reviewed: [], signature };
  const saved = recall<RouteProgress>("route:" + slug, empty);
  if (saved.signature !== signature || !Number.isInteger(saved.step) || saved.step < 0 || saved.step >= stops.length || !Array.isArray(saved.reviewed)) return empty;
  return { ...saved, reviewed: saved.reviewed.filter(s => stops.includes(s)) };
}
