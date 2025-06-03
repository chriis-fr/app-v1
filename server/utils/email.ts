import nodemailer from 'nodemailer';
import { Resend } from 'resend';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const sendEmail = async (to: string, subject: string, body: string) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject,
    text: body,
    html: body.replace(/\n/g, '<br>')
  };

  return transporter.sendMail(mailOptions);
};

export const sendTerminationNotification = async (data: {
  employeeName: string;
  position: string;
  department: string;
  employeeNumber: string;
  terminationDate: Date;
  reason: string;
  recipient: string;
}) => {
  const subject = 'Employee Termination Notification';
  const body = `
    <h2>Employee Termination Notification</h2>
    <p>The following employee's termination has been processed:</p>
    <ul>
      <li><strong>Employee:</strong> ${data.employeeName}</li>
      <li><strong>Position:</strong> ${data.position}</li>
      <li><strong>Department:</strong> ${data.department}</li>
      <li><strong>Employee Number:</strong> ${data.employeeNumber}</li>
      <li><strong>Termination Date:</strong> ${data.terminationDate.toLocaleDateString()}</li>
      <li><strong>Reason:</strong> ${data.reason}</li>
    </ul>
    <p>Please take necessary actions as per your department's requirements.</p>
  `;

  return sendEmail(data.recipient, subject, body);
};

export const sendTerminationApprovalNotification = async (data: {
  employeeName: string;
  position: string;
  department: string;
  employeeNumber: string;
  terminationDate: Date;
  reason: string;
  recipient: string;
  approvedBy: string;
}) => {
  const subject = 'Termination Approval Notification';
  const body = `
    <h2>Termination Approval Notification</h2>
    <p>The following employee's termination has been approved by ${data.approvedBy}:</p>
    <ul>
      <li><strong>Employee:</strong> ${data.employeeName}</li>
      <li><strong>Position:</strong> ${data.position}</li>
      <li><strong>Department:</strong> ${data.department}</li>
      <li><strong>Employee Number:</strong> ${data.employeeNumber}</li>
      <li><strong>Termination Date:</strong> ${data.terminationDate.toLocaleDateString()}</li>
      <li><strong>Reason:</strong> ${data.reason}</li>
    </ul>
    <p>Please proceed with the necessary actions for your department.</p>
  `;

  return sendEmail(data.recipient, subject, body);
};

export const sendTerminationCompletionNotification = async (data: {
  employeeName: string;
  position: string;
  department: string;
  employeeNumber: string;
  terminationDate: Date;
  reason: string;
  recipient: string;
  completedBy: string;
}) => {
  const subject = 'Termination Process Completed';
  const body = `
    <h2>Termination Process Completed</h2>
    <p>The termination process for the following employee has been completed by ${data.completedBy}:</p>
    <ul>
      <li><strong>Employee:</strong> ${data.employeeName}</li>
      <li><strong>Position:</strong> ${data.position}</li>
      <li><strong>Department:</strong> ${data.department}</li>
      <li><strong>Employee Number:</strong> ${data.employeeNumber}</li>
      <li><strong>Termination Date:</strong> ${data.terminationDate.toLocaleDateString()}</li>
      <li><strong>Reason:</strong> ${data.reason}</li>
    </ul>
    <p>All necessary documentation and processes have been completed.</p>
  `;

  return sendEmail(data.recipient, subject, body);
};

export const sendTerminationRescindNotification = async (data: {
  employeeName: string;
  position: string;
  department: string;
  employeeNumber: string;
  terminationDate: Date;
  reason: string;
  recipient: string;
  rescindedBy: string;
}) => {
  const subject = 'Termination Rescinded';
  const body = `
    <h2>Termination Rescinded</h2>
    <p>The termination for the following employee has been rescinded by ${data.rescindedBy}:</p>
    <ul>
      <li><strong>Employee:</strong> ${data.employeeName}</li>
      <li><strong>Position:</strong> ${data.position}</li>
      <li><strong>Department:</strong> ${data.department}</li>
      <li><strong>Employee Number:</strong> ${data.employeeNumber}</li>
      <li><strong>Termination Date:</strong> ${data.terminationDate.toLocaleDateString()}</li>
      <li><strong>Reason:</strong> ${data.reason}</li>
    </ul>
    <p>Please update your records accordingly.</p>
  `;

  return sendEmail(data.recipient, subject, body);
};

export const sendActivationEmail = async (email: string, token: string) => {
  const link = `${process.env.APP_BASE_URL || 'http://localhost:5000'}/activate?token=${token}`;
  const subject = 'Activate Your Account';
  const html = `
    <h1>Welcome!</h1>
    <p>Your account is ready. Click the link below to set your password and activate your account:</p>
    <a href="${link}">Activate Account</a>
    <p>This link will expire in 2 days.</p>
  `;
  if (resend) {
    await resend.emails.send({
      from: process.env.SMTP_FROM || 'hr@yourdomain.com',
      to: email,
      subject,
      html
    });
  } else {
    await sendEmail(email, subject, html);
  }
}; 