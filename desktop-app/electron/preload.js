const { contextBridge, ipcRenderer } = require('electron');

const workspacesApi = {
  list: () => ipcRenderer.invoke('workspaces:list'),
  create: (payload) => ipcRenderer.invoke('workspaces:create', payload),
  update: (workspaceId, payload) => ipcRenderer.invoke('workspaces:update', workspaceId, payload),
  updateLastOpen: (workspaceId) => ipcRenderer.invoke('workspaces:update-last-open', workspaceId),
  delete: (workspaceId) => ipcRenderer.invoke('workspaces:delete', workspaceId)
};

const projectsApi = {
  list: (workspaceUuid) => ipcRenderer.invoke('projects:list', workspaceUuid),
  create: (payload) => ipcRenderer.invoke('projects:create', payload),
  update: (projectUuid, payload) => ipcRenderer.invoke('projects:update', projectUuid, payload),
  updateLastOpen: (projectUuid) => ipcRenderer.invoke('projects:update-last-open', projectUuid),
  delete: (projectUuid) => ipcRenderer.invoke('projects:delete', projectUuid)
};

contextBridge.exposeInMainWorld('teamiNative', {
  version: process.versions.electron,
  workspaces: workspacesApi,
  projects: projectsApi
});
