import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
// import { PiecesShareButton } from '../components/pieces-share-button';
import { 
  Clock, Plus, Search, Calendar, AlertCircle, CheckCircle, 
  FileText, Building2, Globe, Zap, Users, Flag, Edit, Trash2,
  TrendingUp, DollarSign, Target, BarChart3
} from 'lucide-react';

interface OngoingApproval {
  id: string;
  productName: string;
  company: string;
  region: string;
  regulatoryBody: string;
  submissionDate: string;
  expectedApproval: string;
  currentPhase: string;
  deviceClass: string;
  status: 'submitted' | 'under-review' | 'pending-response' | 'nearly-approved' | 'approved' | 'rejected';
  progressPercentage: number;
  estimatedCosts: string;
  keyMilestones: string[];
  challenges: string[];
  nextSteps: string[];
  contactPerson: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export default function LaufendeZulassungen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [isCreating, setIsCreating] = useState(false);
  const [newApproval, setNewApproval] = useState<Partial<OngoingApproval>>({
    status: 'submitted',
    priority: 'medium',
    progressPercentage: 0
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock Data für laufende Zulassungen - In der Produktion würde dies von der API kommen
  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ['ongoing-approvals'],
    queryFn: async (): Promise<OngoingApproval[]> => {
      return [
        {
          id: 'app-001',
          productName: 'CardioSense AI Monitoring System',
          company: 'MedTech Innovations GmbH',
          region: 'EU',
          regulatoryBody: 'MDR - Benannte Stelle TÜV SÜD',
          submissionDate: '2025-06-15',
          expectedApproval: '2025-12-15',
          currentPhase: 'Technische Dokumentation Review',
          deviceClass: 'Klasse IIa',
          status: 'under-review',
          progressPercentage: 65,
          estimatedCosts: '€180.000',
          keyMilestones: [
            '✅ Präklinische Tests abgeschlossen',
            '✅ Klinische Bewertung eingereicht', 
            '🔄 Technische Dokumentation unter Review',
            '⏳ Benannte Stelle Zertifizierung ausstehend'
          ],
          challenges: [
            'Zusätzliche klinische Daten für KI-Algorithmus angefordert',
            'Post-Market Surveillance Plan muss erweitert werden'
          ],
          nextSteps: [
            'Antwort auf Fragen der Benannten Stelle bis 15. August',
            'Erweiterte klinische Validierung einreichen'
          ],
          contactPerson: 'Dr. Sarah Weber - Regulatory Affairs',
          priority: 'high'
        },
        {
          id: 'app-002',
          productName: 'NeuroStim Implant V3',
          company: 'Brain Tech Solutions',
          region: 'USA',
          regulatoryBody: 'FDA - Center for Devices and Radiological Health',
          submissionDate: '2025-03-10',
          expectedApproval: '2026-01-30',
          currentPhase: 'PMA Review Phase II',
          deviceClass: 'Class III',
          status: 'pending-response',
          progressPercentage: 45,
          estimatedCosts: '$875.000',
          keyMilestones: [
            '✅ IDE Studie abgeschlossen',
            '✅ PMA Antrag eingereicht',
            '🔄 FDA Review Phase II',
            '⏳ Advisory Panel Meeting geplant'
          ],
          challenges: [
            'FDA fordert erweiterte Langzeitsicherheitsdaten',
            'Zusätzliche Biokompatibilitätsstudien erforderlich'
          ],
          nextSteps: [
            'Antwort auf FDA Major Deficiency Letter bis 20. August',
            'Advisory Panel Meeting vorbereiten'
          ],
          contactPerson: 'Mark Johnson - VP Regulatory',
          priority: 'critical'
        },
        {
          id: 'app-003',
          productName: 'FlexiScope Endoskop',
          company: 'Precision Medical Devices',
          region: 'Japan',
          regulatoryBody: 'PMDA - Pharmaceuticals and Medical Devices Agency',
          submissionDate: '2025-07-01',
          expectedApproval: '2026-03-15',
          currentPhase: 'Administrative Review',
          deviceClass: 'Class II',
          status: 'submitted',
          progressPercentage: 20,
          estimatedCosts: '¥8.500.000',
          keyMilestones: [
            '✅ Japanischer Agent bestellt',
            '✅ Übersetzungen abgeschlossen',
            '🔄 Administrative Prüfung läuft',
            '⏳ Technische Review ausstehend'
          ],
          challenges: [
            'Anpassung an japanische JIS Standards erforderlich',
            'Lokale klinische Daten müssen ergänzt werden'
          ],
          nextSteps: [
            'Response zu Administrative Review einreichen',
            'Lokale Klinik-Kooperationen etablieren'
          ],
          contactPerson: 'Hiroshi Tanaka - Japan Representative',
          priority: 'medium'
        },
        {
          id: 'app-004',
          productName: 'DiagnoAI Pathology Assistant',
          company: 'AI Diagnostics Ltd.',
          region: 'China',
          regulatoryBody: 'NMPA - National Medical Products Administration',
          submissionDate: '2025-05-20',
          expectedApproval: '2025-11-30',
          currentPhase: 'Clinical Trial Review',
          deviceClass: 'Class III',
          status: 'nearly-approved',
          progressPercentage: 85,
          estimatedCosts: '¥1.200.000',
          keyMilestones: [
            '✅ Clinical Trial genehmigt',
            '✅ Clinical Data eingereicht',
            '✅ Technical Review bestanden',
            '🔄 Final Administrative Review'
          ],
          challenges: [
            'KI-Algorithmus Dokumentation muss lokalisiert werden',
            'Chinesischer Partner für Distribution erforderlich'
          ],
          nextSteps: [
            'Administrative Unterlagen finalisieren',
            'Distribution Agreement abschließen'
          ],
          contactPerson: 'Li Wei - China Operations',
          priority: 'high'
        }
      ];
    }
  });

