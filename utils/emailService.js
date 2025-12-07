const nodemailer = require("nodemailer");

// Create transporter with Gmail (or any SMTP service)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASS || "your-app-password"
  }
});

// Generate HTML Email Template for Booking Confirmation
const generateBookingEmailHTML = (booking, turf, user) => {
  const bookingDate = new Date(booking.date).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - TurfZone</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #11D25B 0%, #0FBA50 100%); padding: 30px; text-align: center; border-radius: 16px 16px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🏟️ TurfZone</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Your Sports Booking Platform</p>
    </div>
    
    <!-- Success Banner -->
    <div style="background: white; padding: 30px; text-align: center; border-bottom: 1px solid #e2e8f0;">
      <div style="width: 60px; height: 60px; background: #e8faf0; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px;">
        <span style="font-size: 30px;">✅</span>
      </div>
      <h2 style="color: #1a1a2e; margin: 0 0 10px; font-size: 24px;">Booking Confirmed!</h2>
      <p style="color: #718096; margin: 0;">Your slot has been successfully booked</p>
    </div>
    
    <!-- Ticket Section -->
    <div style="background: white; padding: 30px;">
      <div style="background: linear-gradient(145deg, #0E273A, #1a3a52); border-radius: 16px; padding: 25px; color: white; position: relative; overflow: hidden;">
        <!-- Ticket Holes -->
        <div style="position: absolute; left: -15px; top: 50%; transform: translateY(-50%); width: 30px; height: 30px; background: #f5f7fa; border-radius: 50%;"></div>
        <div style="position: absolute; right: -15px; top: 50%; transform: translateY(-50%); width: 30px; height: 30px; background: #f5f7fa; border-radius: 50%;"></div>
        
        <!-- Booking ID -->
        <div style="text-align: center; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 1px;">Booking ID</p>
          <p style="margin: 5px 0 0; font-size: 18px; font-weight: bold; color: #11D25B;">#${booking._id.toString().slice(-8).toUpperCase()}</p>
        </div>
        
        <!-- Venue Name -->
        <h3 style="text-align: center; margin: 0 0 20px; font-size: 22px;">${turf.name}</h3>
        
        <!-- Details Grid -->
        <div style="border-top: 1px dashed rgba(255,255,255,0.2); padding-top: 20px;">
          <table style="width: 100%;" cellpadding="10" cellspacing="0">
            <tr>
              <td style="width: 50%;">
                <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.7); text-transform: uppercase;">Date</p>
                <p style="margin: 5px 0 0; font-size: 16px; font-weight: 600;">📅 ${bookingDate}</p>
              </td>
              <td style="width: 50%;">
                <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.7); text-transform: uppercase;">Time Slot</p>
                <p style="margin: 5px 0 0; font-size: 16px; font-weight: 600;">⏰ ${booking.timeSlot}</p>
              </td>
            </tr>
            <tr>
              <td>
                <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.7); text-transform: uppercase;">Location</p>
                <p style="margin: 5px 0 0; font-size: 14px;">📍 ${turf.location}</p>
              </td>
              <td>
                <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.7); text-transform: uppercase;">Amount</p>
                <p style="margin: 5px 0 0; font-size: 18px; font-weight: bold; color: #11D25B;">₹${turf.pricePerHour}</p>
              </td>
            </tr>
          </table>
        </div>
      </div>
      
      <!-- Customer Details -->
      <div style="margin-top: 25px; padding: 20px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
        <h4 style="margin: 0 0 15px; color: #1a1a2e; font-size: 16px;">Customer Details</h4>
        <p style="margin: 5px 0; color: #4a5568;">
          <strong>Name:</strong> ${user.name || 'Guest User'}
        </p>
        <p style="margin: 5px 0; color: #4a5568;">
          <strong>Email:</strong> ${user.email}
        </p>
      </div>
      
      <!-- Important Notes -->
      <div style="margin-top: 25px; padding: 20px; background: #fffbeb; border-radius: 12px; border: 1px solid #fcd34d;">
        <h4 style="margin: 0 0 10px; color: #92400e; font-size: 14px;">📌 Important Notes</h4>
        <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 13px; line-height: 1.8;">
          <li>Please arrive 10 minutes before your slot</li>
          <li>Carry sports shoes and appropriate gear</li>
          <li>Show this email as proof of booking</li>
          <li>Cancellation allowed up to 24 hours before</li>
        </ul>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: #0E273A; padding: 25px; text-align: center; border-radius: 0 0 16px 16px;">
      <p style="color: rgba(255,255,255,0.8); margin: 0 0 10px; font-size: 14px;">
        Thank you for booking with TurfZone! 🎉
      </p>
      <p style="color: rgba(255,255,255,0.5); margin: 0; font-size: 12px;">
        © ${new Date().getFullYear()} TurfZone. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

// Send Booking Confirmation Email
const sendBookingConfirmation = async (booking, turf, user) => {
  try {
    if (!user.email) {
      console.log("No email address provided for user");
      return { success: false, error: "No email address" };
    }

    const mailOptions = {
      from: `"TurfZone" <${process.env.EMAIL_USER || "noreply@turfzone.com"}>`,
      to: user.email,
      subject: `✅ Booking Confirmed - ${turf.name} | TurfZone`,
      html: generateBookingEmailHTML(booking, turf, user)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Booking confirmation email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send email:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendBookingConfirmation };
