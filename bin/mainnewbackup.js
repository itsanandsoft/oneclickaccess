const {app,Menu,ipcMain, BrowserWindow,globalShortcut,screen,clipboard,Tray,Notification } = require('electron')
const config = require('../config/app');
const path = require('path')
const SQLiteHelper = require('../database/SQLiteHelper');
const createMacAddressFiles = require('../assets/js/macadd-handler');
const db = new SQLiteHelper();
const fs = require('fs');
const https = require(`${config.protocol}`);
const {keyboard,Key,mouse,Point} = require("@nut-tree/nut-js");
const { exec } = require('child_process');

let tray = null
let x,y = null;
let mainWindow = null;
let menu = null;
let notification = null;

menu_template = [
  {
    label: 'I\'m working on OneClickAccess with Electron JS',
    click() {
        clipboard.writeText('I\'m working on OneClickAccess with Electron JS')
        mouse.setPosition(new Point(x,y));
        mouse.leftClick();
        if (process.platform === 'darwin') {
          exec('osascript -e \'tell application "System Events" to keystroke "v" using command down\'');
        } else if (process.platform === 'win32') {
          keyboard.pressKey(Key.LeftControl, Key.V);
          keyboard.releaseKey(Key.LeftControl, Key.V);
        }
        // mainWindow.hide()
    }
  }
];
createMacAddressFiles();

app.setName(config.app_name);
app.whenReady().then(() => {

  createWindow();
  const shortcut = globalShortcut.register('CommandOrControl+Q', () => {
    x = screen.getCursorScreenPoint().x;
    y = screen.getCursorScreenPoint().y;
    console.log(x+" "+y)
    createMenuWindow(x+10,y);
  });

  if (!shortcut) { console.log('Registration failed.'); }

});



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
              if(json.body.machines[key].active == '1'){
                win.loadFile(path.join(__dirname, '/index.html'));
              }
              else{
                win.loadFile(path.join(__dirname, '/renderer/pages/login/login.html'));
              }
            }
            else{
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
  mainWindow = new BrowserWindow({
    width: 1000,
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
  });

  // mainWindow.removeMenu(true);
  mainWindow.webContents.openDevTools();
  mainWindow.loadFile(path.join(__dirname, '/index.html'));
  // db.selectFromTable(process.env.USER_TABLE, '', (data, err) => {
  //   if (err) {
  //     console.log(err)
  //   }
  //   if (data.length > 0) {
  //     data = data[0];
  //     checkMachines(data, mainWindow);
  //   }
  //   else {
  //     mainWindow.loadFile(path.join(__dirname, '/renderer/pages/login/login.html'));
  //   }
  // });

  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow.hide();
    tray = new Tray(path.join(__dirname, 'assets/img/logo.png'));
    tray.on('click', () => {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    });
    notification = new Notification({
      title: config.app_name,
      body: 'Click on tray icon to maximize',
      icon: path.join(__dirname, 'assets/img/logo.png'),
      silent: false,
      timeoutType: 'default'
    });
    notification.show();
  });

}

function createMenuWindow (x,y) {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
      let menuWindow = new BrowserWindow({
          width: width,
          height: height,
          frame:false,
          transparent: true,
          
         
          webPreferences: {
              nodeIntegration: true,
              contextIsolation: false,
              enableRemoteModule: true,
          }
      })
      // x: x,
      // y: y,
      menuWindow.removeMenu(true);
      // Set the background color to transparent
      menuWindow.setBackgroundColor('#00000000');

      // Set the CSS to allow pointer events on children
      menuWindow.webContents.insertCSS(`
        body {
          pointer-events: none;
        }
        
        * {
          pointer-events: auto;
        }
      `);
      menu = Menu.buildFromTemplate(menu_template);
      win.setMenu(menu);
      win.loadFile(path.join(__dirname, '/menu.html'));
      
      win.on('close', (event) => {
          event.preventDefault();
          win.hide()
      });
            // Set the position of the context menu window to the top of the screen
            win.on('blur', () => {
          // Hide the context menu window when it loses focus
          win.hide()
        })

        ipcMain.on('showContextMenu', () => {
          // Show the context menu window when requested from the renderer process
          win.show()
        })

        ipcMain.on('contextMenuSelection', (event, option) => {
          // Handle the selected context menu option
          console.log(`Selected option: ${option}`)
          // You can perform any desired action here
        })

        // menuWindow.webContents.on('click', (event, targetElement) => {
        //   console.log(`Clicked`)
        //   // Exclude clicks on a div with id "exclude-me" or its descendants
        //   // const excludeMe = document.getElementById('exclude-me');
        //   // if (excludeMe.contains(targetElement)) {
        //   //   return;
        //   // }
        
        //   // Your code here
        //   //menuWindow.hide()
        // });
        console.log('run');
        menuWindow.once('ready-to-show', () => {
          console.log('Clicked');
        })
        
        
        menuWindow.webContents.on('did-finish-load', () => {
          console.log('load');
          menuWindow.webContents.on('click', (event, targetElement) => {
            console.log('Clicked');
          });
        });
      
      menuWindow.webContents.openDevTools()
}

app.on('activate', () => {
  if (mainWindow === null){
    createWindow();
  } 
  else
  {
    mainWindow.show();
    if(tray != null){
      tray.destroy();
    }
  }
});

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