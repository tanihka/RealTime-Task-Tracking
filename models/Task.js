// models/Task.js
const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  stage: { type: String, required: true },
  priority: { type: String, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  status: { type: String, default: 'Pending' },
},{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }});
// Adding virtuals for IST timestamps
taskSchema.virtual('created_at_ist').get(function() {
  return new Date(this.created_at.getTime() + (5.5 * 60 * 60 * 1000)); // Adding 5.5 hours for IST
});

taskSchema.virtual('updated_at_ist').get(function() {
  return new Date(this.updated_at.getTime() + (5.5 * 60 * 60 * 1000)); // Adding 5.5 hours for IST
});
module.exports = mongoose.model('Task', taskSchema);
