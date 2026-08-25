import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

export const CyberEnvironment: React.FC = () => {
  const gridRef = useRef<THREE.GridHelper>(null);

  useFrame(({ clock }) => {
    if (gridRef.current) {
      gridRef.current.rotation.y = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[20, 30, 20]} intensity={1.5} color="#9945FF" />
      <pointLight position={[-20, -20, -20]} intensity={1.5} color="#14F195" />
      <directionalLight position={[0, 15, 0]} intensity={0.8} />

      {/* Cyber Grid Base */}
      <gridHelper
        ref={gridRef}
        args={[100, 50, '#9945FF', '#1e1b4b']}
        position={[0, -12, 0]}
      />

      {/* Deep Space Background Stars */}
      <Stars
        radius={80}
        depth={50}
        count={3000}
        factor={4}
        saturation={1}
        fade
        speed={1}
      />
    </>
  );
};
