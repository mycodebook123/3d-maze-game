// =====================================================================
// LIGHTING SETUP
// =====================================================================

/**
 * Adds ambient and directional lighting to the scene.
 * @param {THREE.Scene} scene - The Three.js scene to add lighting to.
 * @param {number} mazeSize - The size of the maze grid.
 * @param {number} cellSize - The size of each maze cell.
 */
function addLighting(scene, mazeSize, cellSize) {
  const ambientLight = new THREE.AmbientLight(0x404040, 0.7); // Soft ambient light
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Main light source
  directionalLight.position.set(mazeSize / 2, mazeSize, mazeSize / 2); // Position above and slightly to the side
  directionalLight.castShadow = true; // Enable shadows from this light

  // Configure shadow properties for better quality
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = mazeSize * cellSize * 2; // Adjust far plane based on maze size
  directionalLight.shadow.camera.left = (-mazeSize * cellSize) / 2;
  directionalLight.shadow.camera.right = (mazeSize * cellSize) / 2;
  directionalLight.shadow.camera.top = (mazeSize * cellSize) / 2;
  directionalLight.shadow.camera.bottom = (-mazeSize * cellSize) / 2;
  scene.add(directionalLight);
}
