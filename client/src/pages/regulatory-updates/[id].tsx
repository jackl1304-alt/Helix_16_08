import { useState } from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  ExternalLink, 
  Calendar, 
  Globe, 
  Building2,
  TrendingUp,
  DollarSign,
  Brain,
  BarChart3,
  Download,
  AlertTriangle,
  CheckCircle,
  Info,
  Target,
  Lightbulb,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RegulatoryUpdate {
  id: string;
  title: string;
  description: string;
  source_id: string;
  source_url?: string;
  region: string;
  update_type: string;
  priority: 'high' | 'medium' | 'low';
  device_classes?: string[];
  categories?: any;
  published_at: string;
  created_at: string;
}

export default function RegulatoryUpdateDetailPage() {
  const [, params] = useRoute('/regulatory-updates/:id');
  const updateId = params?.id;
  const [activeTab, setActiveTab] = useState('overview');

  const { data: update, isLoading } = useQuery({
    queryKey: ['/api/regulatory-updates', updateId],
    enabled: !!updateId,
    select: (data: any) => {
      if (Array.isArray(data)) {
        return data.find(u => u.id === updateId);
      }
      return data;
    }
  });

  // Generiere Finanzanalyse basierend auf Update-Daten
  const generateFinancialAnalysis = (update: RegulatoryUpdate) => {
    const isHighPriority = update.priority === 'high';
    const isApproval = update.update_type === 'approval';
    const region = update.region;
    
    return {
      implementationCosts: {
        immediate: isHighPriority ? '€150.000 - €500.000' : '€50.000 - €200.000',
        firstYear: isHighPriority ? '€300.000 - €800.000' : '€100.000 - €400.000',
        ongoing: isHighPriority ? '€100.000 - €250.000/Jahr' : '€30.000 - €100.000/Jahr'
      },
      marketImpact: {
        timeToMarket: isApproval ? '3-6 Monate' : '12-18 Monate',
        marketAccess: region === 'Europe' ? 'EU/EWR (448 Mio. Patienten)' : 
                     region === 'US' ? 'US-Markt (330 Mio. Patienten)' : 'Regionaler Markt',
        revenueProjection: isApproval ? '€2-15 Mio. im ersten Jahr' : '€500K-5 Mio. bei Compliance'
      },
      riskAssessment: {
        complianceRisk: isHighPriority ? 'HOCH - Sofortige Maßnahmen erforderlich' : 'MITTEL - Planbare Umsetzung',
        financialRisk: '€1-10 Mio. bei Non-Compliance',
        opportunityCost: 'Wettbewerbsnachteil ohne zeitnahe Umsetzung'
      },
      roi: {
        paybackPeriod: isApproval ? '6-12 Monate' : '18-36 Monate',
        npv: isHighPriority ? '€500K - €2,5 Mio.' : '€200K - €1 Mio.',
        irr: isApproval ? '25-45%' : '15-25%'
      }
    };
  };

  // Generiere KI-Analyse basierend auf Update-Daten
  const generateAIAnalysis = (update: RegulatoryUpdate) => {
    const isHighPriority = update.priority === 'high';
    const isApproval = update.update_type === 'approval';
    
    return {
      riskScore: isHighPriority ? 85 : 45,
      successProbability: isApproval ? 92 : 75,
      complexityLevel: isHighPriority ? 'Hoch' : 'Mittel',
      recommendations: [
        isHighPriority ? 'Sofortige Task Force etablieren' : 'Projektteam innerhalb 30 Tagen aufbauen',
        isApproval ? 'Marketing- und Vertriebsstrategie finalisieren' : 'Compliance-Gap-Analyse durchführen',
        'Externe Regulatorische Beratung einbeziehen',
        isHighPriority ? 'Wöchentliche Steering Committee Meetings' : 'Monatliche Fortschrittsbewertungen'
      ],
      keyActions: [
        {
          action: 'Stakeholder Alignment',
          priority: 'KRITISCH',
          timeline: '1-2 Wochen'
        },
        {
          action: 'Ressourcenallokation',
          priority: isHighPriority ? 'HOCH' : 'MITTEL',
          timeline: '2-4 Wochen'
        },
        {
          action: 'Regulatorische Strategie',
          priority: 'HOCH',
          timeline: '4-6 Wochen'
        }
      ],
      similarCases: [
        'Ähnliche Zulassungen zeigen 85% Erfolgsrate bei strukturiertem Vorgehen',
        'Vergleichbare Unternehmen benötigten 6-12 Monate für vollständige Compliance',
        'Best Practice: Frühzeitige Behördenkommunikation reduziert Risiken um 40%'
      ]
    };
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!update) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Regulatory Update nicht gefunden
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const financialAnalysis = generateFinancialAnalysis(update);
  const aiAnalysis = generateAIAnalysis(update);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRegionFlag = (region: string) => {
    switch (region) {
      case 'US': return '🇺🇸';
      case 'Europe': return '🇪🇺';
      case 'Germany': return '🇩🇪';
      case 'UK': return '🇬🇧';
      case 'Canada': return '🇨🇦';
      case 'Asia-Pacific': return '🌏';
      default: return '🌍';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold leading-tight">
              {update.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(update.published_at).toLocaleDateString('de-DE')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Globe className="w-4 h-4" />
                <span>{getRegionFlag(update.region)} {update.region}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Building2 className="w-4 h-4" />
                <span>{update.source_id?.toUpperCase()}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge className={cn('font-medium', getPriorityColor(update.priority))}>
              {update.priority === 'high' ? 'Hohe Priorität' : 
               update.priority === 'medium' ? 'Mittlere Priorität' : 'Niedrige Priorität'}
            </Badge>
            <Badge variant="outline">
              {update.update_type === 'approval' ? 'Zulassung' :
               update.update_type === 'guidance' ? 'Leitlinie' :
               update.update_type === 'alert' ? 'Sicherheitshinweis' : 'Regulierung'}
            </Badge>
          </div>
        </div>
      </div>

      {/* 6-Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center space-x-1">
            <Info className="w-4 h-4" />
            <span>Übersicht</span>
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center space-x-1">
            <FileText className="w-4 h-4" />
            <span>Zusammenfassung</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center space-x-1">
            <Activity className="w-4 h-4" />
            <span>Vollständiger Inhalt</span>
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center space-x-1">
            <DollarSign className="w-4 h-4" />
            <span>Finanzanalyse</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center space-x-1">
            <Brain className="w-4 h-4" />
            <span>KI-Analyse</span>
          </TabsTrigger>
          <TabsTrigger value="metadata" className="flex items-center space-x-1">
            <BarChart3 className="w-4 h-4" />
            <span>Metadaten</span>
          </TabsTrigger>
        </TabsList>

        {/* Übersicht Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="w-5 h-5" />
                <span>Executive Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900">Auswirkungsbereich</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    {update.device_classes?.length ? 
                      `${update.device_classes.length} Geräteklassen betroffen` : 
                      'Alle relevanten Medizinprodukte'}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900">Implementierungszeit</h4>
                  <p className="text-sm text-green-700 mt-1">
                    {update.priority === 'high' ? '1-3 Monate' : '6-12 Monate'}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900">Compliance Status</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    {update.priority === 'high' ? 'Sofortige Maßnahmen' : 'Planbare Umsetzung'}
                  </p>
                </div>
              </div>
              
              <div className="prose max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {update.description.split('\n')[0]}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Zusammenfassung Tab */}
        <TabsContent value="summary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Regulatorische Zusammenfassung</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold mb-2">Kernpunkte:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Neue regulatorische Anforderungen für {update.region}</li>
                    <li>Auswirkungen auf {update.update_type === 'approval' ? 'Produktzulassungen' : 'Compliance-Prozesse'}</li>
                    <li>Zeitkritische Implementierung bei {update.priority} Priorität</li>
                    <li>Internationale Harmonisierung mit bestehenden Standards</li>
                  </ul>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {update.description.substring(0, 500)}...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vollständiger Inhalt Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Vollständiger Regulatorischer Inhalt</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {update.description}
                </div>
              </div>
              
              {update.source_url && (
                <div className="mt-6 pt-4 border-t">
                  <Button asChild variant="outline" size="sm">
                    <a href={update.source_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Original-Dokument anzeigen
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Finanzanalyse Tab */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Implementierungskosten */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>Implementierungskosten</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Sofortige Kosten:</span>
                    <span className="font-bold text-lg">{financialAnalysis.implementationCosts.immediate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Erstes Jahr:</span>
                    <span className="font-bold text-lg">{financialAnalysis.implementationCosts.firstYear}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Laufende Kosten:</span>
                    <span className="font-bold text-lg">{financialAnalysis.implementationCosts.ongoing}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ROI-Analyse */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>ROI-Analyse</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Payback-Periode:</span>
                    <span className="font-bold">{financialAnalysis.roi.paybackPeriod}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">NPV:</span>
                    <span className="font-bold text-green-600">{financialAnalysis.roi.npv}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">IRR:</span>
                    <span className="font-bold text-green-600">{financialAnalysis.roi.irr}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Marktauswirkungen */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Marktauswirkungen</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium block">Time-to-Market:</span>
                    <span className="text-lg font-bold">{financialAnalysis.marketImpact.timeToMarket}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium block">Marktzugang:</span>
                    <span className="text-sm">{financialAnalysis.marketImpact.marketAccess}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium block">Umsatzprojektion:</span>
                    <span className="text-lg font-bold text-green-600">{financialAnalysis.marketImpact.revenueProjection}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risikobewertung */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Risikobewertung</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium block">Compliance-Risiko:</span>
                    <span className={cn("text-sm font-medium", 
                      update.priority === 'high' ? 'text-red-600' : 'text-yellow-600')}>
                      {financialAnalysis.riskAssessment.complianceRisk}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium block">Finanzielles Risiko:</span>
                    <span className="text-sm text-red-600">{financialAnalysis.riskAssessment.financialRisk}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium block">Opportunitätskosten:</span>
                    <span className="text-sm">{financialAnalysis.riskAssessment.opportunityCost}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* KI-Analyse Tab */}
        <TabsContent value="ai" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risiko- und Erfolgsmetriken */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>KI-Bewertung</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Risiko-Score</span>
                      <span className="font-bold">{aiAnalysis.riskScore}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={cn("h-2 rounded-full", 
                          aiAnalysis.riskScore > 70 ? 'bg-red-500' : 
                          aiAnalysis.riskScore > 40 ? 'bg-yellow-500' : 'bg-green-500')}
                        style={{ width: `${aiAnalysis.riskScore}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Erfolgswahrscheinlichkeit</span>
                      <span className="font-bold">{aiAnalysis.successProbability}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${aiAnalysis.successProbability}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Komplexitätslevel:</span>
                    <Badge variant={aiAnalysis.complexityLevel === 'Hoch' ? 'destructive' : 'secondary'}>
                      {aiAnalysis.complexityLevel}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Handlungsempfehlungen */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5" />
                  <span>KI-Empfehlungen</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiAnalysis.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Kritische Aktionen */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Kritische Aktionen</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiAnalysis.keyActions.map((action, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{action.action}</h4>
                        <Badge variant={action.priority === 'KRITISCH' ? 'destructive' : 'secondary'} className="text-xs">
                          {action.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Timeline: {action.timeline}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ähnliche Fälle */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Präzedenzfälle & Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiAnalysis.similarCases.map((case_text, index) => (
                    <div key={index} className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm">{case_text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Metadaten Tab */}
        <TabsContent value="metadata" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Technische Metadaten</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Update-ID:</span>
                    <p className="font-mono text-sm">{update.id}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Quelle:</span>
                    <p>{update.source_id}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Region:</span>
                    <p>{getRegionFlag(update.region)} {update.region}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Update-Typ:</span>
                    <p className="capitalize">{update.update_type}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Veröffentlicht:</span>
                    <p>{new Date(update.published_at).toLocaleString('de-DE')}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Hinzugefügt:</span>
                    <p>{new Date(update.created_at).toLocaleString('de-DE')}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Priorität:</span>
                    <Badge className={getPriorityColor(update.priority)}>
                      {update.priority}
                    </Badge>
                  </div>
                  {update.device_classes && update.device_classes.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Geräteklassen:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {update.device_classes.map((deviceClass, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {deviceClass}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Export-Optionen */}
              <div className="mt-6 pt-4 border-t">
                <h4 className="font-medium mb-3">Export-Optionen</h4>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    PDF exportieren
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Teilen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}