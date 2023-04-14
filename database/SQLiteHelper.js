const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const isCreatingTables = false;
const dbFilePath = '../database.db';
class SQLiteHelper {
  // constructor(databaseFilePath) {
  //   this.databaseFilePath = path.join(__dirname, databaseFilePath);
  //   this.db = null;
  // }
  constructor() {
    this.databaseFilePath = path.join(__dirname, dbFilePath);
    this.db = null;
    this.open();
    this.createTables();
  }


  open() {
    const maxAttempts = 10;
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
            console.log(`Failed to connect to the SQLite database at ${this.databaseFilePath}`);
          }
        } else {
          // this.createTables((success) => {
          //   if (success) {
          console.log(`Connected to the SQLite database at ${this.databaseFilePath}`);
          //   } else {
          //     console.error(`Error creating tables in the SQLite database at ${this.databaseFilePath}`);
          //   }
          // });
        }
      });
    };

    tryOpen();
  }
  // open() {

  //   this.db = new sqlite3.Database(this.databaseFilePath, (err) => {
  //     if (err) {
  //       console.error(err.message);
  //     } else {
  //       this.createTables();
  //       console.log(`Connected to the SQLite database at ${this.databaseFilePath}`);
  //     }
  //   });

  // }

  close() {
    this.db.close((err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(`Disconnected from the SQLite database at ${this.databaseFilePath}`);
      }
    });
  }

  // create(table, fields) {
  //   const query = `CREATE TABLE IF NOT EXISTS ${table} (${fields.join(', ')})`;
  //   this.db.run(query, [], (err) => {
  //     if (err) {
  //       console.error(err.message);
  //     } else {
  //       console.log(`Table '${table}' created successfully`);
  //     }
  //   });
  // }

  createTables() {
    this.isCreatingTables = true;
    const query = `CREATE TABLE IF NOT EXISTS user (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      mac TEXT,
      hds TEXT,
      expiry TEXT,
      verified INTEGER NOT NULL DEFAULT 0
    )`;
    this.db.run(query, [], (err) => {
      if (err) {
        console.error(err.message);

      } else {
        console.log(`Table user created successfully`);
        const query2 = `CREATE TABLE IF NOT EXISTS tree (
          id INTEGER PRIMARY KEY,
          parent_id INTEGER,
          type TEXT NOT NULL,
          value_or_path TEXT NOT NULL,
          action TEXT NOT NULL
        )`;
        this.db.run(query2, [], (err) => {
          if (err) {
            console.error(err.message);
          } else {
            console.log(`Table tree created successfully`);
            const query3 = `CREATE TABLE IF NOT EXISTS settings (
              id INTEGER PRIMARY KEY,
              shortcut_key_1 INTEGER NOT NULL,
              shortcut_key_2 INTEGER NOT NULL,
              assigned_to_selected INTEGER NOT NULL,
              open_link_incognito INTEGER NOT NULL,
              time_zone INTEGER NOT NULL
            )`;
            this.db.run(query3, [], (err) => {
              if (err) {
                console.error(err.message);
              } else {
                console.log(`Table settings created successfully`);
                this.isCreatingTables = false;

              }
            });
          }
        });
      }
    });
  }


  insertTable(table, data) {

    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = new Array(keys.length).fill('?').join(', ');
    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
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
          }
        });
      }
    });

    // this.db.run(query, values, (err) => {
    //   if (err) {
    //     console.error(err.message);
    //   } else {
    //     console.log(`Data inserted into '${table}' successfully`);
    //   }
    // });

  }

  updateTable(table, data, condition) {
    
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

  deleteTable(table, condition) {
      const query = `DELETE FROM ${table} WHERE ${condition}`;
      this.db.run(query, [], (err) => {
        if (err) {
          console.error(err.message);
        } else {
          console.log(`Data deleted from '${table}' successfully`);
        }
      });
    
  }

  selectTable(table, condition, callback) {
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
