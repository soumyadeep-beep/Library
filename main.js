const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    autoHideMenuBar: true, // Hides the top file/edit menu so it feels like software
    webPreferences: {
      nodeIntegration: false
    }
  });

  // This forces the desktop window to load your HTML file locally
  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
