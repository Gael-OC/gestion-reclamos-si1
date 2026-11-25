"""crea tablas del modelo de datos

Revision ID: cd41e207cc7d
Revises:
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "cd41e207cc7d"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "clasificacion",
        sa.Column("id_clasificacion", sa.Integer(), nullable=False),
        sa.Column("mercado", sa.String(length=80), nullable=False),
        sa.Column("categoria", sa.String(length=80), nullable=False),
        sa.Column("producto", sa.String(length=100), nullable=False),
        sa.Column("motivo", sa.String(length=120), nullable=False),
        sa.PrimaryKeyConstraint("id_clasificacion"),
    )
    op.create_table(
        "comuna",
        sa.Column("id_comuna", sa.Integer(), nullable=False),
        sa.Column("nombre", sa.String(length=60), nullable=False),
        sa.Column("region", sa.String(length=60), nullable=False),
        sa.PrimaryKeyConstraint("id_comuna"),
    )
    op.create_table(
        "empresa",
        sa.Column("id_empresa", sa.Integer(), nullable=False),
        sa.Column("nombre", sa.String(length=120), nullable=False),
        sa.PrimaryKeyConstraint("id_empresa"),
    )
    op.create_table(
        "estado",
        sa.Column("id_estado", sa.Integer(), nullable=False),
        sa.Column("nombre", sa.String(length=40), nullable=False),
        sa.PrimaryKeyConstraint("id_estado"),
    )
    op.create_table(
        "perfil",
        sa.Column("id_perfil", sa.Integer(), nullable=False),
        sa.Column("nombre", sa.String(length=40), nullable=False),
        sa.PrimaryKeyConstraint("id_perfil"),
    )
    op.create_table(
        "usuario",
        sa.Column("id_usuario", sa.Integer(), nullable=False),
        sa.Column("id_perfil", sa.Integer(), nullable=False),
        sa.Column("nombre", sa.String(length=120), nullable=False),
        sa.Column("correo", sa.String(length=160), nullable=False),
        sa.Column("contrasena_hash", sa.String(length=255), nullable=False),
        sa.ForeignKeyConstraint(["id_perfil"], ["perfil.id_perfil"]),
        sa.PrimaryKeyConstraint("id_usuario"),
        sa.UniqueConstraint("correo"),
    )
    op.create_table(
        "reclamo",
        sa.Column("id_reclamo", sa.Integer(), nullable=False),
        sa.Column("id_consumidor", sa.Integer(), nullable=True),
        sa.Column("id_responsable", sa.Integer(), nullable=True),
        sa.Column("id_estado", sa.Integer(), nullable=True),
        sa.Column("id_empresa", sa.Integer(), nullable=True),
        sa.Column("id_clasificacion", sa.Integer(), nullable=True),
        sa.Column("id_comuna", sa.Integer(), nullable=True),
        sa.Column("asunto", sa.String(length=150), nullable=True),
        sa.Column("descripcion", sa.Text(), nullable=True),
        sa.Column("fecha_ingreso", sa.Date(), nullable=True),
        sa.Column("fecha_limite", sa.Date(), nullable=True),
        sa.Column("fecha_cierre", sa.Date(), nullable=True),
        sa.Column("resultado", sa.String(length=60), nullable=True),
        sa.Column(
            "origen",
            sa.Enum("portal", "historico", name="origen_reclamo"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["id_clasificacion"], ["clasificacion.id_clasificacion"]),
        sa.ForeignKeyConstraint(["id_comuna"], ["comuna.id_comuna"]),
        sa.ForeignKeyConstraint(["id_consumidor"], ["usuario.id_usuario"]),
        sa.ForeignKeyConstraint(["id_empresa"], ["empresa.id_empresa"]),
        sa.ForeignKeyConstraint(["id_estado"], ["estado.id_estado"]),
        sa.ForeignKeyConstraint(["id_responsable"], ["usuario.id_usuario"]),
        sa.PrimaryKeyConstraint("id_reclamo"),
    )
    op.create_table(
        "antecedente",
        sa.Column("id_antecedente", sa.Integer(), nullable=False),
        sa.Column("id_reclamo", sa.Integer(), nullable=False),
        sa.Column("id_autor", sa.Integer(), nullable=False),
        sa.Column("fecha", sa.DateTime(), nullable=False),
        sa.Column("contenido", sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(["id_autor"], ["usuario.id_usuario"]),
        sa.ForeignKeyConstraint(["id_reclamo"], ["reclamo.id_reclamo"]),
        sa.PrimaryKeyConstraint("id_antecedente"),
    )
    op.create_table(
        "gestion",
        sa.Column("id_gestion", sa.Integer(), nullable=False),
        sa.Column("id_reclamo", sa.Integer(), nullable=False),
        sa.Column("id_usuario", sa.Integer(), nullable=False),
        sa.Column("id_estado_anterior", sa.Integer(), nullable=True),
        sa.Column("id_estado_nuevo", sa.Integer(), nullable=True),
        sa.Column("fecha", sa.DateTime(), nullable=False),
        sa.Column("accion", sa.String(length=60), nullable=False),
        sa.Column("detalle", sa.Text(), nullable=False),
        sa.Column("comunicable", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(["id_estado_anterior"], ["estado.id_estado"]),
        sa.ForeignKeyConstraint(["id_estado_nuevo"], ["estado.id_estado"]),
        sa.ForeignKeyConstraint(["id_reclamo"], ["reclamo.id_reclamo"]),
        sa.ForeignKeyConstraint(["id_usuario"], ["usuario.id_usuario"]),
        sa.PrimaryKeyConstraint("id_gestion"),
    )


def downgrade() -> None:
    op.drop_table("gestion")
    op.drop_table("antecedente")
    op.drop_table("reclamo")
    op.execute("DROP TYPE origen_reclamo")
    op.drop_table("usuario")
    op.drop_table("perfil")
    op.drop_table("estado")
    op.drop_table("empresa")
    op.drop_table("comuna")
    op.drop_table("clasificacion")
