var mongoose = require('mongoose'); // Importing mongoose for MongoDB object modeling
var Schema = mongoose.Schema; // Creating a Schema object

// Defining the schema for the task collection
taskSchema = new Schema({
    name: String, // Field for storing the task name
    description: String,  // Field for storing the task description
    category: String, // Field for storing the task category
    user_id: Schema.ObjectId, // Field for storing the user ID associated with the task
    is_delete: { type: Boolean, default: false }, // Field for indicating whether the task is deleted or not
    date: { type: Date, default: Date.now } // Field for storing the creation date of the task
});
// Creating a model based on the task schema
task = mongoose.model('task', taskSchema);

module.exports = task; // Exporting the task model
