const { app, Menu, ipcMain, dialog, BrowserWindow, globalShortcut, screen, clipboard, Tray, Notification, accelerator } = require('electron')
const path = require('path')
//const CryptoJS = require('crypto-js');
const config = require(path.join(__dirname, '/config/app'));
//const SQLiteHelper = require(path.join(__dirname, '/database/SQLiteHelper'));
const createMacAddressFiles = require(path.join(__dirname, '/assets/js/macadd-handler'));
//const db = new SQLiteHelper();
const JsonHelper = require(path.join(__dirname, '/database/JsonHelper'));
const data = new JsonHelper();
const fs = require('fs');
const https = require('https');
const { keyboard, Key, mouse, Point } = require("@nut-tree/nut-js");
const { exec } = require('child_process');
const { spawn } = require('child_process');
const os = require('os');
const XLSX = require('xlsx');
const { promisify } = require('util');
const url = require('url');
const AutoLaunch = require('auto-launch');
const autoLauncher = new AutoLaunch({
  name: 'oneclickaccess',
  path: app.getPath('exe'),
});
const moment = require('moment-timezone');
const passphrase = 'ITSANSOFTnyshu55';

// Disable the security warnings
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-infobars');
app.commandLine.appendSwitch('ignore-certificate-errors');
//app.commandLine.appendSwitch('disable-web-security');

//comment on build
// const logFile = fs.createWriteStream('my-app.log', { flags: 'a' });
// console.log = (message) => {
//   logFile.write(`${new Date().toISOString()}: ${message}\n`);
// };

if (!fs.existsSync(path.join(__dirname, 'database.json'))) {
  let data = [
    {
      "users": {
      "id": "0",
      "email": "",
      "token": ""
      },
      "settings": {
      "id": "1",
      "incognito": "1",
      "timezone": "UTC-06:00",
      "contextShortCut": "CommandOrControl+Q"
      }
    }
  ];
  const updatedJson = JSON.stringify(data, null, 2);
 
  fs.writeFile(path.join(__dirname, 'database.json'), updatedJson, err => {
    if (err) throw err;
    console.log(`Setting 1 setting updated with incognito value: ${updatedJson}`);
  });
}

var prevContextRegShortcut = 'CommandOrControl+Q';
const databaseJSON= JSON.parse(fs.readFileSync(path.join(__dirname, 'database.json'), 'utf-8'));
  if (databaseJSON.length > 0) {
    if (databaseJSON[0].settings.hasOwnProperty('id')) {
      prevContextRegShortcut = databaseJSON[0].settings.contextShortCut;
    }
  }

let x, y = null;
let close = false;
let isTopmost = false;// Replace with your own password
const jsonFilePath = path.join(__dirname, '/tree-data.json');
let win, menuWindow;
let dialogWindow;
let menu = null;
let notification = null;
let tray = null
let autoLaunchEnabled = false;
let theme = 'win';
let mainHtml = 'index';
if (process.platform === 'win32') {
  theme = 'win';
  mainHtml = 'index';
} else if (process.platform === 'darwin') {
  theme = 'mac';
  mainHtml = 'index_mac';
}
const functionMap = {
  itemClicked
};




app.whenReady().then(() => {

 

  createMacAddressFiles();
  createWindow();
  initShorcutsOfTreeDataJson();
  const shortcut = globalShortcut.register(databaseJSON[0].settings.contextShortCut, () => {
    x = screen.getCursorScreenPoint().x;
    y = screen.getCursorScreenPoint().y;
    createElectronMenu(x + 10, y);
  });
  if (!shortcut) { console.log('Registration failed.'); }
});

// Functions

function initShorcutsOfTreeDataJson()
{
  var dataF = fs.readFileSync(jsonFilePath)
  itemClicked
  //const decryptedData = CryptoJS.AES.decrypt(dataF, passphrase).toString(CryptoJS.enc.Utf8);
  
  var data = JSON.parse(dataF);
  for (const rootNode of data) {
    traverseTree(rootNode);
  }
}

