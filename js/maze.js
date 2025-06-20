// =====================================================================
// MAZE GENERATION
// =====================================================================

/**
 * Populates the maze array using a recursive backtracking algorithm.
 * @param {number} mazeSize - The size of the maze grid.
 * @param {Array<Array<number>>} mazeArray - The 2D array to populate with maze data.
 * @param {THREE.Vector3} exitPosVector - Vector to store the world coordinates of the exit.
 * @param {number} startX - Initial X coordinate to start carving from.
 * @param {number} startY - Initial Y coordinate to start carving from.
 */
function generateMaze(mazeSize, mazeArray, exitPosVector, startX, startY) {
  // Initialize maze grid with walls
  for (let i = 0; i < mazeSize; i++) {
    mazeArray[i] = [];
    for (let j = 0; j < mazeSize; j++) {
      mazeArray[i][j] = 1; // 1 = wall, 0 = path, 2 = exit
    }
  }

  // Recursive backtracking implementation
  function carvePath(cx, cy) {
    mazeArray[cy][cx] = 0; // Mark current cell as path

    const directions = [
      { dx: 1, dy: 0 }, // Right
      { dx: -1, dy: 0 }, // Left
      { dx: 0, dy: 1 }, // Down
      { dx: 0, dy: -1 }, // Up
    ];
    // Shuffle directions to ensure random path generation
    for (let i = directions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [directions[i], directions[j]] = [directions[j], directions[i]];
    }

    for (const dir of directions) {
      const nx = cx + dir.dx * 2; // Next cell X (two steps away)
      const ny = cy + dir.dy * 2; // Next cell Y (two steps away)

      // Check bounds and if the next cell is a wall
      if (
        nx >= 0 &&
        nx < mazeSize &&
        ny >= 0 &&
        ny < mazeSize &&
        mazeArray[ny][nx] === 1
      ) {
        mazeArray[cy + dir.dy][cx + dir.dx] = 0; // Carve path (remove wall between current and next cell)
        carvePath(nx, ny); // Recursively carve from the next cell
      }
    }
  }

  carvePath(startX, startY); // Start carving from the specified initial cell

  // Place exit (gold block) in a random path cell (ensure it's not the start)
  let exitPlaced = false;
  while (!exitPlaced) {
    const randX = Math.floor(Math.random() * (mazeSize - 2)) + 1;
    const randY = Math.floor(Math.random() * (mazeSize - 2)) + 1;
    // Ensure exit is a path cell and not the start cell
    if (
      mazeArray[randY][randX] === 0 &&
      !(randX === startX && randY === startY)
    ) {
      mazeArray[randY][randX] = 2; // Mark as exit
      exitPosVector.set(
        (randX - mazeSize / 2 + 0.5) * CELL_SIZE, // Convert grid coord to world coord
        0, // Y position is irrelevant for horizontal grid placement
        (randY - mazeSize / 2 + 0.5) * CELL_SIZE
      );
      exitPlaced = true;
    }
  }
}

/**
 * Creates Three.js meshes for the maze walls, floor, and exit based on the generated maze array.
 * @param {THREE.Scene} scene - The Three.js scene to add objects to.
 * @param {Array<Array<number>>} mazeArray - The 2D array representing the maze.
 * @param {number} mazeSize - The size of the maze grid.
 * @param {number} wallHeight - The height of the maze walls.
 * @param {number} cellSize - The size of each maze cell.
 */
function createMazeObjects(scene, mazeArray, mazeSize, wallHeight, cellSize) {
  // Geometries
  const wallGeometry = new THREE.BoxGeometry(cellSize, wallHeight, cellSize);
  const floorGeometry = new THREE.PlaneGeometry(
    mazeSize * cellSize,
    mazeSize * cellSize
  );

  // Materials
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x555555,
    roughness: 0.8,
    metalness: 0.1,
  });

  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.9,
    metalness: 0.1,
  });

  const exitMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd700, // Gold color
    emissive: 0xffd700, // Emit light (glow)
    emissiveIntensity: 0.5,
    roughness: 0.2,
    metalness: 0.8,
  });

  // Create walls and floor segments
  for (let y = 0; y < mazeSize; y++) {
    for (let x = 0; x < mazeSize; x++) {
      const worldX = (x - mazeSize / 2 + 0.5) * cellSize;
      const worldZ = (y - mazeSize / 2 + 0.5) * cellSize;

      if (mazeArray[y][x] === 1) {
        // Wall
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(worldX, wallHeight / 2, worldZ);
        wall.castShadow = true;
        wall.receiveShadow = true;
        scene.add(wall);
      } else if (mazeArray[y][x] === 2) {
        // Exit (Gold block)
        const exit = new THREE.Mesh(wallGeometry, exitMaterial);
        exit.position.set(worldX, wallHeight / 2, worldZ);
        exit.castShadow = true;
        exit.receiveShadow = true;
        scene.add(exit);
      }
    }
  }

  // Create a single large floor plane for the entire maze
  const mainFloor = new THREE.Mesh(floorGeometry, floorMaterial);
  mainFloor.rotation.x = -Math.PI / 2; // Rotate to lie flat
  mainFloor.position.y = -0.05; // Slightly below other objects
  mainFloor.receiveShadow = true;
  scene.add(mainFloor);
}
