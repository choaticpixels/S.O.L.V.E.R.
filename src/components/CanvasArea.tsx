import React, { useRef, useEffect, Component, ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { Node3D } from '../types';
import { TxNode } from './TxNode';
import { TxConnections } from './TxConnections';
import { CyberEnvironment } from './CyberEnvironment';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class CanvasErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('3D Canvas Render Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-100 font-mono p-4">
          <div className="bg-rose-500/10 border border-rose-500/40 p-6 rounded-2xl max-w-md text-center space-y-4 backdrop-blur-xl">
            <h2 className="text-sm font-bold text-rose-400 uppercase tracking-wider">3D WebGL Canvas Recovered</h2>
            <p className="text-xs text-slate-300">A rendering exception occurred in the 3D viewport. The engine has been isolated cleanly.</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg hover:brightness-110 transition-all"
            >
              Reset 3D Renderer
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

interface CanvasAreaProps {
  nodes: Node3D[];
  highlightedSignature: string | null;
  onSelectNode: (node: Node3D) => void;
  resetTrigger: number;
  walletAddress: string;
}

// Center Target Wallet Node Component
const CentralWalletNode: React.FC<{ walletAddress: string }> = ({ walletAddress }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.4;
      meshRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.2) * 0.2;
    }
  });

  const labelText = walletAddress && typeof walletAddress === 'string'
    ? `Target: ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
    : 'Target Wallet';

  return (
    <group position={[0, 0, 0]}>
      {/* Outer Pulse Ring */}
      <mesh>
        <sphereGeometry args={[1.5, 24, 24]} />
        <meshBasicMaterial color="#9945FF" transparent opacity={0.15} wireframe />
      </mesh>

      {/* Core Central Node */}
      <mesh ref={meshRef}>
        <dodecahedronGeometry args={[0.95, 0]} />
        <meshStandardMaterial
          color="#9945FF"
          emissive="#9945FF"
          emissiveIntensity={2.0}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Label */}
      <Html distanceFactor={18} position={[0, 1.4, 0]} center>
        <div className="bg-solana-purple/90 border border-purple-300 text-white px-2.5 py-1 rounded-full shadow-lg font-mono text-[11px] font-bold tracking-wide whitespace-nowrap">
          {labelText}
        </div>
      </Html>
    </group>
  );
};

// Camera animation controller component inside Canvas
const CameraController: React.FC<{
  targetNode: Node3D | null;
  resetTrigger: number;
  controlsRef: React.RefObject<OrbitControlsImpl>;
}> = ({ targetNode, resetTrigger, controlsRef }) => {
  const isResettingRef = useRef(false);

  useEffect(() => {
    if (resetTrigger > 0) {
      isResettingRef.current = true;
    }
  }, [resetTrigger]);

  useFrame((state, delta) => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;

    if (targetNode && typeof targetNode.x === 'number') {
      isResettingRef.current = false;
      const targetVec = new THREE.Vector3(targetNode.x, targetNode.y, targetNode.z);
      controls.target.lerp(targetVec, delta * 5);

      const desiredCamPos = new THREE.Vector3(
        targetNode.x + 4,
        targetNode.y + 3,
        targetNode.z + 6
      );
      state.camera.position.lerp(desiredCamPos, delta * 4);
      controls.update();
    } else if (isResettingRef.current) {
      const defaultTarget = new THREE.Vector3(0, 0, 0);
      const defaultCamPos = new THREE.Vector3(0, 10, 30);

      controls.target.lerp(defaultTarget, delta * 4);
      state.camera.position.lerp(defaultCamPos, delta * 4);
      controls.update();

      if (controls.target.distanceTo(defaultTarget) < 0.1) {
        isResettingRef.current = false;
      }
    }
  });

  return null;
};

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  nodes,
  highlightedSignature,
  onSelectNode,
  resetTrigger,
  walletAddress,
}) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  // Filter out any invalid nodes without signature/coordinates
  const validNodes = React.useMemo(
    () => (Array.isArray(nodes) ? nodes.filter((n) => n && typeof n.signature === 'string' && typeof n.x === 'number') : []),
    [nodes]
  );

  const targetNode = validNodes.find((n) => n.signature === highlightedSignature) || null;

  return (
    <CanvasErrorBoundary>
      <div className="w-full h-full relative bg-slate-950">
        <Canvas
          camera={{ position: [0, 10, 30], fov: 60 }}
          gl={{ antialias: true, alpha: false }}
        >
          <CyberEnvironment />
          <OrbitControls
            ref={controlsRef}
            makeDefault
            enableDamping
            dampingFactor={0.05}
            maxDistance={80}
            minDistance={3}
          />

          <CameraController
            targetNode={targetNode}
            resetTrigger={resetTrigger}
            controlsRef={controlsRef}
          />

          {/* Central Wallet Hub Node */}
          {walletAddress && <CentralWalletNode walletAddress={walletAddress} />}

          {/* Render 3D Transaction Connection Lines */}
          <TxConnections nodes={validNodes} highlightedSignature={highlightedSignature} />

          {/* Render 3D Transaction Nodes */}
          {validNodes.map((node) => (
            <TxNode
              key={node.signature}
              node={node}
              isHighlighted={node.signature === highlightedSignature}
              onSelect={onSelectNode}
            />
          ))}
        </Canvas>
      </div>
    </CanvasErrorBoundary>
  );
};

