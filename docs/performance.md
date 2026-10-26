# Validación de rendimiento del frontend

Auditoría local del 26 de octubre de 2026 sobre el prototipo académico ficticio.
El objetivo es evitar trabajo gráfico continuo cuando la página está en reposo,
conservando la propuesta visual de vidrio estático.

## Método y límites

Se compararon las compilaciones de producción antes y después en el mismo
navegador integrado, con viewport de 1280 × 720 px y la pestaña visible. Se
esperaron siete segundos tras cargar `/dashboard` y se tomaron tres muestras
consecutivas de 15 segundos, sin interacción ni cambios de tamaño.

Una sonda temporal, insertada únicamente en la compilación local antes de
cargar React, contó las ejecuciones de callbacks de `requestAnimationFrame`
y sumó el tiempo de pared empleado dentro de ellos con `performance.now()`.
También leyó `performance.memory.usedJSHeapSize` cuando estaba disponible.
La sonda añade tres intervalos de muestreo y un resultado DOM oculto; no forma
parte del código fuente ni de la compilación final.

El tiempo de callbacks **no representa el porcentaje total de CPU**, ni incluye
el trabajo asíncrono de GPU o todos los repintados. El heap de JavaScript no es
la memoria total de la pestaña ni la memoria gráfica. El navegador conectado
no expone un perfilador completo de CPU/GPU o repintados. Estas mediciones no
permiten afirmar un porcentaje de ahorro de batería ni diagnosticar una fuga.

## Comprobación reproducible

Desde `frontend/`, usando Node.js 24:

```bash
npm ci
npm run check
npm run build
npm run preview
```

Para repetir con un perfilador completo, abrir `/dashboard` en DevTools,
esperar a que termine de cargar y grabar tres muestras de 15 segundos sin
interacción. Repetir con la misma ventana, navegador, equipo y configuración
para la versión de referencia y la optimizada. Comparar Scripting, Rendering,
Painting y heap; separar las medidas con caché fría de las medidas en reposo.

Comprobar que no hay canvas, filtros SVG ni animaciones infinitas, incluidos
pseudoelementos. Deben quedar seis superficies con `backdrop-filter: blur(12px)`
en el dashboard: navegación, barra superior y cuatro paneles. Botones, buscador
y etiquetas no deben desenfocar el fondo.

Validar selección de filas con Enter y Espacio, cambio de alcance, selección
de barras con ratón y teclado, navegación y carga directa de rutas. Revisar
1280 × 720, 1100 × 700 y 390 × 844 px, incluyendo desplazamiento de la tabla,
y repetir con `prefers-reduced-motion: reduce` en la emulación de DevTools.

## Resultados locales

Los tamaños corresponden a la salida de Vite, no a una medición de transferencia
HTTP. La suma de JavaScript incluye el bloque diferido que se solicita al montar.

| Medida                                                |       Antes |           Después |
| ----------------------------------------------------- | ----------: | ----------------: |
| JavaScript minificado total                           | 1.417,37 kB |         421,38 kB |
| JavaScript total con gzip                             |   406,05 kB |         134,99 kB |
| CSS minificado                                        |    43,38 kB |          39,77 kB |
| Canvas WebGL en dashboard                             |           1 |                 0 |
| Elementos con backdrop-filter                         |          23 | 6, todos de 12 px |
| Animaciones CSS infinitas, incluyendo pseudoelementos |          12 |                 0 |
| Filtros SVG                                           |           1 |                 0 |

Reducción aproximada de JavaScript: 70 % minificado y 67 % con gzip.
Las decoraciones se mantienen en CSS y los datos ficticios no cambian.

| Muestra de aproximadamente 15 s | Callbacks antes | Tiempo antes | Callbacks después | Tiempo después |
| ------------------------------- | --------------: | -----------: | ----------------: | -------------: |
| 1                               |             896 |     194.3 ms |                 0 |         0.0 ms |
| 2                               |             900 |     295.8 ms |                 0 |         0.0 ms |
| 3                               |             901 |     520.1 ms |                 0 |         0.0 ms |

El heap de JavaScript al final de las tres muestras originales fue de 20,17,
19,95 y 19,86 MB; en la versión optimizada, 6,67, 6,68 y 6,68 MB. Son lecturas
aproximadas expuestas por el navegador, afectadas por el recolector de basura,
el calentamiento y la sonda. No representan memoria total ni garantizan una
reducción idéntica en otros equipos.

`npm run check`, `npm run build`, revisión de dependencias y `git diff --check`
completaron sin errores. El bloque diferido `BackdropScene` desapareció del
build. Las cifras se muestran desde el primer render y la navegación conserva
el fondo estático también en las vistas pendientes.

Se verificaron Enter y Espacio en filas, alcance con teclado, barras con teclado
y ratón, navegación y carga directa de login, reclamos, registro, detalle,
asignaciones, indicadores, configuración y una ruta inexistente. No se detectó
canvas en esas rutas. En 1100 × 700 px no hay scroll general; en 390 × 844 px
la página no desborda horizontalmente y la tabla conserva su scroll interno.
Se inspeccionaron visualmente escritorio y móvil.

La preferencia de movimiento reducido se conserva mediante la regla CSS global,
variantes `motion-safe` y `useReducedMotion` en las dos transiciones Motion que
quedan. Se comprobó además en Chrome nativo con DevTools → Rendering →
`prefers-reduced-motion: reduce`: el panel mantiene sus datos visibles y el
control de alcance sigue seleccionando correctamente. Se restauró la emulación
al terminar. No se obtuvo una traza completa de repintados o GPU.
