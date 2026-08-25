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
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.6;
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.4) * 0.3;
    }
    if (outerGlowRef.current) {
      const pulseSpeed = node.riskLevel === 'HIGH' ? 6 : 3;
      const scale = (isHighlighted ? 1.4 : 1.2) + Math.sin(clock.getElapsedTime() * pulseSpeed + node.x) * 0.15;
      outerGlowRef.current.scale.set(scale, scale, scale);
    }
  });

  const nodeColor = isHighlighted ? '#FED700' : node.color;

  // Render appropriate 3D geometry based on node shape type
  const renderGeometry = () => {
    switch (node.shape) {
      case 'octahedron':
        return <octahedronGeometry args={[isHighlighted ? 0.6 : 0.45, 0]} />;
      case 'tetrahedron':
        return <tetrahedronGeometry args={[isHighlighted ? 0.6 : 0.45, 0]} />;
      case 'icosahedron':
        return <icosahedronGeometry args={[isHighlighted ? 0.55 : 0.4, 0]} />;
      case 'sphere':
      default:
        return <sphereGeometry args={[isHighlighted ? 0.5 : 0.38, 16, 16]} />;
    }
  };

  return (
    <group position={[node.x, node.y, node.z]}>
      {/* Outer Glowing Sphere / Aura */}
      <mesh ref={outerGlowRef}>
        <sphereGeometry args={[0.65, 16, 16]} />
        <meshBasicMaterial
          color={nodeColor}
          transparent
          opacity={isHighlighted ? 0.7 : hovered ? 0.5 : 0.25}
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
        {renderGeometry()}
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={isHighlighted ? 2.8 : hovered ? 2.0 : 1.2}
          roughness={0.15}
          metalness={0.85}
        />
      </mesh>

      {/* Interactive 3D Tooltip on Hover or Selection */}
      {(hovered || isHighlighted) && (
        <Html distanceFactor={16} position={[0, 0.85, 0]} center>
          <div className="bg-slate-900/95 border border-slate-700/80 backdrop-blur-md p-2.5 rounded-xl shadow-2xl text-xs min-w-[200px] pointer-events-none transition-all">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1 mb-1.5">
              <span className="font-mono text-solana-yellow font-bold">
                {node.signature.slice(0, 8)}...{node.signature.slice(-4)}
              </span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  node.riskLevel === 'HIGH'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : 'bg-emerald-500/20 text-solana-green border border-emerald-500/40'
                }`}
              >
                {node.riskLevel} RISK
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-slate-300">
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">Type</span>
                <span className="font-semibold text-white">{node.type}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">Volume</span>
                <span className="font-semibold text-solana-green">{node.amountSol} SOL</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">Status</span>
                <span className={node.status === 'success' ? 'text-solana-green' : 'text-rose-400'}>
                  {node.status}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">Slot</span>
                <span>#{node.slot}</span>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};
