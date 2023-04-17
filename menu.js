const $ = require('jquery');
const { remote, ipcRenderer } = require("electron");
const contextMenu = require('./node_modules/query-contextmenu/dist/jquery.contextMenu.min.js');

// Listen for the global shortcut keypress
document.addEventListener('keydown', (event) => {
  if (event.key === 'c' && event.ctrlKey && event.shiftKey) {
    // When the shortcut is triggered, send a message to the main process to show the context menu
    ipcRenderer.send('showContextMenu')
  }
})

// Create the context menu using jQuery-contextMenu
$.contextMenu({
  selector: '.context-menu-selector',
  callback: (key, options) => {
    // When a context menu option is selected, send a message to the main process with the selected option
    ipcRenderer.send('contextMenuSelection', key)
  },
  items: {
    option1: { name: 'Option 1' },
    option2: { name: 'Option 2' }
  }
})

document.getElementById('menu-btn').addEventListener("click", e => {
    ipcRenderer.send(`display-app-menu`, { x:e.x,y:e.y });
})
document.getElementById('cancle-btn').addEventListener("click", e => {
    ipcRenderer.send(`closeapp`, { x:e.x,y:e.y });
})