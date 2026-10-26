# Analítica

Espacio para desarrollar y documentar los seis KPI, las vistas SQL acordadas y el
trabajo de Power BI. La estructura inicial no incluye indicadores, consultas,
vistas ni conexiones implementadas.

Power BI utilizará una cuenta separada con permisos de solo lectura sobre
PostgreSQL, preferentemente mediante vistas. Sus permisos y credenciales quedan
pendientes; no reutilizar la cuenta de desarrollo.

No subir archivos con datos personales o credenciales. Coordinar con el equipo
cómo compartir y versionar los archivos de Power BI, revisando su contenido
antes de incorporarlos al repositorio.

## Referencia visual de los seis KPI

Los mockups `/indicadores` (KPI 1 y 3) y
`/indicadores?vista=seguimiento` (KPI 2, 4, 5 y 6) muestran la propuesta de
presentación. `/dashboard` ofrece un resumen para la gestión diaria.
Solo contienen datos ficticios fijos: no sustituyen la implementación de los
indicadores ni el informe comprometido en Power BI. Las definiciones de
períodos, fuentes y cálculos se deben acordar antes de conectarlos.

La referencia de capturas y las cifras del escenario se documentan en el README
principal. Mantener las mismas definiciones para la API y las futuras vistas de
lectura de Power BI; excluir anulados y utilizar días corridos. Para los
indicadores mensuales del mockup se consideran los reclamos cerrados durante el
mes; para los diarios, los activos a la fecha de corte.
