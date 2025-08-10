import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Users,
  Building2,
  Plus,
  Edit,
  Trash2,
  Crown,
  Shield,
  Eye,
  BarChart3,
  Settings,
  Mail,
  Calendar,
  DollarSign,
  TrendingUp,
  Globe,
  CheckCircle,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Download,
  MoreHorizontal
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  subscriptionPlan: 'starter' | 'professional' | 'enterprise';
  subscriptionStatus: 'active' | 'suspended' | 'cancelled' | 'trial';
  billingEmail: string;
  maxUsers: number;
  maxDataSources: number;
  apiAccessEnabled: boolean;
  customBrandingEnabled: boolean;
  trialEndsAt?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    tenantUsers: number;
    dashboards: number;
  };
}

const SUBSCRIPTION_PLANS = {
  starter: { name: 'Starter', price: '€299/Monat', color: 'bg-blue-100 text-blue-800' },
  professional: { name: 'Professional', price: '€899/Monat', color: 'bg-purple-100 text-purple-800' },
  enterprise: { name: 'Enterprise', price: '€2.499/Monat', color: 'bg-orange-100 text-orange-800' }
};

const SUBSCRIPTION_STATUS = {
  active: { label: 'Aktiv', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  trial: { label: 'Test', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  suspended: { label: 'Gesperrt', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
  cancelled: { label: 'Gekündigt', color: 'bg-gray-100 text-gray-800', icon: Trash2 }
};

export default function AdminCustomers() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  // Fetch tenants
  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['/api/admin/tenants'],
    queryFn: async () => {
      const response = await fetch('/api/admin/tenants');
      if (!response.ok) throw new Error('Failed to fetch tenants');
      return response.json();
    }
  });

  // Create tenant mutation
  const createTenantMutation = useMutation({
    mutationFn: async (tenantData: any) => {
      const response = await apiRequest('/api/admin/tenants', 'POST', tenantData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tenants'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Kunde erstellt",
        description: "Der neue Kunde wurde erfolgreich angelegt.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update tenant mutation
  const updateTenantMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest(`/api/admin/tenants/${id}`, 'PUT', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tenants'] });
      setEditingTenant(null);
      toast({
        title: "Kunde aktualisiert",
        description: "Die Änderungen wurden gespeichert.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete tenant mutation
  const deleteTenantMutation = useMutation({
    mutationFn: async (tenantId: string) => {
      await apiRequest(`/api/admin/tenants/${tenantId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tenants'] });
      toast({
        title: "Kunde gelöscht",
        description: "Der Kunde wurde erfolgreich entfernt.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Filter tenants
  const filteredTenants = tenants.filter((tenant: Tenant) => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tenant.billingEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = selectedPlan === 'all' || tenant.subscriptionPlan === selectedPlan;
    const matchesStatus = selectedStatus === 'all' || tenant.subscriptionStatus === selectedStatus;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const TenantForm = ({ tenant, onSubmit, onCancel }: { tenant?: Tenant | null; onSubmit: (data: any) => void; onCancel: () => void }) => {
    const [formData, setFormData] = useState({
      name: tenant?.name || '',
      slug: tenant?.slug || '',
      billingEmail: tenant?.billingEmail || '',
      subscriptionPlan: tenant?.subscriptionPlan || 'starter',
      subscriptionStatus: tenant?.subscriptionStatus || 'trial',
      maxUsers: tenant?.maxUsers || 5,
      maxDataSources: tenant?.maxDataSources || 10,
      apiAccessEnabled: tenant?.apiAccessEnabled || false,
      customBrandingEnabled: tenant?.customBrandingEnabled || false
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Firmenname *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">URL-Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
              placeholder="firmenname"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="billingEmail">Billing E-Mail</Label>
          <Input
            id="billingEmail"
            type="email"
            value={formData.billingEmail}
            onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Abo-Plan</Label>
            <Select value={formData.subscriptionPlan} onValueChange={(value: any) => setFormData({ ...formData, subscriptionPlan: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="starter">Starter (€299/Monat)</SelectItem>
                <SelectItem value="professional">Professional (€899/Monat)</SelectItem>
                <SelectItem value="enterprise">Enterprise (€2.499/Monat)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={formData.subscriptionStatus} onValueChange={(value: any) => setFormData({ ...formData, subscriptionStatus: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trial">Test-Phase</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="suspended">Gesperrt</SelectItem>
                <SelectItem value="cancelled">Gekündigt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="maxUsers">Max. Benutzer</Label>
            <Input
              id="maxUsers"
              type="number"
              value={formData.maxUsers}
              onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
              min="1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxDataSources">Max. Datenquellen</Label>
            <Input
              id="maxDataSources"
              type="number"
              value={formData.maxDataSources}
              onChange={(e) => setFormData({ ...formData, maxDataSources: parseInt(e.target.value) })}
              min="1"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={createTenantMutation.isPending || updateTenantMutation.isPending}>
            {tenant ? 'Aktualisieren' : 'Erstellen'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Abbrechen
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-700 rounded-2xl shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Customer Management
            </h1>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 rounded-xl text-sm font-semibold flex items-center gap-1">
                <Users className="w-4 h-4" />
                {filteredTenants.length} Kunden
              </div>
              <div className="px-4 py-2 bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200 rounded-xl text-sm font-semibold flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Multi-Tenant SaaS
              </div>
              <div className="px-4 py-2 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-200 rounded-xl text-sm font-semibold flex items-center gap-1">
                <Crown className="w-4 h-4" />
                Premium Platform
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Verwalten Sie Ihre SaaS-Kunden, Abo-Modelle und Zugriffsberechtigungen mit Executive-Controls
            </p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Neuer Kunde
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Neuen Kunden anlegen</DialogTitle>
            </DialogHeader>
            <TenantForm 
              onSubmit={(data) => createTenantMutation.mutate(data)}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="mr-2 h-5 w-5" />
            Filter & Suche
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Kunde suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger>
                <SelectValue placeholder="Abo-Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Pläne</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="trial">Test</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="suspended">Gesperrt</SelectItem>
                <SelectItem value="cancelled">Gekündigt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customer Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTenants.map((tenant: Tenant) => {
          const planInfo = SUBSCRIPTION_PLANS[tenant.subscriptionPlan];
          const statusInfo = SUBSCRIPTION_STATUS[tenant.subscriptionStatus];
          const StatusIcon = statusInfo.icon;

          return (
            <Card key={tenant.id} className="group hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-bold text-lg">
                      {tenant.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tenant.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">/{tenant.slug}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={planInfo.color}>
                    {planInfo.name}
                  </Badge>
                  <Badge className={statusInfo.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusInfo.label}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Benutzer:</span>
                    <span>{tenant._count?.tenantUsers || 0} / {tenant.maxUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dashboards:</span>
                    <span>{tenant._count?.dashboards || 0}</span>
                  </div>
                  {tenant.billingEmail && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Billing:</span>
                      <span className="truncate ml-2">{tenant.billingEmail}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Dialog open={editingTenant?.id === tenant.id} onOpenChange={(open) => !open && setEditingTenant(null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setEditingTenant(tenant)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Bearbeiten
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Kunde bearbeiten</DialogTitle>
                      </DialogHeader>
                      <TenantForm 
                        tenant={editingTenant}
                        onSubmit={(data) => updateTenantMutation.mutate({ id: tenant.id, data })}
                        onCancel={() => setEditingTenant(null)}
                      />
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Kunde löschen?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Diese Aktion kann nicht rückgängig gemacht werden. Alle Daten des Kunden werden permanent gelöscht.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteTenantMutation.mutate(tenant.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Löschen
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTenants.length === 0 && !isLoading && (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Kunden gefunden</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedPlan !== 'all' || selectedStatus !== 'all' 
                ? 'Keine Kunden entsprechen den aktuellen Filterkriterien.'
                : 'Noch keine Kunden vorhanden. Legen Sie den ersten Kunden an.'}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Ersten Kunden anlegen
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}