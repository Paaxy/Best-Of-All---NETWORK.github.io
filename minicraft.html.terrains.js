const loadedChunks = new Set();

function chunkKey(cx, cz) {
  return `${cx},${cz}`;
}

function perlin(x, z) {
  return Math.floor((Math.sin(x * 0.2) + Math.cos(z * 0.2)) * 2 + 5);
}

function loadChunk(scene, blockMeshes, thinInstanceBuffers, cx, cz, chunkSize = 16) {
  const key = chunkKey(cx, cz);
  if (loadedChunks.has(key)) return;
  loadedChunks.add(key);

  for (let x = 0; x < chunkSize; x++) {
    for (let z = 0; z < chunkSize; z++) {
      const worldX = cx * chunkSize + x;
      const worldZ = cz * chunkSize + z;
      const h = perlin(worldX, worldZ);
      for (let y = 0; y <= h; y++) {
        let type = "dirt";
        if (y === h) type = "grass";
        else if (y < h - 3) {
          const r = Math.random();
          if (r < 0.05) type = "diamond";
          else if (r < 0.1) type = "redstone";
          else if (r < 0.2) type = "coal";
          else if (r < 0.3) type = "iron";
          else if (r < 0.35) type = "gold";
          else type = "stone";
        }
        thinInstanceBuffers[type].push(BABYLON.Matrix.Translation(worldX, y, worldZ));
      }
      thinInstanceBuffers["bedrock"].push(BABYLON.Matrix.Translation(worldX, -1, worldZ));
    }
  }

  Object.entries(thinInstanceBuffers).forEach(([type, matrices]) => {
    blockMeshes[type].thinInstanceAdd(matrices);
    thinInstanceBuffers[type].length = 0;
  });
}
