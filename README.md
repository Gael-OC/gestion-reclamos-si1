# gestion-reclamos-si1

## Descripción académica y ficticia

Proyecto universitario de Sistemas de Información — Universidad Católica del
Norte, 2026. Prototipo ficticio de gestión y seguimiento de reclamos, tomando
como caso de estudio a SERNAC Coquimbo.

**No es una plataforma oficial ni existe relación institucional con SERNAC.**

## Tecnologías utilizadas

- Frontend: React, TypeScript, Vite, Tailwind CSS y React Router.
- Backend: Python, FastAPI, Pydantic, SQLAlchemy y Alembic.
- Base de datos: PostgreSQL 18 mediante Docker Compose local.
- Analítica futura: Power BI con acceso de solo lectura.

Las dependencias están fijadas en `frontend/package-lock.json` y
`backend/requirements.txt`. La arquitectura se explica en
[docs/architecture.md](docs/architecture.md).

## Estructura general del repositorio

```text
frontend/    Aplicación React, rutas provisionales, estilos y componentes
backend/     API mínima, configuración de datos y preparación de Alembic
analytics/   Documentación futura de KPI y Power BI
docs/        Arquitectura y acuerdos de trabajo del grupo
.github/     Plantilla de pull requests
AGENTS.md    Instrucciones de apoyo para asistentes de programación
compose.yaml PostgreSQL para desarrollo local
```

## Requisitos para ejecutarlo

- Git.
- Node.js 24 LTS y npm. Si usas nvm, ejecuta `nvm use` en la raíz.
- Python 3.12, 3.13 o 3.14 con pip y soporte para entornos virtuales.
- Docker con Docker Compose para usar PostgreSQL. El motor de Docker debe estar iniciado.

No se necesita Power BI para ejecutar esta base. Frontend y `/health` funcionan
sin iniciar PostgreSQL.

## Instalación y ejecución local

### 1. Clonar y preparar el entorno

```bash
git clone https://github.com/Gael-OC/gestion-reclamos-si1.git
cd gestion-reclamos-si1
cp .env.example .env
cp backend/.env.example backend/.env
```

En PowerShell, reemplaza `cp` por `Copy-Item`. Los valores son ficticios y solo
sirven para desarrollo local. Los archivos `.env` no se suben a Git.
Si cambias usuario, contraseña, base o puerto en `.env`, actualiza también
`DATABASE_URL` en `backend/.env`. Usa una contraseña apta para una URL o codifica
sus caracteres especiales.

### 2. PostgreSQL — desde la raíz, cuando se necesite

```bash
docker compose config --quiet
docker compose up -d --wait
docker compose ps
```

La base queda en `127.0.0.1:5432` y sus datos persisten en un volumen local.
Compose prepara PostgreSQL; las tablas se incorporan mediante las migraciones
del proyecto. La estructura inicial aún no incluye tablas de negocio.
Si el puerto está ocupado, cambia `POSTGRES_PORT` y `DATABASE_URL`.
Las variables `POSTGRES_*` se aplican al crear un volumen vacío; cambiarlas
después no cambia usuarios ni contraseñas existentes.

Para detener PostgreSQL conservando los datos:

```bash
docker compose down
```

### 3. Frontend — en una terminal

```bash
cd frontend
npm ci
npm run dev
```

