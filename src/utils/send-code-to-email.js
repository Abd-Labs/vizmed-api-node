import { createTransport } from 'nodemailer';
import getText from './lang/get-text.js';
import errorHelper from './helpers/error-helper.js';

export default async (email, name, confirmCode, lang, type, req, res) => {
  // Ensure required parameters are provided
  if (!email || !confirmCode || (lang !== 'tr' && lang !== 'en')) {
    return res.status(400).send(errorHelper('00005', req)).end();
  }

  // Configure the SMTP transport
  const emailTransport = createTransport({
    host: process.env.SMTP_HOST, // Replace with your SMTP server host
    port: process.env.SMTP_PORT,                // Replace with your SMTP server port (usually 587 or 465)
    secure: false,            // Set to true if using port 465 for SSL
    auth: {
      user: process.env.SMTP_USER, // Replace with your SMTP server username
      pass: process.env.SMTP_PASS      // Replace with your SMTP server password
    }
  });

  // Compose the email body
  let body = '';
  if (type === 'register') {
    body = `${getText(lang, 'welcomeCode')} ${name}!\r\n\r\n${getText(lang, 'verificationCodeBody')} ${confirmCode}`;
  } else {
    body = `${getText(lang, 'verificationCodeBody')} ${confirmCode}`;
  }

  // Define the email message
  const emailInfo = {
    from: process.env.FROM_EMAIL, // Sender address
    to: email,                     // Recipient address
    subject: getText(lang, 'verificationCodeTitle'), // Email subject
    text: body                     // Email body in plain text
  };

  try {
    // Send the email
    await emailTransport.sendMail(emailInfo);
    return { resultMessage: { en: 'Email sent successfully!' }, resultCode: '00048' };
  } catch (err) {
    console.error('Error sending email:', err);
    return res.status(500).json(errorHelper('00005', req, err.message));
  }
};