function traverseTree(node) {
  if (node.data && node.data.shortcutKeys) {
    const shortcutKeys = node.data.shortcutKeys;
    const title = node.title;
    globalShortcut.register(shortcutKeys, () => {
      //console.log("data-shoortcut::::"+JSON.stringify(node));
      itemClicked(node);
    });
    console.log(`Shortcut Keys: ${shortcutKeys}, Title: ${title}`);
  }

  if (node.children) {
    for (const childNode of node.children) {
      traverseTree(childNode);
    }
  }
}

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
                win.loadFile(path.join(__dirname, `/${mainHtml}.html`));
                //win.webContents.openDevTools();
              }
              else {
                win.loadFile(path.join(__dirname, `/renderer/${theme}/pages/login/login.html`));
              }
            }
            else {
              win.loadFile(path.join(__dirname, `/renderer/${theme}/pages/login/login.html`));
            }
          }
        }
        else {
          win.loadFile(path.join(__dirname, `/renderer/${theme}/pages/login/login.html`));
        }
      }
      else {
        win.loadFile(path.join(__dirname, `/renderer/${theme}/login/login.html`));
      }
    });
  }).on('error', (error) => {
    console.error(error);
    win.loadFile(path.join(__dirname, `/renderer/${theme}/pages/login/login.html`))
  });
}

