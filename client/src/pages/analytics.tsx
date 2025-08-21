import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, PieChart, Activity, LineChart, Download, Share2, Eye, Globe, Target } from "lucide-react";

export default function Analytics() {
  return (
    <div className="space-y-6">
      {/* Purple gradient header exactly like screenshot */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold">Analytics Intelligence</h1>
            </div>
            <div className="flex items-center space-x-4 mb-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Activity className="h-3 w-3 mr-1" />
                Live Charts
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Globe className="h-3 w-3 mr-1" />
                Echtzeit-Metriken
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Target className="h-3 w-3 mr-1" />
                Global Insights
              </Badge>
            </div>
            <p className="text-purple-100">Umfassende Analyse der regulatorischen Datenlandschaft mit Executive-Insights</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="secondary" size="sm" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              <Eye className="h-4 w-4 mr-1" />
              30 Tage
            </Button>
            <Button variant="secondary" size="sm" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Top Stats Cards exactly like screenshot */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Gesamt Updates
            </CardTitle>
            <BarChart3 className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">66</div>
            <p className="text-xs text-blue-600 font-medium mt-1">
              +4.5% gegenüber letztem Monat
            </p>
            <div className="flex items-center mt-2">
              <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-xs text-gray-500">Live Updates</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Rechtsfälle
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">65</div>
            <p className="text-xs text-green-600 font-medium mt-1">
              +8.1% gegenüber letztem Monat
            </p>
            <div className="flex items-center mt-2">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
              <span className="text-xs text-gray-500">Trend steigend</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Weltweite Genehmigungen
            </CardTitle>
            <Globe className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">70</div>
            <p className="text-xs text-purple-600 font-medium mt-1">
              Aktive Datenquellen aktiv
            </p>
            <div className="flex items-center mt-2">
              <div className="h-2 w-2 rounded-full bg-purple-500 mr-2"></div>
              <span className="text-xs text-gray-500">Global verfügbar</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Aktive Datenquellen
            </CardTitle>
            <PieChart className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">70</div>
            <p className="text-xs text-orange-600 font-medium mt-1">
              Datenquellen aktiv
            </p>
            <div className="flex items-center mt-2">
              <div className="h-2 w-2 rounded-full bg-orange-500 mr-2"></div>
              <span className="text-xs text-gray-500">Realzeit-Sync</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section exactly like screenshot */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Regionale Verteilung */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Regionale Verteilung</CardTitle>
            <CardDescription>Updates nach Regionen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              {/* Bar Chart Simulation */}
              <div className="w-full">
                <div className="flex items-end justify-center space-x-8 h-40">
                  <div className="flex flex-col items-center">
                    <div className="w-16 bg-blue-500 rounded-t" style={{height: '120px'}}></div>
                    <span className="text-xs mt-2">Europa</span>
                    <span className="text-xs text-gray-500">24</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-16 bg-blue-400 rounded-t" style={{height: '90px'}}></div>
                    <span className="text-xs mt-2">Nordamerika</span>
                    <span className="text-xs text-gray-500">18</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-16 bg-blue-300 rounded-t" style={{height: '60px'}}></div>
                    <span className="text-xs mt-2">Asien-Pazifik</span>
                    <span className="text-xs text-gray-500">12</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-16 bg-blue-200 rounded-t" style={{height: '40px'}}></div>
                    <span className="text-xs mt-2">Deutschland</span>
                    <span className="text-xs text-gray-500">8</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kategorie Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Kategorie Breakdown</CardTitle>
            <CardDescription>Verteilung nach Datentypen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              {/* Pie Chart Simulation */}
              <div className="relative w-48 h-48">
                <div className="absolute inset-0 rounded-full border-8 border-blue-500" style={{borderRightColor: '#10B981', borderBottomColor: '#F59E0B', borderLeftColor: '#F59E0B'}}></div>
                <div className="absolute inset-4 rounded-full bg-white flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">100%</div>
                    <div className="text-xs text-gray-500">Coverage</div>
                  </div>
                </div>
                <div className="absolute -right-8 top-8 text-xs">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                    <span>Regulatorische Updates: 66</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                    <span>Rechtsfälle: 65</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                    <span>Knowledge Articles: 131</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 30-Tage Trend exactly like screenshot */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">30-Tage Trend</CardTitle>
          <CardDescription>Updates und Genehmigungen über Zeit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {/* Area Chart Simulation */}
            <div className="w-full h-full relative">
              <div className="absolute bottom-0 left-0 w-full h-full">
                <svg viewBox="0 0 800 200" className="w-full h-full">
                  {/* Grid */}
                  <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{stopColor: '#3B82F6', stopOpacity: 0.8}} />
                      <stop offset="100%" style={{stopColor: '#3B82F6', stopOpacity: 0.1}} />
                    </linearGradient>
                    <linearGradient id="gradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{stopColor: '#10B981', stopOpacity: 0.8}} />
                      <stop offset="100%" style={{stopColor: '#10B981', stopOpacity: 0.1}} />
                    </linearGradient>
                  </defs>
                  
                  {/* Area 1 */}
                  <path d="M 0 120 Q 100 100 200 110 T 400 105 T 600 115 T 800 110 L 800 200 L 0 200 Z" fill="url(#gradient2)" />
                  
                  {/* Area 2 */}
                  <path d="M 0 160 Q 100 140 200 150 T 400 145 T 600 155 T 800 150 L 800 200 L 0 200 Z" fill="url(#gradient1)" />
                  
                  {/* Lines */}
                  <path d="M 0 120 Q 100 100 200 110 T 400 105 T 600 115 T 800 110" stroke="#10B981" strokeWidth="2" fill="none" />
                  <path d="M 0 160 Q 100 140 200 150 T 400 145 T 600 155 T 800 150" stroke="#3B82F6" strokeWidth="2" fill="none" />
                </svg>
                
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8">
                  <span>40</span>
                  <span>30</span>
                  <span>20</span>
                  <span>10</span>
                  <span>0</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}