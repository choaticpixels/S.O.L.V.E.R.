import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Node3D } from '../types';

interface TxConnectionsProps {
  nodes: Node3D[];
  highlightedSignature: string | null;
}

export const TxConnections: React.FC<TxConnectionsProps> = ({ nodes, highlightedSignature }) => {
  const connectionGeometries = useMemo(() => {
    if (nodes.length === 0) return [];

    const lines: { geometry: THREE.BufferGeometry; color: string; isTarget: boolean }[] = [];
    const center = new THREE.Vector3(0, 0, 0);

    // 1. Connect every node to the central hub
    nodes.forEach((node) => {
      const pos = new THREE.Vector3(node.x, node.y, node.z);
      const mid = new THREE.Vector3().addVectors(center, pos).multiplyScalar(0.5);
      mid.y += 1.2;

      const curve = new THREE.QuadraticBezierCurve3(center, mid, pos);
      const points = curve.getPoints(12);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const isTarget = node.signature === highlightedSignature;

      lines.push({
        geometry,
        color: isTarget ? '#FED700' : node.x < 0 ? '#D037FF' : '#00F2FE',
        isTarget,
      });
    });

    // 2. Interconnect nearby nodes (Network Web Effect)
    for (let i = 0; i < nodes.length; i++) {
      const p1 = new THREE.Vector3(nodes[i].x, nodes[i].y, nodes[i].z);
      for (let j = i + 1; j < Math.min(i + 5, nodes.length); j++) {
        const p2 = new THREE.Vector3(nodes[j].x, nodes[j].y, nodes[j].z);
        if (p1.distanceTo(p2) < 14) {
          const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
          const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
          const points = curve.getPoints(8);
          const geometry = new THREE.BufferGeometry().setFromPoints(points);

          const isTarget =
            nodes[i].signature === highlightedSignature ||
            nodes[j].signature === highlightedSignature;

          lines.push({
            geometry,
            color: isTarget ? '#FED700' : (i + j) % 2 === 0 ? '#D037FF' : '#00F2FE',
            isTarget,
          });
        }
      }
    }

    return lines;
  }, [nodes, highlightedSignature]);

  return (
    <group>
      {connectionGeometries.map((conn, index) => (
        <primitive
          key={index}
          object={
            new THREE.Line(
              conn.geometry,
              new THREE.LineBasicMaterial({
                color: conn.color,
                transparent: true,
                opacity: conn.isTarget ? 0.95 : 0.35,
                linewidth: conn.isTarget ? 2 : 1,
              })
            )
          }
        />
      ))}
    </group>
  );
};
