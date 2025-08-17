import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Scale, Calendar, MapPin, FileText, Download, AlertCircle } from "lucide-react";

const mockLegalCases = [
  {
    id: "MDL-3032",
    title: "In Re: BioZorb Tissue Marker Products Liability Litigation",
    description: "Fall-Nummer: MDL No. 3032 | Gericht: U.S. District Court for the District of Massachusetts",
    court: "U.S. District Court for the District of Massachusetts",
    caseNumber: "MDL No. 3032",
    date: "2024-01-15",
    status: "Hoch Relevant",
    category: "Produkthaftung",
    jurisdiction: "US Federal",
    overview: `Diese federal product liability litigation involves Hologic Inc.'s BioZorb tissue marker device, a bio-absorbable clip used to mark biopsy sites in breast tissue. The case addresses fundamental questions about manufacturer responsibilities for device design, clinical testing adequacy, and post-market surveillance obligations in the tissue marking device category.

The litigation was consolidated in the District of Massachusetts in 2024, with plaintiffs from across the United States alleging various complications related to device use, including unexpected migration, tissue scarring, and surgical complications during marker placement and removal procedures.`,
    legalContext: `**URTEILSSPRUCH - MDL No. 3032**

Im Namen des Volkes ergeht folgendes Urteil:

**TENOR**
Das Gericht entscheidet in der Rechtsprechung In Re: BioZorb Tissue Marker Products Liability Litigation wie folgt:

1. Die Beklagte wird für schuldig befunden, gegen eine Sorgfaltspflichten im Bereich der Medizingerätesicherheit verstößen zu haben.

2. Die Klage wird in voller Umfang für begründet erklärt.

3. Die Beklagte wird zur Zahlung von Schadensersatz an dienste kläger verurteilt.

**RECHTSSATZ**
Dieses Urteil und die der Verkehrung rechtskräftig und ist vollstreckbar.

**RECHTSMITTEL**
Die genehmigung Prüfung hat ergeben, dass der Beklagte eigene Pflichten zur anderweitigen Entwicklung, Herstellung und Überwachung von Medizinprodukten verletzt hat. Die Beweise ergeben eindeutig, dass die entscheidenden Schäden durch die Pflichtverletzung des Beklagten verursacht wurden.`,
    damageAssessment: `**SCHADENSERSATZBERECHNUNG - Fall MDL No. 3032**

**DIREKTE MEDIZINISCHE KOSTEN**
• Notfallbehandlung und Diagnose: €39.274
• Revisions-operative Eingriffe: €125.000
• Langzeit-Therapie und Rehabilitation: €62.627
• Physiotherapie und Rehabilitation: €39.889

**2. SCHADENSZUSÄTZE**
• Körperliche Schmerzen: €225.529
• Seelische Leiden und Trauma: €163.294
• Beeinträchtigung der Lebensqualität: €193.543

**3. WIRTSCHAFTLICHE SCHÄDEN**
• Verlorene Arbeitstage: €15.682
• Reduzierte Erwerbsfähigkeit: €248.038
• Haushaltshilfenkosten: €78.357

**4. WEITERE AUSGABEN**
• Reise- und Unterbringungskosten: €24.829
• Anwalts- und Gerichtskosten: €156.543`,
    aiAnalysis: `**KI-gestützte Analyse - Fall MDL No. 3032**

**Automatische Risikobewertung**
🔴 **Hoch-Risiko** - Präzedenzfalle Entscheidung
🟣 **Competitive Relevanz** - 94/100
🟢 **Präventive Anwendbarkeit** - Hoch

**Präzedenzfall-Analyse:**
• **Titel:** Verschärfung der Post-Market Surveillance
• **Trend:** Nationale Harmonisierung steigt 20
• **Kategorien-Impact:** Internationale Harmonisierung steigt 20

**Regulatorische Trend-Analyse:**
• **Trend:** Verschärfte Due-Diligence-Anforderungen  
• **Prognose:** Erhöhte Qualitätssicherungstandards in 25% der größeren Stellenmarken
• **Risikopotential:** Prognose 65% Erfolgschance bei Berufung

**Automatische Kategorisierung:**
• **Rechtsgebiet:** Produkthaftungsrecht, Regulatorisches Recht
• **Gerätetyp:** Minimal-invasive Medizintechnik
• **Compliance:** Neue Review`,
    financialAnalysis: `**Finanzielle Auswirkungen & Compliance-Kosten**

**Präventive Ausgaben - Fall MDL No. 3032**
• **Compliance Assessment:** €150.000 - €250.000
• Rechtliche Verfahrensweisen: €500.000 - €2.000.000
• Regulatorische Compliance-Kosten: €250.000 - €1.500.000
• Post-Market-Surveillanceaktivitäten: €100.000 - €3.000.000

**Kurzfristige Auswirkungen:**
• Verzögerungen bei Produktzulassungen: 3-12 Monate  
• Erhöhte Versicherungskosten: 10-25% Steigerung
• Zusätzliche Qualitätssicherungsmaßnahmen: €50.000 - €250.000

**Langfristige Auswirkungen:**
• Verschärfte Due-Diligence-Anforderungen
• Erweiterte Dokumentations-/Compliance-Anforderungen: 10-30% der F&E-Budgets
• Veränderte International Harmonisierung`
  },
  {
    id: "CV-19345",
    title: "Medtronic v. FDA - Medical Device Classification Challenge", 
    description: "Fall-Nummer: Case No. 2024-CV-19345 | Gericht: U.S. District Court for the District of Columbia",
    court: "U.S. District Court for the District of Columbia", 
    caseNumber: "Case No. 2024-CV-19345",
    date: "2024-03-20",
    status: "Hoch Relevant",
    category: "Regulatorische Herausforderung",
    jurisdiction: "US Federal"
  }
];

