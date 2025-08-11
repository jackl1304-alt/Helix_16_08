import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { 
  Settings, 
  Users, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Zap,
  Activity,
  RefreshCw
} from "lucide-react";

export default function AdminLiveTest() {
  const [updateMessage, setUpdateMessage] = useState("");
  const queryClient = useQueryClient();

  // Fetch all tenants
  const { data: tenants, isLoading } = useQuery({
    queryKey: ['/api/admin/tenants'],
    refetchInterval: 2000, // Frequent refresh to show live updates
  });

  // Permission update mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ tenantId, permissions }: { tenantId: string, permissions: any }) => {
      const response = await fetch(`/api/admin/tenants/${tenantId}/permissions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(permissions)
      });
      if (!response.ok) throw new Error('Failed to update permissions');
      return await response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tenants'] });
      setUpdateMessage(`✅ Berechtigungen für Tenant ${variables.tenantId} aktualisiert!`);
      setTimeout(() => setUpdateMessage(""), 3000);
    },
    onError: (error) => {
      setUpdateMessage(`❌ Fehler beim Aktualisieren: ${error.message}`);
      setTimeout(() => setUpdateMessage(""), 3000);
    }
  });

  const updatePermission = (tenantId: string, permission: string, value: boolean) => {
    if (!Array.isArray(tenants)) return;
    const tenant = tenants.find((t: any) => t.id === tenantId);
    if (!tenant) return;

    const updatedPermissions = {
      ...tenant.customerPermissions,
      [permission]: value
    };

    updatePermissionsMutation.mutate({
      tenantId,
      permissions: updatedPermissions
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Live Multi-Tenant Synchronisation Test
          </h1>
          <p className="text-gray-600">
            Admin-Interface zur Live-Verwaltung von Customer Portal Berechtigungen
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-500 animate-pulse" />
          <span className="text-sm text-green-600 font-medium">Live-Updates aktiv</span>
        </div>
      </div>

      {updateMessage && (
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription>{updateMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {Array.isArray(tenants) && tenants.map((tenant: any) => (
          <Card key={tenant.id} className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {tenant.name?.charAt(0) || 'T'}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{tenant.name}</CardTitle>
                    <p className="text-sm text-gray-500">{tenant.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/tenant/${tenant.id}/dashboard`, '_blank')}
                  >
                    Customer Portal öffnen
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Customer Portal Berechtigungen
                </h4>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* Dashboard Permissions */}
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-700">Core Features</h5>
                    {[
                      { key: 'dashboard', label: 'Dashboard' },
                      { key: 'regulatoryUpdates', label: 'Regulatory Updates' },
                      { key: 'legalCases', label: 'Legal Cases' },
                      { key: 'knowledgeBase', label: 'Knowledge Base' },
                      { key: 'newsletters', label: 'Newsletters' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label htmlFor={`${tenant.id}-${key}`} className="text-sm">
                          {label}
                        </Label>
                        <Switch
                          id={`${tenant.id}-${key}`}
                          checked={tenant.customerPermissions?.[key] || false}
                          onCheckedChange={(checked) => updatePermission(tenant.id, key, checked)}
                          disabled={updatePermissionsMutation.isPending}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Analytics Permissions */}
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-700">Analytics & Reports</h5>
                    {[
                      { key: 'analytics', label: 'Analytics' },
                      { key: 'reports', label: 'Reports' },
                      { key: 'aiInsights', label: 'AI Insights' },
                      { key: 'advancedAnalytics', label: 'Advanced Analytics' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label htmlFor={`${tenant.id}-${key}`} className="text-sm">
                          {label}
                        </Label>
                        <Switch
                          id={`${tenant.id}-${key}`}
                          checked={tenant.customerPermissions?.[key] || false}
                          onCheckedChange={(checked) => updatePermission(tenant.id, key, checked)}
                          disabled={updatePermissionsMutation.isPending}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Admin Permissions */}
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-700">Administration</h5>
                    {[
                      { key: 'administration', label: 'Administration' },
                      { key: 'userManagement', label: 'User Management' },
                      { key: 'systemSettings', label: 'System Settings' },
                      { key: 'auditLogs', label: 'Audit Logs' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label htmlFor={`${tenant.id}-${key}`} className="text-sm">
                          {label}
                        </Label>
                        <Switch
                          id={`${tenant.id}-${key}`}
                          checked={tenant.customerPermissions?.[key] || false}
                          onCheckedChange={(checked) => updatePermission(tenant.id, key, checked)}
                          disabled={updatePermissionsMutation.isPending}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Letzte Aktualisierung: {new Date().toLocaleTimeString('de-DE')}
                    </div>
                    <div className="flex items-center gap-2">
                      {updatePermissionsMutation.isPending && (
                        <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                      )}
                      <span className="text-xs text-green-600">
                        Live-Sync aktiv
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Test-Anweisungen</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <ol className="list-decimal list-inside space-y-2">
            <li>Klicken Sie auf "Customer Portal öffnen" um das Kundendashboard in einem neuen Tab zu öffnen</li>
            <li>Ändern Sie hier die Berechtigungen durch Aktivieren/Deaktivieren der Switches</li>
            <li>Beobachten Sie, wie sich die Navigation und verfügbaren Features im Customer Portal in Echtzeit ändern</li>
            <li>Updates werden alle 3 Sekunden synchronisiert</li>
            <li>Die Änderungen sind sofort in der Customer-Navigation sichtbar</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}