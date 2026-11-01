"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  AdaptiveDpr,
  Float,
  MeshTransmissionMaterial,
  Sparkles,
} from "@react-three/drei";
import * as THREE from "three";

type PointerTarget = { current: { x: number; y: number } };

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

/**
 * Window-level pointer tracking so the scene still reacts to the mouse even
 * though the background layer is `pointer-events: none`.
 */
function usePointerTarget(): PointerTarget {
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      target.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      target.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return target;
}

/** Deterministic PRNG so the particle field is identical on every render. */
function mulberry32(seed: number) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* -------------------------------------------------------------------------- */
/*  Particle field                                                            */
/* -------------------------------------------------------------------------- */

function ParticleField({
  count,
  pointer,
  reduced,
}: {
  count: number;
  pointer: PointerTarget;
  reduced: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const random = mulberry32(20261030);
    const nextPositions = new Float32Array(count * 3);
    const nextColors = new Float32Array(count * 3);
    const palette = [
      new THREE.Color("#8b5cf6"),
      new THREE.Color("#22d3ee"),
      new THREE.Color("#c4b5fd"),
      new THREE.Color("#e2e8f0"),
    ];

    for (let index = 0; index < count; index += 1) {
      const radius = 4.5 + random() * 10;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);

      nextPositions[index * 3] =
        radius * Math.sin(phi) * Math.cos(theta);
      nextPositions[index * 3 + 1] =
        radius * Math.sin(phi) * Math.sin(theta) * 0.68;
      nextPositions[index * 3 + 2] = radius * Math.cos(phi);

      const defaultColor = palette[0] ?? new THREE.Color("#8b5cf6");
      const color = palette[Math.floor(random() * palette.length)] ?? defaultColor;
      const intensity = 0.45 + random() * 0.55;

      nextColors[index * 3] = color.r * intensity;
      nextColors[index * 3 + 1] = color.g * intensity;
      nextColors[index * 3 + 2] = color.b * intensity;
    }

    return { positions: nextPositions, colors: nextColors };
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current || reduced) return;

    const time = state.clock.elapsedTime;
    pointsRef.current.rotation.y += delta * 0.012;
    pointsRef.current.rotation.x = Math.sin(time * 0.06) * 0.07;
    pointsRef.current.position.x = THREE.MathUtils.lerp(
      pointsRef.current.position.x,
      pointer.current.x * 0.45,
      0.025,
    );
    pointsRef.current.position.y = THREE.MathUtils.lerp(
      pointsRef.current.position.y,
      pointer.current.y * 0.3,
      0.025,
    );
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.038}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.78}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* -------------------------------------------------------------------------- */
/*  Backdrop glow                                                             */
/* -------------------------------------------------------------------------- */