function createWindow() {
  win = new BrowserWindow({
    width: 1010,
    height: 500,
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

  data.selectFromTable(process.env.USER_TABLE, '', (data, err) => {
    if (err) {
      console.log(err)
    }
    if (data.length > 0) {
      data = data[0];
      checkMachines(data, win);
    }
    else {
      //win.loadFile(path.join(__dirname, '/renderer/pages/login/login.html'));
      win.loadFile(path.join(__dirname, `/${mainHtml}.html`));

    }
  });


  //checkMachines(data, win);
  // win.loadFile(path.join(__dirname, `/${mainHtml}.html`));
  win.setAlwaysOnTop(false, 'floating');
  //comment on build
  // win.webContents.openDevTools();
  win.removeMenu(true);

  win.on('close', (event) => {
    event.preventDefault();
    closeOrMinimizeWindow(close);
    close = false;
  });

  // win.once('ready-to-show', () => {
  //       console.log('ready-to-show');
  //       const modifierKeys = accelerator.getModifierState();
  //       console.log(modifierKeys); 
  //     });
}
function closeOrMinimizeWindow(close) {
  if (!close) {
    win.hide();
    var icon = process.platform === 'win32' ? 'logo' : 'tray_mac';
    tray = new Tray(path.join(__dirname, `assets/img/${icon}.png`));
    tray.on('click', () => {
      if (win.isVisible()) {
        win.hide()
      }
      else {
        win.show();
        tray.destroy();
      }
    });
    notification = new Notification({
      title: config.app_name,
      body: 'Click on tray icon to maximize',
      icon: path.join(__dirname, 'assets/img/logo.png'),
      silent: false,
      timeoutType: 'default'
    });
    notification.show();
  }
  else {
    try {
      win.close();
    } catch (e) {

    }
  }

}

function createElectronMenu(x, y) {
  try{
    if(menuWindow){
      menuWindow.close();
    }
  }catch(e){

  }
  var dataF =  fs.readFileSync(jsonFilePath);
 // const decryptedData = CryptoJS.AES.decrypt(dataF, passphrase).toString(CryptoJS.enc.Utf8);
  
  let menu_template = fancytreeToContextmenuJson(JSON.parse(dataF));
  menuWindow = new BrowserWindow({
    width: 132,
    height: 54,
    x: x,
    y: y,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  });
  menuWindow.removeMenu(true);
  menuWindow.loadFile(path.join(__dirname, `/renderer/${theme}/pages/context_menu/menu.html`));
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
}

function itemClicked(item) {
  if(win.isVisible()){
    win.minimize();
  }
  if (item.hasOwnProperty('data')) {
    if (item.data.hasOwnProperty('type')) {
      if (item.data.type == 'text') {
        if(item.data.hasOwnProperty('isPassword'))
        {
          printTextonScreen(item.data.isPassword);
        }
        else
        {
        printTextonScreen(item.title);
        }
      }
      if (item.data.type == 'folder' || item.data.type == 'image' || item.data.type == 'file') {
        if (process.platform === 'win32') {
          exec(`start "" "${item.data.path}"`);
        } else if (process.platform === 'darwin') {
          exec(`open "${item.data.path}"`);
        } else {
          exec(`xdg-open "${item.data.path}"`);
        }
      }
      if (item.data.type == 'date') {

        fs.readFile(path.join(__dirname, 'database.json'), (err, data) => {
          if (err) throw err;
          data = JSON.parse(data);
          if(data.length>0){
            if(data[0].settings.hasOwnProperty('timezone')){
                const utc = data[0].settings.timezone.split(/[+-]/);
                const utcTime = moment.utc();
                let hoursToAdd = minutesToAdd = 0;
                if (utc[1].includes(":")){
                  const time = utc[1].split(":");
                  hoursToAdd = time[0];
                  minutesToAdd = time[1];
                }
                else{
                  hoursToAdd = utc[1];
                }
                if (/[+]/.test(data[0].settings.timezone)){
                  const updatedTime = utcTime.clone().add(hoursToAdd, 'hours').add(minutesToAdd, 'minutes');
                  const utcTimeString = updatedTime.toString();
                  printTextonScreen(utcTimeString);
                }
                else if (/[-]/.test(data[0].settings.timezone)){
                  const updatedTime = utcTime.clone().subtract(hoursToAdd, 'hours').subtract(minutesToAdd, 'minutes');
                  const utcTimeString = updatedTime.toString();
                  printTextonScreen(utcTimeString);

                }
            }
          }
        });
      }
      
    }
    else if(item.data.hasOwnProperty('isPassword'))
    {
      printTextonScreen(item.data.isPassword);
    }
    else {
      printTextonScreen(item.title);
    }
    
  }
  else {
    printTextonScreen(item.title);
  }
  if(menuWindow){
      menuWindow.close();
  }
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

function fancytreeToContextmenuJson(fancytreeJson) {
  const contextmenuJson = [];

  function convertNode(node) {
    const convertedNode = {
      label: node.title,
      //  key: node.key,
      title: node.title,
    };

    // if (node.tooltip) {
    //   convertedNode.tooltip = node.tooltip;
    // }

    // if (node.href) {
    //   convertedNode.click = () => {
    //     shell.openExternal(node.href);
    //   };
    // } else 
    if (node.children) {
      convertedNode.submenu = node.children.map(convertNode);
    } else {
      convertedNode.click = "itemClicked";
    }
    if (node.data) {
      convertedNode.data = node.data;
    }

    return convertedNode;
  }

  contextmenuJson.push(...fancytreeJson.map(convertNode));

  return contextmenuJson;
}

function isLink(text) {
  const urlPattern = /^(https?:\/\/)?([\w.-]+)\.([a-zA-Z]{2,6})(\/[\w.-]*)*\/?$/;
  const wwwUrlPattern = /^(www\.)?([\w.-]+)\.([a-zA-Z]{2,6})(\/[\w.-]*)*\/?$/;
  return urlPattern.test(text) || wwwUrlPattern.test(text);
}
function printTextonScreen(text) {
  console.log(isLink(text))
  if (isLink(text)) {
    openURLinChrome(text);
  }
  else {
    clipboard.writeText(text)
    mouse.setPosition(new Point(x, y));
    mouse.leftClick();
    if (process.platform === 'darwin') {
      exec('osascript -e \'tell application "System Events" to keystroke "v" using command down\'');
    } else if (process.platform === 'win32') {
      
      exec('powershell -Command "$wshell = New-Object -ComObject WScript.Shell; $wshell.SendKeys(\'^v\')"');
      // keyboard.pressKey(Key.LeftControl, Key.V);
      // keyboard.releaseKey(Key.LeftControl, Key.V);
    }
  }

}
function openURLinChrome(url) {
  let chromePath = '';
  let command = '';
  let incognito = '';
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'database.json'), 'utf-8'));
  if (data.length > 0) {
    if (data[0].settings.hasOwnProperty('id')) {
      if (data[0].settings.incognito == 1) {
        incognito = '--incognito';
      }
    }
  }

  if (process.platform === 'darwin') {
    chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    command = `"${chromePath}" --args --start-fullscreen "${url}"`;
  } else if (process.platform === 'win32') {
    chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    command = `"${chromePath}" --new-window ${incognito} --start-fullscreen "${url}"`;
  }

  if (command != '') {
    exec(command, (err, data) => {
      if (err) {
        if (process.platform === 'win32') {
          chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
          command = `"${chromePath}" --new-window ${incognito} --start-fullscreen "${url}"`;
          exec(command);
        }
      }
    });
  }
}

