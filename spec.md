# Especificación formal — Pomodoro

## 1. Identificación

- **Nombre:** Pomodoro - Spec Driven Development
- **Metodología:** Spec Driven Development (SDD)
- **Fuente única de verdad:** este documento.

## 2. Objetivo

Definir de forma precisa, observable y verificable una aplicación Pomodoro que alterne ciclos de trabajo y descanso corto, controle el tiempo y el número de trabajos completados, notifique las transiciones y funcione sin instalación al abrir `index.html` en un navegador moderno.

## 3. Alcance

### Incluido

- Ciclo `WORK` de 25 minutos y ciclo `SHORT_BREAK` de 5 minutos.
- Inicio, pausa, reanudación y reinicio del ciclo actual.
- Transición automática entre modos al finalizar cada ciclo, quedando el nuevo ciclo pausado.
- Contador en memoria de Pomodoros completados.
- Notificación visual accesible, sonido generado con Web Audio API y título dinámico.
- Interfaz semántica, accesible y responsive desde 320 px.

### No incluido

- Descanso largo, tareas, cuentas, analítica, configuración de duraciones o persistencia.
- Ejecución automática del ciclo siguiente.
- Notificaciones del sistema operativo, archivos de audio o recursos remotos.
- Compatibilidad con navegadores obsoletos o uso sin JavaScript.

## 4. Restricciones tecnológicas

Se permiten exclusivamente HTML5, CSS3 y JavaScript Vanilla. Se prohíben React, Angular, Vue, Bootstrap, Tailwind, jQuery, Vite, Webpack, paquetes npm, frameworks, librerías externas, preprocesadores, empaquetadores, dependencias y recursos externos. No habrá `package.json`, `node_modules`, proceso de build ni requisito de servidor.

## 5. Estructura contractual de archivos

| Archivo | Responsabilidad contractual |
|---|---|
| `spec.md` | Fuente única de verdad para requisitos, comportamiento y aceptación. |
| `index.html` | Estructura HTML5 semántica, contenido inicial y referencias locales. |
| `style.css` | Presentación responsive, modos y accesibilidad visual. |
| `script.js` | Estado, temporizador, controles, ciclos, contador y notificaciones. |
| `README.md` | Documentación académica, ejecución, evidencia SDD y pruebas. |

## 6. Terminología

- **WORK:** modo de trabajo de 25 minutos.
- **SHORT_BREAK:** modo de descanso corto de 5 minutos.
- **RUNNING:** estado de ejecución con exactamente un intervalo activo.
- **PAUSED:** estado sin intervalo activo; incluye el estado inicial, una pausa y el nuevo ciclo tras una transición.
- **IDLE:** condición inicial observable, representada por `PAUSED` y sin tiempo consumido.
- **COMPLETED_POMODORO:** evento emitido una sola vez al finalizar correctamente un ciclo `WORK`; incrementa el contador en uno.

## 7. Constantes contractuales

```js
const WORK_DURATION_SECONDS = 25 * 60;
const SHORT_BREAK_DURATION_SECONDS = 5 * 60;
```

No podrán modificarse mediante la interfaz ni quedar con valores reducidos de prueba.

## 8. Modelo de estado

| Variable | Tipo | Inicial | Permitidos y significado | Invariantes |
|---|---|---:|---|---|
| `currentMode` | string | `WORK` | `WORK` o `SHORT_BREAK`; ciclo visible y activo conceptualmente | Siempre pertenece al conjunto permitido. |
| `remainingSeconds` | number entero | `1500` | Desde `0` hasta la duración del modo; segundos pendientes | Nunca negativo, finito ni fraccionario. |
| `timerIntervalId` | number u objeto del entorno, o null | `null` | Identificador del único intervalo; `null` cuando no existe | No hay más de uno; es no nulo solo si `isRunning`. |
| `completedPomodoros` | number entero | `0` | Total de eventos `COMPLETED_POMODORO` en la sesión | No negativo; solo aumenta de uno en uno. |
| `isRunning` | boolean | `false` | `true` equivale a `RUNNING`; `false`, a `PAUSED` | Coincide con la existencia del intervalo. |

