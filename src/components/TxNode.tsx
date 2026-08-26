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
  const ringRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Rotate inner mesh & target reticle rings
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.8;
      meshRef.current.rotation.x = Math.sin(t * 0.5) * 0.3;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -t * 1.2;
    }
    if (outerGlowRef.current) {
      const pulseSpeed = node.riskLevel === 'HIGH' ? 6 : 3;
      const scale = (isHighlighted ? 1.5 : 1.2) + Math.sin(t * pulseSpeed + node.x) * 0.15;
      outerGlowRef.current.scale.set(scale, scale, scale);
    }
  });

  // Assign color: Left side nodes = Magenta/Purple (#D037FF), Right side = Cyan/Green (#00F2FE/#14F195), Target = Gold (#FED700)
  let baseColor = node.x < 0 ? '#D037FF' : '#00F2FE';
  if (node.status === 'failed' || node.riskLevel === 'HIGH') {
    baseColor = '#FF3366';
  }
  const nodeColor = isHighlighted ? '#FED700' : baseColor;

  const renderGeometry = () => {
    switch (node.shape) {
      case 'octahedron':
        return <octahedronGeometry args={[isHighlighted ? 0.65 : 0.45, 0]} />;
      case 'tetrahedron':
        return <tetrahedronGeometry args={[isHighlighted ? 0.65 : 0.45, 0]} />;
      case 'icosahedron':
        return <icosahedronGeometry args={[isHighlighted ? 0.6 : 0.42, 0]} />;
      case 'sphere':
      default:
        return <sphereGeometry args={[isHighlighted ? 0.55 : 0.4, 20, 20]} />;
    }
  };

  return (
    <group position={[node.x, node.y, node.z]}>
      {/* Target Reticle Crosshair (3D Ring HUD) when Highlighted */}
      {isHighlighted && (
        <group ref={ringRef}>
          {/* Inner Ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.2, 1.28, 32]} />
            <meshBasicMaterial color="#FED700" side={THREE.DoubleSide} transparent opacity={0.9} />
          </mesh>
          {/* Outer Dashed Ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.45, 1.52, 16]} />
            <meshBasicMaterial color="#FED700" side={THREE.DoubleSide} transparent opacity={0.6} wireframe />
          </mesh>
          {/* 4 Crosshair Ticks */}
          {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
            <mesh key={i} rotation={[0, 0, angle]} position={[Math.cos(angle) * 1.35, Math.sin(angle) * 1.35, 0]}>
              <boxGeometry args={[0.25, 0.05, 0.05]} />
              <meshBasicMaterial color="#FED700" />
            </mesh>
          ))}
        </group>
      )}

      {/* Outer Glowing Sphere Aura */}
      <mesh ref={outerGlowRef}>
        <sphereGeometry args={[0.7, 16, 16]} />
        <meshBasicMaterial
          color={nodeColor}
          transparent
          opacity={isHighlighted ? 0.75 : hovered ? 0.55 : 0.25}
        />
      </mesh>

      {/* Core Node Mesh */}
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
          emissiveIntensity={isHighlighted ? 3.0 : hovered ? 2.2 : 1.4}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Floating HUD Callout Box (Only on hover when node is NOT selected to avoid clutter) */}
      {(hovered && !isHighlighted) && (
        <Html distanceFactor={16} position={[1.4, 0.4, 0]} style={{ pointerEvents: 'none' }}>
          <div className="relative bg-[#06101e]/95 border-2 border-solana-yellow/90 backdrop-blur-md p-3 rounded-lg shadow-[0_0_25px_rgba(254,215,0,0.35)] min-w-[230px] font-mono text-xs">
            {/* Connecting Pointer Line Accent */}
            <div className="absolute -left-3 top-4 w-3 h-[2px] bg-solana-yellow" />

            {/* Header */}
            <div className="bg-solana-yellow/15 border border-solana-yellow/40 rounded px-2 py-1 mb-2 flex items-center justify-between">
              <span className="font-bold text-solana-yellow text-[11px] tracking-wide">
                TARGET: {node.signature.slice(0, 6)}...{node.signature.slice(-4)}
              </span>
            </div>

            <div className="text-[10px] text-slate-400 font-semibold mb-1">
              Suspect Transaction / Activity
            </div>

            <div className="space-y-1 text-[11px] text-slate-200 border-t border-slate-800/80 pt-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">TxHash:</span>
                <span className="text-cyan-300 font-bold">{node.signature.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Value:</span>
                <span className="text-solana-green font-bold">{node.amountSol} SOL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className={node.status === 'success' ? 'text-solana-green font-semibold' : 'text-rose-400 font-semibold'}>
                  {node.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Risk Score:</span>
                <span className={node.riskLevel === 'HIGH' ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {node.riskLevel === 'HIGH' ? '98% (High)' : '12% (Low)'}
                </span>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};
