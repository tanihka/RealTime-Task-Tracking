// // controllers/teamController.js
// const Team = require('../models/Team');
// const User = require('../models/User');
// const { sendInvitationEmail, sendNotificationEmail } = require('../utils/emailService');

// const mongoose = require('mongoose');

// exports.createTeam = async (req, res) => {
//   const { name, members } = req.body;
//   try {
//     const team = new Team({ name, members: [req.user.id], createdBy: req.user.id });

//     for (const email of members) {
//       const user = await User.findOne({ email });
//       if (user) {
//         // Check if user ID is already in the team members array to avoid duplicates
//         if (!team.members.includes(user.id)) {
//           team.members.push(user.id);
//         //   sendNotificationEmail(user.email, 'Team Invitation', `You have been added to the team: ${name}`);
//         } else {
//           // Handle case where user is already a member
//           // Possibly send a different notification or skip adding
//         }
//       } else {
//         // sendInvitationEmail(email, `You have been invited to join the team: ${name}`);
//       }
//     }

//     await team.save();
//     res.status(201).json(team);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// };
// exports.addMembersToTeam = async (req, res) => {
//     const { teamId } = req.params;
//     const { members } = req.body;
  
//     try {
//       // Find the team by teamId
//       const team = await Team.findById(teamId);
//       if (!team) {
//         return res.status(404).json({ msg: 'Team not found' });
//       }
  
//       // Array to track new members added successfully
//       const addedMembers = [];
  
//       for (const email of members) {
//         // Find user by email
//         const user = await User.findOne({ email });
  
//         if (user) {
//           // Check if user ID is already in the team members array to avoid duplicates
//           if (team.members.includes(user.id)) {
//             // If user is already a member, skip adding and provide feedback
//             console.log(`User ${user.email} is already a member of the team`);
//             res.json("already a member of the team")
//           } else if (!addedMembers.includes(user.id)) {
//             // If user is not already added, add to team and mark as added
//             team.members.push(user.id);
//             addedMembers.push(user.id);
//             sendNotificationEmail(user.email, 'Team Invitation', `You have been added to the team: ${team.name}`);
//           }
//         } else {
//           // Send invitation email if user does not exist
//           sendInvitationEmail(email, `You have been invited to join the team: ${team.name}`);
//         }
//       }
  
//       // Save the team with updated members
//       await team.save();
//       res.status(200).json({ msg: 'Members added to team successfully', team });
//     } catch (err) {
//       console.error(err.message);
//       res.status(500).send('Server error');
//     }
//   };

// exports.approveTeamMembership = async (req, res) => {
//   const { teamId } = req.params;
//   try {
//     const team = await Team.findById(teamId);
//     if (!team) {
//       return res.status(404).json({ msg: 'Team not found' });
//     }

//     // Check if user ID is already in the team members array to avoid duplicates
//     if (!team.members.includes(req.user.id)) {
//       team.members.push(req.user.id);
//       await team.save();
//     }

//     res.status(200).json({ msg: 'Membership approved' });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// };

// exports.getTeam = async()=>{
//   try{
//     const userId = req.user.id;
//   }catch(err){

//   }
// }

// teamController.js
const Team = require('../models/Team');
const User = require('../models/User');
const { sendInvitationEmail, sendNotificationEmail } = require('../utils/emailService');
const mongoose = require('mongoose');

exports.createTeam = async (req, res) => {
  const { name, members } = req.body;

  try {
    // Create the team with the creator as the first member
    const team = await Team.create({ name, members: [req.user.id], createdBy: req.user.id });

    // Array to track pending members
    const pendingMembers = [];

    // Invite other members
    for (const email of members) {
      if (email !== req.user.email) { // Exclude creator's email
        const user = await User.findOne({ email });
        if (user) {
          if (!team.members.includes(user.id)) {
            // Add user to pending list
            pendingMembers.push(user.id);
            // Notify user to approve or decline
            // sendNotificationEmail(user.email, 'Team Invitation', `You have been invited to join the team: ${team.name}`);
            // Emit socket event to notify user
            req.io.to(user.id).emit('teamInvitation', { teamId: team._id });
          } else {
            console.log(`User ${email} is already a member of the team`);
          }
        } else {
          // Send invitation email if user does not exist
          // sendInvitationEmail(email, `You have been invited to join the team: ${team.name}`);
        }
      }
    }

    // Save the team with updated members and pending list
    team.pendingMembers = pendingMembers;
    await team.save();

    res.status(201).json({ msg: 'Team created successfully', team });
  } catch (err) {
    console.error('Failed to create team:', err.message);
    res.status(500).json({ msg: 'Failed to create team' });
  }
};


exports.approveTeamMembership = async (req, res) => {
  const { teamId } = req.params;

  try {
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ msg: 'Team not found' });
    }

    // Check if user ID is in the pendingMembers array
    if (team.pendingMembers.includes(req.user.id)) {
      // Remove from pendingMembers and add to members
      team.pendingMembers = team.pendingMembers.filter(userId => !userId.equals(req.user.id));
      team.members.push(req.user.id);
      await team.save();

      // Emit socket event to notify all team members of the new member
      req.io.to(team._id).emit('teamMemberAdded', { userId: req.user.id });
    } else if (team.members.includes(req.user.id)) {
      return res.status(400).json({ msg: 'You are already a member of this team' });
    } else {
      return res.status(400).json({ msg: 'You do not have a pending invitation to this team' });
    }

    res.status(200).json({ msg: 'Membership approved' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.rejectTeamMembership = async (req, res) => {
  const { teamId } = req.params;

  try {
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ msg: 'Team not found' });
    }

    // Remove user from pendingMembers array
    team.pendingMembers = team.pendingMembers.filter(memberId => !memberId.equals(req.user.id));
    await team.save();

    res.status(200).json({ msg: 'Membership request rejected successfully' });
  } catch (err) {
    console.error('Failed to reject membership:', err.message);
    res.status(500).send('Server error');
  }
};

exports.addMembersToTeam = async (req, res) => {
  const { teamId } = req.params;
  const { members } = req.body;

  try {
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ msg: 'Team not found' });
    }

    const pendingMembers = [];

    for (const email of members) {
      if (email !== req.user.email) {
        const user = await User.findOne({ email });
        if (user) {
          if (!team.members.includes(user.id) && !team.pendingMembers.includes(user.id)) {
            pendingMembers.push(user.id);
            sendNotificationEmail(user.email, 'Team Invitation', `You have been invited to join the team: ${team.name}`);
            req.io.to(user.id).emit('teamInvitation', { teamId: team._id });
          } else {
            console.log(`User ${email} is already a member of the team or pending approval`);
          }
        } else {
          sendInvitationEmail(email, `You have been invited to join the team: ${team.name}`);
        }
      }
    }

    team.pendingMembers = [...team.pendingMembers, ...pendingMembers];
    await team.save();

    res.status(200).json({ msg: 'Members invited successfully', team });
  } catch (err) {
    console.error('Failed to add members:', err.message);
    res.status(500).send('Server error');
  }
};
