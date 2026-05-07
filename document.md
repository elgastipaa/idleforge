Actuá como arquitecto técnico del proyecto y documentador del juego.

Objetivo:
Crear una documentación viva dentro de la carpeta /docs, basada únicamente en el estado real actual del código del proyecto.

Muy importante:
- No inventes sistemas que no existan.
- No documentes features futuras como si ya existieran.
- Primero inspeccioná el repo completo.
- Detectá la arquitectura real, carpetas reales, modelos reales, constantes reales, rutas reales, componentes reales, servicios reales y lógica de juego real.
- Si algo no está claro, marcá “TODO: confirmar” en vez de inventarlo.
- Si encontrás código duplicado, confuso o arquitectura inconsistente, documentalo en una sección de “riesgos / deuda técnica”, pero no lo refactorices todavía.
- No cambies lógica del juego en esta tarea.
- Esta tarea es sólo de documentación.

Tarea:
Crear o actualizar estos archivos dentro de /docs:

1. /docs/00_README_AI.md
2. /docs/01_GAME_DESIGN.md
3. /docs/02_ARCHITECTURE.md
4. /docs/03_DATABASE.md
5. /docs/04_CONSTANTS_AND_BALANCE.md
6. /docs/05_DECISIONS_LOG.md
7. /docs/06_TASKS.md
8. /docs/07_CHANGELOG.md

Contenido esperado:

---

## /docs/00_README_AI.md

Este es el documento que toda IA debe leer antes de tocar el proyecto.

Debe incluir:

- Orden obligatorio de lectura de documentos.
- Reglas para modificar código.
- Reglas para actualizar documentación.
- Reglas para no romper arquitectura.
- Reglas para no duplicar sistemas.
- Reglas para mantener cambios chicos y controlados.
- Regla obligatoria: después de cada cambio que afecte estructura, gameplay, datos, constantes, base de datos, tipos, rutas, componentes principales, servicios o economía, se debe actualizar la documentación correspondiente.
- Regla obligatoria: antes de crear un archivo nuevo, revisar si ya existe un lugar correcto para esa lógica.
- Regla obligatoria: antes de implementar una feature, resumir el plan y listar archivos a tocar.
- Regla obligatoria: después de implementar, listar archivos modificados y docs actualizados.
- Regla obligatoria: si se toma una decisión importante, agregarla a /docs/05_DECISIONS_LOG.md.
- Regla obligatoria: si cambia la estructura de carpetas, actualizar /docs/02_ARCHITECTURE.md.
- Regla obligatoria: si cambian números de balance, timers, rewards, stats o costos, actualizar /docs/04_CONSTANTS_AND_BALANCE.md.
- Regla obligatoria: si cambia la DB/schema/modelos persistidos, actualizar /docs/03_DATABASE.md.
- Regla obligatoria: si cambia una tarea, actualizar /docs/06_TASKS.md.
- Regla obligatoria: si se completa una tarea relevante, actualizar /docs/07_CHANGELOG.md.

También debe incluir un “prompt recomendado” para futuras conversaciones con Codex.

---

## /docs/01_GAME_DESIGN.md

Documentar el diseño real del juego según el código actual.

Debe incluir:

- Fantasía principal del juego.
- Referencias de diseño si aparecen en el proyecto o documentación previa.
- Core loop actual.
- Sistemas existentes reales.
- Sistemas parcialmente implementados.
- Sistemas planeados sólo si aparecen explícitamente en TODOs, comentarios o archivos existentes.
- Qué NO está implementado todavía.
- Principios de diseño recomendados:
  - simple
  - adictivo
  - timer-based / idle si aplica al código actual
  - modular
  - evitar feature creep
  - evitar duplicación

No inventes features.

---

## /docs/02_ARCHITECTURE.md

Documentar la arquitectura real del proyecto.

Debe incluir:

- Stack detectado:
  - framework
  - lenguaje
  - librerías importantes
  - backend si existe
  - base de datos si existe
  - auth si existe
  - styling si existe
- Estructura real de carpetas.
- Qué hace cada carpeta importante.
- Qué archivos son entrypoints.
- Dónde vive la lógica de juego.
- Dónde viven los componentes UI.
- Dónde viven tipos/interfaces.
- Dónde viven constantes.
- Dónde viven servicios/helpers.
- Reglas recomendadas para agregar nuevas features.
- Patrón recomendado para nuevas features, respetando lo que ya existe.
- Riesgos de arquitectura actuales.
- Duplicaciones o inconsistencias detectadas.
- Cosas que NO deben hacerse para evitar spaghetti.

No refactorices nada todavía. Sólo documentá.

---

## /docs/03_DATABASE.md

