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

export default function AdminCustomers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch tenants/customers
  const { data: customers, isLoading } = useQuery({
    queryKey: ['/api/admin/tenants'],
    queryFn: async () => {
      // In production: await fetch('/api/admin/tenants')
      return [
        {
          id: 'tenant_001',
          name: 'MedTech Solutions GmbH',
          slug: 'medtech-solutions',
          contactEmail: 'admin@medtech-solutions.com',
          contactName: 'Dr. Sarah Weber',
          subscriptionPlan: 'professional',
          subscriptionStatus: 'active',
          createdAt: new Date('2024-01-15'),
          lastLogin: new Date('2025-08-09'),
          userCount: 12,
          monthlyUsage: 1247,
          monthlyLimit: 2500,
          revenue: 899,
          industry: 'Medizintechnik',
          companySize: '51-200',
          regions: ['US', 'EU']
        },
        {
          id: 'tenant_002',
          name: 'BioPharm Analytics Inc.',
          slug: 'biopharm-analytics',
          contactEmail: 'contact@biopharm-analytics.com',
          contactName: 'Michael Johnson',
          subscriptionPlan: 'enterprise',
          subscriptionStatus: 'active',
          createdAt: new Date('2024-03-22'),
          lastLogin: new Date('2025-08-10'),
          userCount: 45,
          monthlyUsage: 8950,
          monthlyLimit: -1,
          revenue: 2499,
          industry: 'Pharma',
          companySize: '201-1000',
          regions: ['US', 'EU', 'Asia']
        },
        {
          id: 'tenant_003',
          name: 'RegTech Startup',
          slug: 'regtech-startup',
          contactEmail: 'founders@regtech-startup.io',
          contactName: 'Alex Chen',
          subscriptionPlan: 'starter',
          subscriptionStatus: 'trial',
          createdAt: new Date('2025-07-28'),
          lastLogin: new Date('2025-08-08'),
          userCount: 3,
          monthlyUsage: 156,
          monthlyLimit: 500,
          revenue: 0,
          industry: 'Regulatory Consulting',
          companySize: '1-10',
          regions: ['US']
        }
      ];
    }
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
      // In production: await apiRequest('/api/admin/tenants', 'POST', tenantData)
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { id: 'tenant_' + Math.random().toString(36).substr(2, 9), ...tenantData };
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
  const filteredCustomers = customers?.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || customer.subscriptionStatus === statusFilter;
    const matchesPlan = planFilter === 'all' || customer.subscriptionPlan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const StatusBadge = ({ status }) => {
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
      <Badge className={variants[status]}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const PlanBadge = ({ plan }) => {
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
      <Badge className={variants[plan]}>
        {icons[plan]}
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </Badge>
    );
  };

  const CustomerCard = ({ customer }) => (
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
                  {customer.contactEmail}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {customer.userCount} Benutzer
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Erstellt: {customer.createdAt.toLocaleDateString('de-DE')}
                </div>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-green-600 mb-1">
              €{customer.revenue.toLocaleString()}<span className="text-sm text-muted-foreground">/Monat</span>
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              {customer.monthlyUsage.toLocaleString()} / {
                customer.monthlyLimit === -1 ? '∞' : customer.monthlyLimit.toLocaleString()
              } Updates
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold">{customer.userCount}</div>
            <div className="text-xs text-muted-foreground">Benutzer</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{Math.round((customer.monthlyUsage / (customer.monthlyLimit || 1)) * 100)}%</div>
            <div className="text-xs text-muted-foreground">Auslastung</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{customer.regions.length}</div>
            <div className="text-xs text-muted-foreground">Regionen</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">
              {Math.floor((Date.now() - customer.lastLogin.getTime()) / (1000 * 60 * 60 * 24))}d
            </div>
            <div className="text-xs text-muted-foreground">Letzte Anmeldung</div>
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
                  €{filteredCustomers.reduce((sum, c) => sum + c.revenue, 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Gesamt-Umsatz/Monat</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {filteredCustomers.reduce((sum, c) => sum + c.userCount, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Gesamt-Benutzer</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {filteredCustomers.reduce((sum, c) => sum + c.monthlyUsage, 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Monatliche Updates</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(filteredCustomers.reduce((sum, c) => sum + (c.monthlyUsage / (c.monthlyLimit || 1)), 0) / filteredCustomers.length * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Ø Auslastung</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}