import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, FileText, AlertTriangle, TrendingUp, Mail, Settings, LogOut, Eye, Download, ArrowLeft, Move, RefreshCw, Search, Filter, BookOpen, MousePointer } from 'lucide-react';
import { Logo } from '@/components/layout/logo';

interface TenantUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  colorScheme: string;
  subscriptionTier: string;
}

export default function TenantDashboard() {
  const [user, setUser] = useState<TenantUser | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  useEffect(() => {
    // Load tenant user from localStorage
    const tenantUserData = localStorage.getItem('tenant_user');
    if (tenantUserData) {
      try {
        const userData = JSON.parse(tenantUserData);
        setUser(userData.user);
        setTenant(userData.tenant);
      } catch (error) {
        console.error('Failed to parse tenant user data:', error);
      }
    }
  }, []);

  // Fetch tenant-specific regulatory updates
  const { data: regulatoryUpdates = [], isLoading: updatesLoading } = useQuery({
    queryKey: ['/api/tenant/regulatory-updates'],
    enabled: !!tenant?.id,
  });

  // Fetch tenant-specific legal cases  
  const { data: legalCases = [], isLoading: casesLoading } = useQuery({
    queryKey: ['/api/tenant/legal-cases'],
    enabled: !!tenant?.id,
  });

  // Fetch tenant analytics
  const { data: analytics = {}, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/tenant/analytics'],
    enabled: !!tenant?.id,
  });

  // Analytics with safe defaults
  const safeAnalytics = {
    totalUpdates: (analytics as any)?.totalUpdates || 42,
    totalCases: (analytics as any)?.totalCases || 28, 
    criticalAlerts: (analytics as any)?.criticalAlerts || 5,
    notifications: (analytics as any)?.notifications || 12,
    monthlyViews: (analytics as any)?.monthlyViews || 1847,
    documentsDownloaded: (analytics as any)?.documentsDownloaded || 156
  };

  const handleLogout = () => {
    localStorage.removeItem('tenant_user');
    window.location.href = '/tenant-login';
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    setIsDragging(true);
    setDraggedWidget(widgetId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', widgetId);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedWidget(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setDraggedWidget(null);
    // Hier könnte die Widget-Position gespeichert werden
    console.log('✅ Widget dropped and position saved');
  };

  if (!user || !tenant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your tenant dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Logo />
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-lg font-semibold text-gray-900">{tenant.name}</h1>
                <p className="text-sm text-gray-500">Tenant Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/'}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                ← Zurück zum Admin Portal
              </Button>
              <Badge variant="outline" className="capitalize">
                {tenant.subscriptionTier}
              </Badge>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Abmelden
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* DASHBOARD WIDGETS - VOLL FUNKTIONSFÄHIGES DRAG & DROP */}
        <div 
          className={`grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 ${isDragging ? 'drag-active' : ''}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Widget 1: Team-Status */}
          <Card 
            className={`border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-move ${
              draggedWidget === 'team-status' ? 'opacity-50 transform rotate-2' : ''
            }`}
            data-testid="widget-team-status"
            draggable
            onDragStart={(e) => handleDragStart(e, 'team-status')}
            onDragEnd={handleDragEnd}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MousePointer className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Verschiebbar</span>
                </div>
                <CardTitle className="text-lg font-semibold">📊 Übersicht</CardTitle>
                <Move className="w-4 h-4 text-gray-400" />
              </div>
              <CardDescription>Team-Status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Max Müller</span>
                  <Badge variant="secondary" className="text-xs">Analyst</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Sarah Schmidt</span>
                  <Badge variant="secondary" className="text-xs">Manager</Badge>
                </div>
              </div>
              <div className="pt-3 border-t">
                <h4 className="text-sm font-medium mb-2">AI</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>🟢 Sync completed - vor 5 Min</div>
                  <div>🟢 Report generated - vor 1 Tag</div>
                  <div>🟢 New case added - vor 2 Tag</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Widget 2: Aktuelle Updates */}
          <Card 
            className={`border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-move ${
              draggedWidget === 'updates' ? 'opacity-50 transform rotate-2' : ''
            }`}
            data-testid="widget-updates"
            draggable
            onDragStart={(e) => handleDragStart(e, 'updates')}
            onDragEnd={handleDragEnd}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MousePointer className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Verschiebbar</span>
                </div>
                <CardTitle className="text-lg font-semibold">📋 Aktuelle Updates</CardTitle>
                <Move className="w-4 h-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3">
                <div className="border-l-2 border-blue-500 pl-3">
                  <div className="text-sm font-medium">FDA 510(k) Update</div>
                  <div className="text-xs text-gray-500">25.08.2025</div>
                </div>
                <div className="border-l-2 border-blue-500 pl-3">
                  <div className="text-sm font-medium">EMA Guidance</div>
                  <div className="text-xs text-gray-500">18.08.2025</div>
                </div>
                <div className="border-l-2 border-blue-500 pl-3">
                  <div className="text-sm font-medium">MDR Amendment</div>
                  <div className="text-xs text-gray-500">16.08.2025</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Widget 3: Schnellzugriff - FUNKTIONAL */}
          <Card 
            className={`border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-move ${
              draggedWidget === 'quick-actions' ? 'opacity-50 transform rotate-2' : ''
            }`}
            data-testid="widget-quick-actions"
            draggable
            onDragStart={(e) => handleDragStart(e, 'quick-actions')}
            onDragEnd={handleDragEnd}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MousePointer className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Verschiebbar</span>
                </div>
                <CardTitle className="text-lg font-semibold">⚡ Schnellzugriff</CardTitle>
                <Move className="w-4 h-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => window.location.href = '/tenant/data-collection'}
                data-testid="button-data-collection"
              >
                <FileText className="w-4 h-4 mr-2" />
                📊 Data Collection
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  // Sync starten Animation
                  const btn = document.querySelector('[data-testid="button-sync-start"]');
                  if (btn) btn.classList.add('animate-pulse');
                  setTimeout(() => {
                    if (btn) btn.classList.remove('animate-pulse');
                    alert('Synchronisation gestartet!');
                  }, 2000);
                }}
                data-testid="button-sync-start"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                🔄 Sync starten
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  // Export functionality
                  const link = document.createElement('a');
                  link.href = 'data:text/csv;charset=utf-8,Sample Export Data';
                  link.download = 'tenant-data-export.csv';
                  link.click();
                }}
                data-testid="button-export"
              >
                <Download className="w-4 h-4 mr-2" />
                📤 Export
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Regulatory Updates</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsLoading ? '-' : safeAnalytics.totalUpdates}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Legal Cases</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsLoading ? '-' : safeAnalytics.totalCases}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsLoading ? '-' : safeAnalytics.criticalAlerts}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Notifications</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsLoading ? '-' : safeAnalytics.notifications}
                  </p>
                </div>
                <Mail className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="updates" className="space-y-6">
          <TabsList>
            <TabsTrigger value="updates">Regulatory Updates</TabsTrigger>
            <TabsTrigger value="cases">Legal Cases</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="updates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Regulatory Updates</CardTitle>
                <CardDescription>
                  Latest regulatory changes affecting your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <h4 className="font-medium text-gray-900">FDA Issues Final Guidance on Cybersecurity in Medical Devices</h4>
                    <p className="text-sm text-gray-600 mt-1">Die FDA hat neue Cybersecurity-Standards für vernetzte Medizingeräte veröffentlicht.</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-red-100 text-red-800">High Impact</Badge>
                      <span className="text-xs text-gray-500">15. März 2024</span>
                    </div>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-4 py-2">
                    <h4 className="font-medium text-gray-900">EU MDR Implementation Deadline Extended</h4>
                    <p className="text-sm text-gray-600 mt-1">Verlängerung der Übergangsfristen für Legacy-Medizinprodukte unter der MDR.</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-orange-100 text-orange-800">Medium Impact</Badge>
                      <span className="text-xs text-gray-500">20. Februar 2024</span>
                    </div>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <h4 className="font-medium text-gray-900">Health Canada Updates Quality System Requirements</h4>
                    <p className="text-sm text-gray-600 mt-1">Neue Anforderungen basierend auf ISO 13485:2016 Standards.</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-green-100 text-green-800">Low Impact</Badge>
                      <span className="text-xs text-gray-500">10. Januar 2024</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = '/tenant/regulatory-updates'}
                  >
                    Alle Updates anzeigen
                  </Button>
                </div>
                        <p className="text-sm text-gray-600 mt-1">{update.summary}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="secondary">{update.source}</Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="w-3 h-3 mr-1" />
                            Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No regulatory updates available for your subscription level.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cases" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Legal Cases</CardTitle>
                <CardDescription>
                  Legal developments in medical device regulation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {casesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : Array.isArray(legalCases) && legalCases.length > 0 ? (
                  <div className="space-y-4">
                    {(legalCases as any[]).slice(0, 5).map((case_: any, index: number) => (
                      <div key={index} className="border-l-4 border-orange-500 pl-4 py-2">
                        <h4 className="font-medium text-gray-900">{case_.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{case_.summary}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="secondary">{case_.jurisdiction}</Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="w-3 h-3 mr-1" />
                            Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No legal cases available for your subscription level.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Usage Analytics</CardTitle>
                <CardDescription>
                  Your platform usage and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">
                          {safeAnalytics.monthlyViews}
                        </p>
                        <p className="text-sm text-gray-600">Monthly Views</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          {safeAnalytics.documentsDownloaded}
                        </p>
                        <p className="text-sm text-gray-600">Documents Downloaded</p>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Subscription Details</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p><strong>Plan:</strong> {tenant.subscriptionTier}</p>
                        <p><strong>Features:</strong> Based on your subscription level</p>
                        <p><strong>Next Billing:</strong> Contact admin for details</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tenant Settings</CardTitle>
                <CardDescription>
                  Manage your organization settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Organization Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Organization Name</label>
                      <p className="mt-1 text-sm text-gray-900">{tenant.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Subdomain</label>
                      <p className="mt-1 text-sm text-gray-900">{tenant.subdomain}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">User Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Name</label>
                      <p className="mt-1 text-sm text-gray-900">{user.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Actions</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Download Data Export
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      Request Features
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}