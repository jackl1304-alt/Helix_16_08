import nodemailer from 'nodemailer';
import { Logger } from '../services/logger.service';

const logger = new Logger('EmailService');

// Gmail SMTP configuration with user credentials
const emailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: 'deltawaysnewsletter@gmail.com',
    pass: '7724@Serpha' // App password provided by user
  }
};

// Create transporter
export const emailTransporter = nodemailer.createTransporter(emailConfig);

// Verify email configuration
export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    await emailTransporter.verify();
    logger.info('Email configuration verified successfully');
    return true;
  } catch (error) {
    logger.error('Email configuration verification failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    return false;
  }
};

// Send email function
export const sendEmail = async (options: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}): Promise<boolean> => {
  try {
    const mailOptions = {
      from: 'deltawaysnewsletter@gmail.com',
      ...options
    };
    
    const result = await emailTransporter.sendMail(mailOptions);
    logger.info('Email sent successfully', { messageId: result.messageId, to: options.to });
    return true;
  } catch (error) {
    logger.error('Failed to send email', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      to: options.to,
      subject: options.subject 
    });
    return false;
  }
};

// Email templates for different purposes
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Welcome to Helix Regulatory Intelligence',
    html: `
      <h1>Welcome to Helix, ${name}!</h1>
      <p>Thank you for joining our regulatory intelligence platform.</p>
      <p>You now have access to:</p>
      <ul>
        <li>70+ regulatory data sources</li>
        <li>Real-time compliance updates</li>
        <li>Legal case intelligence</li>
        <li>AI-powered insights</li>
      </ul>
      <p>Best regards,<br>The Helix Team</p>
    `
  }),
  
  syncNotification: (sourceName: string, updateCount: number) => ({
    subject: 'Data Sync Complete',
    html: `
      <h2>Data Synchronization Update</h2>
      <p><strong>${sourceName}</strong> has been successfully synchronized.</p>
      <p><strong>${updateCount}</strong> new updates available.</p>
      <p>Access your dashboard to review the latest regulatory intelligence.</p>
    `
  }),
  
  errorAlert: (error: string, timestamp: string) => ({
    subject: 'System Alert - Attention Required',
    html: `
      <h2>System Alert</h2>
      <p>An error has been detected in the Helix system:</p>
      <div style="background: #f8f8f8; padding: 10px; border-left: 4px solid #e74c3c;">
        <strong>Error:</strong> ${error}<br>
        <strong>Time:</strong> ${timestamp}
      </div>
      <p>Please check the system status and take appropriate action.</p>
    `
  })
};