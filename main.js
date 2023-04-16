const { app, BrowserWindow,ipcMain,dialog  } = require('electron')
const path = require('path')
const SQLiteHelper = require('./database/SQLiteHelper');
const createMacAddressFiles = require('./assets/js/macadd-handler');
const db = new SQLiteHelper();
const fs = require('fs');

createMacAddressFiles();
let mainWindow;

function createWindow () {
  const win = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
    //   preload: path.join(__dirname, '/preloads.js'),
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
  win.loadFile(path.join(__dirname, '/index.html'));
  mainWindow = win;
  // db.selectTable('user','',(data)=>{
  //   if(data.length > 0){
  //     const mac_address = fs.readFileSync('mac.txt', 'utf8');
  //     const hard_disk_serial =  fs.readFileSync('hds.txt', 'utf8');
  //     if(data[0].mac == mac_address && data[0].hds == hard_disk_serial ){
  //       win.loadFile(path.join(__dirname, '/renderer/index.html'));
  //       win.on('ready-to-show', () => {
  //         console.log('index Page Open');
  //         // Run your code here
  //       });
  //     }
  //     else{
  //       win.loadFile(path.join(__dirname, '/renderer/login/login.html'));
  //       // win.on('ready-to-show', () => {
  //       //   console.log('login Page Open');
  //       //   // Run your code here
  //       //   db.selectTable('user', '', (rows) => {
  //       //     console.log(rows);
  //       //     });
  //       // });
  //     }
  //   }
  //   else{
  //     win.loadFile(path.join(__dirname, '/renderer/login/login.html'));
     
  //   }

  // });
  
  
}


app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

ipcMain.on('close-window', () => {
  mainWindow.close();
});

ipcMain.on('database', (event, args) => {
  if (args.params) {
    return db.args['functionName'](args.arguments);
  }
  else {
    return db.args['functionName']();
  }
  
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
          fs.truncate(filePath, 0, function(err) {
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

