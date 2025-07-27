import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  Globe, 
  Calendar, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Filter,
  Download
} from "lucide-react";

interface AnalyticsData {
  regionDistribution: Array<{ region: string; count: number; percentage: number }>;
  categoryBreakdown: Array<{ category: string; count: number; color: string }>;
  timelineData: Array<{ date: string; updates: number; approvals: number }>;
  priorityStats: Array<{ priority: string; count: number; color: string }>;
  sourcePerformance: Array<{ source: string; updates: number; lastSync: string; status: string }>;
  languageDistribution: Array<{ language: string; count: number }>;
  monthlyTrends: Array<{ month: string; total: number; regulations: number; standards: number; rulings: number }>;
}

const COLORS = {
  primary: "#3b82f6",
  secondary: "#10b981", 
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#6366f1",
  success: "#22c55e"
};

const mockAnalyticsData: AnalyticsData = {
  regionDistribution: [
    { region: "EU", count: 245, percentage: 32 },
    { region: "US", count: 198, percentage: 26 },
    { region: "DE", count: 156, percentage: 20 },
    { region: "JP", count: 89, percentage: 12 },
    { region: "CH", count: 45, percentage: 6 },
    { region: "CN", count: 32, percentage: 4 }
  ],
  categoryBreakdown: [
    { category: "Regulations", count: 342, color: COLORS.primary },
    { category: "Standards", count: 198, color: COLORS.secondary },
    { category: "Approvals", count: 156, color: COLORS.info },
    { category: "Legal Rulings", count: 89, color: COLORS.warning }
  ],
  timelineData: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    updates: Math.floor(Math.random() * 25) + 5,
    approvals: Math.floor(Math.random() * 15) + 2
  })),
  priorityStats: [
    { priority: "Urgent", count: 23, color: COLORS.danger },
    { priority: "High", count: 156, color: COLORS.warning },
    { priority: "Medium", count: 398, color: COLORS.info },
    { priority: "Low", count: 208, color: COLORS.success }
  ],
  sourcePerformance: [
    { source: "FDA", updates: 245, lastSync: "2025-01-27T18:00:00Z", status: "active" },
    { source: "EMA", updates: 198, lastSync: "2025-01-27T17:30:00Z", status: "active" },
    { source: "BfArM", updates: 156, lastSync: "2025-01-27T16:45:00Z", status: "active" },
    { source: "Swissmedic", updates: 89, lastSync: "2025-01-27T15:20:00Z", status: "warning" },
    { source: "PMDA", updates: 67, lastSync: "2025-01-26T14:30:00Z", status: "error" }
  ],
  languageDistribution: [
    { language: "EN", count: 445 },
    { language: "DE", count: 298 },
    { language: "FR", count: 156 },
    { language: "ES", count: 89 },
    { language: "JA", count: 67 },
    { language: "ZH", count: 34 }
  ],
  monthlyTrends: [
    { month: "Jul 2024", total: 234, regulations: 89, standards: 67, rulings: 78 },
    { month: "Aug 2024", total: 298, regulations: 112, standards: 89, rulings: 97 },
    { month: "Sep 2024", total: 345, regulations: 134, standards: 98, rulings: 113 },
    { month: "Oct 2024", total: 387, regulations: 145, standards: 123, rulings: 119 },
    { month: "Nov 2024", total: 423, regulations: 167, standards: 134, rulings: 122 },
    { month: "Dec 2024", total: 456, regulations: 178, standards: 145, rulings: 133 },
    { month: "Jan 2025", total: 489, regulations: 189, standards: 156, rulings: 144 }
  ]
};

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedRegion, setSelectedRegion] = useState("all");

  // In einem echten System würden diese Daten von der API kommen
  const { data: analytics = mockAnalyticsData, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics", timeRange, selectedRegion],
    enabled: false // Mock-Daten verwenden
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "error": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-96 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Umfassende Analyse der globalen regulatorischen Datenlandschaft
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-40">
              <Globe className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Regionen</SelectItem>
              <SelectItem value="EU">Europa</SelectItem>
              <SelectItem value="US">USA</SelectItem>
              <SelectItem value="DE">Deutschland</SelectItem>
              <SelectItem value="JP">Japan</SelectItem>
              <SelectItem value="CN">China</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Tage</SelectItem>
              <SelectItem value="30d">30 Tage</SelectItem>
              <SelectItem value="90d">90 Tage</SelectItem>
              <SelectItem value="1y">1 Jahr</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamte Updates</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.regionDistribution.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +12.5% gegenüber letztem Monat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Quellen</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.sourcePerformance.filter(s => s.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              von {analytics.sourcePerformance.length} konfigurierten Quellen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dringende Updates</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {analytics.priorityStats.find(p => p.priority === 'Urgent')?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Erfordern sofortige Aufmerksamkeit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sprachen</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.languageDistribution.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Unterstützte Sprachen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Regional Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Regionale Verteilung</CardTitle>
            <CardDescription>Updates nach Regionen aufgeschlüsselt</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.regionDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS.primary} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Kategorie-Aufschlüsselung</CardTitle>
            <CardDescription>Verteilung nach Inhaltstyp</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ category, percentage }) => `${category} ${percentage}%`}
                >
                  {analytics.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Timeline and Trends */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Daily Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Tägliche Aktivität</CardTitle>
            <CardDescription>Updates und Genehmigungen der letzten 30 Tage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  interval="preserveStartEnd"
                />
                <YAxis />
                <Tooltip labelFormatter={(value) => formatDate(value as string)} />
                <Area
                  type="monotone"
                  dataKey="updates"
                  stackId="1"
                  stroke={COLORS.primary}
                  fill={COLORS.primary}
                  fillOpacity={0.8}
                />
                <Area
                  type="monotone"
                  dataKey="approvals"
                  stackId="1"
                  stroke={COLORS.secondary}
                  fill={COLORS.secondary}
                  fillOpacity={0.8}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monatliche Trends</CardTitle>
            <CardDescription>Entwicklung über die letzten 7 Monate</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="regulations" 
                  stroke={COLORS.primary} 
                  strokeWidth={2}
                  name="Regulierungen"
                />
                <Line 
                  type="monotone" 
                  dataKey="standards" 
                  stroke={COLORS.secondary} 
                  strokeWidth={2}
                  name="Standards"
                />
                <Line 
                  type="monotone" 
                  dataKey="rulings" 
                  stroke={COLORS.warning} 
                  strokeWidth={2}
                  name="Rechtsprechung"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Source Performance and Priority Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Source Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Quellen-Performance</CardTitle>
            <CardDescription>Status und Leistung der Datenquellen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.sourcePerformance.map((source) => (
                <div key={source.source} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(source.status)}
                    <div>
                      <p className="font-medium">{source.source}</p>
                      <p className="text-sm text-muted-foreground">
                        Letzte Sync: {new Date(source.lastSync).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{source.updates}</p>
                    <p className="text-sm text-muted-foreground">Updates</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Prioritäts-Verteilung</CardTitle>
            <CardDescription>Updates nach Dringlichkeit klassifiziert</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.priorityStats.map((stat) => (
                <div key={stat.priority} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: stat.color }}
                    />
                    <span className="font-medium">{stat.priority}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{stat.count}</span>
                    <Badge variant="outline">
                      {Math.round((stat.count / analytics.priorityStats.reduce((sum, s) => sum + s.count, 0)) * 100)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}