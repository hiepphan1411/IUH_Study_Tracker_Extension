/**
 * Utility for managing loading screens during async operations
 */

let loadingWindow = null;

/**
 * Opens a loading screen while an async operation completes
 * 
 * @param {string} message - Custom loading message to display
 * @returns {Window} - Reference to the loading window
 */
export function showLoadingScreen(message = "Đang tải dữ liệu...") {
  // Close any existing loading window
  if (loadingWindow && !loadingWindow.closed) {
    loadingWindow.close();
  }
  
  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Calculate centered position for the new window
  const width = 500;
  const height = 400;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;
  
  // Open loading screen in a new window
  loadingWindow = window.open(
    `../layout/loading.html?message=${encodedMessage}`,
    "loadingScreen",
    `width=${width},height=${height},left=${left},top=${top},resizable=no`
  );
  
  return loadingWindow;
}

/**
 * Closes the loading screen if it's open
 */
export function hideLoadingScreen() {
  if (loadingWindow && !loadingWindow.closed) {
    loadingWindow.close();
    loadingWindow = null;
  }
}

/**
 * Wrapper function for async operations that need a loading screen
 * 
 * @param {Function} asyncFunction - The async function to execute
 * @param {string} loadingMessage - Message to show during loading
 * @returns {Promise<any>} - Result of the async function
 */
export async function withLoadingScreen(asyncFunction, loadingMessage = "Đang tải dữ liệu...") {
  try {
    showLoadingScreen(loadingMessage);
    const result = await asyncFunction();
    hideLoadingScreen();
    return result;
  } catch (error) {
    hideLoadingScreen();
    throw error;
  }
}
