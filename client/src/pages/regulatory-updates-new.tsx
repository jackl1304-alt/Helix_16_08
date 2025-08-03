import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Search, Download, ExternalLink, Clock, Globe, Calendar, Eye, Brain, Filter, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Device detection for responsive design
const useDeviceDetection = () => {
  const [device, setDevice] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true
  });

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setDevice({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024
      });
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return device;
};

// Formatted text component for proper line breaks
const FormattedText = ({ text, className = "" }: { text: string; className?: string }) => {
  return (
    <div className={className}>
      {text.split('\n').map((line, index) => (
        <span key={index}>
          {line}
          {index < text.split('\n').length - 1 && <br />}
        </span>
      ))}
    </div>
  );
};

interface RegulatoryUpdate {
  id: string;
  title: string;
  content?: string;
  description?: string;
  summary?: string;
  source_id?: string;
  authority?: string;
  region: string;
  type?: string;
  update_type?: string;
  status?: string;
  priority: string;
  language?: string;
  published_at: string;
  effective_date?: string;
  created_at: string;
  tags?: string[];
  source_url?: string;
  document_url?: string;
  device_classes?: any[];
  categories?: any;
  raw_data?: any;
}

export default function RegulatoryUpdatesPage() {
  const device = useDeviceDetection();
  const { toast } = useToast();

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedAuthority, setSelectedAuthority] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  // Fetch regulatory updates - use the same endpoint as the old page
  const { data: updatesResponse, isLoading: isLoadingData, error: dataError } = useQuery({
    queryKey: ['/api/regulatory-updates/recent?limit=5000'],
    staleTime: 300000, // 5 minutes
  });

  // Process updates data - handle the API response structure
  const updates: RegulatoryUpdate[] = useMemo(() => {
    if (!updatesResponse) return [];
    
    // Handle the API response structure: {success: boolean, data: array, timestamp: string}
    if (updatesResponse && typeof updatesResponse === 'object') {
      if ('data' in updatesResponse && Array.isArray(updatesResponse.data)) {
        return updatesResponse.data;
      }
      if ('success' in updatesResponse && updatesResponse.success && 'data' in updatesResponse) {
        return Array.isArray(updatesResponse.data) ? updatesResponse.data : [];
      }
    }
    
    // Fallback: if it's already an array
    if (Array.isArray(updatesResponse)) return updatesResponse;
    
    return [];
  }, [updatesResponse]);

  // Filter updates
  const filteredData = useMemo(() => {
    return updates.filter(update => {
      const matchesSearch = !searchTerm || 
        update.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (update.authority || update.source_id || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (update.content || update.description || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        update.summary?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRegion = selectedRegion === "all" || update.region === selectedRegion;
      const matchesAuthority = selectedAuthority === "all" || (update.authority || update.source_id) === selectedAuthority;
      const matchesType = selectedType === "all" || (update.type || update.update_type) === selectedType;
      const matchesStatus = selectedStatus === "all" || update.status === selectedStatus;
      const matchesPriority = selectedPriority === "all" || update.priority === selectedPriority;
      
      return matchesSearch && matchesRegion && matchesAuthority && matchesType && matchesStatus && matchesPriority;
    });
  }, [updates, searchTerm, selectedRegion, selectedAuthority, selectedType, selectedStatus, selectedPriority]);

  // Get unique values for filters - handle optional fields safely
  const regions = useMemo(() => [...new Set(updates.map(u => u.region).filter(Boolean))], [updates]);
  const authorities = useMemo(() => [...new Set(updates.map(u => u.authority || u.source_id).filter(Boolean))], [updates]);
  const types = useMemo(() => [...new Set(updates.map(u => u.type || u.update_type).filter(Boolean))], [updates]);
  const statuses = useMemo(() => [...new Set(updates.map(u => u.status).filter(Boolean))], [updates]);
  const priorities = useMemo(() => [...new Set(updates.map(u => u.priority).filter(Boolean))], [updates]);

  // Priority badge styling
  const getPriorityBadgeStyle = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'hoch':
        return 'border-red-300 text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-300';
      case 'medium':
      case 'mittel':
        return 'border-yellow-300 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low':
      case 'niedrig':
        return 'border-green-300 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'border-gray-300 text-gray-700 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  // Status badge styling
  const getStatusBadgeStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'aktiv':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'draft':
      case 'entwurf':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'archived':
      case 'archiviert':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10">
      <div className={cn(
        "space-y-6",
        device.isMobile ? "p-4" : device.isTablet ? "p-6" : "p-8"
      )}>
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                📋 Regulatorische Updates
              </h1>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300">
                Erweitert
              </Badge>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {isLoadingData ? (
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 animate-pulse" />
                  Lade regulatorische Updates und Compliance-Informationen...
                </span>
              ) : (
                `${filteredData.length} von ${updates.length} regulatorische Updates verfügbar`
              )}
            </p>
          </div>
        </div>

        {/* Enhanced Filter Controls */}
        <Card className="shadow-lg border-l-4 border-l-blue-500">
          <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-lg">
            <CardTitle className="text-xl font-semibold flex items-center">
              <Search className="w-5 h-5 mr-2 text-blue-600" />
              Erweiterte Filteroptionen
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <div>
                <label className="text-sm font-medium">Region</label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Region wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Regionen</SelectItem>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Behörde</label>
                <Select value={selectedAuthority} onValueChange={setSelectedAuthority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Behörde wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Behörden</SelectItem>
                    {authorities.map((authority) => (
                      <SelectItem key={authority} value={authority}>
                        {authority || 'Unbekannt'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Typ</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Typ wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Typen</SelectItem>
                    {types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type || 'Unbekannt'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Status</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status || 'Unbekannt'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Priorität</label>
                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Priorität wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Prioritäten</SelectItem>
                    {priorities.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Suche</label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Update, Behörde oder Inhalt suchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gesamte Updates</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{updates.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Filter className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gefiltert</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{filteredData.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Globe className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Behörden</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{authorities.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aktive Updates</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {updates.filter(u => u.status?.toLowerCase() === 'active' || u.status?.toLowerCase() === 'aktiv').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hohe Priorität</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {updates.filter(u => u.priority?.toLowerCase() === 'high' || u.priority?.toLowerCase() === 'hoch').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hauptinhalt - Direkte Anzeige ohne Tabs */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-b">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Regulatorische Updates Übersicht
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {filteredData.length} von {updates.length} regulatorische Updates verfügbar
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {isLoadingData ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-4 text-lg">Lade regulatorische Updates...</span>
                  </div>
                ) : dataError ? (
                  <div className="flex items-center justify-center py-12 text-red-600">
                    <FileText className="h-8 w-8 mr-2" />
                    <span>Fehler beim Laden der regulatorischen Updates</span>
                  </div>
                ) : filteredData.length === 0 ? (
                  <div className="flex items-center justify-center py-12 text-gray-500">
                    <FileText className="h-8 w-8 mr-2" />
                    <span>Keine regulatorischen Updates für die gewählten Filter gefunden</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredData.map((update) => (
                      <Card key={update.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                {update.title}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                <span className="flex items-center">
                                  <Globe className="w-4 h-4 mr-1" />
                                  {update.authority || update.source_id || 'Unbekannte Quelle'}
                                </span>
                                <span className="flex items-center">
                                  <FileText className="w-4 h-4 mr-1" />
                                  {update.region}
                                </span>
                                <span className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {new Date(update.published_at).toLocaleDateString('de-DE')}
                                </span>
                                {update.effective_date && (
                                  <span className="flex items-center">
                                    <Clock className="w-4 h-4 mr-1" />
                                    Wirksam: {new Date(update.effective_date).toLocaleDateString('de-DE')}
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-2 mb-3">
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                  {update.type || update.update_type || 'Unbekannt'}
                                </Badge>
                                <Badge 
                                  variant="secondary" 
                                  className={getStatusBadgeStyle(update.status || 'unbekannt')}
                                >
                                  {update.status || 'Unbekannt'}
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className={getPriorityBadgeStyle(update.priority)}
                                >
                                  {update.priority}
                                </Badge>
                                <Badge variant="outline" className="text-gray-600">
                                  {update.language || 'DE'}
                                </Badge>
                              </div>

                              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                                {update.summary || update.description || (update.content ? update.content.substring(0, 300) + '...' : 'Keine Beschreibung verfügbar')}
                              </p>

                              {update.tags && update.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-4">
                                  {update.tags.slice(0, 5).map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {update.tags.length > 5 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{update.tags.length - 5} weitere
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    Details & Analyse
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl w-[95vw] h-[90vh] overflow-y-auto">
                                  <DialogHeader className="sticky top-0 bg-white dark:bg-gray-800 z-10 pb-4 border-b">
                                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                      <FileText className="h-5 w-5 text-blue-600" />
                                      {update.title}
                                    </DialogTitle>
                                  </DialogHeader>
                                  
                                  {/* Tab Navigation für einzelnes Update */}
                                  <Tabs defaultValue="overview" className="w-full mt-6">
                                    <TabsList className="grid w-full grid-cols-6 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                                      <TabsTrigger 
                                        value="overview" 
                                        className="flex items-center gap-1 text-xs font-medium rounded data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/20"
                                      >
                                        <FileText className="h-3 w-3" />
                                        Übersicht
                                      </TabsTrigger>
                                      <TabsTrigger 
                                        value="summary" 
                                        className="flex items-center gap-1 text-xs font-medium rounded data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/20"
                                      >
                                        <Eye className="h-3 w-3" />
                                        Zusammenfassung
                                      </TabsTrigger>
                                      <TabsTrigger 
                                        value="content" 
                                        className="flex items-center gap-1 text-xs font-medium rounded data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/20"
                                      >
                                        <FileText className="h-3 w-3" />
                                        Vollständiger Inhalt
                                      </TabsTrigger>
                                      <TabsTrigger 
                                        value="finance" 
                                        className="flex items-center gap-1 text-xs font-medium rounded data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 dark:data-[state=active]:bg-orange-900/20"
                                      >
                                        <span className="text-xs">🔥</span>
                                        Finanzanalyse
                                      </TabsTrigger>
                                      <TabsTrigger 
                                        value="ai" 
                                        className="flex items-center gap-1 text-xs font-medium rounded data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900/20"
                                      >
                                        <Brain className="h-3 w-3" />
                                        KI-Analyse
                                      </TabsTrigger>
                                      <TabsTrigger 
                                        value="metadata" 
                                        className="flex items-center gap-1 text-xs font-medium rounded data-[state=active]:bg-gray-50 data-[state=active]:text-gray-700 dark:data-[state=active]:bg-gray-900/20"
                                      >
                                        <Globe className="h-3 w-3" />
                                        Metadaten
                                      </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="overview" className="mt-4">
                                      <div className="space-y-6">
                                        {/* Update Metadata */}
                                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                          <h4 className="font-semibold mb-3">Update-Informationen</h4>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div><strong>Behörde:</strong> {update.authority || update.source_id || 'Unbekannt'}</div>
                                            <div><strong>Region:</strong> {update.region}</div>
                                            <div><strong>Typ:</strong> {update.type || update.update_type || 'Unbekannt'}</div>
                                            <div><strong>Status:</strong> {update.status || 'Unbekannt'}</div>
                                            <div><strong>Priorität:</strong> {update.priority}</div>
                                            <div><strong>Sprache:</strong> {update.language || 'DE'}</div>
                                            <div><strong>Veröffentlicht:</strong> {new Date(update.published_at).toLocaleDateString('de-DE')}</div>
                                            {update.effective_date && (
                                              <div><strong>Wirksam ab:</strong> {new Date(update.effective_date).toLocaleDateString('de-DE')}</div>
                                            )}
                                          </div>
                                        </div>

                                        {/* Tags */}
                                        {update.tags && update.tags.length > 0 && (
                                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                            <h4 className="font-semibold mb-2">Schlagwörter</h4>
                                            <div className="flex flex-wrap gap-2">
                                              {update.tags.map((tag, index) => (
                                                <Badge key={index} variant="outline">
                                                  {tag}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex gap-4 pt-4 border-t">
                                          <Button 
                                            onClick={() => {
                                              try {
                                                const content = `${update.title}\n\n${update.summary || update.description || ''}\n\n${update.content || update.description || 'Kein Inhalt verfügbar'}`;
                                                const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `Regulatorisches_Update_${update.title?.replace(/[^a-z0-9äöüß\s]/gi, '_').replace(/\s+/g, '_') || 'update'}.txt`;
                                                document.body.appendChild(a);
                                                a.click();
                                                document.body.removeChild(a);
                                                URL.revokeObjectURL(url);
                                              } catch (error) {
                                                console.error('Download error:', error);
                                              }
                                            }}
                                            className="flex items-center gap-2"
                                          >
                                            <Download className="h-4 w-4" />
                                            Update herunterladen
                                          </Button>
                                          {(update.source_url || update.document_url) && (
                                            <Button 
                                              variant="outline"
                                              onClick={() => window.open(update.source_url || update.document_url, '_blank')}
                                              className="flex items-center gap-2"
                                            >
                                              <ExternalLink className="h-4 w-4" />
                                              Original-Quelle öffnen
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    </TabsContent>

                                    <TabsContent value="summary" className="mt-4">
                                      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border-l-4 border-blue-400">
                                        <h4 className="font-semibold mb-4 text-blue-800 dark:text-blue-300 text-lg">Zusammenfassung</h4>
                                        <FormattedText text={update.summary || update.description || 'Keine Zusammenfassung verfügbar'} className="text-sm leading-relaxed" />
                                      </div>
                                    </TabsContent>

                                    <TabsContent value="content" className="mt-4">
                                      <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 p-6 rounded-lg">
                                        <h4 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                                          <FileText className="h-5 w-5 text-gray-600" />
                                          Vollständiges Update
                                        </h4>
                                        <div className="prose max-w-none text-sm leading-relaxed">
                                          <FormattedText text={update.content || update.description || 'Kein Inhalt verfügbar'} />
                                        </div>
                                      </div>
                                    </TabsContent>

                                    <TabsContent value="finance" className="mt-4">
                                      <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg border-l-4 border-orange-400">
                                        <h4 className="font-semibold mb-4 text-orange-800 dark:text-orange-300 text-lg flex items-center gap-2">
                                          <span>🔥</span>
                                          KI-gestützte Finanzanalyse
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                          Detaillierte Finanzanalyse für dieses regulatorische Update wird hier angezeigt.
                                        </p>
                                      </div>
                                    </TabsContent>

                                    <TabsContent value="ai" className="mt-4">
                                      <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border-l-4 border-purple-400">
                                        <h4 className="font-semibold mb-4 text-purple-800 dark:text-purple-300 text-lg flex items-center gap-2">
                                          <Brain className="h-5 w-5" />
                                          KI-gestützte Compliance-Analyse
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                          Intelligente KI-Analyse zur Bewertung und Kategorisierung wird hier angezeigt.
                                        </p>
                                      </div>
                                    </TabsContent>

                                    <TabsContent value="metadata" className="mt-4">
                                      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                                        <h4 className="font-semibold mb-4 text-lg flex items-center gap-2">
                                          <Globe className="h-5 w-5 text-gray-600" />
                                          Technische Metadaten
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                          <div><strong>Update-ID:</strong> {update.id}</div>
                                          <div><strong>Erstellt am:</strong> {new Date(update.created_at).toLocaleDateString('de-DE')}</div>
                                          <div><strong>Datenformat:</strong> JSON</div>
                                          <div><strong>Quelle:</strong> {update.source_url ? 'Externe URL' : 'Interne Datenbank'}</div>
                                        </div>
                                      </div>
                                    </TabsContent>
                                  </Tabs>
                                </DialogContent>
                              </Dialog>

                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  try {
                                    const content = `${update.title}\n\n${update.summary || update.description || ''}\n\n${update.content || update.description || 'Kein Inhalt verfügbar'}`;
                                    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `${update.title?.replace(/[^a-z0-9äöüß\s]/gi, '_').replace(/\s+/g, '_') || 'update'}.txt`;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                    toast({ title: "Download gestartet", description: "Update wird heruntergeladen" });
                                  } catch (error) {
                                    console.error('Download error:', error);
                                    toast({ title: "Download-Fehler", description: "Update konnte nicht heruntergeladen werden", variant: "destructive" });
                                  }
                                }}
                                title="Update herunterladen"
                              >
                                <Download className="h-4 w-4" />
                              </Button>

                              {(update.source_url || update.document_url) && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => window.open(update.source_url || update.document_url, '_blank')}
                                  title="Original-Quelle öffnen"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              )}
                            </div>

                            <div className="text-xs text-gray-500">
                              Zuletzt aktualisiert: {new Date(update.created_at || update.published_at).toLocaleDateString('de-DE')}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
      </div>
    </div>
  );
}