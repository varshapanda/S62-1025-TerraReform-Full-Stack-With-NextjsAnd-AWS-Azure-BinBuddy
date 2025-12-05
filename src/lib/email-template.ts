// Helper function to get the base URL based on environment
const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
};

export const welcomeTemplate = (userName: string) => {
  const baseUrl = getBaseUrl();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6; 
      color: #f8fafc;
      margin: 0;
      padding: 0;
    }
    .email-wrapper {
      width: 100%;
      padding: 40px 20px;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: #1e293b;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .header { 
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      color: white; 
      padding: 50px 30px; 
      text-align: center;
      position: relative;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
      color: white;
    }
    .header-subtitle {
      margin: 10px 0 0 0;
      opacity: 0.9;
      font-size: 16px;
      color: white;
    }
    .content { 
      padding: 40px 30px; 
      background: #1e293b;
      color: #e2e8f0;
    }
    .content h2 {
      color: #10b981;
      margin-top: 0;
      font-weight: 600;
      font-size: 24px;
    }
    .content p {
      color: #cbd5e1;
      font-size: 16px;
      line-height: 1.8;
      margin: 16px 0;
    }
    .feature-box {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%);
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 24px;
      margin: 25px 0;
      border-radius: 12px;
      color: #a7f3d0;
    }
    .feature-box strong {
      color: #34d399;
    }
    .feature-list {
      margin: 30px 0;
      padding: 0;
      list-style: none;
    }
    .feature-list li {
      padding: 12px 0 12px 30px;
      position: relative;
      color: #cbd5e1;
      font-size: 15px;
      line-height: 1.6;
    }
    .feature-list li:before {
      content: "→";
      position: absolute;
      left: 0;
      color: #10b981;
      font-weight: bold;
      font-size: 18px;
    }
    .feature-list strong {
      color: #e2e8f0;
    }
    .button-container {
      text-align: center;
      margin: 35px 0;
    }
    .button {
      display: inline-block;
      padding: 16px 40px;
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      color: white !important;
      text-decoration: none;
      border-radius: 10px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 15px rgba(5, 150, 105, 0.4);
    }
    .info-box {
      background: rgba(51, 65, 85, 0.5);
      border-left: 4px solid #64748b;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
      color: #cbd5e1;
    }
    .footer { 
      text-align: center; 
      padding: 30px; 
      font-size: 13px; 
      color: #64748b; 
      background: #0f172a;
      border-top: 1px solid #334155;
    }
    .footer p {
      margin: 8px 0;
      color: #64748b;
    }
    .footer strong {
      color: #10b981;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="container">
      <div class="header">
        <h1>Welcome to BinBuddy</h1>
        <p class="header-subtitle">Smart Waste Management Starts Here</p>
      </div>
      
      <div class="content">
        <h2>Hello ${userName},</h2>
        <p>
          Welcome to the BinBuddy community! We're excited to have you join our mission to make 
          waste management smarter, easier, and more impactful through volunteer-driven verification 
          and community collaboration.
        </p>
        
        <div class="feature-box">
          <strong>Your account is now active!</strong><br><br>
          You can start reporting waste, earning recognition, and making a real environmental impact 
          through our community-verified system.
        </div>

        <h3 style="color: #10b981; margin-top: 30px; font-weight: 600; font-size: 20px;">What You Can Do Now</h3>
        <ul class="feature-list">
          <li><strong>Upload Waste Images</strong> – Community volunteers verify proper segregation</li>
          <li><strong>Earn Points</strong> – Get rewarded for every verified report</li>
          <li><strong>Climb Leaderboards</strong> – Compete with your community</li>
          <li><strong>Unlock Badges</strong> – Achieve milestones and build your reputation</li>
        </ul>

        <div class="button-container">
          <a href="${baseUrl}/dashboard" class="button">
            Go to Dashboard
          </a>
        </div>

        <div class="info-box">
          <strong>Need help getting started?</strong><br><br>
          Check out our quick start guide in the dashboard or reach out to our support team 
          at support@binbuddy.com
        </div>
      </div>
      
      <div class="footer">
        <p><strong>BinBuddy</strong> – Smart Waste Segregation & Management</p>
        <p>Community-Driven Verification | Environmental Impact Tracking</p>
        <p style="margin-top: 15px;">&copy; 2025 BinBuddy. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
};

