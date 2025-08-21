import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Settings, 
  Database, 
  Mail,
  Bell,
  Shield,
  Key,
  Server,
  Clock,
  Monitor,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Upload
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SystemSettings {
  id: string;
  category: string;
  key: string;
  value: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  isEditable: boolean;
  lastModified: string;
}

interface SystemHealth {
  component: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  lastCheck: string;
  uptime?: string;
  responseTime?: number;
}

interface SystemLog {
  id: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  component: string;
  details?: string;
}

const mockSettings: SystemSettings[] = [
  {
    id: "1",
    category: "Email",
    key: "SMTP_HOST",
    value: "smtp.sendgrid.net",
    description: "SMTP Server für E-Mail-Versand",
    type: "string",
    isEditable: true,
    lastModified: "2025-01-25T10:30:00Z"
  },
  {
    id: "2",
    category: "Email",
    key: "SMTP_PORT",
    value: "587",
    description: "SMTP Port",
    type: "number",
    isEditable: true,
    lastModified: "2025-01-25T10:30:00Z"
  },
  {
    id: "3",
    category: "System",
    key: "DATA_SYNC_INTERVAL",
    value: "3600",
    description: "Synchronisationsintervall in Sekunden",
    type: "number",
    isEditable: true,
    lastModified: "2025-01-20T14:15:00Z"
  },
  {
    id: "4",
    category: "Security",
    key: "SESSION_TIMEOUT",
    value: "7200",
    description: "Session-Timeout in Sekunden",
    type: "number",
    isEditable: true,
    lastModified: "2025-01-15T09:45:00Z"
  },
  {
    id: "5",
    category: "Features",
    key: "ENABLE_NOTIFICATIONS",
    value: "true",
    description: "Push-Benachrichtigungen aktivieren",
    type: "boolean",
    isEditable: true,
    lastModified: "2025-01-27T08:20:00Z"
  }
];

const mockHealthChecks: SystemHealth[] = [
  {
    component: "Database",
    status: "healthy",
    message: "Alle Datenbankverbindungen funktionieren normal",
    lastCheck: "2025-01-27T11:30:00Z",
    uptime: "99.98%",
    responseTime: 45
  },
  {
    component: "Email Service",
    status: "warning",
    message: "SendGrid API Schlüssel fehlt - E-Mail-Funktionalität eingeschränkt",
    lastCheck: "2025-01-27T11:30:00Z",
    uptime: "95.2%",
    responseTime: 120
  },
  {
    component: "Data Collection",
    status: "healthy",
    message: "Alle Datenquellen synchronisieren erfolgreich",
    lastCheck: "2025-01-27T11:30:00Z",
    uptime: "98.7%",
    responseTime: 200
  },
  {
    component: "External APIs",
    status: "warning",
    message: "FDA API antwortet langsam (>2s)",
    lastCheck: "2025-01-27T11:30:00Z",
    uptime: "97.1%",
    responseTime: 2100
  }
];

const mockLogs: SystemLog[] = [
  {
    id: "1",
    level: "info",
    message: "Datensammlung erfolgreich abgeschlossen",
    timestamp: "2025-01-27T11:25:00Z",
    component: "DataCollectionService",
    details: "42 neue regulatorische Updates von 8 Quellen gesammelt"
  },
  {
    id: "2",
    level: "warn",
    message: "SendGrid API Schlüssel nicht konfiguriert",
    timestamp: "2025-01-27T11:20:00Z",
    component: "EmailService",
    details: "E-Mail-Funktionalität ist eingeschränkt bis API-Schlüssel bereitgestellt wird"
  },
  {
    id: "3",
    level: "error",
    message: "FDA API Timeout",
    timestamp: "2025-01-27T11:15:00Z",
    component: "FDADataSource",
    details: "Anfrage an https://api.fda.gov/device/510k.json ist nach 30s abgelaufen"
  },
  {
    id: "4",
    level: "info",
    message: "Newsletter erfolgreich versendet",
    timestamp: "2025-01-27T10:00:00Z",
    component: "NewsletterService",
    details: "Wöchentlicher MedTech Update an 1,247 Abonnenten versendet"
  }
];

const statusColors = {
  healthy: "bg-green-100 text-green-800 border-green-200",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
  error: "bg-red-100 text-red-800 border-red-200"
};

const statusIcons = {
  healthy: CheckCircle,
  warning: AlertTriangle,
  error: AlertTriangle
};

const logLevelColors = {
  info: "bg-blue-100 text-blue-800",
  warn: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800"
};

