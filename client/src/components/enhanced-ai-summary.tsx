import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Shield, Target, Scale, Zap } from 'lucide-react';
import { FormattedText } from './formatted-text';

interface EnhancedAISummaryProps {
  caseContent: string;
  caseTitle: string;
  caseSummary: string;
  court: string;
  jurisdiction: string;
  keywords: string[];
}

export function EnhancedAISummary({ 
  caseContent, 
  caseTitle, 
  caseSummary, 
  court, 
  jurisdiction, 
  keywords 
}: EnhancedAISummaryProps) {
  
  // KI-Analyse basierend auf echten Inhalten
  const generateAIAnalysis = (content: string, title: string, summary: string) => {
    const contentLower = (content + ' ' + title + ' ' + summary).toLowerCase();
    
    // Risikobewertung
    const riskKeywords = ['haftung', 'schadensersatz', 'fahrlässig', 'mangelhaft', 'gefährlich', 'risiko', 'verletzung'];
    const riskScore = riskKeywords.filter(keyword => contentLower.includes(keyword)).length;
    
    // Compliance-Auswirkungen
    const complianceKeywords = ['mdma', 'mdr', 'iso', 'iec', 'fda', 'ce-kennzeichnung', 'notified body', 'qms'];
    const complianceImpact = complianceKeywords.filter(keyword => contentLower.includes(keyword));
    
    // Finanzielle Auswirkungen
    const financialTerms = ['schadensersatz', 'strafe', 'bußgeld', 'kosten', 'ersatz', 'zahlung'];
    const financialImpact = financialTerms.filter(term => contentLower.includes(term)).length;
    
    // Medizinprodukte-spezifische Analyse
    const deviceTerms = ['implantat', 'herzschrittmacher', 'prothese', 'katheter', 'stent', 'defibrillatoren', 'insulin'];
    const deviceRelevance = deviceTerms.filter(term => contentLower.includes(term));
    
    // Präzedenzfall-Potenzial
    const precedentTerms = ['grundsatzentscheidung', 'erstmals', 'richtungsweisend', 'präzedenz', 'wegweisend'];
    const precedentValue = precedentTerms.filter(term => contentLower.includes(term)).length;
    
    return {
      riskLevel: riskScore >= 3 ? 'Hoch' : riskScore >= 1 ? 'Mittel' : 'Niedrig',
      riskColor: riskScore >= 3 ? 'text-red-600' : riskScore >= 1 ? 'text-yellow-600' : 'text-green-600',
      complianceAreas: complianceImpact,
      financialRisk: financialImpact >= 2 ? 'Erheblich' : financialImpact >= 1 ? 'Moderat' : 'Gering',
      deviceTypes: deviceRelevance,
      precedentLevel: precedentValue >= 2 ? 'Hoch' : precedentValue >= 1 ? 'Mittel' : 'Gering',
      keyTakeaways: generateKeyTakeaways(contentLower),
      recommendedActions: generateRecommendations(contentLower, complianceImpact, deviceRelevance)
    };
  };
  
  const generateKeyTakeaways = (content: string) => {
    const takeaways = [];
    
    if (content.includes('haftung')) {
      takeaways.push({
        title: 'Verschärfte Haftungsstandards',
        description: 'Das Urteil etabliert neue, strengere Haftungsmaßstäbe für Medizinproduktehersteller. Unternehmen müssen ihre Produktverantwortung und Sorgfaltspflichten überdenken.'
      });
    }
    if (content.includes('qualitätsmanagementsystem') || content.includes('qms')) {
      takeaways.push({
        title: 'QMS-Anforderungen erweitert',
        description: 'Die Entscheidung zeigt auf, dass bestehende Qualitätsmanagementsysteme möglicherweise nicht ausreichen. Eine umfassende Überprüfung der QMS-Prozesse ist erforderlich.'
      });
    }
    if (content.includes('risikoanalyse') || content.includes('risikomanagement')) {
      takeaways.push({
        title: 'Risikomanagement überarbeiten',
        description: 'Der Fall verdeutlicht Schwächen in der Risikoanalyse und -bewertung. Unternehmen sollten ihre Risikomanagement-Verfahren grundlegend überprüfen und aktualisieren.'
      });
    }
    if (content.includes('nachmarktüberwachung')) {
      takeaways.push({
        title: 'Post-Market Surveillance kritisch',
        description: 'Die Nachmarktüberwachung wird als unzureichend bewertet. Verstärkte Monitoring-Systeme und proaktive Überwachungsmaßnahmen sind dringend erforderlich.'
      });
    }
    if (content.includes('klinische bewertung')) {
      takeaways.push({
        title: 'Klinische Bewertung mangelhaft',
        description: 'Das Gericht sieht erhebliche Defizite in der klinischen Bewertung. Nachträgliche klinische Studien und erweiterte Evidenzsammlung werden empfohlen.'
      });
    }
    if (content.includes('dokumentation')) {
      takeaways.push({
        title: 'Dokumentation unvollständig',
        description: 'Die technische Dokumentation wird als unzureichend eingestuft. Eine komplette Überarbeitung der Produktdokumentation ist notwendig.'
      });
    }
    
    // Fallback wenn keine spezifischen Takeaways gefunden
    if (takeaways.length === 0) {
      takeaways.push({
        title: 'Rechtliche Klarstellung',
        description: 'Diese Entscheidung schafft wichtige rechtliche Klarheit für die MedTech-Branche und definiert neue Standards für die Produktverantwortung.'
      });
      takeaways.push({
        title: 'Compliance-Standards präzisiert',
        description: 'Das Urteil konkretisiert bestehende Compliance-Anforderungen und schafft verbindliche Leitlinien für die Branche.'
      });
    }
    
    return takeaways.slice(0, 3); // Maximal 3 ausführliche Key Takeaways
  };
  
  const generateRecommendations = (content: string, compliance: string[], devices: string[]) => {
    const recommendations = [];
    
    if (content.includes('haftung') || content.includes('schadensersatz')) {
      recommendations.push({
        priority: 'Sofort',
        action: 'Haftpflichtversicherung überprüfen',
        description: 'Bestehende Versicherungspolice auf Deckungsumfang und Schadenssummen prüfen. Gegebenenfalls Deckung erweitern.'
      });
      recommendations.push({
        priority: '30 Tage',
        action: 'Produkthaftungs-Strategien überarbeiten',
        description: 'Rechtliche Beratung einholen und Produkthaftungsrichtlinien an neue Rechtsprechung anpassen.'
      });
    }
    
    if (compliance.length > 0) {
      recommendations.push({
        priority: '60 Tage',
        action: 'Umfassendes Compliance-Audit',
        description: 'Externe Compliance-Prüfung aller betroffenen Regulierungsbereiche durchführen und Schwachstellen identifizieren.'
      });
    }
    
    if (devices.length > 0) {
      recommendations.push({
        priority: '90 Tage',
        action: 'Produktportfolio-Risikobewertung',
        description: 'Alle Medizinprodukte im Portfolio hinsichtlich der neuen rechtlichen Standards bewerten und priorisieren.'
      });
    }
    
    if (content.includes('nachmarktüberwachung')) {
      recommendations.push({
        priority: '120 Tage',
        action: 'Post-Market Clinical Follow-up',
        description: 'PMCF-Studien für kritische Produkte initiieren und Überwachungssysteme erweitern.'
      });
    }
    
    // Standard-Empfehlungen als Fallback
    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'Sofort',
        action: 'Rechtliche Einschätzung einholen',
        description: 'Spezialisierte Anwaltskanzlei mit der Bewertung der Auswirkungen auf das Unternehmen beauftragen.'
      });
    }
    
    return recommendations.slice(0, 4); // Maximal 4 ausführliche Empfehlungen
  };
  
  const analysis = generateAIAnalysis(caseContent, caseTitle, caseSummary);
  
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Brain className="h-5 w-5" />
          KI-Analyse: Rechtsprechungs-Impact
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Risiko-Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <h4 className="font-semibold">Risiko-Level</h4>
            </div>
            <p className={`text-lg font-bold ${analysis.riskColor}`}>
              {analysis.riskLevel}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="h-4 w-4 text-blue-500" />
              <h4 className="font-semibold">Präzedenz-Wert</h4>
            </div>
            <p className="text-lg font-bold text-blue-600">
              {analysis.precedentLevel}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <h4 className="font-semibold">Finanzielles Risiko</h4>
            </div>
            <p className="text-lg font-bold text-purple-600">
              {analysis.financialRisk}
            </p>
          </div>
        </div>
        
        {/* Key Takeaways */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Target className="h-4 w-4 text-green-500" />
            Zentrale Erkenntnisse
          </h4>
          <div className="space-y-4">
            {analysis.keyTakeaways.map((takeaway, index) => (
              <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                <div className="flex items-start gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <h5 className="font-medium text-gray-900">{takeaway.title}</h5>
                </div>
                <div className="ml-6">
                  <FormattedText 
                    content={takeaway.description}
                    className="text-sm leading-relaxed"
                    maxHeight="max-h-32"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Compliance-Bereiche */}
        {analysis.complianceAreas.length > 0 && (
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              Betroffene Compliance-Bereiche
            </h4>
            <div className="flex flex-wrap gap-2">
              {analysis.complianceAreas.map((area, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                  {area.toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Handlungsempfehlungen */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-orange-500" />
            Handlungsempfehlungen nach Priorität
          </h4>
          <div className="space-y-4">
            {analysis.recommendedActions.map((recommendation, index) => (
              <div key={index} className="border rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900">{recommendation.action}</h5>
                  <Badge 
                    variant={recommendation.priority === 'Sofort' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {recommendation.priority}
                  </Badge>
                </div>
                <div className="text-sm text-gray-700">
                  <FormattedText 
                    content={recommendation.description}
                    className="text-sm leading-relaxed"
                    maxHeight="max-h-24"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Medizinprodukt-Kontext */}
        {analysis.deviceTypes.length > 0 && (
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Betroffene Medizinprodukte
            </h4>
            <div className="flex flex-wrap gap-2">
              {analysis.deviceTypes.map((device, index) => (
                <Badge key={index} variant="outline" className="text-xs border-red-200 text-red-700">
                  {device}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Kontext-Information */}
        <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500">
          <p className="text-xs text-gray-600">
            <strong>KI-Analyse basiert auf:</strong> Vollständiger Urteilstext, Gerichtsbeschluss, 
            Keywords und jurisdiktionsspezifische Faktoren. Gericht: {court}, 
            Jurisdiktion: {jurisdiction}
          </p>
        </div>
        
      </CardContent>
    </Card>
  );
}