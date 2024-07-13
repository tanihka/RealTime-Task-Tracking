const express = require('express');
const router = express.Router();
const { createTask, createTeamTask, updateTaskStatus, getTasks } = require('../controllers/taskController');
const auth = require('../middleware/authMiddleware');

// Routes for task creation and updating
router.post('/create', auth, createTask); // Create a task for an individual
router.post('/team/:teamId/create', auth, createTeamTask); // Create a task within a team
router.put('/update/:taskId/status', auth, updateTaskStatus); // Update task status (accept/decline)
router.get('/', auth, getTasks); // Update task status (accept/decline)


module.exports = router;
