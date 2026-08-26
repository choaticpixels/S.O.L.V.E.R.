import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

export const CyberEnvironment: React.FC = () => {
  const gridRef = useRef<THREE.GridHelper>(null);
  const particlesRef = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (gridRef.current) {
      gridRef.current.rotation.y = t * 0.015;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.03;
      particlesRef.current.rotation.x = Math.sin(t * 0.02) * 0.1;
    }
  });

  // Generate 500 ambient floating cyan/purple dust particles
  const particleCount = 600;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const colorPurple = new THREE.Color('#D037FF');
  const colorCyan = new THREE.Color('#00F2FE');

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 80;

    const mixedColor = Math.random() > 0.5 ? colorPurple : colorCyan;
    colors[i * 3] = mixedColor.r;
    colors[i * 3 + 1] = mixedColor.g;
    colors[i * 3 + 2] = mixedColor.b;
  }

  return (
    <>
      <color attach="background" args={['#030712']} />
      <ambientLight intensity={0.6} />
      <pointLight position={[25, 30, 25]} intensity={2.5} color="#D037FF" />
      <pointLight position={[-25, -20, -25]} intensity={2.5} color="#00F2FE" />
      <pointLight position={[0, 0, 0]} intensity={1.8} color="#FED700" />
      <directionalLight position={[0, 20, 10]} intensity={1.2} />

      {/* Cybernetic Floor Grid */}
      <gridHelper
        ref={gridRef}
        args={[120, 60, '#00F2FE', '#0c1a30']}
        position={[0, -16, 0]}
      />

      {/* Ambient Floating Dust Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particleCount}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.25}
          vertexColors
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Deep Space Background Stars */}
      <Stars
        radius={90}
        depth={60}
        count={4500}
        factor={4}
        saturation={1}
        fade
        speed={1.5}
      />
    </>
  );
};
