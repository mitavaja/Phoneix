import nodemailer from "nodemailer";

const EMAIL_API_KEY = process.env.EMAIL_API_KEY || "your_email_api_key";
const EMAIL_FROM = process.env.EMAIL_FROM || "support@phoenixcommerce.com";

// Check if credentials are placeholder
const isSimulated = EMAIL_API_KEY.includes("your_");

let transporter = null;
if (!isSimulated) {
  try {
    // If it's SendGrid or Brevo, they usually use smtp server configuration
    transporter = nodemailer.createTransport({
      host: "smtp.sendgrid.net", // or smtp-relay.brevo.com
      port: 587,
      secure: false,
      auth: {
        user: "apikey", // common for sendgrid
        pass: EMAIL_API_KEY,
      },
    });
  } catch (err) {
    console.error("Nodemailer transporter initialization failed:", err.message);
  }
}

/**
 * Dispatch System Email
 */
export const sendSystemEmail = async ({ to, subject, html }) => {
  console.log(`\n--- [OUTBOUND EMAIL] ---`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`From: ${EMAIL_FROM}`);
  console.log(`Content Preview: ${html.substring(0, 150)}...`);
  console.log(`-------------------------\n`);

  if (isSimulated || !transporter) {
    return {
      success: true,
      message: "Email simulated (sent to logs)",
      simulated: true,
    };
  }

  try {
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });
    return {
      success: true,
      messageId: info.messageId,
      simulated: false,
    };
  } catch (err) {
    console.error("Nodemailer failed to dispatch email:", err.message);
    return {
      success: false,
      error: err.message,
      simulated: true,
    };
  }
};

/**
 * Helper to dispatch registration verification pending alert
 */
export const sendWelcomePendingEmail = async (userEmail, name) => {
  return sendSystemEmail({
    to: userEmail,
    subject: "Welcome to Phoenix Commerce - Registration Received",
    html: `
      <h2>Hello ${name},</h2>
      <p>Thank you for registering a merchant profile on Phoenix Commerce.</p>
      <p><strong>Your account is currently pending KYC verification.</strong></p>
      <p>Our compliance team is auditing your Aadhaar/PAN files. You will receive an email confirmation once authorized.</p>
      <br/>
      <p>Best Regards,</p>
      <p>Compliance Team, Phoenix Commerce</p>
    `,
  });
};

/**
 * Helper to dispatch KYC verified alert
 */
export const sendKYCApprovedEmail = async (userEmail, name, storeName) => {
  return sendSystemEmail({
    to: userEmail,
    subject: "KYC Verified & Activated - Phoenix Commerce",
    html: `
      <h2>Congratulations ${name}!</h2>
      <p>Your store <strong>${storeName}</strong> has passed our compliance audit.</p>
      <p>Your merchant portal account is now <strong>Active</strong>. You can now recharge your wallet, check rates, and book shipments!</p>
      <br/>
      <p>Happy Shipping,</p>
      <p>Phoenix Commerce Team</p>
    `,
  });
};

/**
 * Helper to dispatch KYC Reupload alert
 */
export const sendKYCReuploadEmail = async (userEmail, name, reason) => {
  return sendSystemEmail({
    to: userEmail,
    subject: "KYC Document Re-upload Requested - Action Required",
    html: `
      <h2>Hello ${name},</h2>
      <p>During our audit of your compliance files, we encountered an issue:</p>
      <blockquote style="background:#f4f4f4; border-left:4px solid #ff6a00; padding:10px;">${reason}</blockquote>
      <p>Please log in to your dashboard and re-upload clear copies of the requested documents.</p>
      <br/>
      <p>Best Regards,</p>
      <p>Compliance Team, Phoenix Commerce</p>
    `,
  });
};

/**
 * Helper to dispatch Wallet Recharge alert
 */
export const sendWalletRechargeEmail = async (userEmail, name, amount, currentBalance) => {
  return sendSystemEmail({
    to: userEmail,
    subject: "Wallet Deposit Received - Phoenix Commerce",
    html: `
      <h2>Hello ${name},</h2>
      <p>We have successfully credited <strong>₹${amount.toFixed(2)}</strong> to your store wallet.</p>
      <p>Your updated available balance is: <strong>₹${currentBalance.toFixed(2)}</strong></p>
      <br/>
      <p>Best Regards,</p>
      <p>Finance Desk, Phoenix Commerce</p>
    `,
  });
};

/**
 * Helper to dispatch Shipment Booked alert
 */
export const sendShipmentBookedEmail = async (userEmail, awb, customer, dest) => {
  return sendSystemEmail({
    to: userEmail,
    subject: `Shipment Dispatched: AWB ${awb} - Phoenix Commerce`,
    html: `
      <h2>Hello Merchant,</h2>
      <p>A new shipment has been successfully booked through your account.</p>
      <p><strong>AWB Number:</strong> ${awb}</p>
      <p><strong>Recipient:</strong> ${customer}</p>
      <p><strong>Destination:</strong> ${dest}</p>
      <p>Funds have been debited from your wallet. Shipping label PDF is now ready for download.</p>
      <br/>
      <p>Best Regards,</p>
      <p>Logistics Desk, Phoenix Commerce</p>
    `,
  });
};
