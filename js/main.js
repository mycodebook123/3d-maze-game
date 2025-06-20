// =====================================================================
// GLOBAL GAME VARIABLES
// =====================================================================
// Scene, camera, renderer (will be initialized in initGame)
let scene, camera, renderer;

// Camera controls (initialized in setupControls)
let pointerControls, orbitControls;
let cameraMode = "first-person"; // 'first-person' or 'third-person'

// Player state
const player = {
  position: new THREE.Vector3(0, 1.6, 0), // Initial player height
  direction: new THREE.Vector3(),
  velocity: new THREE.Vector3(),
  speed: 0.15, // Player movement speed
};

// Maze properties (Constants used across multiple files)
const MAZE_SIZE = 15; // 15x15 maze grid (must be odd for recursive backtracking)
const WALL_HEIGHT = 2;
const CELL_SIZE = 1; // Size of one maze cell (both wall and path segments)

// Maze data (populated by generateMaze)
const maze = []; // 2D array representing the maze (1=wall, 0=path, 2=exit)
let exitPosition = new THREE.Vector3(); // Stores the world coordinates of the exit

// Input states (managed by controls.js, but global for animate loop)
const keys = {}; // Keyboard state
let joystickLeftActive = false;
let joystickRightActive = false;
let joystickLeftValue = { x: 0, y: 0 }; // Values for movement
let joystickRightValue = { x: 0, y: 0 }; // Values for camera rotation

// Minimap canvas and context (declared globally for accessibility)
const minimapCanvas = document.createElement("canvas");
minimapCanvas.width = MAZE_SIZE * 10; // Each cell 10x10 pixels on minimap
minimapCanvas.height = MAZE_SIZE * 10;
const minimapCtx = minimapCanvas.getContext("2d");

// =====================================================================
// GAME INITIALIZATION
// =====================================================================

/**
 * Initializes the Three.js scene, camera, renderer, and game objects.
 * This is the main entry point for starting the game.
 */
function initGame() {
  // 1. Scene Setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb); // Light blue sky background
  scene.fog = new THREE.Fog(0x87ceeb, 1, MAZE_SIZE * CELL_SIZE * 0.7); // Add fog for atmosphere

  // 2. Camera Setup
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.copy(player.position); // Initialize camera at player position

  // 3. Renderer Setup
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio); // Handle high DPI screens
  renderer.shadowMap.enabled = true; // Enable shadow mapping
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
  document.body.appendChild(renderer.domElement);

  // 4. Add Lighting to the scene
  addLighting(scene, MAZE_SIZE, CELL_SIZE);

  // 5. Generate Maze data and create 3D objects
  generateMaze(
    MAZE_SIZE,
    maze,
    exitPosition,
    Math.floor(MAZE_SIZE / 2),
    Math.floor(MAZE_SIZE / 2)
  );
  createMazeObjects(scene, maze, MAZE_SIZE, WALL_HEIGHT, CELL_SIZE);

  // 6. Setup Camera Controls
  setupControls(
    camera,
    renderer,
    pointerControls,
    orbitControls,
    player,
    cameraMode
  );
  // Set initial camera position for first-person mode
  pointerControls.getObject().position.copy(player.position);

  // 7. Initialize Minimap
  setupMinimap(minimapCanvas, minimapCtx);

  // 8. Attach all Event Listeners for input and window changes
  addEventListeners(
    player,
    pointerControls,
    orbitControls,
    camera,
    MAZE_SIZE,
    CELL_SIZE,
    joystickLeftActive,
    joystickRightActive,
    joystickLeftValue,
    joystickRightValue,
    keys,
    toggleCameraMode, // Pass function reference
    onWindowResize, // Pass function reference
    handleJoystickMove // Pass function reference
  );

  // 9. Start the main game loop
  animate();
}

// =====================================================================
// GAME LOOP (ANIMATION)
// =====================================================================

/**
 * The main animation loop of the game. Updates game state and renders the scene.
 */
