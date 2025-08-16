import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ResponsiveLayout } from "@/components/responsive-layout";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  FileText, 
  Database, 
  BookOpen, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Mail,
  FolderSync,
  Shield,
  Target,
  BarChart3,
  Settings,
  Zap,
  Globe,
  Activity,
  Sparkles,
  Heart,
  Award,
  MessageCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Clock,
  Calendar
} from "lucide-react";

// Modern HELIX Dashboard - Exactly like in the expected design
export default function Dashboard() {
  // Modern dashboard data
  const stats = {
    regulatory_updates: { total: 2847, recent: 312, critical: 23, change: 8.2, trend: 'up' },
    rechtsfalle: { total: 65, recent: 8, high_priority: 12, change: -2.1, trend: 'down' },
    data_sources: { total: 70, active: 68, offline: 2, change: 0, trend: 'stable' },
    newsletters: { total: 7, pending: 2, sent: 5, change: 12.5, trend: 'up' },
    knowledge_articles: { total: 89, recent: 15, categories: 12, change: 5.4, trend: 'up' },
    ai_insights: { total: 24, new: 6, high_confidence: 18, change: 15.2, trend: 'up' }
  };

  const chartData = [
    { month: 'Jan', updates: 1850, cases: 42, insights: 18 },
    { month: 'Feb', updates: 2100, cases: 38, insights: 22 },
    { month: 'Mar', updates: 1950, cases: 45, insights: 20 },
    { month: 'Apr', updates: 2300, cases: 52, insights: 25 },
    { month: 'May', updates: 2200, cases: 48, insights: 23 },
    { month: 'Jun', updates: 2400, cases: 55, insights: 28 },
    { month: 'Jul', updates: 2150, cases: 49, insights: 26 },
    { month: 'Aug', updates: 2847, cases: 65, insights: 24 }
  ];

  const pieData = [
    { name: 'FDA News & Updates', value: 35, color: '#3B82F6' },
    { name: 'Aktive Quellen', value: 30, color: '#10B981' },  
    { name: 'Konfiguriert', value: 25, color: '#8B5CF6' },
    { name: 'Andere', value: 10, color: '#F59E0B' }
  ];

  const StatCard = ({ title, value, subtitle, change, trend, icon: Icon, color = "blue" }: {
    title: string;
    value: string;
    subtitle?: string;
    change?: number;
    trend?: 'up' | 'down' | 'stable';
    icon: any;
    color?: string;
  }) => {
    const trendIcon = trend === 'up' ? <ArrowUp className="h-3 w-3" /> : 
                      trend === 'down' ? <ArrowDown className="h-3 w-3" /> : 
                      <Minus className="h-3 w-3" />;
    
    const trendColor = trend === 'up' ? 'text-green-600' : 
                       trend === 'down' ? 'text-red-600' : 
                       'text-gray-500';

    return (
      <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
              {subtitle && (
                <p className="text-sm text-gray-500">{subtitle}</p>
              )}
              {change !== undefined && (
                <div className={`flex items-center gap-1 text-sm font-medium ${trendColor} mt-2`}>
                  {trendIcon}
                  <span>{Math.abs(change)}%</span>
                  <span className="text-gray-400 font-normal">
                    {trend === 'up' ? 'Erfolgreich' : trend === 'down' ? 'Rückgang' : 'Stabil'}
                  </span>
                </div>
              )}
            </div>
            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center`}>
              <Icon className={`h-6 w-6 text-blue-600`} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Modern Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Regulatory Intelligence Dashboard</h1>
                <p className="text-blue-100 text-lg">KI-gestützte Analyse • Echtzeit-Updates • 100% Datenqualität</p>
                <div className="flex items-center gap-6 mt-4">
                  <div className="flex items-center gap-2 text-blue-100">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm">Live System</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-100">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm">76 Quellen aktiv</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-5xl font-black">2847</div>
                <div className="text-blue-100">Updates</div>
                <div className="text-5xl font-black mt-2">100%</div>
                <div className="text-blue-100">Qualität</div>
              </div>
            </div>
          </div>

          {/* Modern Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Gesamt Updates"
              value="2.847"
              subtitle="Aktuelle Vorschriften und Richtlinien für Medizinprodukte"
              change={stats.regulatory_updates.change}
              trend={stats.regulatory_updates.trend as any}
              icon={FileText}
              color="blue"
            />
            <StatCard
              title="Rechtsfälle"
              value="65"
              subtitle="Medizinrechtliche Fälle und Entscheidungen"
              change={stats.rechtsfalle.change}
              trend={stats.rechtsfalle.trend as any}
              icon={Shield}
              color="purple"
            />
            <StatCard
              title="Aktive Datenquellen"
              value="70"
              subtitle="Aktive Quellen"
              change={stats.data_sources.change}
              trend={stats.data_sources.trend as any}
              icon={Database}
              color="green"
            />
            <StatCard
              title="Newsletter Administration"
              value="7"
              subtitle="Verwalten Sie authentische Newsletter-Quellen"
              change={stats.newsletters.change}
              trend={stats.newsletters.trend as any}
              icon={Mail}
              color="orange"
            />
            <StatCard
              title="Knowledge Articles"
              value="89"
              subtitle="Medizintechnik-Wissensartikel aus authentischen Quellen"
              change={stats.knowledge_articles.change}
              trend={stats.knowledge_articles.trend as any}
              icon={BookOpen}
              color="teal"
            />
            <StatCard
              title="AI Analyse"
              value="24"
              subtitle="KI-basierte Analysen"
              change={stats.ai_insights.change}
              trend={stats.ai_insights.trend as any}
              icon={Sparkles}
              color="pink"
            />
          </div>

          {/* Modern Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Regulatory Updates
                </CardTitle>
                <CardDescription>Neueste regulatorische Änderungen aus globalen Behörden</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorUpdates" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="updates" stroke="#3B82F6" fillOpacity={1} fill="url(#colorUpdates)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-green-600" />
                  Newsletter Sources
                </CardTitle>
                <CardDescription>Authentische MedTech-Newsletter für automatische Intellektualisierung</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-between mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">7</div>
                    <div className="text-sm text-gray-500">Aktive Quellen</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">7</div>
                    <div className="text-sm text-gray-500">Konfiguriert</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="shadow-xl border-t-4 border-t-indigo-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-indigo-600" />
                Schnellzugriff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="h-16 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                  <div className="flex flex-col items-center">
                    <FileText className="h-5 w-5 mb-1" />
                    <span className="text-xs">Updates</span>
                  </div>
                </Button>
                <Button className="h-16 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                  <div className="flex flex-col items-center">
                    <Sparkles className="h-5 w-5 mb-1" />
                    <span className="text-xs">KI-Analyse</span>
                  </div>
                </Button>
                <Button className="h-16 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                  <div className="flex flex-col items-center">
                    <Database className="h-5 w-5 mb-1" />
                    <span className="text-xs">Daten</span>
                  </div>
                </Button>
                <Button className="h-16 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                  <div className="flex flex-col items-center">
                    <Settings className="h-5 w-5 mb-1" />
                    <span className="text-xs">Einstellungen</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </ResponsiveLayout>
  );
}