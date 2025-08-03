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
    
    return matchesSearch && matchesJurisdiction;
  });

  const getJurisdictionIcon = (jurisdiction: string) => {
    switch (jurisdiction) {
      case 'US Federal': return '🇺🇸';
      case 'EU': return '🇪🇺';
      case 'Germany': return '🇩🇪';
      case 'UK': return '🇬🇧';
      case 'Canada': return '🇨🇦';
      case 'Australia': return '🇦🇺';
      default: return '🌍';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 shadow-lg">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <div className="text-white font-bold text-lg">⚖️</div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">HELIX</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Powered by DELTA WAYS</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Search className="w-4 h-4 mr-2" />
                Intelligente Suche
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                  ⚖️ Legal Cases (SIMPLE)
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {loading ? 'Lädt...' : `${filteredCases.length} authentische Rechtsfälle aus der Originaldatenbank`}
                </p>
              </div>
              <Button onClick={fetchCases} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Aktualisieren
              </Button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <Input
                  placeholder="Titel, Fall-Nummer, Gericht"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Alle Jurisdiktionen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Jurisdiktionen</SelectItem>
                    <SelectItem value="US Federal">🇺🇸 US Federal</SelectItem>
                    <SelectItem value="EU">🇪🇺 EU</SelectItem>
                    <SelectItem value="Germany">🇩🇪 Germany</SelectItem>
                    <SelectItem value="UK">🇬🇧 UK</SelectItem>
                    <SelectItem value="Canada">🇨🇦 Canada</SelectItem>
                    <SelectItem value="Australia">🇦🇺 Australia</SelectItem>
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
                <div className="space-y-4">
                  {filteredCases.map((legalCase) => (
                    <Card 
                      key={legalCase.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedCase === legalCase.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedCase(legalCase.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getJurisdictionIcon(legalCase.jurisdiction)}</span>
                            <Badge variant="outline">{legalCase.jurisdiction}</Badge>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                          {legalCase.title}
                        </h3>
                        
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <FileText className="w-3 h-3 mr-1" />
                            {legalCase.caseNumber}
                          </div>
                          <div className="flex items-center">
                            <Building className="w-3 h-3 mr-1" />
                            {legalCase.court}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(legalCase.decisionDate).toLocaleDateString('de-DE')}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Case Details */}
                <div>
                  {selectedCaseData ? (
                    <Card className="h-fit">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <span>{getJurisdictionIcon(selectedCaseData.jurisdiction)}</span>
                          <span className="text-lg">{selectedCaseData.title}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="summary" className="space-y-4">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="summary">Zusammenfassung</TabsTrigger>
                            <TabsTrigger value="content">Vollständiger Inhalt</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="summary" className="space-y-4">
                            <div className="prose dark:prose-invert max-w-none">
                              <div className="whitespace-pre-wrap text-sm">
                                {selectedCaseData.summary}
                              </div>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="content" className="space-y-4">
                            <div className="prose dark:prose-invert max-w-none">
                              <div className="whitespace-pre-wrap text-sm">
                                {selectedCaseData.content}
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="text-center py-12">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Fall auswählen</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Klicken Sie auf einen Fall links, um Details anzuzeigen.
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