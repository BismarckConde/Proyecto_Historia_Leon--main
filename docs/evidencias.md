# Evidencias de la migración a React

Los resultados y capturas antiguos de Django se retiraron porque corresponden a la arquitectura anterior.

## Ejecución local del 4 de noviembre de 2026

Windows, Node.js 24.15.0 y Chromium de Playwright:

- Compilación TypeScript y Vite: correcta, sin advertencias de tamaño.
- Playwright: 11 pruebas aprobadas, 0 fallidas (17,6 segundos).
- Se corrigió la asociación de la etiqueta del editor JSON detectada en la primera ejecución y se repitió la suite completa.

La instalación de dependencias, Chromium y la ejecución de esbuild requirieron permisos del entorno de trabajo; no se modificó la seguridad del proyecto para resolverlo.

## Comprobaciones reproducibles

- npm run build: validación de tipos y compilación estática.
- npm run test:e2e: navegación, buscador, filtros, fichas, rutas, actividad con respuestas correctas e incorrectas, mapa con mosaicos bloqueados, línea del tiempo, móvil y QR.
- Edición: importación, exportación, persistencia, restauración y rechazo de datos inválidos sin perder el contenido guardado.
- Validación de coordenadas, fuentes, índices de respuesta, enlaces y respuestas incompletas.
- Recuperación de almacenamiento corrupto, datos vacíos y rutas inexistentes.

Playwright genera test-results/results.json. No se versiona. Las pruebas principales usan las fuentes originales; los casos inválidos usan copias aisladas.

## Límites

No sustituyen evaluación con estudiantes, entrevistas, revisión docente, contraste directo con UNESCO ni QR en teléfonos reales. No se ha publicado el sitio ni implementado una PWA. La edición local no proporciona autenticación o sincronización.
