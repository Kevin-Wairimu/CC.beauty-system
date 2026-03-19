import dotenv from 'dotenv';
dotenv.config();

/**
 * Sends an SMS notification to the business number when a new reservation is made.
 * @param {Object} appointment - The appointment details.
 */
export const sendBookingSMS = async (appointment) => {
  const businessPhone = process.env.BUSINESS_PHONE || '+254700000000';
  
  const message = `✨ NEW RESERVATION AT CC BEAUTY CLINIC ✨\n` +
                  `------------------------------\n` +
                  `Guest: ${appointment.name}\n` +
                  `Ritual: ${appointment.service}\n` +
                  `Schedule: ${appointment.date} at ${appointment.time}\n` +
                  `Phone: ${appointment.phone}\n` +
                  `------------------------------\n` +
                  `Check Admin Hub to Approve.`;

  try {
    // --- SIMULATION MODE ---
    console.log(`\n📱 [SMS ALERT TO ${businessPhone}]`);
    console.log(message);
    console.log(`------------------------------\n`);

    /* 
    LIVE INTEGRATION (Optional - Twilio Example):
    import twilio from 'twilio';
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: businessPhone
    });
    */
    
    return true;
  } catch (error) {
    console.error('❌ SMS Notification Failed:', error.message);
    return false;
  }
};
