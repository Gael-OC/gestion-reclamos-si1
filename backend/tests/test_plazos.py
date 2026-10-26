import unittest
from datetime import UTC, date, datetime

from app.domain.entidades import Reclamo
from app.domain.enums import CanalIngreso, EstadoReclamo, SituacionPlazo
from app.schemas.validadores import normalizar_rut
from app.services.plazos import calcular_fecha_limite, evaluar_plazo, rango_fecha_limite

HOY = date(2026, 10, 26)
INGRESO = date(2026, 10, 10)


def reclamo(estado: EstadoReclamo, limite: date) -> Reclamo:
    momento = datetime(2026, 10, 10, 12, tzinfo=UTC)
    return Reclamo(
        id=1,
        folio="R-2026-000001",
        consumidor_nombre="Persona Ficticia",
        empresa_nombre="Empresa Ficticia",
        categoria="Comercio",
        descripcion="Caso de prueba",
        canal=CanalIngreso.WEB,
        estado=estado,
        registrado_por_id=1,
        fecha_ingreso=momento,
        fecha_limite=limite,
        actualizado_en=momento,
    )


def situacion(estado: EstadoReclamo, limite: date, cierre: date | None = None) -> SituacionPlazo:
    return evaluar_plazo(reclamo(estado, limite), HOY, INGRESO, cierre, dias_alerta=3).situacion


class PlazosTest(unittest.TestCase):
    def test_fecha_limite_en_dias_corridos(self) -> None:
        self.assertEqual(calcular_fecha_limite(date(2026, 10, 1), 20), date(2026, 10, 21))
        # Cruza fin de mes y fines de semana sin excepciones.
        self.assertEqual(calcular_fecha_limite(date(2026, 12, 20), 20), date(2027, 1, 9))

    def test_situacion_de_activos(self) -> None:
        activo = EstadoReclamo.EN_GESTION
        self.assertEqual(situacion(activo, date(2026, 10, 30)), SituacionPlazo.EN_PLAZO)
        self.assertEqual(situacion(activo, date(2026, 10, 29)), SituacionPlazo.POR_VENCER)
        self.assertEqual(situacion(activo, HOY), SituacionPlazo.POR_VENCER)  # vence hoy
        self.assertEqual(situacion(activo, date(2026, 10, 25)), SituacionPlazo.VENCIDO)

    def test_situacion_de_terminados(self) -> None:
        limite = date(2026, 10, 30)
        cerrado = EstadoReclamo.CERRADO
        self.assertEqual(situacion(cerrado, limite, limite), SituacionPlazo.CERRADO_EN_PLAZO)
        self.assertEqual(
            situacion(cerrado, limite, date(2026, 10, 31)), SituacionPlazo.CERRADO_FUERA_DE_PLAZO
        )
        self.assertEqual(situacion(EstadoReclamo.ANULADO, limite, HOY), SituacionPlazo.NO_APLICA)

    def test_dias_transcurridos_y_restantes(self) -> None:
        evaluacion = evaluar_plazo(
            reclamo(EstadoReclamo.EN_GESTION, date(2026, 10, 30)), HOY, INGRESO, None, 3
        )
        self.assertEqual((evaluacion.dias_transcurridos, evaluacion.dias_restantes), (16, 4))

    def test_rangos_coinciden_con_la_evaluacion(self) -> None:
        for actual in (SituacionPlazo.EN_PLAZO, SituacionPlazo.POR_VENCER, SituacionPlazo.VENCIDO):
            desde, hasta = rango_fecha_limite(actual, HOY, 3)
            for dias in range(-10, 15):
                limite = date.fromordinal(HOY.toordinal() + dias)
                dentro = (desde is None or limite >= desde) and (hasta is None or limite <= hasta)
                esperado = situacion(EstadoReclamo.EN_GESTION, limite) == actual
                self.assertEqual(dentro, esperado, (actual, limite))


class RutTest(unittest.TestCase):
    def test_normaliza_rut_valido(self) -> None:
        self.assertEqual(normalizar_rut("11.111.111-1"), "11111111-1")
        self.assertEqual(normalizar_rut("12.345.678-5"), "12345678-5")
        self.assertEqual(normalizar_rut("10.000.013-k"), "10000013-K")

    def test_rechaza_rut_invalido(self) -> None:
        for valor in ("12.345.678-9", "abc", "1-9"):
            with self.subTest(valor=valor), self.assertRaises(ValueError):
                normalizar_rut(valor)


if __name__ == "__main__":
    unittest.main()
