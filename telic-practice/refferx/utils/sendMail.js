import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendWelcomeEmail = async (email, username, password) => {
  const Adminemail = process.env.EMAIL_USER;
  const Adminpassword = process.env.EMAIL_PASSWORD;
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: Adminemail,
        pass: Adminpassword,
      },
    });

    const mailOptions = {
      from: `"Ordimax" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🎉 Welcome to Ordimax — Your Account is Ready!",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Ordimax</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
</head>
<body style="margin:0;padding:0;background-color:#0a0c10;font-family:'DM Sans',sans-serif;">

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0c10;padding:40px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:linear-gradient(160deg,#13161e 0%,#0e1117 100%);border-radius:20px;overflow:hidden;border:1px solid #2a2d3a;box-shadow:0 0 60px rgba(212,175,55,0.08);">

          <!-- Gold top bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#b8860b,#f5d061,#b8860b);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td align="center" style="padding:48px 40px 32px;">
              <!-- Logo mark -->
              <div style="display:inline-block;background:linear-gradient(135deg,#1e2030,#252840);border:1px solid #2e3250;border-radius:16px;padding:14px 22px;margin-bottom:28px;">
                <span style="font-family:'Playfair Display',serif;font-size:22px;background:linear-gradient(90deg,#f5d061,#c9973a);-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:0.5px;">
                  Ordimax
                </span>
              </div>

          
              <h1 style="margin:0 0 12px;font-family:'Playfair Display',serif;font-size:32px;color:#f0f0f0;letter-spacing:-0.5px;">
                Welcome Aboard!
              </h1>
              <p style="margin:0;font-size:16px;color:#8a8fa8;line-height:1.6;max-width:400px;">
                Your account has been created successfully. You're now part of a smarter crypto community.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:linear-gradient(90deg,transparent,#2a2d3a,transparent);"></div>
            </td>
          </tr>

          <!-- Credentials box -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 20px;font-size:13px;font-weight:600;color:#f5d061;letter-spacing:2px;text-transform:uppercase;">
                Your Login Credentials
              </p>

              <!-- Username -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                <tr>
                  <td style="background:#161922;border:1px solid #2a2d3a;border-radius:12px;padding:16px 20px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#5a5e75;letter-spacing:1.5px;text-transform:uppercase;">Username</p>
                    <p style="margin:0;font-size:17px;font-weight:600;color:#e8e8f0;letter-spacing:0.3px;">${username}</p>
                  </td>
                </tr>
              </table>

              <!-- Password -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#161922;border:1px solid #2a2d3a;border-radius:12px;padding:16px 20px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#5a5e75;letter-spacing:1.5px;text-transform:uppercase;">Password</p>
                    <p style="margin:0;font-size:17px;font-weight:600;color:#e8e8f0;letter-spacing:2px;font-family:monospace;">${password}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Security notice -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#1a1f2e,#161b28);border:1px solid #2a3050;border-radius:12px;padding:16px 20px;">
                    <p style="margin:0;font-size:13px;color:#6a7090;line-height:1.7;">
                      🔒 <strong style="color:#8890b0;">Security tip:</strong> Please change your password after your first login. Never share your credentials with anyone.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding:0 40px 48px;">
              <a href="#" style="display:inline-block;background:linear-gradient(135deg,#c9973a,#f5d061,#c9973a);color:#0a0c10;font-size:15px;font-weight:700;text-decoration:none;padding:16px 48px;border-radius:50px;letter-spacing:0.5px;">
                Login to Your Account →
              </a>
            </td>
          </tr>

          <!-- Gold divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:linear-gradient(90deg,transparent,#2a2d3a,transparent);"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:28px 40px 40px;">
              <p style="margin:0 0 8px;font-size:13px;color:#3a3e55;">
                Need help? Reach us at
                <a href="mailto:${process.env.EMAIL_USER}" style="color:#c9973a;text-decoration:none;">${process.env.EMAIL_USER}</a>
              </p>
              <p style="margin:0;font-size:12px;color:#2e3148;">
                © ${new Date().getFullYear()} Ordimax. All rights reserved.
              </p>
            </td>
          </tr>

          <!-- Gold bottom bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#b8860b,#f5d061,#b8860b);"></td>
          </tr>

        </table>
        <!-- End Card -->

      </td>
    </tr>
  </table>

</body>
</html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (error) {
    console.error("❌ Email Error:", error);
  }
};

export const sendPackagePurchaseEmail = async (
  email,
  username,
  { packageName, usdtAmount, odmAmount, txHash, dailyROI, durationDays },
) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Ordimax" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "✅ Package Purchased Successfully — Ordimax",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Package Purchased</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
</head>
<body style="margin:0;padding:0;background-color:#0a0c10;font-family:'DM Sans',sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0c10;padding:40px 16px;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:linear-gradient(160deg,#13161e 0%,#0e1117 100%);border-radius:20px;overflow:hidden;border:1px solid #2a2d3a;box-shadow:0 0 60px rgba(212,175,55,0.08);">

          <!-- Gold top bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#b8860b,#f5d061,#b8860b);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td align="center" style="padding:48px 40px 32px;">
              <div style="display:inline-block;background:linear-gradient(135deg,#1e2030,#252840);border:1px solid #2e3250;border-radius:16px;padding:14px 22px;margin-bottom:28px;">
                <span style="font-family:'Playfair Display',serif;font-size:22px;background:linear-gradient(90deg,#f5d061,#c9973a);-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:0.5px;">
                  Ordimax
                </span>
              </div>

              <!-- Success icon -->
              <div style="width:64px;height:64px;background:linear-gradient(135deg,#1a2e1a,#162516);border:1px solid #2a4a2a;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;font-size:30px;line-height:64px;text-align:center;">
                ✅
              </div>

              <h1 style="margin:0 0 12px;font-family:'Playfair Display',serif;font-size:30px;color:#f0f0f0;letter-spacing:-0.5px;">
                Package Activated!
              </h1>
              <p style="margin:0;font-size:16px;color:#8a8fa8;line-height:1.6;max-width:400px;">
                Hey <strong style="color:#f5d061;">${username}</strong>, your investment is live. Your earnings will start from the next cycle.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:linear-gradient(90deg,transparent,#2a2d3a,transparent);"></div>
            </td>
          </tr>

          <!-- Investment Details -->
          <tr>
            <td style="padding:36px 40px 24px;">
              <p style="margin:0 0 20px;font-size:13px;font-weight:600;color:#f5d061;letter-spacing:2px;text-transform:uppercase;">
                Investment Summary
              </p>

              <!-- Package Name -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
                <tr>
                  <td style="background:#161922;border:1px solid #2a2d3a;border-radius:12px;padding:14px 20px;">
                    <p style="margin:0 0 3px;font-size:11px;font-weight:600;color:#5a5e75;letter-spacing:1.5px;text-transform:uppercase;">Package</p>
                    <p style="margin:0;font-size:16px;font-weight:600;color:#f5d061;">${packageName}</p>
                  </td>
                </tr>
              </table>

              <!-- Two col: USDT + ODM -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
                <tr>
                  <td width="49%" style="background:#161922;border:1px solid #2a2d3a;border-radius:12px;padding:14px 20px;">
                    <p style="margin:0 0 3px;font-size:11px;font-weight:600;color:#5a5e75;letter-spacing:1.5px;text-transform:uppercase;">Amount (USDT)</p>
                    <p style="margin:0;font-size:16px;font-weight:600;color:#e8e8f0;">$${usdtAmount}</p>
                  </td>
                  <td width="2%"></td>
                  <td width="49%" style="background:#161922;border:1px solid #2a2d3a;border-radius:12px;padding:14px 20px;">
                    <p style="margin:0 0 3px;font-size:11px;font-weight:600;color:#5a5e75;letter-spacing:1.5px;text-transform:uppercase;">Amount (ODM)</p>
                    <p style="margin:0;font-size:16px;font-weight:600;color:#e8e8f0;">${odmAmount.toFixed(4)} ODM</p>
                  </td>
                </tr>
              </table>

              <!-- Two col: Daily ROI + Duration -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
                <tr>
                  <td width="49%" style="background:#161922;border:1px solid #2a2d3a;border-radius:12px;padding:14px 20px;">
                    <p style="margin:0 0 3px;font-size:11px;font-weight:600;color:#5a5e75;letter-spacing:1.5px;text-transform:uppercase;">Daily ROI</p>
                    <p style="margin:0;font-size:16px;font-weight:600;color:#4ade80;">${dailyROI}%</p>
                  </td>
                  <td width="2%"></td>
                  <td width="49%" style="background:#161922;border:1px solid #2a2d3a;border-radius:12px;padding:14px 20px;">
                    <p style="margin:0 0 3px;font-size:11px;font-weight:600;color:#5a5e75;letter-spacing:1.5px;text-transform:uppercase;">Duration</p>
                    <p style="margin:0;font-size:16px;font-weight:600;color:#e8e8f0;">${durationDays > 0 ? durationDays + " Days" : "Lifetime"}</p>
                  </td>
                </tr>
              </table>

              <!-- TxHash -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#161922;border:1px solid #2a2d3a;border-radius:12px;padding:14px 20px;">
                    <p style="margin:0 0 3px;font-size:11px;font-weight:600;color:#5a5e75;letter-spacing:1.5px;text-transform:uppercase;">Transaction Hash</p>
                    <p style="margin:0;font-size:13px;font-weight:500;color:#8890b0;word-break:break-all;font-family:monospace;">${txHash}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Info notice -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#1a1f2e,#161b28);border:1px solid #2a3050;border-radius:12px;padding:16px 20px;">
                    <p style="margin:0;font-size:13px;color:#6a7090;line-height:1.7;">
                      📈 <strong style="color:#8890b0;">Earnings start from tomorrow.</strong> You can track your daily ROI and total earnings from your dashboard.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding:0 40px 48px;">
              <a href="#" style="display:inline-block;background:linear-gradient(135deg,#c9973a,#f5d061,#c9973a);color:#0a0c10;font-size:15px;font-weight:700;text-decoration:none;padding:16px 48px;border-radius:50px;letter-spacing:0.5px;">
                View Dashboard →
              </a>
            </td>
          </tr>

          <!-- Gold divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:linear-gradient(90deg,transparent,#2a2d3a,transparent);"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:28px 40px 40px;">
              <p style="margin:0 0 8px;font-size:13px;color:#3a3e55;">
                Need help? Reach us at
                <a href="mailto:${process.env.EMAIL_USER}" style="color:#c9973a;text-decoration:none;">${process.env.EMAIL_USER}</a>
              </p>
              <p style="margin:0;font-size:12px;color:#2e3148;">
                © ${new Date().getFullYear()} Ordimax. All rights reserved.
              </p>
            </td>
          </tr>

          <!-- Gold bottom bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#b8860b,#f5d061,#b8860b);"></td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Package purchase email sent to ${email}`);
  } catch (error) {
    console.error("❌ Package Email Error:", error);
  }
};
