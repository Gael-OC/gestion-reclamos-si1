# Instrucciones para asistentes de programación

La documentación principal para los integrantes es `README.md`,
`docs/architecture.md` y `docs/conventions.md`. Este archivo ayuda a los
asistentes a respetar los mismos acuerdos; no reemplaza la documentación del grupo.

Prototipo académico ficticio de Sistemas de Información, UCN 2026. No es una
plataforma oficial ni tiene relación institucional con SERNAC.

- El frontend presenta información y maneja la interacción; nunca accede directamente a PostgreSQL.
- Toda comunicación del frontend con el backend pasa por la API REST.
- Las reglas de negocio pertenecen al backend; el acceso a datos se concentra en repositorios.
- Los componentes compartidos deben ser reutilizables. Lo específico de una función va en `features/`.
- Coordinar cualquier cambio de contrato API entre frontend y backend antes de integrarlo.
- Documentar cambios importantes de arquitectura en `docs/architecture.md`, distinguiendo propuestas de acuerdos.
- Agregar dependencias solo cuando sean necesarias y actualizar sus archivos de versiones.
- Acordar el alcance de cada tarea; no modificar áreas de otros integrantes sin coordinación.
- No presentar información ficticia como información institucional real ni subir datos personales o secretos.
- Revisar el estado de Git antes de editar y preservar el trabajo existente.
- Usar una rama por tarea con los prefijos `feat/`, `fix/`, `docs/` o `chore/`, según `docs/conventions.md`. Integrar mediante pull requests revisados por otro integrante; `main` debe permanecer estable.
- No hacer commits, push ni cambios en servicios externos sin una instrucción explícita.

Implementar las tareas acordadas con el equipo y mantener actualizada la
documentación cuando cambien la estructura, los contratos o los pasos de ejecución.
Validaciones y comandos de ejecución: `README.md`. Detalles de colaboración:
`docs/conventions.md`.
