# Convenciones de colaboración del equipo

Guía de trabajo para los cinco integrantes. Para instalar y ejecutar el proyecto,
seguir el README; para entender sus partes y las decisiones pendientes, consultar
`architecture.md`.

## Límites de cada área

- Frontend: presentación e interacción. Accede al backend únicamente por la API;
  nunca directamente a PostgreSQL. Las reglas de negocio se resuelven en el backend.
- Páginas en `frontend/src/pages/`; módulos por función en `features/`;
  componentes reutilizables en `components/ui/` o `components/layout/`.
  Rutas centralizadas en `app/router.tsx`, estilos y tokens en `styles/global.css`.
  Importaciones del frontend con el alias `@/` cuando faciliten la lectura.
- Backend: routers en `api/v1/`, contratos Pydantic en `schemas/`, reglas en
  `services/`, acceso a datos en `repositories/`, modelos en `models/` y
  configuración en `core/` y `db/`.
- No duplicar lógica ni agregar dependencias sin una necesidad concreta.
- Nunca presentar datos ficticios como información oficial de SERNAC.

## Acuerdos antes de integrar

- Coordinar cambios de contrato API entre ambos equipos: ruta, método, campos,
  respuesta y errores. Documentar el acuerdo en el pull request; no inventar contratos unilateralmente.
- Registrar decisiones importantes en `docs/architecture.md`; marcar las que
  aún no hayan sido aprobadas como propuestas.
- Acordar tareas y archivos antes de comenzar. No modificar el área de otro
  integrante sin coordinarlo. Mantener pequeños los pull requests.
- Coordinar especialmente `router.tsx`, estilos globales, dependencias,
  configuración y migraciones, porque son archivos compartidos.
- Antes de crear una migración: acordar el modelo e importar sus clases para que
  Alembic conozca la metadata. Revisar el SQL y la revisión generada en el PR.
  Incluir las migraciones correspondientes junto con los cambios del modelo de datos.

## Git y verificación

Flujo habitual: acordar una tarea → crear una rama → trabajar en el área acordada
→ verificar los cambios → abrir un pull request → solicitar revisión → integrar.

- `main` debe mantenerse funcionando y recibir los cambios mediante pull requests.
- Crear una rama por tarea pequeña desde `main` actualizado. Usar
  `feat/descripcion` para funcionalidades o vistas, `fix/descripcion` para errores,
  `docs/descripcion` para documentación y `chore/descripcion` para configuración
  o dependencias. Nombres en minúsculas, sin espacios ni tildes y con guiones.
- Pedir revisión a otro integrante y completar las verificaciones aplicables
  antes de fusionar. Después de integrar, eliminar la rama desde GitHub y crear
  otra desde `main` actualizado para la siguiente tarea.
- Se recomienda proteger `main` en GitHub exigiendo pull request y una aprobación.
  Esta configuración queda pendiente de realizar manualmente por el equipo.
- Ejecutar las verificaciones del README antes de pedir revisión. No incluir
  dependencias instaladas, compilaciones, archivos `.env`, secretos ni datos personales.
- React: componentes en PascalCase y hooks con prefijo `use`. Python: módulos y
  funciones en `snake_case`. Usar Prettier en frontend y Ruff en Python.
- Al cambiar dependencias, actualizar `package.json` y `package-lock.json` juntos.
  En Python, editar `requirements.in` y regenerar `requirements.txt` con
  `uv pip compile --universal --python-version 3.12 requirements.in -o requirements.txt`
  desde `backend/`. `uv` solo es necesario para regenerar ese archivo; para instalar
  y ejecutar se usa Python con pip.

Si otros integrantes integraron cambios en `main` mientras trabajabas, guarda
primero tus cambios con un commit en tu rama y actualízala desde esa misma rama:

```bash
git fetch origin
git merge origin/main
```

Resolver los conflictos coordinándose con quien modificó esos archivos, volver
a ejecutar las verificaciones y subir la rama actualizada con `git push`.
Los ejemplos para crear y subir una rama están en el README.
