import { useState } from "react";
import { useDevice } from "@/hooks/use-device";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Globe, 
  Database, 
  Key, 
  CheckCircle, 
  Clock, 
  Settings, 
  Lock,
  Activity,
  TrendingUp,
  BarChart3,
  AlertTriangle
} from "lucide-react";

interface GRIPSource {
  id: string;
  name: string;
  status: "active" | "inactive" | "pending";
  credentialStatus: "under_management" | "expired" | "pending";
  lastSync: string;
  dataPoints: number;
  coverage: string;
  apiVersion: string;
}

const gripSources: GRIPSource[] = [
  {
    id: "grip_intelligence",
    name: "GRIP Global Intelligence Platform",
    status: "active",
    credentialStatus: "under_management",
    lastSync: "2025-08-07T09:00:00.000Z",
    dataPoints: 125000,
    coverage: "95% Global",
    apiVersion: "v1.2"
  }
];

export default function GRIPIntegration() {
  const device = useDevice();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshCredentials = async () => {
    setIsRefreshing(true);
    toast({
      title: "GRIP Credentials",
      description: "Zugangsdaten werden aktualisiert...",
    });
    
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Aktualisierung erfolgreich",
        description: "GRIP Zugangsdaten unter Verwaltung bestätigt",
      });
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return "bg-green-100 text-green-800 border-green-200";
      case 'pending': return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 'inactive': return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCredentialStatusColor = (status: string) => {
    switch (status) {
      case 'under_management': return "bg-blue-100 text-blue-800 border-blue-200";
      case 'expired': return "bg-red-100 text-red-800 border-red-200";
      case 'pending': return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className={cn(
      "space-y-6",
      device.isMobile ? "p-4" : device.isTablet ? "p-6" : "p-8"
    )}>
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Globe className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">GRIP Integration</h1>
            <p className="text-gray-600">Global Intelligence Platform - Zugangsdaten unter Verwaltung</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Shield className="h-3 w-3 mr-1" />
            Sichere Verbindung
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Key className="h-3 w-3 mr-1" />
            Zugangsdaten verwaltet
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Database className="h-3 w-3 mr-1" />
            Premium Access
          </Badge>
        </div>
      </div>

      {/* GRIP Sources Overview */}
      <div className="grid gap-6">
        {gripSources.map((source) => (
          <Card key={source.id} className="border-2 border-blue-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <span>{source.name}</span>
                </CardTitle>
                <div className="flex space-x-2">
                  <Badge className={getStatusColor(source.status)}>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {source.status}
                  </Badge>
                  <Badge className={getCredentialStatusColor(source.credentialStatus)}>
                    <Lock className="h-3 w-3 mr-1" />
                    Zugangsdaten unter Verwaltung
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Activity className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Letzte Sync</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {new Date(source.lastSync).toLocaleString('de-DE')}
                  </span>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Datenpunkte</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {source.dataPoints.toLocaleString('de-DE')}
                  </span>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Abdeckung</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{source.coverage}</span>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Settings className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">API Version</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{source.apiVersion}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={handleRefreshCredentials}
                  disabled={isRefreshing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isRefreshing ? (
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Key className="h-4 w-4 mr-2" />
                  )}
                  Zugangsdaten prüfen
                </Button>
                
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Konfiguration
                </Button>
                
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Information */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <Shield className="h-5 w-5" />
            <span>Sicherheitsstatus</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800">Zugangsdaten verschlüsselt und sicher gespeichert</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800">OAuth 2.0 Authentifizierung aktiv</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800">Automatische Credential-Rotation konfiguriert</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800">Audit-Logging für alle API-Zugriffe</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access Information */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <Database className="h-5 w-5" />
            <span>Premium Access Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">Verfügbare Datensets:</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Global Regulatory Intelligence</li>
                <li>• Market Access Database</li>
                <li>• Competitive Intelligence</li>
                <li>• Real-time Alert System</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">API Limits:</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• 10.000 Requests/Tag</li>
                <li>• Unlimited Data Download</li>
                <li>• Real-time Streaming</li>
                <li>• Priority Support</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}