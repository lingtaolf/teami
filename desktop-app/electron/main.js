const path = require('node:path');
const fs = require('node:fs');
const { app, BrowserWindow, shell, nativeTheme, ipcMain } = require('electron');
const Database = require('better-sqlite3');

const isMac = process.platform === 'darwin';
const isDev = !app.isPackaged;
const MAX_WORKSPACES = 5;

let mainWindow;
let db;

if (!isDev) {
  // Disable GPU color space override for consistent palette in production.
  nativeTheme.themeSource = 'light';
}

function resolveDatabasePath() {
  const userDataPath = app.getPath('userData');
  fs.mkdirSync(userDataPath, { recursive: true });
  return path.join(userDataPath, 'teami.sqlite');
}

function initializeDatabase() {
  const dbPath = resolveDatabasePath();
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.prepare(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      create_time TEXT NOT NULL,
      last_open_time TEXT NOT NULL
    )
  `).run();
}

function listWorkspaces() {
  const stmt = db.prepare(`
    SELECT id, name, description, create_time, last_open_time
    FROM workspaces
    ORDER BY last_open_time IS NULL, last_open_time DESC, create_time DESC
  `);
  return stmt.all();
}

function registerWorkspaceHandlers() {
  ipcMain.handle('workspaces:list', () => {
    return listWorkspaces();
  });

  ipcMain.handle('workspaces:create', (_event, payload) => {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid workspace payload');
    }

    const name = String(payload.name ?? '').trim();
    const description = String(payload.description ?? '').trim();

    if (!name) {
      throw new Error('Workspace name is required');
    }

    const { count } = db.prepare('SELECT COUNT(*) as count FROM workspaces').get();
    if (count >= MAX_WORKSPACES) {
      throw new Error('Workspace limit reached (5)');
    }

    const now = new Date().toISOString();
    const insert = db.prepare(`
      INSERT INTO workspaces (name, description, create_time, last_open_time)
      VALUES (?, ?, ?, ?)
    `);
    const result = insert.run(name, description, now, now);

    return db.prepare(`
      SELECT id, name, description, create_time, last_open_time
      FROM workspaces
      WHERE id = ?
    `).get(result.lastInsertRowid);
  });

  ipcMain.handle('workspaces:update-last-open', (_event, workspaceId) => {
    const id = Number(workspaceId);
    if (!Number.isInteger(id)) {
      throw new Error('Workspace id must be an integer');
    }

    const existing = db.prepare('SELECT id FROM workspaces WHERE id = ?').get(id);
    if (!existing) {
      throw new Error('Workspace not found');
    }

    const now = new Date().toISOString();
    db.prepare('UPDATE workspaces SET last_open_time = ? WHERE id = ?').run(now, id);

    return db.prepare(`
      SELECT id, name, description, create_time, last_open_time
      FROM workspaces
      WHERE id = ?
    `).get(id);
  });

  ipcMain.handle('workspaces:delete', (_event, workspaceId) => {
    const id = Number(workspaceId);
    if (!Number.isInteger(id)) {
      throw new Error('Workspace id must be an integer');
    }

    const existing = db.prepare('SELECT id FROM workspaces WHERE id = ?').get(id);
    if (!existing) {
      throw new Error('Workspace not found');
    }

    db.prepare('DELETE FROM workspaces WHERE id = ?').run(id);
    return { success: true };
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1280,
    minHeight: 800,
    backgroundColor: '#ffffff',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const devServerURL = process.env.ELECTRON_START_URL;

  if (isDev && devServerURL) {
    mainWindow.loadURL(devServerURL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    const indexHtml = path.join(__dirname, '..', 'dist', 'index.html');
    mainWindow.loadFile(indexHtml);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  initializeDatabase();
  registerWorkspaceHandlers();
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (db) {
    db.close();
  }
});
