// routes/teamRoutes.js
const express = require('express');
const router = express.Router();
const { createTeam, approveTeamMembership, rejectTeamMembership, addMembersToTeam } = require('../controllers/teamController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, createTeam);
router.post('/:teamId/addMembers', auth, addMembersToTeam);
router.patch('/:teamId/approve', auth, approveTeamMembership);
router.patch('/:teamId/reject', auth, rejectTeamMembership);

module.exports = router;