Toda mutación de estado que afecte lo visible debe terminar en un renderizado sincronizado.

## 9. Estados válidos

Son válidas `WORK/RUNNING`, `WORK/PAUSED`, `SHORT_BREAK/RUNNING` y `SHORT_BREAK/PAUSED`. En `RUNNING`, `isRunning === true` y `timerIntervalId !== null`; en `PAUSED`, `isRunning === false` y `timerIntervalId === null`. Son inválidos un modo desconocido, tiempo fuera de rango, intervalo activo con `isRunning === false`, ausencia de intervalo con `isRunning === true` y más de un intervalo activo.

## 10. Estado inicial

Al abrir `index.html`: `currentMode = WORK`, `remainingSeconds = 25 * 60`, `completedPomodoros = 0`, `isRunning = false` y `timerIntervalId = null`. La interfaz muestra exactamente el modo `Work`, el tiempo `25:00` y `Pomodoros completados: 0`. El mensaje de notificación comienza vacío y el título es `25:00 - Work | Pomodoro`.

## 11. Contrato de renderizado del tiempo

El tiempo se presenta siempre como `MM:SS`, con dos dígitos por componente y redondeo entero ya garantizado por el estado. Ejemplos válidos: `25:00`, `05:00`, `04:09`, `00:01`, `00:00`. Nunca se renderiza un valor negativo como `-00:01`.

## 12. Contrato de Iniciar

**Precondición:** DOM inicializado y estado válido. Si está `PAUSED`, al activar **Iniciar** se conserva `remainingSeconds`, se crea exactamente un `setInterval` de 1000 ms, se asigna su identificador, se establece `isRunning = true` y se actualiza la interfaz. Si ya está `RUNNING`, la operación es idempotente: no cambia tiempo, estado ni intervalo. Pulsaciones repetidas o rápidas nunca aceleran el temporizador. Si excepcionalmente el tiempo es `00:00`, se procesa primero la finalización determinista del modo, sin crear un intervalo para ese modo agotado.

El mismo control muestra `Iniciar` cuando el ciclo aún no se ha ejecutado o acaba de reiniciarse/transicionar, y `Reanudar` tras una pausa con tiempo parcialmente consumido; ambos textos ejecutan este contrato.

## 13. Contrato de Pausar

Si está `RUNNING`, se llama a `clearInterval` sobre el identificador, se asigna `timerIntervalId = null`, se establece `isRunning = false`, se conserva `remainingSeconds` y se renderiza `PAUSED`. Si ya está `PAUSED`, la operación es idempotente. Pausar nunca cambia modo ni contador.

## 14. Contrato de Reiniciar

Reiniciar detiene y libera el intervalo, establece `isRunning = false`, mantiene `currentMode`, no incrementa el contador y asigna `25 * 60` en `WORK` o `5 * 60` en `SHORT_BREAK`. Después limpia el mensaje transitorio, actualiza interfaz y `document.title`. Funciona igual estando pausado o ejecutándose.

## 15. Contrato de tick

Solo un intervalo vigente puede producir un tick. Si `remainingSeconds > 0`, cada tick realiza exactamente `remainingSeconds = remainingSeconds - 1` y renderiza. Si el resultado es `0`, primero se renderiza `00:00` y en ese mismo tick se procesa una sola finalización. Nunca se decrementa desde cero ni se permite `remainingSeconds < 0`. Un callback obsoleto después de pausar o reiniciar no mutará el estado porque comprobará que el temporizador sigue ejecutándose.

## 16. Finalización de WORK

Al llegar `WORK` a `00:00`, en orden determinista: (1) detener el intervalo; (2) mostrar exactamente `00:00`; (3) incrementar `completedPomodoros` exactamente una vez; (4) actualizar el contador; (5) intentar sonido; (6) publicar notificación visual `Work completado. Es momento de un descanso corto.`; (7) cambiar a `SHORT_BREAK`; (8) asignar `5 * 60`; (9) renderizar `05:00`; (10) actualizar modo y controles; (11) actualizar título; y (12) dejar `SHORT_BREAK/PAUSED`. El mensaje conserva evidencia de la finalización aunque el tiempo ya represente el ciclo nuevo.

