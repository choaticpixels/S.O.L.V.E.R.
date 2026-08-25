import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Node3D } from '../types';

interface TxConnectionsProps {
  nodes: Node3D[];
  highlightedSignature: string | null;
}

export const TxConnections: React.FC<TxConnectionsProps> = ({ nodes, highlightedSignature }) => {
  const lineGeometries = useMemo(() => {
    if (nodes.length < 2) return [];

    const lines: THREE.BufferGeometry[] = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      const p1 = new THREE.Vector3(nodes[i].x, nodes[i].y, nodes[i].z);
      const p2 = new THREE.Vector3(nodes[i + 1].x, nodes[i + 1].y, nodes[i + 1].z);

      // Create smooth quadratic bezier curve between nodes
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      mid.y += 1.5; // Curve upward

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const points = curve.getPoints(20);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      lines.push(geometry);
    }
    return lines;
  }, [nodes]);

  return (
    <group>
      {lineGeometries.map((geometry, index) => {
        const sourceSig = nodes[index]?.signature;
        const targetSig = nodes[index + 1]?.signature;
        const isConnectedToHighlight =
          highlightedSignature && (sourceSig === highlightedSignature || targetSig === highlightedSignature);

        return (
          <primitive
            key={index}
            object={
              new THREE.Line(
                geometry,
                new THREE.LineBasicMaterial({
                  color: isConnectedToHighlight ? '#FED700' : index % 2 === 0 ? '#9945FF' : '#14F195',
                  transparent: true,
                  opacity: isConnectedToHighlight ? 0.9 : 0.25,
                  linewidth: isConnectedToHighlight ? 2 : 1,
                })
              )
            }
          />
        );
      })}
    </group>
  );
};
