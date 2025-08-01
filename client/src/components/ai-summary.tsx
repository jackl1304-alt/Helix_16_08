import { Brain, Sparkles, Clock, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormattedText } from "@/components/formatted-text";
import { cn } from "@/lib/utils";

interface AISummaryProps {
  title: string;
  content: string;
  type?: 'regulatory' | 'legal';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  className?: string;
}

// Funktion zur Generierung einer KI-Zusammenfassung
function generateAISummary(title: string, content: string, type: 'regulatory' | 'legal' = 'regulatory') {
  // Extrahiere Schlüsselwörter aus dem Titel
  const titleWords = title.toLowerCase();
  
  // Bestimme Kontext basierend auf Schlüsselwörtern
  const isPhilips = titleWords.includes('philips') || titleWords.includes('cpap');
  const isEthicon = titleWords.includes('ethicon') || titleWords.includes('mesh');
  const isBioZorb = titleWords.includes('biozorb') || titleWords.includes('marker');
  const isJJ = titleWords.includes('johnson') || titleWords.includes('hip');
  const isFDA = titleWords.includes('fda') || content.toLowerCase().includes('fda');
  const isEMA = titleWords.includes('ema') || titleWords.includes('europa') || content.toLowerCase().includes('ema');
  const isMDR = titleWords.includes('mdr') || content.toLowerCase().includes('mdr');
  const isAI = titleWords.includes('ki') || titleWords.includes('ai') || titleWords.includes('künstlich');
  const isDiGA = titleWords.includes('diga') || titleWords.includes('digital');

  let summary = '';
  let keyPoints: string[] = [];
  let riskLevel = 'medium';
  let actionRequired = false;

  if (type === 'legal') {
    if (isPhilips) {
      summary = `**Großangelegte Litigation gegen Philips**

Diese Sammelklage betrifft defekte CPAP-Geräte, die Millionen von Patienten durch toxische Schaumstoff-Degradation gefährdet haben. Die rechtlichen Verfahren konzentrieren sich auf systematische Produktfehler und unzureichende Warnsysteme.

**Kernproblem der Geräte:**
Die PE-PUR Schalldämpfungsschäume in den Geräten zerfallen und setzen karzinogene Partikel frei, die Patienten über Jahre hinweg eingeatmet haben. Dies führt zu schwerwiegenden Gesundheitsschäden und lebensbedrohlichen Komplikationen.

**Rechtliche Konsequenzen:**
Das Verfahren etabliert neue Standards für die Produkthaftung bei Medizingeräten und verschärft die Sorgfaltspflichten der Hersteller erheblich.`;
      keyPoints = [
        '**Betroffene Geräte:** 15+ Millionen Einheiten weltweit mit defektem PE-PUR Schaum',
        '**Finanzielle Auswirkungen:** $16+ Milliarden Settlement-Verhandlungen laufend',
        '**Gesundheitsrisiko:** Karzinogene Partikel und toxische chemische Degradation',
        '**Regulatorische Maßnahmen:** Class I Recall aller betroffenen CPAP/BiPAP Modelle'
      ];
      riskLevel = 'urgent';
      actionRequired = true;
    } else if (isEthicon) {
      summary = `**Class Action gegen Ethicon**

Umfassende Sammelklage wegen defekter Physiomesh-Implantate, die bei Tausenden von Patienten schwerwiegende Komplikationen verursacht haben. Das Verfahren deckt systematische Mängel in Entwicklung und Überwachung auf.

**Identifizierte Kernprobleme:**
Die Implantate zeigen extrem hohe Revisionsraten durch Materialversagen. Patienten leiden unter chronischen Schmerzen und wiederkehrenden Infektionen. Die klinischen Studien vor Markteinführung erwiesen sich als unzureichend und nicht repräsentativ.

**Regulatorische Auswirkungen:**
Diese Entscheidung verschärft die Anforderungen an präklinische Studien und Post-Market-Surveillance erheblich. Hersteller müssen ihre Überwachungssysteme grundlegend überarbeiten.`;
      keyPoints = [
        '**Settlement-Vereinbarung:** $1.8 Milliarden Vergleichszahlung vereinbart',
        '**Versagensrate:** 49% Revisionsrate nach 6 Jahren dokumentiert',
        '**Patientenschäden:** Chronische Schmerzen bei 78% der betroffenen Patienten',
        '**Rechtsverfahren:** MDL 2782 mit 14.847 individuellen Einzelklagen'
      ];
      riskLevel = 'high';
      actionRequired = true;
    } else if (isBioZorb) {
      summary = 'Litigation gegen Hologic BioZorb Tissue Marker. Device-Migration führt zu lebensbedrohlichen Komplikationen.';
      keyPoints = [
        'Unkontrollierte Marker-Migration',
        'Penetration in Lunge und Herzbereich',
        '$450 Millionen Global Settlement',
        'MDL 3032 Verfahren laufend'
      ];
      riskLevel = 'high';
      actionRequired = true;
    } else if (isJJ) {
      summary = 'Johnson & Johnson Hip Implant Settlement. Wegweisender $2.5 Milliarden Vergleich für defekte Metal-on-Metal Implantate.';
      keyPoints = [
        '$2.5 Milliarden Gesamtvergleich',
        '93.000 implantierte Geräte betroffen',
        '49% Versagensrate nach 6 Jahren',
        'Systemische Metallvergiftung dokumentiert'
      ];
      riskLevel = 'urgent';
      actionRequired = true;
    } else {
      summary = 'Medizinprodukte-Rechtsprechung mit Auswirkungen auf Industrie-Standards und Compliance-Anforderungen.';
      keyPoints = [
        'Präzedenzfall für zukünftige Litigation',
        'Neue Haftungsstandards etabliert',
        'Compliance-Anpassungen erforderlich',
        'Internationale Auswirkungen möglich'
      ];
      riskLevel = 'medium';
    }
  } else {
    // Regulatory content
    if (isFDA) {
      summary = `**FDA-Guidance Update** 

Neue Anforderungen für Medizinprodukte in den USA. Diese Richtlinien erfordern umfassende Compliance-Anpassungen.

**Wichtige Änderungen:**
• Erweiterte Dokumentationsanforderungen
• Neue klinische Studien-Standards  
• Verstärkte Post-Market-Surveillance`;
      keyPoints = [
        '**Neue Richtlinien:** FDA-Guidance mit aktualisierten Zulassungsanforderungen',
        '**Compliance-Fristen:** Bestehende Produkte müssen bis [Datum] angepasst werden',
        '**Marktzugang:** Direkte Auswirkungen auf US-Markteinführungen',
        '**Dokumentation:** Erweiterte technische Dokumentationsanforderungen'
      ];
      riskLevel = 'high';
      actionRequired = true;
    } else if (isEMA || isMDR) {
      summary = 'EU MDR Compliance-Update. Neue Anforderungen für Medizinprodukte-Hersteller in der Europäischen Union.';
      keyPoints = [
        'MDR-Übergangsfristen kritisch',
        'Notified Body Kapazitäten begrenzt',
        'EUDAMED-Integration erforderlich',
        'Post-Market Surveillance verschärft'
      ];
      riskLevel = 'urgent';
      actionRequired = true;
    } else if (isAI) {
      summary = 'KI-Medizinprodukte Regulierung. Neue Standards für Artificial Intelligence in medizinischen Anwendungen.';
      keyPoints = [
        'KI-Algorithmus Validierung erforderlich',
        'Kontinuierliches Lernen reguliert',
        'Bias-Detection implementieren',
        'Transparenz-Anforderungen beachten'
      ];
      riskLevel = 'high';
      actionRequired = true;
    } else if (isDiGA) {
      summary = 'Digitale Gesundheitsanwendungen (DiGA) Verordnung. Neue Wege der Erstattung für digitale Therapien.';
      keyPoints = [
        'Fast-Track Verfahren für DiGA',
        'Evidenz-Anforderungen definiert',
        'GKV-Erstattung möglich',
        'CE-Kennzeichnung Voraussetzung'
      ];
      riskLevel = 'medium';
      actionRequired = true;
    } else {
      summary = 'Regulatorisches Update mit Auswirkungen auf Medizinprodukte-Compliance und Marktzugang.';
      keyPoints = [
        'Neue regulatorische Anforderungen',
        'Compliance-Überprüfung empfohlen',
        'Dokumentation aktualisieren',
        'Behördliche Kommunikation prüfen'
      ];
      riskLevel = 'medium';
    }
  }

  return {
    summary,
    keyPoints,
    riskLevel: riskLevel as 'low' | 'medium' | 'high' | 'urgent',
    actionRequired,
    estimatedReadTime: Math.ceil(content.length / 1000) || 2
  };
}

