# León en el tiempo: investigación histórica aplicada y propuesta tecnológica

## 1. Correspondencia con las orientaciones docentes
Se revisó el documento proporcionado «Trabajo final raíces que nos unen», Programa Académico de Ingeniería de Sistemas, Historia e Identidad Nacional, Managua, 2026. No consta un nombre de autor en el texto extraído. Se aplica la sección **B. Orientaciones para estudiantes de Cuarto Año**, que exige investigación aplicada, análisis, diseño, implementación, validación, manuales, evidencias y demostración. La programación no obligatoria de la sección anterior no sustituye este requisito de cuarto año. El documento solicita además un video de dos minutos. Sus menciones de IA y realidad aumentada son ejemplos; no se incorporan a este prototipo.

Esta entrega implementa la base técnica y prepara los instrumentos de investigación. **No constituye todavía la investigación histórica final ni una evaluación con participantes.**

## 2. Tema y delimitación
Plataforma educativa del departamento de León, Nicaragua. La ciudad de León no equivale al departamento. La ficha Arquitectura de La Paz Centro de Mapa Nacional de Turismo sitúa León Viejo en Puerto Momotombo. El registro cartográfico OSM consultado confirma La Paz Centro y departamento de León. El registro de la Catedral corresponde al municipio de León. Las otras seis fichas aparecen en la ficha institucional del municipio de León y se mantienen pendientes de ampliar su investigación. Selección inicial: León Viejo; Catedral; Museo y Archivo Rubén Darío; patrimonio de Sutiaba; San Juan Bautista de Sutiaba; Museo de Leyendas y Tradiciones; La Recolección; Teatro José de la Cruz Mena.

Se priorizó UNESCO, pero su respuesta no entregó los textos del registro. Se consultó Mapa Nacional de Turismo mediante su API pública y se verificaron coordenadas y límite departamental en OSM/Nominatim. No se incorporaron fotografías sin permiso.

## 3. Problema y evidencia pendiente
Hipótesis: la información de estos lugares está dispersa y los estudiantes pueden tener dificultades para relacionar sitio, municipio, acontecimientos y aporte a la identidad cultural. Los recursos institucionales identificados constituyen un punto de partida, pero su mera existencia no demuestra una dificultad educativa. Se requiere revisar al menos tres recursos accesibles y realizar la consulta descrita en `evaluacion-usuarios.md`. No se declara que los jóvenes desconocen su historia sin evidencia.

Pregunta de investigación: ¿cómo puede una plataforma que conecta fichas citadas, ubicación y acontecimientos facilitar la exploración crítica del patrimonio de León entre estudiantes universitarios?

Justificación: organizar fuentes y relaciones en un mismo recorrido permite explorar la memoria cultural y examinar el respaldo de cada afirmación. El impacto educativo es esperado; se debe medir. La orientación docente vincula la iniciativa con historia e identidad nacional, ciencia, investigación e innovación, y educación artística y cultural. Esa vinculación se atribuye al documento docente y no representa una evaluación independiente de las políticas citadas.

## 4. Objetivos
Objetivo general: diseñar, implementar y evaluar un prototipo educativo que organice y divulgue información histórica respaldada del departamento de León.

Objetivos específicos:
1. Delimitar y documentar ocho espacios mediante fuentes institucionales y académicas.
2. Registrar citas por afirmación y diferenciar hechos, tradición oral y contenido pendiente.
3. Integrar consulta de fichas, mapa, búsqueda, acontecimientos y rutas digitales.
4. Administrar contenidos mediante edición local validada y evaluar la comprensión mediante una actividad.
5. Validar funcionamiento técnico y observar tareas reales con estudiantes.

## 5. Alcance y usuarios
Usuarios: estudiantes, docentes y visitantes interesados. Administradores: equipo de investigación autorizado. Se entrega una aplicación local React con catálogo JSON, edición local y documentación. No incluye pagos, cuentas de visitantes, geolocalización, cálculo de traslados ni publicación pública automática. Las rutas son secuencias educativas; no instrucciones para caminar o conducir.

Primera versión: fichas y fuentes, catálogo con filtros, mapa de puntos verificados y alternativa en lista, línea del tiempo verificada, cuatro rutas editoriales, actividad de lectura crítica y administración. La ruta «Orígenes de León» conecta León Viejo y Catedral, fichas con revisión documental inicial. Su narrativa se ampliará al contrastar fuentes primarias.

## 6. Requerimientos y trazabilidad
| ID | Requerimiento / funcionalidad | Comprobación | Estado |
|---|---|---|---|
| RF01 | Inicio con propósito e ingreso al catálogo | Prueba de navegador inicio→catálogo | Implementado |
| RF02 | Consulta de fichas y citas | Catálogo local, navegador buscador→ficha | Implementado; contenido pendiente |
| RF03 | Mapa de puntos con fuente verificada; lista alternativa | Navegador con dos ubicaciones OSM reales y fallo de mosaicos | Implementado y probado; seis ubicaciones pendientes |
| RF04 | Línea del tiempo con fuentes y enlace a ficha | Navegador con acontecimientos citados de INTUR | Cuatro acontecimientos incorporados y probados |
| RF05 | Rutas temáticas por paradas | Navegador ruta→segunda parada | Implementado |
| RF06 | Búsqueda y filtros por municipio, tema y período disponible | Datos locales y navegador filtro municipal | Implementado |
| RF07 | Preguntas, explicación y resultado | Datos locales y navegador con respuestas correctas e incorrectas | Cuatro preguntas implementadas, dos históricas citadas |
| RF08 | Editar e importar catálogo local | Editor React → guardar → consultar | Implementado |
| RF09 | QR para dirección de demostración real | Navegador generación y rechazo de localhost | Implementado; publicación pendiente |
| RNF01 | Adaptación móvil | Navegador a 390 px, sin desbordamiento | Probado |
| RNF02 | Accesibilidad básica | Etiquetas, navegación semántica, enlace al contenido, foco visible | Implementada; auditoría con usuarios pendiente |
| RNF03 | Validación de edición local | Validación de archivos y referencias; cambios aislados por navegador | Probado en desarrollo |
| RNF04 | Consulta con dependencia mínima de Internet | Servicios locales; alternativa de lista y sin recursos remotos iniciales | Implementado; mapa externo requiere Internet |
| RNF05 | Disponibilidad y escalabilidad | JSON y un servidor estático | Adecuado para demostración; no validado a escala |

