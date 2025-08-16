import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, Users, FileText, TrendingUp, Clock, Shield, Star, Zap, Crown, Lock } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";

interface TenantContext {
  id: string;
  name: string;
  subdomain: string;
  colorScheme: string;
  subscriptionTier: 'basic' | 'professional' | 'enterprise';
  settings?: any;
}

interface TenantStats {
  totalUpdates: number;
  totalLegalCases: number;
  activeDataSources: number;
  monthlyUsage: number;
  usageLimit: number;
}

// This will be converted to use translations in the component
const subscriptionLimits = {
  basic: {
    name: 'Basic Plan',
    icon: Shield,
    monthlyUpdates: 50,
    legalCases: 10,
    dataSources: 5,
    features: ['basic.updates', 'basic.notifications', 'basic.support']
  },
  professional: {
    name: 'Professional Plan', 
    icon: Star,
    monthlyUpdates: 200,
    legalCases: 50,
    dataSources: 20,
    features: ['professional.analytics', 'professional.support', 'professional.reports', 'professional.api']
  },
  enterprise: {
    name: 'Enterprise Plan',
    icon: Crown,
    monthlyUpdates: 1000,
    legalCases: 500,
    dataSources: 100,
    features: ['Unbegrenzte Updates', 'Dedicated Support', 'White-label', 'Custom Integrations']
  }
};

export default function TenantDashboard() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  const { data: tenantContext, isLoading: contextLoading, error: contextError } = useQuery({
    queryKey: ['/api/tenant/context'],
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['/api/tenant/dashboard/stats'],
    retry: 3,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!tenantContext // Only fetch when context is available
  });

  const { data: updates, isLoading: updatesLoading, error: updatesError } = useQuery({
    queryKey: ['/api/tenant/regulatory-updates'],
    retry: 3,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!tenantContext // Only fetch when context is available
  });

  // Handle errors first
  if (contextError || statsError || updatesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Verbindungsfehler</CardTitle>
            <CardDescription>
              Es gab ein Problem beim Laden der Daten
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Seite neu laden
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (contextLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-blue-200 h-12 w-12"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-blue-200 rounded w-3/4"></div>
              <div className="h-4 bg-blue-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tenant = tenantContext as TenantContext;
  const dashboardStats = stats as TenantStats;
  const subscription = subscriptionLimits[tenant?.subscriptionTier || 'basic'];
  const SubscriptionIcon = subscription.icon;

  const usagePercentage = dashboardStats ? (dashboardStats.monthlyUsage / subscription.monthlyUpdates) * 100 : 0;

  const handleLogout = () => {
    setLocation('/tenant/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative">
      {/* Language Selector - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector />
      </div>
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-purple-900 bg-clip-text text-transparent">
                  {tenant?.name || 'Tenant Dashboard'}
                </h1>
                <p className="text-sm text-gray-600">Regulatory Intelligence Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-900 hover:bg-blue-200">
                <SubscriptionIcon className="h-3 w-3 mr-1" />
                {subscription.name}
              </Badge>
              <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
                Abmelden
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Subscription Status Alert */}
        <Alert className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <SubscriptionIcon className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            Sie verwenden den <strong>{subscription.name}</strong>. 
            Monatliche Nutzung: {dashboardStats?.monthlyUsage || 0} von {subscription.monthlyUpdates} Updates
          </AlertDescription>
        </Alert>

        {/* Usage Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-lg border-white/20 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Monatliche Nutzung</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{dashboardStats?.monthlyUsage || 0}</div>
              <Progress value={usagePercentage} className="mt-2" />
              <p className="text-xs text-gray-500 mt-1">von {subscription.monthlyUpdates} verfügbar</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-lg border-white/20 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Verfügbare Updates</CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{dashboardStats?.totalUpdates || 0}</div>
              <p className="text-xs text-gray-500">Aktuelle Regulatory Updates</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-lg border-white/20 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Rechtsfälle</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{dashboardStats?.totalLegalCases || 0}</div>
              <p className="text-xs text-gray-500">Verfügbare Analysen</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-lg border-white/20 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Datenquellen</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{dashboardStats?.activeDataSources || 0}</div>
              <p className="text-xs text-gray-500">von {subscription.dataSources} erlaubt</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="updates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-lg">
            <TabsTrigger value="updates" data-testid="tab-updates">Updates</TabsTrigger>
            <TabsTrigger value="features" data-testid="tab-features">Features</TabsTrigger>
            <TabsTrigger value="upgrade" data-testid="tab-upgrade">Upgrade</TabsTrigger>
          </TabsList>

          <TabsContent value="updates" className="space-y-4">
            <Card className="bg-white/80 backdrop-blur-lg border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Aktuelle Regulatory Updates</span>
                </CardTitle>
                <CardDescription>
                  Für Ihr {subscription.name} Abonnement verfügbare Updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {updatesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex space-x-4">
                        <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : updates && updates.length > 0 ? (
                  <div className="space-y-4">
                    {updates.slice(0, subscription.monthlyUpdates === 50 ? 3 : 10).map((update: any, index: number) => (
                      <div key={update.id || index} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-900">{update.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{update.description}</p>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {update.type || 'regulatory'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Keine Updates verfügbar</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <Card className="bg-white/80 backdrop-blur-lg border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  <span>Verfügbare Features</span>
                </CardTitle>
                <CardDescription>
                  Funktionen Ihres {subscription.name} Abonnements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subscription.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Zap className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="font-medium text-green-900">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upgrade" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(subscriptionLimits).map(([tier, plan]) => {
                const PlanIcon = plan.icon;
                const isCurrentPlan = tier === tenant?.subscriptionTier;
                
                return (
                  <Card key={tier} className={`relative overflow-hidden ${
                    isCurrentPlan 
                      ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300 shadow-xl' 
                      : 'bg-white/80 backdrop-blur-lg border-white/20 shadow-lg'
                  }`}>
                    {isCurrentPlan && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-blue-600 text-white">Aktuell</Badge>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <PlanIcon className={`h-6 w-6 ${
                          tier === 'basic' ? 'text-gray-600' :
                          tier === 'professional' ? 'text-blue-600' : 'text-purple-600'
                        }`} />
                        <span>{plan.name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Monatliche Updates: <strong>{plan.monthlyUpdates}</strong></p>
                        <p className="text-sm text-gray-600">Rechtsfälle: <strong>{plan.legalCases}</strong></p>
                        <p className="text-sm text-gray-600">Datenquellen: <strong>{plan.dataSources}</strong></p>
                      </div>
                      
                      <div className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <Zap className="h-3 w-3 text-green-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      {!isCurrentPlan && (
                        <Button className="w-full" disabled data-testid={`button-upgrade-${tier}`}>
                          <Lock className="h-4 w-4 mr-2" />
                          Upgrade erforderlich
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}