const SQLiteHelper = require('/SQLiteHelper');
const dbFilePath = '../mydatabase.db';
const db = new SQLiteHelper(dbFilePath);

// Create a table
const fields = ['id INTEGER PRIMARY KEY', 'name TEXT NOT NULL', 'age INTEGER'];
db.open();
db.create('users', fields);

// Insert data into a table
const data = { name: 'John Doe', age: 25 };
db.insert('users', data);

// Update data in a table
const newData = { name: 'Jane Doe', age: 30 };
const condition = 'id = 1';
db.update('users', newData, condition);

// Delete data from a table
const condition = 'id = 1';
db.delete('users', condition);

// Select data from a table
const condition = 'age > 18';
db.select('users', condition, (rows) => {
  console.log(rows);
});

// Close the database connection
db.close();
