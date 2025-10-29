let joystickInput = { x: 0, y: 0 };
let jumpPressed = false;
let placePressed = false;

document.getElementById("jumpBtn").addEventListener("touchstart", () => {
  jumpPressed = true;
});
document.getElementById("placeBtn").addEventListener("touchstart", () => {
  placePressed = true;
});

function getMobileInput() {
  return { joystickInput, jumpPressed, placePressed };
}
