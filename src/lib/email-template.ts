export const welcomeTemplate = (userName: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6; 
      color: #333; 
      margin: 0;
      padding: 0;
      background-color: #ffffff;
    }
    .container { 
      max-width: 600px; 
      margin: 20px auto; 
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 0 0 1px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.1);
    }
    .header { 
      background: #000000;
      color: white; 
      padding: 40px 20px; 
      text-align: center; 
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .emoji {
      font-size: 48px;
      display: block;
      margin-bottom: 15px;
    }
    .content { 
      padding: 40px 30px; 
    }
    .content h2 {
      color: #000000;
      margin-top: 0;
      font-weight: 600;
    }
    .feature-box {
      background: #f8f8f8;
      border-left: 4px solid #404040;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: #000000;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: 500;
      border: none;
      cursor: pointer;
    }
    .stats {
      display: flex;
      justify-content: space-around;
      margin: 30px 0;
      text-align: center;
    }
    .stat-item {
      flex: 1;
    }
    .stat-number {
      font-size: 28px;
      font-weight: 600;
      color: #000000;
    }
    .stat-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .footer { 
      text-align: center; 
      padding: 30px; 
      font-size: 13px; 
      color: #666; 
      background: #f8f8f8;
      border-top: 1px solid #e0e0e0;
    }
    ul {
      padding-left: 20px;
      margin: 20px 0;
    }
    li {
      margin: 12px 0;
      line-height: 1.5;
    }
    .subtitle {
      margin: 10px 0 0 0;
      opacity: 0.8;
      font-size: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="emoji">♻️</span>
      <h1>Welcome to BinBuddy</h1>
      <p class="subtitle">Smart Waste Management Starts Here</p>
    </div>
    
    <div class="content">
      <h2>Hello ${userName}</h2>
      <p>
        Welcome to the BinBuddy community! We're thrilled to have you join us in making 
        waste management smarter, easier, and more rewarding.
      </p>
      
      <div class="feature-box">
        <strong>Your account is now active!</strong><br>
        You can start reporting waste, earning points, and making a real environmental impact.
      </div>

      <h3 style="color: #000000; margin-top: 30px; font-weight: 600;">What You Can Do Now:</h3>
      <ul>
        <li><strong>Upload Waste Images</strong> - Use AI to verify proper segregation</li>
        <li><strong>Earn Points</strong> - Get rewarded for every verified report</li>
        <li><strong>Climb Leaderboards</strong> - Compete with your community</li>
        <li><strong>Unlock Badges</strong> - Achieve milestones and show off</li>
      </ul>

<div style="text-align: center; margin: 30px 0;">
  <a href="http://localhost:3000/dashboard" class="button" style="color: white !important;">
    Go to Dashboard →
  </a>
</div>

      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        <strong>Need help getting started?</strong><br>
        Check out our quick start guide or reach out to our support team.
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 0 0 10px 0;"><strong>BinBuddy</strong> - Smart Waste Segregation & Management</p>
      <p style="margin: 0; color: #999;">This is an automated email. Please do not reply.</p>
      <p style="margin: 10px 0 0 0; color: #999;">&copy; 2025 BinBuddy. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const passwordResetTemplate = (resetLink: string, userName: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      line-height: 1.6;
      padding: 20px;
      background-color: #ffffff;
    }
    .container {
      max-width: 500px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 0 0 1px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.1);
    }
    .button {
      display: inline-block;
      background: #000000;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: 500;
    }
    h2 {
      color: #000000;
      margin-top: 0;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Password Reset Request</h2>
    <p>Hi ${userName},</p>
    <p>You requested to reset your BinBuddy password. Click the button below to proceed:</p>
    <p style="text-align: center;">
      <a href="${resetLink}" class="button">Reset Password</a>
    </p>
    <p><small>This link expires in 1 hour.</small></p>
    <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
    <p style="font-size: 12px; color: #666;">BinBuddy - Smart Waste Management</p>
  </div>
</body>
</html>
`;

export const reportVerifiedTemplate = (
  userName: string,
  wasteType: string,
  pointsEarned: number
) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      background-color: #ffffff; 
      padding: 20px;
      line-height: 1.6;
    }
    .container {
      max-width: 500px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 0 0 1px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.1);
    }
    .button {
      display: inline-block;
      background: #000000;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
    }
    h2 {
      color: #000000;
      margin-top: 0;
      font-weight: 600;
    }
    .points-box {
      background: #f8f8f8;
      padding: 25px;
      border-radius: 8px;
      text-align: center;
      margin: 25px 0;
      border: 1px solid #e0e0e0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Waste Report Verified</h2>
    <p>Great job, ${userName}!</p>
    <p>Your <strong>${wasteType}</strong> waste report has been verified by our AI system.</p>
    <div class="points-box">
      <div style="font-size: 42px; font-weight: 600; color: #000000;">+${pointsEarned}</div>
      <div style="color: #666;">Points Earned</div>
    </div>
    <p>Keep up the great work in promoting sustainable waste management!</p>
    <p style="text-align: center;">
      <a href="http://localhost:3000/dashboard" class="button">
        View Dashboard
      </a>
    </p>
  </div>
</body>
</html>
`;
