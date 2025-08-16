import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, Search, Filter, AlertTriangle, FileText, Globe, MapPin, 
  ExternalLink, Download, Share2, Eye, CheckCircle, Info
} from 'lucide-react';

interface RegulatoryUpdate {
  id: string;
  title: string;
  description?: string;
  content?: string;
  update_type: string;
  region: string;
  priority: string;
  published_at: string;
  source_id: string;
  device_classes?: string[];
  impact_score?: number;
  compliance_deadline?: string;
}

const priorityColors = {
  urgent: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-blue-100 text-blue-800 border-blue-200',
  low: 'bg-gray-100 text-gray-800 border-gray-200'
};

const regionFlags = {
  'USA': '🇺🇸',
  'EU': '🇪🇺', 
  'Canada': '🇨🇦',
  'UK': '🇬🇧',
  'Global': '🌍'
};

export default function RegulatoryUpdates() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  const { data: apiResponse, isLoading, error } = useQuery({
    queryKey: ['/api/regulatory-updates'],
    queryFn: async () => {
      const response = await fetch('/api/regulatory-updates');
      if (!response.ok) throw new Error('Failed to fetch updates');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const updates = apiResponse?.data || [];

  // Filter updates based on search and filters
  const filteredUpdates = updates.filter((update: RegulatoryUpdate) => {
    const matchesSearch = update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         update.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === 'all' || update.region === selectedRegion;
    const matchesPriority = selectedPriority === 'all' || update.priority === selectedPriority;
    
    return matchesSearch && matchesRegion && matchesPriority;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade regulatorische Updates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Fehler beim Laden der Updates</p>
          <p className="text-gray-500 mt-2">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Regulatory Updates</h1>
          <p className="text-gray-600 mt-1">
            Aktuelle regulatorische Änderungen • {updates.length} Updates verfügbar
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Teilen
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Updates durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select 
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">Alle Regionen</option>
          <option value="USA">USA</option>
          <option value="EU">EU</option>
          <option value="Canada">Canada</option>
          <option value="UK">UK</option>
          <option value="Global">Global</option>
        </select>

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">Alle Prioritäten</option>
          <option value="urgent">Dringend</option>
          <option value="high">Hoch</option>
          <option value="medium">Mittel</option>
          <option value="low">Niedrig</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium">Dringend</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {updates.filter((u: RegulatoryUpdate) => u.priority === 'urgent').length}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm font-medium">Hoch</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {updates.filter((u: RegulatoryUpdate) => u.priority === 'high').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium">Mittel</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {updates.filter((u: RegulatoryUpdate) => u.priority === 'medium').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Gesamt</span>
            </div>
            <p className="text-2xl font-bold mt-1">{updates.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Updates List */}
      <div className="space-y-4">
        {filteredUpdates.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Info className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Keine Updates gefunden für die aktuellen Filter.</p>
            </CardContent>
          </Card>
        ) : (
          filteredUpdates.map((update: RegulatoryUpdate) => (
            <Card key={update.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{regionFlags[update.region as keyof typeof regionFlags]}</span>
                      <Badge variant="outline" className="text-xs">
                        {update.update_type}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${priorityColors[update.priority as keyof typeof priorityColors]}`}
                      >
                        {update.priority}
                      </Badge>
                      {update.impact_score && (
                        <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800">
                          Impact: {update.impact_score}/10
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg leading-tight">{update.title}</CardTitle>
                    <p className="text-gray-600 text-sm mt-1">{update.description}</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {new Date(update.published_at).toLocaleDateString('de-DE')}
                    </div>
                    {update.compliance_deadline && (
                      <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                        Deadline: {new Date(update.compliance_deadline).toLocaleDateString('de-DE')}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {update.content && (
                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                    {update.content}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {update.source_id}
                    </Badge>
                    {update.device_classes && update.device_classes.length > 0 && (
                      <div className="flex gap-1">
                        {update.device_classes.map((cls, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {cls}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3 mr-1" />
                      Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Quelle
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="text-center text-sm text-gray-500 pt-4">
        Letzte Aktualisierung: {apiResponse?.last_updated ? 
          new Date(apiResponse.last_updated).toLocaleString('de-DE') : 
          'Unbekannt'
        } • 
        Datenquellen: FDA, EMA, Health Canada, MHRA, WHO
      </div>
    </div>
  );
}