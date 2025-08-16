import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomerNavigation, { type CustomerPermissions } from '@/components/customer/customer-navigation';
import { useLiveTenantPermissions } from '@/hooks/use-live-tenant-permissions';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { AlertTriangle, Clock, FileText, Scale, DollarSign, Brain, Gavel, RefreshCw, Download } from 'lucide-react';

// Mock tenant ID
const mockTenantId = "030d3e01-32c4-4f95-8d54-98be948e8d4b";

interface LegalCase {
  id: string;
  case_number: string;
  title: string;
  court: string;
  jurisdiction: string;
  decision_date: string;
  summary: string;
  content: string;
  document_url?: string;
  impact_level?: string;
  keywords?: string[];
  judgment?: string;
  damages?: string;
  financial_impact?: string;
  device_type?: string;
  language?: string;
  tags?: string[];
}

export default function CustomerLegalCases() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const params = useParams();
  const tenantId = params.tenantId || mockTenantId;
  const { t } = useLanguage();

  // Use live tenant permissions hook for real-time updates
  const { 
    permissions: livePermissions, 
    tenantName: liveTenantName, 
    isLoading: isTenantLoading 
  } = useLiveTenantPermissions({ 
    tenantId,
    pollInterval: 3000
  });

  // Use live permissions with fallback
  const permissions = livePermissions || {
    dashboard: true,
    regulatoryUpdates: true,
    legalCases: true,
    knowledgeBase: false,
    newsletters: false,
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

  // Fetch legal cases - only if user has permission
  const { data: legalCases = [], isLoading, error } = useQuery({
    queryKey: ['legal-cases-customer', tenantId],
    queryFn: async () => {
      const response = await fetch('/api/legal-cases');
      if (!response.ok) throw new Error('Failed to fetch legal cases');
      return await response.json();
    },
    enabled: Boolean(permissions?.legalCases)
  });

  if (isTenantLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex items-center justify-center w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Check permission
  if (!permissions?.legalCases) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Language Selector - Top Right */}
        <div className="fixed top-4 right-4 z-50">
          <LanguageSelector />
        </div>
        
        <CustomerNavigation 
          permissions={permissions} 
          tenantName={liveTenantName || "Customer Portal"} 
        />
        
        <main className="ml-64 flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                {t('access.restricted')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Sie haben keine Berechtigung für den Zugriff auf Rechtsprechung. 
                Kontaktieren Sie Ihren Administrator für weitere Informationen.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Language Selector - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector />
      </div>
      
      <CustomerNavigation 
        permissions={permissions} 
        tenantName={liveTenantName || "Customer Portal"} 
      />
      
      <main className="ml-64 flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Rechtsprechung
            </h1>
            <p className="text-gray-600">
              Gerichtsentscheidungen und Präzedenzfälle im Medizinprodukterecht
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <Input
                    placeholder="Suche nach Fällen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Jurisdiction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Jurisdiktionen</SelectItem>
                      <SelectItem value="germany">Deutschland</SelectItem>
                      <SelectItem value="eu">Europa</SelectItem>
                      <SelectItem value="usa">USA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Input
                    type="date"
                    placeholder="Von Datum"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    placeholder="Bis Datum"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                </div>
              ))}
            </div>
          ) : legalCases && Array.isArray(legalCases) && legalCases.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {legalCases.map((legalCase: any) => (
                <Card key={legalCase.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold line-clamp-2">
                        {legalCase.title}
                      </CardTitle>
                      <Badge variant={legalCase.impact_level === 'high' ? 'destructive' : 'default'}>
                        {legalCase.impact_level || 'medium'}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {legalCase.summary}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <Gavel className="w-4 h-4" />
                        <span>{legalCase.court}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(legalCase.decision_date).toLocaleDateString('de-DE')}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {legalCase.case_number}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Details anzeigen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Scale className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Keine Rechtsprechung verfügbar
                </h3>
                <p className="text-gray-500">
                  Aktuell sind keine Gerichtsentscheidungen vorhanden.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}