// IPC MAIN

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

ipcMain.on('close-me', (evt, arg) => {
  app.quit()
})

ipcMain.on('close-window', () => {
  close = true;
  closeOrMinimizeWindow(close);
});

// ipcMain.on('close-context-window', () => {
//   const window = remote.getCurrentWindow();
//   //window.show();
//   window.close();
// });

ipcMain.on('insertToTable', (event, args) => {
  data.insertToTable(args.tableName, args.data);
});

ipcMain.on('relaunch', (event, args) => {
  app.relaunch()
  app.exit()
});
ipcMain.on('relaunch', (event, args) => {
  app.relaunch()
  app.exit()
});

ipcMain.on('openTextEditor', (event, args) => {
  if (process.platform === 'win32') {
    exec('start notepad');
  } else if (process.platform === 'darwin') {
    exec('open -a "TextEdit"');
  }
});


ipcMain.on(`topmostToggle`, function (e, args) {
  console.log("topmostToggle event received with args: ", args);
  isTopmost = !isTopmost;
  win.setAlwaysOnTop(isTopmost, 'floating');
  console.log("win.alwaysOnTop set to ", isTopmost);
});
ipcMain.on(`startWithSystemToggle`, function (e, args) {
  console.log("startWithSystemToggle event received with args: ", args);
  isTopmost = !isTopmost;
  win.setAlwaysOnTop(isTopmost, 'floating');
  console.log("startWithSystemToggle set to ", isTopmost);
});