## 17. Finalización de SHORT_BREAK

Al llegar `SHORT_BREAK` a `00:00`, en orden determinista: (1) detener el intervalo; (2) mostrar `00:00`; (3) no cambiar el contador; (4) intentar sonido; (5) publicar `Short Break completado. Es momento de volver al trabajo.`; (6) cambiar a `WORK`; (7) asignar `25 * 60`; (8) renderizar `25:00`; (9) actualizar modo y controles; (10) actualizar título; y (11) dejar `WORK/PAUSED`.

## 18. Contrato del contador

Comienza en `0` e incrementa exclusivamente en `+1` por una finalización correcta de `WORK`. No cambia al finalizar `SHORT_BREAK`, iniciar, pausar, reanudar, reiniciar, pulsar varias veces ni cambiar visualmente de modo. Vive solo en memoria. Se prohíben `localStorage`, `sessionStorage` e `IndexedDB`; recargar reinicia el contador a cero.

## 19. Contrato de sonido

La notificación sonora se genera bajo demanda mediante Web Audio API (`AudioContext` o prefijo compatible), sin archivos externos. Consiste en un tono breve, no continuo. Toda creación, reanudación, conexión o reproducción estará aislada con manejo de errores. Un bloqueo, falta de API o excepción no detiene la transición, no altera el contador ni deja estado inconsistente.

## 20. Contrato de notificación visual

Existe una región visible persistente con `role="status"` y `aria-live="polite"`. Al finalizar diferencia inequívocamente `Work` de `Short Break` mediante los mensajes exactos definidos en las secciones 16 y 17. No depende solo del color y permanece legible hasta otra acción que la limpie o una nueva finalización.

## 21. Contrato de `document.title`

El formato exacto es `MM:SS - Work | Pomodoro` o `MM:SS - Short Break | Pomodoro`. Se actualiza con cada render relevante y permanece sincronizado con tiempo y modo visibles, incluidos estado inicial, ticks, reinicio y transición.

## 22. Contrato del DOM

El documento usa HTML5 semántico con `header`, `main`, una `section` o tarjeta principal, indicador de modo, temporizador, grupo de controles, contador y región de notificaciones. Los tres controles son elementos `<button type="button">`: Iniciar/Reanudar, Pausar y Reiniciar. Los identificadores usados por JavaScript son únicos. El script local se carga con `defer`; no hay contenido, fuentes ni recursos remotos.

## 23. Contrato CSS

La interfaz tendrá diseño limpio y académico, jerarquía clara, buen contraste, foco visible, diferenciación de modos mediante color y texto, objetivos táctiles de al menos 44 px, y ausencia de overflow horizontal innecesario. El estado de modo se expondrá en el DOM mediante un atributo/clase actualizable, sin reemplazar la etiqueta textual.

## 24. Accesibilidad

- Estructura semántica, encabezados ordenados, controles nativos y textos comprensibles.
- Operación completa mediante Tab, Shift+Tab, Enter y Espacio sin control personalizado.
- Temporizador con etiqueta accesible; región `aria-live="polite"` para finalizaciones.
- Contraste suficiente, `:focus-visible` claramente perceptible y estados no comunicados solo por color.
- `@media (prefers-reduced-motion: reduce)` elimina animaciones/transiciones no esenciales.
- `@media (forced-colors: active)` conserva bordes, foco y diferenciación mediante colores del sistema.
- El temporizador no usa `aria-live` para evitar anunciar cada segundo.

## 25. Responsive

- **320 px:** una columna, tarjeta dentro del viewport, controles apilados a ancho disponible, texto sin recorte y sin scroll horizontal.
- **768 px:** tarjeta centrada; controles pueden disponerse en fila con separación y objetivos de 44 px.
- **Escritorio:** ancho máximo legible, tarjeta centrada y espacio exterior proporcionado; no se estira indefinidamente.

## 26. Casos borde

