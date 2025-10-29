const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);
scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());
scene.clearColor = new BABYLON.Color3.FromHexString("#87CEFA");

// Block definitions
const blockColors = {
  grass: "#00aa00",
  dirt: "#8B4513",
  stone: "#808080",
  coal: "#404040",
  iron: "#b87333",
  gold: "#FFD700",
  redstone: "#FF0000",
  diamond: "#00CED1",
  bedrock: "#000000"
};
const blockTypes = Object.keys(blockColors);
const buttons = [];
let selectedBlock = blockTypes[0];

// UI setup
const inventory = document.getElementById("inventory");
const label = document.getElementById("selectedLabel");
blockTypes.forEach((type, index) => {
  const btn = document.createElement("div");
  btn.className = "block-btn";
  btn.style.background = blockColors[type];
  btn.onclick = () => selectBlock(index);
  inventory.appendChild(btn);
  buttons.push(btn);
});
function selectBlock(index) {
  selectedBlock = blockTypes[index];
  buttons.forEach(b => b.classList.remove("selected"));
  buttons[index].classList.add("selected");
  label.textContent = "Selected: " + selectedBlock;
}
selectBlock(0);

// Camera setup
const camera = new BABYLON.UniversalCamera("fpCamera", new BABYLON.Vector3(0, 0, 0), scene);
camera.attachControl(canvas, true);
camera.checkCollisions = true;
camera.applyGravity = true;
camera.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);
camera.speed = 0.5;

// Lighting
new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

// Block mesh templates
const blockMeshes = {};
const thinInstanceBuffers = {};
blockTypes.forEach(type => {
  const mat = new BABYLON.StandardMaterial(`mat-${type}`, scene);
  mat.diffuseColor = BABYLON.Color3.FromHexString(blockColors[type]);
  mat.freeze();
  const mesh = BABYLON.MeshBuilder.CreateBox(`block-${type}`, { size: 1 }, scene);
  mesh.material = mat;
  mesh.isVisible = false;
  mesh.freezeWorldMatrix();
  blockMeshes[type] = mesh;
  thinInstanceBuffers[type] = [];
});

// Terrain generation
const loadedChunks = new Set();
function chunkKey(cx, cz) {
  return `${cx},${cz}`;
}
function perlin(x, z) {
  return Math.floor((Math.sin(x * 0.2) + Math.cos(z * 0.2)) * 2 + 5);
}
function loadChunk(cx, cz, chunkSize = 16) {
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

// Spawn player on terrain
const spawnX = 0;
const spawnZ = 0;
const spawnY = perlin(spawnX, spawnZ);
camera.position = new BABYLON.Vector3(spawnX, spawnY + 2, spawnZ);

// Load initial and surrounding chunks
function updateChunksAroundPlayer() {
  const chunkSize = 16;
  const px = Math.floor(camera.position.x / chunkSize);
  const pz = Math.floor(camera.position.z / chunkSize);
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      loadChunk(px + dx, pz + dz, chunkSize);
    }
  }
}
updateChunksAroundPlayer();

// Block placement
function addBlock(x, y, z, type) {
  blockMeshes[type].thinInstanceAdd(BABYLON.Matrix.Translation(x, y, z));
}
scene.onPointerDown = function () {
  const pick = scene.pick(scene.pointerX, scene.pointerY);
  if (pick.hit) {
    const normal = pick.getNormal(true);
    const pos = pick.pickedPoint.add(normal);
    const x = Math.floor(pos.x + 0.5);
    const y = Math.floor(pos.y + 0.5);
    const z = Math.floor(pos.z + 0.5);
    addBlock(x, y, z, selectedBlock);
  }
};

// Game loop
engine.runRenderLoop(() => {
  updateChunksAroundPlayer();
  scene.render();
});
window.addEventListener("resize", () => engine.resize());
