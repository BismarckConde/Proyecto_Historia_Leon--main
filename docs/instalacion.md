# Instalación y mantenimiento

## Windows / PowerShell

Con Node.js 22 o superior, abrir una terminal en la raíz:

```powershell
npm.cmd ci
npm.cmd run dev -- --port 5173
```

Abrir http://localhost:5173. Se usa npm.cmd para evitar restricciones de npm.ps1. En Linux/macOS usar npm. No se necesitan Python, migraciones, variables de entorno ni un segundo servidor.

## Compilación y pruebas

```powershell
npm.cmd run build
npx.cmd playwright install chromium
npm.cmd run test:e2e
npm.cmd run preview -- --port 4173
```

El build valida TypeScript y genera dist/. Playwright inicia Vite en 5173. PLAYWRIGHT_CHROMIUM_EXECUTABLE permite seleccionar un Chromium ya instalado.

## Datos y respaldos

El catálogo inicial está en src/data/catalog.json, formato versión 1. Las relaciones de acontecimientos y paradas usan el slug del lugar.

En /admin se puede editar o importar JSON, validar al guardar y exportar. La clave localStorage es leon-en-el-tiempo.catalog.v1. Cambiar de puerto, de localhost a una IP, de navegador o de dispositivo abre un almacenamiento diferente.

Exportar antes de limpiar el navegador. Importar carga el archivo para revisión; Guardar cambios lo aplica. Restaurar exige confirmar y reemplaza la copia local. Si el almacenamiento está bloqueado, se puede consultar el catálogo original pero no guardar ediciones.

Para distribuir una edición, sustituir src/data/catalog.json por el archivo exportado, probar y compilar. Un visitante con una copia local previa debe restaurar o importar la nueva versión. No hay base central, autenticación ni edición compartida. Las respuestas del cuestionario son públicas dentro de los recursos de la aplicación.

## Feria y publicación

Vite escucha en 0.0.0.0. Conectar equipos a la misma red privada, identificar la IP LAN real y abrir el puerto 5173 si es necesario. Probar http://IP-REAL:5173 desde el teléfono antes de generar el QR.

Para publicación servir dist/ con HTTPS y fallback a index.html para las rutas de React. Los servidores dev y preview son para desarrollo y comprobación local. Esta migración no publica el sitio.
