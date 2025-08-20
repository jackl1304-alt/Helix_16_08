import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, FileText, Search, Filter, Download, Calendar, Globe } from 'lucide-react';

export default function TenantRegulatoryUpdates() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedImpact, setSelectedImpact] = useState('all');

  const regulatoryUpdates = [
    {
      id: 1,
      title: "FDA Issues Final Guidance on Cybersecurity in Medical Devices",
      summary: "Die FDA hat neue Cybersecurity-Standards für vernetzte Medizingeräte veröffentlicht, die ab Oktober 2024 gelten.",
      source: "FDA",
      region: "USA",
      date: "2024-03-15",
      impactLevel: "high",
      category: "Cybersecurity",
      deviceClasses: ["Class II", "Class III"]
    },
    {
      id: 2,
      title: "EU MDR Implementation Deadline Extended for Legacy Devices",
      summary: "Verlängerung der Übergangsfristen für Legacy-Medizinprodukte unter der MDR um weitere 12 Monate.",
      source: "European Commission",
      region: "EU",
      date: "2024-02-20",
      impactLevel: "high",
      category: "Regulatory Transition",
      deviceClasses: ["Class I", "Class II", "Class III"]
    },
    {
      id: 3,
      title: "Health Canada Updates Quality System Requirements",
      summary: "Neue Anforderungen an Qualitätssysteme basierend auf ISO 13485:2016 Standards.",
      source: "Health Canada",
      region: "Canada",
      date: "2024-01-10",
      impactLevel: "medium",
      category: "Quality Systems",
      deviceClasses: ["Class II", "Class III", "Class IV"]
    },
    {
      id: 4,
      title: "FDA 510(k) Substantial Equivalence K242567 - CardioSense AI",
      summary: "Neue 510(k) Zulassung für KI-basiertes Herzrhythmus-Monitoring System.",
      source: "FDA 510(k) Database",
      region: "USA",
      date: "2024-08-15",
      impactLevel: "medium",
      category: "510(k) Clearance",
      deviceClasses: ["Class II"]
    },
    {
      id: 5,
      title: "Japan PMDA Guidelines for AI/ML Medical Devices Updated",
      summary: "Überarbeitete Richtlinien für KI- und Machine Learning-basierte Medizinprodukte in Japan.",
      source: "PMDA",
      region: "Japan",
      date: "2024-07-22",
      impactLevel: "medium",
      category: "AI/ML Guidelines",
      deviceClasses: ["Class II", "Class III"]
    }
  ];

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRegionFlag = (region: string) => {
    switch (region) {
      case 'USA': return '🇺🇸';
      case 'EU': return '🇪🇺';
      case 'Canada': return '🇨🇦';
      case 'Japan': return '🇯🇵';
      case 'UK': return '🇬🇧';
      default: return '🌍';
    }
  };

  const filteredUpdates = regulatoryUpdates.filter(update => {
    const matchesSearch = !searchTerm || 
      update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === 'all' || update.region === selectedRegion;
    const matchesImpact = selectedImpact === 'all' || update.impactLevel === selectedImpact;
    
    return matchesSearch && matchesRegion && matchesImpact;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                ← Zurück zum Dashboard
              </Button>
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-lg font-semibold text-gray-900">Regulatory Updates</h1>
                <p className="text-sm text-gray-500">Verfügbar für Enterprise Plan</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Updates</p>
                  <p className="text-2xl font-bold text-gray-900">{regulatoryUpdates.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Impact</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {regulatoryUpdates.filter(u => u.impactLevel === 'high').length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Regions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(regulatoryUpdates.map(u => u.region)).size}
                  </p>
                </div>
                <Globe className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
                <Filter className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Controls */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Suche nach Updates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Regionen</SelectItem>
                  <SelectItem value="USA">🇺🇸 USA</SelectItem>
                  <SelectItem value="EU">🇪🇺 EU</SelectItem>
                  <SelectItem value="Canada">🇨🇦 Canada</SelectItem>
                  <SelectItem value="Japan">🇯🇵 Japan</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedImpact} onValueChange={setSelectedImpact}>
                <SelectTrigger>
                  <SelectValue placeholder="Impact Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Impact Levels</SelectItem>
                  <SelectItem value="high">High Impact</SelectItem>
                  <SelectItem value="medium">Medium Impact</SelectItem>
                  <SelectItem value="low">Low Impact</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Updates List */}
        <div className="space-y-6">
          {filteredUpdates.map((update) => (
            <Card key={update.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {getRegionFlag(update.region)} {update.title}
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                      {update.source} • {new Date(update.date).toLocaleDateString('de-DE')}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getImpactColor(update.impactLevel)}>
                      {update.impactLevel.toUpperCase()} IMPACT
                    </Badge>
                    <Badge variant="outline">{update.category}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{update.summary}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 flex-wrap">
                    {update.deviceClasses.map((deviceClass) => (
                      <Badge key={deviceClass} variant="secondary" className="text-xs">
                        {deviceClass}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="outline" size="sm">
                    Details anzeigen
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUpdates.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Updates gefunden</h3>
              <p className="text-gray-600">
                Versuchen Sie andere Suchkriterien oder Filter.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}