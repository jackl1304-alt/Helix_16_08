import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useLiveTenantPermissions } from "@/hooks/use-live-tenant-permissions";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CustomerNavigationNew, { type CustomerPermissions } from "@/components/customer/customer-navigation-new";
import { 
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  Globe,
  Download,
  Settings,
  Crown,
  Shield,
  MessageCircle,
  LogOut,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";

// JSON-basierte Dashboard Data Structure
interface DashboardData {
  tenant: {
    id: string;
    name: string;
    plan: string;
    status: string;
  };
  usage: {
    currentMonth: number;
    limit: number;
    percentage: number;
    users: number;
    userLimit: number;
    apiCalls: number;
    apiLimit: number;
  };
  compliance: {
    score: number;
    alerts: number;
    upcoming: number;
    resolved: number;
  };
  analytics: {
    riskTrend: string;
    engagement: number;
    efficiency: number;
    dataQuality: number;
  };
}

// JSON Header Actions Configuration
interface HeaderAction {
  id: string;
  label: string;
  icon: string;
  variant: 'outline' | 'default';
  onClick: (tenantId: string, setLocation: (url: string) => void) => void;
}

const HEADER_ACTIONS: HeaderAction[] = [
  {
    id: 'chat',
    label: 'Support Chat',
    icon: 'MessageCircle',
    variant: 'outline',
    onClick: (tenantId, setLocation) => setLocation(`/tenant/${tenantId}/chat-support`)
  },
  {
    id: 'export',
    label: 'Export',
    icon: 'Download', 
    variant: 'outline',
    onClick: (tenantId, setLocation) => {
      console.log('Exporting dashboard data for tenant:', tenantId);
      alert('Export-Funktion wird implementiert...');
    }
  },
  {
    id: 'settings',
    label: 'Einstellungen',
    icon: 'Settings',
    variant: 'default',
    onClick: (tenantId, setLocation) => setLocation(`/tenant/${tenantId}/settings`)
  }
];

const ICON_MAP = {
  MessageCircle,
  Download,
  Settings,
  LogOut
};

export default function CustomerDashboardNew() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const params = useParams();
  const [location, setLocation] = useLocation();
  const { logout } = useAuth();
  const { t } = useLanguage();
  
  // Mock tenant ID
  const mockTenantId = "030d3e01-32c4-4f95-8d54-98be948e8d4b";
  const tenantId = params.tenantId || mockTenantId;
  
  // Get live tenant permissions
  const { 
    permissions: livePermissions, 
    tenantName: liveTenantName, 
    isLoading: isTenantLoading 
  } = useLiveTenantPermissions({ tenantId });
  
  // Fetch dashboard data - JSON structure
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/customer/dashboard', tenantId, selectedTimeRange],
    queryFn: async (): Promise<DashboardData> => {
      // Mock data structure - in production this would be API call
      return {
        tenant: {
          id: tenantId,
          name: liveTenantName || 'Demo Medical Devices GmbH',
          plan: 'Professional',
          status: 'active'
        },
        usage: {
          currentMonth: 1247,
          limit: 2500,
          percentage: 50,
          users: 12,
          userLimit: 25,
          apiCalls: 312,
          apiLimit: 1000
        },
        compliance: {
          score: 92,
          alerts: 8,
          upcoming: 15,
          resolved: 156
        },
        analytics: {
          riskTrend: 'decreasing',
          engagement: 89,
          efficiency: 94,
          dataQuality: 98
        }
      };
    }
  });
  
  // Handle header action clicks
  const handleHeaderAction = (actionId: string) => {
    const action = HEADER_ACTIONS.find(a => a.id === actionId);
    if (action) {
      action.onClick(tenantId, setLocation);
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  if (isLoading || isTenantLoading) {
    return (
      <div className="container mx-auto p-6 space-y-8 max-w-7xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Language Selector - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector />
      </div>
      
      {/* Navigation Sidebar */}
      <CustomerNavigationNew 
        permissions={livePermissions}
        tenantName={dashboardData?.tenant.name}
      />
      
      {/* Main Content */}
      <div className="flex-1 ml-64">
        <div className="container mx-auto p-6 space-y-8 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Kunden-Dashboard
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {dashboardData?.tenant.name?.charAt(0) || 'M'}
                  </div>
                  <span className="font-medium">{dashboardData?.tenant.name}</span>
                </div>
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
                  <Crown className="w-3 h-3 mr-1" />
                  {dashboardData?.tenant.plan}
                </Badge>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {dashboardData?.tenant.status}
                </Badge>
              </div>
            </div>
            
            {/* Header Actions */}
            <div className="flex gap-3 items-center">
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
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
              
              {HEADER_ACTIONS.map((action) => {
                const IconComponent = ICON_MAP[action.icon as keyof typeof ICON_MAP];
                return (
                  <Button
                    key={action.id}
                    variant={action.variant}
                    onClick={() => handleHeaderAction(action.id)}
                    className="relative z-50"
                    style={{ pointerEvents: 'all' }}
                  >
                    {IconComponent && <IconComponent className="w-4 h-4 mr-2" />}
                    {action.label}
                  </Button>
                );
              })}
              
              <Button 
                variant="outline"
                onClick={handleLogout}
                className="relative z-50"
                style={{ pointerEvents: 'all' }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Abmelden
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          {livePermissions?.dashboard && dashboardData && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Monatliche Nutzung</p>
                      <div className="text-2xl font-bold">
                        {dashboardData.usage.currentMonth.toLocaleString()} / {dashboardData.usage.limit.toLocaleString()}
                      </div>
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <ArrowUp className="h-3 w-3" />
                        +8.2%
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <Activity className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {dashboardData.usage.percentage}% vom Limit verbraucht
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                      <div className="text-2xl font-bold">{dashboardData.compliance.score}%</div>
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <ArrowUp className="h-3 w-3" />
                        +2.1%
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {dashboardData.compliance.alerts} aktive Warnungen
                  </p>
                </CardContent>
              </Card>

              {livePermissions?.userManagement && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Aktive Benutzer</p>
                        <div className="text-2xl font-bold">
                          {dashboardData.usage.users} / {dashboardData.usage.userLimit}
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Minus className="h-3 w-3" />
                          Stabil
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                        <Users className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Team-Nutzung im Rahmen</p>
                  </CardContent>
                </Card>
              )}

              {livePermissions?.analytics && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Data Quality</p>
                        <div className="text-2xl font-bold">{dashboardData.analytics.dataQuality}%</div>
                        <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                          <ArrowUp className="h-3 w-3" />
                          +1.3%
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Datenqualität hervorragend</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Compliance Overview */}
          {livePermissions?.regulatoryUpdates && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Compliance-Übersicht
                </CardTitle>
                <CardDescription>
                  Regionale Compliance-Scores und aktuelle Warnungen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { region: 'USA (FDA)', score: 95, alerts: 2, trend: 'up' as const },
                    { region: 'EU (EMA)', score: 88, alerts: 5, trend: 'stable' as const },
                    { region: 'Asia-Pacific', score: 92, alerts: 1, trend: 'up' as const }
                  ].map((item, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{item.region}</h4>
                          <Badge className={
                            item.trend === 'up' ? 'bg-green-100 text-green-800' : 
                            item.trend === 'down' ? 'bg-red-100 text-red-800' : 
                            'bg-blue-100 text-blue-800'
                          }>
                            {item.trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : 
                             item.trend === 'down' ? <ArrowDown className="w-3 h-3 mr-1" /> : 
                             <Minus className="w-3 h-3 mr-1" />}
                            {item.trend}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Compliance Score</span>
                            <span className="font-medium">{item.score}%</span>
                          </div>
                          <Progress value={item.score} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{item.alerts} aktive Warnungen</span>
                            <span>{item.score >= 90 ? 'Excellent' : item.score >= 80 ? 'Good' : 'Needs Attention'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}