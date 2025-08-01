import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Network, 
  Scale, 
  Link2, 
  AlertTriangle, 
  TrendingUp, 
  BookOpen,
  ExternalLink,
  Search
} from "lucide-react";

interface LegalTheme {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  relatedCases: string[];
  precedentValue: 'high' | 'medium' | 'low';
  jurisdiction: string[];
  category: string;
}

interface CaseRelationship {
  caseId1: string;
  caseId2: string;
  relationshipType: 'precedent' | 'similar_facts' | 'conflicting' | 'citing' | 'overturned';
  strength: number;
  explanation: string;
}

interface LegalAnalysis {
  themes: LegalTheme[];
  relationships: CaseRelationship[];
  precedentChains: Array<{
    theme: string;
    cases: string[];
    development: string;
  }>;
  conflictingDecisions: Array<{
    issue: string;
    cases: Array<{
      caseId: string;
      position: string;
      jurisdiction: string;
    }>;
  }>;
}

interface CaseRelationshipData {
  targetCase: LegalCase;
  relatedCases: LegalCase[];
  relationships: CaseRelationship[];
  themes: LegalTheme[];
}

interface LegalCase {
  id: string;
  title: string;
  caseNumber: string;
  court: string;
  jurisdiction: string;
  dateDecided: string;
  summary: string;
}

interface ThemesData {
  themes: LegalTheme[];
  precedentChains: Array<{
    theme: string;
    cases: string[];
    development: string;
  }>;
  conflictingDecisions: Array<{
    issue: string;
    cases: Array<{
      caseId: string;
      position: string;
      jurisdiction: string;
    }>;
  }>;
}

interface LegalRelationshipViewerProps {
  caseId?: string;
  theme?: string;
  jurisdiction?: string;
}

