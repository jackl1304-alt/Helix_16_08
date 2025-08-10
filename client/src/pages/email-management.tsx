import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Mail, Send, Key, Users, Clock, AlertTriangle, CheckCircle, Edit, Trash, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface EmailProvider {
  id: string;
  name: string;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  status: 'active' | 'inactive' | 'error';
  dailyLimit: number;
  usedToday: number;
  lastTest: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'regulatory_alert' | 'weekly_digest' | 'compliance_reminder' | 'welcome' | 'custom';
  isActive: boolean;
  recipients: number;
  lastSent: string;
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  templateId: string;
  isActive: boolean;
  conditions: string[];
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
  nextRun: string;
}

export default function EmailManagement() {
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const queryClient = useQueryClient();

  // Email Providers Query
  const { data: providers = [], isLoading: providersLoading } = useQuery({
    queryKey: ['/api/email/providers']
  });

  // Email Templates Query
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/email/templates']
  });

  // Automation Rules Query
  const { data: automationRules = [], isLoading: rulesLoading } = useQuery({
    queryKey: ['/api/email/automation-rules']
  });

  // Email Statistics Query
  const { data: stats } = useQuery({
    queryKey: ['/api/email/statistics']
  });

  // Provider Mutations
  const addProviderMutation = useMutation({
    mutationFn: (provider: any) => apiRequest('/api/email/providers', 'POST', provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email/providers'] });
      toast({ title: "Email-Provider hinzugefügt", description: "Die Konfiguration wurde gespeichert." });
    }
  });

  const testProviderMutation = useMutation({
    mutationFn: (providerId: string) => apiRequest(`/api/email/providers/${providerId}/test`, 'POST'),
    onSuccess: () => {
      toast({ title: "Test erfolgreich", description: "Email-Provider funktioniert korrekt." });
    },
    onError: () => {
      toast({ title: "Test fehlgeschlagen", description: "Email-Provider Verbindung fehlerhaft.", variant: "destructive" });
    }
  });

  // Template Mutations
  const saveTemplateMutation = useMutation({
    mutationFn: (template: any) => {
      const method = template.id ? 'PUT' : 'POST';
      const url = template.id ? `/api/email/templates/${template.id}` : '/api/email/templates';
      return apiRequest(url, method, template);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email/templates'] });
      setIsEditingTemplate(false);
      setSelectedTemplate(null);
      toast({ title: "Template gespeichert", description: "Email-Template wurde aktualisiert." });
    }
  });

  const sendTestEmailMutation = useMutation({
    mutationFn: ({ templateId, recipients }: { templateId: string; recipients: string }) => 
      apiRequest(`/api/email/templates/${templateId}/test`, 'POST', { recipients: recipients.split(',').map(email => email.trim()) }),
    onSuccess: () => {
      toast({ title: "Test-Email versendet", description: "Die Test-Email wurde erfolgreich verschickt." });
    }
  });

  // Automation Mutations
  const saveAutomationMutation = useMutation({
    mutationFn: (rule: any) => {
      const method = rule.id ? 'PUT' : 'POST';
      const url = rule.id ? `/api/email/automation/${rule.id}` : '/api/email/automation';
      return apiRequest(url, method, rule);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email/automation-rules'] });
      toast({ title: "Automation gespeichert", description: "Email-Automatisierung wurde konfiguriert." });
    }
  });

  const ProviderForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      host: '',
      port: 587,
      secure: true,
      user: '',
      password: '',
      dailyLimit: 1000
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      addProviderMutation.mutate(formData);
      setFormData({ name: '', host: '', port: 587, secure: true, user: '', password: '', dailyLimit: 1000 });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Provider Name</Label>
            <Input 
              id="name" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="SendGrid, Mailgun, SMTP..."
              required
            />
          </div>
          <div>
            <Label htmlFor="host">SMTP Host</Label>
            <Input 
              id="host" 
              value={formData.host}
              onChange={(e) => setFormData({...formData, host: e.target.value})}
              placeholder="smtp.sendgrid.net"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="port">Port</Label>
            <Input 
              id="port" 
              type="number"
              value={formData.port}
              onChange={(e) => setFormData({...formData, port: parseInt(e.target.value)})}
            />
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <Switch 
              id="secure"
              checked={formData.secure}
              onCheckedChange={(checked) => setFormData({...formData, secure: checked})}
            />
            <Label htmlFor="secure">SSL/TLS</Label>
          </div>
          <div>
            <Label htmlFor="dailyLimit">Tägliches Limit</Label>
            <Input 
              id="dailyLimit" 
              type="number"
              value={formData.dailyLimit}
              onChange={(e) => setFormData({...formData, dailyLimit: parseInt(e.target.value)})}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="user">Benutzername</Label>
            <Input 
              id="user" 
              value={formData.user}
              onChange={(e) => setFormData({...formData, user: e.target.value})}
              placeholder="apikey oder email"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Passwort/API Key</Label>
            <Input 
              id="password" 
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
        </div>

        <Button type="submit" disabled={addProviderMutation.isPending}>
          <Plus className="w-4 h-4 mr-2" />
          Provider hinzufügen
        </Button>
      </form>
    );
  };

  const TemplateEditor = () => {
    const [templateData, setTemplateData] = useState({
      name: selectedTemplate?.name || '',
      subject: selectedTemplate?.subject || '',
      content: selectedTemplate?.content || '',
      type: selectedTemplate?.type || 'custom',
      isActive: selectedTemplate?.isActive || true
    });

    const [testRecipients, setTestRecipients] = useState('');

    const handleSave = () => {
      saveTemplateMutation.mutate({
        ...templateData,
        id: selectedTemplate?.id
      });
    };

    const handleTestSend = () => {
      if (selectedTemplate && testRecipients) {
        sendTestEmailMutation.mutate({
          templateId: selectedTemplate.id,
          recipients: testRecipients
        });
      }
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="templateName">Template Name</Label>
            <Input 
              id="templateName"
              value={templateData.name}
              onChange={(e) => setTemplateData({...templateData, name: e.target.value})}
              placeholder="Compliance Alert Template"
            />
          </div>
          <div>
            <Label htmlFor="templateType">Typ</Label>
            <Select value={templateData.type} onValueChange={(value) => setTemplateData({...templateData, type: value as any})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regulatory_alert">Regulatory Alert</SelectItem>
                <SelectItem value="weekly_digest">Weekly Digest</SelectItem>
                <SelectItem value="compliance_reminder">Compliance Reminder</SelectItem>
                <SelectItem value="welcome">Welcome Email</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="subject">Betreff</Label>
          <Input 
            id="subject"
            value={templateData.subject}
            onChange={(e) => setTemplateData({...templateData, subject: e.target.value})}
            placeholder="{{companyName}} - Neue Regulatory Updates verfügbar"
          />
        </div>

        <div>
          <Label htmlFor="content">Email Content (HTML)</Label>
          <Textarea 
            id="content"
            value={templateData.content}
            onChange={(e) => setTemplateData({...templateData, content: e.target.value})}
            rows={10}
            placeholder="<h1>Hallo {{customerName}},</h1><p>Neue Updates verfügbar...</p>"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch 
            checked={templateData.isActive}
            onCheckedChange={(checked) => setTemplateData({...templateData, isActive: checked})}
          />
          <Label>Template aktiv</Label>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saveTemplateMutation.isPending}>
            Template speichern
          </Button>
          
          <div className="flex gap-2 ml-auto">
            <Input 
              placeholder="test@example.com, test2@example.com"
              value={testRecipients}
              onChange={(e) => setTestRecipients(e.target.value)}
              className="w-64"
            />
            <Button 
              variant="outline" 
              onClick={handleTestSend}
              disabled={!testRecipients || sendTestEmailMutation.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              Test senden
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email-Verwaltung</h1>
          <p className="text-muted-foreground">
            Konfiguration von Email-Providern, Templates und Automatisierungen
          </p>
        </div>
        
        {stats && (
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{(stats as any).emailsSentToday || 0}</div>
              <div className="text-sm text-muted-foreground">Heute versendet</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{(stats as any).activeTemplates || 0}</div>
              <div className="text-sm text-muted-foreground">Aktive Templates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{(stats as any).automationRules || 0}</div>
              <div className="text-sm text-muted-foreground">Automationen</div>
            </div>
          </div>
        )}
      </div>

      <Tabs defaultValue="providers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="providers" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Provider
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email-Provider hinzufügen</CardTitle>
              <CardDescription>
                Konfigurieren Sie SMTP-Provider wie SendGrid, Mailgun oder eigene Server
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProviderForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Konfigurierte Provider</CardTitle>
            </CardHeader>
            <CardContent>
              {providersLoading ? (
                <div>Lade Provider...</div>
              ) : (
                <div className="space-y-4">
                  {(providers as EmailProvider[]).map((provider: EmailProvider) => (
                    <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Key className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="font-semibold">{provider.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {provider.host}:{provider.port} ({provider.user})
                            </div>
                          </div>
                        </div>
                        
                        <Badge variant={provider.status === 'active' ? 'default' : 'destructive'}>
                          {provider.status === 'active' ? 'Aktiv' : 'Fehler'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {provider.usedToday}/{provider.dailyLimit}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Heute versendet
                          </div>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => testProviderMutation.mutate(provider.id)}
                          disabled={testProviderMutation.isPending}
                        >
                          Testen
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>
                  Verwalten Sie Templates für automatische Benachrichtigungen
                </CardDescription>
              </CardHeader>
              <CardContent>
                {templatesLoading ? (
                  <div>Lade Templates...</div>
                ) : (
                  <div className="space-y-3">
                    {(templates as EmailTemplate[]).map((template: EmailTemplate) => (
                      <div 
                        key={template.id} 
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedTemplate?.id === template.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-muted-foreground">{template.subject}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={template.isActive ? 'default' : 'secondary'}>
                              {template.isActive ? 'Aktiv' : 'Inaktiv'}
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTemplate(template);
                                setIsEditingTemplate(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setSelectedTemplate(null);
                        setIsEditingTemplate(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Neues Template
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {(selectedTemplate || isEditingTemplate) && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedTemplate ? 'Template bearbeiten' : 'Neues Template'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TemplateEditor />
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email-Automatisierung</CardTitle>
              <CardDescription>
                Automatische Email-Versendung basierend auf Ereignissen und Zeitplänen
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rulesLoading ? (
                <div>Lade Automation Rules...</div>
              ) : (
                <div className="space-y-4">
                  {(automationRules as AutomationRule[]).map((rule: AutomationRule) => (
                    <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-semibold">{rule.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Trigger: {rule.trigger} | Frequenz: {rule.frequency}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Nächster Lauf: {rule.nextRun}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                          {rule.isActive ? 'Aktiv' : 'Pausiert'}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Neue Automation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emails heute</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(stats as any)?.emailsSentToday || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +12% gegenüber gestern
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Öffnungsrate</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">68.2%</div>
                <p className="text-xs text-muted-foreground">
                  +2.1% gegenüber letzter Woche
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Klickrate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24.8%</div>
                <p className="text-xs text-muted-foreground">
                  +4.3% gegenüber letzter Woche
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}