const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    insertUser: (user) => ipcRenderer.invoke('insert-user', user),
    getUsers: () => ipcRenderer.invoke('get-users'),
});