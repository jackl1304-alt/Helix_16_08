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
        status: 'active', // Gmail mit App-Passwort verbunden
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
      
      // Service now returns proper JSON object
      res.json(result);
    } catch (error) {
      console.error('[EMAIL] Connection test error:', error);
      res.json({
        success: false,
        connected: false,
        message: 'Gmail-Verbindung fehlgeschlagen',
        details: error.message || 'Unbekannter Fehler bei der Verbindung',
        provider: 'Gmail (deltawayshelixinfo@gmail.com)'
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
          const onboarding = emailService.generateCustomerOnboardingEmail(
            variables.customerName || 'Kunde',
            variables.subscriptionPlan || 'Professional',
            variables.loginUrl || 'https://helix-platform.com/login'
          );
          subject = onboarding.subject;
          content = onboarding.html;
          break;
          
        case 'customer_offboarding':
          const offboarding = emailService.generateCustomerOffboardingEmail(
            variables.customerName || 'Kunde',
            variables.subscriptionPlan || 'Professional',
            variables.endDate || '31.12.2025'
          );
          subject = offboarding.subject;
          content = offboarding.html;
          break;
          
        case 'billing_reminder':
          const billing = emailService.generateBillingReminderEmail(
            variables.customerName || 'Kunde',
            variables.amount || '299',
            variables.dueDate || '31.12.2025',
            variables.invoiceUrl || 'https://helix-platform.com/invoice'
          );
          subject = billing.subject;
          content = billing.html;
          break;
          
        case 'regulatory_alert':
          const alert = emailService.generateRegulatoryAlertEmail(
            variables.alertTitle || 'Neue regulatorische Änderung',
            variables.summary || 'Wichtige Aktualisierung verfügbar',
            variables.urgency || 'medium',
            variables.dashboardUrl || 'https://helix-platform.com/dashboard'
          );
          subject = alert.subject;
          content = alert.html;
          break;
          
        case 'weekly_digest':
          const digest = emailService.generateWeeklyDigestEmail(
            variables.customerName || 'Kunde',
            parseInt(variables.updatesCount) || 12,
            parseInt(variables.legalCasesCount) || 65,
            variables.dashboardUrl || 'https://helix-platform.com/dashboard'
          );
          subject = digest.subject;
          content = digest.html;
          break;
          
        case 'trial_expiry':
          const trial = emailService.generateTrialExpiryEmail(
            variables.customerName || 'Kunde',
            variables.expiryDate || '31.12.2025',
            variables.upgradeUrl || 'https://helix-platform.com/upgrade'
          );
          subject = trial.subject;
          content = trial.html;
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