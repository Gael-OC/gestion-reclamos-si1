import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

try {
  const auth = await server.ssrLoadModule('/src/features/auth/model.ts')
  const cliente = await server.ssrLoadModule('/src/features/cliente/model.ts')
  const datos = await server.ssrLoadModule('/src/features/cliente/mockData.ts')
  const fichas = await server.ssrLoadModule(
    '/src/features/reclamos/detalle/detalle.ts',
  )
  const listado = await server.ssrLoadModule(
    '/src/features/reclamos/listado/mockData.ts',
  )
  const fechas = await server.ssrLoadModule('/src/lib/fechas.ts')
  const cuentas = await server.ssrLoadModule(
    '/src/features/auth/cuentasLocales.ts',
  )
  const demo = await server.ssrLoadModule(
    '/src/features/reclamos/demo/model.ts',
  )
  const pasos = await server.ssrLoadModule('/src/features/funcionario/pasos.ts')
  assert.equal(auth.inicioPorRol('cliente'), '/portal')
  assert.equal(auth.inicioPorRol('supervisor'), '/supervisor')
  assert.equal(auth.inicioPorRol('funcionario'), '/funcionario')
  assert.equal(
    new Set(auth.CUENTAS_EJEMPLO.map((cuenta) => cuenta.email)).size,
    auth.CUENTAS_EJEMPLO.length,
  )
  assert.equal(
    'password' in auth.usuarioPublico(auth.CUENTAS_EJEMPLO[0]),
    false,
  )
  const principal = auth.CUENTAS_EJEMPLO.find(
    (cuenta) => cuenta.email === 'cliente@demo.local',
  )
  const todos = [...datos.RECLAMOS_CON_CLIENTE, ...datos.CERRADOS_CLIENTE]
  const propios = cliente.reclamosDeCliente(todos, principal.id)
  assert.equal(datos.RECLAMOS_CON_CLIENTE.length, 342)
  assert.equal(propios.length, 4)
  assert.ok(propios.every((reclamo) => reclamo.clienteId === principal.id))
  assert.equal(
    cliente.reclamosDeCliente(todos, 'cliente-no-registrado').length,
    0,
  )
  const matias = cliente.reclamosDeCliente(todos, 'cliente-matias')
  assert.equal(matias.length, 1)
  assert.ok(
    matias.every(
      (reclamo) => !propios.some((propio) => propio.id === reclamo.id),
    ),
  )
  assert.equal(listado.FECHA_REFERENCIA, fechas.fechaISO(fechas.hoy()))
  const compartido = propios.find(
    (reclamo) => reclamo.id === fichas.CASO_EJEMPLO,
  )
  const ficha = fichas.detalleReclamo(
    compartido.id,
    listado.RECLAMOS_DEMO,
    listado.RESPONSABLES,
  )
  assert.equal(compartido.asunto, ficha.asunto)
  assert.equal(compartido.empresa, ficha.empresa)
  assert.equal(compartido.consumidor, principal.nombre)
  assert.equal(compartido.estado, ficha.estado)
  const publicos = cliente.eventosPublicos(ficha.historial)
  assert.ok(ficha.historial.some((evento) => evento.tipo === 'nota'))
  assert.ok(
    publicos.every((evento) => evento.tipo !== 'nota' && evento.tipo !== 'hoy'),
  )
  const seguimiento = datos.seguimientoInicial(compartido)
  assert.ok(
    seguimiento.some((evento) => evento.titulo === 'La empresa respondió'),
  )
  assert.equal(
    seguimiento.some((evento) => evento.titulo === 'Nota interna'),
    false,
  )
  assert.ok(
    seguimiento.every((evento) => /^\d{4}-\d{2}-\d{2}$/.test(evento.fecha)),
  )
  const pendiente = propios.find(
    (reclamo) => reclamo.estado === 'pendiente_antecedentes',
  )
  const inicial = datos.seguimientoInicial(pendiente)
  assert.equal(cliente.requiereAntecedentes(pendiente, inicial), true)
  const aporte = {
    id: 'aporte',
    fecha: listado.FECHA_REFERENCIA,
    tipo: 'antecedentes',
    titulo: 'Antecedentes enviados',
    descripcion: 'Comprobante entregado',
  }
  assert.equal(
    cliente.requiereAntecedentes(pendiente, [...inicial, aporte]),
    false,
  )
  assert.equal(
    cliente.requiereAntecedentes(pendiente, [
      ...inicial,
      aporte,
      { ...aporte, id: 'solicitud-nueva', tipo: 'solicitud' },
    ]),
    true,
  )
  assert.equal(
    cliente.requiereAntecedentes({ ...pendiente, estado: 'cerrado' }, inicial),
    false,
  )

  const supervisor = auth.CUENTAS_EJEMPLO.find(
    (cuenta) => cuenta.rol === 'supervisor',
  )
  const funcionaria = auth.CUENTAS_EJEMPLO.find(
    (cuenta) => cuenta.rol === 'funcionario',
  )
  const otroCliente = auth.CUENTAS_EJEMPLO.find(
    (cuenta) => cuenta.id === 'cliente-matias',
  )
  let estado = demo.estadoInicialDemo()
  const nuevo = demo.crearReclamoDemo(
    {
      asunto: 'Cobro de envío duplicado',
      empresa: 'Comercial Elqui',
      mercado: 'Retail',
      comuna: 'Coquimbo',
      descripcion: 'Solicito devolver el cargo duplicado del envío.',
    },
    principal,
    demo.folioInicialDemo(),
  )
  estado = demo.reducirDemo(estado, {
    tipo: 'registrar',
    usuario: principal,
    reclamo: nuevo,
  })
  assert.equal(demo.modeloDemo(estado, principal).activos.total, 343)
  assert.equal(
    demo.modeloDemo(estado, principal).detalle(nuevo.id).consumidor,
    principal.nombre,
  )
  assert.equal(demo.modeloDemo(estado, otroCliente).detalle(nuevo.id), null)
  assert.deepEqual(
    demo
      .modeloDemo(estado, otroCliente)
      .seguimiento({ ...nuevo, clienteId: otroCliente.id }),
    [],
  )
  assert.equal(demo.modeloDemo(estado, null).detalle(nuevo.id), null)
  let secuencia = 0
  const gestion = (usuario, titulo, tipo, cambio = {}, detalle = titulo) => ({
    tipo: 'gestionar',
    usuario,
    id: nuevo.id,
    evento: {
      titulo,
      tipo,
      detalle,
      fecha: fechas.fechaCorta(fechas.hoy()),
      registradoEn: ++secuencia,
    },
    cambio,
  })
  assert.equal(
    demo.reducirDemo(
      estado,
      gestion(principal, 'Intento de cierre', 'gestion', { estado: 'cerrado' }),
    ),
    estado,
  )
  estado = demo.reducirDemo(
    estado,
    gestion(supervisor, 'Asignado a Camila Rojas', 'gestion', {
      responsableId: funcionaria.responsableId,
      estado: 'asignado',
    }),
  )
  assert.equal(
    demo.modeloDemo(estado, principal).detalle(nuevo.id).estado,
    'asignado',
  )
  const funcionarioAjeno = {
    ...funcionaria,
    id: 'funcionario-ajeno',
    responsableId: 'otra-persona',
  }
  assert.equal(
    demo.modeloDemo(estado, funcionarioAjeno).detalle(nuevo.id),
    null,
  )
  assert.equal(
    demo.reducirDemo(estado, gestion(funcionarioAjeno, 'Nota ajena', 'nota')),
    estado,
  )
  const aporteFlujo = {
    tipo: 'aportar',
    id: nuevo.id,
    usuario: principal,
    evento: {
      ...aporte,
      registradoEn: ++secuencia,
      adjuntos: [
        { nombre: 'Comprobante.pdf', tipo: 'application/pdf', tamano: 128 },
      ],
    },
  }
  assert.equal(
    demo.reducirDemo(estado, { ...aporteFlujo, usuario: otroCliente }),
    estado,
  )
  estado = demo.reducirDemo(estado, aporteFlujo)
  assert.ok(
    demo
      .modeloDemo(estado, funcionaria)
      .detalle(nuevo.id)
      .adjuntos.includes('Comprobante.pdf'),
  )
  const privado = 'Observación reservada del equipo'
  estado = demo.reducirDemo(
    estado,
    gestion(funcionaria, 'Nota interna', 'nota', {}, privado),
  )
  assert.ok(
    demo
      .modeloDemo(estado, funcionaria)
      .detalle(nuevo.id)
      .historial.some((evento) => evento.detalle === privado),
  )
  assert.equal(
    demo
      .modeloDemo(estado, principal)
      .detalle(nuevo.id)
      .historial.some((evento) => evento.detalle === privado),
    false,
  )
  estado = demo.reducirDemo(
    estado,
    gestion(funcionaria, 'Análisis registrado', 'gestion', {
      estado: 'en_gestion',
    }),
  )
  assert.equal(
    pasos.proximoPaso('en_gestion', false, nuevo.empresa).accion,
    'solicitar',
  )
  estado = demo.reducirDemo(
    estado,
    gestion(funcionaria, 'Solicitud enviada a Comercial Elqui', 'empresa', {
      estado: 'esperando_empresa',
      respuestaEmpresa: false,
    }),
  )
  assert.equal(
    demo.modeloDemo(estado, principal).detalle(nuevo.id).estado,
    'esperando_empresa',
  )
  estado = demo.reducirDemo(
    estado,
    gestion(funcionaria, 'La empresa respondió', 'empresa', {
      estado: 'en_gestion',
      respuestaEmpresa: true,
    }),
  )
  assert.equal(
    pasos.proximoPaso('en_gestion', true, nuevo.empresa).accion,
    'resultado',
  )
  const resultado = 'La empresa confirmó la devolución del cargo duplicado.'
  estado = demo.reducirDemo(
    estado,
    gestion(
      funcionaria,
      'Caso cerrado · Solución total',
      'gestion',
      { estado: 'cerrado', resultado },
      resultado,
    ),
  )
  const final = demo.modeloDemo(estado, principal)
  const cerrado = final.reclamos.find((reclamo) => reclamo.id === nuevo.id)
  assert.equal(cerrado.estado, 'cerrado')
  assert.equal(cerrado.resultado, resultado)
  assert.equal(final.activos.total, 342)
  assert.equal(final.seguimiento(cerrado).at(-1).descripcion, resultado)
  assert.equal(
    final.seguimiento(cerrado).some((evento) => evento.descripcion === privado),
    false,
  )
  assert.equal(demo.reducirDemo(estado, aporteFlujo), estado)
  assert.equal(
    demo.reducirDemo(estado, {
      tipo: 'registrar',
      usuario: funcionaria,
      reclamo: nuevo,
    }),
    estado,
  )
  assert.equal(
    demo.reducirDemo(estado, {
      tipo: 'registrar',
      usuario: null,
      reclamo: nuevo,
    }),
    estado,
  )

  const React = await import('react')
  const { renderToString } = await import('react-dom/server')
  const { MemoryRouter, Routes, Route } = await import('react-router')
  const { AuthContext } = await server.ssrLoadModule(
    '/src/features/auth/context.ts',
  )
  const { ReclamosDemoContext } = await server.ssrLoadModule(
    '/src/features/reclamos/demo/context.ts',
  )
  const { ClienteDetallePage } = await server.ssrLoadModule(
    '/src/pages/ClienteDetallePage.tsx',
  )
  const { ClienteInicioPage } = await server.ssrLoadModule(
    '/src/pages/ClienteInicioPage.tsx',
  )
  const { LoginPage } = await server.ssrLoadModule('/src/pages/LoginPage.tsx')
  const renderizar = (Pagina, usuario, ruta, patron) =>
    renderToString(
      React.createElement(
        MemoryRouter,
        { initialEntries: [ruta] },
        React.createElement(
          AuthContext.Provider,
          {
            value: {
              usuario: usuario ? auth.usuarioPublico(usuario) : null,
              cerrarSesion() {},
              iniciarSesion() {},
              registrarCliente() {},
            },
          },
          React.createElement(
            ReclamosDemoContext.Provider,
            {
              value: {
                ...demo.modeloDemo(estado, usuario),
                registrar() {},
                registrarGestion() {},
                aportarAntecedentes() {},
              },
            },
            React.createElement(
              Routes,
              null,
              React.createElement(Route, {
                path: patron,
                element: React.createElement(Pagina),
              }),
            ),
          ),
        ),
      ),
    )
  const detalleHtml = renderizar(
    ClienteDetallePage,
    principal,
    `/portal/reclamos/${nuevo.id}`,
    '/portal/reclamos/:reclamoId',
  )
  assert.ok(detalleHtml.includes(resultado))
  assert.equal(detalleHtml.includes(privado), false)
  assert.equal(detalleHtml.includes('Aportar antecedentes'), false)
  const ajenoHtml = renderizar(
    ClienteDetallePage,
    otroCliente,
    `/portal/reclamos/${nuevo.id}`,
    '/portal/reclamos/:reclamoId',
  )
  assert.ok(ajenoHtml.includes('Reclamo no disponible'))
  assert.equal(ajenoHtml.includes(resultado), false)
  const inicioHtml = renderizar(
    ClienteInicioPage,
    principal,
    '/portal',
    '/portal',
  )
  assert.ok(
    inicioHtml.includes('Nuevo reclamo') &&
      inicioHtml.includes('/portal/reclamos/nuevo'),
  )
  const loginHtml = renderizar(LoginPage, null, '/login', '/login')
  assert.ok(
    loginHtml.includes('name="login-email"') &&
      loginHtml.includes('name="login-password"'),
  )
  assert.equal(loginHtml.includes('Accesos de ejemplo'), false)
  const { ClienteLayout } = await server.ssrLoadModule(
    '/src/features/cliente/ClienteLayout.tsx',
  )
  const { ClienteReclamosPage } = await server.ssrLoadModule(
    '/src/pages/ClienteReclamosPage.tsx',
  )
  const { ClienteNuevoReclamoPage } = await server.ssrLoadModule(
    '/src/pages/ClienteNuevoReclamoPage.tsx',
  )
  const { ClienteCuentaPage } = await server.ssrLoadModule(
    '/src/pages/ClienteCuentaPage.tsx',
  )
  const { RegistroClientePage } = await server.ssrLoadModule(
    '/src/pages/RegistroClientePage.tsx',
  )
  const { RecuperarAccesoPage } = await server.ssrLoadModule(
    '/src/pages/RecuperarAccesoPage.tsx',
  )
  const { AppLayout } = await server.ssrLoadModule(
    '/src/components/layout/AppLayout.tsx',
  )
  const { ReclamosPage } = await server.ssrLoadModule(
    '/src/pages/ReclamosPage.tsx',
  )
  assert.ok(
    renderizar(ClienteLayout, principal, '/portal', '/portal').includes(
      '/portal/perfil',
    ),
  )
  assert.ok(
    renderizar(
      ClienteReclamosPage,
      principal,
      '/portal/reclamos',
      '/portal/reclamos',
    ).includes(nuevo.id),
  )
  const formularioHtml = renderizar(
    ClienteNuevoReclamoPage,
    principal,
    '/portal/reclamos/nuevo',
    '/portal/reclamos/nuevo',
  )
  for (const campo of ['asunto', 'empresa', 'comuna', 'mercado', 'descripcion'])
    assert.ok(formularioHtml.includes(`nuevo-${campo}`))
  assert.ok(
    renderizar(
      ClienteCuentaPage,
      principal,
      '/portal/perfil',
      '/portal/perfil',
    ).includes(principal.email),
  )
  assert.ok(
    renderizar(RegistroClientePage, null, '/registro', '/registro').includes(
      'Crear cuenta y continuar',
    ),
  )
  assert.ok(
    renderizar(
      RecuperarAccesoPage,
      null,
      '/recuperar-acceso',
      '/recuperar-acceso',
    ).includes('Solicitar recuperación'),
  )
  const layoutFuncionario = renderizar(
    AppLayout,
    funcionaria,
    '/reclamos?alcance=todos',
    '/reclamos',
  )
  assert.equal(layoutFuncionario.includes('href="/supervisor"'), false)
  assert.ok(layoutFuncionario.includes('/funcionario'))
  assert.ok(
    renderizar(
      AppLayout,
      supervisor,
      '/reclamos?alcance=mios',
      '/reclamos',
    ).includes('href="/supervisor"'),
  )
  assert.equal(
    renderizar(
      ReclamosPage,
      funcionaria,
      '/reclamos?alcance=todos',
      '/reclamos',
    ).includes('Todos los responsables'),
    false,
  )
  assert.ok(
    renderizar(ReclamosPage, supervisor, '/reclamos', '/reclamos').includes(
      'Todos los responsables',
    ),
  )

  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const memoria = new Map()
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (clave) => memoria.get(clave) ?? null,
      setItem: (clave, valor) => memoria.set(clave, valor),
    },
  })
  try {
    const password = 'AccesoLocal2026!'
    const credencial = await cuentas.crearCredencial(password)
    assert.notEqual(credencial.hash, password)
    assert.match(credencial.sal, /^[a-f0-9]{32}$/)
    assert.equal(await cuentas.verificarCredencial(password, credencial), true)
    assert.equal(
      await cuentas.verificarCredencial('Incorrecta2026!', credencial),
      false,
    )
    const cuenta = {
      id: 'cliente-validacion',
      nombre: 'Cuenta local',
      email: 'validacion@demo.local',
      rol: 'cliente',
      credencial,
    }
    assert.equal(cuentas.guardarCuentaLocal(cuenta), true)
    assert.equal(cuentas.guardarCuentaLocal(cuenta), false)
    assert.equal(cuentas.leerCuentasLocales().length, 1)
    assert.equal(
      [...memoria.values()].some((valor) => valor.includes(password)),
      false,
    )
    memoria.set(
      'reclamos.cuentas.frontend.v1',
      JSON.stringify([{ ...cuenta, rol: 'supervisor' }]),
    )
    assert.deepEqual(cuentas.leerCuentasLocales(), [])
    memoria.set('reclamos.cuentas.frontend.v1', '{incompleto')
    assert.deepEqual(cuentas.leerCuentasLocales(), [])
  } finally {
    if (descriptor)
      Object.defineProperty(globalThis, 'localStorage', descriptor)
    else delete globalThis.localStorage
  }
  console.log(
    'Acceso y portal: destinos por rol, aislamiento entre clientes, ficha compartida, privacidad del historial y credenciales locales verificados.',
  )
  console.log(
    'Flujo integrado: registro, asignación, antecedentes, notas privadas, respuesta y cierre; páginas del cliente renderizadas y aislamiento verificado.',
  )
} finally {
  await server.close()
}
