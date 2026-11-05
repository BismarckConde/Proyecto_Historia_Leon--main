# Diagramas del sistema

## Arquitectura

```mermaid
flowchart LR
 U[Estudiante o docente] --> R[React y TypeScript]
 R --> C[Catálogo JSON incluido]
 R --> L[(localStorage)]
 E[Editor local React] --> L
 E --> J[Importación y exportación JSON]
 R --> Q[Calificación y QR locales]
 R -. mosaicos opcionales .-> O[OpenStreetMap]
 V[Vite] --> R
```

Un único servidor sirve la aplicación. content.ts valida el catálogo, resuelve relaciones y califica preguntas. No hay API ni base de datos de servidor. Una edición válida guardada en el navegador tiene prioridad sobre el catálogo incluido.

## Relaciones

```mermaid
flowchart TD
 L[Lugar: ID, slug y municipio] --> F[Fuentes y afirmaciones]
 L --> M[Recursos autorizados]
 A[Acontecimiento] -->|place_slug| L
 R[Ruta] --> P[Paradas con orden único]
 P -->|place_slug| L
 Q[Pregunta y explicación] -->|place__slug| L
 A --> S[Fuente]
 Q --> S
```

IDs y slugs únicos por colección; referencias existentes; coordenadas completas con fuente verificada; fichas revisadas con afirmaciones respaldadas. Se validan opciones e índice de respuesta. Los recursos incluidos deben tener permiso de publicación; no hay cola de aprobación en servidor.

## Navegación

```mermaid
flowchart TD
 I[Inicio] --> E[Explorar: filtros, mapa y lista]
 E --> F[Ficha y fuentes]
 I --> T[Línea del tiempo]
 T --> F
 I --> R[Rutas por paradas]
 R --> F
 I --> Q[Actividad y resultado]
 I --> QR[Feria y QR]
 I --> A[Editor JSON local]
```

La edición afecta solo al navegador y origen actual. No requiere sesión y no modifica los archivos del proyecto. La exportación permite trasladar cambios manualmente.