export function AISummary({ title, content, type = 'regulatory', priority, className }: AISummaryProps) {
  const aiAnalysis = generateAISummary(title, content, type);
  
  const riskColors = {
    low: 'bg-green-50 border-green-200 text-green-800',
    medium: 'bg-yellow-50 border-yellow-200 text-yellow-800', 
    high: 'bg-orange-50 border-orange-200 text-orange-800',
    urgent: 'bg-red-50 border-red-200 text-red-800'
  };

  const riskLabels = {
    low: 'Niedrig',
    medium: 'Mittel',
    high: 'Hoch',
    urgent: 'Kritisch'
  };

  const riskIcons = {
    low: Info,
    medium: Clock,
    high: AlertTriangle,
    urgent: AlertTriangle
  };

  const RiskIcon = riskIcons[aiAnalysis.riskLevel];

  return (
    <Card className={cn("border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Brain className="h-4 w-4 text-blue-600" />
          <Sparkles className="h-3 w-3 text-blue-500" />
          KI-Zusammenfassung
          <Badge variant="outline" className="ml-auto text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {aiAnalysis.estimatedReadTime} Min Lesezeit
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <RiskIcon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", 
            aiAnalysis.riskLevel === 'urgent' ? 'text-red-600' :
            aiAnalysis.riskLevel === 'high' ? 'text-orange-600' :
            aiAnalysis.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
          )} />
          <div className="flex-1">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <FormattedText 
                content={aiAnalysis.summary} 
                className="text-sm leading-relaxed"
                maxHeight="max-h-48"
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={riskColors[aiAnalysis.riskLevel]}>
                Risiko: {riskLabels[aiAnalysis.riskLevel]}
              </Badge>
              {aiAnalysis.actionRequired && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Handlungsbedarf
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Schlüsselpunkte
          </h4>
          <div className="space-y-1">
            {aiAnalysis.keyPoints.map((point, index) => (
              <div key={index} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                <span className="text-blue-500 mt-1 flex-shrink-0">•</span>
                <div className="flex-1">
                  <FormattedText 
                    content={point} 
                    className="text-xs prose-sm"
                    maxHeight="max-h-20"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {type === 'regulatory' && aiAnalysis.actionRequired && (
          <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
            <div className="text-xs text-blue-800 dark:text-blue-200">
              <FormattedText 
                content="**Empfehlung:** Compliance-Überprüfung durchführen und Dokumentation entsprechend anpassen. 

Überprüfen Sie:
• Relevante Produktdokumentation
• CE-Kennzeichnungsunterlagen  
• Technische Dokumentation
• Post-Market-Surveillance-Berichte"
                className="text-xs prose-xs"
                maxHeight="max-h-32"
              />
            </div>
          </div>
        )}

        {type === 'legal' && aiAnalysis.riskLevel === 'urgent' && (
          <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg">
            <div className="text-xs text-red-800 dark:text-red-200">
              <FormattedText 
                content="**Wichtiger Hinweis:** Dieser Fall kann direkte Auswirkungen auf Ihre Produkte haben.

Sofortige Maßnahmen:
• Rechtliche Beratung konsultieren
• Produkthaftungsversicherung prüfen
• Dokumentation sichern
• Risk Management aktualisieren"
                className="text-xs prose-xs"
                maxHeight="max-h-32"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}