// =====================================================================
// PLAYER COLLISION DETECTION
// =====================================================================

/**
 * Checks for collisions with maze walls and the exit.
 * @param {THREE.Vector3} newPos - The player's potential new position.
 * @param {Array<Array<number>>} maze - The 2D array representing the maze.
 * @param {number} mazeSize - The size of the maze grid.
 * @param {function} showMessageBox - Function to display UI messages.
 * @param {THREE.PointerLockControls} pointerControls - The pointer lock controls instance.
 * @returns {boolean} True if a collision occurs with a wall, false otherwise.
 */
function checkCollision(
  newPos,
  maze,
  mazeSize,
  showMessageBox,
  pointerControls
) {
  // Convert world coordinates to maze grid coordinates
  // Adjust by 0.5 * CELL_SIZE to get the center of the cell, then floor to get grid index
  const gridX = Math.floor(newPos.x + mazeSize / 2);
  const gridZ = Math.floor(newPos.z + mazeSize / 2);

  // Check if out of maze bounds
  if (gridX < 0 || gridX >= mazeSize || gridZ < 0 || gridZ >= mazeSize) {
    return true; // Collision with outer boundary
  }

  // Check if hitting a wall (maze cell type 1)
  if (maze[gridZ][gridX] === 1) {
    return true; // Collision with a wall
  }

  // Check if reached exit (maze cell type 2)
  if (maze[gridZ][gridX] === 2) {
    showMessageBox("🎉 Congratulations! You escaped the maze!");
    pointerControls.unlock(); // Unlock controls on win
    return false; // Not a physical collision, but a game event (allow passing through)
  }

  return false; // No collision
}