| Caso | Resultado exacto |
|---|---|
| Iniciar repetidamente | Primer clic crea un intervalo; los demás no hacen nada. |
| Pausar repetidamente | Primer clic libera el intervalo; los demás no hacen nada. |
| Reiniciar detenido | Restaura la duración del modo, sigue pausado y contador intacto. |
| Reiniciar durante Work | Detiene, conserva `WORK`, muestra `25:00`, contador intacto. |
| Reiniciar durante Short Break | Detiene, conserva `SHORT_BREAK`, muestra `05:00`, contador intacto. |
| Finalizar Work | Una transición a descanso y exactamente un incremento. |
| Finalizar Short Break | Una transición a trabajo y ningún incremento. |
| Audio bloqueado | Continúan transición, contador, render y notificación visual. |
| Tiempo `00:00` | Se muestra antes de finalizar; nunca se decrementa por debajo. |
| Contador duplicado | Impedido al detener el intervalo antes de transicionar. |
| Recarga | Restaura estado inicial y contador cero. |
| Interacción rápida | Cada manejador preserva invariantes; no hay intervalos duplicados. |

## 27. Invariantes

- **INV-01:** `remainingSeconds >= 0` y es entero.
- **INV-02:** existe como máximo un `setInterval` activo.
- **INV-03:** `completedPomodoros >= 0` y es entero.
- **INV-04:** `SHORT_BREAK` nunca incrementa `completedPomodoros`.
- **INV-05:** `currentMode` siempre es `WORK` o `SHORT_BREAK`.
- **INV-06:** interfaz y estado permanecen sincronizados tras cada operación.
- **INV-07:** `document.title` refleja modo y tiempo visibles.
- **INV-08:** el contador incrementa máximo una vez por `WORK` terminado.
- **INV-09:** `isRunning` es equivalente a `timerIntervalId !== null`.

## 28. Criterios de aceptación

- **AC-01:** Al cargar se ven `Work`, `25:00`, `Pomodoros completados: 0` y el título inicial contractual.
- **AC-02:** Iniciar crea un único intervalo y reduce el tiempo exactamente una vez por segundo.
- **AC-03:** Pulsar Iniciar repetidamente no crea intervalos adicionales ni acelera el tiempo.
- **AC-04:** Pausar durante ejecución detiene los ticks, conserva el tiempo y libera el intervalo.
- **AC-05:** Pausar repetidamente no cambia modo, tiempo ni contador.
- **AC-06:** Reanudar conserva el tiempo pausado y vuelve a reducirlo una vez por segundo.
- **AC-07:** Reiniciar `WORK`, pausado o en ejecución, muestra `25:00`, queda pausado y no cambia contador.
- **AC-08:** Reiniciar `SHORT_BREAK`, pausado o en ejecución, muestra `05:00`, queda pausado y no cambia contador.
- **AC-09:** El tiempo siempre usa `MM:SS`, incluidos los ejemplos contractuales, y nunca es negativo.
- **AC-10:** Finalizar `WORK` muestra primero `00:00`, incrementa una sola vez y prepara `SHORT_BREAK` en `05:00` pausado.
- **AC-11:** Finalizar `SHORT_BREAK` muestra primero `00:00`, no incrementa y prepara `WORK` en `25:00` pausado.
- **AC-12:** El contador solo aumenta en uno por cada `WORK` finalizado y no por otros eventos.
- **AC-13:** Una recarga restaura contador cero y no existe API de persistencia en el código.
- **AC-14:** Cada finalización intenta un sonido con Web Audio API sin archivos de audio.
- **AC-15:** Si Web Audio no existe, está bloqueada o lanza error, la transición y el contador siguen siendo correctos.
- **AC-16:** La región visible `role="status"`/`aria-live="polite"` publica el mensaje exacto y diferenciado de cada finalización.
- **AC-17:** `document.title` adopta el formato contractual y coincide siempre con modo y tiempo visibles.
- **AC-18:** El DOM contiene todos los elementos semánticos contractuales y controles `<button>` nativos.
- **AC-19:** Todos los controles funcionan con teclado nativo y muestran foco visible.
- **AC-20:** La presentación diferencia modos sin depender solo del color y mantiene contraste legible.
- **AC-21:** A 320 px no existe overflow horizontal, los controles se apilan y miden al menos 44 px de alto.
- **AC-22:** A 768 px y escritorio la tarjeta está centrada, los controles son utilizables y el ancho es legible.
- **AC-23:** Las reglas `prefers-reduced-motion` y `forced-colors` preservan una experiencia accesible.
- **AC-24:** Una secuencia rápida Iniciar/Pausar/Reiniciar conserva máximo un intervalo y estado/interfaz sincronizados.
- **AC-25:** Solo existen tecnologías permitidas, archivos locales contractuales y ninguna dependencia, build o recurso remoto.
- **AC-26:** El repositorio evidencia que el commit de `spec.md` precede al primer commit con código ejecutable.