ipcMain.handle("showDialog", (e, d) => {
  //const encryptedData = CryptoJS.AES.encrypt(d, passphrase).toString();

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

            if(dialogWindow){
              if (!dialogWindow.isDestroyed()) {
                dialogWindow.close();
              }
            }
            console.log(`${filePath} created and data written!`);
          });
        } else {
          // File exists, write to it
          fs.truncate(filePath, 0, function (err) {
            if (err) {
              console.error(err);
              return;
            }
            if(dialogWindow){
              if (!dialogWindow.isDestroyed()) {
                dialogWindow.close();
              }
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

ipcMain.handle("showSelectiveExportDialog", (e, d) => {
  dialogWindow = new BrowserWindow({
    width: 400,
    height: 320,
    resizable: false,
    modal: true,
    show: false,
    parent: win, // mainWindow is the parent window
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  });
  dialogWindow.loadFile(path.join(__dirname, `/renderer/${theme}/pages/selective_export/export.html`));
   ///dialogWindow.webContents.openDevTools();
  
  dialogWindow.removeMenu(true);
  dialogWindow.once('ready-to-show', () => {
    dialogWindow.show();
  });

  dialogWindow.on('closed', () => {
    dialogWindow = null;
  });
});

ipcMain.handle("performSelectiveExport", (e, d) => {

});

ipcMain.handle("saveData", (e, d) => {
  //const encryptedData = CryptoJS.AES.encrypt(d, passphrase).toString();
  var filePath = path.join(__dirname, '/tree-data.json');
  

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
});


ipcMain.handle("backupDialog", (e, d) => {
  //const encryptedData = CryptoJS.AES.encrypt(d, passphrase).toString();
  const now = new Date();
  const backupFileName = `backup_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}.bin`;
  var filePath = path.join(__dirname, backupFileName);

  dialog.showSaveDialog({
    title: 'Save Backup File',
    defaultPath: filePath,
    buttonLabel: 'Save Backup',
    filters: [
      { name: 'Binary File', extensions: ['bin'] }
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
          fs.writeFile(filePath, d, { encoding: 'binary' }, (err) => {
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
            fs.writeFile(filePath, d, { encoding: 'binary' }, (err) => {
              if (err) throw err;
              console.log(`${filePath} updated with new data!`);
            });
          });
        }
      });

    }
  }).catch(err => {
    alert("Error in Save Dialog!");
    console.log(err);
  });
});


ipcMain.on(`display-app-menu`, function (e, args) {
  menu.popup({
    x: args.x,
    y: args.y
  });
});

ipcMain.on(`close-app-menu`, function (e) {
  if(menuWindow){
    menuWindow.close();
  }
  
});
// ipcMain.on(`close-export-dialog`, function (e) {
  
// });

ipcMain.handle('get-excel-data', async (event, arg) => {
  const result = await dialog.showOpenDialog({
    title: 'Select Excel file',
    filters: [
      { name: 'Excel Files', extensions: ['xlsx', 'xls'] }
    ]
  });

  // result.canceled is true if the user closes the dialog without selecting a file
  if (result.canceled) {
    throw new Error('No file selected');
  }

  const filePath = result.filePaths[0]
  // Do something with the selected file
  const workbook = XLSX.readFile(filePath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

  console.log(`Selected file: ${filePath}`);
  return data;
});




ipcMain.handle('get-file-folder', async (event, type) => {

  var typeDialog;
  if (type == "image") {
    typeDialog = {
      title: 'Select Image file',
      filters: [
        { name: 'Image Files', extensions: ['jpg', 'png', 'gif'] }
      ],
      properties: ['openFile']
    };
  }
  else if (type == "folder") {
    typeDialog = {
      title: 'Select Folder',
      properties: ['openDirectory']
    };
  }
  else {
    typeDialog = {
      title: 'Select File',
      properties: ['openFile']
    };
  }
  const result = await dialog.showOpenDialog(typeDialog);
  // result.canceled is true if the user closes the dialog without selecting a file
  if (result.canceled) {
    throw new Error('No file selected');
  }
  const filePath = result.filePaths[0];
  console.log(`Selected file: ${filePath}`);
  var pathStr = filePath.toString();
  const fileName = path.basename(filePath);
  var icon = "assets\\img\\" + type + ".png";
  return newData = { title: fileName, icon: icon, data: { type: type, path: pathStr } };
});


ipcMain.handle('edit-file-folder', async (event, path, title, type) => {
  console.log(type);
  //const defaultPath = path

  // if (fs.existsSync(defaultPath)) {

  //   var typeDialog;
  //     if(type == "image")
  //     {
  //       typeDialog = {
  //         title: 'Update Image file',
  //         filters: [
  //           { name: 'Image Files', extensions: ['jpg', 'png', 'gif'] }
  //         ],
  //         defaultPath: defaultPath,
  //         properties: ['openFile']
  //         };
  //   }
  //     else if(type == "folder")
  //     {
  //       typeDialog = {
  //         title: 'Update Folder',
  //         defaultPath: defaultPath,
  //         properties: ['openDirectory']
  //       };
  //     }
  //     else
  //     {
  //       typeDialog = {
  //         title: 'Update File',
  //         defaultPath: defaultPath,
  //         properties: ['openFile']
  //       };
  //     }
  //      const result = await dialog.showOpenDialog(typeDialog);
  //       // result.canceled is true if the user closes the dialog without selecting a file
  //       if (result.canceled) {
  //         throw new Error('No file selected');
  //       }
  //       const filePath = result.filePaths[0];
  //       console.log(`Selected file: ${filePath}`);
  //       var pathStr = filePath.toString();
  //       const fileName = path.basename(filePath);
  //       var icon = type+".png";
  //       return newData = {title: fileName,type:type,icon:icon,path:pathStr};
 
  // } else {
  //   dialog.showErrorBox('Error', 'File or Folder path does not exist. It must be deleted or moved');
  //   return newData = {title: title,type:type,icon:"error.png",path:path};

  // }
});


ipcMain.handle('import-data', async (event, arg) => {
  const readFileAsync = promisify(fs.readFile);
  const result = await dialog.showOpenDialog({
    title: 'Select a file',
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'Binary Files', extensions: ['bin'] },
    ]
  });
  if (result.canceled) {
    throw new Error('No file selected');
  }

  const filePath = result.filePaths[0];
  const fileExtension = path.extname(filePath);

  let data = null;

  if (fileExtension === '.json') {
    const fileData = await readFileAsync(filePath);
    //const decryptedData = CryptoJS.AES.decrypt(fileData, passphrase).toString(CryptoJS.enc.Utf8);
    //console.log(`Selected file: ${decryptedData}`);
    data = JSON.parse(fileData);
  } else if (fileExtension === '.bin') {
    const fileData = await readFileAsync(filePath);
    //const decryptedData = CryptoJS.AES.decrypt(fileData, passphrase).toString(CryptoJS.enc.Utf8);
    
    data = JSON.parse(fileData);

  } else {
    throw new Error('Unsupported file type');
  }

  console.log(`Selected file: ${filePath}`);
 
  return data;


});

