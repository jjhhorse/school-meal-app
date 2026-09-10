const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
  const window = new BrowserWindow({
    width: 1180,
    height: 900,
    minWidth: 780,
    minHeight: 650,
    backgroundColor: '#f5f3ef',
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });
  Menu.setApplicationMenu(null);
  window.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error(`페이지 로딩 실패 (${errorCode}): ${errorDescription} - ${validatedURL}`);
  });
  window.loadFile(path.join(__dirname, 'dist', 'index.html')).catch((error) => {
    console.error('앱 화면을 열 수 없습니다.', error);
  });
}
app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