## 7. Investigación histórica: protocolo
Para cada sitio registrar antecedentes, transformaciones, importancia cultural, relación con identidad nacional y límites del conocimiento. Una afirmación necesita texto, fuente, URL, institución o autor, fecha disponible, fecha de consulta y localizador. No extraer imágenes solo porque el texto es accesible: verificar derechos de cada recurso.

Para coordenadas: consultar el registro institucional, anotar el sistema y formato, transformar solo si el formato está documentado y comprobar posición en un mapa de referencia. No usar el centro de un municipio como ubicación del sitio. Para límites del departamento buscar un archivo geográfico con licencia y registrar su procedencia antes de integrarlo.

Para Sutiaba y memoria oral: solicitar consentimiento, atribuir autoría según la preferencia del participante, permitir anonimato, respetar contexto y distinguir el relato de un acontecimiento documental. No se realizaron entrevistas en esta entrega.

## 8. Innovación e impacto esperado
La propuesta conecta lugar, fuente, acontecimiento y ruta educativa en una interfaz que explicita incertidumbre. La diferencia frente a otros recursos requiere comparación documentada; no se afirma originalidad absoluta. Beneficiarios esperados: estudiantes, docentes y visitantes de la feria. El impacto se observará mediante tasa de tareas completadas y respuestas de comprensión, sin equiparar una muestra pequeña con toda la población.

## 9. Desarrollo y evaluación
Arquitectura y entidades en `diagramas.md`; instrucciones técnicas en `instalacion.md`. Las pruebas automáticas y sus límites se registran en `evidencias.md`. El instrumento de evaluación con usuarios no contiene resultados inventados.

## 10. Entregas restantes
Consultar directamente UNESCO y contrastar las dos fichas inicialmente revisadas; ampliar las otras seis y verificar sus ubicaciones; incorporar únicamente recursos autorizados; revisar con docente; ejecutar consulta con estudiantes y registrar mejoras; preparar dirección accesible, QR y video de dos minutos.

## 11. Hallazgos documentales iniciales
Las paráfrasis siguientes se respaldan con citas por afirmación en `src/data/catalog.json`. Las fechas de publicación son metadatos del portal; la consulta se realizó el 2 de octubre de 2026, según la zona horaria del usuario.

| Lugar | Hallazgo respaldado | Fuente y localizador | Límite de la revisión |
|---|---|---|---|
| León Viejo | Sitio en Puerto Momotombo; fundación original en 1524 y redescubrimiento en 1967 | Mapa Nacional de Turismo, Arquitectura de La Paz Centro, sección Ruinas de León Viejo | Contrastar arqueología y fuentes primarias |
| León Viejo | Reconocimiento por UNESCO en 2000, según la publicación turística | Ciudades Patrimoniales, párrafo introductorio | Registro UNESCO no consultado directamente |
| Catedral | Transición barroco/neoclásico y sepultura de Rubén Darío | Municipio de León, Arquitectura → Catedral | No fijar cronología de construcción sin contraste |
| Catedral | Reconocimiento por UNESCO en 2011, según la publicación turística | Ciudades Patrimoniales, párrafo introductorio | Registro UNESCO no consultado directamente |
| Museo Archivo Rubén Darío | Colección de manuscritos, primeras ediciones y documentos | Municipio de León, sección del museo | Consultar UNAN-León y el archivo |
| Sutiaba | Alfombras de aserrín en Semana Santa | Municipio de León, Cultura y Festividades Religiosas | No hay testimonios comunitarios recogidos |
| San Juan Bautista | Frontispicio de influencia barroca y planta en cruz latina | Municipio de León, Arquitectura, sección del templo | Ampliar historia y relación comunitaria |
| Museo de Leyendas | Exposición de figuras de mitos y leyendas; edificio identificado como Cárcel La 21 | Municipio de León, sección Museo de Mitos, leyendas y tradiciones | No se afirma realidad de los relatos; ampliar trayectoria documental |
| La Recolección | Fachada barroca mexicana y altares neoclásicos, según la descripción institucional | Municipio de León, Arquitectura | Contrastar documentación del templo |
| Teatro José de la Cruz Mena | Fachada con elementos barrocos y neoclásicos; relación del nombre con legado musical | Municipio de León, Arquitectura y Cultura | Ampliar cronología y programación |

Análisis: los dos primeros sitios permiten conectar origen urbano, arqueología, arquitectura y memoria literaria en una ruta. Las demás fichas amplían la mirada hacia memoria comunitaria, expresiones artísticas y patrimonio religioso. Esta interpretación es una propuesta educativa del equipo, no una declaración histórica atribuida a una comunidad. La revisión inicial depende de un portal institucional y de cartografía colaborativa; hace falta triangulación documental y revisión docente. No se reproduce la afirmación promocional «cuna de Rubén Darío» como lugar de nacimiento ni se confunde el museo de León con la casa natal de Ciudad Darío.
