import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Scale, 
  Calendar, 
  MapPin, 
  ExternalLink, 
  Search,
  AlertTriangle,
  RefreshCw,
  Loader2,
  CheckCircle
} from "lucide-react";

// DIREKTE API DATENSTRUKTUR (ohne Transformation)
interface ApiLegalCase {
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

export default function LegalCasesDirect() {
  const [legalCases, setLegalCases] = useState<ApiLegalCase[]>([]);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  // DIREKTE API-VERBINDUNG OHNE TRANSFORMATION
  const fetchLegalCases = async () => {
    console.log("🔄 DIRECT API CALL: Fetching legal cases...");
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/legal-cases', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log("📡 API Response Status:", response.status);
      console.log("📡 API Response Headers:", Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const rawData = await response.text();
      console.log("📦 Raw API Data (first 500 chars):", rawData.substring(0, 500));
      
      let data;
      try {
        data = JSON.parse(rawData);
      } catch (parseError) {
        console.error("❌ JSON Parse Error:", parseError);
        throw new Error("Invalid JSON response from API");
      }
      
      console.log("✅ Parsed Data Type:", typeof data);
      console.log("✅ Is Array:", Array.isArray(data));
      console.log("✅ Data Length:", data?.length || 0);
      
      if (Array.isArray(data)) {
        console.log("📊 First Legal Case:", data[0]);
        console.log("🔄 Setting state with", data.length, "legal cases...");
        
        // IMMEDIATE STATE UPDATE - NO TIMEOUT
        setLegalCases([...data]); // Force new array reference
        setLastSync(new Date().toLocaleTimeString('de-DE'));
        setError(null);
        setForceUpdate(prev => prev + 1); // Force re-render
        console.log(`✅ STATE UPDATED: ${data.length} Legal Cases set in state`);
        
        console.log(`✅ SUCCESS: ${data.length} Legal Cases loaded successfully`);
      } else {
        console.warn("⚠️ Data is not an array:", typeof data);
        setLegalCases([]);
        setError("API-Antwort ist kein Array");
      }
    } catch (err) {
      console.error("❌ Fetch Error:", err);
      const errorMessage = err instanceof Error ? err.message : "Unbekannter Fehler beim Laden der Legal Cases";
      setError(errorMessage);
      setLegalCases([]);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced Sync mit direkter Datenbank-Neuinitialisierung
  const handleSync = async () => {
    console.log("🔄 ENHANCED SYNC: Starting...");
    setSyncing(true);
    
    try {
      // 1. Force Legal Sync API
      const syncResponse = await fetch('/api/admin/force-legal-sync', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (syncResponse.ok) {
        const syncResult = await syncResponse.json();
        console.log("✅ Sync Response:", syncResult);
        
        // 2. Warte 2 Sekunden für Datenbank-Update
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 3. Lade Legal Cases neu
        await fetchLegalCases();
      } else {
        console.error("❌ Sync failed:", syncResponse.status);
        setError(`Sync fehlgeschlagen: HTTP ${syncResponse.status}`);
      }
    } catch (error) {
      console.error("❌ Sync error:", error);
      setError("Sync-Fehler: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setSyncing(false);
    }
  };

  // Initial load with debug
  useEffect(() => {
    console.log("🔄 useEffect: Component mounted, fetching legal cases...");
    fetchLegalCases();
  }, []);

  // Debug effect to monitor state changes
  useEffect(() => {
    console.log(`🔍 State changed - legalCases.length: ${legalCases.length}, forceUpdate: ${forceUpdate}`);
  }, [legalCases, forceUpdate]);

  // EINFACHE SUCHE
  const filteredCases = legalCases.filter(item => {
    if (!item || !searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      item.title?.toLowerCase().includes(search) ||
      item.summary?.toLowerCase().includes(search) ||
      item.court?.toLowerCase().includes(search) ||
      item.caseNumber?.toLowerCase().includes(search) ||
      item.jurisdiction?.toLowerCase().includes(search)
    );
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

  // DEBUG INFO COMPONENT
  const DebugInfo = () => (
    <Card className="mb-6 bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-sm text-blue-800">🔧 Debug Information</CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>API Status:</strong> {loading ? "Loading..." : "✅ Loaded"}
          </div>
          <div>
            <strong>Total Cases:</strong> {legalCases.length} ({typeof legalCases}) [Update #{forceUpdate}]
          </div>
          <div>
            <strong>Filtered Cases:</strong> {filteredCases.length}
          </div>
          <div>
            <strong>Last Sync:</strong> {lastSync || "Never"}
          </div>
          <div>
            <strong>Search Term:</strong> "{searchTerm}"
          </div>
          <div>
            <strong>Error:</strong> {error || "None"}
          </div>
        </div>
        <div className="mt-4 p-2 bg-white rounded text-xs">
          <strong>State Debug:</strong><br/>
          Array Length: {legalCases.length}<br/>
          Array Type: {typeof legalCases}<br/>
          Is Array: {Array.isArray(legalCases) ? 'Yes' : 'No'}<br/>
          {legalCases.length > 0 && (
            <>
              <strong>Sample Data:</strong><br/>
              ID: {legalCases[0]?.id}<br/>
              Title: {legalCases[0]?.title?.substring(0, 50)}...<br/>
              Jurisdiction: {legalCases[0]?.jurisdiction}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
          <span className="text-lg">Lade Legal Cases von API...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            MedTech Rechtssprechung
          </h1>
          <p className="text-gray-600 mt-2">
            {legalCases.length} juristische Entscheidungen - Direct API Connection
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchLegalCases} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Neu laden
          </Button>
          <Button 
            onClick={handleSync} 
            disabled={syncing}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {syncing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {syncing ? 'Synchronisiert...' : 'Enhanced Sync'}
          </Button>
        </div>
      </div>

      {/* Debug Info */}
      <DebugInfo />

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
                  {legalCases.filter(c => c.impactLevel?.toLowerCase() === 'high').length}
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
                  {new Set(legalCases.map(c => c.jurisdiction).filter(Boolean)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Search className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gefiltert</p>
                <p className="text-2xl font-bold text-gray-900">{filteredCases.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suche */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Suche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Fall, Gericht, Jurisdiktion oder Entscheidung suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* CASES DISPLAY */}
      <div className="space-y-4">
        {error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">API-Fehler</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <Button onClick={fetchLegalCases} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Erneut versuchen
              </Button>
            </CardContent>
          </Card>
        ) : legalCases.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Legal Cases</h3>
              <p className="text-gray-600 mb-4">
                Verwenden Sie Enhanced Sync um Legal Cases zu laden.
              </p>
              <Button onClick={handleSync} disabled={syncing}>
                {syncing ? 'Lädt...' : 'Jetzt synchronisieren'}
              </Button>
            </CardContent>
          </Card>
        ) : filteredCases.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Suchergebnisse</h3>
              <p className="text-gray-600 mb-4">
                Keine Treffer für "{searchTerm}". {legalCases.length} Fälle insgesamt verfügbar.
              </p>
              <Button onClick={() => setSearchTerm("")} variant="outline">
                Suche zurücksetzen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>Zeige {Math.min(filteredCases.length, 50)} von {filteredCases.length} gefilterten Fällen</span>
              {lastSync && (
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Zuletzt aktualisiert: {lastSync}
                </span>
              )}
            </div>
            
            {filteredCases.slice(0, 50).map((legalCase) => (
              <Card key={legalCase.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {legalCase.title || "Unbekannter Titel"}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                        {legalCase.caseNumber && (
                          <Badge variant="outline">{legalCase.caseNumber}</Badge>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {legalCase.court || "Unbekanntes Gericht"}
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
                          <DialogTitle className="text-xl">
                            {legalCase.title || "Unbekannter Titel"}
                          </DialogTitle>
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
                            <p className="mt-1 text-gray-700">
                              {legalCase.summary || "Nicht verfügbar"}
                            </p>
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
            ))}
          </>
        )}
      </div>
    </div>
  );
}