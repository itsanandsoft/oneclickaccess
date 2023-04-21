const $ = require('jquery');
const { remote, ipcRenderer } = require("electron");
const contextMenu = require('./node_modules/jquery-contextmenu/dist/jquery.contextMenu.min.js');
const path = require('path');
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

// document.addEventListener('DOMContentLoaded', function() {
//   var myDiv = document.getElementById('myDiv');
//   myDiv.style.position = 'fixed';
//   myDiv.style.left = (window.innerWidth / 2) + 'px';
//   myDiv.style.top = (window.innerHeight / 2) + 'px';
// });

 $(function() {
  const closeApp = document.getElementById('body');
  closeApp.addEventListener('click', () => {
      ipcRenderer.send('close-me')
  });
  document.body.addEventListener('click', function () {
    // Your code here
    alert("Body");
  });
  
  // Close the window when the body is clicked, unless the click
  // happened inside the context menu element
  $('body').on('click', function(event) {
    console.log("Body CLicked")
    if (!$(event.target).hasClass('context-menu-one')) {
      ipcRenderer.send('close-context-window');
    }
  });
});
$(function() {
  $('body').on('click', function(event) {
    // Close the window unless the click happened inside the context menu element
    if (!$(event.target).hasClass('context-menu-one')) {
      //ipcRenderer.send('close-context-window');
      alert("fds");
    }
  });
});

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
        'use strict';
        var errorItems = { "errorItem": { name: "Items Load error" },};
        var loadItems = function () {
            var dfd = jQuery.Deferred();
            setTimeout(function () {
                dfd.resolve(subItems);
            }, 2000);
            return dfd.promise();
        };

        var subItems = {
            "sub1": { name: "Submenu1", icon: "edit" },
            "sub2": { name: "Submenu2", icon: "cut" },
        };

        $.contextMenu({
            selector: '.context-menu-one',
            build: function ($trigger, e) {
                return {
                    callback: function (key, options) {
                      var title = options.items[key].name;
                     // console.log('Clicked:', title);
                        var m = "clicked: " + key+ " title:"+title;
                        alert(m);
                    },
                    items: contextMenuData
                };
            }
        });
        
        //normal promise usage example
        var completedPromise = function (status) {
            console.log("completed promise:", status);
        };

        var failPromise = function (status) {
            console.log("fail promise:", status);
        };

        var notifyPromise = function (status) {
            console.log("notify promise:", status);
        };
        var $trigger = $('.context-menu-one');
        $trigger.contextMenu();
        $.loadItemsAsync = function() {
            console.log("loadItemsAsync");
            var promise = loadItems();
            $.when(promise).then(completedPromise, failPromise, notifyPromise);
        };

  $.contextMenu({
    selector: '.context-menu-one', 
    callback: function(key, options) {
        var m = "clicked: " + key;
        window.console && console.log(m) || alert(m); 
    },
    items: contextMenuData
    
});

// $('.context-menu-one').on('click', function(e){
//     console.log('clicked', this);
// })    
// var $trigger = $('.context-menu-one');
// $trigger.contextMenu();
//alert("Loaded Successfully!");

}


// function fancyTreeToContextMenu(fancyTreeData) {
//   const contextMenuData = {};

//   function addNodeToMenuData(node, parentKey) {
//     const { key, title, children } = node;

//     const nodeKey = parentKey ? `${parentKey}-${key}` : `${key}`;

//     if (children) {
//       // Create sub-group
//       const subGroup = {
//         name: title,
//         items: {},
//       };

//       children.forEach((child) => {
//         addNodeToMenuData(child, nodeKey);
//         subGroup.items[child.key] = {
//           name: child.title,
//         };
//       });

//       contextMenuData[nodeKey] = subGroup;
//     } else {
//       contextMenuData[nodeKey] = {
//         name: title,
//       };
//     }
//   }

//   fancyTreeData.forEach((node) => {
//     addNodeToMenuData(node);
//   });

//   return contextMenuData;
// }


function fancyTreeToContextMenu(fancyTreeData) {
  const contextMenuData = [];
  
  function convertNode(node, contextMenuParent) {
    const contextMenuItem = {
      key: node.key,
      name: node.title,
      icon: node.icon,
    };
    
    if (node.href) {
      contextMenuItem.href = node.href;
    }
    
    if (node.extraClasses) {
      contextMenuItem.extraClasses = node.extraClasses;
    }
    
    if (node.tooltip) {
      contextMenuItem.tooltip = node.tooltip;
    }
    
    if (node.children && node.children.length > 0) {
      contextMenuItem.items = [];
      
      node.children.forEach(child => convertNode(child, contextMenuItem.items));
    }
    
    if (contextMenuParent) {
      contextMenuParent.push(contextMenuItem);
    } else {
      contextMenuData.push(contextMenuItem);
    }
  }
  
  fancyTreeData.forEach(node => convertNode(node, null));
  
  return contextMenuData;
}

// function fancyTreeToContextMenu(fancyTreeData) {
//   const contextMenuData = {};

//   fancyTreeData.forEach((node) => {
//     const { key, title, children } = node;

//     if (children) {
//       // Create sub-group
//       const subGroup = {
//         name: title,
//         items: {},
//       };

//       children.forEach((child) => {
//         subGroup.items[child.key] = {
//           name: child.title,
//         };
//       });

//       contextMenuData[`name${key}`] = subGroup;
//     } else {
//       contextMenuData[`key${key}`] = {
//         name: title,
//       };
//     }
//   });

//   return contextMenuData;
// }


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