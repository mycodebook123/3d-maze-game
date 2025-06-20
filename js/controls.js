// =====================================================================
// PLAYER AND CAMERA CONTROLS
// =====================================================================

/**
 * Sets up PointerLockControls for first-person and OrbitControls for third-person views.
 * @param {THREE.Camera} camera - The Three.js camera.
 * @param {THREE.WebGLRenderer} renderer - The Three.js renderer.
 * @param {THREE.PointerLockControls} pointerLockControlsRef - Reference to the global pointerControls variable.
 * @param {THREE.OrbitControls} orbitControlsRef - Reference to the global orbitControls variable.
 * @param {object} player - The player object with position.
 * @param {string} initialCameraMode - The initial camera mode ('first-person' or 'third-person').
 */
function setupControls(
  camera,
  renderer,
  pointerLockControlsRef,
  orbitControlsRef,
  player,
  initialCameraMode
) {
  // Initialize PointerLockControls
  pointerControls = new THREE.PointerLockControls(camera, document.body);
  // Directly modify the global pointerControls variable
  pointerLockControlsRef = pointerControls;
  scene.add(pointerControls.getObject());

  // Initialize OrbitControls
  orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
  // Directly modify the global orbitControls variable
  orbitControlsRef = orbitControls;
  orbitControls.enabled = initialCameraMode === "third-person";
  orbitControls.enablePan = false;
  orbitControls.enableZoom = false;
  orbitControls.target.copy(player.position); // Target the player's position
  orbitControls.update();

  // Event listener for PointerLockControls lock/unlock (UI overlay management)
  pointerControls.addEventListener("lock", () => {
    document.getElementById("overlay").classList.add("hidden");
  });
  pointerControls.addEventListener("unlock", () => {
    document.getElementById("overlay").classList.remove("hidden");
  });
}

/**
 * Toggles between first-person (PointerLockControls) and third-person (OrbitControls) camera modes.
 * This function modifies global variables cameraMode, pointerControls, orbitControls, camera, player.
 */
function toggleCameraMode() {
  if (cameraMode === "first-person") {
    cameraMode = "third-person";
    pointerControls.unlock();
    orbitControls.enabled = true;
    // Position camera for third-person view relative to player
    camera.position.set(
      player.position.x,
      player.position.y + 5,
      player.position.z + 5
    );
    orbitControls.target.copy(player.position);
    orbitControls.update();
  } else {
    cameraMode = "first-person";
    orbitControls.enabled = false;
    pointerControls.lock();
    camera.position.copy(player.position); // Reset camera to player's position
  }
}

/**
 * Adds all necessary event listeners for keyboard, window resize, and mobile controls.
 * @param {object} player - The player object.
 * @param {THREE.PointerLockControls} pointerControls - The PointerLockControls instance.
 * @param {THREE.OrbitControls} orbitControls - The OrbitControls instance.
 * @param {THREE.Camera} camera - The Three.js camera.
 * @param {number} mazeSize - The size of the maze.
 * @param {number} cellSize - The size of a maze cell.
 * @param {boolean} joystickLeftActiveRef - Reference to global joystickLeftActive.
 * @param {boolean} joystickRightActiveRef - Reference to global joystickRightActive.
 * @param {object} joystickLeftValueRef - Reference to global joystickLeftValue.
 * @param {object} joystickRightValueRef - Reference to global joystickRightValue.
 * @param {object} keysRef - Reference to global keys object.
 * @param {function} toggleCameraModeFn - Reference to the toggleCameraMode function.
 * @param {function} onWindowResizeFn - Reference to the onWindowResize function.
 * @param {function} handleJoystickMoveFn - Reference to the handleJoystickMove function.
 */
