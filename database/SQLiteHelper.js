require('dotenv').config()
const sqlite3 = require('sqlite3');
const path = require('path');
const dbFilePath = '../database.db';
class SQLiteHelper {

  constructor() {
    this.databaseFilePath = path.join(__dirname, dbFilePath);
    this.db = null;
    this.open();
    this.createTables();
  }

  open() {
    const maxAttempts = process.env.DB_CONNECTION_ATTEMPS;
    let attempts = 0;

    const tryOpen = () => {
      attempts++;
      this.db = new sqlite3.Database(this.databaseFilePath, (err) => {
        if (err) {
          console.error(err.message);
          if (err.code === 'SQLITE_BUSY' && attempts < maxAttempts) {
            console.log(`Database is busy, retrying in 100ms (attempt ${attempts} of ${maxAttempts})`);
            setTimeout(tryOpen, 100);
          } else {
            console.error(`Failed to connect to the SQLite database at ${this.databaseFilePath}`);
          }
        } else {
          console.log(`Connected to the SQLite database at ${this.databaseFilePath}`);
        }
      });
    };
    tryOpen();
  }

  close() {
    this.db.close((err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(`Disconnected from the SQLite database at ${this.databaseFilePath}`);
      }
    });
  }

  createTables() {
    const query = `CREATE TABLE IF NOT EXISTS ${process.env.USER_TABLE} (
      id INTEGER PRIMARY KEY,
      email TEXT,
      token TEXT
    )`;
    this.db.run(query, [], (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(`Table user created successfully`);
      }
    });
  }

  insertToTable(table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = new Array(keys.length).fill('?').join(', ');
    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
    console.log(query)
    this.db.run('BEGIN TRANSACTION', (err) => {
      if (err) {
        console.error(err.message);
      } else {
        this.db.run(query, values, (err) => {
          if (err) {
            console.error(err.message);
            this.db.run('ROLLBACK');
          } else {
            console.log(`Data inserted into '${table}' successfully`);
            this.db.run('COMMIT');
            return true;
          }
        });
      }
    });
  }

  updateToTable(table, data, condition) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const set = keys.map((key) => `${key} = ?`).join(', ');
    const query = `UPDATE ${table} SET ${set} WHERE ${condition}`;
    this.db.run(query, values, (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(`Data updated in '${table}' successfully`);
      }
    });
  }

  deleteFromTable(table, condition) {
    const query = `DELETE FROM ${table} WHERE ${condition}`;
    this.db.run(query, [], (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(`Data deleted from '${table}' successfully`);
      }
    });
  }

  selectFromTable(table, condition, callback) {
    let query = `SELECT * FROM ${table}`;
    if (condition != '') {
      query += ` WHERE ${condition}`;
    }
    this.db.all(query, [], (err, rows) => {
      if (err) {
        console.error(err.message);
      } else {
        callback(rows);
      }
    });
  }

}

module.exports = SQLiteHelper;
