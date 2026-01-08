import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'node:path';

process.env.DIST = path.join(__dirname, '../dist');
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public');

let win: BrowserWindow | null;
let tray: Tray | null;
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

// Protocol registration for deep linking (e.g. hems://mission/ID)
if ((process as any).defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('hems', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('hems');
}

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC || '', 'favicon.ico'),
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    frame: false,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    backgroundColor: '#09090b',
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(process.env.DIST || '', 'index.html'));
  }

  // Prevent window from being destroyed on close to keep tray active
  win.on('close', (event: any) => {
    if (!(app as any).isQuitting) {
      event.preventDefault();
      win?.hide();
    }
  });

  autoUpdater.checkForUpdatesAndNotify();
}

function createTray() {
  const icon = nativeImage.createFromPath(path.join(process.env.VITE_PUBLIC || '', 'favicon.ico'));
  tray = new Tray(icon.resize({ width: 16, height: 16 }));
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Command Center', click: () => win?.show() },
    { label: 'Check for Updates...', click: () => autoUpdater.checkForUpdatesAndNotify() },
    { type: 'separator' },
    { label: 'Exit HEMS Bridge', click: () => {
        (app as any).isQuitting = true;
        app.quit();
    }}
  ]);

  tray.setToolTip('HEMS Tactical Bridge');
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => win?.show());
}

// Deep Link Handling
app.on('open-url', (event: any, url: string) => {
  event.preventDefault();
  win?.show();
  win?.webContents.send('deep-link', url);
});

// Windows/Linux instance check for deep links
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (_event: any, commandLine: string[]) => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
      const url = commandLine.pop();
      if (url) win.webContents.send('deep-link', url);
    }
  });
}

app.whenReady().then(() => {
    createWindow();
    createTray();
});

ipcMain.on('window-minimize', () => win?.minimize());
ipcMain.on('window-maximize', () => win?.isMaximized() ? win.unmaximize() : win?.maximize());
ipcMain.on('window-close', () => win?.hide()); // Hide to tray
ipcMain.on('restart_app', () => autoUpdater.quitAndInstall());