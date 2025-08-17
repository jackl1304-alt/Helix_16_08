import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Scale, 
  Database, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Settings,
  Bell,
  Download,
  Activity,
  Mail,
  BookOpen,
  Eye,
  Sparkles
} from "lucide-react";

export default function DashboardPerfect() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Exact Header from Screenshot - Big Blue Gradient Box */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Regulatory Intelligence Dashboard</h1>
              <p className="text-blue-100 text-lg">KI-gestützte Analyse • Echtzeit-Updates • 100% Datenqualität</p>
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2 text-blue-100">
                  <Activity className="h-4 w-4" />
                  <span>Live System</span>
                </div>
                <div className="flex items-center gap-2 text-blue-100">
                  <CheckCircle className="h-4 w-4" />
                  <span>70 Quellen aktiv</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold mb-1">66</div>
              <div className="text-lg text-blue-100">Updates</div>
              <div className="text-4xl font-bold mb-1 mt-4">100%</div>
              <div className="text-lg text-blue-100">Qualität</div>
            </div>
          </div>
        </div>

        {/* Six Main Statistics Cards - Exactly like Screenshot */}
        <div className="grid grid-cols-3 gap-6">
          {/* Regulatory Updates */}
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Regulatory Updates</p>
                  <div className="text-3xl font-bold text-gray-900 mb-2">66</div>
                  <p className="text-sm text-gray-500">Aktuelle regulatorische Änderungen</p>
                  <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
                    <span className="text-xs bg-green-100 px-2 py-1 rounded">100% Qualität</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal Cases */}
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Legal Cases</p>
                  <div className="text-3xl font-bold text-gray-900 mb-2">65</div>
                  <p className="text-sm text-gray-500">Rechtsprechnungen und Präzedenzfälle</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                  <Scale className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Sources */}
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Data Sources</p>
                  <div className="text-3xl font-bold text-gray-900 mb-2">70</div>
                  <p className="text-sm text-gray-500">Aktive Datenquellen global</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                  <Database className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Newsletter */}
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Newsletter</p>
                  <div className="text-3xl font-bold text-gray-900 mb-2">7</div>
                  <p className="text-sm text-gray-500">Newsletter-Abonnements</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Knowledge Base */}
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-cyan-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Knowledge Base</p>
                  <div className="text-3xl font-bold text-gray-900 mb-2">131</div>
                  <p className="text-sm text-gray-500">Artikel und Expertenwissen</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-100 to-cyan-200 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-cyan-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis */}
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-pink-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">AI Analysis</p>
                  <div className="text-3xl font-bold text-gray-900 mb-2">24</div>
                  <p className="text-sm text-gray-500">KI-gestützte Analysen</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-pink-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Layout - Left: Regulatory Updates, Right: Newsletter Sources */}
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column - Regulatory Updates */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <CardTitle>Regulatory Updates</CardTitle>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Neueste regulatorische Änderungen aus globalen Behörden
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-semibold">FDA 510(k): Iconix Speed Anchor; Iconix Speed HA+ Anchor (K252544)</div>
                    <div className="text-sm text-gray-600">US 510(k) • Regulatory Update</div>
                  </div>
                  <div className="text-sm text-gray-500">30.7.2025</div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-semibold">FDA 510(k): IntellaMAX System (K252235)</div>
                    <div className="text-sm text-gray-600">US 510(k) • Regulatory Update</div>
                  </div>
                  <div className="text-sm text-gray-500">25.7.2025</div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-semibold">FDA 510(k): MF 50 GIN2 Facial Toning System (K252238)</div>
                    <div className="text-sm text-gray-600">US 510(k) • Regulatory Update</div>
                  </div>
                  <div className="text-sm text-gray-500">18.7.2025</div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-semibold">FDA 510(k): Iconix Speed Anchor; Iconix Speed HA+ Anchor</div>
                    <div className="text-sm text-gray-600">US 510(k) • Regulatory Update</div>
                  </div>
                  <div className="text-sm text-gray-500">30.7.2025</div>
                </div>
              </div>
              <div className="mt-4 p-2 bg-blue-100 rounded">
                <div className="flex items-center justify-center text-blue-700">
                  <span className="text-sm font-medium">Synchronisierung: </span>
                  <span className="ml-2 text-sm">Aktiv</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Newsletter Sources */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-green-600" />
                  <CardTitle>Newsletter Sources</CardTitle>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Automatische MedTech-Newsletter für automatische Produktbenachrichtigung
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-semibold">FDA News & Updates</div>
                    <div className="text-sm text-gray-600">Aktuelle FDA Updates</div>
                  </div>
                  <Badge className="bg-blue-600 text-white">Aktiv</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-semibold">EMA Newsletter</div>
                    <div className="text-sm text-gray-600">Europäische Arzneimittel-Agentur</div>
                  </div>
                  <Badge className="bg-blue-600 text-white">Aktiv</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-semibold">MedTech Dive</div>
                    <div className="text-sm text-gray-600">Medizintechnik Industry News</div>
                  </div>
                  <Badge className="bg-blue-600 text-white">Aktiv</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}