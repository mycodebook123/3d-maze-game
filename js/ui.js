// =====================================================================
// UI FUNCTIONS (Overlay and Message Box)
// =====================================================================

/**
 * Displays a message box with given text.
 * @param {string} message - The message to display.
 */
function showMessageBox(message) {
  document.getElementById("message-text").innerText = message;
  document.getElementById("message-box").style.display = "block";
}

/**
 * Hides the message box.
 */
function hideMessageBox() {
  document.getElementById("message-box").style.display = "none";
}
