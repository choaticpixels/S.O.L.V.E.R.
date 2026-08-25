import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Node3D } from '../types';

interface TxNodeProps {
  node: Node3D;
  isHighlighted: boolean;
  onSelect: (node: Node3D) => void;
}

export const TxNode: React.FC<TxNodeProps> = ({ node, isHighlighted, onSelect }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const outerGlowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Pulse animation frame
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.5;
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.2;
    }
    if (outerGlowRef.current) {
      const scale = 1.2 + Math.sin(clock.getElapsedTime() * 3 + node.x) * 0.15;
      outerGlowRef.current.scale.set(scale, scale, scale);
    }
  });

  const nodeColor = isHighlighted ? '#FED700' : node.color;
  const isGreen = node.color === '#14F195';

  return (
    <group position={[node.x, node.y, node.z]}>
      {/* Outer Glowing Sphere */}
      <mesh ref={outerGlowRef}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshBasicMaterial
          color={nodeColor}
          transparent
          opacity={isHighlighted ? 0.6 : hovered ? 0.4 : 0.25}
        />
      </mesh>

      {/* Main Core Node Geometry */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <icosahedronGeometry args={[isHighlighted ? 0.5 : 0.38, 1]} />
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={isHighlighted ? 2.5 : hovered ? 1.8 : 1.0}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Interactive Tooltip on Hover or Selection */}
      {(hovered || isHighlighted) && (
        <Html distanceFactor={15} position={[0, 0.8, 0]} center>
          <div className="bg-slate-900/90 border border-slate-700 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-xl text-xs whitespace-nowrap pointer-events-none">
            <div className="font-mono text-solana-yellow font-bold flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isGreen ? 'bg-solana-green' : isHighlighted ? 'bg-solana-yellow' : 'bg-solana-purple'}`}></span>
              {node.signature.slice(0, 8)}...{node.signature.slice(-6)}
            </div>
            <div className="text-slate-400 text-[10px] mt-0.5 flex justify-between gap-3">
              <span>Slot: #{node.slot}</span>
              <span className={node.status === 'success' ? 'text-solana-green' : 'text-rose-400'}>
                {node.status.toUpperCase()}
              </span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};
