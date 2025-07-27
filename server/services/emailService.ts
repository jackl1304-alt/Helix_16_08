interface EmailParams {
  to: string[];
  subject: string;
  htmlContent: string;
  textContent?: string;
}

class EmailService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY || process.env.EMAIL_API_KEY || '';
    if (!this.apiKey) {
      console.warn('No email API key found. Email functionality will be limited.');
    }
  }

  async sendEmail(params: EmailParams): Promise<boolean> {
    if (!this.apiKey) {
      console.log('Email sending skipped - no API key configured');
      console.log('Would send email:', {
        to: params.to.length + ' recipients',
        subject: params.subject
      });
      return false;
    }

    try {
      // Using a generic email sending approach that could work with various providers
      const response = await fetch('https://api.sendgrid.v3.mail.send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: params.to.map(email => ({ email })),
          }],
          from: {
            email: process.env.FROM_EMAIL || 'noreply@aegis-platform.com',
            name: 'AEGIS Regulatory Intelligence'
          },
          subject: params.subject,
          content: [
            {
              type: 'text/html',
              value: params.htmlContent
            },
            ...(params.textContent ? [{
              type: 'text/plain',
              value: params.textContent
            }] : [])
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Email sending failed:', response.status, errorData);
        return false;
      }

      console.log(`Email sent successfully to ${params.to.length} recipients`);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendNewsletter(newsletter: any, subscribers: any[]): Promise<boolean> {
    if (subscribers.length === 0) {
      console.log('No subscribers to send newsletter to');
      return true;
    }

    const emailParams: EmailParams = {
      to: subscribers.map(sub => sub.email),
      subject: newsletter.title,
      htmlContent: this.generateNewsletterHTML(newsletter),
      textContent: this.generateNewsletterText(newsletter)
    };

    return await this.sendEmail(emailParams);
  }

  async sendNotification(to: string[], title: string, message: string, priority: string = 'medium'): Promise<boolean> {
    const priorityColors = {
      urgent: '#ef4444',
      high: '#f97316',
      medium: '#3b82f6',
      low: '#6b7280'
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AEGIS Notification</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🛡️ AEGIS</h1>
          <p style="color: #e0e7ff; margin: 5px 0 0 0;">Regulatory Intelligence Platform</p>
        </div>
        
        <div style="background: white; border: 1px solid #e5e7eb; border-top: none; padding: 30px; border-radius: 0 0 8px 8px;">
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <div style="width: 4px; height: 40px; background: ${priorityColors[priority as keyof typeof priorityColors] || priorityColors.medium}; margin-right: 15px; border-radius: 2px;"></div>
            <div>
              <h2 style="margin: 0; color: #1f2937; font-size: 20px;">${title}</h2>
              <span style="background: ${priorityColors[priority as keyof typeof priorityColors] || priorityColors.medium}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; text-transform: uppercase;">${priority} Priority</span>
            </div>
          </div>
          
          <div style="background: #f9fafb; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #374151;">${message}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.PLATFORM_URL || 'https://helix-platform.com'}" 
               style="background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
              View in Helix Dashboard
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
          <p>This is an automated notification from Helix Regulatory Intelligence Platform</p>
          <p>© 2025 Helix. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to,
      subject: `[Helix] ${title}`,
      htmlContent,
      textContent: `Helix Notification\n\n${title}\n\nPriority: ${priority.toUpperCase()}\n\n${message}\n\nView in dashboard: ${process.env.PLATFORM_URL || 'https://helix-platform.com'}`
    });
  }

  private generateNewsletterHTML(newsletter: any): string {
    return newsletter.htmlContent || `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${newsletter.title}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🛡️ AEGIS Newsletter</h1>
          <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">MedTech Regulatory Intelligence</p>
        </div>
        
        <div style="background: white; border: 1px solid #e5e7eb; border-top: none; padding: 40px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1f2937; margin-top: 0;">${newsletter.title}</h2>
          <div style="color: #374151; line-height: 1.8;">
            ${newsletter.content || 'Newsletter content goes here...'}
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px;">
          <p>Thank you for subscribing to AEGIS Regulatory Intelligence</p>
          <p><a href="#" style="color: #3b82f6;">Unsubscribe</a> | <a href="#" style="color: #3b82f6;">Update Preferences</a></p>
          <p>© 2025 AEGIS. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateNewsletterText(newsletter: any): string {
    return `
AEGIS Newsletter - ${newsletter.title}

${newsletter.content || 'Newsletter content goes here...'}

---
Thank you for subscribing to AEGIS Regulatory Intelligence
© 2025 AEGIS. All rights reserved.
    `.trim();
  }
}

export const emailService = new EmailService();
