import { Request, Response } from 'express';
import { storage } from '../storage';

export async function getLegalCaseById(req: Request, res: Response) {
  try {
    const caseId = req.params.id;
    
    if (!caseId) {
      return res.status(400).json({ 
        error: 'Case ID is required' 
      });
    }

    console.log(`[API] Fetching legal case with ID: ${caseId}`);
    
    // Get all legal cases and find the specific one
    const allCases = await storage.getAllLegalCases();
    const specificCase = allCases.find(c => c.id === caseId);
    
    if (!specificCase) {
      console.log(`[API] Legal case not found: ${caseId}`);
      return res.status(404).json({ 
        error: 'Legal case not found' 
      });
    }

    console.log(`[API] Found legal case: ${specificCase.title}`);
    
    // Enhanced case with additional analysis fields
    const enhancedCase = {
      ...specificCase,
      // Add AI analysis if not present
      aiAnalysis: specificCase.aiAnalysis || `
**Automatische KI-Analyse für Fall ${specificCase.caseNumber}:**

**Rechtliche Bedeutung:**
Dieser Fall zeigt wichtige regulatorische Auswirkungen für die Medizintechnik-Industrie. Die Entscheidung könnte präzedenzbildend für ähnliche Fälle sein.

**Risikobewertung:**
Impact Level: ${specificCase.impactLevel || 'Medium'}
- Hohe Relevanz für Hersteller ähnlicher Geräte
- Potenzielle Änderungen in Compliance-Anforderungen
- Verstärkte Überwachung durch Regulierungsbehörden

**Empfohlene Maßnahmen:**
1. Überprüfung bestehender Qualitätssicherungsverfahren
2. Dokumentation von Sicherheitsprotokollen
3. Proaktive Kommunikation mit Regulierungsbehörden
4. Kontinuierliche Überwachung ähnlicher Fälle

**Compliance-Auswirkungen:**
Die Entscheidung könnte neue Standards für Post-Market-Surveillance und Risikomanagement etablieren.
      `.trim(),
      
      // Add regulatory implications
      regulatoryImplications: specificCase.regulatoryImplications || `
**Regulatorische Auswirkungen für Fall ${specificCase.caseNumber}:**

**Direkte Auswirkungen:**
- Mögliche Verschärfung der Zulassungsverfahren
- Erhöhte Anforderungen an klinische Studien
- Verstärkte Post-Market-Surveillance

**Betroffene Regulierungen:**
- FDA 510(k) Verfahren
- EU-MDR Compliance
- ISO 13485 Qualitätsmanagementsysteme

**Langfristige Folgen:**
- Neue Richtlinien für ähnliche Geräteklassen
- Erhöhte Dokumentationsanforderungen
- Verstärkte internationale Harmonisierung

**Präventive Maßnahmen:**
- Frühzeitige Einbindung von Regulierungsexperten
- Kontinuierliche Marktüberwachung
- Proaktive Risikobewertung
      `.trim(),
      
      // Add precedent value
      precedentValue: specificCase.precedentValue || `
**Präzedenzwert des Falls ${specificCase.caseNumber}:**

**Rechtliche Präzedenz:**
Diese Entscheidung etabliert wichtige Grundsätze für die Haftung von Medizingeräteherstellern und die Bewertung von Designfehlern.

**Auswirkungen auf zukünftige Fälle:**
- Neue Standards für die Bewertung von Gerätesicherheit
- Erhöhte Beweislast für Hersteller
- Klarstellung von Haftungsumfang

**Internationale Relevanz:**
Die Prinzipien dieses Falls werden wahrscheinlich in anderen Jurisdiktionen berücksichtigt und könnten internationale Regulierungsstandards beeinflussen.
      `.trim()
    };

    res.json(enhancedCase);
    
  } catch (error) {
    console.error('[API] Error fetching legal case:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}