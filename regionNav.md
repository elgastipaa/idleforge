/goal

Implementar una navegación de dos niveles para la pantalla de regiones y expediciones del juego.

Contexto:
Quiero que la pantalla empiece mostrando las regiones disponibles en un carrusel horizontal. Cuando el jugador hace click/tap en una región, la pantalla cambia para mostrar únicamente las expediciones de esa región. En esa vista debe haber una flecha/botón de volver para regresar a la selección de regiones.

Importante:
- No implementar todavía un selector de regiones dentro de la vista de una región.
- No implementar mapa de regiones.
- Mantener el estilo visual, componentes, convenciones de nombres y arquitectura existentes del proyecto.
- No agregar dependencias nuevas salvo que sea realmente necesario.
- Usar los datos/modelos existentes de regiones y expediciones que ya existen.
- Si no existen componentes separados, crear componentes simples y reutilizables.

Comportamiento esperado:

1. Vista inicial: selección de regiones
- Mostrar una lista/carrusel horizontal de regiones.
- Cada región debe mostrarse como una card clickeable/tappeable.
- El carrusel debe tener scroll horizontal.
- Idealmente usar overflow-x / scroll horizontal nativo o el patrón ya existente en el proyecto.
- La card de región debería mostrar como mínimo:
  - nombre de la región
  - imagen/icono/arte si existe (sino no)
  - estado bloqueada/desbloqueada si existe (si no está desbloqueada, que directamente no permita tapearla para ingresar. Sí podríamos indicar qué es lo necesario para desbloquearla muy brevemente, tipo "Requiere nivel 10.")
  - progreso si existe, por ejemplo expediciones completadas / total
- Si una región está bloqueada, debe verse bloqueada y no navegar a sus expediciones, salvo que el proyecto ya tenga otro comportamiento definido para regiones bloqueadas.

2. Al seleccionar una región
- Guardar la región seleccionada en estado local o en el sistema de navegación existente.
- Cambiar la vista para mostrar las expediciones filtradas por esa región.
- Mostrar un header con:
  - botón/flecha de volver
  - nombre de la región seleccionada
  - descripción o metadata si existe
- Debajo del header, mostrar las expediciones disponibles para esa región.
- Cada expedición debe mantener el comportamiento actual que ya exista: abrir detalle, empezar expedición, mostrar locked state, etc.
- No romper la lógica existente de expediciones.

3. Volver a regiones
- Al tocar la flecha/botón de volver, volver a la vista del carrusel de regiones.
- Limpiar la región seleccionada o dejarla preparada sin mostrarla, según convenga al estado actual.
- No navegar hacia otra pantalla externa si esto puede resolverse dentro del mismo view/state.
- Este botón/flecha debe estar del lado derecho de la view, para favorecer al thumb.

4. Estados vacíos y edge cases
- Si una región no tiene expediciones, mostrar un empty state claro.
- Si no hay regiones, mostrar un empty state claro.
- Si la región seleccionada deja de existir o no se encuentra, volver automáticamente a la vista de regiones.
- Mantener soporte mobile/touch.

Criterios de aceptación:
- Al entrar a la pantalla, veo regiones en scroll horizontal.
- Puedo hacer click/tap en una región desbloqueada.
- Después de seleccionar una región, veo solo las expediciones de esa región.
- Veo una flecha o botón de volver.
- Al volver, regreso al carrusel horizontal de regiones.
- No aparece un selector de regiones dentro de la vista de expediciones.
- La UI sigue el estilo actual del proyecto.
- No se rompe el flujo actual de abrir o iniciar una expedición.
- El código queda separado en componentes razonables, por ejemplo:
  - RegionCarousel
  - RegionCard
  - RegionExpeditionsView
  - ExpeditionCard o el componente existente equivalente
- Si el proyecto tiene tests, stories o snapshots relacionados, actualizarlos o agregar cobertura mínima.

Implementación sugerida:
- Buscar primero la pantalla actual donde se listan regiones o expediciones.
- Identificar los tipos/modelos existentes de Region y Expedition.
- Implementar un estado similar a:
  - selectedRegionId: string | null
- Si selectedRegionId es null, renderizar el carrusel de regiones.
- Si selectedRegionId tiene valor, buscar la región seleccionada y renderizar sus expediciones filtradas.
- Usar una función handleSelectRegion(regionId) para entrar a la región.
- Usar una función handleBackToRegions() para volver al carrusel.
- Reutilizar componentes existentes siempre que sea posible.
- Mantener TypeScript/types correctos si el proyecto usa TypeScript.

Antes de terminar:
- Revisar que no haya errores de lint/typecheck.
- Revisar que el scroll horizontal funcione en desktop y mobile.
- Revisar que regiones bloqueadas no rompan la navegación.
- Revisar que expediciones de otra región no aparezcan en la región seleccionada.

Agregar comportamiento de scroll snap al carrusel horizontal de regiones.

Quiero que el carrusel de regiones tenga snap por card:
- El usuario puede scrollear horizontalmente.
- Mientras arrastra, el scroll puede moverse libremente.
- Cuando suelta el scroll, la región más cercana al centro debe quedar centrada/alineada.
- No debería quedar el carrusel quieto con dos regiones a medias en el centro de la pantalla.
- Si el usuario pasa cierto umbral hacia la siguiente card, al soltar el scroll el carrusel debe terminar centrando la próxima región.
- Si no pasa ese umbral, debe volver a centrar la región actual.

Preferir una implementación con CSS Scroll Snap nativo:
- En el contenedor del carrusel usar scroll-snap-type: x mandatory.
- En cada card de región usar scroll-snap-align: center.
- Usar scroll-snap-stop: always si aplica.
- Mantener overflow-x: auto y soporte touch/mobile.
- Usar scroll-behavior: smooth para transiciones suaves cuando corresponda.
- Agregar padding horizontal al carrusel para que la primera y la última card también puedan quedar centradas.
- No agregar una librería de carousel salvo que el proyecto ya use una.

Si CSS Scroll Snap no alcanza por la estructura actual del proyecto, implementar una solución mínima con JavaScript:
- Al terminar el scroll/touch/momentum, calcular cuál card está más cerca del centro del contenedor.
- Hacer scroll programático hacia esa card usando scrollIntoView o scrollTo con comportamiento smooth.
- Mantener el estado visual de la card activa si ya existe.
- Respetar prefers-reduced-motion.