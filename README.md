# León en el tiempo

Aplicación educativa sobre el departamento de León, Nicaragua, con React, TypeScript y Vite. Funciona con un único servidor local y un catálogo JSON; no requiere Python, Django ni base de datos.

## Inicio local

Requisito: Node.js 22 o superior. Desde la raíz:

```powershell
npm.cmd ci
npm.cmd run dev -- --port 5173
```

Abrir http://localhost:5173. En Linux/macOS usar npm en lugar de npm.cmd.

```powershell
npm.cmd run build
npm.cmd run preview -- --port 4173
```

El build genera dist/. Un alojamiento estático debe devolver index.html en las rutas de React, como /lugares/catedral.

## Funcionalidades

- Ocho lugares con búsqueda, filtros, fichas, afirmaciones y fuentes.
- Mapa Leaflet con límite departamental local y dos ubicaciones verificadas.
- Cuatro acontecimientos y cuatro rutas educativas.
- Mini-quiz de cuatro preguntas, progreso, respuestas con feedback inmediato y explicación.
- Generación y descarga de QR.
- Editor JSON en /admin: validación, importación, exportación, guardado local y restauración.
- Temas claro/oscuro de alto contraste, navegación inferior móvil, fichas inferiores en el mapa y filtros por tema. Títulos clásicos y texto de interfaz legible; animaciones con movimiento reducido.
- Línea del tiempo con anclas por año, ilustración de la Catedral y mapa local de León Viejo. El contexto completo sigue disponible.
- PWA instalable con catálogo, imágenes y mapa básico local disponibles después de la primera carga completa de producción.

El editor guarda cambios en localStorage de ese navegador y origen. No hay cuentas ni sincronización entre dispositivos. Para compartir cambios, exportar el catálogo, reemplazar src/data/catalog.json y compilar. Las respuestas de la actividad se incluyen en la aplicación; no es un examen protegido.

## Pruebas

```powershell
npx.cmd playwright install chromium
npm.cmd run test:e2e
```

Playwright inicia Vite en 5187 y una compilación de producción en 4187 automáticamente. No hay API que arrancar. Para usar Chrome instalado en Windows: `$env:PLAYWRIGHT_CHROMIUM_EXECUTABLE='C:\Program Files\Google\Chrome\Application\chrome.exe'`.

## Estructura

- src/main.tsx: páginas, navegación y componentes React.
- src/PlaceMap.tsx: mapa, pines accesibles y ficha inferior.
- src/Quiz.tsx: actividad progresiva y feedback.
- src/OfflineStatus.tsx: instalación del service worker y estado de conexión.
- public/manifest.webmanifest y vite.config.ts: instalación PWA y generación de caché versionada.
- src/content.ts: validación, lectura, almacenamiento y calificación.
- src/ContentEditor.tsx: gestión local de contenidos.
- src/types.ts: tipos del dominio.
- src/data/catalog.json: historia, fuentes, rutas y preguntas.
- src/data/leon-department.json: geometría del departamento.
- src/style.css: estilos adaptables.
- src/assets/catedral-leon.png: ilustración local de la Catedral usada en portada y ficha.
- tests/: pruebas Playwright.
- docs/: investigación y manuales.

## Alcance

La PWA funciona en producción con HTTPS o localhost. Tras el aviso «Guía guardada», el catálogo, cuestionario, imágenes incluidas y mapa básico (límite y dos lugares verificados) se pueden abrir y recargar sin conexión. Los mosaicos de calles OpenStreetMap y enlaces a fuentes requieren Internet; no se descargan regiones de mosaicos. Los archivos externos añadidos al catálogo no se guardan automáticamente. El navegador puede liberar almacenamiento, y la primera visita necesita conexión. El QR no publica el sitio.

Para comprobarlo: ejecutar `npm.cmd run build`, después `npm.cmd run preview -- --port 4173`, abrir http://localhost:4173, esperar «Guía guardada», activar Offline en DevTools y recargar /explorar. La PWA está desactivada en el servidor de desarrollo para evitar versiones obsoletas. Después de publicar una actualización, cerrar todas las pestañas de la app y volver a abrirla permite activar la nueva caché.

León Viejo y Catedral tienen revisión documental inicial; las otras seis fichas necesitan ampliación. Consulta directa de UNESCO y evaluación con estudiantes pendientes. Se conservan las fuentes y el estado de investigación original.

- [Instalación](docs/instalacion.md)
- [Manual de usuario](docs/manual-usuario.md)
- [Arquitectura](docs/diagramas.md)
- [Propuesta](docs/propuesta.md)
- [Fuentes y créditos](docs/fuentes.md)
- [Evaluación con estudiantes](docs/evaluacion-usuarios.md)
- [Feria y video](docs/feria.md)
- [Evidencias](docs/evidencias.md)
