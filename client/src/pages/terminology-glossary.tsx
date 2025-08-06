import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Search, 
  BookOpen, 
  Brain, 
  FileText, 
  Calculator, 
  Globe, 
  TrendingUp,
  AlertTriangle,
  Shield,
  Zap,
  Target,
  Database,
  ExternalLink,
  Clock
} from "lucide-react";
import { useDevice } from "@/hooks/use-device";
import { cn } from "@/lib/utils";

interface TerminologyEntry {
  id: string;
  term: string;
  category: string;
  definition: string;
  sources: string[];
  aiAnalysis: {
    successRate?: string;
    avgProcessingTime?: string;
    costFactor?: string;
    riskAssessment?: string;
    marketImpact?: string;
    recommendations?: string[];
  };
  application: string;
  relatedTerms: string[];
  lastUpdated: string;
  confidenceScore: number;
}

const terminologyData: TerminologyEntry[] = [
  {
    id: "510k",
    term: "510(k) Premarket Notification",
    category: "Regulatorische Terminologie",
    definition: "FDA-Zulassungsverfahren für Medizinprodukte der Klasse II zur Demonstration substanzieller Äquivalenz zu einem bereits zugelassenen Vergleichsprodukt.",
    sources: [
      "FDA Code of Federal Regulations 21 CFR 807",
      "FDA Guidance Document 'The 510(k) Program: Evaluating Substantial Equivalence'",
      "OpenFDA API Documentation"
    ],
    aiAnalysis: {
      successRate: "87% der eingereichten 510(k) werden genehmigt",
      avgProcessingTime: "90-120 Tage durchschnittliche Bearbeitungszeit",
      costFactor: "$12,000-$50,000 FDA-Gebühren plus interne Kosten",
      riskAssessment: "Mittleres Risiko bei fehlender Predicate-Strategie",
      marketImpact: "Direkter Marktzugang bei Approval, 18 Monate Verzögerung bei Rejection",
      recommendations: [
        "Frühe Predicate Device Identifikation",
        "Pre-Submission Meeting mit FDA empfohlen",
        "Vollständige technische Dokumentation kritisch"
      ]
    },
    application: "Automatische Tracking von FDA 510(k) Clearances durch OpenFDA API Integration",
    relatedTerms: ["Predicate Device", "Substantial Equivalence", "FDA Class II"],
    lastUpdated: "2025-08-06",
    confidenceScore: 0.96
  },
  {
    id: "ce-marking",
    term: "CE-Kennzeichnung (Conformité Européenne)",
    category: "Regulatorische Terminologie", 
    definition: "Europäische Konformitätsbewertung für Medizinprodukte gemäß EU MDR 2017/745, die die Einhaltung aller relevanten EU-Rechtsvorschriften bestätigt.",
    sources: [
      "EU MDR 2017/745, Anhang VII-XI",
      "EU MDCG Guidance Documents",
      "EMA European Medicine Agency Database"
    ],
    aiAnalysis: {
      successRate: "94% bei etablierten Herstellern mit vollständiger Dokumentation",
      avgProcessingTime: "6-18 Monate je nach Geräte-Risikoklasse",
      costFactor: "€50,000-€500,000 je nach Komplexität und Notified Body",
      riskAssessment: "Hohe Compliance-Anforderungen seit MDR-Transition",
      marketImpact: "Marktzugang zu 500M EU-Verbrauchern",
      recommendations: [
        "Frühe Notified Body Engagement",
        "Umfassende Clinical Evaluation erforderlich",
        "Post-Market Surveillance Plan obligatorisch"
      ]
    },
    application: "EMA-Datenbank Integration für CE-Zertifikat Monitoring und Compliance-Tracking",
    relatedTerms: ["EU MDR", "Notified Body", "Clinical Evaluation"],
    lastUpdated: "2025-08-06",
    confidenceScore: 0.94
  },
  {
    id: "fhir-r4",
    term: "FHIR R4 (Fast Healthcare Interoperability Resources)",
    category: "Technische Terminologie",
    definition: "HL7-Standard der vierten Generation für Gesundheitsdateninteroperabilität, der REST-APIs und moderne Web-Technologien für Datenaustauschdienste nutzt.",
    sources: [
      "HL7 International FHIR R4 Specification",
      "MEDITECH FHIR API Documentation",
      "Healthcare Interoperability Standards Analysis"
    ],
    aiAnalysis: {
      successRate: "78% Adoptionsrate bei größeren Medtech-Unternehmen",
      avgProcessingTime: "3-6 Monate für Standard-Workflow-Implementierung",
      costFactor: "$200,000-$800,000 für Enterprise-Integration",
      riskAssessment: "Niedrig bei standardkonformer Implementierung",
      marketImpact: "94% Entwickler-Präferenz für REST-API Integration",
      recommendations: [
        "FHIR-konforme API-Entwicklung prioritär",
        "Interoperabilitäts-Testing in früher Phase",
        "Security-Standards (OAuth 2.0) implementieren"
      ]
    },
    application: "MEDITECH FHIR API Integration für Real-time Medical Device Data Exchange",
    relatedTerms: ["HL7", "Interoperability", "REST API"],
    lastUpdated: "2025-08-06",
    confidenceScore: 0.91
  },
  {
    id: "udi-system",
    term: "UDI (Unique Device Identification)",
    category: "Technische Terminologie",
    definition: "Eindeutige Medizinprodukt-Identifikation nach FDA 21 CFR 830 und EU MDR Article 27 für globale Supply Chain Transparenz und Traceability.",
    sources: [
      "FDA 21 CFR 830 Unique Device Identification",
      "EU MDR Article 27 UDI System",
      "FDA GUDID Database Documentation"
    ],
    aiAnalysis: {
      successRate: "91% Compliance bei Class III Devices, 67% bei Class II",
      avgProcessingTime: "6-12 Monate für vollständige UDI-System Implementation",
      costFactor: "$50,000-$200,000 für UDI-System Setup",
      riskAssessment: "Mittleres Risiko bei fehlender GUDID-Integration",
      marketImpact: "$2.3M durchschnittliche Einsparungen durch Supply Chain Optimization",
      recommendations: [
        "Frühzeitige UDI-Strategie entwickeln",
        "GUDID Database Integration prioritär",
        "Barcode/RFID Standards implementieren"
      ]
    },
    application: "Automatische UDI-Validierung über FDA GUDID Database und EMA EUDAMED",
    relatedTerms: ["GUDID", "EUDAMED", "Supply Chain"],
    lastUpdated: "2025-08-06", 
    confidenceScore: 0.89
  },
  {
    id: "product-liability",
    term: "Product Liability (Produkthaftung)",
    category: "Rechtliche Terminologie",
    definition: "Rechtliche Verantwortung von Herstellern für Schäden durch fehlerhafte Produkte gemäß Produkthaftungsgesetz (ProdHaftG) und US Product Liability Law.",
    sources: [
      "Produkthaftungsgesetz (ProdHaftG) Deutschland",
      "US Product Liability Restatement (Third) of Torts",
      "European Product Liability Legal Database"
    ],
    aiAnalysis: {
      successRate: "73% Erfolgsrate Herstellerverteidigung bei vollständiger Dokumentation",
      avgProcessingTime: "18-36 Monate durchschnittliche Verfahrensdauer",
      costFactor: "$2.4M durchschnittliche Schadensersatzsummen (US), €890K (EU)",
      riskAssessment: "Hohes finanzielles Risiko ohne angemessene Absicherung",
      marketImpact: "Design Defects 51%, Warning Defects 29% der Klagegründe",
      recommendations: [
        "Umfassende Risikobewertung in Design-Phase",
        "Vollständige Dokumentation aller Designentscheidungen",
        "Produkthaftpflichtversicherung obligatorisch"
      ]
    },
    application: "Legal Case Database Monitoring für Präzedenzfall-Analyse und Risk Assessment",
    relatedTerms: ["Design Defects", "Warning Defects", "Risk Management"],
    lastUpdated: "2025-08-06",
    confidenceScore: 0.87
  },
  {
    id: "qsr-820",
    term: "21 CFR Part 820 (Quality System Regulation)",
    category: "Compliance & Audit",
    definition: "FDA Qualitätsmanagementsystem-Regulation für Medizinprodukte-Hersteller mit Fokus auf Design Controls, CAPA und Management Responsibility.",
    sources: [
      "FDA 21 CFR Part 820 Quality System Regulation",
      "FDA QSR Inspection Guidance",
      "Industry QSR Best Practices Database"
    ],
    aiAnalysis: {
      successRate: "84% erfolgreiche FDA-Inspektionen bei vollständiger QSR-Implementierung",
      avgProcessingTime: "12-18 Monate für vollständige QSR-System-Implementierung",
      costFactor: "$500,000-$2M für Enterprise QSR System",
      riskAssessment: "Kritisch für FDA-Marktzugang und Inspektions-Readiness",
      marketImpact: "320% ROI durch reduzierte FDA-Inspektions-Findings",
      recommendations: [
        "Design Controls (§820.30) als Priorität",
        "Robustes CAPA System (§820.100) implementieren", 
        "Management Review Prozesse etablieren"
      ]
    },
    application: "Automated QSR Compliance Checking via Document Analysis und Audit Trail",
    relatedTerms: ["Design Controls", "CAPA", "FDA Inspection"],
    lastUpdated: "2025-08-06",
    confidenceScore: 0.93
  },
  {
    id: "ai-ml-samd",
    term: "AI/ML in Medical Devices (SaMD)",
    category: "Technologie & Innovation",
    definition: "Software als Medizinprodukt (Software as Medical Device) mit Künstlicher Intelligenz und Machine Learning Komponenten gemäß FDA/EU Guidance.",
    sources: [
      "FDA Software as Medical Device Guidance 2022",
      "EU MDCG 2019-11 Software Guidance",
      "AI/ML-Based Medical Device Industry Analysis"
    ],
    aiAnalysis: {
      successRate: "73% Zulassungserfolg bei strukturiertem Pre-Submission Approach",
      avgProcessingTime: "15-24 Monate für AI/ML SaMD Zulassung",
      costFactor: "$1M-$5M für AI/ML Clinical Validation",
      riskAssessment: "Hoch aufgrund evolving regulatory landscape",
      marketImpact: "$45B Marktpotential bis 2030 (CAGR 28%)",
      recommendations: [
        "FDA Pre-Submission für AI/ML Algorithmen",
        "Robuste Clinical Validation Strategy",
        "Algorithm Change Control Prozesse etablieren"
      ]
    },
    application: "AI/ML Regulatory Pathway Optimization und Algorithm Performance Monitoring",
    relatedTerms: ["Software as Medical Device", "Algorithm", "Clinical Validation"],
    lastUpdated: "2025-08-06",
    confidenceScore: 0.85
  }
];

