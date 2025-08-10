import type { Express } from 'express';

export function setupCustomerAIRoutes(app: Express) {
  // Customer AI Analysis API Route
  app.get('/api/customer/ai-analysis', async (req, res) => {
    try {
      console.log('[TEMP-AI] Customer AI Analysis endpoint called');
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');
      
      const mockInsights = [
        {
          id: "ai_insight_1",
          title: "Erhöhte FDA-Aktivität bei Herzschrittmachern",
          content: "KI-Analyse zeigt eine 47% Zunahme der FDA-Aktivitäten im Bereich Herzschrittmacher in den letzten 30 Tagen. Dies deutet auf mögliche neue Regulierungen hin.",
          category: "Regulatory Trends",
          confidence: 92,
          priority: "high",
          createdAt: "2025-08-10T10:30:00Z",
          tags: ["FDA", "Herzschrittmacher", "Regulatory"],
          summary: "Wichtige regulatorische Entwicklungen bei Herzschrittmachern erkannt"
        },
        {
          id: "ai_insight_2",
          title: "Neue Compliance-Anforderungen in EU",
          content: "Machine Learning Modell identifiziert neue MDR-Compliance-Trends mit 85% Genauigkeit. Empfohlene Anpassungen für Q4 2025.",
          category: "Compliance",
          confidence: 85,
          priority: "medium",
          createdAt: "2025-08-09T14:20:00Z",
          tags: ["EU", "MDR", "Compliance"],
          summary: "Compliance-Änderungen für EU-Markt vorhergesagt"
        },
        {
          id: "ai_insight_3",
          title: "Marktchancen bei Diabetesgeräten",
          content: "Predictive Analytics zeigt 67% Wahrscheinlichkeit für beschleunigte Zulassungen von CGM-Geräten in den nächsten 6 Monaten.",
          category: "Market Intelligence",
          confidence: 67,
          priority: "low",
          createdAt: "2025-08-08T09:15:00Z",
          tags: ["Diabetes", "CGM", "Zulassung"],
          summary: "Positive Marktentwicklung für Diabetes-Technologie"
        }
      ];

      res.json(mockInsights);
    } catch (error: any) {
      console.error('[TEMP-AI] Error in customer ai-analysis endpoint:', error);
      res.status(500).json({ 
        error: 'AI Analysis fehler', 
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
}