Abre [http://127.0.0.1:5173](http://127.0.0.1:5173). La raíz redirige a `/login`.
Estas rutas solo muestran un título y un aviso de diseño pendiente:

| Ruta                   | Vista prevista                            |
| ---------------------- | ----------------------------------------- |
| `/login`               | Inicio de sesión                          |
| `/dashboard`           | Panel principal                           |
| `/reclamos`            | Listado de reclamos                       |
| `/reclamos/nuevo`      | Registro de reclamo                       |
| `/reclamos/:reclamoId` | Detalle; por ejemplo, `/reclamos/ejemplo` |
| `/asignaciones`        | Asignaciones                              |

No hay formularios, autenticación ni llamadas a la API. Los estilos son
provisionales para que Gael y Marianela puedan comenzar los mockups.
Las variables `VITE_*` son públicas: nunca guardar secretos en el frontend.

### 4. Backend — en otra terminal, desde la raíz

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

En Windows usa `py -3 -m venv .venv` y activa el entorno con
`.venv\Scripts\Activate.ps1` en PowerShell. Comprueba que tu Python esté en el
rango indicado antes de crear el entorno.

Comprueba [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health): debe
responder `{"status":"ok"}`. La documentación automática está en
[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).
`/health` comprueba el servidor, sin consultar la base de datos.

### 5. Verificaciones locales

Desde `frontend/`:

```bash
npm run check
npm run build
```

`check` verifica TypeScript, ESLint y el formato. Para aplicar formato:
`npm run format`. Para revisar la compilación local: `npm run preview`.

Desde `backend/`, con el entorno virtual activo:

```bash
python -m ruff check .
python -m ruff format --check .
python -m unittest discover -s tests -v
python -m alembic heads
```

`heads` lista las revisiones disponibles; la estructura inicial aún no incluye
ninguna. Al cambiar el modelo de datos, agregar y revisar las migraciones
correspondientes. Para aplicar las revisiones disponibles, con PostgreSQL
iniciado y desde `backend/`:

```bash
python -m alembic upgrade head
```

## Cómo trabajar con ramas

Trabajamos con una rama por tarea y pull requests hacia `main`. `main` debe
mantenerse funcionando para que todos puedan partir de la misma base y mostrar
los avances del proyecto.

Usar nombres cortos, en minúsculas, sin espacios ni tildes y separados por guiones:

| Prefijo  | Para qué se usa                       | Ejemplo                    |
| -------- | ------------------------------------- | -------------------------- |
| `feat/`  | Agregar una funcionalidad o una vista | `feat/mockup-login`        |
| `fix/`   | Corregir un error                     | `fix/ruta-detalle-reclamo` |
| `docs/`  | Cambiar documentación                 | `docs/guia-instalacion`    |
| `chore/` | Ajustar configuración o dependencias  | `chore/estructura-inicial` |

Para comenzar una tarea, desde la raíz y con el trabajo anterior guardado en su rama:

```bash
git switch main
git pull --ff-only
git switch -c feat/mockup-login
```

Cada integrante crea ramas para sus tareas. Por ejemplo, Gael puede trabajar en
`feat/mockup-login` y Marianela en `feat/mockup-listado-reclamos`. Acordar antes
qué archivos compartidos necesita modificar cada uno.

Al terminar, ejecutar las verificaciones correspondientes, revisar los cambios,
hacer commit en esa rama y subirla. Para el ejemplo anterior:

```bash
git push -u origin feat/mockup-login
```

En GitHub, abrir un pull request desde esa rama hacia `main`, completar la
plantilla y pedir revisión a otro integrante. Fusionar cuando esté revisado y
las verificaciones pasen; después eliminar la rama desde GitHub.

Mantener las tareas pequeñas e integrarlas con frecuencia ayuda a reducir
conflictos. Las reglas y los pasos para actualizar una rama están en
[docs/conventions.md](docs/conventions.md). Este flujo se basa en
[GitHub flow](https://docs.github.com/es/get-started/using-github/github-flow).

## Estado actual del desarrollo

El repositorio parte de una estructura inicial: seis vistas provisionales, `/health`,
configuración de PostgreSQL y Alembic, verificaciones y documentación.

El desarrollo del proyecto contempla la gestión de usuarios y roles, registro y seguimiento de
reclamos, asignaciones, gestiones, estados, control de plazos y seis KPI en
Power BI. Estas funcionalidades están pendientes de implementación sobre esta base.
Actualizar esta sección a medida que el equipo avance.

El equipo debe confirmar los contratos API, modelo de datos, roles, reglas de
plazos, definición de KPI, identidad visual y reparto de módulos. Estas
propuestas están en [docs/architecture.md](docs/architecture.md).
