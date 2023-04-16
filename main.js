const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const config = require('./config/app');
const path = require('path')
const SQLiteHelper = require('./database/SQLiteHelper');
const createMacAddressFiles = require('./assets/js/macadd-handler');
const db = new SQLiteHelper();
const fs = require('fs');
const https = require(`${config.protocol}`);


app.whenReady().then(() => {
  createWindow();
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
  const win = new BrowserWindow({
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
  })

  // win.removeMenu(true);
  win.webContents.openDevTools();
  
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
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

ipcMain.on('close-window', () => {
  mainWindow.close();
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

