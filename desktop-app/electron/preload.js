const { contextBridge, ipcRenderer } = require('electron');

const workspacesApi = {
  list: () => ipcRenderer.invoke('workspaces:list'),
  create: (payload) => ipcRenderer.invoke('workspaces:create', payload),
  updateLastOpen: (workspaceId) => ipcRenderer.invoke('workspaces:update-last-open', workspaceId),
  delete: (workspaceId) => ipcRenderer.invoke('workspaces:delete', workspaceId)
};

contextBridge.exposeInMainWorld('teamiNative', {
  version: process.versions.electron,
  workspaces: workspacesApi
});
