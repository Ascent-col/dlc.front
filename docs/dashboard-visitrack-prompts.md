# Prompts para el dashboard y la integración con Visitrack

Este documento convierte las notas funcionales del dashboard en dos prompts listos para usar:

1. un prompt de diseño para Stitch, alineado con la interfaz actual de `dlc.front`;
2. un prompt técnico para implementar el módulo de backend `integrations` y su controlador
   `visitrack`.

## Decisiones y vacíos detectados

- El dashboard será visible únicamente para **administradores** y **superadministradores**.
- El identificador usado contra Visitrack debe salir de `companyIdVt`, nunca del `id` interno de la
  compañía.
- `getSurveysActivityStats` ofrece el resumen por formulario y usuario, mientras
  `getSurveysActivityCounter` ofrece el detalle por location/asset de un formulario. Son fuentes
  complementarias.
- `getSurveysActivityCounter` acepta múltiples SurveyID separados por comas en una sola petición.
  `count` puede ser menor al número solicitado, por lo que se debe reconciliar la respuesta por
  SurveyID y reportar los IDs omitidos sin inventar resultados.
- `getActivitiesByFormIDAndUpdatedOnPDF` entrega actividades individuales y `jsonAnswers`, requiere
  una petición por Survey y no tiene paginación confirmada. Debe reservarse para detalle o exportación,
  nunca para recalcular estadísticas ya disponibles.
- `LocationsSinActividad` y `AssetsSinActividad` pertenecen al nivel raíz del contador múltiple; no se
  deben atribuir a un Survey particular.
- `getSurveysActivityStats` no recibe IDs de formularios; el filtrado de formularios seleccionados
  debe hacerse en nuestra capa de integración o en el frontend.
- Los endpoints estadísticos usan `YYYY-MM-DD`; el detalle usa provisionalmente
  `YYYY-MM-DD 00:00` → `YYYY-MM-DD 23:59`. Se debe validar `from <= to` sin asumir todavía zona
  horaria ni inclusividad del proveedor.

## Prompt 1: diseño del dashboard en Stitch

