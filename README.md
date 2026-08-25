# Pomodoro - Spec Driven Development

## Descripción

Aplicación web Pomodoro que alterna sesiones Work de 25 minutos y Short Break de 5 minutos. Funciona directamente en un navegador moderno, sin instalación, servidor, dependencias ni proceso de compilación.

## Objetivo académico

El proyecto constituye el tercer experimento de Ingeniería Web y demuestra un desarrollo guiado por una especificación formal antes del primer código ejecutable.

## Metodología SDD

Se utilizó Spec Driven Development (SDD). [`spec.md`](spec.md) es la fuente única de verdad: define alcance, restricciones, estado, eventos, invariantes, casos borde, criterios de aceptación, trazabilidad y Definition of Done. La implementación deriva de esos contratos y no incorpora funciones fuera del alcance especificado.

## Tecnologías

- HTML5.
- CSS3.
- JavaScript Vanilla.
- Web Audio API nativa para el aviso sonoro.

## Restricciones

No se emplean frameworks, librerías, paquetes npm, preprocesadores, empaquetadores, recursos externos, persistencia ni proceso de build. No existen `package.json` ni `node_modules`.

## Funcionalidades

- Work de 25 minutos y Short Break de 5 minutos.
- Iniciar, Pausar, Reanudar y Reiniciar.
- Cambio automático de modo con el nuevo ciclo pausado.
- Contador de Pomodoros completados durante la sesión.
- Notificación visual accesible y tono generado por Web Audio API.
- Título de pestaña sincronizado con modo y tiempo.
- Interfaz responsive, semántica y operable mediante teclado.
- Reinicio completo del estado al recargar, sin persistencia.

## Arquitectura

La aplicación mantiene un modelo de estado único en memoria. Los manejadores de controles mutan ese estado de manera determinista; una función de renderizado sincroniza DOM, atributos accesibles y `document.title`. Un único intervalo produce ticks, y la finalización detiene el intervalo antes de actualizar contador, notificar y preparar el modo siguiente.

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `spec.md` | Contrato formal y fuente única de verdad. |
| `index.html` | Estructura semántica y contenido inicial. |
| `style.css` | Diseño, modos, responsive y accesibilidad visual. |
| `script.js` | Estado, temporizador, controles, ciclos y notificaciones. |
| `README.md` | Documentación, evidencia metodológica y guía de uso. |

## Cómo ejecutar

1. Descarga o clona el repositorio.
2. Abre `index.html` directamente en un navegador moderno.

No se requiere instalar ni ejecutar ningún comando.

## Especificación

`spec.md` funciona como contrato de implementación. Ante cualquier diferencia entre documentación secundaria y especificación, manda `spec.md`. Sus constantes contractuales son 1500 segundos para Work y 300 segundos para Short Break.

## Criterios de aceptación

La especificación define 26 criterios (`AC-01` a `AC-26`) que cubren estado inicial, formato del tiempo, controles idempotentes, transiciones, contador, ausencia de persistencia, sonido seguro, notificación visual, título, semántica, teclado, contraste, responsive, preferencias accesibles, interacción rápida, restricciones técnicas y evidencia SDD.

## Matriz de trazabilidad

La sección 29 de `spec.md` conecta cada requisito con su criterio, archivo de implementación y prueba prevista:

```text
Requisito
    ↓
Criterio de aceptación (AC)
    ↓
Implementación
    ↓
Prueba y evidencia
```

## Pruebas

La validación incluye comprobación sintáctica de JavaScript, inspección estática del DOM y CSS, pruebas del estado inicial y controles, reloj controlado para ambos finales de ciclo, protección contra intervalos duplicados y tiempo negativo, contador único, fallos simulados de Web Audio, sincronización del título, región ARIA, viewports de 320 px/768 px/escritorio, ausencia de persistencia/dependencias y auditoría del historial Git.

## Evidencia SDD

La secuencia histórica conservada es:

```text
README inicial preexistente
    ↓
spec.md
    ↓
commit y push exclusivo de spec.md
    ↓
primer código ejecutable y commits incrementales posteriores
```

El README inicial ya existía, pero contenía solo su encabezado y ningún código ejecutable. `spec.md` fue comprometido y enviado a GitHub antes del primer commit de código ejecutable. El historial no fue reescrito.

## Bitácora de prompts

### Prompt 1 - Especificación e implementación mediante SDD

Un único prompt maestro solicitó:

- elaborar `spec.md`;
- auditarlo;
- committearlo y enviarlo antes del código;
- implementar desde la especificación;
- validar criterios;
- crear commits incrementales;
- probar;
- documentar.