ipcMain.handle('readDatabase', async () => {
  try {
    
      const dataFetched = await fs.promises.readFile(path.join(__dirname, 'database.json'));
      return JSON.parse(dataFetched);
    
  } catch (err) {
    throw err;
  }
});

ipcMain.handle('show-message-box', async (event, options) => {
  const response = await dialog.showMessageBox(options);
  return response.response;
});
ipcMain.on('autoLaunchToggle', (event) => {
  autoLauncher.isEnabled()
    .then((isEnabled) => {
      if (isEnabled) {
        autoLauncher.disable()
          .then(() => {
            console.log('Auto launch disabled');
            autoLaunchEnabled = false;
            event.sender.send('autoLaunchEnabled', false); // Send enabled status to renderer
          })
          .catch((error) => console.log(error));
      } else {
        autoLauncher.enable()
          .then(() => {
            console.log('Auto launch enabled');
            autoLaunchEnabled = true;
            event.sender.send('autoLaunchEnabled', true); // Send enabled status to renderer
          })
          .catch((error) => console.log(error));
      }
    })
    .catch((error) => console.log(error));
});

ipcMain.on('requestAutoLaunchStatus', (event) => {
  autoLauncher.isEnabled()
    .then((isEnabled) => {
      autoLaunchEnabled = isEnabled;
      event.sender.send('autoLaunchEnabled', isEnabled); // Send enabled status to renderer
    })
    .catch((error) => console.log(error));
});

function updateIncognitoSetting(incognitoValue) {
  fs.readFile(path.join(__dirname, 'database.json'), (err, data) => {
    if (err) throw err;
    
    data = JSON.parse(data);
    if (data.length > 0) {
      if (data[0].settings.hasOwnProperty('id')) {
        data[0].settings.incognito = incognitoValue.toString();
      }
      else {
        data[0].settings.incognito = '0';
      }
      const updatedJson = JSON.stringify(data, null, 2);
      fs.writeFile(path.join(__dirname, 'database.json'), updatedJson, err => {
        if (err) throw err;
        console.log(`Setting 1 setting updated with incognito value: ${incognitoValue}`);
      });
    }
  });
}

// function updateContextShortcutToSetting(value) {
//   fs.readFile(path.join(__dirname, 'database.json'), (err, data) => {
//     if (err) throw err;
    
//     data = JSON.parse(data);
//     if (data.length > 0) {
//       if (data[0].settings.hasOwnProperty('id')) {
//         data[0].settings.contextShortcutKeys = value.toString();
//       }
//       else {
//         data[0].settings.contextShortcutKeys = 'CommandOrControl+Q';
//       }
//       const updatedJson = JSON.stringify(data, null, 2);
//       fs.writeFile(path.join(__dirname, 'database.json'), updatedJson, err => {
//         if (err) throw err;
//         console.log(`Setting 1 setting updated with contextShortcutKeys value: ${value}`);
//       });
//     }
//   });
// }

