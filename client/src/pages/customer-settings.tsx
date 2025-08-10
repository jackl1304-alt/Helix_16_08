import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomerNavigation, { type CustomerPermissions } from "@/components/customer/customer-navigation";
import { 
  Settings,
  User,
  Bell,
  Shield,
  Mail,
  Globe,
  Save,
  Building,
  Crown,
  CheckCircle
} from "lucide-react";

// Mock tenant ID - In production, get from authentication context  
const mockTenantId = "030d3e01-32c4-4f95-8d54-98be948e8d4b";

export default function CustomerSettings() {
  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    smsAlerts: false,
    weeklyDigest: true,
    criticalOnly: false
  });
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    return () => {
      setMounted(false);
    };
  }, []);

  // Fetch tenant data including permissions
  const { data: tenantData, isLoading: isTenantLoading, error } = useQuery({
    queryKey: ['/api/customer/tenant', mockTenantId],
    queryFn: async () => {
      const response = await fetch(`/api/customer/tenant/${mockTenantId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tenant data');
      }
      const data = await response.json();
      return data;
    },
    enabled: mounted,
    retry: 1,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
  
  // Extract permissions from tenant data
  const permissions = tenantData?.customerPermissions || {
    dashboard: true,
    regulatoryUpdates: true,
    legalCases: true,
    knowledgeBase: true,
    newsletters: true,
    analytics: false,
    reports: false,
    dataCollection: false,
    globalSources: false,
    historicalData: false,
    administration: false,
    userManagement: false,
    systemSettings: false,
    auditLogs: false,
    aiInsights: false,
    advancedAnalytics: false
  };

  if (isTenantLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse space-y-4 p-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Fehler beim Laden der Einstellungen
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Die Tenant-Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.
          </p>
          <Button onClick={() => window.location.reload()}>
            Seite neu laden
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Sidebar */}
      <CustomerNavigation 
        permissions={permissions}
        tenantName={tenantData?.name}
      />
      
      {/* Main Content */}
      <div className="flex-1 ml-64">
        <div className="container mx-auto p-6 space-y-8 max-w-4xl">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Einstellungen
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {tenantData?.name?.charAt(0) || 'M'}
                  </div>
                  <span className="font-medium">{tenantData?.name || 'Customer Portal'}</span>
                </div>
                <Badge className="bg-purple-100 text-purple-800">
                  <Crown className="w-3 h-3 mr-1" />
                  Professional Plan
                </Badge>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
            </div>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="notifications">Benachrichtigungen</TabsTrigger>
              <TabsTrigger value="preferences">Präferenzen</TabsTrigger>
              <TabsTrigger value="security">Sicherheit</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Unternehmensinformationen
                  </CardTitle>
                  <CardDescription>
                    Verwalten Sie Ihre Unternehmensdaten und Kontaktinformationen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="company">Unternehmensname</Label>
                      <Input id="company" defaultValue={tenantData?.name || ""} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-Mail-Adresse</Label>
                      <Input id="email" type="email" defaultValue={tenantData?.billingEmail || ""} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Branche</Label>
                      <Input id="industry" defaultValue="Medizintechnik" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Land</Label>
                      <Input id="country" defaultValue="Deutschland" />
                    </div>
                  </div>
                  <Button className="w-full md:w-auto">
                    <Save className="w-4 h-4 mr-2" />
                    Änderungen speichern
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Benachrichtigungseinstellungen
                  </CardTitle>
                  <CardDescription>
                    Konfigurieren Sie, wie und wann Sie Benachrichtigungen erhalten möchten
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-alerts">E-Mail-Benachrichtigungen</Label>
                        <p className="text-sm text-muted-foreground">
                          Erhalten Sie wichtige Updates per E-Mail
                        </p>
                      </div>
                      <Switch 
                        id="email-alerts"
                        checked={notificationSettings.emailAlerts}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, emailAlerts: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="weekly-digest">Wöchentlicher Digest</Label>
                        <p className="text-sm text-muted-foreground">
                          Zusammenfassung der wichtigsten Updates
                        </p>
                      </div>
                      <Switch 
                        id="weekly-digest"
                        checked={notificationSettings.weeklyDigest}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, weeklyDigest: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="critical-only">Nur kritische Warnungen</Label>
                        <p className="text-sm text-muted-foreground">
                          Nur bei wichtigen regulatorischen Änderungen
                        </p>
                      </div>
                      <Switch 
                        id="critical-only"
                        checked={notificationSettings.criticalOnly}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, criticalOnly: checked }))
                        }
                      />
                    </div>
                  </div>
                  
                  <Button className="w-full md:w-auto">
                    <Save className="w-4 h-4 mr-2" />
                    Einstellungen speichern
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Präferenzen
                  </CardTitle>
                  <CardDescription>
                    Personalisieren Sie Ihre Plattform-Erfahrung
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="language">Sprache</Label>
                      <Input id="language" defaultValue="Deutsch" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Zeitzone</Label>
                      <Input id="timezone" defaultValue="Europe/Berlin" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="region">Hauptregion</Label>
                      <Input id="region" defaultValue="Europa" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="updates-frequency">Update-Frequenz</Label>
                      <Input id="updates-frequency" defaultValue="Täglich" />
                    </div>
                  </div>
                  
                  <Button className="w-full md:w-auto">
                    <Save className="w-4 h-4 mr-2" />
                    Präferenzen speichern
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Sicherheitseinstellungen
                  </CardTitle>
                  <CardDescription>
                    Verwalten Sie Ihre Sicherheits- und Zugriffseinstellungen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Aktuelle Berechtigungen</Label>
                      <div className="grid gap-2 md:grid-cols-2">
                        {Object.entries(permissions).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <Badge variant={value ? "default" : "secondary"}>
                              {value ? "Aktiviert" : "Deaktiviert"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <Shield className="w-4 h-4 inline mr-2" />
                        Ihre Berechtigungen werden von Ihrem Administrator verwaltet. 
                        Wenden Sie sich an Ihren Administrator, um Änderungen anzufordern.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}