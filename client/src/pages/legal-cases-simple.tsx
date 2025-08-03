import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, RefreshCw, Search, ChevronRight, FileText, Calendar, Building } from 'lucide-react';

// Types
interface LegalCase {
  id: string;
  caseNumber: string;
  title: string;
  court: string;
  jurisdiction: string;
  decisionDate: string;
  summary: string;
  content: string;
  documentUrl?: string;
  impactLevel?: string;
  keywords?: string[];
}

export default function LegalCasesSimple() {
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('all');
  const [selectedImpactLevel, setSelectedImpactLevel] = useState('all');

  // Simple fetch without React Query
  const fetchCases = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🚀 SIMPLE FETCH - Starting direct API call...");
      
      const response = await fetch(`/api/legal-cases?simple=true&_=${Date.now()}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("🚀 SIMPLE FETCH - Success:", {
        count: data.length,
        first3: data.slice(0, 3).map((c: any) => ({
          id: c.id,
          title: c.title,
          summary: c.summary?.substring(0, 50) + "...",
          content: c.content?.substring(0, 50) + "..."
        }))
      });
      
      setCases(data);
      setLoading(false);
    } catch (err) {
      console.error("❌ SIMPLE FETCH - Error:", err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  // Filter cases
  const filteredCases = cases.filter((legalCase) => {
    const matchesSearch = !searchTerm || 
      legalCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      legalCase.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      legalCase.court.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesJurisdiction = selectedJurisdiction === 'all' || 
      legalCase.jurisdiction === selectedJurisdiction;
    
    const matchesImpactLevel = selectedImpactLevel === 'all' || 
      legalCase.impactLevel === selectedImpactLevel;
    
    return matchesSearch && matchesJurisdiction && matchesImpactLevel;
  });

  const getJurisdictionIcon = (jurisdiction: string) => {
    switch (jurisdiction) {
      case 'US Federal': return '🇺🇸';
      case 'EU': return '🇪🇺';
      case 'Germany': 
      case 'DE': return '🇩🇪';
      case 'UK': return '🇬🇧';
      case 'Canada': return '🇨🇦';
      case 'Australia': return '🇦🇺';
      case 'CH': return '🇨🇭';
      case 'International': return '🌐';
      default: return '🌍';
    }
  };

  const getImpactBadgeColor = (impactLevel: string | undefined) => {
    switch (impactLevel) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const selectedCaseData = selectedCase ? cases.find(c => c.id === selectedCase) : null;

  console.log("🚀 SIMPLE COMPONENT STATE:", {
    loading,
    error,
    casesCount: cases.length,
    filteredCount: filteredCases.length,
    selectedCase,
    hasSelectedData: !!selectedCaseData
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 shadow-xl border-r border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <div className="text-white font-bold text-lg">⚖️</div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">HELIX</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Legal Intelligence</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20">
                <Search className="w-4 h-4 mr-2" />
                Intelligente Suche
              </Button>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Statistiken
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Gesamte Fälle</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      {cases.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Gefiltert</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      {filteredCases.length}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    ⚖️ Legal Cases
                  </h1>
                  <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300">
                    100% Authentisch
                  </Badge>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {loading ? (
                    <span className="flex items-center">
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Lädt authentische Rechtsfälle...
                    </span>
                  ) : (
                    `${filteredCases.length} von ${cases.length} authentischen Rechtsfällen aus der Originaldatenbank`
                  )}
                </p>
              </div>
              <div className="flex space-x-3">
                <Button onClick={fetchCases} disabled={loading} variant="outline" className="hover:bg-blue-50 hover:border-blue-300">
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Aktualisieren
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="md:col-span-2">
                <Input
                  placeholder="🔍 Suche nach Titel, Fall-Nummer, Gericht..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10"
                />
              </div>
              <div>
                <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Alle Jurisdiktionen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Jurisdiktionen</SelectItem>
                    <SelectItem value="US Federal">🇺🇸 US Federal</SelectItem>
                    <SelectItem value="EU">🇪🇺 EU</SelectItem>
                    <SelectItem value="DE">🇩🇪 Deutschland</SelectItem>
                    <SelectItem value="UK">🇬🇧 UK</SelectItem>
                    <SelectItem value="CH">🇨🇭 Schweiz</SelectItem>
                    <SelectItem value="International">🌐 International</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={selectedImpactLevel} onValueChange={setSelectedImpactLevel}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Alle Impact-Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Impact-Level</SelectItem>
                    <SelectItem value="high">🔴 High Impact</SelectItem>
                    <SelectItem value="medium">🟡 Medium Impact</SelectItem>
                    <SelectItem value="low">🟢 Low Impact</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <Card>
                <CardContent className="text-center py-8">
                  <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-500" />
                  <p className="text-gray-600 dark:text-gray-400">Lade echte Rechtsfälle aus Datenbank...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card>
                <CardContent className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Fehler beim Laden</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                  <Button onClick={fetchCases}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Erneut versuchen
                  </Button>
                </CardContent>
              </Card>
            ) : filteredCases.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Keine Rechtsfälle gefunden</h3>
                  <p className="text-gray-600 dark:text-gray-400">Keine Fälle entsprechen den Filterkriterien.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cases List */}
                <div className="space-y-3">
                  {filteredCases.map((legalCase) => (
                    <Card 
                      key={legalCase.id} 
                      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.01] ${
                        selectedCase === legalCase.id ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:border-blue-300'
                      }`}
                      onClick={() => setSelectedCase(legalCase.id)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{getJurisdictionIcon(legalCase.jurisdiction)}</span>
                            <div className="flex space-x-2">
                              <Badge variant="outline" className="text-xs font-medium">
                                {legalCase.jurisdiction}
                              </Badge>
                              {legalCase.impactLevel && (
                                <Badge className={`text-xs font-medium border ${getImpactBadgeColor(legalCase.impactLevel)}`}>
                                  {legalCase.impactLevel?.toUpperCase()}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <ChevronRight className={`w-5 h-5 transition-transform ${selectedCase === legalCase.id ? 'rotate-90 text-blue-500' : 'text-gray-400'}`} />
                        </div>
                        
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-3 line-clamp-2 leading-tight">
                          {legalCase.title}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-2 text-blue-500" />
                            <span className="font-medium">{legalCase.caseNumber}</span>
                          </div>
                          <div className="flex items-center">
                            <Building className="w-4 h-4 mr-2 text-green-500" />
                            <span className="truncate">{legalCase.court}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                            <span>{new Date(legalCase.decisionDate).toLocaleDateString('de-DE')}</span>
                          </div>
                        </div>

                        {legalCase.keywords && legalCase.keywords.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {legalCase.keywords.slice(0, 3).map((keyword, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-700 dark:text-gray-300">
                                {keyword}
                              </span>
                            ))}
                            {legalCase.keywords.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-500">
                                +{legalCase.keywords.length - 3} weitere
                              </span>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Case Details */}
                <div className="sticky top-6">
                  {selectedCaseData ? (
                    <Card className="h-fit shadow-xl border-l-4 border-l-blue-500">
                      <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-lg">
                        <CardTitle className="flex items-start space-x-3">
                          <span className="text-2xl">{getJurisdictionIcon(selectedCaseData.jurisdiction)}</span>
                          <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-2">
                              {selectedCaseData.title}
                            </h2>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="text-xs">
                                {selectedCaseData.jurisdiction}
                              </Badge>
                              {selectedCaseData.impactLevel && (
                                <Badge className={`text-xs border ${getImpactBadgeColor(selectedCaseData.impactLevel)}`}>
                                  {selectedCaseData.impactLevel?.toUpperCase()}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Tabs defaultValue="summary" className="w-full">
                          <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
                            <TabsTrigger value="summary" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                              📋 Zusammenfassung
                            </TabsTrigger>
                            <TabsTrigger value="content" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                              📄 Vollständiger Inhalt
                            </TabsTrigger>
                          </TabsList>
                          
                          <div className="max-h-[70vh] overflow-y-auto">
                            <TabsContent value="summary" className="m-0 p-6">
                              <div className="prose dark:prose-invert max-w-none">
                                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                  {selectedCaseData.summary}
                                </div>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="content" className="m-0 p-6">
                              <div className="prose dark:prose-invert max-w-none">
                                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                  {selectedCaseData.content}
                                </div>
                              </div>
                            </TabsContent>
                          </div>
                        </Tabs>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="h-fit border-dashed border-2 border-gray-300 dark:border-gray-600">
                      <CardContent className="text-center py-16">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                          <FileText className="w-10 h-10 text-blue-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Fall auswählen</h3>
                        <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                          Klicken Sie auf einen Fall in der Liste, um die vollständigen Details und Analysen anzuzeigen.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}