export default function LegalRelationshipViewer({ 
  caseId, 
  theme, 
  jurisdiction 
}: LegalRelationshipViewerProps) {
  const [selectedTheme, setSelectedTheme] = useState<string>(theme || "");
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>(jurisdiction || "");

  // Hole Legal Analysis Daten
  const { data: analysis, isLoading: analysisLoading } = useQuery<LegalAnalysis>({
    queryKey: ["/api/legal/analysis", selectedTheme, selectedJurisdiction],
    enabled: !caseId, // Nur laden wenn nicht spezifischer Fall angezeigt wird
  });

  // Hole spezifische Case Relationships wenn caseId gegeben
  const { data: caseRelationships, isLoading: relationshipsLoading } = useQuery<CaseRelationshipData>({
    queryKey: ["/api/legal/relationships", caseId],
    enabled: !!caseId,
  });

  // Hole Legal Themes Overview
  const { data: themesData, isLoading: themesLoading } = useQuery<ThemesData>({
    queryKey: ["/api/legal/themes"],
  });

  const getRelationshipIcon = (type: CaseRelationship['relationshipType']) => {
    switch (type) {
      case 'precedent': return <Scale className="h-4 w-4" />;
      case 'citing': return <Link2 className="h-4 w-4" />;
      case 'conflicting': return <AlertTriangle className="h-4 w-4" />;
      case 'similar_facts': return <BookOpen className="h-4 w-4" />;
      case 'overturned': return <TrendingUp className="h-4 w-4" />;
      default: return <Network className="h-4 w-4" />;
    }
  };

  const getRelationshipColor = (type: CaseRelationship['relationshipType']) => {
    switch (type) {
      case 'precedent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'citing': return 'bg-green-100 text-green-800 border-green-200';
      case 'conflicting': return 'bg-red-100 text-red-800 border-red-200';
      case 'similar_facts': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'overturned': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStrengthLabel = (strength: number) => {
    if (strength > 0.8) return 'Sehr stark';
    if (strength > 0.6) return 'Stark';
    if (strength > 0.4) return 'Mittel';
    if (strength > 0.2) return 'Schwach';
    return 'Sehr schwach';
  };

  if (analysisLoading || relationshipsLoading || themesLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Network className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">
          Rechtsprechungsanalyse & Verknüpfungen
        </h2>
      </div>

      <Tabs defaultValue={caseId ? "relationships" : "themes"} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="themes">Rechtliche Themen</TabsTrigger>
          <TabsTrigger value="relationships">Fallverknüpfungen</TabsTrigger>
          <TabsTrigger value="precedents">Präzedenzfälle</TabsTrigger>
          <TabsTrigger value="conflicts">Konflikte</TabsTrigger>
        </TabsList>

        <TabsContent value="themes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Identifizierte Rechtsthemen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysis?.themes.map((theme) => (
                  <Card key={theme.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{theme.name}</CardTitle>
                        <Badge variant="outline">
                          {theme.relatedCases.length} Fälle
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">{theme.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={
                            theme.precedentValue === 'high' ? 'bg-red-100 text-red-800' :
                            theme.precedentValue === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }>
                            {theme.precedentValue === 'high' ? 'Hoher' :
                             theme.precedentValue === 'medium' ? 'Mittlerer' : 'Niedriger'} Präzedenzwert
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {theme.jurisdiction.slice(0, 3).map(j => (
                            <Badge key={j} variant="secondary" className="text-xs">
                              {j}
                            </Badge>
                          ))}
                          {theme.jurisdiction.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{theme.jurisdiction.length - 3} mehr
                            </Badge>
                          )}
                        </div>

                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedTheme(theme.id)}
                        >
                          <Search className="h-4 w-4 mr-1" />
                          Details anzeigen
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relationships" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Fallverknüpfungen
                {caseRelationships && (
                  <Badge variant="outline">
                    {caseRelationships.relationships?.length || 0} Verknüpfungen
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {caseRelationships?.relationships && caseRelationships.relationships.length > 0 ? (
                <div className="space-y-4">
                  {caseRelationships.relationships.map((rel, index) => (
                    <Card key={index} className="border-l-4 border-l-green-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              {getRelationshipIcon(rel.relationshipType)}
                              <Badge className={getRelationshipColor(rel.relationshipType)}>
                                {rel.relationshipType === 'precedent' ? 'Präzedenzfall' :
                                 rel.relationshipType === 'citing' ? 'Zitierung' :
                                 rel.relationshipType === 'conflicting' ? 'Widersprüchlich' :
                                 rel.relationshipType === 'similar_facts' ? 'Ähnliche Sachverhalte' :
                                 'Aufgehoben'}
                              </Badge>
                              <Badge variant="outline">
                                {getStrengthLabel(rel.strength)}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-gray-700">{rel.explanation}</p>
                            
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>Stärke: {(rel.strength * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                          
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Network className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Keine Fallverknüpfungen gefunden</p>
                  <p className="text-sm">Wählen Sie einen spezifischen Fall aus, um Verknüpfungen zu sehen</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="precedents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Präzedenzfallketten
              </CardTitle>
            </CardHeader>
            <CardContent>
              {themesData?.precedentChains && themesData.precedentChains.length > 0 ? (
                <div className="space-y-4">
                  {themesData.precedentChains.map((chain, index) => (
                    <Card key={index} className="border-l-4 border-l-purple-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{chain.theme}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-3">{chain.development}</p>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {chain.cases.length} Fälle in der Kette
                          </Badge>
                          <Button variant="outline" size="sm">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Entwicklung anzeigen
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Scale className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Keine Präzedenzfallketten identifiziert</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Widersprüchliche Entscheidungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              {themesData?.conflictingDecisions && themesData.conflictingDecisions.length > 0 ? (
                <div className="space-y-4">
                  {themesData.conflictingDecisions.map((conflict, index) => (
                    <Card key={index} className="border-l-4 border-l-red-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          {conflict.issue}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {conflict.cases.map((case_, caseIndex) => (
                            <div key={caseIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                              <div>
                                <p className="font-medium">Fall {caseIndex + 1}</p>
                                <p className="text-sm text-gray-600">Position: {case_.position}</p>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline">{case_.jurisdiction}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-red-600 font-medium">
                            Unterschiedliche Rechtslage - Vorsicht bei Rechtsberatung erforderlich
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Keine widersprüchlichen Entscheidungen identifiziert</p>
                  <p className="text-sm">Das ist grundsätzlich positiv für die Rechtssicherheit</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}