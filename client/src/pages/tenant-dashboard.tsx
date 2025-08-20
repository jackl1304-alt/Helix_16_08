import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, FileText, AlertTriangle, TrendingUp, Mail, Settings, LogOut, Eye, Download } from 'lucide-react';
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
  const { data: analytics = { 
    totalUpdates: 0, 
    totalCases: 0, 
    criticalAlerts: 0, 
    notifications: 0,
    monthlyViews: 0,
    documentsDownloaded: 0
  }, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/tenant/analytics'],
    enabled: !!tenant?.id,
  });

  const handleLogout = () => {
    localStorage.removeItem('tenant_user');
    window.location.href = '/tenant-login';
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
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Regulatory Updates</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsLoading ? '-' : analytics?.totalUpdates || 0}
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
                    {analyticsLoading ? '-' : analytics?.totalCases || 0}
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
                    {analyticsLoading ? '-' : analytics?.criticalAlerts || 0}
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
                    {analyticsLoading ? '-' : analytics?.notifications || 0}
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
                {updatesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : Array.isArray(regulatoryUpdates) && regulatoryUpdates.length > 0 ? (
                  <div className="space-y-4">
                    {(regulatoryUpdates as any[]).slice(0, 5).map((update: any, index: number) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                        <h4 className="font-medium text-gray-900">{update.title}</h4>
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
                          {analytics?.monthlyViews || 0}
                        </p>
                        <p className="text-sm text-gray-600">Monthly Views</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          {analytics?.documentsDownloaded || 0}
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