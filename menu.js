const $ = require('jquery');
const { remote, ipcRenderer } = require("electron");
const contextMenu = require('./node_modules/jquery-contextmenu/dist/jquery.contextMenu.min.js');
const path = require('path')
// // Listen for the global shortcut keypress
// document.addEventListener('keydown', (event) => {
//   if (event.key === 'c' && event.ctrlKey && event.shiftKey) {
//     // When the shortcut is triggered, send a message to the main process to show the context menu
//     ipcRenderer.send('showContextMenu')
//   }
// })

// // Create the context menu using jQuery-contextMenu
// $.contextMenu({
//   selector: '.context-menu-selector',
//   callback: (key, options) => {
//     // When a context menu option is selected, send a message to the main process with the selected option
//     ipcRenderer.send('contextMenuSelection', key)
//   },
//   items: {
//     option1: { name: 'Option 1' },
//     option2: { name: 'Option 2' }
//   }
// })

// document.getElementById('menu-btn').addEventListener("click", e => {
//     ipcRenderer.send(`display-app-menu`, { x:e.x,y:e.y });
// })
// document.getElementById('cancle-btn').addEventListener("click", e => {
//     ipcRenderer.send(`closeapp`, { x:e.x,y:e.y });
// })

// $(function() {
  
// });

$(function() {
  
  var filePath = path.join(__dirname, 'tree-data.json');
  $.ajax({
      type: "GET",
      dataType: 'json',
      async: false,
      url: filePath,
      success: function(data) {
        loadContextMenu(fancyTreeToContextMenu(data));
      },
      error: function() {
          alert("Error while Reloading!");
      }
  });   
});


function loadContextMenu(contextMenuData)
{
  $.contextMenu({
    selector: '.context-menu-one', 
    callback: function(key, options) {
        var m = "clicked: " + key;
        window.console && console.log(m) || alert(m); 
    },
    items: contextMenuData
    
});

$('.context-menu-one').on('click', function(e){
    console.log('clicked', this);
})    
var $trigger = $('.context-menu-one');
$trigger.contextMenu();
//alert("Loaded Successfully!");

}


function fancyTreeToContextMenu(fancyTreeData) {
  const contextMenuData = {};

  fancyTreeData.forEach((node) => {
    const { key, title, children } = node;

    if (children) {
      // Create sub-group
      const subGroup = {
        name: title,
        items: {},
      };

      children.forEach((child) => {
        subGroup.items[child.key] = {
          name: child.title,
        };
      });

      contextMenuData[`name${key}`] = subGroup;
    } else {
      contextMenuData[`key${key}`] = {
        name: title,
      };
    }
  });

  return contextMenuData;
}


function convertToContextMenuData(nodes) {
  return nodes.map(function(node) {
    return {
      "name": node.title,
      "icon": node.icon || false,
      "disabled": !node.selectable,
      "callback": function(key, options) {
        // Handle menu item click here
        console.log("Clicked item " + key + " for node " + node.title);
      }
    };
  });
}