import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Database, Globe, FileText, TrendingUp, RefreshCw, Download, Search, Filter } from 'lucide-react';

export default function TenantDataCollection() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                ← Zurück zum Dashboard
              </Button>
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-lg font-semibold text-gray-900">Data Collection Center</h1>
                <p className="text-sm text-gray-500">Verfügbar für Enterprise Plan</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Sources</p>
                  <p className="text-2xl font-bold text-gray-900">25</p>
                </div>
                <Database className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Daily Collections</p>
                  <p className="text-2xl font-bold text-gray-900">1,247</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Data Quality</p>
                  <p className="text-2xl font-bold text-gray-900">98.5%</p>
                </div>
                <Globe className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sync Status</p>
                  <p className="text-2xl font-bold text-green-900">Online</p>
                </div>
                <RefreshCw className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="sources">Datenquellen</TabsTrigger>
            <TabsTrigger value="collections">Sammlungen</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Collection Übersicht</CardTitle>
                <CardDescription>
                  Ihr Enterprise Plan umfasst vollständigen Zugang zu allen Datenquellen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Aktive Sammlungen</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">FDA 510(k) Updates</p>
                          <p className="text-sm text-gray-600">Letzte Synchronisation: vor 5 Minuten</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">EU MDR Notices</p>
                          <p className="text-sm text-gray-600">Letzte Synchronisation: vor 12 Minuten</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Legal Case Database</p>
                          <p className="text-sm text-gray-600">Letzte Synchronisation: vor 1 Stunde</p>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Verfügbare Features</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Automatische Datensammlung</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Echtzeit-Synchronisation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Erweiterte Filteroptionen</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">API-Zugang</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Unbegrenzte Exporte</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Verfügbare Datenquellen</CardTitle>
                <CardDescription>
                  25 aktive Datenquellen für Ihr Enterprise Abonnement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <h4 className="font-medium">FDA OpenFDA API</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">510(k), PMA, Recalls, Enforcement</p>
                    <Badge variant="outline">Official API</Badge>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <h4 className="font-medium">EU EUDAMED</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">MDR Registrierungen, UDI</p>
                    <Badge variant="outline">Official Database</Badge>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <h4 className="font-medium">Health Canada</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Medical Device License</p>
                    <Badge variant="outline">Official API</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collections" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sammlungshistorie</CardTitle>
                <CardDescription>
                  Letzte Datensammlungen und deren Status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">FDA Daily Update Collection</h4>
                      <p className="text-sm text-gray-600">247 neue Einträge gesammelt</p>
                      <p className="text-xs text-gray-500">Heute 14:30</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">Erfolgreich</Badge>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">EU MDR Weekly Sync</h4>
                      <p className="text-sm text-gray-600">89 neue MDR Einträge</p>
                      <p className="text-xs text-gray-500">Heute 12:15</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">Erfolgreich</Badge>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Legal Cases Update</h4>
                      <p className="text-sm text-gray-600">12 neue Rechtsfälle</p>
                      <p className="text-xs text-gray-500">Gestern 18:45</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800">Verarbeitung</Badge>
                      <Button variant="outline" size="sm" disabled>
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Collection Analytics</CardTitle>
                <CardDescription>
                  Detaillierte Statistiken Ihrer Datensammlungen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Sammlungsstatistiken (30 Tage)</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Gesamt gesammelte Datensätze</span>
                        <span className="font-semibold">24,789</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Erfolgreiche Sammlungen</span>
                        <span className="font-semibold">98.7%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Durchschnittliche Verarbeitungszeit</span>
                        <span className="font-semibold">2.4 min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">API Aufrufe</span>
                        <span className="font-semibold">156,432</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Top Datenquellen</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">FDA OpenFDA</span>
                        <span className="font-semibold">45%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">EU EUDAMED</span>
                        <span className="font-semibold">28%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Health Canada</span>
                        <span className="font-semibold">15%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Andere</span>
                        <span className="font-semibold">12%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}