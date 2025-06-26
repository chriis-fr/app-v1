import nodemailer from 'nodemailer';

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
    to: "caspianodhis@gmail.com",
    subject: `Welcome to Chains ERP - Activate Your Account`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
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
            Welcome to Chains ERP! Your account has been created and is ready for activation.
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