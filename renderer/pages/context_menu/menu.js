const { remote, ipcRenderer } = require("electron");

document.getElementById('menu-btn').addEventListener("click", e => {
    ipcRenderer.send(`display-app-menu`, { x:e.x,y:e.y });
})
document.getElementById('cancle-btn').addEventListener("click", e => {
    ipcRenderer.send(`closeapp`, { x:e.x,y:e.y });
})