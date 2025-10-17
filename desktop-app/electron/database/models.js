// 数据库模型和查询方法

/**
 * 生成UUID
 */
function generateUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 工作区模型
 */
class WorkspaceModel {
  constructor(db) {
    this.db = db;
  }

  list() {
    const stmt = this.db.prepare(`
      SELECT id, workspace_uuid, name, description, create_time, last_open_time
      FROM workspaces
      ORDER BY last_open_time IS NULL, last_open_time DESC, create_time DESC
    `);
    return stmt.all();
  }

  create(name, description = '') {
    const workspaceUuid = generateUuid();
    const now = new Date().toISOString();
    const insert = this.db.prepare(`
      INSERT INTO workspaces (workspace_uuid, name, description, create_time, last_open_time)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = insert.run(workspaceUuid, name, description, now, now);

    return this.db.prepare(`
      SELECT id, workspace_uuid, name, description, create_time, last_open_time
      FROM workspaces
      WHERE id = ?
    `).get(result.lastInsertRowid);
  }

  update(id, name, description = '') {
    const existing = this.db.prepare('SELECT id FROM workspaces WHERE id = ?').get(id);
    if (!existing) {
      throw new Error('Workspace not found');
    }

    this.db.prepare(`
      UPDATE workspaces 
      SET name = ?, description = ? 
      WHERE id = ?
    `).run(name, description, id);

    return this.db.prepare(`
      SELECT id, workspace_uuid, name, description, create_time, last_open_time
      FROM workspaces
      WHERE id = ?
    `).get(id);
  }

  updateLastOpen(id) {
    const existing = this.db.prepare('SELECT id FROM workspaces WHERE id = ?').get(id);
    if (!existing) {
      throw new Error('Workspace not found');
    }

    const now = new Date().toISOString();
    this.db.prepare('UPDATE workspaces SET last_open_time = ? WHERE id = ?').run(now, id);

    return this.db.prepare(`
      SELECT id, workspace_uuid, name, description, create_time, last_open_time
      FROM workspaces
      WHERE id = ?
    `).get(id);
  }

  delete(id) {
    const existing = this.db.prepare('SELECT id FROM workspaces WHERE id = ?').get(id);
    if (!existing) {
      throw new Error('Workspace not found');
    }

    this.db.prepare('DELETE FROM workspaces WHERE id = ?').run(id);
    return { success: true };
  }

  count() {
    const { count } = this.db.prepare('SELECT COUNT(*) as count FROM workspaces').get();
    return count;
  }
}

/**
 * 项目模型
 */
class ProjectModel {
  constructor(db) {
    this.db = db;
  }

  list(workspaceUuid) {
    const stmt = this.db.prepare(`
      SELECT id, workspace_uuid, project_uuid, project_name, description, 
             create_time, last_open_time, team_uuid, status, labels, progress
      FROM projects
      WHERE workspace_uuid = ?
      ORDER BY last_open_time DESC, create_time DESC
    `);
    return stmt.all(workspaceUuid);
  }

  create(data) {
    const {
      workspaceUuid,
      project_name,
      description = '',
      team_uuid = null,
      status = 'READY',
      labels = [],
      progress = 0
    } = data;

    const projectUuid = generateUuid();
    const now = new Date().toISOString();
    const labelsJson = JSON.stringify(labels);
    
    const insert = this.db.prepare(`
      INSERT INTO projects (workspace_uuid, project_uuid, project_name, description, create_time, last_open_time, team_uuid, status, labels, progress)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = insert.run(workspaceUuid, projectUuid, project_name, description, now, now, team_uuid, status, labelsJson, progress);

    return this.db.prepare(`
      SELECT id, workspace_uuid, project_uuid, project_name, description, 
             create_time, last_open_time, team_uuid, status, labels, progress
      FROM projects
      WHERE id = ?
    `).get(result.lastInsertRowid);
  }

  update(projectUuid, data) {
    const existing = this.db.prepare('SELECT id FROM projects WHERE project_uuid = ?').get(projectUuid);
    if (!existing) {
      throw new Error('Project not found');
    }

    const {
      project_name,
      description = '',
      team_uuid = null,
      status,
      labels,
      progress
    } = data;

    // 构建动态更新语句
    const updates = ['project_name = ?', 'description = ?', 'team_uuid = ?'];
    const values = [project_name, description, team_uuid];

    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (labels !== undefined) {
      updates.push('labels = ?');
      values.push(JSON.stringify(labels));
    }
    if (progress !== undefined) {
      updates.push('progress = ?');
      values.push(progress);
    }

    values.push(projectUuid);

    this.db.prepare(`
      UPDATE projects 
      SET ${updates.join(', ')}
      WHERE project_uuid = ?
    `).run(...values);

    return this.db.prepare(`
      SELECT id, workspace_uuid, project_uuid, project_name, description, 
             create_time, last_open_time, team_uuid, status, labels, progress
      FROM projects
      WHERE project_uuid = ?
    `).get(projectUuid);
  }

  updateLastOpen(projectUuid) {
    const existing = this.db.prepare('SELECT id FROM projects WHERE project_uuid = ?').get(projectUuid);
    if (!existing) {
      throw new Error('Project not found');
    }

    const now = new Date().toISOString();
    this.db.prepare('UPDATE projects SET last_open_time = ? WHERE project_uuid = ?').run(now, projectUuid);

    return this.db.prepare(`
      SELECT id, workspace_uuid, project_uuid, project_name, description, 
             create_time, last_open_time, team_uuid, status, labels, progress
      FROM projects
      WHERE project_uuid = ?
    `).get(projectUuid);
  }

  delete(projectUuid) {
    const existing = this.db.prepare('SELECT id FROM projects WHERE project_uuid = ?').get(projectUuid);
    if (!existing) {
      throw new Error('Project not found');
    }

    this.db.prepare('DELETE FROM projects WHERE project_uuid = ?').run(projectUuid);
    return { success: true };
  }
}

module.exports = {
  WorkspaceModel,
  ProjectModel,
  generateUuid
};