import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Users, 
  FileText, 
  Activity, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Mail,
  Bell,
  Settings,
  Download,
  Eye,
  Calendar,
  Database,
  BarChart3
} from "lucide-react";

interface CustomerStats {
  subscriptionTier: string;
  activeUsers: number;
  monthlyApiCalls: number;
  dataSourcesAccess: number;
  lastLogin: string;
  accountStatus: string;
}

export default function CustomerDashboard() {
  // Mock customer data - in production würde das von API kommen
  const [customerStats] = useState<CustomerStats>({
    subscriptionTier: "Professional",
    activeUsers: 5,
    monthlyApiCalls: 1247,
    dataSourcesAccess: 45,
    lastLogin: "2025-08-20 10:30",
    accountStatus: "Active"
  });

  const customerData = {
    companyName: "Demo Medical Devices GmbH",
    contactPerson: "Max Mustermann", 
    email: "admin@demo-medical.local",
    subscription: "Professional Plan",
    validUntil: "2025-12-31"
  };

  const recentActivities = [
    {
      id: 1,
      action: "Data Source Update",
      description: "FDA 510(k) Database synchronisiert",
      timestamp: "10:15 AM",
      status: "completed"
    },
    {
      id: 2,
      action: "Report Generated",
      description: "Regulatory Updates Report erstellt",
      timestamp: "09:45 AM", 
      status: "completed"
    },
    {
      id: 3,
      action: "User Access",
      description: "Team member logged in",
      timestamp: "09:30 AM",
      status: "info"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Building2 className="h-8 w-8" />
              Customer Area
            </h1>
            <p className="text-blue-100 mt-2">
              {customerData.companyName} • {customerData.subscription}
            </p>
          </div>
          <div className="text-right">
            <Badge className="bg-green-500 text-white mb-2">
              {customerStats.accountStatus}
            </Badge>
            <p className="text-sm text-blue-100">
              Gültig bis: {customerData.validUntil}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aktive Benutzer
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerStats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              von 10 verfügbar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              API Aufrufe
            </CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerStats.monthlyApiCalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              diesen Monat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Datenquellen
            </CardTitle>
            <Database className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerStats.dataSourcesAccess}</div>
            <p className="text-xs text-muted-foreground">
              Zugriff verfügbar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Letzter Login
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">Heute</div>
            <p className="text-xs text-muted-foreground">
              {customerStats.lastLogin}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="usage">Nutzung</TabsTrigger>
          <TabsTrigger value="reports">Berichte</TabsTrigger>
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Letzte Aktivitäten
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 pb-3 border-b last:border-0">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Kontoinformationen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Unternehmen:</span>
                  <span className="text-sm font-medium">{customerData.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Ansprechpartner:</span>
                  <span className="text-sm font-medium">{customerData.contactPerson}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">E-Mail:</span>
                  <span className="text-sm font-medium">{customerData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Abonnement:</span>
                  <Badge variant="outline">{customerData.subscription}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Nutzungsstatistiken
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>API Aufrufe (monatlich)</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{customerStats.monthlyApiCalls}</span>
                    <span className="text-sm text-gray-500">/ 5000</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(customerStats.monthlyApiCalls / 5000) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500">
                  {Math.round((customerStats.monthlyApiCalls / 5000) * 100)}% des monatlichen Limits verwendet
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Verfügbare Berichte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Regulatory Updates Report</h4>
                    <p className="text-sm text-gray-500">Letzte 30 Tage</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Legal Cases Analysis</h4>
                    <p className="text-sm text-gray-500">Q3 2025</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Usage Statistics</h4>
                    <p className="text-sm text-gray-500">August 2025</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Account Einstellungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">E-Mail Benachrichtigungen</h4>
                    <p className="text-sm text-gray-500">Updates und Alerts per E-Mail erhalten</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-1" />
                    Konfigurieren
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">API Schlüssel</h4>
                    <p className="text-sm text-gray-500">API Zugriff verwalten</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Anzeigen
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Abonnement</h4>
                    <p className="text-sm text-gray-500">Plan ändern oder kündigen</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Verwalten
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}