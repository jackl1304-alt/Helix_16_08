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
  Download,
  AlertTriangle
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

export default function LegalCasesNew() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJurisdiction, setSelectedJurisdiction] = useState("all");
  const [selectedImpact, setSelectedImpact] = useState("all");

  // Lade Legal Cases direkt von API
  const { data: legalCases = [], isLoading, error } = useQuery({
    queryKey: ['/api/legal-cases'],
    queryFn: async () => {
      console.log("🔄 Fetching legal cases from API...");
      const response = await fetch('/api/legal-cases');
      if (!response.ok) {
        throw new Error('Failed to fetch legal cases');
      }
      const data = await response.json();
      console.log("✅ Legal cases loaded:", data.length);
      return data as LegalCase[];
    }
  });

  // Filtere die Daten
  const filteredCases = legalCases.filter((legalCase) => {
    const matchesSearch = searchTerm === "" || 
      legalCase.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      legalCase.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      legalCase.court?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      legalCase.caseNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesJurisdiction = selectedJurisdiction === "all" || 
      legalCase.jurisdiction?.includes(selectedJurisdiction);

    const matchesImpact = selectedImpact === "all" || 
      legalCase.impactLevel === selectedImpact;

    return matchesSearch && matchesJurisdiction && matchesImpact;
  });

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
          <p className="text-gray-600">Die Legal Cases konnten nicht geladen werden.</p>
          <p className="text-sm text-red-600 mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            MedTech Rechtssprechung
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {legalCases.length} juristische Entscheidungen mit detaillierten Quellenangaben
          </p>
        </div>
      </div>

      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Scale className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gesamte Fälle</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{legalCases.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">High-Impact</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Jurisdiktionen</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gefilterte Fälle</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{filteredCases.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filteroptionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Jurisdiktion</label>
              <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
                <SelectTrigger>
                  <SelectValue placeholder="Jurisdiktion wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Jurisdiktionen</SelectItem>
                  <SelectItem value="US">USA</SelectItem>
                  <SelectItem value="EU">Europa</SelectItem>
                  <SelectItem value="DE">Deutschland</SelectItem>
                  <SelectItem value="UK">Vereinigtes Königreich</SelectItem>
                  <SelectItem value="CH">Schweiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Impact Level</label>
              <Select value={selectedImpact} onValueChange={setSelectedImpact}>
                <SelectTrigger>
                  <SelectValue placeholder="Impact wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Impact Levels</SelectItem>
                  <SelectItem value="high">High Impact</SelectItem>
                  <SelectItem value="medium">Medium Impact</SelectItem>
                  <SelectItem value="low">Low Impact</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="sm:col-span-2">
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

      {/* Legal Cases Liste */}
      <div className="space-y-4">
        {filteredCases.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Rechtsfälle gefunden</h3>
              <p className="text-gray-600">
                Passen Sie Ihre Filterkriterien an oder versuchen Sie eine andere Suche.
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedJurisdiction("all");
                  setSelectedImpact("all");
                }}
                variant="outline"
                className="mt-4"
              >
                Filter zurücksetzen
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredCases.map((legalCase) => (
            <Card key={legalCase.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{legalCase.title}</CardTitle>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                      <Badge variant="outline">{legalCase.caseNumber}</Badge>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {legalCase.court}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(legalCase.decisionDate)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getImpactColor(legalCase.impactLevel)}>
                      {legalCase.impactLevel}
                    </Badge>
                    <Badge variant="secondary">{legalCase.jurisdiction}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                  {legalCase.summary}
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
                            <p>{legalCase.caseNumber}</p>
                          </div>
                          <div>
                            <span className="font-medium">Gericht:</span>
                            <p>{legalCase.court}</p>
                          </div>
                          <div>
                            <span className="font-medium">Jurisdiktion:</span>
                            <p>{legalCase.jurisdiction}</p>
                          </div>
                          <div>
                            <span className="font-medium">Entscheidungsdatum:</span>
                            <p>{formatDate(legalCase.decisionDate)}</p>
                          </div>
                        </div>
                        
                        <div>
                          <span className="font-medium">Zusammenfassung:</span>
                          <p className="mt-1 text-gray-700 dark:text-gray-300">{legalCase.summary}</p>
                        </div>
                        
                        <div>
                          <span className="font-medium">Volltext der Entscheidung:</span>
                          <div className="mt-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                            {legalCase.content}
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