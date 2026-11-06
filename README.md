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
- Siete acontecimientos, con categoría y ubicación para consultarlos en Explorar y en el mapa; la línea del tiempo incluye solo los hitos marcados como relevantes.
- Mini-quiz de cuatro preguntas, progreso, respuestas con feedback inmediato y explicación.
- Panel de administración en /admin con acceso Google vía Supabase, gestión de lugares/fotos y sucesos históricos con fuentes, ubicación y selección de hitos para la línea del tiempo.
- Temas claro/oscuro de alto contraste, navegación inferior móvil, fichas inferiores en el mapa y filtros por tema. Títulos clásicos y texto de interfaz legible; animaciones con movimiento reducido.
- Línea del tiempo con anclas por año, ilustración de la Catedral y mapa local de León Viejo. El contexto completo sigue disponible.
- PWA instalable con catálogo, imágenes y mapa básico local disponibles después de la primera carga completa de producción.

## Configurar el panel de administración

1. En Supabase, habilita Google en Authentication → Providers y configura las URLs de redirección de desarrollo y producción terminadas en `/admin`.
2. Copia `.env.example` como `.env.local` y completa `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y la URL de retorno.
3. Ejecuta `supabase/schema.sql` en SQL Editor.
4. Inicia sesión una vez en `/admin` con Google. En Authentication → Users, copia el UUID de esa cuenta y agrégalo a `public.admin_users` según el comentario al final del SQL.
5. Actualiza `/admin`. Ya podrás crear, editar y eliminar lugares. Las fichas y el resto del catálogo se comparten entre visitantes desde Supabase. Al seleccionar una foto, el archivo se sube a Supabase Storage y solo su URL pública se guarda en el catálogo.

El catálogo inicial sigue siendo `src/data/catalog.json` y funciona como respaldo cuando la tabla remota aún no tiene contenido o Supabase no está disponible. La clave `anon` es pública y queda sujeta a RLS; nunca pongas la clave `service_role` en el frontend.

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
- src/ContentEditor.tsx: panel de administración y gestión de contenidos.
- src/supabase.ts y supabase/schema.sql: cliente, tablas y políticas de acceso.
- src/types.ts: tipos del dominio.
- src/data/catalog.json: historia, fuentes, rutas y preguntas.
- src/data/leon-department.json: geometría del departamento.
- src/style.css: estilos adaptables.
- src/assets/catedral-leon.png: ilustración local de la Catedral usada en portada y ficha.
- tests/: pruebas Playwright.
- docs/: investigación y manuales.

## Alcance

La PWA funciona en producción con HTTPS o localhost. Tras el aviso «Guía guardada», el catálogo, cuestionario, imágenes incluidas y mapa básico (límite y dos lugares verificados) se pueden abrir y recargar sin conexión. Los mosaicos de calles OpenStreetMap y enlaces a fuentes requieren Internet; no se descargan regiones de mosaicos. Los archivos externos añadidos al catálogo no se guardan automáticamente. El navegador puede liberar almacenamiento, y la primera visita necesita conexión.

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