function BackdropGlow() {
  return (
    <mesh position={[0, 0.35, -4.5]} scale={[13, 9, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={`
          varying vec2 vUv;

          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;

          void main() {
            float dist = distance(vUv, vec2(0.5));
            vec3 violet = vec3(0.42, 0.22, 0.95);
            vec3 cyan = vec3(0.04, 0.62, 0.85);
            vec3 color = mix(violet, cyan, smoothstep(0.12, 0.88, vUv.x));
            float alpha = (1.0 - smoothstep(0.04, 0.56, dist)) * 0.4;
            gl_FragColor = vec4(color, alpha);
          }
        `}
      />
    </mesh>
  );
}

/* -------------------------------------------------------------------------- */
/*  Glass cluster                                                             */
/* -------------------------------------------------------------------------- */

function GlassCluster({
  pointer,
  reduced,
  scale,
}: {
  pointer: PointerTarget;
  reduced: boolean;
  scale: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current || reduced) return;

    const time = state.clock.elapsedTime;

    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      pointer.current.y * 0.14 + Math.sin(time * 0.18) * 0.045,
      0.035,
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      pointer.current.x * 0.3 + Math.sin(time * 0.12) * 0.08,
      0.035,
    );
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      pointer.current.x * 0.35,
      0.03,
    );
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      pointer.current.y * 0.2,
      0.03,
    );
  });

  return (
    <group ref={groupRef} scale={scale}>
      {/* Central glass knot */}
      <Float
        speed={reduced ? 0 : 1.1}
        rotationIntensity={reduced ? 0 : 0.32}
        floatIntensity={reduced ? 0 : 0.85}
      >
        <mesh position={[0, 0.08, 0]} rotation={[0.42, 0.18, 0.08]}>
          <torusKnotGeometry args={[1.3, 0.36, 200, 32]} />
          <MeshTransmissionMaterial
            samples={4}
            resolution={256}
            thickness={1.15}
            roughness={0.12}
            ior={1.38}
            chromaticAberration={0.07}
            anisotropy={0.22}
            distortion={0.25}
            distortionScale={0.4}
            temporalDistortion={0.08}
            color="#c4b5fd"
            attenuationColor="#4c1d95"
            attenuationDistance={2.6}
          />
        </mesh>
      </Float>

      {/* Violet icosahedron */}
      <Float
        speed={reduced ? 0 : 1.5}
        rotationIntensity={reduced ? 0 : 0.45}
        floatIntensity={reduced ? 0 : 0.7}
      >
        <mesh
          position={[-2.35, 1.15, -0.65]}
          rotation={[0.6, -0.4, 0.2]}
        >
          <icosahedronGeometry args={[0.78, 0]} />
          <meshPhysicalMaterial
            color="#8b5cf6"
            transmission={0.92}
            thickness={1.2}
            roughness={0.16}
            metalness={0.05}
            ior={1.45}
            clearcoat={1}
            clearcoatRoughness={0.15}
            attenuationColor="#312e81"
            attenuationDistance={2}
            transparent
            opacity={0.92}
          />
        </mesh>
      </Float>

      {/* Cyan torus */}
      <Float
        speed={reduced ? 0 : 1.25}
        rotationIntensity={reduced ? 0 : 0.5}
        floatIntensity={reduced ? 0 : 0.75}
      >
        <mesh
          position={[2.15, -1.05, -0.35]}
          rotation={[1.1, 0.3, -0.2]}
        >
          <torusGeometry args={[0.82, 0.2, 32, 96]} />
          <meshPhysicalMaterial
            color="#22d3ee"
            emissive="#0891b2"
            emissiveIntensity={0.2}
            transmission={0.9}
            thickness={0.9}
            roughness={0.1}
            metalness={0.08}
            ior={1.4}
            clearcoat={1}
            clearcoatRoughness={0.08}
            transparent
            opacity={0.88}
          />
        </mesh>
      </Float>

      {/* Wireframe accent */}
      <Float
        speed={reduced ? 0 : 1.7}
        rotationIntensity={reduced ? 0 : 0.6}
        floatIntensity={reduced ? 0 : 0.65}
      >
        <mesh position={[1.75, 1.55, -1.8]} rotation={[0.4, 0.8, 0.1]}>
          <octahedronGeometry args={[0.55, 0]} />
          <meshBasicMaterial
            color="#a78bfa"
            wireframe
            transparent
            opacity={0.38}
          />
        </mesh>
      </Float>

      {/* Glowing core */}
      <mesh position={[0, 0.08, 0]} scale={0.22}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial
          color="#a78bfa"
          transparent
          opacity={0.65}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <pointLight
        position={[0, 0.08, 0]}
        intensity={9}
        distance={6}
        color="#a78bfa"
      />
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Orbiting rings                                                            */
/* -------------------------------------------------------------------------- */

function OrbitingRings({ reduced }: { reduced: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current || reduced) return;

    groupRef.current.rotation.z += delta * 0.018;
    groupRef.current.rotation.x =
      Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
  });

  return (
    <group ref={groupRef}>
      <mesh rotation={[Math.PI / 2.35, 0.15, 0]}>
        <torusGeometry args={[3.35, 0.006, 8, 240]} />
        <meshBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0.34}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh rotation={[Math.PI / 1.75, -0.45, 0.6]}>
        <torusGeometry args={[4.15, 0.004, 8, 240]} />
        <meshBasicMaterial
          color="#22d3ee"
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Scene                                                                     */
/* -------------------------------------------------------------------------- */

function Scene() {
  const { size } = useThree();
  const pointer = usePointerTarget();
  const reduced = usePrefersReducedMotion();

  const isMobile = size.width < 640;
  const particleCount = isMobile ? 380 : size.width < 1024 ? 650 : 1000;

  return (
    <>
      <fog attach="fog" args={["#05060b", 9.5, 24]} />

      <ambientLight intensity={0.45} />
      <directionalLight
        position={[4, 6, 5]}
        intensity={1.15}
        color="#ddd6fe"
      />
      <pointLight
        position={[-5, -1, 3]}
        intensity={38}
        distance={14}
        color="#7c3aed"
      />
      <pointLight
        position={[5, 3, -1]}
        intensity={32}
        distance={14}
        color="#22d3ee"
      />
      <pointLight
        position={[0, -4, 4]}
        intensity={20}
        distance={12}
        color="#f0abfc"
      />
      {/* Backlight pushes violet/cyan through the glass knot */}
      <pointLight
        position={[0, 0.6, -2.4]}
        intensity={26}
        distance={9}
        color="#8b5cf6"
      />

      <BackdropGlow />
      <GlassCluster
        pointer={pointer}
        reduced={reduced}
        scale={isMobile ? 0.72 : 1}
      />
      <ParticleField
        count={particleCount}
        pointer={pointer}
        reduced={reduced}
      />
      <OrbitingRings reduced={reduced} />

      <Sparkles
        count={45}
        scale={[16, 10, 12]}
        size={2.2}
        speed={0.25}
        color="#c4b5fd"
        opacity={0.55}
      />

      <AdaptiveDpr pixelated />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Background shell                                                          */
/* -------------------------------------------------------------------------- */

export function ThreeBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Atmospheric wash behind the WebGL canvas */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(76,29,149,0.18),transparent_45%),radial-gradient(circle_at_82%_18%,rgba(34,211,238,0.08),transparent_34%)]" />

      <Canvas
        camera={{ position: [0, 0, 9], fov: 42, near: 0.1, far: 60 }}
        dpr={[1, 1.6]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      {/* Vignette keeps foreground copy legible */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_0%,rgba(5,6,11,0.22)_55%,#05060b_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#05060b] to-transparent" />
    </div>
  );
}

export default ThreeBackground;
