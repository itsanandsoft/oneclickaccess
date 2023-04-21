const { app, Menu, ipcMain, BrowserWindow, globalShortcut, screen, clipboard } = require('electron')
const config = require('./config/app');
const path = require('path')
const SQLiteHelper = require('./database/SQLiteHelper');
const createMacAddressFiles = require('./assets/js/macadd-handler');
const db = new SQLiteHelper();
const fs = require('fs');
const https = require(`${config.protocol}`);
const { keyboard, Key, mouse, Point } = require("@nut-tree/nut-js");
const { exec } = require('child_process');

let x, y = null;
const jsonFilePath = 'tree_data_2.json';
const menu_template = JSON.parse(fs.readFileSync(jsonFilePath));

let menu = null;
const functionMap = {
  menuItemClicked,
  menusubItemClicked
};


app.whenReady().then(() => {
  createWindow();
  const shortcut = globalShortcut.register('CommandOrControl+Q', () => {
    x = screen.getCursorScreenPoint().x;
    y = screen.getCursorScreenPoint().y;
    createElectronMenu(x + 10, y);
  });

  if (!shortcut) { console.log('Registration failed.'); }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

createMacAddressFiles();
let mainWindow;

function checkMachines(data, win) {
  const mac_address = fs.readFileSync('mac.txt', 'utf8');
  const hard_disk_serial = fs.readFileSync('hds.txt', 'utf8');
  const options = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + data.token,
    }
  };
  https.get(config.api_url + '/api/user/get-all-machines', options, (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });
    response.on('end', () => {
      const json = JSON.parse(data);
      if (json.status_code == 200) {
        if (json.body.machines.length > 0) {
          for (let key in json.body.machines) {
            if (json.body.machines[key].mac_address == mac_address && json.body.machines[key].hard_disk_serial == hard_disk_serial) {
              if (json.body.machines[key].active == '1') {
                win.loadFile(path.join(__dirname, '/index.html'));
              }
              else {
                win.loadFile(path.join(__dirname, '/renderer/pages/login/login.html'));
              }
            }
            else {
              win.loadFile(path.join(__dirname, '/renderer/pages/login/login.html'));
            }
          }
        }
        else {
          win.loadFile(path.join(__dirname, '/renderer/pages/login/login.html'));
        }
      }
      else {
        win.loadFile(path.join(__dirname, '/renderer/pages/login/login.html'));
      }
    });
  }).on('error', (error) => {
    console.error(error);
    win.loadFile(path.join(__dirname, '/renderer/pages/login/login.html'))
  });
}

function createWindow() {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, '/preloads.js'),
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      // webSecurity: false,
      // allowRunningInsecureContent: true,
      // allowDisplayingInsecureContent: true
    }
  })

  db.selectFromTable(process.env.USER_TABLE, '', (data, err) => {
    if (err) {
      console.log(err)
    }
    if (data.length > 0) {
      data = data[0];
      checkMachines(data, win);
    }
    else {
      win.loadFile(path.join(__dirname, '/renderer/pages/login/login.html'));
    }
  });
  // menuWindow.webContents.openDevTools();
}


