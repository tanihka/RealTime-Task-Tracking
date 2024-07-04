const mongoose =  require('mongoose');


const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['bug', 'task'], // Example types, you can expand this as needed
        default: 'task'
      },
      assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
});

module.exports = mongoose.model('Task',taskSchema);