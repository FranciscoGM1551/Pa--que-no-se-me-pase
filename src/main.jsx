const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let [mainWindow, saved] = [null, false];

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 550,
    resizable: false,
    autoHideMenuBar: true,
    icon: "./sandclock.png",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: false,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile("src/index.html");
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  mainWindow.on("close", function (e) {
    if (!saved) {
      e.preventDefault();
      saved = true;
      mainWindow.webContents.send("save");
    }
    if (process.platform !== "darwin") app.quit();
  });

  mainWindow.on("close_save", () => {
    if (process.platform !== "darwin") app.quit();
  });
});

ipcMain.on("pin_status", function (e, status) {
  mainWindow.setAlwaysOnTop(status);
});
