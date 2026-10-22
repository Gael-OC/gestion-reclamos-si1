# Servicios de integración con la API

Centralizar aquí las llamadas HTTP a la API REST y coordinar sus contratos con
el equipo de backend. La estructura inicial aún no incluye llamadas HTTP.
Las páginas y componentes no deben acceder directamente a PostgreSQL.

Si se agregan variables `VITE_*`, serán públicas en el navegador: nunca deben
contener contraseñas, claves ni la URL de conexión a la base de datos.
