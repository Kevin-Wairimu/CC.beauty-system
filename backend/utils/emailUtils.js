import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create a single transporter instance to be reused
let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  const email = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.trim();

  if (!email || !pass) {
    console.error("❌ Email config missing in .env!");
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: email,
      pass: pass,
    },
    family: 4 // Force IPv4
  });

  // Verify connection configuration
  transporter.verify((error, success) => {
    if (error) {
      console.error("❌ SMTP Verification Error:", error.message);
    } else {
      console.log("✅ SMTP Server is ready to take our messages");
    }
  });

  return transporter;
};

export const sendBookingEmail = async (booking) => {
  console.log(`Attempting email for: ${booking.service}`);
  const mailTransporter = getTransporter();
  if (!mailTransporter) return;

  const mailOptions = {
    from: `"CC Beauty" <${process.env.EMAIL_USER}>`,
    to: process.env.TO_EMAIL,
    replyTo: booking.email,
    subject: `✨ New Appointment Request: ${booking.service}`,
    html: `
      <div style="font-family: serif; color: #1a1a1a; padding: 20px; border: 2px solid #D4AF37; max-width: 600px; margin: auto;">
        <h2 style="color: #D4AF37; text-align: center; text-transform: uppercase;">Appointment Request</h2>
        <p><strong>Client:</strong> ${booking.name}</p>
        <p><strong>Phone:</strong> ${booking.phone}</p>
        <p><strong>Service:</strong> ${booking.service}</p>
        <p><strong>Date/Time:</strong> ${booking.date} at ${booking.time}</p>
        <p><strong>Therapist:</strong> ${booking.staffId?.name || "Any Available Master"}</p>
        <p><strong>Notes:</strong> ${booking.notes || "None"}</p>
      </div>
    `,
  };

  try {
    await mailTransporter.sendMail(mailOptions);
    console.log("✅ Booking email sent to owner");
  } catch (error) {
    console.error("❌ Booking email error detail:", error.message);
  }
};

export const sendClientBookingEmail = async (booking) => {
  console.log(`Sending confirmation email to guest: ${booking.email}`);
  const mailTransporter = getTransporter();
  if (!mailTransporter) return;

  const mailOptions = {
    from: `"CC Beauty" <${process.env.EMAIL_USER}>`,
    to: booking.email,
    subject: `✨ Reservation Requested: ${booking.service}`,
    html: `
      <div style="font-family: serif; color: #1a1a1a; padding: 20px; border: 2px solid #D4AF37; max-width: 600px; margin: auto;">
        <h2 style="color: #D4AF37; text-align: center; text-transform: uppercase;">Reservation Received</h2>
        <p>Hello ${booking.name},</p>
        <p>Thank you for choosing CC Beauty Clinic. We have received your request for the following ritual:</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p><strong>Ritual:</strong> ${booking.service}</p>
        <p><strong>Therapist:</strong> ${booking.staffId?.name || "Any Available Master"}</p>
        <p><strong>Schedule:</strong> ${booking.date} at ${booking.time}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-style: italic; color: #666;">Our Studio Director is reviewing your request. You will receive a final confirmation via SMS/Email within 15 minutes.</p>
        <p style="text-align: center; margin-top: 30px; font-weight: bold; color: #D4AF37;">CC BEAUTY CLINIC</p>
      </div>
    `,
  };

  try {
    await mailTransporter.sendMail(mailOptions);
    console.log("✅ Client confirmation email sent");
  } catch (error) {
    console.error("❌ Client confirmation email error:", error.message);
  }
};

export const sendApprovalEmail = async (booking) => {
  console.log(`Sending approval email to: ${booking.email}`);
  const mailTransporter = getTransporter();
  if (!mailTransporter) return;

  const mailOptions = {
    from: `"CC Beauty" <${process.env.EMAIL_USER}>`,
    to: booking.email,
    subject: `✨ Your Reservation is Approved: ${booking.service}`,
    html: `
      <div style="font-family: serif; color: #1a1a1a; padding: 30px; border: 2px solid #D4AF37; max-width: 600px; margin: auto; background-color: #ffffff;">
        <h2 style="color: #D4AF37; text-align: center; text-transform: uppercase; letter-spacing: 2px;">Reservation Confirmed</h2>
        <p style="text-align: center; font-style: italic; color: #666;">We are pleased to welcome you to the CC Beauty experience.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p><strong>Service:</strong> ${booking.service}</p>
        <p><strong>Therapist:</strong> ${booking.staffId?.name || "Assigned Master"}</p>
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Time:</strong> ${booking.time}</p>
        <p><strong>Location:</strong> Kilimanjaro City Arcade, Nairobi, Kenya</p>
        <div style="background: #fdfaf0; padding: 20px; border-left: 4px solid #D4AF37; margin-top: 20px;">
          <p style="margin: 0; font-size: 14px; line-height: 1.6;">Please arrive 10 minutes prior to your appointment. If you need to reschedule, kindly notify us at least 24 hours in advance.</p>
        </div>
        <p style="text-align: center; margin-top: 30px; font-weight: bold; color: #D4AF37;">CC BEAUTY CLINIC</p>
      </div>
    `,
  };

  try {
    await mailTransporter.sendMail(mailOptions);
    console.log("✅ Approval email sent");
  } catch (error) {
    console.error("❌ Approval email error:", error.message);
  }
};

export const sendResetPasswordEmail = async (user, resetToken) => {
  const mailTransporter = getTransporter();
  if (!mailTransporter) return;

  const frontendUrl = process.env.FRONTEND_URL || "https://cc-beauty-system.pages.dev";
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"CC.BEAUTY.CLINIC" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `🔐 Private Access Reset - CC.BEAUTY.CLINIC`,
    html: `
      <div style="font-family: serif; background: #000; color: #fff; padding: 40px; border: 2px solid #FFD700; max-width: 500px; margin: auto;">
        <h2 style="color: #FFD700; text-align: center; text-transform: uppercase; letter-spacing: 4px;">Private Access</h2>
        <p style="text-align: center; color: #ccc; font-style: italic;">A request was made to reset your CC.BEAUTY.CLINIC account credentials.</p>
        <div style="text-align: center; margin: 40px 0;">
          <a href="${resetUrl}" style="background: #FFD700; color: #000; padding: 18px 36px; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">Reset Your Password</a>
        </div>
        <p style="font-size: 10px; color: #666; text-align: center;">This link will expire in 10 minutes. If you did not request this, please disregard this transmission.</p>
        <p style="text-align: center; margin-top: 30px; font-weight: bold; color: #FFD700; letter-spacing: 2px;">CC.BEAUTY.CLINIC</p>
      </div>
    `,
  };

  try {
    await mailTransporter.sendMail(mailOptions);
    console.log("✅ Reset email sent");
  } catch (error) {
    console.error("❌ Reset email error:", error.message);
  }
};

export const sendEnquiryEmail = async (enquiry) => {
  if (!process.env.TO_EMAIL) {
    console.error("❌ Cannot send enquiry email: TO_EMAIL is not defined in environment variables.");
    return;
  }

  const mailTransporter = getTransporter();
  if (!mailTransporter) return;

  console.log(`Attempting email for enquiry from: ${enquiry.name}`);

  const mailOptions = {
    from: `"CC Beauty" <${process.env.EMAIL_USER}>`,
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
      </div>
    `,
  };

  try {
    await mailTransporter.sendMail(mailOptions);
    console.log("✅ Enquiry email sent to owner");
  } catch (error) {
    console.error("❌ Enquiry email error detail:", error.message);
  }
};
