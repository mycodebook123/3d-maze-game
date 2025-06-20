// =====================================================================
// MINIMAP LOGIC
// =====================================================================

/**
 * Sets up the minimap canvas and appends it to the minimap div.
 * @param {HTMLCanvasElement} canvas - The minimap canvas element.
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas.
 */
function setupMinimap(canvas, ctx) {
  // Ensure the minimap div exists before appending
  const minimapDiv = document.getElementById("minimap");
  if (minimapDiv) {
    minimapDiv.appendChild(canvas);
  } else {
    console.error("Minimap div not found. Cannot set up minimap.");
  }
}

/**
 * Updates the minimap to show the maze and player's current position.
 * @param {object} player - The player object with position.
 * @param {Array<Array<number>>} maze - The 2D array representing the maze.
 * @param {number} mazeSize - The size of the maze grid.
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the minimap canvas.
 * @param {HTMLCanvasElement} canvas - The minimap canvas element.
 */
function updateMinimap(player, maze, mazeSize, ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw maze walls and path
  for (let y = 0; y < mazeSize; y++) {
    for (let x = 0; x < mazeSize; x++) {
      if (maze[y][x] === 1) {
        ctx.fillStyle = "#555"; // Wall color
      } else if (maze[y][x] === 0) {
        ctx.fillStyle = "#333"; // Path color
      } else if (maze[y][x] === 2) {
        ctx.fillStyle = "gold"; // Exit color
      }
      ctx.fillRect(x * 10, y * 10, 10, 10);
    }
  }

  // Draw player on minimap
  // Convert player's world coordinates to minimap coordinates
  const playerMiniMapX = (player.position.x + mazeSize / 2 - 0.5) * 10 + 5; // Center player dot
  const playerMiniMapY = (player.position.z + mazeSize / 2 - 0.5) * 10 + 5;

  ctx.fillStyle = "red"; // Player dot color
  ctx.beginPath();
  ctx.arc(playerMiniMapX, playerMiniMapY, 4, 0, Math.PI * 2); // Player dot radius
  ctx.fill();
}
