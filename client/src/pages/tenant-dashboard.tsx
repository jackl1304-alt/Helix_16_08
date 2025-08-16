import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { DarkModeToggle } from "@/components/ui/dark-mode-toggle";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  FileText, 
  Database, 
  BookOpen, 
  Users, 
  CheckCircle, 
  TrendingUp,
  Mail,
  Loader2,
  Shield,
  BarChart3,
  Settings,
  Globe,
  Activity,
  Sparkles,
  Heart,
  Award,
  Building
} from "lucide-react";

interface TenantUser {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: 'tenant_admin' | 'tenant_user';
}

interface TenantContext {
  id: string;
  name: string;
  subdomain: string;
  colorScheme: 'blue' | 'purple' | 'green';
  subscriptionTier: string;
}

export default function TenantDashboard() {
  const [, setLocation] = useLocation();

  // Fetch tenant-specific dashboard data
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['/api/tenant/dashboard/stats'],
    queryFn: async () => {
      const response = await fetch('/api/tenant/dashboard/stats', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    staleTime: 10000,
    gcTime: 30000,
    refetchOnMount: true,
    retry: 2,
  });

  // Fetch tenant context
  const { data: tenantContext } = useQuery({
    queryKey: ['/api/tenant/context'],
    queryFn: async (): Promise<TenantContext> => {
      const response = await fetch('/api/tenant/context');
      if (!response.ok) throw new Error('Failed to fetch tenant context');
      return response.json();
    }
  });

  // Fetch tenant updates
  const { data: recentUpdates } = useQuery({
    queryKey: ['/api/tenant/regulatory-updates'],
    staleTime: 30000,
    gcTime: 60000,
  });

  // Navigation handlers (tenant-scoped)
  const handleRegulatoryUpdates = () => setLocation('/tenant/regulatory-updates');
  const handleLegalCases = () => setLocation('/tenant/legal-cases');
  const handleKnowledgeBase = () => setLocation('/tenant/knowledge-base');
  const handleAnalytics = () => setLocation('/tenant/analytics');
  const handleSettings = () => setLocation('/tenant/settings');

  // Color scheme based on tenant
  const getColorScheme = () => {
    switch (tenantContext?.colorScheme) {
      case 'purple':
        return {
          primary: 'from-purple-500 to-indigo-600',
          badge: 'text-purple-600',
          glow: 'from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900'
        };
      case 'green':
        return {
          primary: 'from-green-500 to-emerald-600',
          badge: 'text-green-600',
          glow: 'from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900'
        };
      default:
        return {
          primary: 'from-blue-500 to-cyan-600',
          badge: 'text-blue-600',
          glow: 'from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900'
        };
    }
  };

  const colors = getColorScheme();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center mb-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Lade Ihr Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Fehler beim Laden des Dashboards</h3>
          <p className="text-red-600">Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.</p>
        </div>
      </div>
    );
  }

  const dashboardCards = [
    {
      title: "Regulatory Updates",
      value: stats?.totalUpdates || 0,
      description: `${stats?.uniqueUpdates || 0} eindeutige Updates • ${stats?.recentUpdates || 0} diese Woche`,
      icon: FileText,
      color: colors.badge,
    },
    {
      title: "Legal Cases", 
      value: stats?.totalLegalCases || 0,
      description: `${stats?.uniqueLegalCases || 0} eindeutige Fälle • ${stats?.recentLegalCases || 0} neue diese Monat`,
      icon: Database,
      color: colors.badge,
    },
    {
      title: "Data Sources",
      value: stats?.activeDataSources || 0,
      description: "Aktive Datenquellen",
      icon: Globe,
      color: colors.badge,
    },
    {
      title: "Analytics",
      value: stats?.totalUpdates || 0,
      description: "Compliance Tracking",
      icon: BarChart3,
      color: colors.badge,
    }
  ];

  return (
    <div className="custom-cursor min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      <CustomCursor />
      
      {/* Tenant Navigation Header */}
      <div className="glass-nav sticky top-0 z-50 px-6 py-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className={`emotional-float w-12 h-12 bg-gradient-to-r ${colors.primary} rounded-xl shadow-lg flex items-center justify-center`}>
              <Building className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold bg-gradient-to-r ${colors.primary} bg-clip-text text-transparent`}>
                {tenantContext?.name || 'Helix Intelligence'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {tenantContext?.subscriptionTier} Plan
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="emotional-pulse">
              <Activity className="h-3 w-3 mr-1" />
              Tenant Dashboard
            </Badge>
            <DarkModeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={handleSettings}
              className="cursor-hover"
            >
              <Settings className="h-4 w-4 mr-2" />
              Einstellungen
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-8">
        {/* Tenant Hero Section */}
        <div className="relative overflow-hidden rounded-3xl mb-12">
          <div className="absolute inset-0 opacity-10">
            <div className={`absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r ${colors.primary} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob`}></div>
            <div className={`absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-r ${colors.primary} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000`}></div>
          </div>

          <div className="relative z-10 text-center py-16 px-8 bg-gradient-to-br from-white/80 to-blue-50/80 dark:from-slate-900/80 dark:to-blue-950/80 backdrop-blur-sm">
            <h1 className="headline-hero mb-6">
              Regulatory Intelligence
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Ihr persönlicher Bereich für <span className={`font-semibold ${colors.badge}`}>Medizintechnik-Regulierungen</span> 
              mit sicherer Datentrennung
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <Badge variant="outline" className="emotional-glow px-6 py-3 text-base">
                <Shield className="h-5 w-5 mr-2 text-green-500" />
                Sichere Isolation
              </Badge>
              <Badge variant="outline" className="emotional-pulse px-6 py-3 text-base">
                <Award className="h-5 w-5 mr-2 text-yellow-500" />
                Tenant Dashboard
              </Badge>
            </div>
          </div>
        </div>

        {/* Tenant Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <Card key={index} className="glass-card minimal-focus cursor-hover group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {card.title}
                  </CardTitle>
                  <div className={`emotional-float p-2 rounded-lg bg-gradient-to-br ${colors.glow} group-hover:scale-110 transition-transform`}>
                    <IconComponent className={`h-5 w-5 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-2">
                    {Number(card.value).toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tenant Quick Actions */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="headline-section text-2xl flex items-center gap-3">
              <div className={`emotional-glow p-2 rounded-lg bg-gradient-to-br ${colors.primary} text-white`}>
                <Sparkles className="h-6 w-6" />
              </div>
              Ihre Funktionen
            </CardTitle>
            <CardDescription className="text-base">
              Zugang zu Ihren <span className={`font-semibold ${colors.badge}`}>personalisierten Helix-Tools</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Button 
                variant="outline" 
                className="minimal-card cursor-hover flex-col items-center gap-3 h-24 hover:border-blue-400 transition-all group"
                onClick={handleRegulatoryUpdates}
              >
                <div className={`emotional-float p-2 rounded-lg bg-gradient-to-br ${colors.glow} group-hover:scale-110 transition-transform`}>
                  <FileText className={`h-6 w-6 ${colors.badge}`} />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-sm">Regulatory Updates</div>
                  <div className="text-xs text-muted-foreground">Ihre Updates</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="minimal-card cursor-hover flex-col items-center gap-3 h-24 hover:border-purple-400 transition-all group"
                onClick={handleLegalCases}
              >
                <div className={`emotional-pulse p-2 rounded-lg bg-gradient-to-br ${colors.glow} group-hover:scale-110 transition-transform`}>
                  <Database className={`h-6 w-6 ${colors.badge}`} />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-sm">Legal Cases</div>
                  <div className="text-xs text-muted-foreground">Rechtsprechung</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="minimal-card cursor-hover flex-col items-center gap-3 h-24 hover:border-green-400 transition-all group"
                onClick={handleKnowledgeBase}
              >
                <div className={`emotional-float p-2 rounded-lg bg-gradient-to-br ${colors.glow} group-hover:scale-110 transition-transform`}>
                  <BookOpen className={`h-6 w-6 ${colors.badge}`} />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-sm">Knowledge Base</div>
                  <div className="text-xs text-muted-foreground">Wissensdatenbank</div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="minimal-card cursor-hover flex-col items-center gap-3 h-24 hover:border-orange-400 transition-all group"
                onClick={handleAnalytics}
              >
                <div className={`emotional-glow p-2 rounded-lg bg-gradient-to-br ${colors.glow} group-hover:scale-110 transition-transform`}>
                  <BarChart3 className={`h-6 w-6 ${colors.badge}`} />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-sm">Analytics</div>
                  <div className="text-xs text-muted-foreground">Compliance Trends</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}