const os = require('os');
const { exec } = require('child_process');
var macaddress = require('macaddress');
const fs = require('fs');
const path = require('path');
const macAddFilePath = path.join(__dirname, '/../../mac.txt');
const hDSFilePath = path.join(__dirname, '/../../hds.txt');


function createMacAddressFiles() {

    macaddress.one(function (err, mac) {
        // console.log("Mac address for this host: %s", mac);

        fs.writeFile(macAddFilePath, mac, function (err) {
            if (err) throw err;
        });
    });
    if (os.platform() === 'win32') {
        exec('wmic DISKDRIVE get SerialNumber', (err, stdout) => {
            if (err) {
                console.error(err);
                return;
            }
            const serialNumber = stdout.split('\n')[1].trim();

            fs.writeFile(hDSFilePath, serialNumber, function (err) {
                if (err) throw err;
            });
            // console.log(`Hard disk serial number: ${serialNumber}`);
        });
    }
    if (os.platform() === 'darwin') {

        exec("system_profiler SPSerialATADataType | awk '/Serial Number/{print $NF}'", (err, stdout) => {
            if (err) {
                console.error(err);
                return;
            }
            const serialNumber = stdout.trim();
            // console.log(`Hard disk serial number: ${serialNumber}`);
            const file_path = path.join(__dirname, '/../../hds.txt');
            fs.writeFile(file_path, serialNumber, function (err) {
                if (err) throw err;
            });
        });
    }
}


module.exports = createMacAddressFiles;