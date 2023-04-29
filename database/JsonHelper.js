require('dotenv').config()
const fs = require('fs');
const path = require('path');

class JsonHelper {
  constructor() {
    this.dbFilePath = path.join(__dirname, '../database.json');
    this.data = this.readDataFromFile();
  }

  readDataFromFile() {
    try {
      const data = fs.readFileSync(this.dbFilePath);
      return JSON.parse(data);
    } catch (err) {
      console.error(`Error reading from file: ${err.message}`);
      return {};
    }
  }

  writeDataToFile() {
    try {
      fs.writeFileSync(this.dbFilePath, JSON.stringify(this.data));
    } catch (err) {
      console.error(`Error writing to file: ${err.message}`);
    }
  }

  createTables() {
    if (!this.data.hasOwnProperty(process.env.USER_TABLE)) {
      this.data[process.env.USER_TABLE] = [{
		"id": "1",
		"email": "",
		"token": ""}];
      this.writeDataToFile();
    }
  }

  insertToTable(table, data) {
    if (!this.data.hasOwnProperty(table)) {
      this.data[table] = [];
    }
    this.data[table].push(data);
    this.writeDataToFile();
  }

  updateToTable(table, data, condition) {
    if (!this.data.hasOwnProperty(table)) {
      return;
    }
    const rows = this.data[table];
    for (let i = 0; i < rows.length; i++) {
      if (eval(condition)) {
        Object.assign(rows[i], data);
        this.writeDataToFile();
        break;
      }
    }
  }

  deleteFromTable(table, condition) {
    if (!this.data.hasOwnProperty(table)) {
      return;
    }
    const rows = this.data[table];
    for (let i = 0; i < rows.length; i++) {
      if (eval(condition)) {
        rows.splice(i, 1);
        this.writeDataToFile();
        break;
      }
    }
  }

  selectFromTable(table, condition, callback) {
    if (!this.data.hasOwnProperty(table)) {
      callback([]);
      return;
    }
    const rows = this.data[table];
    if (condition === '') {
      callback(rows);
      return;
    }
    const filteredRows = rows.filter((row) => eval(condition));
    callback(filteredRows);
  }
}

module.exports = JsonHelper;