```text
Diseña una nueva vista web responsive llamada “Dashboard” para DLC Front, un producto de monitoreo
operativo construido con Next.js y Ant Design. Entrega el diseño completo para desktop (1440 px),
tablet (768 px) y móvil (390 px), además de los estados vacíos, loading, error y datos parciales.

OBJETIVO
Crear un dashboard moderno, limpio, denso pero fácil de escanear, escalable a muchos formularios,
usuarios, locations y assets. Debe ayudar a administradores y superadministradores a entender la
actividad de formularios Visitrack dentro de un periodo, detectar formularios/locations/assets sin
actividad y profundizar desde compañía → formulario → usuario → location/asset.

LENGUAJE VISUAL EXISTENTE (no reinventar la marca)
- Usar Ant Design como sistema base y conservar el header actual.
- Color principal/navy de marca: #001529. Hover navy: #082946.
- Azul de interacción/foco: #1677ff. Azul informativo: #1890ff.
- Fondo general: #f5f5f5; superficies y cards: #ffffff.
- Bordes suaves: #e2e8f0 o #e6edf5; divisores: #edf1f5.
- Texto secundario: #6b7986; texto principal: navy casi negro.
- Error/eliminadas: #DB524A. Éxito/activas: verde accesible. Advertencia/sin actividad: ámbar.
- Cards con radio de 10–12 px, borde fino y sombra discreta (no glassmorphism, no neón).
- Espaciado consistente en múltiplos de 8; contenido con 24–40 px en desktop y 16 px en móvil.
- Títulos claros, alto contraste, focus visible y targets táctiles de mínimo 44 px.
- Evitar gradientes decorativos, 3D, exceso de colores y gráficos sin etiquetas.

NAVEGACIÓN Y PERMISOS
- Agregar “Dashboard” como nuevo ítem de navegación para rol administrador y superadministrador.
- Mostrar icono de dashboard/analytics, estado seleccionado navy y breadcrumb “Inicio / Dashboard”.
- No diseñar acceso para otros roles.

ENCABEZADO DE LA VISTA
- Título “Dashboard de actividad” y subtítulo con la compañía y la última actualización.
- Acción secundaria “Actualizar”. Al actualizar, mantener los datos anteriores y mostrar progreso
  no bloqueante.

BARRA DE FILTROS (sticky al hacer scroll en desktop)
- Selector múltiple de formularios con búsqueda, checkbox “Seleccionar todos”, contador de
  seleccionados, nombres y SurveyID visibles. Debe soportar decenas o cientos de opciones sin crecer
  indefinidamente; resumir chips con “+N”.
- Date range con “Fecha inicial” y “Fecha final”, fechas inclusivas y presets: últimos 7 días,
  últimos 30 días y mes actual.
- Botón primario “Aplicar filtros” y secundario “Limpiar”. Deshabilitar aplicar si el rango es
  inválido o no hay formularios seleccionados.
- Mostrar filtros activos como resumen legible y permitir quitar uno sin perder los demás.

RESUMEN EJECUTIVO
Primera fila de KPI cards responsive:
1. Formularios seleccionados / total.
2. Actividades totales.
3. Usuarios activos e inactivos (dos cifras en la misma card).
4. Actividades activas y eliminadas.
5. Actividades sin location y sin asset.
Cada KPI debe incluir etiqueta, cifra, contexto del periodo y tooltip que explique su cálculo. No
inventar comparaciones con el periodo anterior si los datos no existen.

CONTENIDO PRINCIPAL
Sección “Actividad por formulario”:
- Barras horizontales ordenadas de mayor a menor: nombre del formulario, SurveyID, total de
  actividades y porcentaje del total filtrado.
- Tooltip al hover/focus con cantidad y porcentaje; el valor también debe permanecer visible fuera
  del tooltip para accesibilidad y uso táctil.
- Tabla complementaria con columnas Formulario, SurveyID, Total, % del total y Usuarios. Permitir
  ordenar, buscar, paginar y expandir filas.
- Los formularios con cero actividad deben aparecer claramente y poder filtrarse con un switch
  “Solo sin actividad”.

Sección “Actividad por usuario” (punto inicial del drill-down solicitado):
- Para el formulario seleccionado o expandido, mostrar un gráfico donut y una tabla sincronizada.
- El donut enseña participación por usuario; usar una paleta accesible, leyenda con UserID/nombre,
  cantidad y porcentaje. Agrupar segmentos pequeños en “Otros”, con acceso a su detalle.
- La tabla tiene Usuario, UserID, Actividades, Participación y una flecha/chevron para expandir.
- Al expandir un usuario, mostrar las locations asociadas a sus actividades con LocationID,
  LocationName, actividades activas/eliminadas y total. Si el endpoint agregado no permite asociar
  usuario con location, mostrar el mensaje “Detalle por ubicación no disponible” y no fabricar esa
  relación.

Sección “Desglose por ubicación” para un formulario:
- Mostrar siempre nombre del formulario y SurveyID que se está analizando.
- Si existen locations, gráfico de barras Location vs. cantidad de actividades, ordenable por total.
  Tooltip al hover/focus con LocationID, nombre, total, activas, eliminadas y porcentaje del total
  del formulario. Añadir total general visible.
- Tabla “Locations sin actividad en la selección” con LocationID obligatorio y LocationName cuando
  exista; aclarar que es un resultado global para los Surveys consultados y no atribuir las filas al
  formulario activo. Incluir contador total, búsqueda y paginación.
- Para assets, repetir el patrón en un tab “Assets”: actividad, total y lista de AssetID sin
  actividad.
- Mostrar contadores explícitos para actividades sin location y sin asset.

CASO SIN LOCATIONS NI ASSETS
- Priorizar actividad por formulario y por usuarios diferentes.
- Mostrar barras de actividades por formulario y donut + tabla de usuarios (nombre/UserID,
  actividades y porcentaje).
- Incluir un empty state explicativo: “Este formulario no tiene locations o assets asociados”, sin
  presentarlo como error.

ARQUITECTURA DE INTERACCIÓN
- Usar progressive disclosure: resumen → formulario → usuario → location/asset.
- Mantener selección y rango de fechas al cambiar de tab o expandir filas.
- Si hay múltiples formularios, permitir elegir el formulario de detalle sin perder el agregado.
- URL preparada para filtros compartibles (surveyIds, from, to), aunque el prototipo no implemente
  routing real.
- Tablas con encabezado fijo, paginación y densidad cómoda; no renderizar listas gigantes completas.

ESTADOS
- Skeletons que conserven la estructura de KPIs, gráficos y tablas.
- Empty inicial que invite a seleccionar formularios y fechas.
- Empty de periodo sin actividad que conserve los filtros y muestre formularios/locations/assets en
  cero cuando estén disponibles.
- Error con explicación breve y acción “Reintentar”.
- Datos parciales: banner amarillo indicando qué formularios fallaron, manteniendo los resultados
  exitosos.
- Tooltip o Alert si falta companyIdVt: “La compañía no tiene configurada la integración con
  Visitrack”.

ACCESIBILIDAD Y RESPONSIVE
- Cumplir WCAG AA, navegación completa por teclado, focus visible y etiquetas ARIA.
- No depender solo del color; acompañar estados con texto/icono.
- Los tooltips deben abrir con hover y focus; en móvil, con tap.
- En tablet, KPIs en 2 columnas y gráficos apilados. En móvil, filtros dentro de drawer, KPIs en una
  columna o carrusel no obligatorio, tablas como cards legibles y gráficos sin scroll horizontal
  innecesario.

ENTREGABLE
Genera un prototipo de alta fidelidad con componentes reutilizables y nombres claros. Incluye una
pantalla poblada con datos realistas, una sin actividad, una de error parcial y las vistas
responsive. No inventes métricas que los contratos descritos no proveen.
```

