const Task = require('../models/Task');
const User = require('../models/User');
const Team = require('../models/Team');
const { sendNotificationEmail } = require('../utils/emailService');

// Create a task for an individual
exports.createTask = async (req, res) => {
  const { name, type, stage, priority, assignedToEmail } = req.body;

  try {
    let assignedToUserId = req.user.id; // Default to current user's ID

    // Check if assignedToEmail is provided and not empty
    if (assignedToEmail && assignedToEmail.trim() !== '') {
      const assignedToUser = await User.findOne({ email: assignedToEmail });

      if (!assignedToUser) {
        return res.status(404).json({ msg: 'Assigned user not found' });
      }

      assignedToUserId = assignedToUser.id; // Use found user's ID
    }

    const task = new Task({
      name,
      type,
      stage,
      priority,
      createdBy: req.user.id,
      assignedTo: assignedToUserId,
    });

    await task.save();

    res.status(201).json({ msg: 'Task created and assigned successfully', task });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
// Create a task within a team
exports.createTeamTask = async (req, res) => {
  const { teamId } = req.params;
  const { name, type, stage, priority, assignedToEmail } = req.body;

  try {
    // Fetch the team from the database
    const team = await Team.findById(teamId);

    // Check if team exists
    if (!team) {
      return res.status(404).json({ msg: 'Team not found' });
    }

    // Check if the user is a member of the team
    if (!team.members.includes(req.user.id)) {
      return res.status(403).json({ msg: 'Unauthorized: You are not a member of this team' });
    }

    // Find the user to whom the task is assigned
    const assignedToUser = await User.findOne({ email: assignedToEmail });

    // Check if assignedToUser exists and is a member of the team
    if (!assignedToUser || !team.members.includes(assignedToUser.id)) {
      return res.status(404).json({ msg: 'Assigned user not found in the team' });
    }

    // Create a new task
    const task = new Task({
      name,
      type,
      stage,
      priority,
      createdBy: req.user.id,
      assignedTo: assignedToUser.id,
      team: team.id,
    });

    // Save the task to the database
    await task.save();

    // Optionally send notification email
    // sendNotificationEmail(assignedToUser.email, 'New Team Task Assigned', `You have been assigned a new team task: ${name}`);

    // Respond with success message and the created task
    res.status(201).json({ msg: 'Team task created and assigned successfully', task });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
// Approve or decline a task
exports.updateTaskStatus = async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body; // status can be 'accepted' or 'declined'

  try {
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    if (task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'User not authorized to update this task' });
    }

    task.status = status;
    await task.save();

    res.status(200).json({ msg: 'Task status updated successfully', task });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


// Get tasks created by or assigned to the authenticated user
exports.getTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find tasks where the authenticated user is either the creator or assignee
    const tasks = await Task.find({ $or: [{ createdBy: userId }, { assignedTo: userId }] });

    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
