# Registro de fuentes y créditos

## Documento académico consultado
«Trabajo final raíces que nos unen», Programa Académico de Ingeniería de Sistemas / Historia e Identidad Nacional, Managua, 2026. Archivo DOCX aportado por el usuario; autor personal no identificado. Se revisaron sus orientaciones para cuarto año y la exigencia de video de dos minutos. No se redistribuyó el archivo original dentro del repositorio.

## Referencias institucionales por consultar
| Institución | Registro | URL | Consulta / estado |
|---|---|---|---|
| UNESCO, Centro del Patrimonio Mundial | Ruins of León Viejo | https://whc.unesco.org/en/list/613/ | Inicialmente CONNECT 403; después pantalla de comprobación «Just a moment»; no se obtuvo texto histórico |
| UNESCO, Centro del Patrimonio Mundial | León Cathedral | https://whc.unesco.org/en/list/1236/ | Inicialmente CONNECT 403; después pantalla de comprobación «Just a moment»; no se obtuvo texto histórico |

Estas URLs se registraron como referencias pendientes, **no como fuentes ya consultadas**. No se copiaron fechas de inscripción, coordenadas o afirmaciones del sitio sin verificar su contenido.

Prioridades restantes: consulta directa de UNESCO, Instituto Nicaragüense de Cultura, MINED, UNAN-León, archivos y museos, y publicaciones académicas. Las otras seis fichas tienen paráfrasis citadas del portal turístico, pero necesitan fuentes específicas y contraste.

La selección procede del estudiante. Se contrastó León Viejo con la ficha Arquitectura de La Paz Centro y los dos sitios mapeados con OSM/Nominatim. Los restantes seis lugares aparecen en la ficha institucional del municipio de León; sus coordenadas se completaron el 2026-11-06 mediante los registros OSM publicados en Mapcarta (ver actualización al final).

## Ficha de registro documental
- Sitio / acontecimiento.
- Afirmación exacta que se busca respaldar.
- Autor o institución, título y URL.
- Fecha de publicación si consta; fecha real de consulta.
- Sección, página o fragmento pertinente.
- Interpretación y límites: hecho, tradición oral o propuesta.
- Revisión por equipo y docente.
- Coordenadas: origen, formato y comprobación de ubicación.

## Créditos multimedia
No se incorporaron fotografías, audios ni documentos históricos de terceros. Los adornos visuales son CSS original del prototipo; no representan edificaciones históricas. Para cada recurso futuro: autor, URL de origen, licencia específica o permiso, enlace de autorización, texto alternativo y estado de aprobación. El catálogo debe incluir únicamente recursos autorizados; todo recurso incorporado se muestra.

## Cartografía
Leaflet es una biblioteca de visualización. Los mosaicos se solicitan al servicio estándar OpenStreetMap y muestran atribución visible. Consultar https://www.openstreetmap.org/copyright y https://operations.osmfoundation.org/policies/tiles/ antes de un uso público sostenido. No se descargaron mosaicos masivamente ni se usaron como archivo sin conexión. Se incorporó un límite departamental OSM autorizado bajo ODbL 1.0, descrito abajo.

## Datos de pruebas
Los escenarios inválidos usan copias aisladas del catálogo. example.org se utiliza únicamente para probar el QR; no es una dirección publicada del proyecto. Los recorridos actuales de mapa y línea del tiempo en navegador usan los datos reales citados del catálogo.

## Fuentes institucionales consultadas
Consulta: 2 de octubre de 2026 (zona America/Managua). Autoría institucional: Mapa Nacional de Turismo / INTUR, identificada por el portal y sus metadatos de organización. No se atribuyó el contenido a un autor personal no identificado.

| Título | URL pública | Fecha de publicación según API | Uso |
|---|---|---|---|
| Municipio de León (el título del portal contiene «Léon») | https://www.mapanicaragua.com/municipio-de-leon/ | 2020-04-27 | Arquitectura, museos y expresiones culturales; cita por sección |
| Arquitectura de La Paz Centro | https://www.mapanicaragua.com/arquitectura-de-la-paz-centro/ | 2020-07-21 | Ubicación de León Viejo y años 1524, 1967 |
| Ciudades Patrimoniales | https://www.mapanicaragua.com/portfolio-items/ciudades-patrimoniales/ | 2022-02-18 | Años de reconocimiento 2000 y 2011, atribuidos al portal |

