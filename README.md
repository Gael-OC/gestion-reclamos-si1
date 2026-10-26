# gestion-reclamos-si1

## Descripción académica y ficticia

Proyecto universitario de Sistemas de Información — Universidad Católica del
Norte, 2026. Prototipo ficticio de gestión y seguimiento de reclamos, tomando
como caso de estudio a SERNAC Coquimbo.

**No es una plataforma oficial ni existe relación institucional con SERNAC.**

## Tecnologías utilizadas

- Frontend: React, TypeScript, Vite, Tailwind CSS y React Router; Motion para las transiciones de selección y Lucide para los íconos de la propuesta de sistema de diseño.
- Backend: Python, FastAPI, Pydantic, SQLAlchemy y Alembic.
- Base de datos: PostgreSQL 18 mediante Docker Compose local.
- Analítica futura: Power BI con acceso de solo lectura.

Las dependencias están fijadas en `frontend/package-lock.json` y
`backend/requirements.txt`. La arquitectura se explica en
[docs/architecture.md](docs/architecture.md).

## Estructura general del repositorio

```text
frontend/    Aplicación React, rutas provisionales, estilos y componentes
backend/     API REST (login, reclamos, asignaciones, seguimiento y plazos), Alembic
analytics/   Documentación futura de KPI y Power BI
docs/        Arquitectura, contrato de la API (docs/api/) y acuerdos del grupo
.github/     Plantilla de pull requests
AGENTS.md    Instrucciones de apoyo para asistentes de programación
compose.yaml PostgreSQL para desarrollo local
```

## Requisitos para ejecutarlo

- Git.
- Node.js 24 LTS y npm. Si usas nvm, ejecuta `nvm use` en la raíz.
- Python 3.12, 3.13 o 3.14 con pip y soporte para entornos virtuales.
- Docker con Docker Compose para usar PostgreSQL. El motor de Docker debe estar iniciado.

No se necesita Power BI para ejecutar esta base. Frontend y backend funcionan
sin iniciar PostgreSQL: por ahora la API guarda los datos en memoria.

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

