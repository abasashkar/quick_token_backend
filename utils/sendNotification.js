const admin = require("../config/firebaseAdmin");

const sendNotification = async ({ token, title, body, data = {} }) => {
  if (!token) return;

  const message = {
    notification: { title, body },
    data,
    token,
  };

  try {
    await admin.messaging().send(message);
  } catch (err) {
    console.error("FCM error:", err.message);
  }
};

module.exports = sendNotification;
