import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Scale, 
  Calendar, 
  MapPin, 
  ExternalLink, 
  Search,
  AlertTriangle,
  RefreshCw
} from "lucide-react";

interface LegalCase {
  id: string;
  caseNumber: string;
  title: string;
  court: string;
  jurisdiction: string;
  decisionDate: string;
  summary: string;
  content: string;
  documentUrl: string;
  impactLevel: string;
  keywords: string[];
}

export default function LegalCasesFinal() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJurisdiction, setSelectedJurisdiction] = useState("all");

  // Lade Legal Cases direkt von API
  const { data: legalCases = [], isLoading, error, refetch } = useQuery({
    queryKey: ['/api/legal-cases'],
    queryFn: async () => {
      const response = await fetch('/api/legal-cases');
      if (!response.ok) {
        throw new Error('Failed to fetch legal cases');
      }
      const data = await response.json();
      return data as LegalCase[];
    }
  });

  // Sehr einfache Filterung ohne komplexe Logik
  const filteredCases = legalCases.filter((item) => {
    // Suche
    if (searchTerm && searchTerm.length > 0) {
      const searchLower = searchTerm.toLowerCase();
      const matches = 
        (item.title && item.title.toLowerCase().includes(searchLower)) ||
        (item.summary && item.summary.toLowerCase().includes(searchLower)) ||
        (item.court && item.court.toLowerCase().includes(searchLower)) ||
        (item.caseNumber && item.caseNumber.toLowerCase().includes(searchLower));
      if (!matches) return false;
    }
    
    // Jurisdiktion
    if (selectedJurisdiction !== "all") {
      if (!item.jurisdiction || !item.jurisdiction.toLowerCase().includes(selectedJurisdiction.toLowerCase())) {
        return false;
      }
    }
    
    return true;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return "Kein Datum";
    try {
      return new Date(dateString).toLocaleDateString('de-DE');
    } catch {
      return dateString;
    }
  };

  const getImpactColor = (impact: string) => {
    if (!impact) return 'bg-gray-100 text-gray-800';
    switch (impact.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Enhanced Sync Button - Behält Synchronisation bei
  const handleSync = async () => {
    try {
      const response = await fetch('/api/admin/force-legal-sync', { method: 'POST' });
      if (response.ok) {
        await refetch(); // Lade Daten neu
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Lade Legal Cases...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Fehler beim Laden</h3>
          <p className="text-gray-600 mb-4">Die Legal Cases konnten nicht geladen werden.</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Erneut versuchen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header mit Sync Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            MedTech Rechtssprechung
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {legalCases.length} juristische Entscheidungen mit detaillierten Quellenangaben
          </p>
        </div>
        <Button onClick={handleSync} className="bg-blue-600 hover:bg-blue-700">
          <RefreshCw className="h-4 w-4 mr-2" />
          Enhanced Sync
        </Button>
      </div>

      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Scale className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gesamte Fälle</p>
                <p className="text-2xl font-bold text-gray-900">{legalCases.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High-Impact</p>
                <p className="text-2xl font-bold text-gray-900">
                  {legalCases.filter(c => c.impactLevel === 'high').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Jurisdiktionen</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(legalCases.map(c => c.jurisdiction)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gefilterte Fälle</p>
                <p className="text-2xl font-bold text-gray-900">{filteredCases.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Einfache Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filteroptionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Jurisdiktion</label>
              <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
                <SelectTrigger>
                  <SelectValue placeholder="Jurisdiktion wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Jurisdiktionen</SelectItem>
                  <SelectItem value="US">USA (alle)</SelectItem>
                  <SelectItem value="EU">Europa</SelectItem>
                  <SelectItem value="German">Deutschland</SelectItem>
                  <SelectItem value="UK">Vereinigtes Königreich</SelectItem>
                  <SelectItem value="Swiss">Schweiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Suche</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Fall, Gericht oder Entscheidung suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Cases Liste - IMMER anzeigen wenn Daten da sind */}
      <div className="space-y-4">
        {legalCases.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Daten geladen</h3>
              <p className="text-gray-600">Verwenden Sie Enhanced Sync um Legal Cases zu laden.</p>
            </CardContent>
          </Card>
        ) : filteredCases.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Treffer</h3>
              <p className="text-gray-600">
                Keine Rechtsfälle entsprechen Ihren Filterkriterien. ({legalCases.length} insgesamt verfügbar)
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedJurisdiction("all");
                }}
                variant="outline"
                className="mt-4"
              >
                Filter zurücksetzen
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Zeige gefilterte Cases
          filteredCases.slice(0, 50).map((legalCase) => (
            <Card key={legalCase.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{legalCase.title || "Kein Titel"}</CardTitle>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                      {legalCase.caseNumber && <Badge variant="outline">{legalCase.caseNumber}</Badge>}
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {legalCase.court || "Kein Gericht"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(legalCase.decisionDate)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {legalCase.impactLevel && (
                      <Badge className={getImpactColor(legalCase.impactLevel)}>
                        {legalCase.impactLevel}
                      </Badge>
                    )}
                    {legalCase.jurisdiction && (
                      <Badge variant="secondary">{legalCase.jurisdiction}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {legalCase.summary || "Keine Zusammenfassung verfügbar"}
                </p>
                
                {/* Keywords */}
                {legalCase.keywords && legalCase.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {legalCase.keywords.slice(0, 5).map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Details anzeigen
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-xl">{legalCase.title}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Aktenzeichen:</span>
                            <p>{legalCase.caseNumber || "Nicht verfügbar"}</p>
                          </div>
                          <div>
                            <span className="font-medium">Gericht:</span>
                            <p>{legalCase.court || "Nicht verfügbar"}</p>
                          </div>
                          <div>
                            <span className="font-medium">Jurisdiktion:</span>
                            <p>{legalCase.jurisdiction || "Nicht verfügbar"}</p>
                          </div>
                          <div>
                            <span className="font-medium">Entscheidungsdatum:</span>
                            <p>{formatDate(legalCase.decisionDate)}</p>
                          </div>
                        </div>
                        
                        <div>
                          <span className="font-medium">Zusammenfassung:</span>
                          <p className="mt-1 text-gray-700">{legalCase.summary || "Nicht verfügbar"}</p>
                        </div>
                        
                        <div>
                          <span className="font-medium">Volltext der Entscheidung:</span>
                          <div className="mt-1 p-4 bg-gray-50 rounded-lg text-sm max-h-96 overflow-y-auto">
                            {legalCase.content || "Volltext nicht verfügbar"}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {legalCase.documentUrl && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.open(legalCase.documentUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Dokument
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}