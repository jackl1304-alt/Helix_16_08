import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CustomerNavigation, { type CustomerPermissions } from '@/components/customer/customer-navigation';
import { useLiveTenantPermissions } from '@/hooks/use-live-tenant-permissions';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Mail, Calendar, Download, Eye, FileText, Globe, Filter } from 'lucide-react';

// Mock tenant ID
const mockTenantId = "030d3e01-32c4-4f95-8d54-98be948e8d4b";

interface Newsletter {
  id: string;
  title: string;
  content: string;
  summary: string;
  published_at: string;
  created_at: string;
  category: string;
  region: string;
  priority: string;
  tags: string[];
  read_time: number;
  downloads: number;
}

export default function CustomerNewsletters() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  
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

  // Fetch newsletters - only if user has permission
  const { data: newsletters, isLoading } = useQuery({
    queryKey: ['/api/newsletters', tenantId],
    queryFn: async () => {
      const response = await fetch('/api/newsletters');
      if (!response.ok) throw new Error('Failed to fetch newsletters');
      return await response.json();
    },
    enabled: Boolean(permissions?.newsletters)
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
  if (!permissions?.newsletters) {
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
                <Mail className="h-5 w-5" />
                {t('access.restricted')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Sie haben keine Berechtigung für den Zugriff auf Newsletter. 
                Kontaktieren Sie Ihren Administrator für weitere Informationen.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Filter newsletters
  const filteredNewsletters = newsletters?.filter((newsletter: Newsletter) => {
    const matchesSearch = newsletter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         newsletter.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || newsletter.category === selectedCategory;
    const matchesRegion = selectedRegion === 'all' || newsletter.region === selectedRegion;
    
    return matchesSearch && matchesCategory && matchesRegion;
  }) || [];

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Newsletter
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Regelmäßige Updates und Zusammenfassungen zu regulatorischen Entwicklungen
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Input
                    placeholder="Suche nach Newslettern..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Kategorien</SelectItem>
                      <SelectItem value="weekly">Wöchentlich</SelectItem>
                      <SelectItem value="monthly">Monatlich</SelectItem>
                      <SelectItem value="special">Sonder-Edition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Regionen</SelectItem>
                      <SelectItem value="eu">Europa</SelectItem>
                      <SelectItem value="usa">USA</SelectItem>
                      <SelectItem value="asia">Asien</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                </div>
              ))}
            </div>
          ) : filteredNewsletters && filteredNewsletters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNewsletters.map((newsletter: Newsletter) => (
                <Card key={newsletter.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold line-clamp-2">
                        {newsletter.title}
                      </CardTitle>
                      <Badge variant={newsletter.priority === 'high' ? 'destructive' : 'default'}>
                        {newsletter.category}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-3">
                      {newsletter.summary}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(newsletter.published_at).toLocaleDateString('de-DE')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Globe className="w-4 h-4" />
                        <span>{newsletter.region}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-500">
                        {newsletter.read_time} Min. Lesezeit
                      </span>
                      <Badge variant="outline">
                        {newsletter.downloads} Downloads
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        Lesen
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                    {newsletter.tags && newsletter.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {newsletter.tags.slice(0, 3).map((tag: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Mail className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Keine Newsletter verfügbar
                </h3>
                <p className="text-gray-500">
                  {searchTerm || selectedCategory !== 'all' || selectedRegion !== 'all' 
                    ? 'Ihre Suchkriterien ergaben keine Treffer.' 
                    : 'Aktuell sind keine Newsletter vorhanden.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}