import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private fromEmail: string;

  constructor() {
    // Gmail configuration
    this.fromEmail = 'deltawaysnewsletter@gmail.com';
    
    const emailConfig: EmailConfig = {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'deltawaysnewsletter@gmail.com',
        pass: '2021!Emil@Serpha' // Note: Should use App Password for Gmail
      }
    };

    this.transporter = nodemailer.createTransport(emailConfig);
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.fromEmail,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendNewsletter(
    subscribers: string[],
    subject: string,
    htmlContent: string,
    textContent?: string
  ): Promise<{ success: boolean; sentCount: number; failedCount: number }> {
    let sentCount = 0;
    let failedCount = 0;

    // Send emails in batches to avoid rate limiting
    const batchSize = 10;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      const promises = batch.map(async (email) => {
        try {
          await this.sendEmail({
            to: email,
            subject: subject,
            html: htmlContent,
            text: textContent
          });
          sentCount++;
        } catch (error) {
          console.error(`Failed to send email to ${email}:`, error);
          failedCount++;
        }
      });

      await Promise.all(promises);
      
      // Add delay between batches
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return {
      success: failedCount === 0,
      sentCount,
      failedCount
    };
  }

  async sendRegulatoryAlert(
    recipients: string[],
    updateTitle: string,
    updateContent: string,
    priority: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<boolean> {
    const priorityEmojis = {
      low: '🔵',
      medium: '🟡', 
      high: '🟠',
      critical: '🔴'
    };

    const subject = `${priorityEmojis[priority]} Helix Alert: ${updateTitle}`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: #2563eb; margin: 0;">Helix Regulatory Alert</h1>
          <p style="color: #6b7280; margin: 5px 0 0 0;">Regulatorische Intelligence Platform</p>
        </div>
        
        <div style="background-color: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #1f2937; margin-top: 0;">${updateTitle}</h2>
          <div style="background-color: #fef3c7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
            <p style="margin: 0; color: #92400e;"><strong>Priorität:</strong> ${priority.toUpperCase()}</p>
          </div>
          <div style="color: #374151; line-height: 1.6;">
            ${updateContent}
          </div>
        </div>
        
        <div style="margin-top: 20px; padding: 16px; background-color: #f3f4f6; border-radius: 6px; text-align: center;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Diese Nachricht wurde automatisch von Helix generiert.<br>
            © 2025 Helix MedTech Regulatory Intelligence Platform
          </p>
        </div>
      </div>
    `;

    const textContent = `
HELIX REGULATORY ALERT

${updateTitle}

Priorität: ${priority.toUpperCase()}

${updateContent.replace(/<[^>]*>/g, '')}

---
Diese Nachricht wurde automatisch von Helix generiert.
© 2025 Helix MedTech Regulatory Intelligence Platform
    `;

    return await this.sendEmail({
      to: recipients,
      subject: subject,
      html: htmlContent,
      text: textContent
    });
  }

  async sendApprovalNotification(
    recipients: string[],
    itemTitle: string,
    itemType: 'newsletter' | 'update' | 'document',
    status: 'approved' | 'rejected' | 'needs_review',
    reviewerName: string,
    comments?: string
  ): Promise<boolean> {
    const statusColors = {
      approved: '#10b981',
      rejected: '#ef4444', 
      needs_review: '#f59e0b'
    };

    const statusEmojis = {
      approved: '✅',
      rejected: '❌',
      needs_review: '⏳'
    };

    const subject = `${statusEmojis[status]} Approval ${status === 'approved' ? 'Granted' : status === 'rejected' ? 'Rejected' : 'Required'}: ${itemTitle}`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: #2563eb; margin: 0;">Helix Approval Workflow</h1>
          <p style="color: #6b7280; margin: 5px 0 0 0;">Genehmigungsverfahren</p>
        </div>
        
        <div style="background-color: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #1f2937; margin-top: 0;">${itemTitle}</h2>
          
          <div style="background-color: ${statusColors[status]}15; padding: 12px; border-radius: 6px; margin-bottom: 16px; border-left: 4px solid ${statusColors[status]};">
            <p style="margin: 0; color: ${statusColors[status]}; font-weight: bold;">
              Status: ${status === 'approved' ? 'Genehmigt' : status === 'rejected' ? 'Abgelehnt' : 'Überprüfung erforderlich'}
            </p>
          </div>

          <div style="margin-bottom: 16px;">
            <p style="margin: 0; color: #6b7280;"><strong>Typ:</strong> ${itemType}</p>
            <p style="margin: 4px 0 0 0; color: #6b7280;"><strong>Reviewer:</strong> ${reviewerName}</p>
          </div>

          ${comments ? `
            <div style="background-color: #f9fafb; padding: 12px; border-radius: 6px; margin-top: 16px;">
              <p style="margin: 0 0 8px 0; font-weight: bold; color: #374151;">Kommentare:</p>
              <p style="margin: 0; color: #6b7280;">${comments}</p>
            </div>
          ` : ''}
        </div>
        
        <div style="margin-top: 20px; padding: 16px; background-color: #f3f4f6; border-radius: 6px; text-align: center;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Diese Benachrichtigung wurde automatisch generiert.<br>
            © 2025 Helix MedTech Regulatory Intelligence Platform
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: recipients,
      subject: subject,
      html: htmlContent
    });
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Email service connection verified successfully');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
export default EmailService;