import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Building2, MapPin, AlertTriangle, FileText, Brain, TrendingUp, DollarSign, Gavel, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";

interface LegalCase {
  id: string;
  caseNumber: string;
  title: string;
  court: string;
  jurisdiction: string;
  decisionDate: string;
  summary: string;
  impactLevel: string;
  financialImpact?: string;
  deviceType?: string;
  keywords?: string[];
  plaintiffCount?: number;
  status: string;
  regulatoryImplications?: string;
  precedentValue?: string;
  aiAnalysis?: string;
}

export default function LegalCaseDetail() {
  const [, params] = useRoute("/legal-case/:id");
  const caseId = params?.id;

  const { data: legalCase, isLoading, error } = useQuery<LegalCase>({
    queryKey: ["/api/legal-cases", caseId],
    enabled: !!caseId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Falldetails...</p>
        </div>
      </div>
    );
  }

  if (error || !legalCase) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Fall nicht gefunden</h2>
          <p className="text-gray-600 mb-4">Der angeforderte Rechtsfall konnte nicht geladen werden.</p>
          <Link href="/rechtsprechung">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zur Übersicht
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getImpactColor = (impact: string) => {
    switch (impact?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'settled': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      case 'ongoing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/rechtsprechung">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Gavel className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-500">Rechtsprechung</span>
              <span className="text-gray-300">/</span>
              <span className="text-sm font-medium text-gray-900">Falldetails</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{legalCase.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>Fall-Nr: {legalCase.caseNumber}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  <span>{legalCase.court}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(legalCase.decisionDate).toLocaleDateString('de-DE')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getImpactColor(legalCase.impactLevel)}>
                  {legalCase.impactLevel?.toUpperCase()} IMPACT
                </Badge>
                <Badge className={getStatusColor(legalCase.status)}>
                  {legalCase.status?.toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  <MapPin className="h-3 w-3 mr-1" />
                  {legalCase.jurisdiction}
                </Badge>
                {legalCase.deviceType && (
                  <Badge variant="outline">
                    <Shield className="h-3 w-3 mr-1" />
                    {legalCase.deviceType}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {legalCase.plaintiffCount && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Kläger</p>
                      <p className="text-lg font-semibold">{legalCase.plaintiffCount.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {legalCase.financialImpact && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Finanzieller Schaden</p>
                      <p className="text-lg font-semibold">{legalCase.financialImpact}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Gerichtsbarkeit</p>
                    <p className="text-lg font-semibold">{legalCase.jurisdiction}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Auswirkungsgrad</p>
                    <p className="text-lg font-semibold">{legalCase.impactLevel}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Übersicht
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              KI-Analyse
            </TabsTrigger>
            <TabsTrigger value="implications" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Regulatory Impact
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Gavel className="h-4 w-4" />
              Vollständige Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Fall-Zusammenfassung
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {legalCase.summary ? (
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {legalCase.summary.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-4">{paragraph}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Keine detaillierte Zusammenfassung verfügbar.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {legalCase.keywords && legalCase.keywords.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Schlüsselwörter</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {legalCase.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="summary" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  KI-Powered Analyse
                </CardTitle>
              </CardHeader>
              <CardContent>
                {legalCase.aiAnalysis ? (
                  <div className="prose max-w-none">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">KI-Analyse</span>
                      </div>
                      <div className="text-sm text-blue-700 whitespace-pre-wrap">
                        {legalCase.aiAnalysis}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">KI-Analyse wird generiert...</p>
                    <p className="text-sm text-gray-400 mt-2">Diese Funktion wird in Kürze verfügbar sein.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="implications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Regulatorische Auswirkungen
                </CardTitle>
              </CardHeader>
              <CardContent>
                {legalCase.regulatoryImplications ? (
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {legalCase.regulatoryImplications}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Regulatorische Auswirkungen werden analysiert...</p>
                    <p className="text-sm text-gray-400 mt-2">Detaillierte Analyse wird in Kürze verfügbar sein.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {legalCase.precedentValue && (
              <Card>
                <CardHeader>
                  <CardTitle>Präzedenzwert</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {legalCase.precedentValue}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-5 w-5" />
                  Vollständige Falldetails
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Grundlegende Informationen</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fall-ID:</span>
                          <span className="font-mono text-gray-900">{legalCase.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fall-Nummer:</span>
                          <span className="font-mono text-gray-900">{legalCase.caseNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gericht:</span>
                          <span className="text-gray-900">{legalCase.court}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Entscheidungsdatum:</span>
                          <span className="text-gray-900">{new Date(legalCase.decisionDate).toLocaleDateString('de-DE')}</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Status & Impact</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <Badge className={getStatusColor(legalCase.status)} size="sm">
                            {legalCase.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Impact Level:</span>
                          <Badge className={getImpactColor(legalCase.impactLevel)} size="sm">
                            {legalCase.impactLevel}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Jurisdiction:</span>
                          <span className="text-gray-900">{legalCase.jurisdiction}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {legalCase.deviceType && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Geräte-Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Gerätetyp:</span>
                            <span className="text-gray-900">{legalCase.deviceType}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {(legalCase.plaintiffCount || legalCase.financialImpact) && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Finanzielle Details</h4>
                          <div className="space-y-2 text-sm">
                            {legalCase.plaintiffCount && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Anzahl Kläger:</span>
                                <span className="text-gray-900">{legalCase.plaintiffCount.toLocaleString()}</span>
                              </div>
                            )}
                            {legalCase.financialImpact && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Finanzieller Impact:</span>
                                <span className="text-gray-900">{legalCase.financialImpact}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Vollständige Fallbeschreibung</h4>
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                      {legalCase.summary || "Keine detaillierte Beschreibung verfügbar."}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}