export default function SystemSettings() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingSettings, setEditingSettings] = useState<{ [key: string]: string }>({});

  const { data: settings = mockSettings, isLoading: settingsLoading } = useQuery<SystemSettings[]>({
    queryKey: ["/api/settings"],
    enabled: false // Use mock data
  });

  const { data: healthChecks = mockHealthChecks, isLoading: healthLoading } = useQuery<SystemHealth[]>({
    queryKey: ["/api/system/health"],
    enabled: false // Use mock data
  });

  const { data: systemLogs = mockLogs, isLoading: logsLoading } = useQuery<SystemLog[]>({
    queryKey: ["/api/system/logs"],
    enabled: false // Use mock data
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: string }) => {
      return await apiRequest(`/api/settings/${id}`, "PATCH", { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      setEditingSettings({});
      toast({
        title: "Einstellung gespeichert",
        description: "Die Systemeinstellung wurde erfolgreich aktualisiert."
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Einstellung konnte nicht gespeichert werden.",
        variant: "destructive"
      });
    }
  });

  const runHealthCheckMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/system/health/check", "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system/health"] });
      toast({
        title: "Systemprüfung abgeschlossen",
        description: "Alle Komponenten wurden überprüft."
      });
    }
  });

  const categories = Array.from(new Set(settings.map(s => s.category)));
  const filteredSettings = selectedCategory === "all" 
    ? settings 
    : settings.filter(s => s.category === selectedCategory);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSettingChange = (settingId: string, value: string) => {
    setEditingSettings(prev => ({ ...prev, [settingId]: value }));
  };

  const saveSetting = (setting: SystemSettings) => {
    const newValue = editingSettings[setting.id] || setting.value;
    updateSettingMutation.mutate({ id: setting.id, value: newValue });
  };

  const renderSettingInput = (setting: SystemSettings) => {
    const currentValue = editingSettings[setting.id] || setting.value;
    
    if (!setting.isEditable) {
      return (
        <div className="flex items-center space-x-2">
          <Input value={setting.value} disabled />
          <Badge variant="secondary">Schreibgeschützt</Badge>
        </div>
      );
    }

    switch (setting.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch 
              checked={currentValue === 'true'}
              onCheckedChange={(checked) => 
                handleSettingChange(setting.id, checked.toString())
              }
            />
            <span className="text-sm">{currentValue === 'true' ? 'Aktiviert' : 'Deaktiviert'}</span>
          </div>
        );
      case 'number':
        return (
          <Input
            type="number"
            value={currentValue}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
          />
        );
      default:
        return (
          <Input
            value={currentValue}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
          />
        );
    }
  };

  const getStatusIcon = (status: string) => {
    const Icon = statusIcons[status as keyof typeof statusIcons] || CheckCircle;
    return <Icon className="h-4 w-4" />;
  };

  const overallHealth = healthChecks.every(check => check.status === 'healthy') 
    ? 'healthy' 
    : healthChecks.some(check => check.status === 'error') 
      ? 'error' 
      : 'warning';

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Systemeinstellungen</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Systemkonfiguration, Überwachung und Protokolle
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Einstellungen exportieren
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Konfiguration importieren
          </Button>
        </div>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
          <TabsTrigger value="health">Systemstatus</TabsTrigger>
          <TabsTrigger value="logs">Systemprotokolle</TabsTrigger>
          <TabsTrigger value="backup">Backup & Wiederherstellung</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Systemkonfiguration</CardTitle>
                <CardDescription>
                  Verwalten Sie grundlegende Systemeinstellungen und Parameter
                </CardDescription>
                <div className="flex space-x-4">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Kategorien</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredSettings.map((setting) => (
                    <div key={setting.id} className="grid gap-4 p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Label className="font-medium">{setting.key}</Label>
                            <Badge variant="outline">{setting.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {setting.description}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {editingSettings[setting.id] !== undefined && (
                            <Button 
                              size="sm" 
                              onClick={() => saveSetting(setting)}
                              disabled={updateSettingMutation.isPending}
                            >
                              Speichern
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid gap-2">
                        {renderSettingInput(setting)}
                        <p className="text-xs text-muted-foreground">
                          Zuletzt geändert: {formatDate(setting.lastModified)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5" />
                  <span>Systemstatus</span>
                  <Badge className={statusColors[overallHealth]} variant="outline">
                    {getStatusIcon(overallHealth)}
                    <span className="ml-1 capitalize">{overallHealth}</span>
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Überwachung aller Systemkomponenten und Services
                </CardDescription>
                <Button 
                  onClick={() => runHealthCheckMutation.mutate()}
                  disabled={runHealthCheckMutation.isPending}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {runHealthCheckMutation.isPending ? "Prüfe..." : "Systemprüfung starten"}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {healthChecks.map((check, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${statusColors[check.status]}`}>
                            {getStatusIcon(check.status)}
                          </div>
                          <div>
                            <h3 className="font-medium">{check.component}</h3>
                            <p className="text-sm text-muted-foreground">{check.message}</p>
                          </div>
                        </div>
                        <Badge className={statusColors[check.status]} variant="outline">
                          {check.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Verfügbarkeit</p>
                          <p className="font-medium">{check.uptime || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Antwortzeit</p>
                          <p className="font-medium">
                            {check.responseTime ? `${check.responseTime}ms` : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Letzte Prüfung</p>
                          <p className="font-medium">{formatDate(check.lastCheck)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Systemprotokolle</CardTitle>
              <CardDescription>
                Aktuelle Systemereignisse und Fehlermeldungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemLogs.map((log) => (
                  <div key={log.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-3">
                        <Badge className={logLevelColors[log.level]} variant="secondary">
                          {log.level.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{log.message}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(log.timestamp)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-2">
                      Komponente: {log.component}
                    </div>
                    
                    {log.details && (
                      <div className="text-sm bg-muted p-3 rounded">
                        {log.details}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Backup erstellen</CardTitle>
                <CardDescription>
                  Erstellen Sie eine vollständige Sicherung der Systemdaten
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Backups enthalten alle Systemeinstellungen, Benutzerdaten und regulatorische Updates.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <div>
                    <Label>Backup-Typ</Label>
                    <Select defaultValue="full">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Vollständiges Backup</SelectItem>
                        <SelectItem value="settings">Nur Einstellungen</SelectItem>
                        <SelectItem value="data">Nur Daten</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Backup erstellen
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Wiederherstellung</CardTitle>
                <CardDescription>
                  System aus vorhandenem Backup wiederherstellen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Achtung: Die Wiederherstellung überschreibt alle aktuellen Daten.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <div>
                    <Label>Backup-Datei</Label>
                    <Input type="file" accept=".backup,.zip" />
                  </div>
                  
                  <Button className="w-full" variant="destructive">
                    <Upload className="mr-2 h-4 w-4" />
                    Wiederherstellung starten
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}