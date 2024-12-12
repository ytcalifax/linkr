// Import ipcRenderer from Electron
const { ipcRenderer } = window.electron;

// DOM Elements
const webview = document.getElementById("webview");
const webviewContainer = document.getElementById("webview-container");
const urlBar = document.getElementById("url-bar");
const backButton = document.getElementById("back-button");
const forwardButton = document.getElementById("forward-button");
const homeButton = document.getElementById("home-button");
const adblockButton = document.getElementById("adblock-button");
const adblockIcon = document.getElementById("adblock-icon");
const loadingOverlay = document.getElementById("loading-overlay");
const draggableHandle = document.getElementById("draggable-handle");

// State variables
let currentUrl = "https://www.startpage.com/do/mypage.pl?prfe=5b4a256e9292c704653cbb68647d7b094bcf4054ffbd4ebe9ca01df1674c5a64489291fbf0b1a6775510c2c5e70cb511d48d7efe3407648ef0118a60fdd9fd75170dd66c9ace35763c9a99c5";
let isCtrlPressed = false;
let isMouseOverHandle = false;
let isFullScreen = false;
let isDragging = false;

// Configuration object for process name to URL mapping
let processUrlMap = {};

// Fetch processUrlMap from a Gist
const fetchProcessUrlMap = async () => {
  try {
    const response = await fetch('https://raw.githubusercontent.com/ytcalifax/linkr/refs/heads/main/.data/web.json');
    if (response.ok) {
      processUrlMap = await response.json();
    } else {
      console.error('Failed to fetch processUrlMap:', response.statusText);
    }
  } catch (error) {
    console.error('Error fetching processUrlMap:', error);
  }
};

// Call the function to fetch processUrlMap
fetchProcessUrlMap();

// Utility function to extract domain from URL
const extractDomain = (url) => {
  const a = document.createElement("a");
  a.href = url;
  return `${a.protocol}//${a.hostname}/`;
};

// Function to update the URL bar with animation
const updateUrlBar = (url) => {
  urlBar.classList.add("fade-out");
  setTimeout(() => {
    urlBar.textContent = extractDomain(url);
    urlBar.classList.remove("fade-out");
    urlBar.classList.add("fade-in");
    setTimeout(() => {
      urlBar.classList.remove("fade-in");
    }, 500);
  }, 500);
};

// Inject CSS to hide scrollbars
const hideScrollbarsCSS = "::-webkit-scrollbar { display: none; !important }";
const style = document.createElement("style");
style.textContent = hideScrollbarsCSS;
webviewContainer.appendChild(style);

// Event listeners for webview
webview.addEventListener("dom-ready", () => {
  webview.insertCSS(hideScrollbarsCSS);
});

webview.addEventListener("did-start-loading", () => {
  loadingOverlay.classList.add("visible");
});

webview.addEventListener("did-stop-loading", () => {
  webview.insertCSS(hideScrollbarsCSS);
  loadingOverlay.classList.remove("visible");
});

webview.addEventListener("did-navigate", (event) => {
  currentUrl = event.url;
  updateUrlBar(event.url);
});

webview.addEventListener("page-title-updated", (event) => {
  ipcRenderer.send("update-window-title", event.title);
});

// Event listeners for navigation buttons
backButton.addEventListener("click", () => webview.goBack());
forwardButton.addEventListener("click", () => webview.goForward());
homeButton.addEventListener("click", () => webview.loadURL("https://www.startpage.com/do/mypage.pl?prfe=5b4a256e9292c704653cbb68647d7b094bcf4054ffbd4ebe9ca01df1674c5a64489291fbf0b1a6775510c2c5e70cb511d48d7efe3407648ef0118a60fdd9fd75170dd66c9ace35763c9a99c5"));

// Event listener for URL bar context menu
urlBar.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  ipcRenderer.send("show-context-menu", currentUrl);
});

// Event listener for adblock button
adblockButton.addEventListener("click", () => {
  ipcRenderer.send("toggle-adblock");
});

// IPC event listeners
ipcRenderer.on("reload-page", () => {
  webview.reload();
  webview.insertCSS(hideScrollbarsCSS);
});

ipcRenderer.on("update-adblock-icon", (enabled) => {
  adblockIcon.textContent = enabled ? "shield" : "remove_moderator";
  webview.reload(); // Reload the page to apply adblock changes immediately
});

ipcRenderer.on("toggle-devtools", () => {
  if (webview.isDevToolsOpened()) {
    webview.closeDevTools();
  } else {
    webview.openDevTools();
  }
});

ipcRenderer.on("update-full-screen-state", (fullScreen) => {
  isFullScreen = fullScreen;
  updateDraggableHandleVisibility();
});

ipcRenderer.on("focus-changed", (processName) => {
  const targetUrl = processUrlMap[processName];
  if (targetUrl && extractDomain(currentUrl) !== extractDomain(targetUrl)) {
    webview.loadURL(targetUrl);
  }
});

// Event listeners for draggable handle
window.addEventListener("keydown", (event) => {
  if (event.ctrlKey) {
    isCtrlPressed = true;
    updateDraggableHandleVisibility();
  }
});

window.addEventListener("keyup", (event) => {
  if (!event.ctrlKey) {
    isCtrlPressed = false;
    updateDraggableHandleVisibility();
  }
});

draggableHandle.addEventListener("mouseenter", () => {
  isMouseOverHandle = true;
  updateDraggableHandleVisibility();
});

draggableHandle.addEventListener("mouseleave", () => {
  isMouseOverHandle = false;
  updateDraggableHandleVisibility();
});

draggableHandle.addEventListener("mousedown", () => {
  isDragging = true;
  ipcRenderer.send("start-drag");
});

document.addEventListener("mouseup", () => {
  if (isDragging) {
    isDragging = false;
    ipcRenderer.send("stop-drag");
  }
});

// Function to update draggable handle visibility
const updateDraggableHandleVisibility = () => {
  draggableHandle.style.display = (!isFullScreen && (isCtrlPressed || isMouseOverHandle)) ? "flex" : "none";
};

// Initialize draggable handle visibility
updateDraggableHandleVisibility();