Documentar la persistencia real.

Si hay base de datos:
- Motor/base usada.
- ORM si existe.
- Modelos/tablas/colecciones reales.
- Campos importantes.
- Relaciones.
- Dónde se lee/escribe cada entidad.
- Migraciones si existen.
- Riesgos o inconsistencias.

Si no hay base de datos todavía:
- Indicar claramente que no hay DB implementada.
- Documentar cómo se guarda actualmente el estado si aplica: localStorage, mock data, arrays en memoria, fixtures, constants, etc.
- Proponer una sección “futura DB sugerida” pero marcada claramente como futura, no implementada.

---

## /docs/04_CONSTANTS_AND_BALANCE.md

Documentar constantes reales del juego.

Buscar y documentar:
- stats base
- fórmulas de combate
- costos
- recompensas
- timers
- experiencia
- niveles
- monedas
- drop rates
- upgrades
- enemigos
- items
- misiones
- edificios
- cualquier número de balance

Para cada grupo de constantes:
- archivo donde vive
- propósito
- valores actuales
- notas de balance
- riesgos si están hardcodeados o duplicados

Si no hay constantes centralizadas, documentar dónde están hardcodeadas y recomendar centralizarlas en el futuro, pero no hacerlo todavía.

---

## /docs/05_DECISIONS_LOG.md

Crear un log de decisiones.

Si ya hay decisiones claras en el código, README, comentarios o estructura, documentarlas.

Formato:

# Decisions Log

## YYYY-MM-DD

### Decision: [título]
Descripción:
Motivo:
Impacto:
Archivos relacionados:

Si no hay decisiones explícitas, crear una entrada inicial diciendo que la documentación fue inicializada a partir del estado real del repo.

Importante:
Cada decisión futura importante de gameplay, arquitectura, DB, economía o monetización debe agregarse acá.

---

## /docs/06_TASKS.md

Crear un archivo de tareas basado en el estado real del proyecto.

Debe incluir:

- Fase actual inferida del proyecto.
- Qué parece estar implementado.
- Qué parece estar incompleto.
- Bugs o riesgos detectados.
- Próximas tareas recomendadas.
- “Do Not Build Yet” para evitar feature creep.
- Una única “Active Task” recomendada.

No inventes un roadmap gigante. Mantenelo simple y accionable.

---

## /docs/07_CHANGELOG.md

Crear changelog del proyecto.

Debe incluir:
- Entrada inicial indicando que se creó la documentación viva.
- Fecha actual.
- Archivos docs creados.
- Aclaración de que no se modificó lógica del juego.

Formato recomendado:

# Changelog

## YYYY-MM-DD

### Added
- Created living project documentation in /docs.

### Changed
- No gameplay logic changed.

### Notes
- Documentation generated from current repository state.

---

Proceso obligatorio:

1. Inspeccioná el árbol de archivos del repo.
2. Leé package.json, README, configs y archivos principales.
3. Identificá framework, stack y estructura.
4. Buscá constantes, fórmulas, modelos, tipos, servicios, componentes y lógica de juego.
5. Buscá TODOs, comentarios importantes y deuda técnica.
6. Creá/actualizá los archivos de /docs.
7. No modifiques lógica del juego.
8. No refactorices.
9. Al terminar, respondé con:
   - resumen de lo creado
   - archivos creados/modificados
   - dudas o TODOs marcados
   - riesgos detectados
   - próxima tarea recomendada

Reglas de mantenimiento futuro que deben quedar escritas en /docs/00_README_AI.md:

Cada vez que una IA trabaje en este proyecto debe hacer esto:

Antes de programar:
1. Leer /docs/00_README_AI.md.
2. Leer los documentos que correspondan a la tarea.
3. Revisar el código existente relacionado.
4. Resumir el plan.
5. Listar archivos que va a tocar.

Durante:
1. Hacer cambios chicos.
2. No duplicar lógica.
3. No crear sistemas paralelos.
4. Mantener UI separada de lógica cuando sea posible.
5. Respetar la arquitectura existente.

Después:
1. Listar archivos modificados.
2. Explicar qué cambió.
3. Actualizar docs afectados.
4. Actualizar /docs/06_TASKS.md.
5. Actualizar /docs/07_CHANGELOG.md.
6. Si hubo decisión importante, actualizar /docs/05_DECISIONS_LOG.md.

Criterio de éxito:
La documentación debe permitir que alguien abra el proyecto dentro de un mes, lea /docs/00_README_AI.md y entienda:
- qué juego es
- cómo está armado
- dónde está cada cosa
- qué está implementado
- qué falta
- qué no conviene tocar todavía
- cómo seguir desarrollando sin generar spaghetti