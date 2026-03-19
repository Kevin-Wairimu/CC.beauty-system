import dotenv from "dotenv";
import africastalking from "africastalking";

dotenv.config();

// Initialize Africa's Talking
const credentials = {
  apiKey: (process.env.AT_API_KEY || "").trim(),
  username: (process.env.AT_USERNAME || "sandbox").trim(),
};

const AT = africastalking(credentials);
const sms = AT.SMS;

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

  const options = {
    to: [formattedTo],
    message: message,
  };

  // Only add 'from' if we are NOT in sandbox
  if (process.env.AT_USERNAME !== "sandbox" && process.env.AT_SENDER_ID) {
    options.from = process.env.AT_SENDER_ID;
  }

  try {
    const response = await sms.send(options);
    const status = response.SMSMessageData.Recipients[0].status;

    if (status === 'Success' || status === 'PendingConfirmation') {
      console.log(`✅ [SMS DELIVERED TO ${formattedTo}]`);
    } else {
      console.log(`⚠️ [GATEWAY REJECTED: ${status}] for ${formattedTo}`);
      console.log(`Reason: ${response.SMSMessageData.Recipients[0].message}`);
    }
    return response;
  } catch (error) {
    // 401 Specific Advice
    if (error.message.includes('401') || (error.response && error.response.status === 401)) {
      console.error('❌ AUTHENTICATION FAILED (401)');
      console.log('HINT: 1. Disable IP Whitelisting in AT Dashboard. 2. Ensure account has balance. 3. Regenerate API Key.');
    } else {
      console.error('❌ SMS Gateway Error:', error.message || error);
    }

    // Retry logic...
    if (options.from) {
      console.log('🔄 Retrying without Sender ID...');
      const retryOptions = { ...options };
      delete retryOptions.from;
      try {
        const retryResponse = await sms.send(retryOptions);
        const retryStatus = retryResponse.SMSMessageData.Recipients[0].status;
        if (retryStatus === 'Success' || retryStatus === 'PendingConfirmation') {
          console.log(`✅ [SMS SENT ON RETRY TO ${formattedTo}]`);
        } else {
          console.log(`⚠️ [RETRY REJECTED: ${retryStatus}]`);
        }
        return retryResponse;
      } catch (retryError) {
        console.error('❌ Retry Failed:', retryError.message || 'Check balance or IP whitelist');
      }
    }

    // If it's NOT a Sender ID error, or simulation is needed
    if (process.env.AT_USERNAME === "sandbox" || !process.env.AT_API_KEY) {
      console.log(`\n--- SIMULATION MODE (No API Key or Sandbox) ---`);
      console.log(`To: ${formattedTo}\nMessage: ${message}`);
      console.log(`-----------------------------------\n`);
    }
    return false;
  }
};

/**
 * SMS notification to the business number when a new reservation is made.
 */
export const sendBookingSMS = async (appointment) => {
  const businessPhone = process.env.BUSINESS_PHONE || "+254757724175";

  const message =
    ` NEW RESERVATION AT CC BEAUTY CLINIC \n` +
    `------------------------------\n` +
    `Guest: ${appointment.name}\n` +
    `Ritual: ${appointment.service}\n` +
    `Specialist: ${appointment.staffId?.name || "Any Master"}\n` +
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
    `Specialist: ${appointment.staffId?.name || "Any Master"}\n` +
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
                  `Specialist: ${appointment.staffId?.name || 'Assigned Master'}\n` +
                  `Schedule: ${appointment.date} at ${appointment.time}\n` +
                  `------------------------------\n` +
                  `See you at Kilimanjaro City Arcade!`;

  return await sendSMS(appointment.phone, message);
};
