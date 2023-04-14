const sqlite = require('sqlite');
const path = require('path');
const databaseFilePath = '../database.db';
const pool = null;


class SQLiteHelperPooled {
  constructor() {
    //this.dbFilePath = ;
    this.dbFilePath = path.join(__dirname, databaseFilePath);
    this.pool = null;
  }

  async open() {
    try {
      this.pool = await sqlite.open({
        filename: this.dbFilePath,
        driver: sqlite.Database,
        mode: sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE,
        pooled: true,
      });

      await this.createTables();

      console.log(`Connected to the SQLite database at ${this.dbFilePath}`);
    } catch (err) {
      console.error(`Failed to connect to the SQLite database at ${this.dbFilePath}: ${err}`);
    }
  }

  async close() {
    if (this.pool) {
      try {
        await this.pool.close();
        console.log(`Disconnected from the SQLite database at ${this.dbFilePath}`);
      } catch (err) {
        console.error(`Failed to close the SQLite database at ${this.dbFilePath}: ${err}`);
      }
    }
  }

  async createTables() {
    try {
      await this.pool.exec(`CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        mac TEXT,
        status TEXT,
        message TEXT,
        expiry TEXT,
        verified INTEGER NOT NULL DEFAULT 1
      )`);

      console.log(`Table user created successfully`);

      await this.pool.exec(`CREATE TABLE IF NOT EXISTS tree (
        id INTEGER PRIMARY KEY,
        parent_id INTEGER,
        type TEXT NOT NULL,
        value_or_path TEXT NOT NULL,
        action TEXT NOT NULL
      )`);

      console.log(`Table tree created successfully`);

      await this.pool.exec(`CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY,
        shortcut_key_1 INTEGER NOT NULL,
        shortcut_key_2 INTEGER NOT NULL,
        assigned_to_selected INTEGER NOT NULL,
        open_link_incognito INTEGER NOT NULL,
        time_zone INTEGER NOT NULL
      )`);

      console.log(`Table settings created successfully`);
    } catch (err) {
      console.error(`Error creating tables in the SQLite database at ${this.dbFilePath}: ${err}`);
    }
  }

  async insertTable(table, data) {
    try {
      await this.pool.run(`INSERT INTO ${table} (${Object.keys(data).join(', ')}) VALUES (${Object.values(data).map(() => '?').join(', ')})`, Object.values(data));
      console.log(`Data inserted into '${table}' successfully`);
    } catch (err) {
      console.error(`Error inserting data into '${table}': ${err}`);
    }
  }

  async updateTable(table, data, condition) {
    try {
      await this.pool.run(`UPDATE ${table} SET ${Object.keys(data).map((key) => `${key} = ?`).join(', ')} WHERE ${condition}`, Object.values(data));
      console.log(`Data updated in '${table}' successfully`);
    } catch (err) {
      console.error(`Error updating data in '${table}': ${err}`);
    }
  }

  async deleteTable(table, condition) {
    try {
      await this.pool.run(`DELETE FROM ${table} WHERE ${condition}`);
      console.log(`Data deleted from '${table}' successfully`);
    } catch (err) {
      console.error(`Error deleting data from '${table}': ${err}`);
    }
  }
}

module.exports = SQLiteHelperPooled;
