import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

let resend;
try {
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  } else {
    console.warn("[EMAIL] RESEND_API_KEY is missing. Emails will be skipped.");
  }
} catch (err) {
  console.error("[EMAIL] Error initializing Resend:", err.message);
}

// Helper — central send function
const send = async ({ to, subject, html, replyTo }) => {
  if (!resend) {
    console.log(
      `ℹ[MOCK EMAIL] To: ${to}, Subject: ${subject} (Skipped: No API Key)`,
    );
    return { success: true, message: "Mock email sent (No API key)" };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: "CC Beauty <onboarding@resend.dev>", // use this until you verify a domain
      to,
      replyTo,
      subject,
      html,
    });

    if (error) {
      if (error.message?.includes("testing emails to your own email address")) {
        console.error(
          "[RESEND RESTRICTION] You can only send to kevinkhalid21@gmail.com while in test mode.",
        );
        console.log(`Skipped sending to: ${to}`);
      } else {
        console.error("Email error:", error.message);
      }
      return { success: false, error };
    }

    console.log(`Email sent to ${to}`);
    return { success: true, data };
  } catch (err) {
    console.error("Resend execution error:", err.message);
    return { success: false, error: err };
  }
};

export const sendBookingEmail = async (booking) => {
  await send({
    to: process.env.TO_EMAIL,
    replyTo: booking.email,
    subject: ` New Appointment Request: ${booking.service}`,
    html: `
      <div style="font-family: serif; color: #1a1a1a; padding: 20px; border: 2px solid #D4AF37; max-width: 600px; margin: auto;">
        <h2 style="color: #D4AF37; text-align: center; text-transform: uppercase;">Appointment Request</h2>
        <p><strong>Client:</strong> ${booking.name}</p>
        <p><strong>Phone:</strong> ${booking.phone}</p>
        <p><strong>Service:</strong> ${booking.service}</p>
        <p><strong>Date/Time:</strong> ${booking.date} at ${booking.time}</p>
        <p><strong>Therapist:</strong> ${booking.staffId?.name || "Any Available Master"}</p>
        <p><strong>Notes:</strong> ${booking.notes || "None"}</p>
      </div>`,
  });
};

export const sendClientBookingEmail = async (booking) => {
  await send({
    to: booking.email,
    subject: ` Reservation Requested: ${booking.service}`,
    html: `
      <div style="font-family: serif; color: #1a1a1a; padding: 20px; border: 2px solid #D4AF37; max-width: 600px; margin: auto;">
        <h2 style="color: #D4AF37; text-align: center; text-transform: uppercase;">Reservation Received</h2>
        <p>Hello ${booking.name},</p>
        <p>Thank you for choosing CC Beauty Clinic. We have received your request for:</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p><strong>Service:</strong> ${booking.service}</p>
        <p><strong>Therapist:</strong> ${booking.staffId?.name || "Any Available Master"}</p>
        <p><strong>Schedule:</strong> ${booking.date} at ${booking.time}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-style: italic; color: #666;">Our Studio Director is reviewing your request. You will receive confirmation within 15 minutes.</p>
        <p style="text-align: center; margin-top: 30px; font-weight: bold; color: #D4AF37;">CC BEAUTY CLINIC</p>
      </div>`,
  });
};

export const sendApprovalEmail = async (booking) => {
  await send({
    to: booking.email,
    subject: ` Your Reservation is Approved: ${booking.service}`,
    html: `
      <div style="font-family: serif; color: #1a1a1a; padding: 30px; border: 2px solid #D4AF37; max-width: 600px; margin: auto;">
        <h2 style="color: #D4AF37; text-align: center; text-transform: uppercase; letter-spacing: 2px;">Reservation Confirmed</h2>
        <p style="text-align: center; font-style: italic; color: #666;">We are pleased to welcome you to the CC Beauty experience.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p><strong>Service:</strong> ${booking.service}</p>
        <p><strong>Therapist:</strong> ${booking.staffId?.name || "Assigned Master"}</p>
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Time:</strong> ${booking.time}</p>
        <p><strong>Location:</strong> Kilimanjaro City Arcade, Nairobi, Kenya</p>
        <div style="background: #fdfaf0; padding: 20px; border-left: 4px solid #D4AF37; margin-top: 20px;">
          <p style="margin: 0; font-size: 14px; line-height: 1.6;">Please arrive 10 minutes prior. To reschedule, notify us at least 24 hours in advance.</p>
        </div>
        <p style="text-align: center; margin-top: 30px; font-weight: bold; color: #D4AF37;">CC BEAUTY CLINIC</p>
      </div>`,
  });
};

export const sendResetPasswordEmail = async (user, resetToken) => {
  const frontendUrl =
    process.env.FRONTEND_URL || "https://cc-beauty-system.pages.dev";
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
  await send({
    to: user.email,
    subject: `Private Access Reset - CC.BEAUTY.CLINIC`,
    html: `
      <div style="font-family: serif; background: #000; color: #fff; padding: 40px; border: 2px solid #FFD700; max-width: 500px; margin: auto;">
        <h2 style="color: #FFD700; text-align: center; text-transform: uppercase; letter-spacing: 4px;">Private Access</h2>
        <p style="text-align: center; color: #ccc; font-style: italic;">A request was made to reset your CC.BEAUTY.CLINIC account credentials.</p>
        <div style="text-align: center; margin: 40px 0;">
          <a href="${resetUrl}" style="background: #FFD700; color: #000; padding: 18px 36px; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">Reset Your Password</a>
        </div>
        <p style="font-size: 10px; color: #666; text-align: center;">This link expires in 10 minutes.</p>
        <p style="text-align: center; margin-top: 30px; font-weight: bold; color: #FFD700; letter-spacing: 2px;">CC.BEAUTY.CLINIC</p>
      </div>`,
  });
};

export const sendReminderEmail = async (booking) => {
  await send({
    to: booking.email,
    subject: ` Reminder: Your Reservation Tomorrow at CC Beauty`,
    html: `
      <div style="font-family: serif; color: #1a1a1a; padding: 30px; border: 2px solid #D4AF37; max-width: 600px; margin: auto;">
        <h2 style="color: #D4AF37; text-align: center; text-transform: uppercase;">Appointment Reminder</h2>
        <p>Hello ${booking.name},</p>
        <p>This is a friendly reminder of your appointment tomorrow:</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p><strong>Service:</strong> ${booking.service}</p>
        <p><strong>Schedule:</strong> ${booking.date} at ${booking.time}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="text-align: center; margin-top: 30px; font-weight: bold; color: #D4AF37;">CC BEAUTY CLINIC</p>
      </div>`,
  });
};

export const sendEnquiryEmail = async (enquiry) => {
  await send({
    to: process.env.TO_EMAIL,
    replyTo: enquiry.email,
    subject: `New Enquiry: ${enquiry.name}`,
    html: `
      <div style="font-family: serif; color: #1a1a1a; padding: 20px; border: 2px solid #D4AF37; max-width: 600px; margin: auto;">
        <h2 style="color: #D4AF37; text-align: center; text-transform: uppercase;">New General Enquiry</h2>
        <p><strong>From:</strong> ${enquiry.name}</p>
        <p><strong>Email:</strong> ${enquiry.email}</p>
        <p><strong>Message:</strong></p>
        <p style="font-style: italic; background: #fdfaf0; padding: 15px; border-left: 4px solid #D4AF37;">${enquiry.message}</p>
      </div>`,
  });
};
