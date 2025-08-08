import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PiecesShareButton, PiecesHealthStatus, AutoShareCritical } from '../components/pieces-share-button';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, Send, Edit, Trash2, Eye, Users, Calendar, FileText, 
  Link, ExternalLink, Copy, Download, Share2, Plus, Search,
  Clock, CheckCircle, AlertCircle, RefreshCw, Globe, Zap
} from 'lucide-react';

interface Newsletter {
  id: string;
  subject: string;
  content: string;
  status: 'draft' | 'sent' | 'scheduled';
  sentAt?: string;
  recipientCount?: number;
  extractedArticles?: any[];
  sources?: { name: string; url: string }[];
  createdAt: string;
}

export default function NewsletterManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isCreating, setIsCreating] = useState(false);
  const [newNewsletter, setNewNewsletter] = useState({
    subject: '',
    content: '',
    status: 'draft' as const
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock Newsletter Data - In production würde dies von der API kommen
  const { data: newsletters = [], isLoading } = useQuery({
    queryKey: ['newsletters'],
    queryFn: async (): Promise<Newsletter[]> => {
      // Simuliere API-Aufruf
      return [
        {
          id: 'nl-001',
          subject: 'Weekly MedTech Regulatory Updates - KW 32',
          content: `# Helix Regulatory Intelligence Weekly

## 🚨 Kritische Updates diese Woche

**FDA 510(k) Clearances**
- CardioSense Monitoring System: Neue Herzüberwachungstechnologie zugelassen
- NeuroLink Implant V3: Erweiterte Gehirn-Computer-Schnittstelle genehmigt

**EU MDR Updates**
- Neue Klassifizierungsrichtlinien für KI-basierte Diagnostikgeräte
- Verlängerte Übergangsfristen für Klasse IIa Geräte

**Rechtsprechung**
- BGH-Urteil zur Produkthaftung bei KI-Medizinprodukten
- FDA vs. NeuraTech: $2.3M Strafe wegen unzureichender klinischer Daten

## 📊 Marktanalyse
Die regulatorische Landschaft zeigt verstärkte Fokussierung auf KI-Sicherheit und Interoperabilität...`,
          status: 'sent',
          sentAt: '2025-08-07T10:00:00Z',
          recipientCount: 847,
          extractedArticles: [
            { title: 'FDA 510(k) CardioSense Approval', type: 'regulatory' },
            { title: 'EU MDR AI Classification Guidelines', type: 'regulatory' },
            { title: 'BGH Medical AI Liability Ruling', type: 'legal' }
          ],
          sources: [
            { name: 'FDA Database', url: 'https://www.fda.gov/510k' },
            { name: 'EUR-Lex', url: 'https://eur-lex.europa.eu' }
          ],
          createdAt: '2025-08-05T14:30:00Z'
        },
        {
          id: 'nl-002',
          subject: 'Emergency Alert: Critical Device Recalls',
          content: `# 🚨 NOTFALL-NEWSLETTER - Sofortige Maßnahmen erforderlich

## Class I Recalls - Immediate Action Required

**MediCorp Insulin Pumps (Model X200-X250)**
- Recall-Nummer: Z-2024-003
- Betroffene Geräte: ca. 15.000 Einheiten weltweit
- Problem: Software-Fehler kann zu Überdosierung führen

**Sofortige Maßnahmen:**
1. Geräte sofort außer Betrieb nehmen
2. Patienten unverzüglich kontaktieren
3. Alternative Therapie einleiten

## Rechtliche Auswirkungen
- FDA verhängt $5.2M Strafe gegen MediCorp
- Zivilklagen bereits eingereicht
- EU-Marktüberwachung startet Untersuchung`,
          status: 'sent',
          sentAt: '2025-08-06T15:45:00Z',
          recipientCount: 1205,
          extractedArticles: [
            { title: 'MediCorp Insulin Pump Recall Class I', type: 'recall' },
            { title: 'FDA MediCorp Penalty $5.2M', type: 'enforcement' }
          ],
          sources: [
            { name: 'FDA Recalls', url: 'https://www.fda.gov/safety/recalls' },
            { name: 'EMA Safety Updates', url: 'https://www.ema.europa.eu' }
          ],
          createdAt: '2025-08-06T14:00:00Z'
        },
        {
          id: 'nl-003',
          subject: 'Draft: Quarterly Compliance Review Q3 2025',
          content: `# Quarterly MedTech Compliance Review - Q3 2025
## Draft Version - Internal Review

**Geplante Inhalte:**
- MDR Compliance Status Update
- FDA 510(k) Processing Times
- New ISO 14155:2025 Requirements
- AI/ML Validation Guidelines

**Status:** Wird überarbeitet
**Geplanter Versand:** 15. August 2025`,
          status: 'draft',
          recipientCount: 0,
          createdAt: '2025-08-07T09:15:00Z'
        }
      ];
    }
  });

  const createNewsletterMutation = useMutation({
    mutationFn: async (newsletter: Omit<Newsletter, 'id' | 'createdAt'>) => {
      const response = await fetch('/api/newsletters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newsletter)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create newsletter');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletters'] });
      setIsCreating(false);
      setNewNewsletter({ subject: '', content: '', status: 'draft' });
      toast({
        title: "✅ Newsletter erstellt",
        description: "Der neue Newsletter wurde erfolgreich erstellt.",
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Fehler",
        description: "Newsletter konnte nicht erstellt werden.",
        variant: "destructive",
      });
    }
  });

  const filteredNewsletters = newsletters.filter(newsletter => {
    const matchesSearch = newsletter.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         newsletter.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || newsletter.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Newsletter['status']) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Gesendet
        </Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
          <Edit className="w-3 h-3 mr-1" />
          Entwurf
        </Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
          <Clock className="w-3 h-3 mr-1" />
          Geplant
        </Badge>;
      default:
        return null;
    }
  };

  const copyNewsletterContent = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "✅ Kopiert",
        description: "Newsletter-Inhalt in Zwischenablage kopiert.",
      });
    } catch (error) {
      toast({
        title: "❌ Fehler",
        description: "Kopieren fehlgeschlagen.",
        variant: "destructive",
      });
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
            <Mail className="w-8 h-8" />
            Newsletter Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {filteredNewsletters.length} von {newsletters.length} Newslettern • Pieces-Integration aktiv
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <PiecesHealthStatus />
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Neuer Newsletter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Neuen Newsletter erstellen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Betreff</label>
                  <Input
                    value={newNewsletter.subject}
                    onChange={(e) => setNewNewsletter(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Newsletter-Betreff eingeben..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Inhalt</label>
                  <Textarea
                    value={newNewsletter.content}
                    onChange={(e) => setNewNewsletter(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Newsletter-Inhalt eingeben..."
                    rows={15}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={newNewsletter.status} onValueChange={(value: any) => setNewNewsletter(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Entwurf</SelectItem>
                      <SelectItem value="scheduled">Geplant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Abbrechen
                  </Button>
                  <Button 
                    onClick={() => createNewsletterMutation.mutate(newNewsletter)}
                    disabled={createNewsletterMutation.isPending || !newNewsletter.subject || !newNewsletter.content}
                  >
                    {createNewsletterMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Erstelle...
                      </>
                    ) : (
                      'Newsletter erstellen'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Auto-Share Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Pieces-Integration & Automatisches Teilen
          </CardTitle>
          <CardDescription>
            Teile wichtige Newsletter-Inhalte automatisch über Pieces API für Teamkollaboration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AutoShareCritical />
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Newsletter suchen..."
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
                <SelectItem value="draft">Entwürfe</SelectItem>
                <SelectItem value="scheduled">Geplant</SelectItem>
                <SelectItem value="sent">Gesendet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Newsletter List */}
      <div className="space-y-4">
        {filteredNewsletters.map((newsletter) => (
          <Card key={newsletter.id}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {newsletter.subject}
                    </h3>
                    {getStatusBadge(newsletter.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(newsletter.createdAt).toLocaleDateString('de-DE')}
                    </div>
                    {newsletter.recipientCount && newsletter.recipientCount > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {newsletter.recipientCount.toLocaleString()} Empfänger
                      </div>
                    )}
                    {newsletter.sentAt && (
                      <div className="flex items-center gap-1">
                        <Send className="w-4 h-4" />
                        Gesendet: {new Date(newsletter.sentAt).toLocaleString('de-DE')}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <PiecesShareButton 
                    type="newsletter"
                    itemId={newsletter.id}
                    title={newsletter.subject}
                    compact
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyNewsletterContent(newsletter.content)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="mx-4 mt-4">
                  <TabsTrigger value="preview">Vorschau</TabsTrigger>
                  <TabsTrigger value="content">Volltext</TabsTrigger>
                  <TabsTrigger value="articles">Extrahierte Artikel</TabsTrigger>
                  <TabsTrigger value="sources">Quellen</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="p-4">
                  <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                    <div className="prose dark:prose-invert max-w-none">
                      {newsletter.content.substring(0, 300)}...
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="p-4">
                  <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm">
                      {newsletter.content}
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="articles" className="p-4">
                  <div className="space-y-3">
                    {newsletter.extractedArticles?.length ? (
                      newsletter.extractedArticles.map((article, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded">
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{article.title}</span>
                            <Badge variant="outline">{article.type}</Badge>
                          </div>
                          <Button size="sm" variant="outline">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">Keine Artikel extrahiert</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="sources" className="p-4">
                  <div className="space-y-3">
                    {newsletter.sources?.length ? (
                      newsletter.sources.map((source, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded">
                          <div className="flex items-center gap-3">
                            <Globe className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">{source.name}</span>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => window.open(source.url, '_blank')}>
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">Keine Quellen definiert</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="analytics" className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">Öffnungsrate</h4>
                      <p className="text-2xl font-bold text-blue-600">{newsletter.status === 'sent' ? '73.2%' : 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h4 className="font-semibold text-green-900 dark:text-green-100">Click Rate</h4>
                      <p className="text-2xl font-bold text-green-600">{newsletter.status === 'sent' ? '12.8%' : 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100">Shares</h4>
                      <p className="text-2xl font-bold text-purple-600">{newsletter.status === 'sent' ? '34' : 'N/A'}</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNewsletters.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center">
              <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Keine Newsletter gefunden</h2>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedStatus !== 'all' 
                  ? 'Keine Newsletter entsprechen den aktuellen Filtern.' 
                  : 'Erstelle deinen ersten Newsletter.'}
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Newsletter erstellen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}