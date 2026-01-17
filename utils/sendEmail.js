const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      text,
    });

    console.log("Email sent successfully to", email);
  } catch (error) {
    console.error("Email not sent", error);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;
