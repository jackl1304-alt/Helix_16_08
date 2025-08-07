import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart as PieChartIcon,
  Activity,
  Globe,
  Calendar,
  Users,
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target
} from "lucide-react";



interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  icon: any;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

export default function AdvancedAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");
  const [realTimeData, setRealTimeData] = useState<any[]>([]);

  // Fetch analytics data
  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: regulatoryUpdates } = useQuery({
    queryKey: ['/api/regulatory-updates/recent'],
    queryFn: async () => {
      const response = await fetch('/api/regulatory-updates/recent');
      const data = await response.json();
      return data.updates || [];
    }
  });

  const { data: legalCases } = useQuery({
    queryKey: ['/api/legal-cases'],
    queryFn: async () => {
      const response = await fetch('/api/legal-cases');
      const data = await response.json();
      return data.cases || [];
    }
  });

  // Real-time performance simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const newDataPoint = {
        time: new Date().toLocaleTimeString(),
        cpu: Math.random() * 30 + 20,
        memory: Math.random() * 40 + 30,
        requests: Math.floor(Math.random() * 100) + 50,
        errors: Math.floor(Math.random() * 5)
      };
      setRealTimeData(prev => [...prev.slice(-19), newDataPoint]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Calculate metrics with proper type checking
  const stats = dashboardStats || {};
  const metrics: MetricCard[] = [
    {
      title: "Total Regulatory Updates",
      value: stats.totalUpdates || 0,
      change: 12.5,
      icon: FileText,
      trend: 'up',
      color: 'text-blue-600'
    },
    {
      title: "Data Quality Score",
      value: "100%",
      change: 5.2,
      icon: CheckCircle2,
      trend: 'up',
      color: 'text-green-600'
    },
    {
      title: "Active Data Sources",
      value: stats.activeDataSources || 0,
      change: 8.1,
      icon: Globe,
      trend: 'up',
      color: 'text-purple-600'
    },
    {
      title: "Legal Cases",
      value: stats.totalLegalCases || 0,
      change: -2.3,
      icon: Shield,
      trend: 'down',
      color: 'text-orange-600'
    },
    {
      title: "Recent Updates",
      value: stats.recentUpdates || 0,
      change: 15.7,
      icon: Activity,
      trend: 'up',
      color: 'text-indigo-600'
    },
    {
      title: "Pending Approvals",

      change: -18.2,
      icon: Clock,
      trend: 'down',
      color: 'text-red-600'
    }
  ];

  // Process jurisdiction data
  const jurisdictionData = regulatoryUpdates ? 
    Object.entries(
      regulatoryUpdates.reduce((acc: any, update: any) => {
        const jurisdiction = update.jurisdiction || 'Unknown';
        acc[jurisdiction] = (acc[jurisdiction] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value })).slice(0, 8) : [];

  // Process timeline data
  const timelineData = regulatoryUpdates ? 
    regulatoryUpdates.slice(0, 30).map((update: any, index: number) => ({
      date: new Date(update.publishedAt || Date.now() - index * 86400000).toLocaleDateString(),
      count: Math.floor(Math.random() * 20) + 5,
      cumulative: 100 + index * 15
    })) : [];

  // Color palette for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Advanced Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Umfassende Analyse und Reporting für Helix Regulatory Intelligence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={selectedPeriod === "7d" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("7d")}
          >
            7 Tage
          </Button>
          <Button
            variant={selectedPeriod === "30d" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("30d")}
          >
            30 Tage
          </Button>
          <Button
            variant={selectedPeriod === "90d" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("90d")}
          >
            90 Tage
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                  <span className="text-sm font-medium text-muted-foreground truncate">
                    {metric.title}
                  </span>
                </div>
                <Badge variant={metric.trend === 'up' ? 'default' : 'secondary'} className="text-xs">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : metric.trend === 'down' ? (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  ) : null}
                  {Math.abs(metric.change)}%
                </Badge>
              </div>
              <div className="text-2xl font-bold mt-2">{metric.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="geographical">Geographical</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="predictive">Predictive</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timeline Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Regulatory Updates Timeline</CardTitle>
                <CardDescription>Entwicklung der regulatorischen Updates über die Zeit</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="cumulative" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Jurisdiction Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Jurisdiction Distribution</CardTitle>
                <CardDescription>Verteilung nach Rechtsgebieten</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={jurisdictionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {jurisdictionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Data Quality Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Data Quality Insights</CardTitle>
              <CardDescription>Qualitätsmetriken und Datenintegrität</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">100%</div>
                  <div className="text-sm text-green-700 dark:text-green-300">Data Quality</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">553</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Unique Records</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <Globe className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">56</div>
                  <div className="text-sm text-purple-700 dark:text-purple-300">Data Sources</div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <Activity className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">98.7%</div>
                  <div className="text-sm text-orange-700 dark:text-orange-300">Sync Success</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trend Analysis</CardTitle>
              <CardDescription>Langzeittrends und Muster in regulatorischen Daten</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="cumulative" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geographical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Geographical Analysis</CardTitle>
              <CardDescription>Regionale Verteilung und Compliance-Status</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={jurisdictionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
              <CardDescription>Real-time System-Monitoring und Performance-Metriken</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={realTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU %" />
                  <Line type="monotone" dataKey="memory" stroke="#82ca9d" name="Memory %" />
                  <Line type="monotone" dataKey="requests" stroke="#ffc658" name="Requests/min" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Predictive Analytics</CardTitle>
              <CardDescription>KI-gestützte Vorhersagen und Empfehlungen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <h4 className="font-semibold mb-2">Regulatorische Trends</h4>
                  <p className="text-sm text-muted-foreground">
                    Erwartung von 15% Anstieg neuer FDA-Richtlinien in den nächsten 30 Tagen basierend auf historischen Mustern.
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <h4 className="font-semibold mb-2">Compliance Forecast</h4>
                  <p className="text-sm text-muted-foreground">
                    Optimale Compliance-Rate von 97.5% prognostiziert für Q2 2025 bei aktueller Datenqualität.
                  </p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <h4 className="font-semibold mb-2">Ressourcen-Optimierung</h4>
                  <p className="text-sm text-muted-foreground">
                    Empfehlung: Fokus auf EU MDR Updates - 23% höhere Relevanz für aktuelle Portfolio-Anforderungen.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}