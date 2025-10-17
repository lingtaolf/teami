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
  
  // 创建workspaces表
  db.prepare(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workspace_uuid TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      create_time TEXT NOT NULL,
      last_open_time TEXT NOT NULL
    )
  `).run();

  // 创建projects表
  db.prepare(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workspace_uuid TEXT NOT NULL,
      project_uuid TEXT NOT NULL UNIQUE,
      project_name TEXT NOT NULL,
      description TEXT,
      create_time TEXT NOT NULL,
      last_open_time TEXT NOT NULL,
      team_uuid TEXT,
      status TEXT NOT NULL DEFAULT 'READY',
      labels TEXT NOT NULL DEFAULT '[]',
      progress INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (workspace_uuid) REFERENCES workspaces(workspace_uuid)
    )
  `).run();
}

function listWorkspaces() {
  const stmt = db.prepare(`
    SELECT id, workspace_uuid, name, description, create_time, last_open_time
    FROM workspaces
    ORDER BY last_open_time IS NULL, last_open_time DESC, create_time DESC
  `);
  return stmt.all();
}

function listProjects(workspaceUuid) {
  const stmt = db.prepare(`
    SELECT id, workspace_uuid, project_uuid, project_name, description, 
           create_time, last_open_time, team_uuid, status, labels, progress
    FROM projects
    WHERE workspace_uuid = ?
    ORDER BY last_open_time DESC, create_time DESC
  `);
  return stmt.all(workspaceUuid);
}

function generateUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
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

    const workspaceUuid = generateUuid();
    const now = new Date().toISOString();
    const insert = db.prepare(`
      INSERT INTO workspaces (workspace_uuid, name, description, create_time, last_open_time)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = insert.run(workspaceUuid, name, description, now, now);

    return db.prepare(`
      SELECT id, workspace_uuid, name, description, create_time, last_open_time
      FROM workspaces
      WHERE id = ?
    `).get(result.lastInsertRowid);
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

    const existing = db.prepare('SELECT id FROM workspaces WHERE id = ?').get(id);
    if (!existing) {
      throw new Error('Workspace not found');
    }

    db.prepare(`
      UPDATE workspaces 
      SET name = ?, description = ? 
      WHERE id = ?
    `).run(name, description, id);

    return db.prepare(`
      SELECT id, workspace_uuid, name, description, create_time, last_open_time
      FROM workspaces
      WHERE id = ?
    `).get(id);
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
      SELECT id, workspace_uuid, name, description, create_time, last_open_time
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

function registerProjectHandlers() {
  ipcMain.handle('projects:list', (_event, workspaceUuid) => {
    if (!workspaceUuid) {
      throw new Error('Workspace UUID is required');
    }
    return listProjects(workspaceUuid);
  });

  ipcMain.handle('projects:create', (_event, payload) => {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid project payload');
    }

    const workspaceUuid = String(payload.workspaceUuid ?? '').trim();
    const projectName = String(payload.project_name ?? '').trim();
    const description = String(payload.description ?? '').trim();
    const teamUuid = String(payload.team_uuid ?? '').trim() || null;
    const status = String(payload.status ?? 'READY').trim();
    const labels = JSON.stringify(payload.labels ?? []);
    const progress = Number(payload.progress ?? 0);

    if (!workspaceUuid) {
      throw new Error('Workspace UUID is required');
    }
    if (!projectName) {
      throw new Error('Project name is required');
    }

    const projectUuid = generateUuid();
    const now = new Date().toISOString();
    
    const insert = db.prepare(`
      INSERT INTO projects (workspace_uuid, project_uuid, project_name, description, create_time, last_open_time, team_uuid, status, labels, progress)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = insert.run(workspaceUuid, projectUuid, projectName, description, now, now, teamUuid, status, labels, progress);

    return db.prepare(`
      SELECT id, workspace_uuid, project_uuid, project_name, description, 
             create_time, last_open_time, team_uuid, status, labels, progress
      FROM projects
      WHERE id = ?
    `).get(result.lastInsertRowid);
  });

  ipcMain.handle('projects:update', (_event, projectUuid, payload) => {
    if (!projectUuid) {
      throw new Error('Project UUID is required');
    }

    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid project payload');
    }

    const projectName = String(payload.project_name ?? '').trim();
    const description = String(payload.description ?? '').trim();
    const teamUuid = String(payload.team_uuid ?? '').trim() || null;
    const status = payload.status ? String(payload.status).trim() : undefined;
    const labels = payload.labels ? JSON.stringify(payload.labels) : undefined;
    const progress = payload.progress !== undefined ? Number(payload.progress) : undefined;

    if (!projectName) {
      throw new Error('Project name is required');
    }

    const existing = db.prepare('SELECT id FROM projects WHERE project_uuid = ?').get(projectUuid);
    if (!existing) {
      throw new Error('Project not found');
    }

    // 构建动态更新语句
    const updates = ['project_name = ?', 'description = ?', 'team_uuid = ?'];
    const values = [projectName, description, teamUuid];

    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (labels !== undefined) {
      updates.push('labels = ?');
      values.push(labels);
    }
    if (progress !== undefined) {
      updates.push('progress = ?');
      values.push(progress);
    }

    values.push(projectUuid);

    db.prepare(`
      UPDATE projects 
      SET ${updates.join(', ')}
      WHERE project_uuid = ?
    `).run(...values);

    return db.prepare(`
      SELECT id, workspace_uuid, project_uuid, project_name, description, 
             create_time, last_open_time, team_uuid, status, labels, progress
      FROM projects
      WHERE project_uuid = ?
    `).get(projectUuid);
  });

  ipcMain.handle('projects:update-last-open', (_event, projectUuid) => {
    if (!projectUuid) {
      throw new Error('Project UUID is required');
    }

    const existing = db.prepare('SELECT id FROM projects WHERE project_uuid = ?').get(projectUuid);
    if (!existing) {
      throw new Error('Project not found');
    }

    const now = new Date().toISOString();
    db.prepare('UPDATE projects SET last_open_time = ? WHERE project_uuid = ?').run(now, projectUuid);

    return db.prepare(`
      SELECT id, workspace_uuid, project_uuid, project_name, description, 
             create_time, last_open_time, team_uuid, status, labels, progress
      FROM projects
      WHERE project_uuid = ?
    `).get(projectUuid);
  });

  ipcMain.handle('projects:delete', (_event, projectUuid) => {
    if (!projectUuid) {
      throw new Error('Project UUID is required');
    }

    const existing = db.prepare('SELECT id FROM projects WHERE project_uuid = ?').get(projectUuid);
    if (!existing) {
      throw new Error('Project not found');
    }

    db.prepare('DELETE FROM projects WHERE project_uuid = ?').run(projectUuid);
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