const categories = [
  "Alle Kategorien",
  "Regulatorische Terminologie", 
  "Technische Terminologie",
  "Rechtliche Terminologie", 
  "Compliance & Audit",
  "Technologie & Innovation"
];

export default function TerminologyGlossary() {
  const device = useDevice();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Alle Kategorien");
  const [sortBy, setSortBy] = useState("term");

  // Load terminology data from API  
  const { data: apiTerms, isLoading } = useQuery({
    queryKey: ['/api/terminology'],
    staleTime: 300000,
  });

  const allTerms = apiTerms || terminologyData;
  const filteredTerms = allTerms
    .filter(term => {
      const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           term.definition.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "Alle Kategorien" || term.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "term") return a.term.localeCompare(b.term);
      if (sortBy === "category") return a.category.localeCompare(b.category);
      if (sortBy === "confidence") return b.confidenceScore - a.confidenceScore;
      if (sortBy === "updated") return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      return 0;
    });

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 0.8) return "bg-blue-100 text-blue-800 border-blue-200";
    if (score >= 0.7) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Regulatorische Terminologie": return <Shield className="h-4 w-4" />;
      case "Technische Terminologie": return <Zap className="h-4 w-4" />;
      case "Rechtliche Terminologie": return <AlertTriangle className="h-4 w-4" />;
      case "Compliance & Audit": return <Target className="h-4 w-4" />;
      case "Technologie & Innovation": return <Brain className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn(
      "space-y-6",
      device.isMobile ? "p-4" : device.isTablet ? "p-6" : "p-8"
    )}>
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            Helix Terminologie-Kompilation
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
            Umfassende Begriffsdokumentation mit Quellen, KI-Analysen und praktischen Anwendungen
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{terminologyData.length}</div>
              <div className="text-sm text-gray-600">Begriffe</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{categories.length - 1}</div>
              <div className="text-sm text-gray-600">Kategorien</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(terminologyData.reduce((sum, term) => sum + term.confidenceScore, 0) / terminologyData.length * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Ø Konfidenz</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {terminologyData.reduce((sum, term) => sum + term.sources.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Quellen</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            Suche & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Suchbegriff</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Begriff oder Definition suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Kategorie</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Sortierung</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="term">Begriff A-Z</SelectItem>
                  <SelectItem value="category">Kategorie</SelectItem>
                  <SelectItem value="confidence">Konfidenz</SelectItem>
                  <SelectItem value="updated">Aktualisiert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("Alle Kategorien");
                  setSortBy("term");
                }}
                variant="outline"
                className="w-full"
              >
                Filter zurücksetzen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {filteredTerms.length} von {terminologyData.length} Begriffen
          </h2>
          <Badge variant="outline" className="bg-blue-50">
            {selectedCategory === "Alle Kategorien" ? "Alle Kategorien" : selectedCategory}
          </Badge>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {filteredTerms.map((term) => (
            <AccordionItem key={term.id} value={term.id} className="border rounded-lg">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center justify-between w-full text-left">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(term.category)}
                    <div>
                      <h3 className="font-semibold text-lg">{term.term}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {term.definition.substring(0, 120)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge className={getConfidenceColor(term.confidenceScore)}>
                      {Math.round(term.confidenceScore * 100)}%
                    </Badge>
                    <Badge variant="outline">{term.category}</Badge>
                  </div>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="px-6 pb-6">
                <Tabs defaultValue="definition" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="definition">Definition</TabsTrigger>
                    <TabsTrigger value="analysis">KI-Analyse</TabsTrigger>
                    <TabsTrigger value="sources">Quellen</TabsTrigger>
                    <TabsTrigger value="application">Anwendung</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="definition" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Vollständige Definition
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed">{term.definition}</p>
                        {term.relatedTerms.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-medium mb-2">Verwandte Begriffe:</h4>
                            <div className="flex flex-wrap gap-2">
                              {term.relatedTerms.map((relatedTerm, idx) => (
                                <Badge key={idx} variant="secondary">
                                  {relatedTerm}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="analysis" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {term.aiAnalysis.successRate && (
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              Erfolgsrate
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm">{term.aiAnalysis.successRate}</p>
                          </CardContent>
                        </Card>
                      )}
                      
                      {term.aiAnalysis.avgProcessingTime && (
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-600" />
                              Bearbeitungszeit
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm">{term.aiAnalysis.avgProcessingTime}</p>
                          </CardContent>
                        </Card>
                      )}
                      
                      {term.aiAnalysis.costFactor && (
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Calculator className="h-4 w-4 text-purple-600" />
                              Kostenfaktor
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm">{term.aiAnalysis.costFactor}</p>
                          </CardContent>
                        </Card>
                      )}
                      
                      {term.aiAnalysis.marketImpact && (
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Globe className="h-4 w-4 text-orange-600" />
                              Marktauswirkung
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm">{term.aiAnalysis.marketImpact}</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                    
                    {term.aiAnalysis.recommendations && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Brain className="h-4 w-4 text-indigo-600" />
                            KI-Empfehlungen
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {term.aiAnalysis.recommendations.map((rec, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <Target className="h-3 w-3 mt-1 text-green-600 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="sources" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          Authentische Quellen
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {term.sources.map((source, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <ExternalLink className="h-3 w-3 mt-1 text-blue-600 flex-shrink-0" />
                              {source}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2 text-sm">
                            <Shield className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">Konfidenz-Score: {Math.round(term.confidenceScore * 100)}%</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            Letztes Update: {new Date(term.lastUpdated).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="application" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Praktische Anwendung in Helix
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed">{term.application}</p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {filteredTerms.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Begriffe gefunden</h3>
            <p className="text-gray-600 mb-4">
              Versuchen Sie andere Suchbegriffe oder ändern Sie die Filtereinstellungen.
            </p>
            <Button onClick={() => setSearchTerm("")} variant="outline">
              Suche zurücksetzen
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}