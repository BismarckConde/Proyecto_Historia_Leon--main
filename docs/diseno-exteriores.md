# Diseño para consultar León en exteriores

Se aplican Taste Skill e Impeccable al producto existente, conservando la paleta, contenidos, fuentes y funcionalidades. Las reglas de sus plantillas comerciales no sustituyen los requisitos de este catálogo educativo: se mantienen coordenadas verificadas, atribuciones, fechas y navegación del mapa. El motor automático de Impeccable no estuvo disponible; se siguieron sus guías directamente.

## Decisiones

- Modo claro inicial: blanco, verde profundo #173c37 y terracota #a84d2b. Arena #f6f3eb para superficies de apoyo. Se conserva la preferencia de tema guardada.
- Georgia para títulos clásicos; Segoe UI/system-ui para lectura e interfaces. Son fuentes locales para funcionar sin conexión y evitar descargas de tipografía.
- Navegación de cuatro destinos en la parte inferior hasta 760 px; Feria/QR y administración quedan en el pie. Objetivos táctiles de al menos 44 px; controles principales de 48 px.
- Se retiran partículas, inclinaciones y vidrio decorativo para reducir distracción y gasto de batería. La ilustración existente se conserva. Las transiciones útiles son la ficha que asciende, la respuesta correcta y la vibración visual de error. La vibración física depende del navegador y se omite con movimiento reducido.
- Línea de tiempo con anclas, no desplazamiento infinito: el catálogo tiene cuatro eventos. Resúmenes de hasta tres líneas y contexto completo desplegable. Para León Viejo se utiliza geometría real del departamento y su ubicación verificada; no se inventan fotos históricas. Datos: OpenStreetMap contributors, ODbL 1.0.
- La ficha del mapa es un panel no modal: permite seguir explorando el mapa. Enter/Espacio abre el pin; Escape cierra la ficha y devuelve el foco.
- No se agrupan dos puntos: los chips filtran categorías y se mantiene la lista accesible.

## Alcance sin conexión

El build genera un service worker con una caché identificada por el hash del contenido. La instalación guarda todos los archivos locales de producción, incluido el catálogo embebido, el límite departamental, las imágenes y el módulo QR. Solo se anuncia disponibilidad al completar la instalación. El documento de navegación se resuelve con la versión guardada, y los módulos públicos del mismo origen ignoran la variación de cabecera Origin al consultar la caché.

No se precargan mosaicos externos. El mapa sin conexión conserva el límite y las ubicaciones; no ofrece calles ni navegación paso a paso. La política del proveedor prohíbe descargas masivas para uso offline: https://operations.osmfoundation.org/policies/tiles/ . El registro requiere HTTPS o localhost; una IP LAN por HTTP no permite instalar la PWA.

Las rutas siguen siendo recorridos educativos digitales, no itinerarios físicos validados. Los datos históricos pendientes conservan sus avisos y fuentes.

## Validación

Build TypeScript/Vite y pruebas Playwright: búsquedas, rutas, quiz completo, temas, edición/importación/exportación, teclado del mapa, filtros, navegación móvil, recarga offline y páginas no visitadas. Se comprueba ausencia de desbordamiento a 390, 768, 1024 y 1440 px. Capturas de revisión en `shots/` mediante el capturador de Taste Skill. No equivale a una auditoría formal de accesibilidad ni a pruebas bajo luz solar en un teléfono físico.
