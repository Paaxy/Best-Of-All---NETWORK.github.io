const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);
scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());
scene.collisionsEnabled = true;
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
  lava: "#FF4500",
  water: "#1E90FF",
  leaves: "#006400",
  logs: "#4b2e2e",
  bedrock: "#000000"
};

const blockTypes = Object.keys(blockColors);
const keyMap = ["1","2","3","4","5","6","7","8","9","z","x","c","v"];
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

window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  const index = keyMap.indexOf(key);
  if (index !== -1 && blockTypes[index]) {
    selectBlock(index);
  }
});

const camera = new BABYLON.UniversalCamera("fpCamera", new BABYLON.Vector3(0, 0, 0), scene);
camera.attachControl(canvas, true);
camera.checkCollisions = true;
camera.applyGravity = true;
camera.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);
camera.speed = 0.5;
camera.inertia = 0;
camera.angularSensibility = 500;

canvas.addEventListener("click", () => {
  canvas.requestPointerLock();
});

const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

function perlin(x, z) {
  return Math.floor((Math.sin(x * 0.2) + Math.cos(z * 0.2)) * 2 + 5);
}

function createBlock(x, y, z, type, physics = false) {
  const box = BABYLON.MeshBuilder.CreateBox(`box-${x}-${y}-${z}`, { size: 1 }, scene);
  box.position.set(x, y, z);
  const mat = new BABYLON.StandardMaterial(`mat-${x}-${y}-${z}`, scene);
  mat.diffuseColor = BABYLON.Color3.FromHexString(blockColors[type]);
  box.material = mat;
  box.isPickable = true;
  box.checkCollisions = true;
  if (physics) {
    box.physicsImpostor = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0 }, scene);
  }
  return box;
}

let highestY = 0;
for (let x = 0; x < 32; x++) {
  for (let z = 0; z < 32; z++) {
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
      createBlock(x, y, z, type, true);
    }
    createBlock(x, -1, z, "bedrock", true);
  }
}

camera.position = new BABYLON.Vector3(16, highestY + 5, 16);

const inputMap = {};
scene.actionManager = new BABYLON.ActionManager(scene);
scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, evt => {
  inputMap[evt.sourceEvent.key.toLowerCase()] = true;
}));
scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, evt => {
  inputMap[evt.sourceEvent.key.toLowerCase()] = false;
}));

scene.onBeforeRenderObservable.add(() => {
  const forward = camera.getDirection(BABYLON.Axis.Z);
  const right = camera.getDirection(BABYLON.Axis.X);
  if (inputMap["w"]) camera.position.addInPlace(forward.scale(camera.speed));
  if (inputMap["s"]) camera.position.addInPlace(forward.scale(-camera.speed));
  if (inputMap["a"]) camera.position.addInPlace(right.scale(-camera.speed));
  if (inputMap["d"]) camera.position.addInPlace(right.scale(camera.speed));
});

scene.onPointerDown = function () {
  const pick = scene.pick(scene.pointerX, scene.pointerY);
  if (pick.hit) {
    const normal = pick.getNormal(true);
    const pos = pick.pickedPoint.add(normal);
    const x = Math.floor(pos.x + 0.5);
    const y = Math.floor(pos.y + 0.5);
    const z = Math.floor(pos.z + 0.5);
    createBlock(x, y, z, selectedBlock, true);
  }
};

engine.runRenderLoop(() => {
  scene.render();
});
window.addEventListener("resize", () => {
  engine.resize();
});
