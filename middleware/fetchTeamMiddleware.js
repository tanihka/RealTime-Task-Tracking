// authMiddleware.js
const Team = require('../models/Team');

const authMiddleware = async (req, res, next) => {
  // Logic to verify authentication, fetch user, etc.
  try {
    // Assuming you fetch user and team information based on user's authentication
    const user = req.user; // Example: Assume req.user is set by authentication middleware
    const team = await Team.findById(req.params.teamId); // Fetch team based on teamId from URL params

    if (!team) {
      return res.status(404).json({ msg: 'Team not found' });
    }

    // Check if the user is a member of the team
    if (!team.members.includes(user.id)) {
      return res.status(403).json({ msg: 'Unauthorized: You are not a member of this team' });
    }

    // Attach the team to the request object for use in subsequent handlers
    req.team = team;

    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = authMiddleware;

