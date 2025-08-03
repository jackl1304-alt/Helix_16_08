import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Mail, 
  Plus, 
  Edit, 
  Trash2, 
  Key, 
  Globe, 
  Settings,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Newsletter {
  id: string;
  title: string;
  description: string;
  publishedDate: string;
  author: string;
  sourceUrl: string;
}

interface NewsletterSource {
  id: string;
  name: string;
  url: string;
  description: string;
  category: 'industry_newsletter' | 'regulatory_newsletter';
  region: string;
  language: string;
  priority: 'high' | 'medium' | 'low';
  requiresAuth: boolean;
  credentials?: {
    email?: string;
    password?: string;
    apiKey?: string;
    subscriptionId?: string;
  };
  rssUrl?: string;
  status: 'active' | 'inactive' | 'pending';
  lastSync?: string;
}

export default function NewsletterAdminPage() {
  const [selectedSource, setSelectedSource] = useState<NewsletterSource | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<NewsletterSource>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Erweiterte authentische Newsletter-Quellen mit Login-Anforderungen
  const predefinedSources: Partial<NewsletterSource>[] = [
    {
      name: "MedTech Dive",
      url: "https://www.medtechdive.com/",
      description: "Tägliche Nachrichten und Analysen für Fachkräfte der Medizintechnik-Branche",
      category: "industry_newsletter",
      region: "Global",
      language: "en",
      priority: "high",
      requiresAuth: true,
      rssUrl: "https://www.medtechdive.com/feeds/news/",
      status: "pending"
    },
    {
      name: "MedTech Europe Monthly",
      url: "https://www.medtecheurope.org/medtech-views/newsletters/",
      description: "Monatliche Newsletter mit umfassender Berichterstattung über den Medizintechniksektor",
      category: "regulatory_newsletter",
      region: "Europe",
      language: "en",
      priority: "high",
      requiresAuth: true,
      status: "pending"
    },
    {
      name: "Citeline Medtech Insight",
      url: "https://insights.citeline.com/medtech-insight/",
      description: "Globale Medtech-Nachrichten und Einblicke - Premium Content",
      category: "industry_newsletter",
      region: "Global",
      language: "en",
      priority: "high",
      requiresAuth: true,
      status: "pending"
    },
    {
      name: "MedTech World News",
      url: "https://med-tech.world/news/",
      description: "Aktuelle Nachrichten, Fortschritte, Veranstaltungen und Einblicke in die Medizintechnik",
      category: "industry_newsletter",
      region: "Global",
      language: "en",
      priority: "medium",
      requiresAuth: false,
      rssUrl: "https://med-tech.world/feed/",
      status: "active"
    },
    {
      name: "EY MedTech Pulse Reports",
      url: "https://www.ey.com/en_us/life-sciences/pulse-of-medtech-industry-outlook",
      description: "Jährliche Branchenberichte und Trends der MedTech-Industrie",
      category: "industry_newsletter",
      region: "Global",
      language: "en",
      priority: "high",
      requiresAuth: true,
      status: "pending"
    },
    {
      name: "Deloitte MedTech Insights",
      url: "https://www2.deloitte.com/us/en/pages/life-sciences-and-health-care/articles/medtech-industry-trends.html",
      description: "Strategische Einblicke und Trends der MedTech-Branche",
      category: "industry_newsletter",
      region: "Global",
      language: "en",
      priority: "high",
      requiresAuth: true,
      status: "pending"
    },
    {
      name: "WHO Medical Device Updates",
      url: "https://apps.who.int/iris/handle/10665/42744",
      description: "Globale Richtlinien und Regulierung von Medizinprodukten",
      category: "regulatory_newsletter",
      region: "Global",
      language: "en",
      priority: "high",
      requiresAuth: false,
      rssUrl: "https://www.who.int/rss-feeds/news-releases",
      status: "active"
    },
    {
      name: "Medical Design & Outsourcing",
      url: "https://www.medicaldesignandoutsourcing.com/",
      description: "Medizinprodukt-Design und Fertigung News",
      category: "industry_newsletter",
      region: "Global",
      language: "en",
      priority: "medium",
      requiresAuth: true,
      status: "pending"
    },
    {
      name: "MedDevice Online",
      url: "https://www.meddeviceonline.com/",
      description: "Medizinprodukt-Nachrichten und Technologie-Updates",
      category: "industry_newsletter",
      region: "Global",
      language: "en",
      priority: "medium",
      requiresAuth: true,
      status: "pending"
    },
    {
      name: "Regulatory Affairs Professionals Society (RAPS)",
      url: "https://www.raps.org/",
      description: "Regulatory Affairs News und Best Practices",
      category: "regulatory_newsletter",
      region: "Global",
      language: "en",
      priority: "high",
      requiresAuth: true,
      status: "pending"
    }
  ];

  // Newsletter-Quellen laden
  const { data: sources = [], isLoading } = useQuery({
    queryKey: ['/api/newsletter/sources'],
  });

  // Newsletter-Quelle hinzufügen/aktualisieren
  const saveSourceMutation = useMutation({
    mutationFn: (sourceData: Partial<NewsletterSource>) => 
      fetch('/api/newsletter/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sourceData)
      }).then(res => res.json()),
    onSuccess: () => {
      toast({
        title: "Newsletter-Quelle gespeichert",
        description: "Die Quelle wurde erfolgreich hinzugefügt/aktualisiert.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/newsletter/sources'] });
      setIsDialogOpen(false);
      setFormData({});
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Die Newsletter-Quelle konnte nicht gespeichert werden.",
        variant: "destructive"
      });
    }
  });

  // Newsletter-Quelle löschen
  const deleteSourceMutation = useMutation({
    mutationFn: (id: string) => 
      fetch(`/api/newsletter/sources/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({
        title: "Newsletter-Quelle gelöscht",
        description: "Die Quelle wurde erfolgreich entfernt.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/newsletter/sources'] });
    }
  });

  // Newsletter-Test
  const testSourceMutation = useMutation({
    mutationFn: (id: string) => 
      fetch(`/api/newsletter/sources/${id}/test`, { method: 'POST' }).then(res => res.json()),
    onSuccess: (data) => {
      toast({
        title: "Test erfolgreich",
        description: `Verbindung zur Newsletter-Quelle erfolgreich. ${data.articlesFound || 0} Artikel gefunden.`,
      });
    },
    onError: () => {
      toast({
        title: "Test fehlgeschlagen",
        description: "Verbindung zur Newsletter-Quelle konnte nicht hergestellt werden.",
        variant: "destructive"
      });
    }
  });

  const handleAddPredefined = (source: Partial<NewsletterSource>) => {
    setFormData(source);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.url) {
      toast({
        title: "Fehler",
        description: "Name und URL sind erforderlich.",
        variant: "destructive"
      });
      return;
    }
    
    saveSourceMutation.mutate(formData);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            📧 Newsletter Administration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Verwalten Sie authentische Newsletter-Quellen für die Wissensdatenbank
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#d95d2c] hover:bg-[#b8441f]">
              <Plus className="h-4 w-4 mr-2" />
              Neue Quelle hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Newsletter-Quelle konfigurieren</DialogTitle>
              <DialogDescription>
                Fügen Sie eine neue authentische Newsletter-Quelle hinzu oder bearbeiten Sie eine bestehende.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="z.B. MedTech Dive"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Kategorie</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kategorie wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="industry_newsletter">Branchen-Newsletter</SelectItem>
                      <SelectItem value="regulatory_newsletter">Regulatory Newsletter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="url">Website URL</Label>
                <Input
                  id="url"
                  value={formData.url || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://www.medtechdive.com/"
                />
              </div>

              <div>
                <Label htmlFor="rssUrl">RSS Feed URL (optional)</Label>
                <Input
                  id="rssUrl"
                  value={formData.rssUrl || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, rssUrl: e.target.value }))}
                  placeholder="https://www.medtechdive.com/feeds/news/"
                />
              </div>

              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Beschreibung der Newsletter-Quelle..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="region">Region</Label>
                  <Select 
                    value={formData.region} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Global">Global</SelectItem>
                      <SelectItem value="Europe">Europa</SelectItem>
                      <SelectItem value="USA">USA</SelectItem>
                      <SelectItem value="Germany">Deutschland</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Sprache</Label>
                  <Select 
                    value={formData.language} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sprache" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priorität</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Priorität" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Hoch</SelectItem>
                      <SelectItem value="medium">Mittel</SelectItem>
                      <SelectItem value="low">Niedrig</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.requiresAuth && (
                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Anmeldedaten (optional)
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">E-Mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.credentials?.email || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          credentials: { ...prev.credentials, email: e.target.value }
                        }))}
                        placeholder="newsletter@beispiel.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Passwort</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.credentials?.password || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          credentials: { ...prev.credentials, password: e.target.value }
                        }))}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="apiKey">API-Schlüssel (falls vorhanden)</Label>
                    <Input
                      id="apiKey"
                      value={formData.credentials?.apiKey || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        credentials: { ...prev.credentials, apiKey: e.target.value }
                      }))}
                      placeholder="api_key_here..."
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={saveSourceMutation.isPending}
                className="bg-[#d95d2c] hover:bg-[#b8441f]"
              >
                Speichern
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vordefinierte Quellen */}
      <Card>
        <CardHeader>
          <CardTitle>Authentische Newsletter-Quellen</CardTitle>
          <CardDescription>
            Empfohlene MedTech-Newsletter für die Wissensdatenbank
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {predefinedSources.map((source, index) => (
              <Card key={index} className="border-l-4 border-l-[#d95d2c]">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{source.name}</CardTitle>
                    <Badge variant={source.priority === 'high' ? 'destructive' : 'secondary'}>
                      {source.priority === 'high' ? 'Hoch' : 'Mittel'}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {source.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Globe className="h-3 w-3" />
                      {source.region} • {source.language?.toUpperCase()}
                      {source.requiresAuth && <Key className="h-3 w-3 ml-2 text-orange-500" />}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(source.url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleAddPredefined(source)}
                        className="bg-[#d95d2c] hover:bg-[#b8441f]"
                      >
                        Hinzufügen
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Konfigurierte Quellen */}
      <Card>
        <CardHeader>
          <CardTitle>Konfigurierte Newsletter-Quellen ({sources.length})</CardTitle>
          <CardDescription>
            Verwalten Sie Ihre aktiven Newsletter-Abonnements und Anmeldedaten
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              Lade Newsletter-Quellen...
            </div>
          ) : sources.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Noch keine Newsletter-Quellen konfiguriert.
              Fügen Sie eine der empfohlenen Quellen hinzu.
            </div>
          ) : (
            <div className="space-y-4">
              {sources.map((source: NewsletterSource) => (
                <Card key={source.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{source.name}</h3>
                          <Badge variant={source.status === 'active' ? 'default' : 'secondary'}>
                            {source.status === 'active' ? (
                              <><CheckCircle className="h-3 w-3 mr-1" />Aktiv</>
                            ) : (
                              <><AlertCircle className="h-3 w-3 mr-1" />Inaktiv</>
                            )}
                          </Badge>
                          {source.requiresAuth && (
                            <Badge variant="outline">
                              <Key className="h-3 w-3 mr-1" />
                              Anmeldung erforderlich
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{source.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{source.region}</span>
                          <span>{source.category}</span>
                          {source.lastSync && (
                            <span>Letzte Sync: {new Date(source.lastSync).toLocaleDateString('de-DE')}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => testSourceMutation.mutate(source.id)}
                          disabled={testSourceMutation.isPending}
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Test
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setFormData(source);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteSourceMutation.mutate(source.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
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
  );
}