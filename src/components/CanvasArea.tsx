import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { Node3D } from '../types';
import { TxNode } from './TxNode';
import { TxConnections } from './TxConnections';
import { CyberEnvironment } from './CyberEnvironment';

interface CanvasAreaProps {
  nodes: Node3D[];
  highlightedSignature: string | null;
  onSelectNode: (node: Node3D) => void;
  resetTrigger: number;
}

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

    if (targetNode) {
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
      const defaultCamPos = new THREE.Vector3(0, 8, 25);

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
}) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const targetNode = nodes.find(n => n.signature === highlightedSignature) || null;

  return (
    <div className="w-full h-full relative bg-slate-950">
      <Canvas
        camera={{ position: [0, 8, 25], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
      >
        <CyberEnvironment />
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.05}
          maxDistance={60}
          minDistance={3}
        />
        
        <CameraController
          targetNode={targetNode}
          resetTrigger={resetTrigger}
          controlsRef={controlsRef}
        />

        {/* Render 3D Transaction Connection Lines */}
        <TxConnections nodes={nodes} highlightedSignature={highlightedSignature} />

        {/* Render 3D Transaction Nodes */}
        {nodes.map((node) => (
          <TxNode
            key={node.signature}
            node={node}
            isHighlighted={node.signature === highlightedSignature}
            onSelect={onSelectNode}
          />
        ))}
      </Canvas>
    </div>
  );
};
