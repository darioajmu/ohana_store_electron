const { app, BrowserWindow } = require("electron");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });

  // win.loadFile("index.html");
  // and load the index.html of the app.
  win.loadURL("http://localhost:3000");

  // Emitted when the window is closed.
  win.on("closed", function () {
    railsApp.kill("SIGINT");
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  const railsApp = require('child_process').spawn('rails', ['s'])

  console.log("starting rails server... waiting 5 seconds")

  async function start() {
    const res = await fetch('http://localhost:3000')
    console.log('rails server started')
    createWindow(railsApp)
    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow(railsApp)
    })
  }

  setTimeout(() => start(), 5000)
})

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
