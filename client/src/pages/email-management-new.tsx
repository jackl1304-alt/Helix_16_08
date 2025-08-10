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
import { Settings, Mail, Send, Key, Users, Clock, AlertTriangle, CheckCircle, Edit, Trash, Plus, Server } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Gmail Provider Interface
interface GmailProvider {
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

// Gmail Template Interface
interface GmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'customer_onboarding' | 'customer_offboarding' | 'billing_reminder' | 'regulatory_alert' | 'weekly_digest' | 'trial_expiry';
  isActive: boolean;
  variables: string[];
}

// Email Statistics Interface
interface EmailStats {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  dailySent: number;
  weeklyDigestSubscribers: number;
  instantAlertSubscribers: number;
  lastSent: string;
}

export default function EmailManagementNew() {
  const [selectedTemplate, setSelectedTemplate] = useState<GmailTemplate | null>(null);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const queryClient = useQueryClient();

  // Gmail Provider Query
  const { data: providers = [], isLoading: providersLoading } = useQuery<GmailProvider[]>({
    queryKey: ['/api/email/providers']
  });

  // Gmail Templates Query
  const { data: templates = [], isLoading: templatesLoading } = useQuery<GmailTemplate[]>({
    queryKey: ['/api/email/templates']
  });

  // Email Statistics Query
  const { data: stats } = useQuery<EmailStats>({
    queryKey: ['/api/email/statistics']
  });

  // Test Gmail Connection Mutation
  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/email/test', { method: 'POST' });
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "✅ Gmail-Verbindung erfolgreich",
          description: "E-Mail-Provider funktioniert einwandfrei"
        });
      } else {
        toast({
          title: "❌ Gmail-Verbindung fehlgeschlagen", 
          description: data.message || "Verbindungsfehler"
        });
      }
    },
    onError: () => {
      toast({
        title: "❌ Test fehlgeschlagen",
        description: "Gmail benötigt App-Passwort für 2FA"
      });
    }
  });

  // Send Test Email Mutation
  const sendTestEmailMutation = useMutation({
    mutationFn: async ({ templateId, email }: { templateId: string; email: string }) => {
      return await apiRequest('/api/email/send', {
        method: 'POST',
        body: JSON.stringify({
          to: email,
          templateId,
          variables: {
            customerName: 'Test Kunde',
            alertTitle: 'Test Alert',
            summary: 'Dies ist ein Test',
            urgency: 'Mittel',
            dashboardUrl: 'https://helix-platform.com/dashboard'
          }
        })
      });
    },
    onSuccess: () => {
      toast({
        title: "✅ Test-E-Mail versendet",
        description: `E-Mail erfolgreich an ${testEmail} gesendet`
      });
      setTestEmail('');
    },
    onError: () => {
      toast({
        title: "❌ Versand fehlgeschlagen",
        description: "Fehler beim Versenden der Test-E-Mail"
      });
    }
  });

  const handleTestConnection = () => {
    testConnectionMutation.mutate();
  };

  const handleSendTestEmail = (templateId: string) => {
    if (!testEmail) {
      toast({
        title: "E-Mail-Adresse erforderlich",
        description: "Bitte geben Sie eine E-Mail-Adresse ein"
      });
      return;
    }
    sendTestEmailMutation.mutate({ templateId, email: testEmail });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Aktiv</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">App-Passwort benötigt</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Inaktiv</Badge>;
    }
  };

  if (providersLoading || templatesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Gmail-Integration wird geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">E-Mail-Verwaltung</h1>
          <p className="text-gray-600">Gmail-Integration für Kundenbenachrichtigungen</p>
        </div>
        <Button onClick={handleTestConnection} disabled={testConnectionMutation.isPending}>
          {testConnectionMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Teste...
            </>
          ) : (
            <>
              <Server className="w-4 h-4 mr-2" />
              Gmail testen
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="providers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="providers">E-Mail-Provider</TabsTrigger>
          <TabsTrigger value="templates">E-Mail-Templates</TabsTrigger>
          <TabsTrigger value="statistics">Statistiken</TabsTrigger>
        </TabsList>

        {/* Gmail Provider Tab */}
        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Gmail-Provider (deltawayshelixinfo@gmail.com)
              </CardTitle>
              <CardDescription>
                Gmail SMTP-Konfiguration für E-Mail-Versand
              </CardDescription>
            </CardHeader>
            <CardContent>
              {providers.length > 0 ? (
                <div className="space-y-4">
                  {providers.map((provider) => (
                    <div key={provider.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{provider.name}</h3>
                          <p className="text-sm text-gray-600">{provider.host}:{provider.port}</p>
                        </div>
                        {getStatusBadge(provider.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Benutzer:</span>
                          <p className="font-medium">{provider.user}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Tageslimit:</span>
                          <p className="font-medium">{provider.dailyLimit.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Heute versendet:</span>
                          <p className="font-medium">{provider.usedToday}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Sicherheit:</span>
                          <p className="font-medium">{provider.secure ? 'TLS/SSL' : 'STARTTLS'}</p>
                        </div>
                      </div>

                      {provider.status === 'error' && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start">
                            <AlertTriangle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-red-800">App-Passwort erforderlich</h4>
                              <p className="text-sm text-red-700 mt-1">
                                <strong>deltawayshelixinfo@gmail.com</strong> benötigt ein App-Passwort für die 2-Faktor-Authentifizierung.
                              </p>
                              <div className="mt-2 text-sm text-red-700">
                                <p><strong>Schritte:</strong></p>
                                <ol className="list-decimal list-inside mt-1 space-y-1">
                                  <li>Google-Konto → Sicherheit → 2-Faktor-Authentifizierung</li>
                                  <li>App-Passwörter generieren</li>
                                  <li>Neues App-Passwort für "Helix Email" erstellen</li>
                                  <li>16-stelliges Passwort in Server-Konfiguration einsetzen</li>
                                </ol>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Keine E-Mail-Provider konfiguriert.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gmail Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Edit className="w-5 h-5 mr-2" />
                E-Mail-Templates
              </CardTitle>
              <CardDescription>
                Professionelle E-Mail-Vorlagen für verschiedene Kundeninteraktionen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{template.name}</h3>
                        <p className="text-sm text-gray-600">{template.subject}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={template.isActive ? "default" : "secondary"}>
                          {template.isActive ? 'Aktiv' : 'Inaktiv'}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      <strong>Typ:</strong> {template.type.replace('_', ' ')}
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.variables.map((variable) => (
                        <Badge key={variable} variant="outline" className="text-xs">
                          {`{{${variable}}}`}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="test@example.com"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        size="sm"
                        onClick={() => handleSendTestEmail(template.id)}
                        disabled={sendTestEmailMutation.isPending}
                      >
                        {sendTestEmailMutation.isPending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Send className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Gesamt versendet</p>
                    <p className="text-2xl font-bold">{stats?.totalSent?.toLocaleString() || '0'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Zugestellt</p>
                    <p className="text-2xl font-bold">{stats?.totalDelivered?.toLocaleString() || '0'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Fehlgeschlagen</p>
                    <p className="text-2xl font-bold">{stats?.totalFailed?.toLocaleString() || '0'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Abonnenten</p>
                    <p className="text-2xl font-bold">{stats?.weeklyDigestSubscribers || '0'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>E-Mail-Übersicht</CardTitle>
              <CardDescription>Aktuelle Performance-Metriken</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Heute versendet:</span>
                  <span className="font-semibold">{stats?.dailySent || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Weekly Digest Abonnenten:</span>
                  <span className="font-semibold">{stats?.weeklyDigestSubscribers || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Instant Alert Abonnenten:</span>
                  <span className="font-semibold">{stats?.instantAlertSubscribers || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Letzte E-Mail versendet:</span>
                  <span className="font-semibold">
                    {stats?.lastSent ? new Date(stats.lastSent).toLocaleString('de-DE') : 'Nie'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}