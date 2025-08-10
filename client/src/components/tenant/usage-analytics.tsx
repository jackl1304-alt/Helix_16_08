import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Clock,
  Users,
  Globe,
  Zap,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface UsageAnalyticsProps {
  tenantId: string;
}

export default function UsageAnalytics({ tenantId }: UsageAnalyticsProps) {
  const [timeRange, setTimeRange] = useState('30d');
  const [metric, setMetric] = useState('requests');

  // Fetch usage analytics
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/customer/usage', tenantId, timeRange],
    queryFn: async () => {
      return {
        currentPeriod: {
          dataRequests: 1247,
          apiCalls: 312,
          users: 12,
          activeRegions: ['US', 'EU', 'Asia']
        },
        limits: {
          monthlyUpdates: 2500,
          maxUsers: 25,
          apiCallsPerMonth: 10000
        },
        trends: {
          dataRequests: { value: 8.2, direction: 'up' },
          apiCalls: { value: -2.1, direction: 'down' },
          users: { value: 0, direction: 'stable' }
        },
        dailyUsage: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          requests: Math.floor(Math.random() * 100) + 20,
          apiCalls: Math.floor(Math.random() * 30) + 5,
          users: Math.floor(Math.random() * 5) + 8
        })),
        hourlyUsage: Array.from({ length: 24 }, (_, i) => ({
          hour: `${i.toString().padStart(2, '0')}:00`,
          requests: Math.floor(Math.random() * 20) + 5,
          apiCalls: Math.floor(Math.random() * 8) + 1
        })),
        regionUsage: [
          { region: 'USA (FDA)', requests: 498, percentage: 40, trend: 'up' },
          { region: 'Europa (EMA)', requests: 436, percentage: 35, trend: 'stable' },
          { region: 'Asien-Pazifik', requests: 313, percentage: 25, trend: 'up' }
        ],
        categoryUsage: [
          { category: 'Regulatory Updates', count: 856, percentage: 68.6 },
          { category: 'Legal Cases', count: 234, percentage: 18.8 },
          { category: 'AI Insights', count: 157, percentage: 12.6 }
        ]
      };
    }
  });

  const MetricCard = ({ title, value, limit, trend, icon: Icon, color = "blue" }: {
    title: string;
    value: number;
    limit?: number;
    trend?: { value: number; direction: 'up' | 'down' | 'stable' };
    icon: any;
    color?: string;
  }) => {
    const percentage = limit ? (value / limit) * 100 : 0;
    const trendIcon = trend?.direction === 'up' ? <TrendingUp className="w-3 h-3" /> : 
                     trend?.direction === 'down' ? <TrendingDown className="w-3 h-3" /> : null;
    const trendColor = trend?.direction === 'up' ? 'text-green-600' : 
                      trend?.direction === 'down' ? 'text-red-600' : 'text-gray-500';

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <div className="text-2xl font-bold">
                {value.toLocaleString()}
                {limit && <span className="text-sm text-muted-foreground font-normal"> / {limit.toLocaleString()}</span>}
              </div>
              {trend && (
                <p className={`text-xs ${trendColor} flex items-center gap-1 mt-1`}>
                  {trendIcon}
                  {Math.abs(trend.value)}% {trend.direction === 'up' ? 'Anstieg' : trend.direction === 'down' ? 'Rückgang' : 'Stabil'}
                </p>
              )}
            </div>
            <div className={`h-12 w-12 rounded-lg bg-${color}-100 dark:bg-${color}-900/20 flex items-center justify-center`}>
              <Icon className={`h-6 w-6 text-${color}-600`} />
            </div>
          </div>
          
          {limit && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Auslastung</span>
                <span>{percentage.toFixed(1)}%</span>
              </div>
              <Progress value={percentage} className="h-2" />
              {percentage > 80 && (
                <div className="flex items-center gap-1 text-xs text-orange-600">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Limit bald erreicht</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const RegionCard = ({ region, requests, percentage, trend }: {
    region: string;
    requests: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  }) => (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded"></div>
        <div>
          <p className="font-medium">{region}</p>
          <p className="text-sm text-muted-foreground">{requests.toLocaleString()} Requests</p>
        </div>
      </div>
      <div className="text-right">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">{percentage}%</span>
          <Badge className={
            trend === 'up' ? 'bg-green-100 text-green-800' : 
            trend === 'down' ? 'bg-red-100 text-red-800' : 
            'bg-blue-100 text-blue-800'
          }>
            {trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : 
             trend === 'down' ? <TrendingDown className="w-3 h-3 mr-1" /> : 
             <CheckCircle className="w-3 h-3 mr-1" />}
            {trend}
          </Badge>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>;
  }

  const chartData = timeRange.includes('h') ? analytics?.hourlyUsage : analytics?.dailyUsage;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex gap-4">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Letzte 24h</SelectItem>
            <SelectItem value="7d">Letzte 7 Tage</SelectItem>
            <SelectItem value="30d">Letzte 30 Tage</SelectItem>
            <SelectItem value="90d">Letzte 90 Tage</SelectItem>
          </SelectContent>
        </Select>

        <Select value={metric} onValueChange={setMetric}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="requests">Data Requests</SelectItem>
            <SelectItem value="apiCalls">API Calls</SelectItem>
            <SelectItem value="users">Active Users</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Daten-Requests"
          value={analytics?.currentPeriod.dataRequests || 0}
          limit={analytics?.limits.monthlyUpdates}
          trend={analytics?.trends.dataRequests}
          icon={Activity}
          color="blue"
        />
        <MetricCard
          title="API Calls"
          value={analytics?.currentPeriod.apiCalls || 0}
          limit={analytics?.limits.apiCallsPerMonth}
          trend={analytics?.trends.apiCalls}
          icon={Zap}
          color="purple"
        />
        <MetricCard
          title="Aktive Benutzer"
          value={analytics?.currentPeriod.users || 0}
          limit={analytics?.limits.maxUsers}
          trend={analytics?.trends.users}
          icon={Users}
          color="green"
        />
        <MetricCard
          title="Aktive Regionen"
          value={analytics?.currentPeriod.activeRegions?.length || 0}
          icon={Globe}
          color="orange"
        />
      </div>

      {/* Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Nutzungsverlauf
          </CardTitle>
          <CardDescription>
            {metric === 'requests' && 'Daten-Requests über die Zeit'}
            {metric === 'apiCalls' && 'API-Calls über die Zeit'}
            {metric === 'users' && 'Aktive Benutzer über die Zeit'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={timeRange.includes('h') ? 'hour' : 'date'} />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey={metric} 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Regional Usage & Category Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Regionale Nutzung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.regionUsage?.map((region, index) => (
                <RegionCard key={index} {...region} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Kategorie-Aufschlüsselung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.categoryUsage?.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{category.category}</span>
                    <span className="text-muted-foreground">{category.count.toLocaleString()}</span>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                  <div className="text-xs text-muted-foreground text-right">
                    {category.percentage.toFixed(1)}%
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