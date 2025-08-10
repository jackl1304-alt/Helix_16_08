import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { 
  Settings,
  User,
  Bell,
  Shield,
  CreditCard,
  Users,
  Globe,
  Database,
  Palette,
  Save,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Activity,
  BarChart3,
  Target,
  Zap
} from "lucide-react";

// Mock tenant data - In production, get from authentication context
const mockTenant = {
  id: "tenant_abc123",
  name: "MedTech Solutions GmbH",
  slug: "medtech-solutions",
  subscriptionPlan: "professional" as const,
  subscriptionStatus: "active" as const,
  settings: {
    theme: "light",
    language: "de",
    notifications: true,
    autoSync: true,
    emailAlerts: true,
    dataRetention: "12months",
    apiAccess: true,
    customBranding: true,
    timezone: "Europe/Berlin"
  },
  limits: {
    users: { current: 12, max: 25 },
    dataAccess: { currentUsage: 1247, monthlyLimit: 2500 },
    features: { apiAccess: true, customBranding: true, whiteLabel: false }
  }
};

export default function CustomerSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState(mockTenant.settings);
  const [showApiKey, setShowApiKey] = useState(false);

  // Fetch current settings
  const { data: currentSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/customer/settings', mockTenant.id],
    queryFn: async () => {
      // In production: await fetch(`/api/customer/settings/${tenantId}`)
      return mockTenant.settings;
    }
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: typeof settings) => {
      // In production: await apiRequest(`/api/customer/settings/${tenantId}`, 'PUT', newSettings)
      await new Promise(resolve => setTimeout(resolve, 1000));
      return newSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customer/settings'] });
      toast({
        title: "Einstellungen gespeichert",
        description: "Ihre Änderungen wurden erfolgreich übernommen.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  });

  const handleSettingsChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    updateSettingsMutation.mutate(settings);
  };

  const SettingsCard = ({ title, description, children, icon: Icon }) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );

  const FeatureToggle = ({ label, description, enabled, onToggle, disabled = false }) => (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label className={disabled ? "text-muted-foreground" : ""}>{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={onToggle}
        disabled={disabled}
      />
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Kontoeinstellungen
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Verwalten Sie Ihre Konto- und Plattformeinstellungen
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={updateSettingsMutation.isPending}
          className="min-w-[120px]"
        >
          {updateSettingsMutation.isPending ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Speichern
        </Button>
      </div>

      {/* Account Info Banner */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-700 rounded-xl text-white font-bold text-lg">
                {mockTenant.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {mockTenant.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
                    Professional Plan
                  </Badge>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Aktiv
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Tenant ID</p>
              <code className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                {mockTenant.id}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">Allgemein</TabsTrigger>
          <TabsTrigger value="notifications">Benachrichtigungen</TabsTrigger>
          <TabsTrigger value="security">Sicherheit</TabsTrigger>
          <TabsTrigger value="billing">Abrechnung</TabsTrigger>
          <TabsTrigger value="advanced">Erweitert</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <SettingsCard 
            title="Grundeinstellungen" 
            description="Konfigurieren Sie die grundlegenden Plattformeinstellungen"
            icon={Settings}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Firmenname</Label>
                <Input
                  id="company-name"
                  value={mockTenant.name}
                  placeholder="Ihr Firmenname"
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  Wenden Sie sich an den Support, um den Firmennamen zu ändern
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tenant-slug">URL-Bezeichnung</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                    helix.ai/
                  </span>
                  <Input
                    id="tenant-slug"
                    value={mockTenant.slug}
                    className="rounded-l-none"
                    disabled
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Sprache</Label>
                <Select value={settings.language} onValueChange={(value) => handleSettingsChange('language', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Zeitzone</Label>
                <Select value={settings.timezone} onValueChange={(value) => handleSettingsChange('timezone', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Berlin">Europa/Berlin</SelectItem>
                    <SelectItem value="Europe/London">Europa/London</SelectItem>
                    <SelectItem value="America/New_York">Amerika/New York</SelectItem>
                    <SelectItem value="Asia/Tokyo">Asien/Tokyo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <FeatureToggle
              label="Automatische Synchronisation"
              description="Automatische Aktualisierung der regulatorischen Daten"
              enabled={settings.autoSync}
              onToggle={(checked) => handleSettingsChange('autoSync', checked)}
            />
          </SettingsCard>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <SettingsCard 
            title="Benachrichtigungseinstellungen" 
            description="Konfigurieren Sie, wie und wann Sie benachrichtigt werden möchten"
            icon={Bell}
          >
            <FeatureToggle
              label="E-Mail-Benachrichtigungen"
              description="Erhalten Sie wichtige Updates per E-Mail"
              enabled={settings.emailAlerts}
              onToggle={(checked) => handleSettingsChange('emailAlerts', checked)}
            />

            <FeatureToggle
              label="Browser-Benachrichtigungen"
              description="Push-Benachrichtigungen im Browser aktivieren"
              enabled={settings.notifications}
              onToggle={(checked) => handleSettingsChange('notifications', checked)}
            />

            <div className="space-y-2">
              <Label>Benachrichtigungsfrequenz</Label>
              <Select defaultValue="daily">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Sofort</SelectItem>
                  <SelectItem value="hourly">Stündlich</SelectItem>
                  <SelectItem value="daily">Täglich</SelectItem>
                  <SelectItem value="weekly">Wöchentlich</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </SettingsCard>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SettingsCard 
            title="API-Zugang" 
            description="Verwalten Sie Ihre API-Schlüssel und Zugriffsrechte"
            icon={Shield}
          >
            <div className="space-y-4">
              <div>
                <Label>API-Schlüssel</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value="hx_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz"
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="icon">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Verwenden Sie diesen Schlüssel für API-Anfragen
                </p>
              </div>

              <FeatureToggle
                label="API-Zugang aktiviert"
                description="Programmatischer Zugriff auf Ihre Daten"
                enabled={settings.apiAccess}
                onToggle={(checked) => handleSettingsChange('apiAccess', checked)}
                disabled={!mockTenant.limits.features.apiAccess}
              />
            </div>
          </SettingsCard>

          <SettingsCard 
            title="Datenschutz" 
            description="Konfigurieren Sie Ihre Datenschutzeinstellungen"
            icon={Database}
          >
            <div className="space-y-2">
              <Label>Datenaufbewahrung</Label>
              <Select value={settings.dataRetention} onValueChange={(value) => handleSettingsChange('dataRetention', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6months">6 Monate</SelectItem>
                  <SelectItem value="12months">12 Monate</SelectItem>
                  <SelectItem value="24months">24 Monate</SelectItem>
                  <SelectItem value="unlimited">Unbegrenzt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </SettingsCard>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <SettingsCard 
            title="Aktueller Plan" 
            description="Ihr Professional Plan bietet erweiterte Funktionen"
            icon={CreditCard}
          >
            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div>
                <h4 className="font-semibold text-purple-900 dark:text-purple-100">Professional Plan</h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">€899/Monat • Bis zu 2.500 Updates</p>
              </div>
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
                Aktiv
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Nutzungslimits</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Benutzer</span>
                      <span className="text-sm">{mockTenant.limits.users.current} / {mockTenant.limits.users.max}</span>
                    </div>
                    <Progress value={(mockTenant.limits.users.current / mockTenant.limits.users.max) * 100} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Monatliche Updates</span>
                      <span className="text-sm">{mockTenant.limits.dataAccess.currentUsage} / {mockTenant.limits.dataAccess.monthlyLimit}</span>
                    </div>
                    <Progress value={(mockTenant.limits.dataAccess.currentUsage / mockTenant.limits.dataAccess.monthlyLimit) * 100} />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Enthaltene Features</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>AI-Insights & Analytics</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Priority Support</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Custom Dashboards</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>API-Zugang</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline">
                Plan ändern
              </Button>
              <Button variant="outline">
                Rechnungen anzeigen
              </Button>
            </div>
          </SettingsCard>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <SettingsCard 
            title="Erweiterte Einstellungen" 
            description="Konfigurieren Sie erweiterte Plattformfunktionen"
            icon={Zap}
          >
            <FeatureToggle
              label="Custom Branding"
              description="Verwenden Sie Ihr eigenes Logo und Farbschema"
              enabled={settings.customBranding}
              onToggle={(checked) => handleSettingsChange('customBranding', checked)}
              disabled={!mockTenant.limits.features.customBranding}
            />

            <div className="space-y-2">
              <Label>Design-Theme</Label>
              <Select value={settings.theme} onValueChange={(value) => handleSettingsChange('theme', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Hell</SelectItem>
                  <SelectItem value="dark">Dunkel</SelectItem>
                  <SelectItem value="auto">Automatisch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </SettingsCard>

          <SettingsCard 
            title="Datenexport" 
            description="Exportieren Sie Ihre Daten für Backup oder Migration"
            icon={Download}
          >
            <div className="flex gap-3">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Vollständiger Export
              </Button>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Daten importieren
              </Button>
            </div>
          </SettingsCard>

          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <AlertTriangle className="h-5 w-5" />
                Gefährliche Aktionen
              </CardTitle>
              <CardDescription className="text-red-700 dark:text-red-300">
                Diese Aktionen können nicht rückgängig gemacht werden
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Konto löschen
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}