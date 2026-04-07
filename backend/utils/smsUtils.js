import dotenv from "dotenv";
import africastalking from "africastalking";

dotenv.config();

// Initialize Africa's Talking Safely
let sms;
const apiKey = (process.env.AT_API_KEY || "").trim();
const username = (process.env.AT_USERNAME || "sandbox").trim();

if (apiKey) {
  try {
    const AT = africastalking({ apiKey, username });
    sms = AT.SMS;
  } catch (err) {
    console.error("❌ [SMS] Error initializing Africa's Talking:", err.message);
  }
} else {
  console.warn("⚠️ [SMS] AT_API_KEY is missing. SMS will be simulated in console.");
}

/**
 * Ensures phone number is in international format for Africa's Talking (+254...)
 */
const formatPhone = (phone) => {
  if (!phone) return null;
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.substring(1);
  }
  if (!cleaned.startsWith("254") && cleaned.length === 9) {
    cleaned = "254" + cleaned;
  }
  return "+" + cleaned;
};

/**
 * Generic function to send SMS via Africa's Talking
 */
const sendSMS = async (to, message) => {
  const formattedTo = formatPhone(to);
  if (!formattedTo) return false;

  if (!sms) {
    console.log(`\n--- 📱 [SIMULATED SMS] ---`);
    console.log(`To: ${formattedTo}`);
    console.log(`Message: ${message}`);
    console.log(`--------------------------\n`);
    return { success: true, simulated: true };
  }

  const options = {
    to: [formattedTo],
    message: message,
  };

  if (process.env.AT_USERNAME !== "sandbox" && process.env.AT_SENDER_ID) {
    options.from = process.env.AT_SENDER_ID;
  }

  try {
    const response = await sms.send(options);
    const status = response?.SMSMessageData?.Recipients?.[0]?.status;

    if (status === 'Success' || status === 'PendingConfirmation') {
      console.log(`✅ [SMS DELIVERED TO ${formattedTo}]`);
    } else {
      console.log(`⚠️ [GATEWAY REJECTED: ${status || 'Unknown Status'}] for ${formattedTo}`);
    }
    return response;
  } catch (error) {
    console.error('❌ SMS Gateway Error:', error.message || error);
    return false;
  }
};

/**
 * SMS notification to the business number when a new reservation is made.
 */
export const sendBookingSMS = async (appointment) => {
  const businessPhone = process.env.BUSINESS_PHONE || "+254759934198";
  const message =
    ` NEW RESERVATION AT CC BEAUTY CLINIC \n` +
    `------------------------------\n` +
    `Guest: ${appointment.name}\n` +
    `Service: ${appointment.service}\n` +
    `Therapist: ${appointment.staffId?.name || "Any Master"}\n` +
    `Schedule: ${appointment.date} at ${appointment.time}\n` +
    `Phone: ${appointment.phone}\n` +
    `------------------------------\n` +
    `Check Admin Hub to Approve.`;

  return await sendSMS(businessPhone, message);
};

/**
 * Confirmation SMS to the guest when they book an appointment.
 */
export const sendClientBookingSMS = async (appointment) => {
  const message =
    ` CC BEAUTY CLINIC \n` +
    `------------------------------\n` +
    `Hello ${appointment.name},\n` +
    `Your request for ${appointment.service} is received!\n` +
    `Therapist: ${appointment.staffId?.name || "Any Master"}\n` +
    `Schedule: ${appointment.date} at ${appointment.time}\n` +
    `------------------------------\n` +
    `We will SMS you once confirmed.`;

  return await sendSMS(appointment.phone, message);
};

/**
 * SMS to the guest when their reservation is approved.
 */
export const sendClientApprovalSMS = async (appointment) => {
  const message = `✨ CC BEAUTY CLINIC ✨\n` +
                  `------------------------------\n` +
                  `GREAT NEWS ${appointment.name.toUpperCase()}!\n` +
                  `Your reservation for ${appointment.service} is CONFIRMED.\n` +
                  `Therapist: ${appointment.staffId?.name || 'Assigned Master'}\n` +
                  `Schedule: ${appointment.date} at ${appointment.time}\n` +
                  `------------------------------\n` +
                  `See you at Kilimanjaro City Arcade!`;

  return await sendSMS(appointment.phone, message);
};
