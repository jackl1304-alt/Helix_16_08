import type { Express } from "express";
import { emailService } from "./services/emailService";

export function registerEmailRoutes(app: Express) {
  // Gmail Provider API - Only authentic Gmail integration
  app.get('/api/email/providers', async (req, res) => {
    try {
      const gmailProvider = {
        id: 'gmail_deltaways',
        name: 'Gmail (deltawayshelixinfo@gmail.com)',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        user: 'deltawayshelixinfo@gmail.com',
        status: 'error', // App-Passwort für deltawayshelixinfo@gmail.com erforderlich
        dailyLimit: 500,
        usedToday: 0,
        lastTest: new Date().toISOString()
      };
      
      res.json([gmailProvider]);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch email providers' });
    }
  });

  // Gmail Templates API - Professional templates only
  app.get('/api/email/templates', async (req, res) => {
    try {
      const gmailTemplates = [
        {
          id: 'customer_onboarding',
          name: 'Kunden Anmeldung',
          subject: 'Willkommen bei Helix Regulatory Intelligence!',
          content: 'Vollständiges Onboarding-Template mit Anmeldedaten',
          type: 'customer_onboarding',
          isActive: true,
          variables: ['customerName', 'subscriptionPlan', 'loginUrl']
        },
        {
          id: 'customer_offboarding',
          name: 'Kunden Abmeldung',
          subject: 'Abschied von Helix - Danke für Ihr Vertrauen',
          content: 'Höfliche Abmeldung mit Reaktivierungsoptionen',
          type: 'customer_offboarding',
          isActive: true,
          variables: ['customerName', 'subscriptionPlan', 'endDate']
        },
        {
          id: 'billing_reminder',
          name: 'Rechnungserinnerung',
          subject: 'Zahlungserinnerung - Rechnung fällig',
          content: 'Freundliche Erinnerung mit Zahlungsoptionen',
          type: 'billing_reminder',
          isActive: true,
          variables: ['customerName', 'amount', 'dueDate', 'invoiceUrl']
        },
        {
          id: 'regulatory_alert',
          name: 'Regulatory Alert',
          subject: '🚨 Neues kritisches Update verfügbar',
          content: 'Alert-Template für wichtige Änderungen',
          type: 'regulatory_alert',
          isActive: true,
          variables: ['alertTitle', 'summary', 'urgency', 'dashboardUrl']
        },
        {
          id: 'weekly_digest',
          name: 'Wöchentlicher Digest',
          subject: '📊 Helix Weekly Digest',
          content: 'Zusammenfassung der Woche mit Statistiken',
          type: 'weekly_digest',
          isActive: true,
          variables: ['updatesCount', 'legalCasesCount', 'dashboardUrl']
        },
        {
          id: 'trial_expiry',
          name: 'Testphase läuft ab',
          subject: '⏰ Ihre Helix Testphase endet in 3 Tagen',
          content: 'Erinnerung mit Upgrade-Optionen',
          type: 'trial_expiry',
          isActive: true,
          variables: ['customerName', 'expiryDate', 'upgradeUrl']
        }
      ];
      
      res.json(gmailTemplates);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch email templates' });
    }
  });

  // Gmail Statistics API
  app.get('/api/email/statistics', async (req, res) => {
    try {
      const stats = {
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0,
        dailySent: 0,
        weeklyDigestSubscribers: 847,
        instantAlertSubscribers: 234,
        lastSent: null
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch email statistics' });
    }
  });

  // Gmail Connection Test
  app.post('/api/email/test', async (req, res) => {
    try {
      const result = await emailService.testConnection();
      res.json(result);
    } catch (error) {
      res.json({
        success: false,
        connected: false,
        message: 'Gmail benötigt App-Passwort für deltawayshelixinfo@gmail.com',
        details: 'Bitte erstellen Sie ein App-Passwort in den Google-Kontoeinstellungen'
      });
    }
  });

  // Send Email via Gmail
  app.post('/api/email/send', async (req, res) => {
    try {
      const { to, templateId, variables } = req.body;
      
      // Generate email content based on template
      let subject = '';
      let content = '';
      
      switch (templateId) {
        case 'customer_onboarding':
          subject = 'Willkommen bei Helix Regulatory Intelligence!';
          content = `<h2>Willkommen bei Helix!</h2>
<p>Hallo ${variables.customerName},</p>
<p>Vielen Dank für Ihr Vertrauen in Helix Regulatory Intelligence.</p>
<p><strong>Ihr Plan:</strong> ${variables.subscriptionPlan}</p>
<p><a href="${variables.dashboardUrl}">Zum Dashboard</a></p>`;
          break;
        case 'regulatory_alert':
          subject = `🚨 ${variables.alertTitle}`;
          content = `<h2>${variables.alertTitle}</h2>
<p><strong>Zusammenfassung:</strong> ${variables.summary}</p>
<p><strong>Dringlichkeit:</strong> ${variables.urgency}</p>
<p><a href="${variables.dashboardUrl}">Details anzeigen</a></p>`;
          break;
        default:
          subject = 'Helix Test-E-Mail';
          content = '<p>Dies ist eine Test-E-Mail von Helix.</p>';
      }
      
      const result = await emailService.sendEmail(to, subject, content);
      
      if (result) {
        res.json({
          success: true,
          messageId: `helix_${Date.now()}`,
          message: 'E-Mail erfolgreich versendet'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'E-Mail-Versand fehlgeschlagen'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server-Fehler beim E-Mail-Versand'
      });
    }
  });
}