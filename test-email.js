// Simple email testing script
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

async function testEmailService() {
  console.log('🧪 Testing Email Service...\n');

  try {
    // Test 1: Check email connection
    console.log('1. Testing email connection...');
    const connectionResponse = await fetch(`${BASE_URL}/api/test-email-connection`);
    const connectionData = await connectionResponse.json();
    
    if (connectionData.success) {
      console.log('✅ Email service is ready');
    } else {
      console.log('❌ Email service failed:', connectionData.message);
      console.log('   Please check your .env configuration');
      return;
    }

    // Test 2: Send test email (if email is provided)
    const testEmail = process.argv[2];
    if (testEmail) {
      console.log(`\n2. Sending test email to ${testEmail}...`);
      const emailResponse = await fetch(`${BASE_URL}/api/test-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail })
      });
      
      const emailData = await emailResponse.json();
      
      if (emailData.success) {
        console.log('✅ Test email sent successfully');
        console.log(`   Message ID: ${emailData.messageId}`);
      } else {
        console.log('❌ Failed to send test email:', emailData.error);
      }
    } else {
      console.log('\n2. Skipping test email (no email provided)');
      console.log('   Usage: node test-email.js your-email@example.com');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('   Make sure the server is running on port 3001');
  }
}

testEmailService(); 