import nodemailer from 'nodemailer';

const GMAIL_USER = process.env.GMAIL_USER || 'mukund0107@gmail.com';
const rawPass = process.env.GMAIL_APP_PASSWORD || 'hoyhioharpdrhymx';
const GMAIL_APP_PASSWORD = rawPass.replace(/\s+/g, '');

// Create Gmail SMTP transporter
function getTransporter() {
  if (!GMAIL_APP_PASSWORD) {
    console.warn('⚠️ GMAIL_APP_PASSWORD is not configured. Email sending skipped.');
    return null;
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });
}

// ── OTP Email ─────────────────────────────────────────────────────────────────

interface SendOTPEmailParams {
  to: string;
  name: string;
  code: string;
  type?: 'verification' | 'password_reset';
}

export async function sendOTPEmail({ to, name, code, type = 'verification' }: SendOTPEmailParams) {
  const transporter = getTransporter();
  if (!transporter) {
    return { success: false, error: 'GMAIL_APP_PASSWORD missing' };
  }

  const subject = type === 'password_reset'
    ? `${code} is your BIS Assist Password Reset Code`
    : `${code} is your BIS Assist Verification Code`;

  const titleText = type === 'password_reset'
    ? 'Reset Your Password'
    : 'Verify Your Email Address';

  const introText = type === 'password_reset'
    ? 'Use the 6-digit verification code below to reset your BIS Assist account password.'
    : 'Thank you for registering with BIS Assist. Use the 6-digit verification code below to confirm your account email.';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAF8; margin: 0; padding: 0; color: #1B2A4A; }
        .container { max-width: 540px; margin: 30px auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E2DCD0; overflow: hidden; box-shadow: 0 12px 32px rgba(10,17,40,0.06); }
        .header { background: linear-gradient(135deg, #0A1128 0%, #1B2A4A 100%); padding: 32px 24px; text-align: center; }
        .logo { font-size: 22px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.05em; }
        .logo span { color: #C9943A; }
        .content { padding: 36px 32px; text-align: center; }
        .title { font-size: 20px; font-weight: 700; color: #0A1128; margin-bottom: 12px; }
        .text { font-size: 14px; line-height: 1.6; color: #4A5568; margin-bottom: 28px; }
        .otp-box { background: #F0F4F0; border: 2px dashed #B8CDBA; border-radius: 12px; padding: 20px; font-size: 36px; font-weight: 800; font-family: monospace; color: #0A1128; letter-spacing: 10px; margin: 0 auto 28px; display: inline-block; width: 80%; }
        .expiry-note { font-size: 13px; font-weight: 600; color: #C9943A; background: #FFFDF5; border: 1px solid #F3E5C8; padding: 10px 16px; border-radius: 8px; display: inline-block; margin-bottom: 24px; }
        .footer { background: #F4F6F4; padding: 20px; text-align: center; font-size: 12px; color: #718096; border-top: 1px solid #E2DCD0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🛡️ BIS <span>Assist</span></div>
        </div>
        <div class="content">
          <div class="title">${titleText}</div>
          <div class="text">Hello <strong>${name}</strong>,<br>${introText}</div>
          
          <div class="otp-box">${code}</div>

          <div class="expiry-note">⏱️ This code expires in <strong>10 minutes</strong>.</div>

          <div class="text" style="font-size: 12px; color: #A0AEC0; margin-bottom: 0;">
            If you did not request this verification code, please ignore this email.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} BIS Assist (SIH26107). Grounded Indian Standards Compliance Portal.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"BIS Assist" <${GMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log(`[Gmail OTP Sent] To: ${to} | MessageId: ${info.messageId}`);
    return { success: true, id: info.messageId };
  } catch (error: any) {
    console.error('[Gmail OTP Error]:', error);
    return { success: false, error: error.message || 'Email delivery failed' };
  }
}

// ── Welcome Email ─────────────────────────────────────────────────────────────

interface SendWelcomeEmailParams {
  to: string;
  name: string;
}

export async function sendWelcomeEmail({ to, name }: SendWelcomeEmailParams) {
  const transporter = getTransporter();
  if (!transporter) {
    return { success: false, error: 'GMAIL_APP_PASSWORD missing' };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bis-compliance-assistant.vercel.app';
  const chatUrl = `${appUrl}/chat`;
  const subject = `Welcome to BIS Assist, ${name}! 🛡️ Empowering Next-Gen Innovators`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAF8; margin: 0; padding: 0; color: #1B2A4A; }
        .container { max-width: 580px; margin: 30px auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E2DCD0; overflow: hidden; box-shadow: 0 12px 32px rgba(10,17,40,0.08); }
        .header { background: linear-gradient(135deg, #0A1128 0%, #1B2A4A 100%); padding: 36px 24px; text-align: center; }
        .logo { font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.05em; }
        .logo span { color: #C9943A; }
        .content { padding: 36px 32px; text-align: left; }
        .badge { background: #FFFDF5; border: 1px solid #F3E5C8; color: #C9943A; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 20px; display: inline-block; margin-bottom: 16px; letter-spacing: 0.05em; }
        .title { font-size: 22px; font-weight: 800; color: #0A1128; margin-bottom: 14px; text-align: left; }
        .text { font-size: 14.5px; line-height: 1.68; color: #4A5568; margin-bottom: 20px; }
        .founder-quote { background: #F8FAFC; border-left: 4px solid #1B2A4A; padding: 16px 20px; border-radius: 6px; margin: 20px 0; font-style: italic; color: #334155; font-size: 14px; }
        .feature-box { background: #F0F4F0; border-left: 4px solid #C9943A; padding: 18px 22px; border-radius: 10px; margin: 24px 0; }
        .feature-item { font-size: 14px; color: #1B2A4A; margin-bottom: 10px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
        .cta-btn { display: block; width: 85%; margin: 32px auto 20px; text-align: center; background: linear-gradient(135deg, #1B2A4A, #0A1128); color: #FFFFFF; border: 1px solid #C9943A; padding: 14px 24px; border-radius: 10px; font-size: 15px; font-weight: 700; text-decoration: none; box-shadow: 0 6px 20px rgba(27,42,74,0.3); }
        .footer { background: #F4F6F4; padding: 20px; text-align: center; font-size: 12px; color: #718096; border-top: 1px solid #E2DCD0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🛡️ BIS <span>Assist</span></div>
        </div>
        <div class="content">
          <span class="badge">🚀 BUILT FOR INNOVATORS &amp; NEXT-GEN FOUNDERS</span>
          <div class="title">Welcome aboard, ${name}! 👋</div>
          
          <div class="text">
            Building physical hardware, consumer electronics, or novel products in India comes with complex regulatory hurdles — Bureau of Indian Standards (BIS) Quality Control Orders (QCOs), ISI Marks, CRS Registrations, and mandatory NABL lab testing.
          </div>

          <div class="founder-quote">
            "BIS Assist was created to transform Indian regulatory compliance from a slow legal headache into an instant 1-click advantage for next-gen founders."
          </div>

          <div class="text">
            Here is how <strong>Bharat</strong> (your AI Compliance Guide) accelerates your product launch:
          </div>

          <div class="feature-box">
            <div class="feature-item">⚡ <strong>Instant IS Code Lookup:</strong> Search thousands of Indian Standards in seconds.</div>
            <div class="feature-item">🔍 <strong>CRS vs ISI Route Analysis:</strong> Know immediately if your product requires Scheme I (ISI) or Scheme II (CRS).</div>
            <div class="feature-item">📷 <strong>Camera Product Identification:</strong> Scan product prototypes with AI vision to get testing roadmaps.</div>
            <div class="feature-item">🎙️ <strong>Hands-Free Voice AI:</strong> Talk directly with your compliance assistant on the go.</div>
          </div>

          <div class="text">
            Ready to verify your product's compliance status? Launch your first query now!
          </div>

          <a href="${chatUrl}" class="cta-btn">Start Your Compliance Check →</a>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} BIS Assist (SIH26107). Official Indian Standards Compliance Platform.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"BIS Assist" <${GMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log(`[Gmail Welcome Sent] To: ${to} | MessageId: ${info.messageId}`);
    return { success: true, id: info.messageId };
  } catch (error: any) {
    console.error('[Gmail Welcome Error]:', error);
    return { success: false, error: error.message || 'Welcome email delivery failed' };
  }
}

// Keep resendClient export for backwards compatibility (unused but avoids import errors)
export const resendClient = null;
