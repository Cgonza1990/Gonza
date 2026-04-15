import * as THREE from 'three';
import type { TerrainContext } from './terrain';

export function createPlayer(scene: THREE.Scene, terrain: TerrainContext): THREE.Group {
  const p = new THREE.Group();
  const bodyMat = new THREE.MeshLambertMaterial({ color: '#fff2d9' });
  const shirtMat = new THREE.MeshLambertMaterial({ color: '#7dd3fc' });
  const pantsMat = new THREE.MeshLambertMaterial({ color: '#6366f1' });
  const hairMat = new THREE.MeshLambertMaterial({ color: '#6b4f3a' });

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), bodyMat);
  head.position.y = 1.8;
  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.3, 0.94), hairMat);
  hair.position.y = 2.18;
  const torso = new THREE.Mesh(new THREE.BoxGeometry(1, 0.9, 0.7), shirtMat);
  torso.position.y = 1.1;
  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.7, 0.35), pantsMat);
  legL.position.set(-0.2, 0.35, 0);
  const legR = legL.clone();
  legR.position.x = 0.2;

  p.add(head, hair, torso, legL, legR);
  p.position.set(0, terrain.topHeightAt(0, 12) + 0.6, 12);
  scene.add(p);
  return p;
}

export function createGuide(scene: THREE.Scene, terrain: TerrainContext): THREE.Group {
  const guide = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1, 1.2, 1), new THREE.MeshLambertMaterial({ color: '#fda4af' }));
  const face = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.55, 0.2), new THREE.MeshLambertMaterial({ color: '#ffe6cc' }));
  face.position.set(0, 0.2, 0.5);
  const hat = new THREE.Mesh(new THREE.ConeGeometry(0.75, 0.8, 6), new THREE.MeshLambertMaterial({ color: '#60a5fa' }));
  hat.position.y = 1;
  const marker = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.08, 8, 20), new THREE.MeshLambertMaterial({ color: '#fde047' }));
  marker.rotation.x = Math.PI / 2;
  marker.position.y = 2.2;

  guide.add(body, face, hat, marker);
  guide.position.set(0, terrain.topHeightAt(0, 4) + 0.8, 4);
  guide.userData = { marker, bobPhase: 0 };
  scene.add(guide);
  return guide;
}
