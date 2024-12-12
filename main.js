const activeWindow = require("active-win");
const path = require("path");
const { app, BrowserWindow, ipcMain } = require("electron");

const { showContextMenu } = require("./ui/ipc/context_menu");
const { initializeAdblocker, toggleAdblocker } = require("./ui/ipc/adblock");

let mainWindow;
let lastForegroundWindow;
let isFullScreen = false;

// Start listening for foreground window changes
setInterval(async function () {
  try {
    const window = await activeWindow();
    if (window && window.owner && window.owner.name !== lastForegroundWindow) {
      lastForegroundWindow = window.owner.name;
      console.log("Active window:", window.owner.name);
      mainWindow.webContents.send("focus-changed", window.owner.name.replace(".exe", ""));
    }
  } catch (error) {
    console.error("Error getting active window:", error);
  }
}, 1000);

// Function to create the main application window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    resizable: true,
    icon: path.join(__dirname, "./ui/graphics/icons/linkr_icon.png"),
    webPreferences: {
      webviewTag: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile("./ui/components/interface.html");

  // Handle full-screen state changes
  mainWindow.on("enter-full-screen", () => {
    isFullScreen = true;
    mainWindow.webContents.send("update-full-screen-state", isFullScreen);
  });

  mainWindow.on("leave-full-screen", () => {
    isFullScreen = false;
    mainWindow.webContents.send("update-full-screen-state", isFullScreen);
  });

  // IPC event listeners
  ipcMain.on("toggle-adblock", (event) => {
    toggleAdblocker(event);
  });

  ipcMain.on("update-window-title", (event, title) => {
    mainWindow.setTitle(`${title} — Linkr`);
  });

  ipcMain.on("show-context-menu", (event, url) => {
    showContextMenu(event, url);
  });

  ipcMain.on("start-drag", () => {
    mainWindow.webContents.startDrag({
      file: path.join(__dirname, "./ui/components/interface.html"),
      icon: path.join(__dirname, "./ui/graphics/icons/linkr_icon.png"),
    });
  });

  ipcMain.on("stop-drag", () => {
    mainWindow.webContents.stopDrag();
  });
}

// Enable sandboxing for security
app.enableSandbox();

// App event listeners
app.on("ready", async () => {
  await initializeAdblocker();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
