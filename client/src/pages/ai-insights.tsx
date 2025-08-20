import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, AlertTriangle, Clock, Target, Lightbulb, BarChart3, Globe, Filter, Search, Download } from 'lucide-react';
import { PDFDownloadButton } from '@/components/ui/pdf-download-button';

// Types
interface AIInsight {
  id: string;
  title: string;
  description: string;
  category: 'trend_analysis' | 'risk_assessment' | 'market_intelligence' | 'regulatory_change' | 'competitive_analysis';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  timeframe: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
  sources: string[];
  recommendations: string[];
  createdAt: string;
  relevantRegions: string[];
  affectedDeviceClasses: string[];
  tags: string[];
}

export default function AIInsights() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // LOKALE JSON-DATEN - KEINE BACKEND-VERBINDUNGEN
  const insightsLoading = false;
  
  // Statische AI-Insights-Daten
  const insights: AIInsight[] = [
    {
      id: "ai_001",
      title: "FDA Cybersecurity Guidance Impact Analysis",
      description: "Neue FDA-Richtlinien für Cybersecurity bei Medizingeräten werden erhebliche Auswirkungen auf die Branche haben. Hersteller müssen bis Q2 2024 Compliance-Strategien implementieren.",
      category: 'regulatory_change',
      severity: 'high',
      confidence: 92,
      impact: 'high',
      timeframe: 'short_term',
      sources: ['FDA', 'Cybersecurity', 'Medical Devices'],
      recommendations: ['Sofortige Compliance-Überprüfung', 'Cybersecurity-Audit durchführen', 'Incident Response Plan aktualisieren'],
      createdAt: new Date().toISOString(),
      relevantRegions: ['US', 'Global'],
      affectedDeviceClasses: ['Class II', 'Class III'],
      tags: ['FDA', 'Cybersecurity', 'Compliance']
    },
    {
      id: "ai_002", 
      title: "EU MDR Transition Trend Analysis",
      description: "Analyse der MDR-Übergangstrends zeigt kritische Verzögerungen bei der Zertifizierung. 30% der Hersteller werden die Übergangsfristen nicht einhalten können.",
      category: 'trend_analysis',
      severity: 'medium',
      confidence: 88,
      impact: 'high',
      timeframe: 'medium_term',
      sources: ['EU MDR', 'CE Marking', 'Notified Bodies'],
      recommendations: ['Frühe Notified Body Kontaktaufnahme', 'MDR-Readiness Assessment', 'Alternative Zertifizierungsstrategien prüfen'],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      relevantRegions: ['EU', 'EEA'],
      affectedDeviceClasses: ['Class I', 'Class II', 'Class III'],
      tags: ['EU MDR', 'CE Marking', 'Transition']
    },
    {
      id: "ai_003",
      title: "AI/ML Medical Device Approval Patterns",
      description: "KI-basierte Medizingeräte zeigen neue Zulassungsmuster und regulatorische Herausforderungen. FDA genehmigt 65% mehr AI/ML-Devices als im Vorjahr.",
      category: 'market_intelligence',
      severity: 'medium',
      confidence: 85,
      impact: 'medium',
      timeframe: 'long_term',
      sources: ['AI/ML', 'SaMD', 'Digital Health'],
      recommendations: ['AI/ML Strategie entwickeln', 'Regulatory Science verstärken', 'Clinical Evidence Framework etablieren'],
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      relevantRegions: ['Global', 'US', 'EU'],
      affectedDeviceClasses: ['Class II', 'Class III'],
      tags: ['AI/ML', 'SaMD', 'Digital Health']
    },
    {
      id: "ai_004",
      title: "Supply Chain Risk Assessment",
      description: "Globale Lieferkettenunterbrechungen in der MedTech-Industrie zeigen kritische Abhängigkeiten. 40% erhöhtes Risiko bei asiatischen Zulieferern.",
      category: 'risk_assessment',
      severity: 'high',
      confidence: 90,
      impact: 'high',
      timeframe: 'immediate',
      sources: ['Supply Chain', 'Risk Management', 'Global Trade'],
      recommendations: ['Supplier Diversification', 'Risk Mitigation Strategien', 'Alternative Sourcing Optionen'],
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      relevantRegions: ['Global', 'Asia', 'Europe'],
      affectedDeviceClasses: ['Class I', 'Class II', 'Class III'],
      tags: ['Supply Chain', 'Risk', 'Manufacturing']
    }
  ];

  // Filter insights
  const filteredInsights = insights.filter(insight => {
    const matchesCategory = selectedCategory === 'all' || insight.category === selectedCategory;
    const matchesSeverity = selectedSeverity === 'all' || insight.severity === selectedSeverity;
    const matchesSearch = !searchTerm || 
      insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insight.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insight.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSeverity && matchesSearch;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'trend_analysis': return <TrendingUp className="h-4 w-4" />;
      case 'risk_assessment': return <AlertTriangle className="h-4 w-4" />;
      case 'market_intelligence': return <BarChart3 className="h-4 w-4" />;
      case 'regulatory_change': return <Target className="h-4 w-4" />;
      case 'competitive_analysis': return <Globe className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const formatCategory = (category: string) => {
    return category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3 deltaways-brand-text">
            <Brain className="h-10 w-10 text-purple-600" />
            AI-Powered Insights
          </h1>
          <p className="text-gray-600 text-lg">
            {filteredInsights.length} KI-generierte Insights und strategische Analysen
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gesamte Insights</p>
                <p className="text-3xl font-bold text-gray-900">{insights.length}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kritische Insights</p>
                <p className="text-3xl font-bold text-gray-900">{insights.filter(i => i.severity === 'high' || i.severity === 'critical').length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Durchschn. Konfidenz</p>
                <p className="text-3xl font-bold text-gray-900">{Math.round(insights.reduce((acc, i) => acc + i.confidence, 0) / insights.length)}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktive Kategorien</p>
                <p className="text-3xl font-bold text-gray-900">{new Set(insights.map(i => i.category)).size}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Suche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Kategorie</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Kategorien" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Kategorien</SelectItem>
                  <SelectItem value="trend_analysis">Trend Analysis</SelectItem>
                  <SelectItem value="risk_assessment">Risk Assessment</SelectItem>
                  <SelectItem value="market_intelligence">Market Intelligence</SelectItem>
                  <SelectItem value="regulatory_change">Regulatory Change</SelectItem>
                  <SelectItem value="competitive_analysis">Competitive Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Schweregrad</label>
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Schweregrade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Schweregrade</SelectItem>
                  <SelectItem value="critical">Kritisch</SelectItem>
                  <SelectItem value="high">Hoch</SelectItem>
                  <SelectItem value="medium">Mittel</SelectItem>
                  <SelectItem value="low">Niedrig</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Suche</label>
              <Input
                placeholder="Insights durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights Grid */}
      {insightsLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredInsights.map((insight) => (
            <Card key={insight.id} className="hover:shadow-lg transition-shadow deltaways-card-hover">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-tight flex items-center gap-2">
                      {getCategoryIcon(insight.category)}
                      {insight.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={`text-xs ${getSeverityColor(insight.severity)}`}>
                        {insight.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {formatCategory(insight.category)}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Konfidenz: {insight.confidence}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Übersicht</TabsTrigger>
                    <TabsTrigger value="recommendations">Empfehlungen</TabsTrigger>
                    <TabsTrigger value="impact">Impact</TabsTrigger>
                    <TabsTrigger value="metadata">Details</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {insight.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1">
                      {insight.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="recommendations" className="space-y-4">
                    <div className="space-y-2">
                      {insight.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="impact" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Impact Level:</span>
                        <p className={`font-semibold ${getImpactColor(insight.impact)}`}>
                          {insight.impact.toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Zeitrahmen:</span>
                        <p className="font-semibold">{insight.timeframe.replace('_', ' ').toUpperCase()}</p>
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-600 block mb-2">Betroffene Regionen:</span>
                      <div className="flex flex-wrap gap-1">
                        {insight.relevantRegions.map((region, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {region}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-600 block mb-2">Geräte-Klassen:</span>
                      <div className="flex flex-wrap gap-1">
                        {insight.affectedDeviceClasses.map((deviceClass, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {deviceClass}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="metadata" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Erstellt:</span>
                        <p>{new Date(insight.createdAt).toLocaleDateString('de-DE')}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Konfidenz:</span>
                        <p>{insight.confidence}%</p>
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-600 block mb-2">Quellen:</span>
                      <div className="flex flex-wrap gap-1">
                        {insight.sources.map((source, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {source}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="flex items-center justify-end mt-4 pt-4 border-t">
                  <PDFDownloadButton 
                    content={{
                      title: insight.title,
                      description: insight.description,
                      category: insight.category,
                      severity: insight.severity,
                      confidence: insight.confidence,
                      impact: insight.impact,
                      timeframe: insight.timeframe,
                      recommendations: insight.recommendations,
                      sources: insight.sources,
                      relevantRegions: insight.relevantRegions,
                      affectedDeviceClasses: insight.affectedDeviceClasses,
                      tags: insight.tags,
                      createdAt: insight.createdAt
                    }}
                    filename={`ai-insight-${insight.id}.pdf`}
                    className="h-8"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}