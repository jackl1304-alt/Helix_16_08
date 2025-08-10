import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { 
  Settings,
  Bell,
  Shield,
  CreditCard,
  Cog,
  User,
  Globe,
  Mail,
  Phone,
  Building,
  AlertTriangle,
  CheckCircle,
  Crown,
  Key,
  Lock,
  Eye,
  EyeOff,
  Save,
  Trash2,
  Plus,
  Edit,
  Download
} from "lucide-react";
import BillingManagement from "@/components/tenant/billing-management";
import UsageAnalytics from "@/components/tenant/usage-analytics";

// Mock tenant data - In production, get from authentication context
const mockTenant = {
  id: "tenant_abc123",
  name: "MedTech Solutions GmbH",
  slug: "medtech-solutions",
  subscriptionPlan: "professional" as const,
  subscriptionStatus: "active" as const
};

export default function CustomerSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  // Fetch tenant settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/customer/settings', mockTenant.id],
    queryFn: async () => {
      return {
        general: {
          companyName: "MedTech Solutions GmbH",
          industry: "Medizintechnik",
          companySize: "51-200",
          website: "https://medtech-solutions.com",
          description: "Führender Anbieter von innovativen Medizintechnik-Lösungen mit Fokus auf Regulatory Compliance.",
          address: {
            street: "Technologiestraße 15",
            city: "München",
            postal: "80331",
            country: "Deutschland"
          },
          contact: {
            name: "Dr. Sarah Weber",
            email: "admin@medtech-solutions.com",
            phone: "+49 89 123456789",
            role: "Chief Regulatory Officer"
          }
        },
        notifications: {
          email: {
            regulatoryUpdates: true,
            criticalAlerts: true,
            weeklyDigest: true,
            billingNotifications: true,
            systemMaintenance: false,
            marketingEmails: false
          },
          slack: {
            enabled: false,
            webhookUrl: "",
            channels: {
              alerts: "#regulatory-alerts",
              updates: "#helix-updates"
            }
          },
          sms: {
            enabled: true,
            phoneNumber: "+49 89 123456789",
            criticalOnly: true
          }
        },
        security: {
          twoFactorEnabled: true,
          sessionTimeout: 480, // minutes
          ipWhitelist: ["192.168.1.0/24", "10.0.0.0/8"],
          apiKeys: [
            { id: "key_1", name: "Production API", created: "2025-01-15", lastUsed: "2025-08-10" },
            { id: "key_2", name: "Development API", created: "2025-03-22", lastUsed: "2025-08-09" }
          ],
          auditLog: true,
          passwordPolicy: {
            minLength: 12,
            requireUppercase: true,
            requireNumbers: true,
            requireSpecialChars: true
          }
        },
        advanced: {
          dataRetention: 730, // days
          customBranding: {
            enabled: true,
            logo: null,
            primaryColor: "#3B82F6",
            accentColor: "#8B5CF6"
          },
          integrations: {
            webhook: {
              enabled: true,
              url: "https://api.medtech-solutions.com/helix-webhook",
              events: ["regulatory_update", "compliance_alert"]
            },
            sso: {
              enabled: false,
              provider: null
            }
          },
          regions: ["US", "EU", "Asia-Pacific"],
          dataExport: {
            format: "json",
            frequency: "weekly"
          }
        }
      };
    }
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async ({ section, data }: { section: string; data: any }) => {
      // In production: await apiRequest(`/api/customer/settings/${mockTenant.id}`, 'PUT', { section, data })
      await new Promise(resolve => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customer/settings'] });
      toast({
        title: "Einstellungen gespeichert",
        description: "Ihre Änderungen wurden erfolgreich übernommen.",
      });
    }
  });

  const saveSettings = (section: string, data: any) => {
    updateSettingsMutation.mutate({ section, data });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-8 max-w-7xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Tenant Einstellungen
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                {mockTenant.name.charAt(0)}
              </div>
              <span className="font-medium">{mockTenant.name}</span>
            </div>
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
              <Crown className="w-3 h-3 mr-1" />
              Professional Plan
            </Badge>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Allgemein
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Benachrichtigungen
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Sicherheit
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Abrechnung
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Cog className="h-4 w-4" />
            Erweitert
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Unternehmensinformationen
              </CardTitle>
              <CardDescription>
                Grundlegende Informationen über Ihr Unternehmen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Firmenname</Label>
                  <Input 
                    id="companyName" 
                    defaultValue={settings?.general.companyName}
                    placeholder="Ihre Firma GmbH" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Branche</Label>
                  <Select defaultValue={settings?.general.industry}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Medizintechnik">Medizintechnik</SelectItem>
                      <SelectItem value="Pharma">Pharma</SelectItem>
                      <SelectItem value="Biotechnologie">Biotechnologie</SelectItem>
                      <SelectItem value="Regulatory Consulting">Regulatory Consulting</SelectItem>
                      <SelectItem value="Other">Sonstiges</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companySize">Unternehmensgröße</Label>
                  <Select defaultValue={settings?.general.companySize}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 Mitarbeiter</SelectItem>
                      <SelectItem value="11-50">11-50 Mitarbeiter</SelectItem>
                      <SelectItem value="51-200">51-200 Mitarbeiter</SelectItem>
                      <SelectItem value="201-1000">201-1000 Mitarbeiter</SelectItem>
                      <SelectItem value="1000+">1000+ Mitarbeiter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website" 
                    type="url" 
                    defaultValue={settings?.general.website}
                    placeholder="https://ihre-website.com" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Unternehmensbeschreibung</Label>
                <Textarea 
                  id="description" 
                  defaultValue={settings?.general.description}
                  placeholder="Beschreiben Sie Ihr Unternehmen und Ihre Tätigkeit..."
                  className="min-h-[100px]"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Adresse</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="street">Straße & Hausnummer</Label>
                    <Input 
                      id="street" 
                      defaultValue={settings?.general.address.street}
                      placeholder="Musterstraße 123" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Stadt</Label>
                    <Input 
                      id="city" 
                      defaultValue={settings?.general.address.city}
                      placeholder="München" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal">Postleitzahl</Label>
                    <Input 
                      id="postal" 
                      defaultValue={settings?.general.address.postal}
                      placeholder="80331" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Land</Label>
                    <Select defaultValue={settings?.general.address.country}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Deutschland">Deutschland</SelectItem>
                        <SelectItem value="Österreich">Österreich</SelectItem>
                        <SelectItem value="Schweiz">Schweiz</SelectItem>
                        <SelectItem value="USA">USA</SelectItem>
                        <SelectItem value="Other">Sonstiges</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Hauptansprechpartner</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Name</Label>
                    <Input 
                      id="contactName" 
                      defaultValue={settings?.general.contact.name}
                      placeholder="Max Mustermann" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactRole">Position</Label>
                    <Input 
                      id="contactRole" 
                      defaultValue={settings?.general.contact.role}
                      placeholder="Chief Regulatory Officer" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">E-Mail</Label>
                    <Input 
                      id="contactEmail" 
                      type="email"
                      defaultValue={settings?.general.contact.email}
                      placeholder="max@unternehmen.com" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Telefon</Label>
                    <Input 
                      id="contactPhone" 
                      type="tel"
                      defaultValue={settings?.general.contact.phone}
                      placeholder="+49 89 123456789" 
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => saveSettings('general', settings?.general)}
                  disabled={updateSettingsMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateSettingsMutation.isPending ? 'Speichern...' : 'Änderungen speichern'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                E-Mail Benachrichtigungen
              </CardTitle>
              <CardDescription>
                Wählen Sie aus, welche E-Mails Sie erhalten möchten
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'regulatoryUpdates', label: 'Regulatory Updates', desc: 'Wichtige regulatorische Änderungen und neue Zulassungen' },
                { key: 'criticalAlerts', label: 'Kritische Warnungen', desc: 'Sofortige Benachrichtigung bei kritischen Compliance-Issues' },
                { key: 'weeklyDigest', label: 'Wöchentliche Zusammenfassung', desc: 'Übersicht über alle Updates der Woche' },
                { key: 'billingNotifications', label: 'Rechnungs-Benachrichtigungen', desc: 'Informationen zu Zahlungen und Abonnements' },
                { key: 'systemMaintenance', label: 'System-Wartung', desc: 'Benachrichtigungen über geplante Wartungsarbeiten' },
                { key: 'marketingEmails', label: 'Marketing E-Mails', desc: 'Newsletter und Produktupdates' }
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-sm text-muted-foreground">{item.desc}</div>
                  </div>
                  <Switch 
                    defaultChecked={settings?.notifications.email[item.key]}
                    onCheckedChange={(checked) => {
                      // Update local state and save
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                SMS Benachrichtigungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">SMS aktiviert</div>
                  <div className="text-sm text-muted-foreground">SMS für kritische Warnungen</div>
                </div>
                <Switch defaultChecked={settings?.notifications.sms.enabled} />
              </div>
              {settings?.notifications.sms.enabled && (
                <div className="space-y-2">
                  <Label htmlFor="smsPhone">Telefonnummer</Label>
                  <Input 
                    id="smsPhone" 
                    type="tel"
                    defaultValue={settings?.notifications.sms.phoneNumber}
                    placeholder="+49 89 123456789" 
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Anmeldesicherheit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Zwei-Faktor-Authentifizierung</div>
                  <div className="text-sm text-muted-foreground">Zusätzliche Sicherheit für Ihr Konto</div>
                </div>
                <div className="flex items-center gap-2">
                  {settings?.security.twoFactorEnabled && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Aktiviert
                    </Badge>
                  )}
                  <Switch defaultChecked={settings?.security.twoFactorEnabled} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (Minuten)</Label>
                <Input 
                  id="sessionTimeout" 
                  type="number"
                  defaultValue={settings?.security.sessionTimeout}
                  min={30}
                  max={1440}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-lg font-semibold">IP Whitelist</h4>
                <div className="space-y-2">
                  {settings?.security.ipWhitelist?.map((ip, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <code className="text-sm">{ip}</code>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    IP-Adresse hinzufügen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Schlüssel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {settings?.security.apiKeys?.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{key.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Erstellt: {key.created} • Zuletzt verwendet: {key.lastUsed}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Neuen API-Schlüssel erstellen
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing" className="space-y-6">
          <BillingManagement tenantId={mockTenant.id} />
        </TabsContent>

        {/* Advanced */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Regionale Einstellungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label>Aktive Regionen</Label>
                <div className="grid gap-2 md:grid-cols-3">
                  {['US', 'EU', 'Asia-Pacific', 'Canada', 'Australia', 'Brazil'].map(region => (
                    <div key={region} className="flex items-center space-x-2">
                      <Switch 
                        id={region}
                        defaultChecked={settings?.advanced.regions?.includes(region)}
                      />
                      <Label htmlFor={region}>{region}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Datenexport
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="exportFormat">Exportformat</Label>
                  <Select defaultValue={settings?.advanced.dataExport.format}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="xlsx">Excel</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exportFreq">Häufigkeit</Label>
                  <Select defaultValue={settings?.advanced.dataExport.frequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Täglich</SelectItem>
                      <SelectItem value="weekly">Wöchentlich</SelectItem>
                      <SelectItem value="monthly">Monatlich</SelectItem>
                      <SelectItem value="manual">Manuell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Sofortiger Export
              </Button>
            </CardContent>
          </Card>

          {/* Usage Analytics */}
          <UsageAnalytics tenantId={mockTenant.id} />

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Gefährlicher Bereich
              </CardTitle>
              <CardDescription>
                Diese Aktionen können nicht rückgängig gemacht werden.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Tenant löschen
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tenant unwiderruflich löschen</DialogTitle>
                    <DialogDescription>
                      Diese Aktion kann nicht rückgängig gemacht werden. Alle Daten werden permanent gelöscht.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-800 mb-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">Was wird gelöscht:</span>
                      </div>
                      <ul className="text-sm text-red-700 space-y-1 ml-6">
                        <li>• Alle Tenant-Daten und Einstellungen</li>
                        <li>• Alle Benutzerkonten</li>
                        <li>• Gesamte Nutzungshistorie</li>
                        <li>• API-Schlüssel und Integrationen</li>
                      </ul>
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                        Abbrechen
                      </Button>
                      <Button variant="destructive">
                        Endgültig löschen
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}