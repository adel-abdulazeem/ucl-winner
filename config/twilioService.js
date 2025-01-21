const twilio = require("twilio");
const moment = require("moment");
const Subscriber = require('../models/Subscriber');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// Function to send notification
async function sendNotification(phoneNumber, name) {
  try {
    const message = await client.messages.create({
      body: `Hey ${name}, this is a notification that your subscription is about to expire in the next 72 hours.`,
      from: "+15677071207",
      to: phoneNumber,
    });
    console.log(`Notification sent to ${phoneNumber}: ${message.sid}`);
  } catch (error) {
    console.error(`Failed to send notification to ${phoneNumber}:`, error);
  }
}

// Function to check subscription dates and send notifications
async function checkSubscriptions() {
  try {
    const subscribers = await Subscriber.find({});

    for (const subscriber of subscribers) {
      const endDate = moment(subscriber.endDate);
      const currentDate = moment();
      const differenceInHours = endDate.diff(currentDate, "hours");

      if (differenceInHours <= 72) {
        await sendNotification(subscriber.phone, subscriber.firstName);
      }
    }
  } catch (error) {
    console.error("Error checking subscriptions:", error);
  }
}

module.exports = { checkSubscriptions };