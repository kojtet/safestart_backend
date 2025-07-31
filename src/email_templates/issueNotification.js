const issueNotificationTemplate = (user, issue) => {
  const priorityColors = {
    low: '#27ae60',
    medium: '#f39c12',
    high: '#e74c3c',
    critical: '#c0392b'
  };

  const priorityColor = priorityColors[issue.priority] || '#f39c12';

  return {
    subject: 'New Issue Reported - SafeStart',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Issue Notification - SafeStart</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e0e0e0;">
          <!-- Logo Section -->
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="cid:logo" alt="SafeStart Logo" style="max-width: 200px; height: auto;">
          </div>
          
          <h1 style="color: #044cac; margin-bottom: 20px; text-align: center;">🚨 New Issue Reported</h1>
          <p style="font-size: 18px; margin-bottom: 30px;">Hi ${user.firstName || user.name},</p>
          <p style="font-size: 16px; margin-bottom: 20px;">
            A new issue has been reported and requires your attention. Please review the details below and take appropriate action.
          </p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid ${priorityColor};">
            <h3 style="color: #044cac; margin-top: 0;">Issue Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Vehicle:</td>
                <td style="padding: 8px 0;">${issue.vehicleName || issue.vehicleId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Priority:</td>
                <td style="padding: 8px 0; color: ${priorityColor}; font-weight: bold; text-transform: uppercase;">${issue.priority}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Reported:</td>
                <td style="padding: 8px 0;">${new Date(issue.createdAt).toLocaleString()}</td>
              </tr>
              ${issue.reportedBy ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Reported By:</td>
                <td style="padding: 8px 0;">${issue.reportedBy}</td>
              </tr>
              ` : ''}
            </table>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
              <h4 style="color: #044cac; margin-top: 0;">Description:</h4>
              <p style="margin: 0; color: #555;">${issue.description}</p>
            </div>
            ${issue.location ? `
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
              <h4 style="color: #044cac; margin-top: 0;">Location:</h4>
              <p style="margin: 0; color: #555;">${issue.location}</p>
            </div>
            ` : ''}
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/issues/${issue.id}" 
               style="display: inline-block; background-color: #044cac; color: #ffffff; padding: 15px 30px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold;">
              View Issue Details
            </a>
          </div>
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #044cac; margin-top: 0;">⚠️ Action Required:</h4>
            <p style="color: #856404; margin: 0;">
              Please review this issue and take appropriate action. High priority issues should be addressed immediately 
              to ensure vehicle safety and compliance.
            </p>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            If you have any questions about this issue, please contact our support team.
          </p>
          <p style="font-size: 14px; color: #666;">
            Best regards,<br>
            The SafeStart Team
          </p>
        </div>
      </body>
      </html>
    `,
    text: `
New Issue Reported - SafeStart

Hi ${user.firstName || user.name},

A new issue has been reported and requires your attention. Please review the details below and take appropriate action.

Issue Details:
- Vehicle: ${issue.vehicleName || issue.vehicleId}
- Priority: ${issue.priority.toUpperCase()}
- Reported: ${new Date(issue.createdAt).toLocaleString()}
${issue.reportedBy ? `- Reported By: ${issue.reportedBy}` : ''}

Description: ${issue.description}
${issue.location ? `Location: ${issue.location}` : ''}

View issue details at: ${process.env.FRONTEND_URL}/issues/${issue.id}

Action Required: Please review this issue and take appropriate action. High priority issues should be addressed immediately to ensure vehicle safety and compliance.

If you have any questions about this issue, please contact our support team.

Best regards,
The SafeStart Team
    `
  };
};

module.exports = issueNotificationTemplate; 