## Prompt 2: módulo backend `integrations/visitrack`

```text
Implementa en el backend un nuevo módulo llamado `integrations` (o `integraciones` si esa es la
convención dominante del repositorio) y dentro de él un submódulo/controlador `visitrack`. Antes de
editar, inspecciona la arquitectura, convenciones, autenticación, autorización, configuración,
validación, manejo de errores, cliente HTTP, Swagger/OpenAPI y pruebas existentes, y reutilízalas.
No expongas services.visitrack.com directamente al frontend y no pongas CompanyID fijo en código.

OBJETIVO
Proveer una capa segura y tipada entre nuestro frontend y Visitrack para construir el dashboard de
actividad por compañía, formularios, usuarios, locations y assets. El CompanyID externo se obtiene
del nuevo campo `companyIdVt` de la compañía autenticada/solicitada y nunca se acepta libremente
desde el navegador cuando pueda derivarse del contexto autorizado.

CAMBIO DE MODELO DE COMPAÑÍA
- Añadir conceptualmente `companyIdVt` como entero positivo, nullable y único si el negocio confirma
  una relación 1:1 con Visitrack.
- Incluirlo en entidades, DTOs de lectura/escritura y documentación según los permisos existentes;
  no exponerlo a roles no autorizados.
- Dejar exactamente este comentario junto al punto de persistencia/migración pendiente:
  `// TODO juan mora: crear y aplicar la migración/persistencia de companyIdVt en Company.`
- No simular que la migración existe. Si el repositorio requiere compilar antes de ella, aislar el
  acceso mediante el mecanismo temporal que acuerde el equipo y documentarlo.
- Si falta `companyIdVt`, responder 422 con un código estable, por ejemplo
  `VISITRACK_COMPANY_NOT_CONFIGURED`, sin llamar al proveedor.