## 29. Matriz de trazabilidad

| Requisito | Criterio de aceptación | Archivo previsto | Prueba prevista |
|---|---|---|---|
| Estado y vista inicial | AC-01 | `index.html`, `script.js` | Inspección DOM y carga limpia. |
| Inicio y exclusión de intervalos | AC-02, AC-03 | `script.js` | Reloj controlado y clics repetidos. |
| Pausa y reanudación | AC-04–AC-06 | `script.js` | Secuencia de controles y observación de ticks. |
| Reinicio por modo | AC-07, AC-08 | `script.js` | Reinicio pausado y ejecutándose en ambos modos. |
| Formato y límites de tiempo | AC-09 | `script.js` | Casos de formato y simulación de cero. |
| Finalización y ciclos | AC-10, AC-11 | `script.js` | Simulación determinista de ambos finales. |
| Contador y memoria | AC-12, AC-13 | `script.js` | Eventos, búsqueda de APIs y recarga. |
| Sonido seguro | AC-14, AC-15 | `script.js` | Stub exitoso, ausente y con excepción. |
| Notificación visual | AC-16 | `index.html`, `script.js` | Inspección ARIA y finales simulados. |
| Título dinámico | AC-17 | `script.js` | Comparación título/DOM en operaciones. |
| DOM semántico | AC-18 | `index.html` | Inspección estática. |
| Teclado y foco | AC-19 | `index.html`, `style.css` | Tab/Enter/Espacio e inspección CSS. |
| Contraste y modos | AC-20 | `index.html`, `style.css` | Inspección visual y de estilos. |
| Responsive | AC-21, AC-22 | `style.css` | Viewports 320, 768 y escritorio. |
| Preferencias accesibles | AC-23 | `style.css` | Emulación de media queries. |
| Interacción rápida/invariantes | AC-24 | `script.js` | Secuencias automatizadas con reloj controlado. |
| Restricciones técnicas | AC-25 | Todos | Búsqueda estática y listado de archivos. |
| Orden SDD | AC-26 | Historial Git | `git log --reverse --name-only`. |

## 30. Estrategia de implementación

1. Crear HTML semántico.
2. Aplicar CSS base.
3. Construir modelo de estado.
4. Implementar temporizador y renderizado.
5. Conectar controles.
6. Implementar ciclos deterministas.
7. Incorporar contador.
8. Añadir notificaciones seguras.
9. Sincronizar título.
10. Auditar accesibilidad.
11. Validar responsive.
12. Completar README.
13. Ejecutar validación final de AC, invariantes, pruebas e historial.

## 31. Estrategia Git

Tras el README inicial preexistente: (1) commit y push exclusivo de `spec.md`; (2) commit/push de HTML; (3) CSS; (4) temporizador y controles; (5) ciclos y contador; (6) notificaciones; (7) accesibilidad/responsive; (8) README final; y (9) solo si hay incumplimientos reales, corrección final. Antes de cada commit se revisan estado y staging; después se hace push. Se prohíben reset destructivo, rebase, amend, force-push y reescritura del historial.

## 32. Definition of Done

El proyecto está terminado únicamente cuando los 26 AC están `PASS`, se respetan todos los invariantes, las pruebas técnicas y manuales aplicables pasan, Git está limpio, `HEAD` coincide con `origin/main`, no existen tecnologías prohibidas, las constantes tienen valores contractuales, y el historial demuestra que `spec.md` fue comprometido y enviado antes del primer commit de código ejecutable.