  const createApprovalMutation = useMutation({
    mutationFn: async (approval: Omit<OngoingApproval, 'id'>) => {
      const response = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(approval)
      });
      if (!response.ok) throw new Error('Failed to create approval');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ongoing-approvals'] });
      setIsCreating(false);
      setNewApproval({ status: 'submitted', priority: 'medium', progressPercentage: 0 });
      toast({
        title: "✅ Zulassung hinzugefügt",
        description: "Der neue Zulassungsprozess wurde erfolgreich erfasst.",
      });
    },
    onError: () => {
      toast({
        title: "❌ Fehler",
        description: "Zulassung konnte nicht erstellt werden.",
        variant: "destructive",
      });
    }
  });

  const filteredApprovals = approvals.filter(approval => {
    const matchesSearch = approval.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         approval.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         approval.regulatoryBody.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || approval.status === selectedStatus;
    const matchesRegion = selectedRegion === 'all' || approval.region === selectedRegion;
    
    return matchesSearch && matchesStatus && matchesRegion;
  });

  const getStatusBadge = (status: OngoingApproval['status']) => {
    switch (status) {
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">Eingereicht</Badge>;
      case 'under-review':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">Under Review</Badge>;
      case 'pending-response':
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">Antwort ausstehend</Badge>;
      case 'nearly-approved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Fast genehmigt</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Genehmigt</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">Abgelehnt</Badge>;
      default:
        return <Badge variant="outline">Unbekannt</Badge>;
    }
  };

  const getPriorityBadge = (priority: OngoingApproval['priority']) => {
    switch (priority) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">Kritisch</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">Hoch</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">Mittel</Badge>;
      case 'low':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Niedrig</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <Clock className="w-8 h-8" />
            Laufende Zulassungen
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {filteredApprovals.length} von {approvals.length} aktiven Zulassungsprozessen
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Neue Zulassung
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Neuen Zulassungsprozess erfassen</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Produktname"
                  value={newApproval.productName || ''}
                  onChange={(e) => setNewApproval(prev => ({ ...prev, productName: e.target.value }))}
                />
                <Input
                  placeholder="Unternehmen"
                  value={newApproval.company || ''}
                  onChange={(e) => setNewApproval(prev => ({ ...prev, company: e.target.value }))}
                />
                <Select value={newApproval.region || ''} onValueChange={(value) => setNewApproval(prev => ({ ...prev, region: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USA">USA</SelectItem>
                    <SelectItem value="EU">EU</SelectItem>
                    <SelectItem value="Japan">Japan</SelectItem>
                    <SelectItem value="China">China</SelectItem>
                    <SelectItem value="Canada">Kanada</SelectItem>
                    <SelectItem value="Brazil">Brasilien</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Zulassungsbehörde"
                  value={newApproval.regulatoryBody || ''}
                  onChange={(e) => setNewApproval(prev => ({ ...prev, regulatoryBody: e.target.value }))}
                />
                <Input
                  type="date"
                  placeholder="Eingereicht am"
                  value={newApproval.submissionDate || ''}
                  onChange={(e) => setNewApproval(prev => ({ ...prev, submissionDate: e.target.value }))}
                />
                <Input
                  type="date"
                  placeholder="Erwartete Genehmigung"
                  value={newApproval.expectedApproval || ''}
                  onChange={(e) => setNewApproval(prev => ({ ...prev, expectedApproval: e.target.value }))}
                />
                <Input
                  placeholder="Produktklasse"
                  value={newApproval.deviceClass || ''}
                  onChange={(e) => setNewApproval(prev => ({ ...prev, deviceClass: e.target.value }))}
                />
                <Input
                  placeholder="Geschätzte Kosten"
                  value={newApproval.estimatedCosts || ''}
                  onChange={(e) => setNewApproval(prev => ({ ...prev, estimatedCosts: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Abbrechen
                </Button>
                <Button 
                  onClick={() => createApprovalMutation.mutate(newApproval as Omit<OngoingApproval, 'id'>)}
                  disabled={createApprovalMutation.isPending || !newApproval.productName}
                >
                  Zulassung erfassen
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Aktive Prozesse</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{approvals.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Fast genehmigt</p>
                <p className="text-2xl font-bold text-green-600">
                  {approvals.filter(a => a.status === 'nearly-approved').length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Kritische Priorität</p>
                <p className="text-2xl font-bold text-red-600">
                  {approvals.filter(a => a.priority === 'critical').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ø Fortschritt</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(approvals.reduce((acc, a) => acc + a.progressPercentage, 0) / approvals.length)}%
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="submitted">Eingereicht</SelectItem>
                <SelectItem value="under-review">Under Review</SelectItem>
                <SelectItem value="pending-response">Antwort ausstehend</SelectItem>
                <SelectItem value="nearly-approved">Fast genehmigt</SelectItem>
                <SelectItem value="approved">Genehmigt</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Regionen</SelectItem>
                <SelectItem value="USA">USA</SelectItem>
                <SelectItem value="EU">EU</SelectItem>
                <SelectItem value="Japan">Japan</SelectItem>
                <SelectItem value="China">China</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Approvals List */}
      <div className="space-y-4">
        {filteredApprovals.map((approval) => (
          <Card key={approval.id}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {approval.productName}
                    </h3>
                    {getStatusBadge(approval.status)}
                    {getPriorityBadge(approval.priority)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {approval.company}
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      {approval.region}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Erwartet: {new Date(approval.expectedApproval).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Pieces Share Button temporarily disabled due to plugin conflict */}
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mx-4 mt-4">
                  <TabsTrigger value="overview">Übersicht</TabsTrigger>
                  <TabsTrigger value="milestones">Meilensteine</TabsTrigger>
                  <TabsTrigger value="challenges">Herausforderungen</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Fortschritt</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Aktueller Stand</span>
                          <span>{approval.progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${approval.progressPercentage}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {approval.currentPhase}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Wichtige Informationen</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Produktklasse:</span>
                          <span>{approval.deviceClass}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Geschätzte Kosten:</span>
                          <span className="font-medium">{approval.estimatedCosts}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Kontaktperson:</span>
                          <span>{approval.contactPerson}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Behörde:</span>
                          <span>{approval.regulatoryBody}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="milestones" className="p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Meilensteine & Status</h4>
                  <div className="space-y-3">
                    {approval.keyMilestones.map((milestone, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded">
                        <div className="text-lg">
                          {milestone.startsWith('✅') ? '✅' : 
                           milestone.startsWith('🔄') ? '🔄' : '⏳'}
                        </div>
                        <span className="text-sm flex-1">
                          {milestone.replace(/^[✅🔄⏳]\s/, '')}
                        </span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="challenges" className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        Aktuelle Herausforderungen
                      </h4>
                      <div className="space-y-2">
                        {approval.challenges.map((challenge, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{challenge}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        Nächste Schritte
                      </h4>
                      <div className="space-y-2">
                        {approval.nextSteps.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Timeline</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Eingereicht:</span>
                          <p className="text-sm">{new Date(approval.submissionDate).toLocaleDateString('de-DE')}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Erwartete Genehmigung:</span>
                          <p className="text-sm">{new Date(approval.expectedApproval).toLocaleDateString('de-DE')}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Verbleibende Zeit:</span>
                          <p className="text-sm">
                            {Math.ceil((new Date(approval.expectedApproval).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} Tage
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Kosten & Ressourcen</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Geschätzte Gesamtkosten:</span>
                          <p className="text-lg font-semibold text-green-600">{approval.estimatedCosts}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Verantwortlich:</span>
                          <p className="text-sm">{approval.contactPerson}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredApprovals.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Keine laufenden Zulassungen</h2>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedStatus !== 'all' || selectedRegion !== 'all'
                  ? 'Keine Zulassungen entsprechen den aktuellen Filtern.'
                  : 'Aktuell sind keine Zulassungsprozesse erfasst.'}
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Erste Zulassung erfassen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}