CONFIGURACIÓN Y SEGURIDAD
- Configurar base URL mediante variable de entorno (`VISITRACK_BASE_URL`, default permitido solo en
  desarrollo: https://services.visitrack.com), timeouts razonables y credenciales si el proveedor
  las requiere. Nunca registrar secretos.
- Autorizar únicamente administrador y superadministrador, siguiendo guards/decorators existentes.
- Validar y transformar query params. Fechas `YYYY-MM-DD`, inclusivas, `from <= to`, límite máximo de
  rango configurable. IDs positivos y `surveyIds` sin duplicados.
- Añadir timeout, cancelación, normalización de errores y logs estructurados con endpoint, duración,
  company interno/companyIdVt y status, sin registrar respuestas sensibles o jsonAnswers.
- No reintentar errores 4xx. Para 429/5xx, usar como máximo reintentos acotados con backoff solo si
  las convenciones del proyecto ya lo soportan.
- Aplicar caché corta a catálogos/estadísticas GET si hay infraestructura existente; la clave debe
  incluir companyIdVt, survey IDs y rango. No cachear respuestas individuales sensibles sin una
  decisión explícita.

ENDPOINTS INTERNOS PROPUESTOS
Usa el prefijo/versionado real del proyecto. Los nombres siguientes expresan el contrato deseado:

1. GET `/integrations/visitrack/surveys`
   - Obtiene la compañía autorizada y su `companyIdVt`.
   - Proxy tipado de:
     GET `https://services.visitrack.com/getSurveysByCompanyId?CompanyID={companyIdVt}`.
   - Devuelve una forma normalizada y estable con al menos SurveyID y Title, preservando otros campos
     útiles documentados. Ordenar por Title salvo que el proveedor garantice otro orden necesario.

2. GET `/integrations/visitrack/users`
   - Proxy tipado de:
     GET `https://services.visitrack.com/getUsersByCompany?CompanyID={companyIdVt}`.
   - Normaliza UserID, UserName y estado activo/inactivo según el contrato real del proveedor.

3. GET `/integrations/visitrack/activity/stats?from=YYYY-MM-DD&to=YYYY-MM-DD&surveyIds=1,2`
   - Consulta:
     GET `https://services.visitrack.com/getSurveysActivityStats?CompanyID={companyIdVt}&from={from}&to={to}`.
   - Normaliza `status`, `TotalSurveys`, `Usuarios.Activos`, `Usuarios.Inactivos`,
     `TotalActividades` y `DetalleSurveys` con SurveyID, Title, TotalActividades, Porcentaje, Usuarios
     (UserID, UserName, TotalActividades, Porcentaje) y `more`.
   - Si llegan `surveyIds`, filtra DetalleSurveys y RECALCULA los totales y porcentajes sobre el
     conjunto filtrado; documenta que no deben conservarse porcentajes calculados sobre toda la
     compañía. Mantén por separado, si es útil, los totales originales con nombres inequívocos.
   - Los usuarios activos/inactivos son métricas de compañía y no deben presentarse como usuarios
     únicos de la selección a menos que el proveedor lo garantice.

4. GET `/integrations/visitrack/activity/counters?surveyIds=1,2&from=YYYY-MM-DD&to=YYYY-MM-DD`
   - Envía una sola petición al proveedor con los IDs positivos, deduplicados y separados por comas:
     GET `https://services.visitrack.com/getSurveysActivityCounter?CompanyID={companyIdVt}&SurveyID={idsCsv}&from={from}&to={to}`.
   - Trata siempre `response` como arreglo y mapea cada elemento por SurveyID; nunca utiliza
     `response[0]` como supuesto contrato de Survey único.
   - Devuelve por Survey: SurveyID, Title, TotalActividades, TotalActivas, TotalEliminadas,
     ActividadesSinLocation, ActividadesSinAsset, Locations y Assets.
   - Conserva `LocationsSinActividad` y `AssetsSinActividad` como colecciones globales de la respuesta,
     fuera de los Surveys. No inventa una relación entre esos elementos y un Survey.
   - `count` representa Surveys efectivamente devueltos, no IDs solicitados. La respuesta interna debe
     incluir `requestedSurveyIds`, `returnedSurveyIds` y `missingSurveyIds` para hacer explícitas las
     omisiones del proveedor. Una omisión no es por sí sola un fallo HTTP total.
   - Normaliza IDs y contadores a tipos consistentes. Un Survey puede tener actividad y `Locations: []`
     o `Assets: []`; en ese caso se deben respetar ActividadesSinLocation/ActividadesSinAsset.

5. GET `/integrations/visitrack/catalogs/locations?includeDeleted=false`
   - Consulta GET `https://services.visitrack.com/getLocationsByCompanyID?CompanyID={companyIdVt}&IsDeleted=0`.
   - Normaliza `ID`, `Name` y `LocationTypeID`. Este es el catálogo general de compañía y no debe
     confundirse con las Locations con actividad del contador.

6. GET `/integrations/visitrack/catalogs/assets`
   - Consulta GET `https://services.visitrack.com/getAssetsByCompanyID?CompanyID={companyIdVt}`.
   - Tolera correctamente `response: []`; la ausencia de Assets es un estado válido, no un error.
   - Validar los nombres exactos de campos del Asset contra una respuesta no vacía antes de fijar el DTO.

7. GET `/integrations/visitrack/catalogs/statuses`
   - Consulta GET `https://services.visitrack.com/DispatchByCompanyID?CompanyID={companyIdVt}`.
   - Normaliza al menos ID, Name, BaseStatusID, Color, IsCompleted, IsDeleted e IsDeviceEnabled.
   - El frontend usa ID como CompanyStatusID. Nunca hardcodear IDs porque dependen de la compañía.

8. GET `/integrations/visitrack/activity/answers?surveyId=1&from=YYYY-MM-DD&to=YYYY-MM-DD&companyStatusId=&locationId=&assetId=`
   - Consulta una vez por Survey:
     GET `https://services.visitrack.com/getActivitiesByFormIDAndUpdatedOnPDF?CompanyID={companyIdVt}&SurveyID={surveyId}&from={fromDate}%2000:00&to={toDate}%2023:59&CompanyStatusID={companyStatusId}&LocationID={locationId}&AssetID={assetId}`.
   - No se ha confirmado soporte de múltiples SurveyID, así que el contrato interno recibe uno solo.
   - Los filtros opcionales vacíos significan “sin filtro”. Los IDs de estado se obtienen del catálogo.
   - Modela `jsonAnswers` como `unknown`. Si llega como string, intenta parsearlo de forma segura y,
     ante JSON inválido, conserva el valor original junto con un indicador de error; nunca impide
     devolver las demás actividades.
   - No inventar todavía nombres tipados para metadata de usuario, Location, Asset, estado o timestamps:
     primero validarlos contra una respuesta completa real. Conservar campos desconocidos en un
     payload externo aislado hasta completar el mapper.
   - No existe paginación, límite, rate limit ni orden estable confirmados. Imponer un rango máximo
     conservador configurable en nuestra API y devolver 413/422 antes de llamar al proveedor cuando
     la consulta sea insegura. Si se necesita varios Surveys, usar un job/export asíncrono en lugar de
     acumular respuestas grandes en memoria.
   - Mantener provisionalmente 00:00 → 23:59 sin conversión UTC. Documentar que zona horaria e
     inclusividad de `to` siguen pendientes de confirmación.
   - `CompanyStatusID=` no aplica filtro explícito, pero aún debe verificarse si incluye registros
     físicamente eliminados. No prometer “todos los estados” hasta validar ese comportamiento.
   - Este endpoint solo se usa para detalle, inspección, agregación User → Location o exportación; no
     se llama para KPIs, contadores ni gráficos ya cubiertos por stats/counters.

CONTRATOS Y CÁLCULOS
- Crear DTOs/types explícitos para request, respuesta del proveedor y respuesta normalizada; no usar
  `any`.
- No mezclar porcentajes: Survey.Porcentaje = actividades del survey / total del conjunto × 100;
  Usuario.Porcentaje = actividades del usuario / total del survey × 100.
- Manejar denominador cero devolviendo 0, no NaN/Infinity. Definir redondeo consistente sin alterar
  contadores enteros.
- No inferir usuario → location: los endpoints descritos dan agregados por usuario y por location en
  estructuras distintas, pero no demuestran la relación entre ambos. Exponer ese drill-down solo
  cuando jsonAnswers u otro endpoint contenga ambas claves.
- Validar que TotalActivas + TotalEliminadas concuerde con TotalActividades cuando el proveedor así lo
  garantice; si no concuerda, registrar una advertencia y preservar los valores originales.

ARQUITECTURA SUGERIDA (adaptar a convenciones reales)
- `integrations.module`
- `visitrack/visitrack.module`
- `visitrack/visitrack.controller` para HTTP/guards/DTOs
- `visitrack/visitrack.service` para orquestación y reglas de negocio
- `visitrack/visitrack.client` para llamadas al proveedor
- `visitrack/dto` y `visitrack/types` para contratos
- Mapper puro y testeable entre respuestas externas e internas.

PRUEBAS Y DOCUMENTACIÓN
- Unit tests de mappers, filtros, recálculo de porcentajes, ceros, validación de fechas, deduplicación
  de IDs, reconciliación de Surveys omitidos y colecciones globales sin actividad.
- Tests del servicio/cliente con HTTP mock: respuesta válida, timeout, 4xx, 429, 5xx, payload
  incompleto y compañía sin companyIdVt.
- E2E del controller para permisos de admin/superadmin, rechazo de otros roles, queries inválidas y
  contratos normalizados.
- Documentar endpoints y ejemplos en Swagger/OpenAPI sin usar datos reales sensibles.
- Añadir variables al `.env.example` si existe y ejecutar lint, typecheck y suite de tests del
  proyecto.

CRITERIOS DE ACEPTACIÓN
- El frontend nunca envía ni conoce necesariamente el CompanyID externo para consultar estadísticas.
- No existen CompanyID/SurveyID de ejemplo hardcodeados.
- Los endpoints agregados y catálogos entregan contratos estables y tipados.
- La selección múltiple genera una sola petición CSV y hace visibles los SurveyID solicitados que el
  proveedor no devolvió.
- El endpoint de detalle acepta un Survey, trata `jsonAnswers` como dinámico y limita consultas de
  volumen inseguro.
- `companyIdVt` y su TODO de persistencia para Juan Mora quedan documentados en el punto indicado.
```

## Validaciones todavía pendientes con VisitTrack

El endpoint de detalle y sus parámetros ya están identificados. Antes de cerrar el contrato productivo
solo falta confirmar con una respuesta completa y pruebas controladas:

1. Los nombres exactos de metadata de cada actividad: SurveyID, UserID, LocationID, AssetID, estado y
   timestamps.
2. Si `CompanyStatusID=` incluye actividades físicamente eliminadas o si requieren otra consulta.
3. La zona horaria de `from`/`to`, la inclusividad del límite final y su precisión real.
4. El volumen máximo admitido, timeouts y posibles rate limits no documentados.
5. Si existe algún mecanismo de paginación no observado y si el proveedor garantiza algún orden.
6. El contrato completo de Assets cuando una compañía devuelva un catálogo no vacío.
7. Si la API añadirá autenticación en el futuro; actualmente los endpoints observados son públicos,
   pero deben seguir encapsulados exclusivamente en el backend.
