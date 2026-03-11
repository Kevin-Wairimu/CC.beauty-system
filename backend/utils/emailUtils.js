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

export const sendEnquiryEmail = async (enquiry) => {
  console.log(`📧 Attempting email for: ${enquiry.name}`);
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
    console.error('❌ Email error detail:', error.message);
  }
};