export const passwordResetTemplate = (userName: string, resetLink: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6; 
      color: #f8fafc;
      margin: 0;
      padding: 0;
    }
    .email-wrapper {
      width: 100%;
      padding: 40px 20px;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: #1e293b;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .header { 
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      color: white; 
      padding: 50px 30px; 
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
      color: white;
    }
    .content { 
      padding: 40px 30px; 
      background: #1e293b;
      color: #e2e8f0;
    }
    .content h2 {
      color: #10b981;
      margin-top: 0;
      font-weight: 600;
      font-size: 24px;
    }
    .content p {
      color: #cbd5e1;
      font-size: 16px;
      line-height: 1.8;
      margin: 16px 0;
    }
    .button-container {
      text-align: center;
      margin: 35px 0;
    }
    .button {
      display: inline-block;
      padding: 16px 40px;
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      color: white !important;
      text-decoration: none;
      border-radius: 10px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 15px rgba(5, 150, 105, 0.4);
    }
    .warning-box {
      background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%);
      border: 1px solid rgba(251, 191, 36, 0.3);
      padding: 24px;
      margin: 25px 0;
      border-radius: 12px;
    }
    .warning-box p {
      margin: 0;
      color: #fde68a;
      font-size: 14px;
      line-height: 1.8;
    }
    .warning-box strong {
      color: #fbbf24;
    }
    .info-box {
      background: rgba(51, 65, 85, 0.5);
      border-left: 4px solid #64748b;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
      color: #cbd5e1;
    }
    .link-box {
      background: rgba(15, 23, 42, 0.7);
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
      word-break: break-all;
      font-size: 13px;
      color: #94a3b8;
      font-family: 'Courier New', monospace;
    }
    .footer { 
      text-align: center; 
      padding: 30px; 
      font-size: 13px; 
      color: #64748b; 
      background: #0f172a;
      border-top: 1px solid #334155;
    }
    .footer p {
      margin: 8px 0;
      color: #64748b;
    }
    .footer strong {
      color: #10b981;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="container">
      <div class="header">
        <h1>Password Reset Request</h1>
      </div>
      
      <div class="content">
        <h2>Hi ${userName},</h2>
        <p>
          We received a request to reset your password for your BinBuddy account. 
          If you didn't make this request, you can safely ignore this email.
        </p>
        
        <div class="info-box">
          <strong>To reset your password, click the button below:</strong>
        </div>

        <div class="button-container">
          <a href="${resetLink}" class="button">
            Reset My Password
          </a>
        </div>

        <p style="font-size: 14px; color: #94a3b8; margin-top: 30px;">
          Or copy and paste this link into your browser:
        </p>
        <div class="link-box">
          ${resetLink}
        </div>

        <div class="warning-box">
          <p>
            <strong>Security Notice</strong><br><br>
            • This link will expire in 1 hour<br>
            • If you didn't request this password reset, please ignore this email<br>
            • Your password will remain unchanged unless you click the link above<br>
            • For security concerns, contact our support team immediately
          </p>
        </div>
      </div>
      
      <div class="footer">
        <p><strong>BinBuddy</strong> - Smart Waste Segregation & Management</p>
        <p>Community-Driven Verification | Environmental Impact Tracking</p>
        <p style="margin-top: 15px;">&copy; 2025 BinBuddy. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const emailVerificationTemplate = (
  userName: string,
  verificationUrl: string
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6; 
      color: #f8fafc;
      margin: 0;
      padding: 0;
    }
    .email-wrapper {
      width: 100%;
      padding: 40px 20px;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: #1e293b;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .header { 
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      color: white; 
      padding: 50px 30px; 
      text-align: center;
      position: relative;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
      color: white;
    }
    .content { 
      padding: 40px 30px; 
      background: #1e293b;
      color: #e2e8f0;
    }
    .content h2 {
      color: #10b981;
      margin-top: 0;
      font-weight: 600;
      font-size: 24px;
    }
    .content p {
      color: #cbd5e1;
      font-size: 16px;
      line-height: 1.8;
      margin: 16px 0;
    }
    .verify-box {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%);
      border: 2px solid rgba(16, 185, 129, 0.3);
      border-radius: 12px;
      padding: 30px;
      margin: 30px 0;
      text-align: center;
    }
    .verify-box p {
      margin: 0 0 20px 0;
      color: #a7f3d0;
      font-weight: 600;
      font-size: 15px;
    }
    .button {
      display: inline-block;
      padding: 16px 40px;
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      color: white !important;
      text-decoration: none;
      border-radius: 10px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 15px rgba(5, 150, 105, 0.4);
    }
    .info-box {
      background: rgba(51, 65, 85, 0.5);
      border-left: 4px solid #64748b;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
      color: #cbd5e1;
    }
    .feature-list {
      margin: 20px 0;
      padding: 0;
      list-style: none;
    }
    .feature-list li {
      padding: 10px 0 10px 28px;
      position: relative;
      color: #cbd5e1;
      font-size: 15px;
    }
    .feature-list li:before {
      content: "→";
      position: absolute;
      left: 0;
      color: #10b981;
      font-weight: bold;
      font-size: 18px;
    }
    .warning-box {
      background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%);
      border: 1px solid rgba(251, 191, 36, 0.3);
      padding: 20px;
      margin: 25px 0;
      border-radius: 12px;
    }
    .warning-box p {
      margin: 0;
      color: #fde68a;
      font-size: 14px;
    }
    .warning-box strong {
      color: #fbbf24;
    }
    .link-box {
      background: rgba(15, 23, 42, 0.7);
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
      word-break: break-all;
      font-size: 13px;
      color: #94a3b8;
      font-family: 'Courier New', monospace;
    }
    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, #334155, transparent);
      margin: 30px 0;
    }
    .footer { 
      text-align: center; 
      padding: 30px; 
      font-size: 13px; 
      color: #64748b; 
      background: #0f172a;
      border-top: 1px solid #334155;
    }
    .footer p {
      margin: 8px 0;
      color: #64748b;
    }
    .footer strong {
      color: #10b981;
    }
    .footer a {
      color: #10b981;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="container">
      <div class="header">
        <h1>Verify Your Email</h1>
      </div>
      
      <div class="content">
        <h2>Hello ${userName},</h2>
        <p>
          Thank you for signing up for <strong>BinBuddy</strong>! We're excited to have you join our 
          community of environmental champions making waste management smarter and more sustainable 
          through volunteer-driven verification.
        </p>
        
        <div class="verify-box">
          <p>Click the button below to verify your email and activate your account:</p>
          <a href="${verificationUrl}" class="button">
            Verify My Email
          </a>
        </div>

        <div class="divider"></div>

        <p style="font-size: 15px; color: #cbd5e1; font-weight: 600;">
          What happens after verification?
        </p>
        <ul class="feature-list">
          <li>Full access to your personalized dashboard</li>
          <li>Start reporting waste and earning points through community verification</li>
          <li>Join community leaderboards and connect with volunteers</li>
          <li>Unlock achievement badges and build your reputation</li>
        </ul>

        <div class="warning-box">
          <p>
            <strong>This link expires in 24 hours</strong><br><br>
            For security reasons, this verification link will only be valid for 24 hours. 
            If it expires, you can request a new verification email from the login page.
          </p>
        </div>

        <div class="info-box">
          <p>
            <strong>Didn't create an account?</strong><br><br>
            If you didn't sign up for BinBuddy, you can safely ignore this email. 
            No account will be created without verification.
          </p>
        </div>

        <div class="divider"></div>

        <p style="font-size: 14px; color: #94a3b8;">
          If the button doesn't work, copy and paste this link into your browser:
        </p>
        <div class="link-box">${verificationUrl}</div>
      </div>
      
      <div class="footer">
        <p><strong>BinBuddy</strong> – Smart Waste Segregation & Management</p>
        <p>Community-Driven Verification | Environmental Impact Tracking</p>
        <p style="margin-top: 10px;">
          Need help? Contact us at <a href="mailto:support@binbuddy.com">support@binbuddy.com</a>
        </p>
        <p style="margin-top: 15px;">&copy; 2025 BinBuddy. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
