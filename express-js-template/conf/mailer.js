const nodemailer = require("nodemailer");
require("dotenv").config();

const tranporter = nodemailer.createTransport({
  service: "gmail",
  host: process.env.EMAIL_HOST,
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendMail({ to, subject, text, html }) {
  const mailOptions = {
    from: process.env.EMAIL,
    to,
    subject,
    text,
    html,
  };

  const info = await tranporter.sendMail(mailOptions);
  console.log(`Email sent: ${info.response}`);
  return info;
}

const emailTemplate = {
  sendOTP: (otp, fullname) => {
    console.log(otp, fullname);
    return {
      subject: "OTP for account verification",
      html: `<h1>Hi ${fullname},</h1>
        <p>Your OTP for account verification is: <strong>${otp}</strong></p>
        <p>Do not share this OTP with anyone.</p>
        <p>OTP is valid for 15 minutes</p>`,
    };
  },
  // resetPassword: (otp) => {},
};

module.exports = { sendMail, emailTemplate };
