import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { 
  ShoppingCart, 
  Users, 
  Package, 
  Euro, 
  AlertTriangle, 
  Bot, 
  TrendingUp,
  MessageSquare
} from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: aiTasks } = useQuery({
    queryKey: ['/api/ai-tasks', 'pending'],
    queryFn: () => fetch('/api/ai-tasks/pending').then(res => res.json()),
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['/api/orders/pending'],
    queryFn: () => fetch('/api/orders/pending').then(res => res.json()),
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const dashboardCards = [
    {
      title: "Gesamtumsatz",
      value: `€${stats?.totalRevenue?.toLocaleString('de-DE') || '0'}`,
      description: "In diesem Monat",
      icon: Euro,
      color: "text-green-600",
    },
    {
      title: "Aktive Bestellungen",
      value: stats?.totalOrders || 0,
      description: `${stats?.pendingOrders || 0} wartend`,
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "Kunden",
      value: stats?.totalCustomers || 0,
      description: "Registrierte Kunden",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Produkte",
      value: stats?.totalProducts || 0,
      description: `${stats?.lowStockProducts || 0} niedrig auf Lager`,
      icon: Package,
      color: "text-orange-600",
    },
    {
      title: "KI-Aufgaben",
      value: aiTasks?.length || 0,
      description: "Wartende Automatisierung",
      icon: Bot,
      color: "text-indigo-600",
    },
    {
      title: "Aktive Lieferanten",
      value: stats?.activeSuppliers || 0,
      description: "Verfügbare Lieferanten",
      icon: TrendingUp,
      color: "text-teal-600",
    },
    {
      title: "Offene Gespräche",
      value: stats?.openConversations || 0,
      description: "Kundensupport",
      icon: MessageSquare,
      color: "text-red-600",
    },
    {
      title: "Warnung",
      value: stats?.lowStockProducts || 0,
      description: "Produkte mit niedrigem Lagerbestand",
      icon: AlertTriangle,
      color: "text-yellow-600",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            KI Dropshipping Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Überblick über Ihr vollautomatisiertes Dropshipping-Geschäft
          </p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          🤖 KI Aktiv
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {card.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {card.value}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* AI Automation Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-indigo-600" />
              KI-Automatisierung
            </CardTitle>
            <CardDescription>
              Aktuelle KI-Aufgaben und Automatisierungsstatus
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiTasks && aiTasks.length > 0 ? (
              aiTasks.slice(0, 5).map((task: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">
                      {task.type === 'product_optimization' && 'Produktoptimierung'}
                      {task.type === 'order_processing' && 'Bestellungsabwicklung'}
                      {task.type === 'customer_service' && 'Kundendienst'}
                      {task.type === 'marketing' && 'Marketing-Kampagne'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Priorität: {task.priority === 'high' ? 'Hoch' : task.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                    </p>
                  </div>
                  <Badge variant={task.status === 'pending' ? 'secondary' : 'default'}>
                    {task.status === 'pending' ? 'Wartend' : 'Verarbeitung'}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Keine ausstehenden KI-Aufgaben</p>
                <p className="text-sm text-gray-400">Die KI arbeitet effizient im Hintergrund</p>
              </div>
            )}
            
            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>KI-Automatisierung</span>
                <span>95% aktiv</span>
              </div>
              <Progress value={95} className="w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              Aktuelle Bestellungen
            </CardTitle>
            <CardDescription>
              Neueste Bestellungen und KI-Verarbeitungsstatus
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentOrders && recentOrders.length > 0 ? (
              recentOrders.slice(0, 5).map((order: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">
                      €{parseFloat(order.totalAmount).toLocaleString('de-DE')}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={
                        order.status === 'pending' ? 'secondary' :
                        order.status === 'processing' ? 'default' :
                        order.status === 'shipped' ? 'default' : 'secondary'
                      }
                    >
                      {order.status === 'pending' ? 'Wartend' :
                       order.status === 'processing' ? 'Verarbeitung' :
                       order.status === 'shipped' ? 'Versendet' : order.status}
                    </Badge>
                    {order.aiProcessed && (
                      <p className="text-xs text-green-600 mt-1">🤖 KI verarbeitet</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Keine ausstehenden Bestellungen</p>
                <p className="text-sm text-gray-400">Neue Bestellungen werden hier angezeigt</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Schnelle Aktionen</CardTitle>
          <CardDescription>
            Häufig verwendete KI-Automatisierungsfunktionen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-20"
              onClick={() => {
                fetch('/api/ai/optimize-product', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ allProducts: true })
                });
              }}
            >
              <Package className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Produkte optimieren</div>
                <div className="text-xs text-gray-500">KI-gestützte Verbesserung</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-20"
              onClick={() => {
                fetch('/api/ai/generate-marketing', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ campaignType: 'social_media', budget: 500 })
                });
              }}
            >
              <TrendingUp className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Marketing generieren</div>
                <div className="text-xs text-gray-500">Automatische Kampagnen</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-20"
              onClick={() => {
                fetch('/api/ai-tasks', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ type: 'inventory_optimization', priority: 'medium' })
                });
              }}
            >
              <AlertTriangle className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Lager optimieren</div>
                <div className="text-xs text-gray-500">Bestandsverwaltung</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-20"
              onClick={() => {
                fetch('/api/ai-tasks', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ type: 'customer_segmentation', priority: 'low' })
                });
              }}
            >
              <Users className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Kunden analysieren</div>
                <div className="text-xs text-gray-500">Segmentierung</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}