Método: lectura del campo `content.rendered` en `/wp-json/wp/v2/posts/1727`, `/posts/4736` y `https://www.mapanicaragua.com/wp-json/wp/v2/avada_portfolio/15515` (el endpoint del último se obtuvo mediante el enlace `self` de búsqueda, no se dedujo). Se conservan paráfrasis y localizadores; no se redistribuyeron páginas completas ni sus imágenes. Las fechas de actualización pueden diferir de publicación. La revisión no establece que cada detalle promocional del portal sea correcto: se seleccionaron afirmaciones específicas y se documentó el contraste primario pendiente.

## Ubicaciones y límite verificados
- León Viejo: https://www.openstreetmap.org/node/1995471042 — latitud 12.4005781, longitud -86.6177931. Objeto `historic/archaeological_site`; Nominatim lo ubica en Puerto Momotombo, La Paz Centro, León. Se descartó el centro de un límite administrativo homónimo.
- Catedral: https://www.openstreetmap.org/way/660182420 — latitud 12.4349820, longitud -86.8781023. Objeto `amenity/place_of_worship`; Nominatim lo ubica en municipio de León, departamento de León.
- Departamento: https://www.openstreetmap.org/relation/2194905 — objeto administrativo de rango estatal, código NI-LE. Geometría consultada con `state=León&country=Nicaragua&polygon_geojson=1&polygon_threshold=0.005`; versión simplificada, orientativa. Guardada en `src/data/leon-department.json`.

Datos © OpenStreetMap contributors, ODbL 1.0. https://www.openstreetmap.org/copyright. Consulta mediante Nominatim; coordenadas WGS84 en grados decimales. No se afirma precisión catastral ni validación sobre el terreno. La cartografía no sustituye una fuente histórica.

## Actualización cartográfica — 2026-11-06

Se completaron los seis puntos pendientes con coordenadas WGS84 de OpenStreetMap consultadas mediante Mapcarta. Las fuentes y notas están en `coordinate_source` de cada ficha.

- Museo y Archivo Rubén Darío: 12.43489, -86.88287. https://mapcarta.com/W388108881
- Barrio y patrimonio cultural de Sutiaba: 12.43212, -86.89365. https://mapcarta.com/N2914699296
- Iglesia de San Juan Bautista de Sutiaba: 12.4336, -86.89491. https://mapcarta.com/W202900221
- Museo de Leyendas y Tradiciones Coronel Joaquín de Arrechavala: 12.43215, -86.87883. https://mapcarta.com/W312935994
- Iglesia de La Recolección: 12.43752, -86.877. https://mapcarta.com/W415136134
- Teatro Municipal José de la Cruz Mena: 12.43371, -86.88066. https://mapcarta.com/W312932871

Sutiaba usa el punto de referencia del barrio, distinto al edificio de la iglesia; no delimita su territorio. En las páginas del teatro y del Museo de Leyendas hay una etiqueta departamental inconsistente: se tomó el objeto cartográfico cuya descripción, dirección y posición corresponden a León. Son posiciones orientativas, no una comprobación sobre el terreno. Datos © OpenStreetMap contributors, ODbL 1.0.

## Acontecimientos añadidos a la cronología

- **Fundación de la Universidad de León (1812):** UNAN-León, [reseña de sus 213 años](https://www.unanleon.edu.ni/213-anos-formando-a-mujeres-y-hombres-con-mistica-y-estirpe-revolucionario/), indica que el decreto CXVI de las Cortes de Cádiz fundó la Real Universidad el 10 de enero de 1812 en el Seminario San Ramón, frente al costado sur de la Catedral. El pin usa un punto cartográfico orientativo junto al edificio vecino.
- **Masacre estudiantil del 23 de julio de 1959:** UNAN-León, [Historia institucional](https://www.unanleon.edu.ni/institucion/historia/), registra la fecha y los nombres de José Rubí, Sergio Saldaña, Erick Ramírez y Mauricio Martínez. La ubicación junto al costado oeste de la Alcaldía se contrastó con una investigación alojada en el [Repositorio UNAN](https://repositorio.unan.edu.ni/id/eprint/10888/1/19545.pdf), pp. 23–24. El pin es orientativo; no se presenta como levantamiento del punto exacto.
- **Liberación de León y Primera Capital de la Revolución:** [Decreto Ejecutivo N.º 795](https://sajurin.enriquebolanos.org/docs/JGRN_0795.pdf), aprobado el 15 de julio de 1981 y publicado en *La Gaceta* N.º 193, consigna que León fue la primera ciudad liberada el 20 de junio de 1979 y la declara simbólicamente Primera Capital de la Revolución. Para el mapa se usa un punto de referencia del centro urbano de León, pues la liberación abarcó la ciudad.
