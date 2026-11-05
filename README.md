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
- Cuatro preguntas con calificación y explicaciones en el navegador.
- Generación y descarga de QR.
- Editor JSON en /admin: validación, importación, exportación, guardado local y restauración.
- Temas claro/oscuro, superficies glassmorphism, partículas decorativas y una ilustración 3D interactiva de la Catedral de León; las animaciones respetan la preferencia de movimiento reducido.

El editor guarda cambios en localStorage de ese navegador y origen. No hay cuentas ni sincronización entre dispositivos. Para compartir cambios, exportar el catálogo, reemplazar src/data/catalog.json y compilar. Las respuestas de la actividad se incluyen en la aplicación; no es un examen protegido.

## Pruebas

```powershell
npx.cmd playwright install chromium
npm.cmd run test:e2e
```

Playwright inicia Vite automáticamente. No hay API que arrancar.

## Estructura

- src/main.tsx: páginas, navegación y componentes React.
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

Catálogo y actividad funcionan sin servicios externos una vez instalada y servida la aplicación. Mosaicos OpenStreetMap y enlaces a fuentes requieren Internet. No hay caché PWA. El QR no publica el sitio.

León Viejo y Catedral tienen revisión documental inicial; las otras seis fichas necesitan ampliación. Consulta directa de UNESCO y evaluación con estudiantes pendientes. Se conservan las fuentes y el estado de investigación original.

- [Instalación](docs/instalacion.md)
- [Manual de usuario](docs/manual-usuario.md)
- [Arquitectura](docs/diagramas.md)
- [Propuesta](docs/propuesta.md)
- [Fuentes y créditos](docs/fuentes.md)
- [Evaluación con estudiantes](docs/evaluacion-usuarios.md)
- [Feria y video](docs/feria.md)
- [Evidencias](docs/evidencias.md)
