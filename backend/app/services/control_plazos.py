"""Consultas de control de plazos: evaluación individual, alertas y resumen."""

from datetime import date

from app.domain.entidades import Reclamo, Usuario
from app.domain.enums import ESTADOS_ACTIVOS, SituacionPlazo
from app.services.base import Servicio
from app.services.plazos import EvaluacionPlazo, evaluar_plazo, rango_fecha_limite
from app.services.reclamos import ServicioReclamos


class ServicioPlazos(Servicio):
    def evaluar(self, reclamo: Reclamo, hoy: date | None = None) -> EvaluacionPlazo:
        cierre = reclamo.fecha_cierre
        return evaluar_plazo(
            reclamo,
            hoy=hoy or self.reloj.hoy(),
            fecha_ingreso_local=self.reloj.fecha_local(reclamo.fecha_ingreso),
            fecha_cierre_local=self.reloj.fecha_local(cierre) if cierre else None,
            dias_alerta=self.settings.dias_alerta,
        )

    def alertas(self, usuario: Usuario) -> list[Reclamo]:
        """Reclamos activos vencidos o por vencer, del más urgente al menos urgente."""
        reclamos = ServicioReclamos(self.repos, self.reloj, self.settings)
        filtro = reclamos.filtro_base(usuario)
        filtro.estados = sorted(ESTADOS_ACTIVOS)
        _, filtro.fecha_limite_hasta = rango_fecha_limite(
            SituacionPlazo.POR_VENCER, self.reloj.hoy(), self.settings.dias_alerta
        )
        filtro.orden = "fecha_limite_asc"
        items, _ = self.repos.reclamos.buscar(filtro)
        return items

    def resumen(self, usuario: Usuario) -> dict[str, int | date]:
        reclamos = ServicioReclamos(self.repos, self.reloj, self.settings)
        filtro = reclamos.filtro_base(usuario)
        filtro.estados = sorted(ESTADOS_ACTIVOS)
        activos, _ = self.repos.reclamos.buscar(filtro)

        hoy = self.reloj.hoy()
        conteo = {
            s: 0
            for s in (SituacionPlazo.EN_PLAZO, SituacionPlazo.POR_VENCER, SituacionPlazo.VENCIDO)
        }
        for reclamo in activos:
            conteo[self.evaluar(reclamo, hoy).situacion] += 1
        return {
            "fecha_corte": hoy,
            "activos": len(activos),
            "sin_asignar": sum(1 for r in activos if r.funcionario_id is None),
            "en_plazo": conteo[SituacionPlazo.EN_PLAZO],
            "por_vencer": conteo[SituacionPlazo.POR_VENCER],
            "vencidos": conteo[SituacionPlazo.VENCIDO],
        }
