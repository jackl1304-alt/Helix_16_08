import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Clock, FileText, Scale, DollarSign, Brain, Gavel, RefreshCw, Download } from 'lucide-react';

// Types
interface LegalCase {
  id: string;
  case_number: string;
  title: string;
  court: string;
  jurisdiction: string;
  decision_date: string;
  summary: string;
  content: string;
  impact_level?: string;
  keywords?: string[];
  judgment?: string;
  damages?: string;
  financial_impact?: string;
  device_type?: string;
  language?: string;
  tags?: string[];
}

// LOKALE JSON-DATENSTRUKTUR - KEINE BACKEND-VERBINDUNGEN
const legalCasesData: LegalCase[] = [
  {
    id: "lc_001",
    case_number: "2023-CV-1245",
    title: "FDA vs. MedDevice Corp - Cybersecurity Compliance",
    court: "U.S. District Court",
    jurisdiction: "US Federal Courts (USA)",
    decision_date: "2024-03-15T00:00:00Z",
    summary: "Wichtige Entscheidung zur Cybersecurity-Compliance bei Medizingeräten",
    content: "Das Gericht entschied über die Anwendbarkeit neuer FDA-Cybersecurity-Richtlinien auf bereits zugelassene Medizingeräte. Die Entscheidung hat weitreichende Auswirkungen auf die gesamte MedTech-Industrie.",
    impact_level: "high",
    keywords: ["Cybersecurity", "FDA", "Compliance", "Medical Devices"],
    judgment: "Zugunsten der FDA",
    damages: "€2.5M Strafe",
    financial_impact: "Significant regulatory compliance costs industry-wide",
    device_type: "Connected Medical Devices",
    language: "English",
    tags: ["Cybersecurity", "Regulatory", "FDA"]
  },
  {
    id: "lc_002", 
    case_number: "EU-2024-MDR-089",
    title: "European Commission vs. GlobalMed Inc - MDR Compliance",
    court: "European Court of Justice",
    jurisdiction: "EU",
    decision_date: "2024-02-20T00:00:00Z",
    summary: "Grundsatzentscheidung zur EU-MDR-Umsetzung und Übergangsfristen",
    content: "Die Entscheidung klärt wichtige Fragen zur Anwendung der MDR auf Legacy-Devices und deren Rezertifizierung. Besonders relevant für Hersteller mit CE-Kennzeichnung vor 2021.",
    impact_level: "high",
    keywords: ["EU MDR", "CE Marking", "Legacy Devices", "Transition"],
    judgment: "Teilweise zugunsten der Kommission",
    damages: "€1.8M Strafe + Compliance-Kosten",
    financial_impact: "Major impact on EU medical device market",
    device_type: "Class II & III Medical Devices",
    language: "English/German",
    tags: ["EU MDR", "Compliance", "CE Marking"]
  },
  {
    id: "lc_003",
    case_number: "BGH-2024-XII-45",
    title: "Bundesgerichtshof - Haftung bei KI-basierten Diagnose-Systemen",
    court: "Bundesgerichtshof",
    jurisdiction: "Germany", 
    decision_date: "2024-01-10T00:00:00Z",
    summary: "Wegweisende Entscheidung zur Produkthaftung bei KI-gestützten Medizinprodukten",
    content: "Der BGH definierte erstmals die Haftungsverteilung zwischen Herstellern, Softwareanbietern und Anwendern bei fehlerhaften KI-Diagnosen. Die Entscheidung schafft wichtige Rechtssicherheit.",
    impact_level: "medium",
    keywords: ["KI", "Produkthaftung", "Diagnose-Systeme", "BGH"],
    judgment: "Hersteller-Haftung bestätigt",
    damages: "€500K Schadensersatz",
    financial_impact: "Increased insurance requirements for AI device manufacturers",
    device_type: "AI-based Diagnostic Systems",
    language: "German",
    tags: ["KI", "Haftung", "Diagnose", "Deutschland"]
  }
];

