// Exposes the save-file and update-status bridge to the game page (window.NARX).
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("NARX", {
  desktop: true,
  save: (name, data) => ipcRenderer.invoke("save:write", name, data),
  load: (name) => ipcRenderer.invoke("save:read", name),
  list: () => ipcRenderer.invoke("save:list"),
  del: (name) => ipcRenderer.invoke("save:del", name),
  openFolder: () => ipcRenderer.invoke("save:folder"),
  info: () => ipcRenderer.invoke("app:info"),
  onStatus: (fn) => ipcRenderer.on("upd", (e, s) => fn(s)),
});
