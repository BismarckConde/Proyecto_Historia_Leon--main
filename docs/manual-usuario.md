# Manual de usuario

## Estudiantes y docentes
1. En inicio elegir **Iniciar recorrido**.
2. En **Explorar** escribir el nombre de un lugar o seleccionar municipio y tema. El filtro de período aparece cuando exista contenido con período registrado.
3. Abrir la ficha desde una tarjeta o un marcador disponible. Leer descripción, estado, afirmaciones y fuentes. Una referencia pendiente no demuestra una afirmación.
4. En **Historia** filtrar por lugar, saltar a una fecha y ampliar el contexto o abrir la ficha. Solo se muestran acontecimientos con fuente y revisión verificadas. Actualmente hay cuatro acontecimientos respaldados por Mapa Nacional de Turismo; la consulta directa de UNESCO sigue pendiente.
5. En **Rutas** seleccionar un recorrido; abrir cada ficha y avanzar por las paradas. No interpretar las paradas como trayecto físico.
6. En **Quiz** elegir una opción y leer la explicación inmediata. La respuesta queda fijada al tocarla; avanzar con Siguiente pregunta. Al finalizar se muestra el resultado y se puede repetir sin guardar información personal.
7. En **Preparar feria y QR**, al pie de la página, introducir la dirección real accesible desde teléfonos y descargar el QR. Probarlo antes de imprimir.

En móvil, Explorar, Historia, Rutas y Quiz están en la barra inferior. Los temas se filtran con botones horizontales. Tocar un pin abre una ficha desde abajo; Cerrar ficha permite volver al mapa. Con teclado, Enter o Espacio abre el pin y Escape cierra la ficha.

## Si no hay Internet
Abrir una vez la versión de producción con conexión y esperar «Guía guardada». Después, el catálogo, el quiz y el mapa básico local funcionan incluso al recargar sin conexión. Las calles y fuentes externas necesitan Internet. La instalación en la pantalla de inicio se hace desde el menú del navegador cuando esté disponible; requiere HTTPS o localhost. En desarrollo con Vite no se instala la caché offline. Si el catálogo local está dañado, abrir Administrar contenidos locales y restaurar el original o importar un respaldo válido.

## Gestión local de contenidos
Abrir Administrar contenidos locales. Editar el JSON o importar un archivo, revisar y pulsar Guardar cambios. Solo se modifica este navegador y origen. Exportar JSON permite respaldar o trasladar cambios. Restaurar catálogo original pide confirmación y reemplaza la copia local.

Registrar fuentes con institución, URL, fecha real y notas. Marcar como verificada solo después de consultarla. Las coordenadas necesitan ambas componentes y una fuente verificada. Una ficha revisada necesita una afirmación respaldada. Los acontecimientos verificados también requieren fuente verificada.

Las paradas referencian lugares existentes mediante place_slug y tienen orden único. Las preguntas usan place__slug, al menos dos opciones, correct_index desde cero y explicación. Los recursos deben tener autor, licencia y permiso antes de incorporarlos; todos los recursos incluidos se muestran.

No hay cuentas ni inicio de sesión. Para distribuir cambios, reemplazar src/data/catalog.json por el archivo exportado y volver a compilar. La actividad es educativa y las respuestas están incluidas en la aplicación.
