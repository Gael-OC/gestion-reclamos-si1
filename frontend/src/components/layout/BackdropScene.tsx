import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Environment,
  Float,
  Lightformer,
  MeshDistortMaterial,
} from '@react-three/drei'
import { ACESFilmicToneMapping, Color, type Group } from 'three'

type SceneColors = {
  marino: string
  acero: string
  pizarra: string
  perla: string
}

/** Lee los colores de los tokens CSS para no duplicarlos en el código. */
function readColors(): SceneColors {
  const css = getComputedStyle(document.documentElement)
  const get = (name: string, fallback: string) =>
    css.getPropertyValue(`--color-${name}`).trim() || fallback
  return {
    marino: get('orb-marino', '#2c3e66'),
    acero: get('orb-acero', '#5b7398'),
    pizarra: get('orb-pizarra', '#8a96ab'),
    perla: get('orb-perla', '#f4f6fa'),
  }
}

/** Tinte apenas aclarado para el vidrio esmerilado. */
function frost(hex: string) {
  return new Color(hex).lerp(new Color('#ffffff'), 0.12)
}

type ObjectsProps = {
  colors: SceneColors
  still: boolean
}

/**
 * Cinco objetos de vidrio esmerilado translúcido repartidos en diagonal:
 * nunca detrás del contenido central, siempre en los bordes.
 */
function Objects({ colors, still }: ObjectsProps) {
  const group = useRef<Group>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const { viewport } = useThree()
  const w = viewport.width / 2
  const h = viewport.height / 2
  const scale = Math.min(1.25, Math.max(0.65, viewport.aspect / 1.6))
  const speed = still ? 0 : 1

  // El canvas no recibe eventos (pointer-events: none), así que se escucha la ventana.
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  // Paralaje suave hacia el puntero.
  useFrame(() => {
    if (!group.current || still) return
    group.current.rotation.y +=
      (pointer.current.x * 0.12 - group.current.rotation.y) * 0.04
    group.current.rotation.x +=
      (pointer.current.y * 0.08 - group.current.rotation.x) * 0.04
  })

  return (
    <group ref={group} scale={scale}>
      <Float speed={speed} floatIntensity={0.6} rotationIntensity={0.2}>
        <mesh position={[0.8 * w, 0.62 * h, -3]}>
          <sphereGeometry args={[2.1, 96, 96]} />
          <meshPhysicalMaterial
            color={frost(colors.marino)}
            roughness={0.3}
            clearcoat={1}
            clearcoatRoughness={0.12}
            sheen={0.35}
            transparent
            opacity={0.4}
            depthWrite={false}
          />
        </mesh>
      </Float>

      <Float speed={speed * 0.8} floatIntensity={0.5} rotationIntensity={0.2}>
        <mesh position={[-0.84 * w, -0.62 * h, -1.5]}>
          <sphereGeometry args={[1.6, 96, 96]} />
          <meshPhysicalMaterial
            color={frost(colors.pizarra)}
            roughness={0.35}
            clearcoat={1}
            clearcoatRoughness={0.12}
            sheen={0.35}
            transparent
            opacity={0.38}
            depthWrite={false}
          />
        </mesh>
      </Float>

      {/* Aro de vidrio claro con refracción */}
      <Float speed={speed * 1.1} floatIntensity={0.6} rotationIntensity={0.8}>
        <mesh position={[0.66 * w, -0.5 * h, 2]} rotation={[0.4, 0.3, 0]}>
          <torusGeometry args={[1.15, 0.42, 64, 160]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={1}
            thickness={1.8}
            roughness={0.05}
            ior={1.45}
            clearcoat={1}
            attenuationColor={colors.acero}
            attenuationDistance={5}
          />
        </mesh>
      </Float>

      <Float speed={speed * 1.2} floatIntensity={0.7}>
        <mesh position={[-0.6 * w, 0.72 * h, 1.5]}>
          <sphereGeometry args={[0.6, 64, 64]} />
          <meshPhysicalMaterial
            color={frost(colors.perla)}
            roughness={0.45}
            clearcoat={1}
            sheen={0.35}
            transparent
            opacity={0.55}
            depthWrite={false}
          />
        </mesh>
      </Float>

      {/* Gota líquida que ondula */}
      <Float speed={speed * 0.7} floatIntensity={0.5} rotationIntensity={0.4}>
        <mesh position={[-0.9 * w, 0.18 * h, -3.5]}>
          <icosahedronGeometry args={[1.25, 48]} />
          <MeshDistortMaterial
            color={frost(colors.acero)}
            distort={0.32}
            speed={still ? 0 : 1.4}
            roughness={0.25}
            transparent
            opacity={0.38}
            depthWrite={false}
          />
        </mesh>
      </Float>
    </group>
  )
}

type BackdropSceneProps = {
  /** true con prefers-reduced-motion: la escena queda quieta. */
  still: boolean
}

export default function BackdropScene({ still }: BackdropSceneProps) {
  const colors = useMemo(() => readColors(), [])
  const [ready, setReady] = useState(false)

  return (
    <Canvas
      className={`pointer-events-none transition-opacity duration-1000 ${ready ? 'opacity-100' : 'opacity-0'}`}
      dpr={[1, 1.5]}
      frameloop={still ? 'demand' : 'always'}
      camera={{ position: [0, 0, 18], fov: 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping
        gl.toneMappingExposure = 0.95
        setReady(true)
      }}
    >
      <hemisphereLight args={['#ffffff', colors.pizarra, 0.8]} />
      <directionalLight position={[-6, 9, 10]} intensity={2.2} />
      <pointLight position={[7, -5, 7]} intensity={30} distance={40} />

      {/* Reflejos sin descargar mapas de entorno: luces rectangulares propias */}
      <Environment resolution={128} frames={1} environmentIntensity={0.4}>
        <Lightformer
          intensity={2}
          position={[0, 5, -6]}
          scale={[12, 6, 1]}
          form="rect"
        />
        <Lightformer
          intensity={1}
          position={[-6, 0, 4]}
          scale={[6, 10, 1]}
          form="rect"
        />
        <Lightformer
          intensity={0.6}
          position={[6, -3, 2]}
          scale={[4, 4, 1]}
          form="circle"
        />
      </Environment>

      <Objects colors={colors} still={still} />
    </Canvas>
  )
}
