const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);
scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());
scene.clearColor = new BABYLON.Color3.FromHexString("#87CEFA");

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

const camera = new BABYLON.UniversalCamera("fpCamera", new BABYLON.Vector3(0, 0, 0), scene);
camera.attachControl(canvas, true);
camera.checkCollisions = true;
camera.applyGravity = true;
camera.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);
camera.speed = 0.5;

const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

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

const highestY = generateTerrain(scene, blockMeshes, thinInstanceBuffers);
camera.position = new BABYLON.Vector3(16, highestY + 5, 16);

scene.onPointerDown = function () {
  const pick = scene.pick(scene.pointerX, scene.pointerY);
  if (pick.hit) {
    const normal = pick.getNormal(true);
    const pos = pick.pickedPoint.add(normal);
    const x = Math.floor(pos.x + 0.5);
    const y = Math.floor(pos.y + 0.5);
    const z = Math.floor(pos.z + 0.5);
    blockMeshes[selectedBlock].thinInstanceAdd(BABYLON.Matrix.Translation(x, y, z));
  }
};

engine.runRenderLoop(() => {
  const input = getMobileInput();
  // Apply joystick movement and jump logic here
  scene.render();
});
window.addEventListener("resize", () => engine.resize());
