// 数据库表结构定义

/**
 * 初始化数据库表结构
 */
function initializeSchema(db) {
  // 启用WAL模式以提高并发性能
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

  // 创建索引以提高查询性能
  db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_workspaces_uuid 
    ON workspaces(workspace_uuid)
  `).run();

  db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_workspaces_last_open 
    ON workspaces(last_open_time)
  `).run();

  db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_projects_workspace_uuid 
    ON projects(workspace_uuid)
  `).run();

  db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_projects_uuid 
    ON projects(project_uuid)
  `).run();

  db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_projects_last_open 
    ON projects(last_open_time)
  `).run();
}

/**
 * 数据库迁移 - 为未来版本升级预留
 */
function runMigrations(db) {
  // 检查当前数据库版本
  let version = 0;
  try {
    const result = db.prepare('PRAGMA user_version').get();
    version = result.user_version;
  } catch (error) {
    console.error('Failed to get database version:', error);
  }

  // 运行必要的迁移
  if (version < 1) {
    // 版本1的迁移已经在initializeSchema中处理
    db.prepare('PRAGMA user_version = 1').run();
    console.log('Database migrated to version 1');
  }

  // 未来版本的迁移可以在这里添加
  // if (version < 2) {
  //   // 版本2的迁移
  //   db.prepare('PRAGMA user_version = 2').run();
  //   console.log('Database migrated to version 2');
  // }
}

module.exports = {
  initializeSchema,
  runMigrations
};