import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  ShoppingCart, 
  Search, 
  Package, 
  Bot, 
  Eye,
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  Euro
} from "lucide-react";

export default function Orders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['/api/orders', { search: searchQuery, status: statusFilter !== 'all' ? statusFilter : undefined }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      return fetch(`/api/orders?${params}`).then(res => res.json());
    },
  });

  const processOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      try {
        const response = await fetch('/api/ai/process-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderId })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Process order error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Update order error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'processing':
        return <Package className="h-4 w-4 text-blue-600" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-green-600" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Wartend';
      case 'processing':
        return 'In Bearbeitung';
      case 'shipped':
        return 'Versendet';
      case 'delivered':
        return 'Zugestellt';
      case 'cancelled':
        return 'Storniert';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'processing':
        return 'default';
      case 'shipped':
        return 'default';
      case 'delivered':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const orderStats = {
    total: orders?.length || 0,
    pending: orders?.filter((o: any) => o.status === 'pending').length || 0,
    processing: orders?.filter((o: any) => o.status === 'processing').length || 0,
    shipped: orders?.filter((o: any) => o.status === 'shipped').length || 0,
    aiProcessed: orders?.filter((o: any) => o.aiProcessed).length || 0,
    totalRevenue: orders?.reduce((sum: number, o: any) => sum + parseFloat(o.totalAmount), 0) || 0,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Bestellverwaltung
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            KI-gestützte Bestellungsabwicklung und -verfolgung
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={() => {
              orders?.filter((o: any) => o.status === 'pending').forEach((order: any) => {
                processOrderMutation.mutate(order.id);
              });
            }}
          >
            <Bot className="h-4 w-4 mr-2" />
            Alle KI-verarbeiten
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Bestellungen suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="pending">Wartend</SelectItem>
                <SelectItem value="processing">In Bearbeitung</SelectItem>
                <SelectItem value="shipped">Versendet</SelectItem>
                <SelectItem value="delivered">Zugestellt</SelectItem>
                <SelectItem value="cancelled">Storniert</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full">
              <Package className="h-4 w-4 mr-2" />
              Filter anwenden
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.total}</div>
            <p className="text-xs text-muted-foreground">Alle Bestellungen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wartend</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.pending}</div>
            <p className="text-xs text-muted-foreground">Benötigen Bearbeitung</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bearbeitung</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.processing}</div>
            <p className="text-xs text-muted-foreground">In Bearbeitung</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Versendet</CardTitle>
            <Truck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.shipped}</div>
            <p className="text-xs text-muted-foreground">Unterwegs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">KI-Verarbeitet</CardTitle>
            <Bot className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.aiProcessed}</div>
            <p className="text-xs text-muted-foreground">Automatisiert</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Umsatz</CardTitle>
            <Euro className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{orderStats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Gesamtumsatz</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders && orders.length > 0 ? (
          orders.map((order: any) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('de-DE', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="hidden md:flex items-center space-x-6">
                      <div>
                        <p className="text-sm font-medium">Kunde</p>
                        <p className="text-sm text-gray-500">{order.customerId || 'Gast'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium">Gesamtbetrag</p>
                        <p className="text-lg font-bold">€{parseFloat(order.totalAmount).toFixed(2)}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium">Zahlungsstatus</p>
                        <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                          {order.paymentStatus === 'paid' ? 'Bezahlt' : 
                           order.paymentStatus === 'pending' ? 'Wartend' : 'Unbezahlt'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {order.aiProcessed && (
                      <Badge variant="secondary" className="bg-green-50 text-green-700">
                        🤖 KI verarbeitet
                      </Badge>
                    )}
                    
                    <Badge variant={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {order.status === 'pending' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => processOrderMutation.mutate(order.id)}
                          disabled={processOrderMutation.isPending}
                        >
                          <Bot className="h-4 w-4 mr-2" />
                          KI-Verarbeiten
                        </Button>
                      )}

                      {order.status === 'processing' && (
                        <Button 
                          size="sm"
                          onClick={() => updateOrderMutation.mutate({ orderId: order.id, status: 'shipped' })}
                          disabled={updateOrderMutation.isPending}
                        >
                          <Truck className="h-4 w-4 mr-2" />
                          Versenden
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Details on Mobile */}
                <div className="md:hidden mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Kunde</p>
                    <p className="text-sm text-gray-500">{order.customerId || 'Gast'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Gesamtbetrag</p>
                    <p className="text-lg font-bold">€{parseFloat(order.totalAmount).toFixed(2)}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Zahlungsstatus</p>
                    <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                      {order.paymentStatus === 'paid' ? 'Bezahlt' : 
                       order.paymentStatus === 'pending' ? 'Wartend' : 'Unbezahlt'}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Tracking</p>
                    <p className="text-sm text-gray-500">
                      {order.trackingNumber || 'Noch nicht verfügbar'}
                    </p>
                  </div>
                </div>

                {/* AI Processing Info */}
                {order.aiProcessed && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                      <Bot className="h-4 w-4" />
                      <span className="font-medium">KI-Automatisierung aktiv</span>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Diese Bestellung wurde automatisch verarbeitet, validiert und an den Lieferanten weitergeleitet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Keine Bestellungen gefunden
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Sobald Kunden Bestellungen aufgeben, werden sie hier angezeigt.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}