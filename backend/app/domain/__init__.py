"""Entidades y enumeraciones del dominio, independientes de FastAPI y de SQLAlchemy.

Los servicios trabajan con estas clases. Los repositorios las entregan y reciben,
de modo que la implementación con PostgreSQL pueda reemplazar a la de memoria
sin cambiar las reglas de negocio ni la API.
"""