function animate() {
  requestAnimationFrame(animate);

  // Only update player movement if pointer controls are locked (first-person) or orbit controls are enabled (third-person)
  if (pointerControls.isLocked || orbitControls.enabled) {
    const delta = 1 / 60; // Assuming 60 FPS for consistent movement

    // Apply friction/damping to velocity
    player.velocity.x -= player.velocity.x * 10.0 * delta;
    player.velocity.z -= player.velocity.z * 10.0 * delta;

    // Determine movement direction based on keys or left joystick
    player.direction.z = 0;
    player.direction.x = 0;

    if (cameraMode === "first-person") {
      if (keys["w"] || joystickLeftValue.y < -0.5) player.direction.z -= 1;
      if (keys["s"] || joystickLeftValue.y > 0.5) player.direction.z += 1;
      if (keys["a"] || joystickLeftValue.x < -0.5) player.direction.x -= 1;
      if (keys["d"] || joystickLeftValue.x > 0.5) player.direction.x += 1;

      // Apply rotation from right joystick
      if (joystickRightActive && Math.abs(joystickRightValue.x) > 0.1) {
        // Rotate PointerLockControls object directly
        pointerControls.getObject().rotation.y -= joystickRightValue.x * 0.05;
      }
    } else {
      // In third-person, movement is relative to camera's current view
      // For simplicity, we can let orbitControls handle camera movement or keep player stationary.
      // For this game, player movement is based on camera direction even in 3rd person.
      if (keys["w"]) player.direction.z -= 1;
      if (keys["s"]) player.direction.z += 1;
      if (keys["a"]) player.direction.x -= 1;
      if (keys["d"]) player.direction.x += 1;
    }

    // Normalize direction vector to ensure consistent speed
    player.direction.normalize();

    // Convert local direction to world direction
    const worldDirection = new THREE.Vector3();
    if (cameraMode === "first-person") {
      pointerControls.getDirection(worldDirection); // Get camera's forward direction
    } else {
      camera.getWorldDirection(worldDirection); // Get camera's forward direction in 3rd person
    }
    worldDirection.y = 0; // Ignore vertical component for horizontal movement
    worldDirection.normalize();

    const rightDirection = new THREE.Vector3()
      .crossVectors(camera.up, worldDirection)
      .normalize();

    // Apply movement based on normalized direction and speed
    if (player.direction.z !== 0) {
      player.velocity.addScaledVector(
        worldDirection,
        player.direction.z * player.speed * -1
      );
    }
    if (player.direction.x !== 0) {
      player.velocity.addScaledVector(
        rightDirection,
        player.direction.x * player.speed * -1
      );
    }

    const newPos = player.position.clone().add(player.velocity);

    // Collision detection (uses global maze and showMessageBox)
    if (
      !checkCollision(newPos, maze, MAZE_SIZE, showMessageBox, pointerControls)
    ) {
      player.position.copy(newPos);
    } else {
      // If collision, try moving only in one axis (slide along wall)
      const newPosX = player.position.clone();
      newPosX.x += player.velocity.x;
      if (
        !checkCollision(
          newPosX,
          maze,
          MAZE_SIZE,
          showMessageBox,
          pointerControls
        )
      ) {
        player.position.copy(newPosX);
      } else {
        const newPosZ = player.position.clone();
        newPosZ.z += player.velocity.z;
        if (
          !checkCollision(
            newPosZ,
            maze,
            MAZE_SIZE,
            showMessageBox,
            pointerControls
          )
        ) {
          player.position.copy(newPosZ);
        } else {
          // Stop if movement in both axes causes collision
          player.velocity.set(0, 0, 0);
        }
      }
    }

    // Update camera position based on player position
    if (cameraMode === "first-person") {
      pointerControls.getObject().position.copy(player.position);
    } else {
      // Keep OrbitControls centered on player
      orbitControls.target.copy(player.position);
      orbitControls.update();
    }

    // Update minimap every frame
    updateMinimap(player, maze, MAZE_SIZE, minimapCtx, minimapCanvas);
  }

  renderer.render(scene, camera);
}

// =====================================================================
// START THE GAME
// =====================================================================
window.onload = initGame; // Initialize game when window loads
