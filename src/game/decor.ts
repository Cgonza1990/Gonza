import * as THREE from 'three';
import type { TerrainContext } from './terrain';
import type { Zone } from './types';

function voxel(mat: THREE.Material) {
  return new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mat);
}

function makeTree(scene: THREE.Scene, x: number, y: number, z: number) {
  const trunkMat = new THREE.MeshLambertMaterial({ color: '#8f623f' });
  const leafMat = new THREE.MeshLambertMaterial({ color: '#53b45a' });
  for (let i = 0; i < 3; i++) {
    const t = voxel(trunkMat);
    t.position.set(x, y + i, z);
    scene.add(t);
  }
  for (let lx = -1; lx <= 1; lx++) {
    for (let lz = -1; lz <= 1; lz++) {
      const l = voxel(leafMat);
      l.position.set(x + lx, y + 3, z + lz);
      scene.add(l);
    }
  }
}

function makeBush(scene: THREE.Scene, x: number, y: number, z: number) {
  const bushMat = new THREE.MeshLambertMaterial({ color: '#4ba95a' });
  const b1 = voxel(bushMat);
  b1.position.set(x, y, z);
  const b2 = voxel(bushMat);
  b2.position.set(x + 1, y, z);
  scene.add(b1, b2);
}

function makeFlower(scene: THREE.Scene, x: number, y: number, z: number, color: string) {
  const stem = voxel(new THREE.MeshLambertMaterial({ color: '#58ad48' }));
  stem.scale.set(0.25, 0.8, 0.25);
  stem.position.set(x, y + 0.2, z);
  const petal = voxel(new THREE.MeshLambertMaterial({ color }));
  petal.scale.set(0.4, 0.4, 0.4);
  petal.position.set(x, y + 0.9, z);
  scene.add(stem, petal);
}

function makeFence(scene: THREE.Scene, x: number, y: number, z: number, len: number, horizontal = true) {
  const mat = new THREE.MeshLambertMaterial({ color: '#d69d63' });
  for (let i = 0; i < len; i++) {
    const post = voxel(mat);
    post.scale.set(0.2, 1, 0.2);
    post.position.set(horizontal ? x + i : x, y + 0.5, horizontal ? z : z + i);
    scene.add(post);
  }
}

function makeHouse(scene: THREE.Scene, x: number, y: number, z: number) {
  const wall = new THREE.MeshLambertMaterial({ color: '#f8ddb4' });
  const roof = new THREE.MeshLambertMaterial({ color: '#ea7e7a' });
  for (let hx = -2; hx <= 2; hx++) {
    for (let hz = -2; hz <= 2; hz++) {
      const floor = voxel(wall);
      floor.position.set(x + hx, y, z + hz);
      scene.add(floor);
      if (Math.abs(hx) === 2 || Math.abs(hz) === 2) {
        const wallBlock = voxel(wall);
        wallBlock.position.set(x + hx, y + 1, z + hz);
        scene.add(wallBlock);
      }
    }
  }
  for (let rx = -2; rx <= 2; rx++) {
    for (let rz = -2; rz <= 2; rz++) {
      const r = voxel(roof);
      r.position.set(x + rx, y + 2, z + rz);
      scene.add(r);
    }
  }
}

function marker(color: string, label = 'Station'): THREE.Group {
  const g = new THREE.Group();
  const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(0.9, 0.9, 0.2, 8),
    new THREE.MeshLambertMaterial({ color })
  );
  const gem = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.45),
    new THREE.MeshLambertMaterial({ color: '#ffffff' })
  );
  gem.position.y = 1.15;
  g.add(plate, gem);
  g.userData = { label, bobPhase: Math.random() * Math.PI * 2 };
  return g;
}

export function decorateWorld(scene: THREE.Scene, terrain: TerrainContext): Zone[] {
  const zones: Zone[] = [];

  const placeZone = (x: number, z: number, type: Zone['type'], color: string, label: string) => {
    const y = terrain.topHeightAt(x, z) + 0.6;
    const m = marker(color, label);
    m.position.set(x, y, z);
    scene.add(m);
    zones.push({ type, marker: m, anchor: new THREE.Vector3(x, y, z), label });
  };

  placeZone(-12, -8, 'letter', '#f5b3d9', 'Letter Garden');
  placeZone(10, -10, 'phonics', '#8dc0ff', 'Phonics Bridge');
  placeZone(12, 8, 'sight', '#ffd773', 'Sight Word House');
  placeZone(-10, 9, 'spelling', '#b9f18f', 'Spelling Meadow');
  placeZone(0, -13, 'collect', '#f781c9', 'Collect Letters');
  placeZone(0, 0, 'build', '#9f8bff', 'Build Corner');

  for (let i = 0; i < 22; i++) {
    const x = (Math.random() * terrain.worldRadius * 1.7 - terrain.worldRadius * 0.85) | 0;
    const z = (Math.random() * terrain.worldRadius * 1.7 - terrain.worldRadius * 0.85) | 0;
    const y = terrain.topHeightAt(x, z) + 0.5;
    makeTree(scene, x, y, z);
  }

  for (let i = 0; i < 26; i++) {
    const x = (Math.random() * terrain.worldRadius * 1.8 - terrain.worldRadius * 0.9) | 0;
    const z = (Math.random() * terrain.worldRadius * 1.8 - terrain.worldRadius * 0.9) | 0;
    const y = terrain.topHeightAt(x, z) + 0.5;
    makeBush(scene, x, y, z);
  }

  for (let i = 0; i < 40; i++) {
    const x = (Math.random() * terrain.worldRadius * 1.8 - terrain.worldRadius * 0.9) | 0;
    const z = (Math.random() * terrain.worldRadius * 1.8 - terrain.worldRadius * 0.9) | 0;
    const y = terrain.topHeightAt(x, z) + 0.4;
    const colors = ['#f49dc8', '#fcd34d', '#93c5fd', '#f97373'];
    makeFlower(scene, x, y, z, colors[i % colors.length]);
  }

  const houseX = 13;
  const houseZ = 8;
  makeHouse(scene, houseX, terrain.topHeightAt(houseX, houseZ) + 0.5, houseZ);

  for (let i = -3; i <= 3; i++) {
    const x = i * 2;
    const z = Math.round(Math.sin(x * 0.18) * 3);
    const y = terrain.topHeightAt(x, z) + 0.2;
    const stone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.7, 0.25, 6),
      new THREE.MeshLambertMaterial({ color: '#d0d7e5' })
    );
    stone.position.set(x, y, z);
    scene.add(stone);
  }

  makeFence(scene, -14, terrain.topHeightAt(-14, -8) + 0.1, -10, 6, true);
  makeFence(scene, -14, terrain.topHeightAt(-14, -8) + 0.1, -6, 6, true);

  return zones;
}