export default function LegalIntelligenceCenter() {
  const [selectedCase, setSelectedCase] = useState(mockLegalCases[0]);
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-pink-500 to-red-500 flex items-center justify-center">
            <Scale className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Legal Intelligence Center</h1>
            <div className="flex items-center gap-4 mt-1">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                Rechtsfälle
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Gerichtsentscheidungen
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                Compliance
              </Badge>
            </div>
            <p className="text-gray-600 mt-1">65 Gerichtsentscheidungen und juristische Präzedenzfälle mit Executive-Analysen</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Daten synchronisieren
          </Button>
        </div>
      </div>

      {/* Success Banner */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-green-700">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="font-semibold">Erfolgreich: 65 Rechtsfälle geladen</span>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            Suche & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Rechtsfälle</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Jurisdiktionen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Jurisdiktionen</SelectItem>
                  <SelectItem value="us">US Federal</SelectItem>
                  <SelectItem value="eu">EU</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Startdatum</label>
              <Input type="date" placeholder="TT. MM. JJJJ" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Enddatum</label>
              <Input type="date" placeholder="TT. MM. JJJJ" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Suche</label>
              <Input placeholder="Fall, Gericht oder Entscheidung suchen..." />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Scale className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-600">65</div>
            <div className="text-sm text-gray-600">Gesamte Fälle</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-yellow-600">0</div>
            <div className="text-sm text-gray-600">Erwartete Änderungen</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="text-green-600 font-bold text-lg">OK</div>
            </div>
            <div className="text-sm text-gray-600">Synchronisation erfolgreich</div>
          </CardContent>
        </Card>
      </div>

      {/* Cases List */}
      <div className="space-y-4">
        {mockLegalCases.map((legalCase) => (
          <Card 
            key={legalCase.id}
            className={`cursor-pointer transition-all ${selectedCase.id === legalCase.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'}`}
            onClick={() => setSelectedCase(legalCase)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Scale className="h-4 w-4 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">{legalCase.title}</CardTitle>
                  </div>
                  <CardDescription>{legalCase.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="destructive">{legalCase.status}</Badge>
                  <Badge variant="secondary">{legalCase.jurisdiction}</Badge>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>

            {selectedCase.id === legalCase.id && (
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="overview">Übersicht</TabsTrigger>
                    <TabsTrigger value="summary">Zusammenfassung</TabsTrigger>
                    <TabsTrigger value="content">Vollständiger Inhalt</TabsTrigger>
                    <TabsTrigger value="legal">Urteilsspruch</TabsTrigger>
                    <TabsTrigger value="damages">Schadensersatz</TabsTrigger>
                    <TabsTrigger value="financial">Finanzanalyse</TabsTrigger>
                    <TabsTrigger value="ai">KI-Analyse</TabsTrigger>
                    <TabsTrigger value="metadata">Metadaten</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          Übersicht & Kerndaten
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose max-w-none">
                          <p>{selectedCase.overview}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="content" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          Vollständiger Inhalt & Rechtliche Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose max-w-none">
                          <p className="whitespace-pre-line">{selectedCase.overview}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="legal" className="mt-6">
                    <Card className="bg-purple-50 border-purple-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Scale className="h-5 w-5 text-purple-600" />
                          Gerichtlicher Urteilsspruch
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose max-w-none">
                          <pre className="whitespace-pre-wrap font-mono text-sm">{selectedCase.legalContext}</pre>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="damages" className="mt-6">
                    <Card className="bg-red-50 border-red-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-red-600" />
                          Schadensersatz & Kompensation
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose max-w-none">
                          <pre className="whitespace-pre-wrap font-mono text-sm">{selectedCase.damageAssessment}</pre>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="financial" className="mt-6">
                    <Card className="bg-green-50 border-green-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-green-600" />
                          Finanzanalyse & Compliance-Kosten
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose max-w-none">
                          <pre className="whitespace-pre-wrap font-mono text-sm">{selectedCase.financialAnalysis}</pre>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="ai" className="mt-6">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          KI-Analyse & Rechtliche Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose max-w-none">
                          <pre className="whitespace-pre-wrap font-mono text-sm">{selectedCase.aiAnalysis}</pre>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="metadata" className="mt-6">
                    <div className="grid grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Gerichtsinformationen</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Gericht:</span>
                              <span>{selectedCase.court}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Fall-Nummer:</span>
                              <span>{selectedCase.caseNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Jurisdiktion:</span>
                              <span>{selectedCase.jurisdiction}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Datum:</span>
                              <span>{new Date(selectedCase.date).toLocaleDateString('de-DE')}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}