Abre [http://127.0.0.1:5173](http://127.0.0.1:5173). La raíz abre el panel
(`/dashboard`), diseñado para escritorio: en pantallas de 1100 × 700 px o más
cabe completo en la ventana, sin desplazamiento general (en 1100 × 700 px la
tercera fila de la tabla de atención queda tras un desplazamiento interno).
La tipografía parte de 13 px para el contenido y crece un 10 %, 20 % o 50 % en
pantallas desde 1500, 1800 y 2400 px de ancho. La tabla de atención
puede desplazarse horizontalmente si el ancho disponible no alcanza para todas
sus columnas. Indicadores también cuenta con dos vistas de mockup para los seis
KPI. Las demás rutas muestran un título y un aviso de diseño pendiente:

Si el puerto 5173 está ocupado, inicia Vite en otro puerto, por ejemplo:

```bash
npm run dev -- --port 5174
```

Abre entonces [http://127.0.0.1:5174](http://127.0.0.1:5174).

| Ruta                             | Vista prevista                                       |
| -------------------------------- | ---------------------------------------------------- |
| `/login`                         | Inicio de sesión                                     |
| `/dashboard`                     | Panel principal (con datos de prueba)                |
| `/reclamos`                      | Listado de reclamos                                  |
| `/reclamos/nuevo`                | Registro de reclamo                                  |
| `/reclamos/:reclamoId`           | Detalle; por ejemplo, `/reclamos/ejemplo`            |
| `/asignaciones`                  | Asignaciones                                         |
| `/indicadores`                   | KPI de plazos y resolución (datos de prueba)         |
| `/indicadores?vista=seguimiento` | KPI de pendientes, carga y alertas (datos de prueba) |
| `/configuracion`                 | Configuración                                        |

### Capturas de los mockups para la presentación

Las tres composiciones conservan el diseño de islas de vidrio y usan un escenario
fijo de datos ficticios. Para las capturas, abrir estas direcciones en una ventana
de 1280 × 720 px o mayor (también se adaptan a pantallas pequeñas):

- `/dashboard`: resumen operativo de los seis KPI, distribución agrupada de
  pendientes, carga por funcionario y muestra de alertas; los tiles de KPI 4 y
  KPI 6 filtran la muestra.
- `/indicadores`: KPI 1 y 3, tendencias de mayo a septiembre de 2026, base de
  cierres y cierres por mes. El período seleccionado es septiembre de 2026.
- `/indicadores?vista=seguimiento`: KPI 2, 4, 5 y 6, con los cinco estados
  activos, carga por responsable y muestras de casos. La fecha de corte es el
  26 de octubre de 2026.

Los 342 activos incluyen 294 asignados y 48 sin asignar. Los 28 próximos a vencer
(0–3 días, incluido hoy) y 19 vencidos son subconjuntos de esos activos. Los
listados son extractos identificados como muestras, no todos los casos contados.
El mes tiene 200 cierres: 174 en plazo (87 %) y 26 fuera de plazo; 3.280 días
acumulados de resolución dan un promedio de 16,4 días. Se excluyen anulados.
Estos valores describen el prototipo y no el desempeño real de SERNAC.

La vista Indicadores es una propuesta visual para la futura presentación en
Power BI; todavía no existe un informe conectado o incrustado. Las reglas y los
contratos reales se acordarán con backend y analítica; estas pantallas solo
presentan respuestas de ejemplo y filtran sus muestras locales.

No hay formularios, autenticación ni llamadas a la API. Los tokens de la
propuesta de sistema de diseño están en `src/styles/global.css` y los componentes
compartidos iniciales son `Glass` (`components/ui/`) y `Backdrop`
(`components/layout/`); la propuesta aún debe confirmarla el equipo.
El fondo usa formas estáticas en CSS, sin WebGL. Los paneles principales tienen
desenfoque de 12 px; controles y etiquetas usan fondos translúcidos sin desenfoque.
Cifras y gráficos se muestran completos al cargar. Solo las interacciones tienen
transiciones breves, respetando la preferencia de movimiento reducido.
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

La API usa por defecto almacenamiento en memoria (`ALMACENAMIENTO=memoria`) con
usuarios y reclamos ficticios que se recrean en cada inicio. Para probarla en
`/docs`: ejecutar `POST /api/v1/auth/login` con
`{"correo": "supervisor@reclamos.test", "contrasena": "demo1234"}`, copiar el
`access_token` y pegarlo en **Authorize**. Los demás usuarios de demostración,
los endpoints, el flujo de estados y las reglas de plazo están en
[docs/api/README.md](docs/api/README.md). Si no existe `backend/.env`, se usan
valores de desarrollo equivalentes a los de `backend/.env.example`.

### 5. Verificaciones locales

Desde `frontend/`:

```bash
npm run check
npm run build
```

`check` verifica TypeScript, ESLint, el formato y la coherencia de las cifras
ficticias de los seis KPI. Para aplicar formato:
`npm run format`. Para revisar la compilación local: `npm run preview`.

Desde `backend/`, con el entorno virtual activo:

```bash
python -m ruff check .
python -m ruff format --check .
python -m unittest discover -s tests -v
python -m alembic heads
python -m scripts.exportar_openapi
```

`exportar_openapi` actualiza `docs/api/openapi.json`; ejecutarlo al cambiar
endpoints o esquemas e incluir el archivo en el pull request.

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

Si otra persona se suma a la misma tarea y acuerdan compartir su rama, después
de que esté publicada puede obtenerla desde la raíz del repositorio así:

```bash
git fetch origin
git switch --track origin/feat/nombre-de-la-tarea
```

Luego sigue los pasos de instalación y ejecución de esta guía. Antes de subir
cambios, integrar los commits recientes de la rama con `git pull --ff-only` y
coordinar el trabajo sobre los archivos compartidos.

En GitHub, abrir un pull request desde esa rama hacia `main`, completar la
plantilla y pedir revisión a otro integrante. Fusionar cuando esté revisado y
las verificaciones pasen; después eliminar la rama desde GitHub.

Mantener las tareas pequeñas e integrarlas con frecuencia ayuda a reducir
conflictos. Las reglas y los pasos para actualizar una rama están en
[docs/conventions.md](docs/conventions.md). Este flujo se basa en
[GitHub flow](https://docs.github.com/es/get-started/using-github/github-flow).

## Estado actual del desarrollo

El repositorio incluye el panel operativo y dos composiciones de indicadores con
datos de prueba; las otras vistas siguen siendo provisionales. También incluye
`/health`, configuración de PostgreSQL y Alembic, verificaciones y documentación.

El backend incluye una base por capas con login JWT y roles, registro y
seguimiento de reclamos, asignación de funcionarios, gestiones, flujo de estados
y control de plazos, con pruebas automáticas. Los datos se guardan en memoria
mediante repositorios intercambiables: falta el modelo de datos en PostgreSQL
(tablas, migraciones y repositorios SQL), la integración del frontend con la API
y los seis KPI en Power BI. Los contratos son una propuesta descrita en
[docs/api/README.md](docs/api/README.md).
Actualizar esta sección a medida que el equipo avance.

El equipo debe confirmar los contratos API, modelo de datos, roles, reglas de
plazos, definición de KPI, identidad visual y reparto de módulos. Estas
propuestas están en [docs/architecture.md](docs/architecture.md).
