function generateTerrain(scene, blockMeshes, thinInstanceBuffers, chunkSize = 32) {
  function perlin(x, z) {
    return Math.floor((Math.sin(x * 0.2) + Math.cos(z * 0.2)) * 2 + 5);
  }

  let highestY = 0;
  for (let x = 0; x < chunkSize; x++) {
    for (let z = 0; z < chunkSize; z++) {
      const h = perlin(x, z);
      if (h > highestY) highestY = h;
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
        thinInstanceBuffers[type].push(BABYLON.Matrix.Translation(x, y, z));
      }
      thinInstanceBuffers["bedrock"].push(BABYLON.Matrix.Translation(x, -1, z));
    }
  }

  Object.entries(thinInstanceBuffers).forEach(([type, matrices]) => {
    blockMeshes[type].thinInstanceAdd(matrices);
  });

  return highestY;
}
