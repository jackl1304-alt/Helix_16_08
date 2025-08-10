import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Building,
  Users,
  CreditCard,
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Crown,
  Calendar,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  Globe,
  Settings,
  Mail,
  Phone
} from "lucide-react";

// Type definitions
interface CustomerPermissions {
  dashboard: boolean;
  regulatoryUpdates: boolean;
  legalCases: boolean;
  knowledgeBase: boolean;
  newsletters: boolean;
  analytics: boolean;
  reports: boolean;
  dataCollection: boolean;
  globalSources: boolean;
  historicalData: boolean;
  administration: boolean;
  userManagement: boolean;
  systemSettings: boolean;
  auditLogs: boolean;
  aiInsights: boolean;
  advancedAnalytics: boolean;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  subscriptionPlan: 'starter' | 'professional' | 'enterprise';
  subscriptionStatus: 'trial' | 'active' | 'cancelled' | 'suspended';
  billingEmail: string;
  contactName?: string;
  contactEmail?: string;
  maxUsers: number;
  maxDataSources: number;
  apiAccessEnabled: boolean;
  customBrandingEnabled?: boolean;
  customerPermissions?: CustomerPermissions;
  trialEndsAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export default function AdminCustomers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewingTenant, setViewingTenant] = useState<Tenant | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const editTenant = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setIsEditDialogOpen(true);
  };

  const viewTenant = (tenant: Tenant) => {
    setViewingTenant(tenant);
    setIsViewDialogOpen(true);
  };

  const deleteTenant = async (tenantId: string) => {
    if (confirm('Sind Sie sicher, dass Sie diesen Tenant löschen möchten?')) {
      try {
        await apiRequest(`/api/admin/tenants/${tenantId}`, 'DELETE');
        queryClient.invalidateQueries({ queryKey: ['/api/admin/tenants'] });
        toast({
          title: "Tenant gelöscht",
          description: "Der Tenant wurde erfolgreich gelöscht.",
        });
      } catch (error) {
        toast({
          title: "Fehler",
          description: "Fehler beim Löschen des Tenants.",
          variant: "destructive"
        });
      }
    }
  };

  // Fetch tenants/customers
  const { data: customers = [], isLoading } = useQuery<Tenant[]>({
    queryKey: ['/api/admin/tenants']
  });

  // Fetch admin statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      return {
        totalTenants: 3,
        activeTenants: 2,
        trialTenants: 1,
        totalRevenue: 3398,
        avgRevenuePerTenant: 1132.67,
        planDistribution: {
          starter: 1,
          professional: 1,
          enterprise: 1
        },
        growthRate: 15.4,
        churnRate: 2.1
      };
    }
  });

  // Create tenant mutation
  const createTenantMutation = useMutation({
    mutationFn: async (tenantData: any) => {
      // Transform data to match backend schema  
      const payload = {
        name: tenantData.companyName,
        slug: tenantData.companyName?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '',
        industry: tenantData.industry || 'Medical Technology',
        subscriptionPlan: tenantData.subscriptionPlan || 'professional',
        subscriptionStatus: 'trial',
        billingEmail: tenantData.contactEmail,
        contactName: tenantData.contactName,
        contactEmail: tenantData.contactEmail,
        maxUsers: tenantData.subscriptionPlan === 'starter' ? 5 : 
                 tenantData.subscriptionPlan === 'professional' ? 25 : 999999,
        maxDataSources: 10,
        apiAccessEnabled: tenantData.subscriptionPlan !== 'starter'
      };

      return await apiRequest('/api/admin/tenants', 'POST', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tenants'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Tenant erstellt",
        description: "Der neue Tenant wurde erfolgreich erstellt.",
      });
    }
  });

  // Filter customers
  const filteredCustomers = customers.filter((customer: Tenant) => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (customer.contactEmail || customer.billingEmail).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || customer.subscriptionStatus === statusFilter;
    const matchesPlan = planFilter === 'all' || customer.subscriptionPlan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const StatusBadge = ({ status }: { status: string }) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      trial: 'bg-blue-100 text-blue-800',
      suspended: 'bg-red-100 text-red-800',
      canceled: 'bg-gray-100 text-gray-800'
    };
    
    const icons = {
      active: <CheckCircle className="w-3 h-3 mr-1" />,
      trial: <Clock className="w-3 h-3 mr-1" />,
      suspended: <AlertTriangle className="w-3 h-3 mr-1" />,
      canceled: <Trash2 className="w-3 h-3 mr-1" />
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const PlanBadge = ({ plan }: { plan: string }) => {
    const variants = {
      starter: 'bg-blue-100 text-blue-800',
      professional: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-orange-100 text-orange-800'
    };

    const icons = {
      starter: <Building className="w-3 h-3 mr-1" />,
      professional: <Crown className="w-3 h-3 mr-1" />,
      enterprise: <Activity className="w-3 h-3 mr-1" />
    };

    return (
      <Badge className={variants[plan as keyof typeof variants]}>
        {icons[plan as keyof typeof icons]}
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </Badge>
    );
  };

  const CustomerCard = ({ customer }: { customer: Tenant }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-700 rounded-xl text-white font-bold text-lg">
              {customer.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">{customer.name}</h3>
              <div className="flex items-center gap-2 mb-2">
                <StatusBadge status={customer.subscriptionStatus} />
                <PlanBadge plan={customer.subscriptionPlan} />
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {customer.billingEmail || customer.contactEmail || 'Keine E-Mail'}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {customer.maxUsers || 0} Max. Benutzer
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Erstellt: {new Date(customer.createdAt).toLocaleDateString('de-DE')}
                </div>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {customer.subscriptionPlan === 'enterprise' ? '€2,499' : 
               customer.subscriptionPlan === 'professional' ? '€899' : '€199'}
              <span className="text-sm text-muted-foreground">/Monat</span>
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              {customer.maxDataSources} Datenquellen / {customer.maxUsers} Max. Benutzer
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => viewTenant(customer)} title="Tenant anzeigen">
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => editTenant(customer)} title="Tenant bearbeiten">
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => deleteTenant(customer.id)} title="Tenant löschen">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold">{customer.maxUsers}</div>
            <div className="text-xs text-muted-foreground">Max. Benutzer</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{customer.maxDataSources}</div>
            <div className="text-xs text-muted-foreground">Datenquellen</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{customer.apiAccessEnabled ? 'Ja' : 'Nein'}</div>
            <div className="text-xs text-muted-foreground">API-Zugang</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">
              {customer.subscriptionStatus === 'trial' ? 'Test' : 'Aktiv'}
            </div>
            <div className="text-xs text-muted-foreground">Status</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Kunden-Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Verwalten Sie Ihre SaaS-Kunden und deren Subscriptions
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Neuen Kunden hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Neuen Tenant erstellen</DialogTitle>
              <DialogDescription>
                Erstellen Sie einen neuen Kunden-Tenant mit Subscription
              </DialogDescription>
            </DialogHeader>
            <div className="text-center py-8">
              <Building className="w-16 h-16 mx-auto mb-4 text-blue-500" />
              <p className="text-muted-foreground">
                Tenant-Erstellung über das vollständige Onboarding-System
              </p>
              <Button className="mt-4" onClick={() => window.open('/tenant-onboarding', '_blank')}>
                Onboarding-Prozess starten
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Tenant View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Tenant Details - {viewingTenant?.name}</DialogTitle>
              <DialogDescription>
                Vollständige Informationen zum Tenant
              </DialogDescription>
            </DialogHeader>
            {viewingTenant && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Firma</Label>
                    <p className="text-sm text-muted-foreground">{viewingTenant.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Slug</Label>
                    <p className="text-sm text-muted-foreground">{viewingTenant.slug}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">E-Mail</Label>
                    <p className="text-sm text-muted-foreground">{viewingTenant.billingEmail}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Subscription Plan</Label>
                    <Badge variant={viewingTenant.subscriptionPlan === 'enterprise' ? 'destructive' : 'default'}>
                      {viewingTenant.subscriptionPlan}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge variant={viewingTenant.subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                      {viewingTenant.subscriptionStatus}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Max. Benutzer</Label>
                    <p className="text-sm text-muted-foreground">{viewingTenant.maxUsers}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Max. Datenquellen</Label>
                    <p className="text-sm text-muted-foreground">{viewingTenant.maxDataSources}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">API-Zugang</Label>
                    <p className="text-sm text-muted-foreground">{viewingTenant.apiAccessEnabled ? 'Aktiviert' : 'Deaktiviert'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Erstellt am</Label>
                    <p className="text-sm text-muted-foreground">{new Date(viewingTenant.createdAt).toLocaleDateString('de-DE')}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Trial endet am</Label>
                    <p className="text-sm text-muted-foreground">
                      {viewingTenant.trialEndsAt ? new Date(viewingTenant.trialEndsAt).toLocaleDateString('de-DE') : 'Kein Trial'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Tenant Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tenant bearbeiten - {editingTenant?.name}</DialogTitle>
              <DialogDescription>
                Tenant-Einstellungen ändern
              </DialogDescription>
            </DialogHeader>
            {editingTenant && <TenantEditForm tenant={editingTenant} onClose={() => setIsEditDialogOpen(false)} />}
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Dashboard */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gesamt Tenants</p>
                  <div className="text-2xl font-bold">{stats.totalTenants}</div>
                </div>
                <Building className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aktive Kunden</p>
                  <div className="text-2xl font-bold text-green-600">{stats.activeTenants}</div>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monatsumsatz</p>
                  <div className="text-2xl font-bold text-purple-600">€{stats.totalRevenue.toLocaleString()}</div>
                </div>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Wachstumsrate</p>
                  <div className="text-2xl font-bold text-orange-600">+{stats.growthRate}%</div>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Suche nach Firmenname oder E-Mail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="suspended">Gesperrt</SelectItem>
                <SelectItem value="canceled">Gekündigt</SelectItem>
              </SelectContent>
            </Select>

            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Pläne</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customer List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Lade Kunden...</p>
          </div>
        ) : filteredCustomers?.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Building className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Keine Kunden gefunden
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || planFilter !== 'all' 
                  ? 'Ihre Suchkriterien ergaben keine Treffer.' 
                  : 'Sie haben noch keine Kunden hinzugefügt.'}
              </p>
              {!searchTerm && statusFilter === 'all' && planFilter === 'all' && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ersten Kunden hinzufügen
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredCustomers?.map(customer => (
            <CustomerCard key={customer.id} customer={customer} />
          ))
        )}
      </div>

      {/* Summary Stats */}
      {filteredCustomers && filteredCustomers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Zusammenfassung ({filteredCustomers.length} Kunden)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">
                  €{filteredCustomers.length * 1200}
                </div>
                <div className="text-sm text-muted-foreground">Gesamt-Umsatz/Monat</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {filteredCustomers.reduce((sum, c) => sum + c.maxUsers, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Gesamt-Benutzer</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {filteredCustomers.reduce((sum, c) => sum + c.maxDataSources, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Datenquellen</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {filteredCustomers.filter(c => c.subscriptionStatus === 'active').length}
                </div>
                <div className="text-sm text-muted-foreground">Aktive Kunden</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Tenant Edit Form Schema
const tenantEditSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  subscriptionPlan: z.enum(["starter", "professional", "enterprise"]),
  subscriptionStatus: z.enum(["trial", "active", "cancelled", "suspended"]),
  billingEmail: z.string().email("Gültige E-Mail erforderlich"),
  maxUsers: z.number().min(1),
  maxDataSources: z.number().min(1),
  apiAccessEnabled: z.boolean(),
  customBrandingEnabled: z.boolean()
});

// Tenant Edit Form Component
function TenantEditForm({ tenant, onClose }: { tenant: any, onClose: () => void }) {
  const form = useForm({
    resolver: zodResolver(tenantEditSchema),
    defaultValues: {
      name: tenant.name,
      subscriptionPlan: tenant.subscriptionPlan,
      subscriptionStatus: tenant.subscriptionStatus,
      billingEmail: tenant.billingEmail,
      maxUsers: tenant.maxUsers,
      maxDataSources: tenant.maxDataSources,
      apiAccessEnabled: tenant.apiAccessEnabled,
      customBrandingEnabled: tenant.customBrandingEnabled || false
    }
  });

  const updateTenantMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest(`/api/admin/tenants/${tenant.id}`, 'PUT', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tenants'] });
      toast({
        title: "Tenant aktualisiert",
        description: "Die Tenant-Einstellungen wurden erfolgreich gespeichert.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Speichern der Änderungen.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: any) => {
    updateTenantMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Firmenname</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="billingEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Billing E-Mail</FormLabel>
                <FormControl>
                  <Input {...field} type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="subscriptionPlan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subscription Plan</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="subscriptionStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="active">Aktiv</SelectItem>
                    <SelectItem value="cancelled">Gekündigt</SelectItem>
                    <SelectItem value="suspended">Gesperrt</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="maxUsers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max. Benutzer</FormLabel>
                <FormControl>
                  <Input {...field} type="number" onChange={e => field.onChange(parseInt(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="maxDataSources"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max. Datenquellen</FormLabel>
                <FormControl>
                  <Input {...field} type="number" onChange={e => field.onChange(parseInt(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex items-center space-x-6">
          <FormField
            control={form.control}
            name="apiAccessEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>API-Zugang</FormLabel>
                  <FormDescription>
                    Erlaubt Zugang zu API-Endpunkten
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="customBrandingEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Custom Branding</FormLabel>
                  <FormDescription>
                    Erlaubt eigenes Branding
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        {/* Customer Permissions Section */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="text-lg font-medium">Kundenberechtigung verwalten</h3>
          <p className="text-sm text-muted-foreground">
            Bestimmen Sie, welche Bereiche der Kunde in seinem Dashboard sehen und verwenden darf
          </p>
          <div className="max-h-80 overflow-y-auto border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
            <CustomerPermissionsForm tenant={tenant} />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button type="submit" disabled={updateTenantMutation.isPending}>
            {updateTenantMutation.isPending ? "Speichere..." : "Speichern"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Customer Permissions Component
function CustomerPermissionsForm({ tenant }: { tenant: Tenant }) {
  const [permissions, setPermissions] = useState<CustomerPermissions>(() => {
    return tenant.customerPermissions || {
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
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: async (newPermissions: CustomerPermissions) => {
      return await apiRequest(`/api/admin/tenants/${tenant.id}/permissions`, 'PUT', {
        customerPermissions: newPermissions
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tenants'] });
      toast({
        title: "Berechtigungen aktualisiert",
        description: "Die Kundenberechtigung wurden erfolgreich gespeichert.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Speichern der Berechtigungen.",
        variant: "destructive"
      });
    }
  });

  const handlePermissionChange = (permission: keyof CustomerPermissions, value: boolean) => {
    const newPermissions = { ...permissions, [permission]: value };
    setPermissions(newPermissions);
    updatePermissionsMutation.mutate(newPermissions);
  };

  const permissionCategories = [
    {
      title: "Basis-Zugriff",
      description: "Grundlegende Bereiche für alle Kunden",
      permissions: [
        { key: 'dashboard' as keyof CustomerPermissions, label: 'Dashboard', description: 'Hauptübersicht und Statistiken' },
        { key: 'regulatoryUpdates' as keyof CustomerPermissions, label: 'Regulatory Updates', description: 'Regulatorische Änderungen und Updates' },
        { key: 'legalCases' as keyof CustomerPermissions, label: 'Rechtsprechung', description: 'Gerichtsentscheidungen und Präzedenzfälle' },
        { key: 'knowledgeBase' as keyof CustomerPermissions, label: 'Wissensdatenbank', description: 'Artikel und Dokumentation' },
        { key: 'newsletters' as keyof CustomerPermissions, label: 'Newsletter', description: 'Newsletter-Verwaltung und -Abonnements' }
      ]
    },
    {
      title: "Erweiterte Features",
      description: "Zusätzliche Funktionen je nach Subscription",
      permissions: [
        { key: 'analytics' as keyof CustomerPermissions, label: 'Analytics', description: 'Datenanalyse und Berichte' },
        { key: 'reports' as keyof CustomerPermissions, label: 'Reports', description: 'Detaillierte Berichte generieren' },
        { key: 'aiInsights' as keyof CustomerPermissions, label: 'KI-Insights', description: 'KI-gestützte Analysen und Erkenntnisse' },
        { key: 'advancedAnalytics' as keyof CustomerPermissions, label: 'Erweiterte Analytics', description: 'Fortgeschrittene Analysefunktionen' }
      ]
    },
    {
      title: "Daten-Management",
      description: "Datenquellen und -verwaltung",
      permissions: [
        { key: 'globalSources' as keyof CustomerPermissions, label: 'Globale Quellen', description: 'Zugang zu allen Datenquellen' },
        { key: 'dataCollection' as keyof CustomerPermissions, label: 'Datensammlung', description: 'Eigene Daten sammeln und verwalten' },
        { key: 'historicalData' as keyof CustomerPermissions, label: 'Historische Daten', description: 'Zugang zu historischen Datensätzen' }
      ]
    },
    {
      title: "Administrative Bereiche",
      description: "Nur für besondere Fälle freigeben",
      permissions: [
        { key: 'systemSettings' as keyof CustomerPermissions, label: 'Systemeinstellungen', description: 'Zugang zu Systemkonfiguration' },
        { key: 'userManagement' as keyof CustomerPermissions, label: 'Benutzerverwaltung', description: 'Benutzer innerhalb des Tenants verwalten' },
        { key: 'administration' as keyof CustomerPermissions, label: 'Administration', description: 'Administrative Funktionen' },
        { key: 'auditLogs' as keyof CustomerPermissions, label: 'Audit Logs', description: 'Zugang zu System-Audit-Protokollen' }
      ]
    }
  ];

  return (
    <div className="space-y-4">
      {permissionCategories.map((category) => (
        <div key={category.title} className="space-y-2">
          <div className="pb-2 border-b">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{category.title}</h4>
            <p className="text-xs text-muted-foreground">{category.description}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
            {category.permissions.map((perm) => (
              <div 
                key={perm.key}
                className="flex items-center justify-between rounded-md border p-2 hover:bg-white dark:hover:bg-gray-800 bg-gray-50 dark:bg-gray-900 transition-colors"
              >
                <div className="space-y-0 flex-1 pr-2">
                  <div className="text-xs font-medium text-gray-900 dark:text-gray-100">{perm.label}</div>
                  <div className="text-xs text-muted-foreground truncate">{perm.description}</div>
                </div>
                <Switch 
                  checked={permissions[perm.key]}
                  onCheckedChange={(checked) => handlePermissionChange(perm.key, checked)}
                  disabled={updatePermissionsMutation.isPending}
                  className="flex-shrink-0"
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {updatePermissionsMutation.isPending && (
        <div className="text-xs text-muted-foreground text-center py-2">
          💾 Speichere Änderungen...
        </div>
      )}
    </div>
  );
}