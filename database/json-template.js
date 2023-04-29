const JsonHelper = require('./JsonHelper');
const dataFilePath = './data.json';
const data = new JsonHelper(dataFilePath);

// Create the JSON data file
data.create();

// Insert data into the JSON data file
const newData = { name: 'John Doe', age: 25 };
data.insert(newData);

// Update data in the JSON data file
const updatedData = { name: 'Jane Doe', age: 30 };
const condition = (item) => item.name === 'John Doe';
data.update(updatedData, condition);

// Delete data from the JSON data file
const deleteCondition = (item) => item.age > 30;
data.delete(deleteCondition);

// Select data from the JSON data file
const selectCondition = (item) => item.age > 18;
const selectedData = data.select(selectCondition);
console.log(selectedData);

// Close the file connection (not necessary for JSON)
// data.close();