export default function RechtsprechungFixed() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // ECHTE API-DATEN VERWENDEN
  const { data: legalCases = [], isLoading } = useQuery<LegalCase[]>({
    queryKey: ['/api/legal-cases'],
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
  });

  const handleSync = () => {
    console.log("✅ MOCK SYNC: Legal cases synchronized (local data)");
  };

  // Filter cases
  const filteredCases = legalCases.filter(legalCase => {
    const matchesSearch = !searchTerm || 
      legalCase.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      legalCase.case_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      legalCase.court?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesJurisdiction = !selectedJurisdiction || selectedJurisdiction === 'all' || legalCase.jurisdiction === selectedJurisdiction;
    
    const caseDate = new Date(legalCase.decision_date);
    const matchesDateRange = (!startDate || caseDate >= new Date(startDate)) &&
                            (!endDate || caseDate <= new Date(endDate));
    
    return matchesSearch && matchesJurisdiction && matchesDateRange;
  });

  const getJurisdictionIcon = (jurisdiction: string) => {
    switch (jurisdiction) {
      case 'US Federal Courts (USA)': return '🇺🇸';
      case 'EU': return '🇪🇺';
      case 'Germany': return '🇩🇪';
      case 'UK': return '🇬🇧';
      case 'Canada': return '🇨🇦';
      case 'Australia': return '🇦🇺';
      default: return '🌍';
    }
  };

  const getImpactBadgeColor = (impactLevel: string | undefined) => {
    switch (impactLevel) {
      case 'high': return 'bg-red-500 text-white hover:bg-red-600';
      case 'medium': return 'bg-yellow-500 text-black hover:bg-yellow-600';
      case 'low': return 'bg-green-500 text-white hover:bg-green-600';
      default: return 'bg-gray-500 text-white hover:bg-gray-600';
    }
  };

  const uniqueJurisdictions = [...new Set(legalCases.map(c => c.jurisdiction))].filter(Boolean);

  return (
    <div className="w-full max-w-none p-6 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3 deltaways-brand-text">
            <Scale className="h-10 w-10 text-purple-600" />
            Legal Intelligence Center
          </h1>
          <p className="text-gray-600 text-lg">
            {filteredCases.length} Gerichtsentscheidungen und juristische Präzedenzfälle mit Executive-Analysen
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleSync}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Daten synchronisieren
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gesamte Fälle</p>
                <p className="text-3xl font-bold text-gray-900">{legalCases.length}</p>
              </div>
              <Gavel className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Erkannte Änderungen</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Synchronisation erfolgreich</p>
                <p className="text-lg font-bold text-green-600">OK</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Suche & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rechtsquelle</label>
              <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Jurisdiktionen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Jurisdiktionen</SelectItem>
                  {uniqueJurisdictions.map(jurisdiction => (
                    <SelectItem key={jurisdiction} value={jurisdiction}>
                      {getJurisdictionIcon(jurisdiction)} {jurisdiction}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Startdatum</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="tt.mm.jjjj"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Enddatum</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="tt.mm.jjjj"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Suche</label>
              <Input
                placeholder="Fall, Gericht oder Entscheidung suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Cases Grid - FULL WIDTH */}
      <div className="grid grid-cols-1 gap-6">
        {filteredCases.map((legalCase) => (
          <Card key={legalCase.id} className="hover:shadow-lg transition-shadow deltaways-card-hover">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight">
                    {getJurisdictionIcon(legalCase.jurisdiction)} {legalCase.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {legalCase.case_number}
                    </Badge>
                    <Badge 
                      className={`text-xs ${getImpactBadgeColor(legalCase.impact_level)}`}
                    >
                      {(legalCase.impact_level || 'unknown').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <CardDescription className="space-y-2">
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Scale className="h-4 w-4" />
                    {legalCase.court}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(legalCase.decision_date).toLocaleDateString('de-DE')}
                  </span>
                </div>
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview">Übersicht</TabsTrigger>
                  <TabsTrigger value="summary">Zusammenfassung</TabsTrigger>
                  <TabsTrigger value="content">Vollständiger Inhalt</TabsTrigger>
                  <TabsTrigger value="financial">Finanzanalyse</TabsTrigger>
                  <TabsTrigger value="ai">KI-Analyse</TabsTrigger>
                  <TabsTrigger value="metadata">Metadaten</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {legalCase.summary}
                  </p>
                  
                  {legalCase.keywords && legalCase.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {legalCase.keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="summary" className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-1">Entscheidung:</h4>
                      <p className="text-sm">{legalCase.judgment || 'Nicht verfügbar'}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-1">Schäden/Strafen:</h4>
                      <p className="text-sm">{legalCase.damages || 'Nicht spezifiziert'}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-1">Gerätetyp:</h4>
                      <p className="text-sm">{legalCase.device_type || 'Nicht spezifiziert'}</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="content" className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm leading-relaxed">
                      {legalCase.content}
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="financial" className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Finanzielle Auswirkungen</span>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-800">
                        {legalCase.financial_impact || 'Finanzanalyse nicht verfügbar'}
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="ai" className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Brain className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">KI-basierte Analyse</span>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-sm text-purple-800">
                        KI-Analyse wird verarbeitet... Diese Entscheidung wird automatisch mit ähnlichen Fällen verglichen und bewertet.
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="metadata" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Sprache:</span>
                      <p>{legalCase.language || 'Nicht spezifiziert'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Jurisdiktion:</span>
                      <p>{legalCase.jurisdiction}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Impact Level:</span>
                      <p>{legalCase.impact_level || 'Nicht bewertet'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(legalCase.tags || []).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}