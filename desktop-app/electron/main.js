const path = require('node:path');
const fs = require('node:fs');
const { app, BrowserWindow, shell, nativeTheme, ipcMain } = require('electron');
const Database = require('better-sqlite3');
const { WorkspaceModel, ProjectModel } = require('./database/models');
const { initializeSchema, runMigrations } = require('./database/schema');

const isMac = process.platform === 'darwin';
const isDev = !app.isPackaged;
const MAX_WORKSPACES = 5;

let mainWindow;
let db;
let workspaceModel;
let projectModel;

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
  
  // 初始化数据库结构
  initializeSchema(db);
  
  // 运行数据库迁移
  runMigrations(db);
  
  // 初始化模型
  workspaceModel = new WorkspaceModel(db);
  projectModel = new ProjectModel(db);
}


function registerWorkspaceHandlers() {
  ipcMain.handle('workspaces:list', () => {
    return workspaceModel.list();
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

    const count = workspaceModel.count();
    if (count >= MAX_WORKSPACES) {
      throw new Error('Workspace limit reached (5)');
    }

    return workspaceModel.create(name, description);
  });

  ipcMain.handle('workspaces:update', (_event, workspaceId, payload) => {
    const id = Number(workspaceId);
    if (!Number.isInteger(id)) {
      throw new Error('Workspace id must be an integer');
    }

    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid workspace payload');
    }

    const name = String(payload.name ?? '').trim();
    const description = String(payload.description ?? '').trim();

    if (!name) {
      throw new Error('Workspace name is required');
    }

    return workspaceModel.update(id, name, description);
  });

  ipcMain.handle('workspaces:update-last-open', (_event, workspaceId) => {
    const id = Number(workspaceId);
    if (!Number.isInteger(id)) {
      throw new Error('Workspace id must be an integer');
    }

    return workspaceModel.updateLastOpen(id);
  });

  ipcMain.handle('workspaces:delete', (_event, workspaceId) => {
    const id = Number(workspaceId);
    if (!Number.isInteger(id)) {
      throw new Error('Workspace id must be an integer');
    }

    return workspaceModel.delete(id);
  });
}

function registerProjectHandlers() {
  ipcMain.handle('projects:list', (_event, workspaceUuid) => {
    if (!workspaceUuid) {
      throw new Error('Workspace UUID is required');
    }
    return projectModel.list(workspaceUuid);
  });

  ipcMain.handle('projects:create', (_event, payload) => {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid project payload');
    }

    const workspaceUuid = String(payload.workspaceUuid ?? '').trim();
    const projectName = String(payload.project_name ?? '').trim();

    if (!workspaceUuid) {
      throw new Error('Workspace UUID is required');
    }
    if (!projectName) {
      throw new Error('Project name is required');
    }

    return projectModel.create({
      workspaceUuid,
      project_name: projectName,
      description: String(payload.description ?? '').trim(),
      team_uuid: String(payload.team_uuid ?? '').trim() || null,
      status: String(payload.status ?? 'READY').trim(),
      labels: payload.labels ?? [],
      progress: Number(payload.progress ?? 0)
    });
  });

  ipcMain.handle('projects:update', (_event, projectUuid, payload) => {
    if (!projectUuid) {
      throw new Error('Project UUID is required');
    }

    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid project payload');
    }

    const projectName = String(payload.project_name ?? '').trim();
    if (!projectName) {
      throw new Error('Project name is required');
    }

    return projectModel.update(projectUuid, {
      project_name: projectName,
      description: String(payload.description ?? '').trim(),
      team_uuid: String(payload.team_uuid ?? '').trim() || null,
      status: payload.status ? String(payload.status).trim() : undefined,
      labels: payload.labels,
      progress: payload.progress !== undefined ? Number(payload.progress) : undefined
    });
  });

  ipcMain.handle('projects:update-last-open', (_event, projectUuid) => {
    if (!projectUuid) {
      throw new Error('Project UUID is required');
    }

    return projectModel.updateLastOpen(projectUuid);
  });

  ipcMain.handle('projects:delete', (_event, projectUuid) => {
    if (!projectUuid) {
      throw new Error('Project UUID is required');
    }

    return projectModel.delete(projectUuid);
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
  registerProjectHandlers();
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
