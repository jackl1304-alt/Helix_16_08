import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3,
  Building2,
  Users,
  Settings,
  Bell,
  TrendingUp,
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  Globe,
  FileText,
  Filter,
  Download,
  Eye,
  Star,
  Zap,
  Target,
  Activity
} from "lucide-react";

// Mock tenant data for demo - In production, get from authentication context
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
    autoSync: true
  },
  limits: {
    users: { current: 12, max: 25, available: 13 },
    dataAccess: { currentUsage: 1247, monthlyLimit: 2500, remaining: 1253 },
    features: { apiAccess: true, customBranding: true }
  }
};

const SUBSCRIPTION_PLANS = {
  starter: { name: 'Starter', price: '€299/Monat', color: 'bg-blue-100 text-blue-800', features: ['500 Updates/Monat', 'Basic Dashboard', 'Email Support'] },
  professional: { name: 'Professional', price: '€899/Monat', color: 'bg-purple-100 text-purple-800', features: ['2.500 Updates/Monat', 'AI-Insights', 'Priority Support', 'Custom Dashboards'] },
  enterprise: { name: 'Enterprise', price: '€2.499/Monat', color: 'bg-orange-100 text-orange-800', features: ['Unlimited Updates', 'Full AI-Analytics', 'White-label', 'API-Access', 'Dedicated Manager'] }
};

export default function CustomerDashboard() {
  const [activeRegion, setActiveRegion] = useState('all');
  const [timeRange, setTimeRange] = useState('30d');

  // Fetch customer-specific data based on tenant
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/customer/dashboard', mockTenant.id],
    queryFn: async () => {
      // In production: await fetch(`/api/customer/dashboard/${tenantId}`)
      return {
        regulatoryUpdates: {
          total: 1247,
          thisMonth: 89,
          critical: 12,
          regions: { US: 456, EU: 523, Asia: 268 }
        },
        compliance: {
          score: 94,
          alerts: 3,
          upcoming: 7,
          resolved: 156
        },
        analytics: {
          riskTrend: 'decreasing',
          engagement: 87,
          efficiency: 92
        }
      };
    }
  });

  const currentPlan = SUBSCRIPTION_PLANS[mockTenant.subscriptionPlan];
  const usagePercentage = (mockTenant.limits.dataAccess.currentUsage / mockTenant.limits.dataAccess.monthlyLimit) * 100;

  const DashboardCard = ({ title, value, change, icon: Icon, color = "blue" }) => (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{value}</span>
              {change && (
                <Badge variant="secondary" className={`text-xs ${change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {change > 0 ? '+' : ''}{change}%
                </Badge>
              )}
            </div>
          </div>
          <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-${color}-500 to-${color}-600`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const RegionCard = ({ region, count, percentage }) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
        <span className="font-medium">{region}</span>
      </div>
      <div className="text-right">
        <div className="font-semibold">{count}</div>
        <div className="text-xs text-muted-foreground">{percentage}%</div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-700 rounded-2xl shadow-lg text-white font-bold text-xl">
            {mockTenant.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {mockTenant.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge className={currentPlan.color}>
                {currentPlan.name}
              </Badge>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Aktiv
              </Badge>
              <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg text-sm">
                /{mockTenant.slug}
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Ihr personalisiertes Regulatory Intelligence Dashboard
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Einstellungen
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Usage & Limits */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Nutzung & Limits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Benutzer</span>
                <span className="text-sm text-muted-foreground">
                  {mockTenant.limits.users.current} / {mockTenant.limits.users.max}
                </span>
              </div>
              <Progress value={(mockTenant.limits.users.current / mockTenant.limits.users.max) * 100} className="mb-2" />
              <p className="text-xs text-muted-foreground">{mockTenant.limits.users.available} verfügbar</p>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Monatliche Updates</span>
                <span className="text-sm text-muted-foreground">
                  {mockTenant.limits.dataAccess.currentUsage.toLocaleString()} / {mockTenant.limits.dataAccess.monthlyLimit.toLocaleString()}
                </span>
              </div>
              <Progress value={usagePercentage} className="mb-2" />
              <p className="text-xs text-muted-foreground">
                {mockTenant.limits.dataAccess.remaining.toLocaleString()} verbleibend
              </p>
            </div>
            
            <div className="space-y-2">
              <span className="text-sm font-medium">Features</span>
              <div className="flex flex-wrap gap-1">
                <Badge variant={mockTenant.limits.features.apiAccess ? "default" : "secondary"} className="text-xs">
                  API-Zugang
                </Badge>
                <Badge variant={mockTenant.limits.features.customBranding ? "default" : "secondary"} className="text-xs">
                  Custom Branding
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Dashboard-Filter
            </CardTitle>
            <div className="flex gap-2">
              <Select value={activeRegion} onValueChange={setActiveRegion}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Regionen</SelectItem>
                  <SelectItem value="US">USA</SelectItem>
                  <SelectItem value="EU">Europa</SelectItem>
                  <SelectItem value="Asia">Asien</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 Tage</SelectItem>
                  <SelectItem value="30d">30 Tage</SelectItem>
                  <SelectItem value="90d">90 Tage</SelectItem>
                  <SelectItem value="12m">12 Monate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Dashboard Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Regulatory Updates"
          value={dashboardData?.regulatoryUpdates?.total.toLocaleString() || "0"}
          change={8}
          icon={FileText}
          color="blue"
        />
        <DashboardCard
          title="Compliance Score"
          value={`${dashboardData?.compliance?.score || 0}%`}
          change={2}
          icon={Shield}
          color="green"
        />
        <DashboardCard
          title="Kritische Alerts"
          value={dashboardData?.compliance?.alerts || "0"}
          change={-15}
          icon={AlertTriangle}
          color="red"
        />
        <DashboardCard
          title="Effizienz"
          value={`${dashboardData?.analytics?.efficiency || 0}%`}
          change={5}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Detailed Analytics */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Regionale Verteilung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData?.regulatoryUpdates?.regions && Object.entries(dashboardData.regulatoryUpdates.regions).map(([region, count]) => {
              const percentage = Math.round((count / dashboardData.regulatoryUpdates.total) * 100);
              return (
                <RegionCard
                  key={region}
                  region={region}
                  count={count}
                  percentage={percentage}
                />
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Gesamt-Score</span>
              <span className="text-lg font-bold text-green-600">
                {dashboardData?.compliance?.score || 0}%
              </span>
            </div>
            <Progress value={dashboardData?.compliance?.score || 0} className="mb-4" />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Aktive Alerts</span>
                <span className="font-medium">{dashboardData?.compliance?.alerts || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Anstehende Reviews</span>
                <span className="font-medium">{dashboardData?.compliance?.upcoming || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Erledigte Aufgaben</span>
                <span className="font-medium">{dashboardData?.compliance?.resolved || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Widgets Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Ihre personalisierten Widgets
          </CardTitle>
          <CardDescription>
            Konfigurieren Sie Ihr Dashboard nach Ihren spezifischen Anforderungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Personalisierte Widgets
            </h3>
            <p className="text-gray-600 mb-4">
              Erstellen Sie benutzerdefinierte Widgets für Ihre spezifischen Use Cases
            </p>
            <Button>
              <Settings className="mr-2 h-4 w-4" />
              Widget hinzufügen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}