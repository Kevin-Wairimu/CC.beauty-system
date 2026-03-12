import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const createTransporter = () => {
  // Extract and clean variables
  const email = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.trim();

  if (!email || !pass) {
    console.error('❌ Email config missing in .env!');
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: email,
      pass: pass,
    },
    tls: {
      // Do not fail on invalid certificates
      rejectUnauthorized: false
    }
  });
};

export const sendBookingEmail = async (booking) => {
  console.log(`📧 Attempting email for: ${booking.service}`);
  const transporter = createTransporter();
  
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
        <p><strong>Notes:</strong> ${booking.notes || 'None'}</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Booking email sent');
  } catch (error) {
    console.error('❌ Email error detail:', error.message);
    if (error.message.includes('BadCredentials')) {
      console.log('💡 HINT: Please check if "2-Step Verification" is ON and use a FRESH "App Password".');
    }
  }
};

export const sendApprovalEmail = async (booking) => {
  console.log(`📧 Sending approval email to: ${booking.email}`);
  const transporter = createTransporter();
  
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
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Time:</strong> ${booking.time}</p>
        <p><strong>Location:</strong> Kilimanjaro City Arcade, Nairobi CBD</p>
        <div style="background: #fdfaf0; padding: 20px; border-left: 4px solid #D4AF37; margin-top: 20px;">
          <p style="margin: 0; font-size: 14px; line-height: 1.6;">Please arrive 10 minutes prior to your appointment. If you need to reschedule, kindly notify us at least 24 hours in advance.</p>
        </div>
        <p style="text-align: center; margin-top: 30px; font-weight: bold; color: #D4AF37;">CC BEAUTY CLINIC</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Approval email sent');
  } catch (error) {
    console.error('❌ Approval email error:', error.message);
  }
};

export const sendResetPasswordEmail = async (user, resetToken) => {
  const transporter = createTransporter();
  const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `"CC Beauty" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `🔐 Password Reset Request - CC Beauty`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; max-width: 500px; margin: auto;">
        <h2 style="color: #333;">Password Reset</h2>
        <p>You requested a password reset for your CC Beauty account.</p>
        <p>Please click the button below to set a new password. This link is valid for 10 minutes.</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #D4AF37; color: white; text-decoration: none; border-radius: 4px; margin-top: 10px;">Reset Password</a>
        <p style="margin-top: 20px; font-size: 12px; color: #777;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('❌ Reset email error:', error.message);
  }
};

export const sendEnquiryEmail = async (enquiry) => {
  console.log(`📧 Attempting email for enquiry from: ${enquiry.name}`);
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"CC Beauty" <${process.env.EMAIL_USER}>`,
    to: process.env.TO_EMAIL,
    replyTo: enquiry.email,
    subject: `💌 New Enquiry: ${enquiry.name}`,
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
    await transporter.sendMail(mailOptions);
    console.log('✅ Enquiry email sent');
  } catch (error) {
    console.error('❌ Enquiry email error detail:', error.message);
  }
};
