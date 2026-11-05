import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

export default defineConfig({ plugins: [react(), {
  name: "leon-offline",
  apply: "build",
  closeBundle() {
    const files = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap(item => item.isDirectory() ? files(join(dir, item.name)) : [join(dir, item.name)]);
    const paths = files("dist").filter(path => !path.endsWith("sw.js"));
    const revision = createHash("sha256");
    for (const path of paths) revision.update(readFileSync(path));
    const urls = paths.map(path => "/" + path.replaceAll("\\", "/").replace(/^dist\//, ""));
    writeFileSync("dist/sw.js", `
const CACHE = 'leon-guide-${revision.digest("hex").slice(0, 12)}';
const ASSETS = ${JSON.stringify(urls)};
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('leon-guide-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith(caches.open(CACHE).then(async cache => {
    if (event.request.mode === 'navigate') return (await cache.match('/index.html')) || fetch(event.request);
    // These are same-origin, immutable public build assets. Vite's Vary: Origin
    // differs between install-time fetches and crossorigin module requests.
    return (await cache.match(event.request, { ignoreSearch: true, ignoreVary: true })) || fetch(event.request);
  }));
});
`);
  },
}] });
