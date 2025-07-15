# Email Testing Guide

## 🚀 Setup Instructions

### 1. Email Service Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FRONTEND_URL="http://localhost:3000"
```

### 2. Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password as `SMTP_PASS`

### 3. Alternative Email Services

You can also use:
- **Outlook/Hotmail**: `smtp-mail.outlook.com:587`
- **Yahoo**: `smtp.mail.yahoo.com:587`
- **Custom SMTP**: Your own email server

## 🧪 Testing Steps

### Step 1: Test Email Connection

```bash
# Test if email service is configured correctly
curl http://localhost:3001/api/test-email-connection
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Email service is ready"
}
```

### Step 2: Send Test Email

```bash
# Send a test email
curl -X POST http://localhost:3001/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-test-email@example.com"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully",
  "messageId": "message-id-here"
}
```

### Step 3: Test User Activation

1. **Navigate to Users page** (`/users`)
2. **Find an inactive user** (shows "Inactive" badge)
3. **Click "Activate" button**
4. **Check server logs** for activation details
5. **Check email inbox** for activation email

## 🔍 Debugging

### Common Issues

1. **"Email service failed to connect"**
   - Check SMTP credentials in `.env`
   - Verify Gmail app password is correct
   - Ensure 2FA is enabled on Gmail

2. **"Authentication failed"**
   - Double-check email and password
   - Make sure you're using App Password, not regular password

3. **"Connection timeout"**
   - Check firewall settings
   - Try different SMTP port (465 for SSL, 587 for TLS)

### Server Logs

Watch for these log messages:
```
✅ Email service is ready
✅ Activation email sent successfully
📧 Email details: { messageId: "...", to: "...", subject: "..." }
```

### Email Preview (Development)

Nodemailer provides preview URLs in development:
```
📧 Preview URL: https://ethereal.email/message/...
```

## 🎯 Production Checklist

Before rolling out to production:

- [ ] Use production SMTP service (SendGrid, Mailgun, etc.)
- [ ] Set up proper email templates
- [ ] Configure email tracking
- [ ] Set up email delivery monitoring
- [ ] Test with real user accounts
- [ ] Verify activation links work correctly
- [ ] Set up email bounce handling

## 📧 Email Templates

The activation email includes:
- Professional HTML template
- Plain text fallback
- Organization branding
- 24-hour expiration notice
- Security warnings

## 🔐 Security Considerations

- Activation tokens expire in 24 hours
- Tokens are cryptographically random
- Email links are organization-scoped
- Failed attempts are logged
- Rate limiting can be added

## 🚀 Next Steps

After successful testing:
1. Replace test endpoints with production versions
2. Add email tracking and analytics
3. Implement email templates customization
4. Add email queue for high-volume scenarios
5. Set up email delivery monitoring 