// function updateIncognitoSetting(incognitoValue) {
//   fs.readFile('database.json', (err, data) => {
//     if (err) throw err;
//     data = JSON.parse(data);
//     if (data.length > 0) {
//       if (data[0].settings.hasOwnProperty('id')) {
//         data[0].settings.incognito = incognitoValue.toString();
//       }
//       else {
//         data[0].settings.incognito = '0';
//       }
//       const updatedJson = JSON.stringify(data, null, 2);
//       fs.writeFile('database.json', updatedJson, err => {
//         if (err) throw err;
//         console.log(`Setting 1 setting updated with incognito value: ${incognitoValue}`);
//       });
//     }
//   });
// }

ipcMain.on('incognitoToggle', (event, args) => {
  updateIncognitoSetting(args);
});



// Listen for the 'check-global-shortcut' message from the renderer process
ipcMain.handle('check-global-shortcut', (event, shortcut) => {
  const isRegistered = globalShortcut.isRegistered(shortcut);
  return isRegistered;
});

// Listen for messages from the renderer process

ipcMain.handle('register-shortcut', async (event, newShortcutKey, nodeJson) => {
  // Register a global shortcut
  const successReg = globalShortcut.register(newShortcutKey, () => {
    //console.log(JSON.stringify(nodeJson));
    itemClicked(nodeJson);
  });
  return successReg;
});

// Listen for messages from the renderer process to unregister the shortcut
ipcMain.handle('unregister-shortcut', async (event, shortcutKey) => {
  try {
    globalShortcut.unregister(shortcutKey);
    return true;
  } catch (error) {
    console.log('Error occurred while unregistering shortcut:', error);
    return false;
  }
});


ipcMain.handle('register-context-shortcut', async (event, newShortcutKey) => {
  // Register a global shortcut
  const successReg = globalShortcut.register(newShortcutKey, () => {

      x = screen.getCursorScreenPoint().x;
      y = screen.getCursorScreenPoint().y;
      createElectronMenu(x + 10, y);
  });
  if(successReg)
  {
    globalShortcut.unregister(prevContextRegShortcut);
    prevContextRegShortcut=newShortcutKey;
  }
  return successReg;
});

// ipcMain.on('unregister-shortcut', (event) => {
//   if (tempRegisteredShortcut) {
//     globalShortcut.unregister(tempRegisteredShortcut);
//     tempRegisteredShortcut = null;
//   }
// });
ipcMain.on('saveTimeZone', (event,args) => {
  fs.readFile(path.join(__dirname, 'database.json'), (err, data) => {
    if (err) throw err;
    
    data = JSON.parse(data);
    if (data.length > 0) {
      if (data[0].hasOwnProperty('settings')) {
        data[0].settings.timezone = args;
      }
      else {
        data[0].settings.timezone = 'UTC';
      }
      const updatedJson = JSON.stringify(data, null, 2);
      fs.writeFile(path.join(__dirname, 'database.json'), updatedJson, err => {
        if (err) throw err;
        console.log(`Setting 1 setting updated with timezone value: ${args}`);
      });
    }
  });
});


ipcMain.on('saveContextShortCut', (event,args) => {
  fs.readFile(path.join(__dirname, 'database.json'), (err, data) => {
    if (err) throw err;
    
    data = JSON.parse(data);
    if (data.length > 0) {
      if (data[0].hasOwnProperty('settings')) {
        data[0].settings.contextShortCut = args;
      }
      else {
        data[0].settings.contextShortCut = 'CommandOrControl+Q';
      }
      const updatedJson = JSON.stringify(data, null, 2);
      fs.writeFile(path.join(__dirname, 'database.json'), updatedJson, err => {
        if (err) throw err;
        console.log(`Setting 1 setting updated with ContextShortCut value: ${args}`);
      });
    }
  });
});


// Decrypt the encrypted JSON data
function decryptData(encryptedData) {
  //const decryptedData = CryptoJS.AES.decrypt(encryptedData, passphrase).toString(CryptoJS.enc.Utf8);
    
  return encryptedData;
}

// Read the encrypted data from the file, decrypt it, and send it to the renderer process
ipcMain.handle('getDecryptedData', (event, filePath) => {
  try {
    const encryptedData = fs.readFileSync(filePath, 'utf8');
    const decryptedData = decryptData(encryptedData);
    return decryptedData;
  } catch (error) {
    console.error('Error reading or decrypting data:', error);
    return null;
  }
});