function addEventListeners(
  player,
  pointerControls,
  orbitControls,
  camera,
  mazeSize,
  cellSize,
  joystickLeftActiveRef,
  joystickRightActiveRef,
  joystickLeftValueRef,
  joystickRightValueRef,
  keysRef,
  toggleCameraModeFn,
  onWindowResizeFn,
  handleJoystickMoveFn
) {
  // Keyboard events for movement and camera toggle
  document.addEventListener("keydown", (e) => {
    keysRef[e.key.toLowerCase()] = true;
    if (e.key.toLowerCase() === "c") {
      toggleCameraModeFn();
    }
    if (e.key.toLowerCase() === "r") {
      window.location.reload(); // Reload page to restart game
    }
  });
  document.addEventListener("keyup", (e) => {
    keysRef[e.key.toLowerCase()] = false;
  });

  // Window resize handler
  window.addEventListener("resize", onWindowResizeFn, false);

  // Start button click handler
  document.getElementById("start-button").addEventListener("click", () => {
    // Ensure player starts at a path cell (e.g., center)
    player.position.set(
      (Math.floor(mazeSize / 2) - mazeSize / 2 + 0.5) * cellSize,
      1.6,
      (Math.floor(mazeSize / 2) - mazeSize / 2 + 0.5) * cellSize
    );
    pointerControls.lock(); // Lock mouse to start game
  });

  // Mobile Joystick Controls
  const joystickLeft = document.getElementById("joystick-left");
  const joystickRight = document.getElementById("joystick-right");
  const joystickLeftStick = joystickLeft.querySelector(".joystick-stick");
  const joystickRightStick = joystickRight.querySelector(".joystick-stick");
  const joystickRadius = joystickLeft.offsetWidth / 2; // Radius of the joystick area

  joystickLeft.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault(); // Prevent scrolling/zooming
      joystickLeftActive = true; // Use global variable here
      handleJoystickMoveFn(
        e.touches[0],
        "left",
        joystickLeft,
        joystickLeftStick,
        joystickRadius,
        joystickLeftValueRef
      );
    },
    { passive: false }
  );
  joystickLeft.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault(); // Prevent scrolling/zooming
      if (joystickLeftActive) {
        // Use global variable here
        handleJoystickMoveFn(
          e.touches[0],
          "left",
          joystickLeft,
          joystickLeftStick,
          joystickRadius,
          joystickLeftValueRef
        );
      }
    },
    { passive: false }
  );
  joystickLeft.addEventListener("touchend", () => {
    joystickLeftActive = false; // Use global variable here
    joystickLeftValueRef.x = 0; // Reset global value
    joystickLeftValueRef.y = 0; // Reset global value
    joystickLeftStick.style.transform = `translate(0px, 0px)`; // Reset stick position
  });

  joystickRight.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      joystickRightActive = true; // Use global variable here
      handleJoystickMoveFn(
        e.touches[0],
        "right",
        joystickRight,
        joystickRightStick,
        joystickRadius,
        joystickRightValueRef
      );
    },
    { passive: false }
  );
  joystickRight.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
      if (joystickRightActive) {
        // Use global variable here
        handleJoystickMoveFn(
          e.touches[0],
          "right",
          joystickRight,
          joystickRightStick,
          joystickRadius,
          joystickRightValueRef
        );
      }
    },
    { passive: false }
  );
  joystickRight.addEventListener("touchend", () => {
    joystickRightActive = false; // Use global variable here
    joystickRightValueRef.x = 0; // Reset global value
    joystickRightValueRef.y = 0; // Reset global value
    joystickRightStick.style.transform = `translate(0px, 0px)`; // Reset stick position
  });
}

/**
 * Handles touch movement for joysticks, updates joystick value and stick visual.
 * This function modifies the provided joystickValue object.
 * @param {Touch} touch - The touch object.
 * @param {string} type - 'left' or 'right' joystick (unused in this function, but kept for context).
 * @param {HTMLElement} joystickElement - The base joystick HTML element (unused in this function).
 * @param {HTMLElement} joystickStickElement - The inner joystick stick HTML element.
 * @param {number} radius - The radius of the joystick area.
 * @param {object} joystickValue - The object (joystickLeftValue or joystickRightValue) to update.
 */
function handleJoystickMove(
  touch,
  type,
  joystickElement,
  joystickStickElement,
  radius,
  joystickValue
) {
  const rect = joystickElement.getBoundingClientRect();
  const centerX = rect.left + radius;
  const centerY = rect.top + radius;

  let x = touch.clientX - centerX;
  let y = touch.clientY - centerY;

  // Clamp position within the joystick boundary
  const distance = Math.sqrt(x * x + y * y);
  if (distance > radius) {
    x /= distance;
    y /= distance;
    x *= radius;
    y *= radius;
  }

  // Update stick visual
  joystickStickElement.style.transform = `translate(${x}px, ${y}px)`;

  // Normalize values to -1 to 1 range
  joystickValue.x = x / radius;
  joystickValue.y = y / radius;
}

/**
 * Handles window resizing to adjust camera aspect ratio and renderer size.
 * This function modifies global variables camera and renderer.
 */
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
