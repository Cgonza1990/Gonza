import * as THREE from 'three';

export type TerrainContext = {
  worldRadius: number;
  topHeightAt: (x: number, z: number) => number;
  pathMaskAt: (x: number, z: number) => number;
};

function makeTexture(colors: string[], dot = false): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2d context');

  ctx.fillStyle = colors[0];
  ctx.fillRect(0, 0, 64, 64);

  for (let i = 0; i < 90; i++) {
    const c = colors[1 + (i % (colors.length - 1))];
    ctx.fillStyle = c;
    const size = dot ? 2 : 6;
    ctx.fillRect((Math.random() * 62) | 0, (Math.random() * 62) | 0, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

export function buildTerrain(scene: THREE.Scene): TerrainContext {
  const worldRadius = 22;
  const grassMat = new THREE.MeshLambertMaterial({ map: makeTexture(['#6fcf6a', '#7ddf71', '#55b255'], true) });
  const dirtMat = new THREE.MeshLambertMaterial({ map: makeTexture(['#9d6c44', '#8c5d37', '#b57c4d']) });
  const stoneMat = new THREE.MeshLambertMaterial({ map: makeTexture(['#9ea8b8', '#8894a5', '#748194']) });
  const sandMat = new THREE.MeshLambertMaterial({ map: makeTexture(['#efd48b', '#e4c06d', '#f5de9e']) });
  const waterMat = new THREE.MeshLambertMaterial({
    map: makeTexture(['#62c4f5', '#4ca9df', '#70d3ff'], true),
    transparent: true,
    opacity: 0.88
  });

  const geo = new THREE.BoxGeometry(1, 1, 1);

  const pathMaskAt = (x: number, z: number): number => {
    const curvy = Math.sin(x * 0.18) * 3;
    const dist = Math.abs(z - curvy);
    return THREE.MathUtils.clamp(1 - dist / 2.2, 0, 1);
  };

  const topHeightAt = (x: number, z: number): number => {
    const rolling = Math.sin(x * 0.28) * 2.2 + Math.cos(z * 0.25) * 1.8 + Math.sin((x + z) * 0.12) * 1.3;
    const ridge = Math.max(0, Math.sin((x - 5) * 0.25) * 2.5);
    return Math.round(rolling + ridge);
  };

  for (let x = -worldRadius; x <= worldRadius; x++) {
    for (let z = -worldRadius; z <= worldRadius; z++) {
      const top = topHeightAt(x, z);
      const pond = Math.sin(x * 0.24) + Math.cos(z * 0.31) < -1.2;
      const pathMask = pathMaskAt(x, z);

      for (let y = -4; y <= top; y++) {
        let material: THREE.Material = dirtMat;
        if (y === top) {
          if (pond && y <= 0) material = sandMat;
          else if (top > 3) material = stoneMat;
          else material = pathMask > 0.7 ? sandMat : grassMat;
        } else if (top - y > 3) {
          material = stoneMat;
        }

        const block = new THREE.Mesh(geo, material);
        block.position.set(x, y, z);
        block.castShadow = y >= top - 1;
        block.receiveShadow = true;
        scene.add(block);
      }

      if (pond) {
        const water = new THREE.Mesh(geo, waterMat);
        water.position.set(x, 0.2, z);
        scene.add(water);
      }
    }
  }

  return { worldRadius, topHeightAt, pathMaskAt };
}