function createMenuWindow(x, y) {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  let menuWindow = new BrowserWindow({
    width: 300,
    height: 100,
    x: x,
    y: y,
    frame: false,
    transparent: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  })
  menuWindow.removeMenu(true);
  menu = Menu.buildFromTemplate(menu_template);
  menu.forEach(item => {
    console.log(item)
    if (item.click) {
      item.click = () => {
        // Call the function specified in the click property
        eval(item.click)();
      };
    }
  });
  // menuWindow.setMenu(menu);
  menuWindow.loadFile(path.join(__dirname, '/menu2.html'));
  menuWindow.webContents.openDevTools()
  // Set the background color to transparent
  //menuWindow.setBackgroundColor('#00000000');

  // Set the CSS to allow pointer events on children
  // menuWindow.webContents.insertCSS(`
  //   body {
  //     pointer-events: none;
  //   }

  //   * {
  //     pointer-events: auto;
  //   }
  // `);
  // menu = Menu.buildFromTemplate(menu_template);
  // menuWindow.setMenu(menu);
  // menuWindow.loadFile(path.join(__dirname, '/menu.html'));

  // menuWindow.on('close', (event) => {
  //     event.preventDefault();
  //    // menuWindow.hide()
  // });
  //       // Set the position of the context menu window to the top of the screen
  //   menuWindow.on('blur', () => {
  //     // Hide the context menu window when it loses focus
  //     //menuWindow.hide()
  //   })

  //   // Listen for 'click' events on the document.body element
  //   menuWindow.webContents.on('click', (event, targetElement) => {
  //     // If the click happened outside of the window
  //     if (!menuWindow.getBounds().contains(event.x, event.y)) {
  //       // Close the window
  //      // menuWindow.close();
  //     }
  //   });
  //   // Listen for any input event on the window
  //   menuWindow.webContents.on('before-input-event', (event, input) => {
  //     if (input.type !== 'mouseDown') {
  //       // Close the window if the input event is not a mouse click event
  //      // menuWindow.close();
  //     }
  //   });


  //   ipcMain.on('showContextMenu', () => {
  //     // Show the context menu window when requested from the renderer process
  //     menuWindow.show()
  //   })

  //   ipcMain.on('contextMenuSelection', (event, option) => {
  //     // Handle the selected context menu option
  //     console.log(`Selected option: ${option}`)
  //     // You can perform any desired action here
  //   })

  //   // menuWindow.webContents.on('click', (event, targetElement) => {
  //   //   console.log(`Clicked`)
  //   //   // Exclude clicks on a div with id "exclude-me" or its descendants
  //   //   // const excludeMe = document.getElementById('exclude-me');
  //   //   // if (excludeMe.contains(targetElement)) {
  //   //   //   return;
  //   //   // }

  //   //   // Your code here
  //   //   //menuWindow.hide()
  //   // });
  //   console.log('run');
  //   menuWindow.once('ready-to-show', () => {
  //     console.log('Clicked1');
  //     menuWindow.webContents.on('click', (event, targetElement) => {
  //       console.log('Clicked2');
  //     });
  //   })


  //   menuWindow.webContents.on('did-finish-load', () => {
  //     console.log('load');
  //     menuWindow.webContents.on('click', (event, targetElement) => {
  //       console.log('Clicked2');
  //     });
  //   });

  // menuWindow.webContents.openDevTools()
}
function createElectronMenu(x, y) {
  let menuWindow = new BrowserWindow({
    width: 200,
    height: 200,
    x: x,
    y: y,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  });
  menuWindow.removeMenu(true);
  menu = Menu.buildFromTemplate(menu_template.map(item => {
    if (item.click && functionMap[item.click]) {
      item.click = functionMap[item.click];
    }
    if (item.submenu) {
      attachClickHandlers(item.submenu);
    }
    return item;
  }));
  // menuWindow.setMenu(menu);
  menuWindow.loadFile(path.join(__dirname, '/menu2.html'));
}


function menuItemClicked() {
  console.log('Menu Item 1 clicked!');
}

function menusubItemClicked() {
  console.log('Sub Item clicked!');
}

function attachClickHandlers(menuItems) {
  menuItems.forEach(item => {
    if (item.click && functionMap[item.click]) {
      item.click = functionMap[item.click];
    }
    if (item.submenu) {
      attachClickHandlers(item.submenu);
    }
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

ipcMain.on('close-me', (evt, arg) => {
  app.quit()
})

ipcMain.on('close-window', () => {
  mainWindow.close();
});

ipcMain.on('close-context-window', () => {
  const window = remote.getCurrentWindow();
  //window.show();
  window.close();
});

ipcMain.on('insertToTable', (event, args) => {
  db.insertToTable(args.tableName, args.data);
});

ipcMain.on('relaunch', (event, args) => {
  app.relaunch()
  app.exit()
});

ipcMain.handle("showDialog", (e, d) => {
  var filePath = path.join(__dirname, '/new_file.json');
  dialog.showSaveDialog({
    title: 'Save File',
    defaultPath: filePath,
    buttonLabel: 'Save',
    filters: [
      { name: 'JSON File', extensions: ['json'] }
      //,{ name: 'All Files', extensions: ['*'] }
    ]
  }).then(result => {
    if (!result.canceled) {
      const filePath = result.filePath;
      // Do something with the file path, e.g. write data to file
      // Check if file exists
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          // File does not exist, create it
          console.log(`${filePath} does not exist, creating...`);
          fs.writeFile(filePath, d, (err) => {
            if (err) throw err;
            console.log(`${filePath} created and data written!`);
          });
        } else {
          // File exists, write to it
          fs.truncate(filePath, 0, function (err) {
            if (err) {
              console.error(err);
              return;
            }
            console.log(`${filePath} exists, writing data...`);
            fs.writeFile(filePath, d, (err) => {
              if (err) throw err;
              console.log(`${filePath} updated with new data!`);
            });
          });
        }
      });
      // $.ajax
      // ({
      //   type: "GET",
      //   dataType : 'json',
      //   async: false,
      //   url: filePath,
      //   data: { data: d },
      //   success: function () {alert("Saved Successfully!"); },
      //   failure: function() {alert("Error while Saving!");}
      // });
    }
  }).catch(err => {
    alert("Error in Save Dialog!");
    console.log(err);
  });
  //dialog.showMessageBox(mainWindow, { message });
});

ipcMain.on(`display-app-menu`, function (e, args) {
  menu.popup({
    x: args.x,
    y: args.y
  });
});