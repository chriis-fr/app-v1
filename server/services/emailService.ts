import * as nodemailer from 'nodemailer';

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Boolean(process.env.SMTP_SECURE), 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);
// Get frontend URL based on environment
const getFrontendUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.APP_URL || process.env.FRONTEND_URL ;
  }
  return 'http://localhost:5000';
};

// Test email configuration
export const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error) {
    console.error('❌ Email service error:', error);
    return false;
  }
};

// Send activation email
export const sendActivationEmail = async (
  userEmail: string,
  userName: string,
  activationToken: string,
  organizationName: string
) => {
  const frontendUrl = getFrontendUrl();
  const activationUrl = `${frontendUrl}/activate?token=${activationToken}&email=${encodeURIComponent(userEmail)}`;
  
  const mailOptions = {
    from: `"Chains ERP" <${emailConfig.auth.user}>`,
    to: userEmail,
    subject: `Welcome to Chains ERP - Activate Your Account`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <div style="margin-bottom: 20px;">
            <img src="https://chains-erp.com/chainsnobg.png" 
              alt="Chains ERP Logo" 
              style="max-width: 150px; height: auto; border-radius: 8px;">
          </div>
          <h1 style="margin: 0; font-size: 28px;">Welcome to Chains ERP</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your account has been created successfully</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${userName},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Your ${organizationName} account has been created and is ready for activation.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Use the link below to activate your account:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${activationUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      display: inline-block; 
                      font-weight: bold;
                      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              Activate My Account
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            If the button doesn't work, you can copy and paste this link into your browser:
          </p>
          
          <p style="background: #e9ecef; padding: 15px; border-radius: 5px; word-break: break-all; font-size: 12px; color: #495057;">
            ${activationUrl}
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              <strong>Important:</strong> This activation link will expire in 24 hours for security reasons.
            </p>
            
            <p style="color: #666; font-size: 14px; margin: 10px 0 0 0;">
              If you didn't request this account, please ignore this email.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
          <p>This is an automated message from Chains ERP</p>
          <p>Please do not reply to this email</p>
        </div>
      </div>
    `,
    text: `
Welcome to Chains ERP!

Hello ${userName},

Your account has been created successfully. To activate your account, please visit:

${activationUrl}

This link will expire in 24 hours.

If you didn't request this account, please ignore this email.

Best regards,
The Chains ERP Team
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Activation email sent successfully');
    console.log('📧 Email details:', {
      messageId: info.messageId,
      to: userEmail,
      subject: mailOptions.subject,
      previewUrl: nodemailer.getTestMessageUrl(info),
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send activation email:', error);
    return { success: false, error: error as Error };
  }
};

// Send test email
export const sendTestEmail = async (toEmail: string) => {
  const mailOptions = {
    from: `"Chains ERP" <${emailConfig.auth.user}>`,
    to: toEmail,
    subject: 'Test Email from Chains ERP System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <div style="margin-bottom: 20px;">
            <img src="https://via.placeholder.com/150x60/ffffff/667eea?text=Chains+ERP" 
                 alt="Chains ERP Logo" 
                 style="max-width: 150px; height: auto; border-radius: 8px;">
          </div>
          <h1 style="margin: 0; font-size: 28px;">Chains ERP Test Email</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Email Service Test</h2>
          <p style="color: #666; line-height: 1.6;">
            This is a test email to verify that the Chains ERP email service is working correctly.
          </p>
          <p style="color: #666; line-height: 1.6;">
            If you received this email, the nodemailer configuration is working properly!
          </p>
          <p style="color: #666; line-height: 1.6;">
            <strong>Sent at:</strong> ${new Date().toLocaleString()}
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
          <p>This is a test message from Chains ERP</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully');
    console.log('📧 Test email details:', {
      messageId: info.messageId,
      to: toEmail,
      previewUrl: nodemailer.getTestMessageUrl(info),
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send test email:', error);
    return { success: false, error: error as Error };
  }
};

// Send meeting notification email
export const sendMeetingNotification = async (
  userEmail: string,
  userName: string,
  meetingTitle: string,
  meetingDate: string,
  meetingTime: string,
  organizerName: string,
  location: string,
  isVirtual: boolean,
  meetingUrl?: string
) => {
  const mailOptions = {
    from: `"Chains ERP" <${emailConfig.auth.user}>`,
    to: userEmail,
    subject: `Meeting Invitation: ${meetingTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <div style="margin-bottom: 20px;">
            <img src="https://chains-erp.com/chainsnobg.png" 
              alt="Chains ERP Logo" 
              style="max-width: 150px; height: auto; border-radius: 8px;">
          </div>
          <h1 style="margin: 0; font-size: 28px;">Meeting Invitation</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">You have been invited to a meeting</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${userName},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            You have been invited to attend the following meeting:
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="color: #333; margin-top: 0;">${meetingTitle}</h3>
            <p style="color: #666; margin: 5px 0;"><strong>Date:</strong> ${meetingDate}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Time:</strong> ${meetingTime}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Organizer:</strong> ${organizerName}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Location:</strong> ${isVirtual ? 'Virtual Meeting' : location}</p>
            ${isVirtual && meetingUrl ? `<p style="color: #666; margin: 5px 0;"><strong>Meeting URL:</strong> <a href="${meetingUrl}" style="color: #667eea;">${meetingUrl}</a></p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/meetings" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      display: inline-block; 
                      font-weight: bold;
                      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              View Meeting Details
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              <strong>Note:</strong> Please respond to this meeting invitation in the Chains ERP system.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
          <p>This is an automated message from Chains ERP</p>
          <p>Please do not reply to this email</p>
        </div>
      </div>
    `,
    text: `
Meeting Invitation

Hello ${userName},

You have been invited to attend the following meeting:

${meetingTitle}
Date: ${meetingDate}
Time: ${meetingTime}
Organizer: ${organizerName}
Location: ${isVirtual ? 'Virtual Meeting' : location}
${isVirtual && meetingUrl ? `Meeting URL: ${meetingUrl}` : ''}

Please log into Chains ERP to view meeting details and respond to the invitation.

Best regards,
The Chains ERP Team
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Meeting notification email sent successfully');
    console.log('📧 Meeting email details:', {
      messageId: info.messageId,
      to: userEmail,
      subject: mailOptions.subject,
      previewUrl: nodemailer.getTestMessageUrl(info),
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send meeting notification email:', error);
    return { success: false, error: error as Error };
  }
};

// Send general notification email
export const sendNotificationEmail = async (
  userEmail: string,
  userName: string,
  notificationTitle: string,
  notificationMessage: string,
  notificationType: string,
  actionUrl?: string
) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'meeting': return '📅';
      case 'task': return '✅';
      case 'approval': return '📋';
      case 'system': return '⚙️';
      case 'user': return '👤';
      case 'finance': return '💰';
      case 'inventory': return '📦';
      default: return '🔔';
    }
  };

  const mailOptions = {
    from: `"Chains ERP" <${emailConfig.auth.user}>`,
    to: userEmail,
    subject: `Chains ERP Notification: ${notificationTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <div style="margin-bottom: 20px;">
            <img src="https://chains-erp.com/chainsnobg.png" 
              alt="Chains ERP Logo" 
              style="max-width: 150px; height: auto; border-radius: 8px;">
          </div>
          <h1 style="margin: 0; font-size: 28px;">New Notification</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">You have a new notification in Chains ERP</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${userName},</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <span style="font-size: 24px; margin-right: 10px;">${getNotificationIcon(notificationType)}</span>
              <h3 style="color: #333; margin: 0;">${notificationTitle}</h3>
            </div>
            <p style="color: #666; line-height: 1.6; margin: 0;">${notificationMessage}</p>
          </div>
          
          ${actionUrl ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}${actionUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      display: inline-block; 
                      font-weight: bold;
                      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              View Details
            </a>
          </div>
          ` : ''}
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              <strong>Note:</strong> You can manage your notification preferences in the Chains ERP system.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
          <p>This is an automated message from Chains ERP</p>
          <p>Please do not reply to this email</p>
        </div>
      </div>
    `,
    text: `
Chains ERP Notification

Hello ${userName},

You have a new notification:

${notificationTitle}

${notificationMessage}

${actionUrl ? `View details: ${process.env.FRONTEND_URL || 'http://localhost:5000'}${actionUrl}` : ''}

Best regards,
The Chains ERP Team
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Notification email sent successfully');
    console.log('📧 Notification email details:', {
      messageId: info.messageId,
      to: userEmail,
      subject: mailOptions.subject,
      previewUrl: nodemailer.getTestMessageUrl(info),
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send notification email:', error);
    return { success: false, error: error as Error };
  }
};

// Send payroll notification email
export const sendPayrollNotification = async (
  userEmail: string,
  userName: string,
  payrollAmount: number,
  currency: string,
  paymentMethod: string,
  period: string,
  transactionHash?: string
) => {
  const mailOptions = {
    from: `"Chains ERP" <${emailConfig.auth.user}>`,
    to: userEmail,
    subject: `Payroll Payment Processed - ${period}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <div style="margin-bottom: 20px;">
            <img src="https://chains-erp.com/chainsnobg.png" 
              alt="Chains ERP Logo" 
              style="max-width: 150px; height: auto; border-radius: 8px;">
          </div>
          <h1 style="margin: 0; font-size: 28px;">Payroll Payment Processed</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your payroll payment has been successfully processed</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${userName},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Your payroll payment for ${period} has been successfully processed and sent to your account.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #333; margin-top: 0;">Payment Details</h3>
            <p style="color: #666; margin: 5px 0;"><strong>Amount:</strong> ${currency} ${payrollAmount.toFixed(2)}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Payment Method:</strong> ${paymentMethod}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Period:</strong> ${period}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">Completed</span></p>
            ${transactionHash ? `<p style="color: #666; margin: 5px 0;"><strong>Transaction Hash:</strong> <code style="background: #f8f9fa; padding: 2px 4px; border-radius: 3px;">${transactionHash}</code></p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/hr/payroll" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      display: inline-block; 
                      font-weight: bold;
                      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              View Payroll Details
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              <strong>Note:</strong> Please allow 1-3 business days for the payment to appear in your account.
            </p>
            ${paymentMethod === 'crypto' ? '<p style="color: #666; font-size: 14px; margin: 10px 0 0 0;"><strong>Crypto Payment:</strong> The transaction may take a few minutes to be confirmed on the blockchain.</p>' : ''}
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
          <p>This is an automated message from Chains ERP</p>
          <p>Please do not reply to this email</p>
        </div>
      </div>
    `,
    text: `
Payroll Payment Processed

Hello ${userName},

Your payroll payment for ${period} has been successfully processed and sent to your account.

Payment Details:
Amount: ${currency} ${payrollAmount.toFixed(2)}
Payment Method: ${paymentMethod}
Period: ${period}
Status: Completed
${transactionHash ? `Transaction Hash: ${transactionHash}` : ''}

Please allow 1-3 business days for the payment to appear in your account.
${paymentMethod === 'crypto' ? 'Crypto Payment: The transaction may take a few minutes to be confirmed on the blockchain.' : ''}

Best regards,
The Chains ERP Team
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Payroll notification email sent successfully');
    console.log('📧 Payroll email details:', {
      messageId: info.messageId,
      to: userEmail,
      subject: mailOptions.subject,
      previewUrl: nodemailer.getTestMessageUrl(info),
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send payroll notification email:', error);
    return { success: false, error: error as Error };
  }
}; 