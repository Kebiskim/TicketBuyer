const nodemailer = require('nodemailer');
require('dotenv').config(); // 환경 변수 로드

/**
 * Sends an email using the configured transporter.
 * @param {string} to - Recipient's email address.
 * @param {string} subject - Email subject.
 * @param {string} text - Email body.
 */
async function sendMail(to, subject, text) {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // 이메일 서비스 제공자
    auth: {
      user: process.env.EMAIL_USER, // 발신자 이메일 주소
      pass: process.env.EMAIL_PASS  // 발신자 이메일 비밀번호
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER, // 발신자 이메일 주소
    to: to, // 수신자 이메일 주소
    subject: subject, // 이메일 제목
    text: text // 이메일 본문
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email successfully sent.');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Standalone execution
// if (require.main === module) {
//   // Set these values for testing
//   const testEmail = process.env.EMAIL_TO || 'recipient@example.com';
//   const testSubject = 'Test Email Subject';
//   const testText = 'This is a test email body.';

//   sendMail(testEmail, testSubject, testText).catch(console.error);
// }

module.exports = sendMail;
