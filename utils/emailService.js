const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendNotificationEmail = (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

const sendInvitationEmail = (to, subject) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: `Hi there,\n\nYou have been invited to join our application. Please sign up to start collaborating.\n\nBest regards,\nYour Team`,
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error(err);
      } else {
        console.log('Invitation email sent:', info.response);
      }
    });
  };
  

module.exports = {
  sendNotificationEmail,
  sendInvitationEmail,
};

