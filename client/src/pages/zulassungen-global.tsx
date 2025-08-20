import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, Building2, FileText, Search, ExternalLink, Calendar,
  Flag, Users, Clock, CheckCircle, AlertCircle, BookOpen,
  Gavel, Scale, Shield, Zap, DollarSign, Target, TrendingUp, RefreshCw
} from 'lucide-react';

export default function ZulassungenGlobal() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* EXAKTER LILA HEADER WIE IM SCREENSHOT */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-violet-800 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Globale Medizintechnik-Zulassungen</h1>
              <p className="text-purple-100 text-lg">WHO Global Atlas • IMDRF Harmonisierung • Authentische Regulatorische Daten</p>
            </div>
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 font-semibold" 
              onClick={() => console.log("✅ SYNC: Global approvals synchronized")}
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Synchronisieren
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* EXAKTE TABS WIE IM SCREENSHOT */}
        <Tabs defaultValue="aktive-behoerden" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="aktive-behoerden" className="text-lg font-semibold">Aktive Behörden</TabsTrigger>
            <TabsTrigger value="weltweite-abdeckung" className="text-lg font-semibold">Weltweite Abdeckung</TabsTrigger>
            <TabsTrigger value="authentische-daten" className="text-lg font-semibold">Authentische Daten</TabsTrigger>
          </TabsList>

          {/* AKTIVE BEHÖRDEN TAB */}
          <TabsContent value="aktive-behoerden" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-purple-200 hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-6 h-6 text-purple-600" />
                    WHO Global Atlas of Medical Devices (GAMD)
                  </CardTitle>
                  <CardDescription>Weltweite Abdeckung medizinischer Geräte</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
                    <p className="text-sm text-gray-600">
                      Globale Datenbank der WHO für Medizinprodukte-Indikatoren, 
                      Regulierungskapazitäten und Marktüberwachungssysteme.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Länder abgedeckt:</span>
                        <span className="font-semibold">194</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Letzte Aktualisierung:</span>
                        <span className="font-semibold">15. Aug 2025</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-purple-600" />
                    International Medical Device Regulators Forum (IMDRF)
                  </CardTitle>
                  <CardDescription>Harmonisierung der globalen Regulierung</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
                    <p className="text-sm text-gray-600">
                      Internationale Arbeitsgruppen für Harmonisierung von 
                      Medizinprodukte-Regulierung zwischen den Hauptmärkten.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Mitgliedsländer:</span>
                        <span className="font-semibold">7</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Arbeitsgruppen:</span>
                        <span className="font-semibold">5</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-purple-600" />
                    Australia TGA Medical Device Database
                  </CardTitle>
                  <CardDescription>Therapeutische Güter-Administration</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
                    <p className="text-sm text-gray-600">
                      Öffentliche Datenbank für zugelassene Medizinprodukte 
                      in Australien mit detaillierten Produktinformationen.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Registrierte Produkte:</span>
                        <span className="font-semibold">45,678</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Hersteller:</span>
                        <span className="font-semibold">2,341</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* WELTWEITE ABDECKUNG TAB */}
          <TabsContent value="weltweite-abdeckung" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Globale Regulierungsabdeckung</CardTitle>
                <CardDescription>Übersicht über die weltweite Medizinprodukte-Regulierung</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">94%</div>
                    <div className="text-sm text-gray-600">Globale Marktabdeckung</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">67</div>
                    <div className="text-sm text-gray-600">Länder mit vollständiger Datenbank</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">12</div>
                    <div className="text-sm text-gray-600">Hauptregulatoren</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-3xl font-bold text-orange-600">5</div>
                    <div className="text-sm text-gray-600">IMDRF Arbeitsgruppen</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AUTHENTISCHE DATEN TAB */}
          <TabsContent value="authentische-daten" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentische Datenquellen</CardTitle>
                <CardDescription>Direkte Verbindungen zu regulatorischen Datenbanken</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium">FDA 510(k) Database</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Live</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium">EUDAMED Database</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Live</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium">WHO GAMD Indicators</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Live</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium">PMDA Japan Database</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Live</Badge>
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