import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Download, FileText, Calendar, MapPin, TrendingUp, AlertTriangle, DollarSign, Brain, Euro, Clock } from "lucide-react";

const mockUpdates = [
  {
    id: "K252544",
    title: "FDA 510(k): Iconix Speed Anchor; Iconix Speed HA+ Anchor (K252544)",
    description: "FDA 510(k) • Regulatory Update",
    source: "FDA",
    date: "30.7.2025",
    region: "US",
    priority: "Medium",
    type: "510k",
    content: `K-Nummer: K252544 Antragsteller: Stryker Medical Produktcode: MRI Geräteklasse: 2 Regulierungsnummer: 888.3040 Entscheidungsdatum: 2025-07-30 Status: N/A Zusammenfassung: Summary Medizinischer Bereich: Orthopädie

Wichtigste Punkte:
• Produkt-spezifische Marktlassung für "FDA 510(k): Iconix Speed Anchor; Iconix Speed HA+ Speedlasungen
• Regulatory Pathway Assessment für US Gesundheitswesen  
• Clinical Evidence Package und Dossier-Vorbereitung

Auswirkungen:
Dieses Update erlaubt eine angemessene Reaktion basierend auf der mittleren Komplexität und einer Erfolgswahrscheinlichkeit von 75%.`,
    riskScore: "50/100",
    successRate: "75%",
    costs: "€344.000 - €2.352.000",
    timeline: "14-18 Monate bis Markteinführung",
    implementationCosts: {
      R_D: "€344.000",
      Regulatory: "€800.000", 
      Manufacturing: "€500.000",
      Marketing: "€134.400"
    },
    roiProjection: {
      year1: "€1.881.600 Revenue (IRR: 40%)",
      year2: "€4.838.400 Revenue (IRR: 64%)"
    },
    payback: "30 Monate",
    aiRecommendations: [
      "Produkt-spezifische Marktlassung für FDA 510(k): Iconix Speed Anchor; Iconix entwickeln",
      "Regulatory Pathway Assessment für US Gesundheitswesen",
      "Clinical Evidence Package und Dossier-Vorbereitung", 
      "Market Access und Reimbursement Strategie entwickeln"
    ],
    criticalActions: [
      {
        title: "FDA Strategie für FDA 510(k): Iconix Speed Anchor,5+ entwickeln",
        timeline: "12 Wochen"
      },
      {
        title: "Clinical Evidence Package und Dossier Compilation",
        timeline: "8-16 Wochen"
      }
    ]
  },
  {
    id: "K252235", 
    title: "FDA 510(k): IntellaMAX System (K252235)",
    description: "FDA 510(k) • Regulatory Update",
    source: "FDA",
    date: "25.7.2025",
    region: "US", 
    priority: "Medium",
    type: "510k",
    riskScore: "50/100",
    successRate: "75%",
    costs: "€1.209.600 - €2.118.800",
    timeline: "14-18 Monate bis Markteinführung"
  }
];

export default function RegulatoryUpdatesComplete() {
  const [selectedUpdate, setSelectedUpdate] = useState(mockUpdates[0]);
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Regulatory Updates</h1>
          <p className="text-gray-600 mt-1">66 von 66 Updates</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4 mr-2" />
          Zurücksetzen
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input placeholder="Suchen..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Alle Regionen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Regionen</SelectItem>
                <SelectItem value="us">USA</SelectItem>
                <SelectItem value="eu">Europa</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Alle Prioritäten" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Prioritäten</SelectItem>
                <SelectItem value="high">Hoch</SelectItem>
                <SelectItem value="medium">Mittel</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Alle Typen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Typen</SelectItem>
                <SelectItem value="510k">510(k)</SelectItem>
                <SelectItem value="pma">PMA</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Updates List */}
      <div className="space-y-4">
        {mockUpdates.map((update) => (
          <Card 
            key={update.id} 
            className={`cursor-pointer transition-all ${selectedUpdate.id === update.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'}`}
            onClick={() => setSelectedUpdate(update)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{update.title}</CardTitle>
                  <CardDescription className="mt-2 flex items-center gap-4">
                    <span>{update.description}</span>
                    <Badge variant="secondary">{update.region}</Badge>
                    <span className="text-sm text-gray-500">{update.date}</span>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            {selectedUpdate.id === update.id && (
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="overview">Übersicht</TabsTrigger>
                    <TabsTrigger value="summary">Zusammenfassung</TabsTrigger>
                    <TabsTrigger value="content">Vollständiger Inhalt</TabsTrigger>
                    <TabsTrigger value="financial">Finanzanalyse</TabsTrigger>
                    <TabsTrigger value="ai">KI-Analyse</TabsTrigger>
                    <TabsTrigger value="metadata">Metadaten</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6">
                    <div className="grid grid-cols-3 gap-6">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">{update.riskScore}</div>
                          <div className="text-sm text-gray-600">Risiko-Score</div>
                          <div className="text-xs text-gray-500 mt-1">Implementierungsrisiko</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">{update.successRate}</div>
                          <div className="text-sm text-gray-600">Erfolgswahrscheinlichkeit</div>
                          <div className="text-xs text-gray-500 mt-1">Implementierungsparameterabschätzkeit</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-purple-600">{update.costs}</div>
                          <div className="text-sm text-gray-600">Kosten</div>
                          <div className="text-xs text-gray-500 mt-1">Timeline: {update.timeline}</div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="summary" className="mt-6">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          Vollständige Zusammenfassung
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-blue-700">Wichtigste Punkte:</h4>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                              <li>Produkt-spezifische Marktlassung für "FDA 510(k): Iconix Speed Anchor; Iconix Speed HA+ Speedlasungen</li>
                              <li>Regulatory Pathway Assessment für US Gesundheitswesen</li>
                              <li>Clinical Evidence Package und Dossier-Vorbereitung</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold text-blue-700">Auswirkungen:</h4>
                            <p className="mt-2">Dieses Update erlaubt eine angemessene Reaktion basierend auf der mittleren Komplexität und einer Erfolgswahrscheinlichkeit von 75%.</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="financial" className="mt-6">
                    <div className="grid grid-cols-2 gap-6">
                      <Card className="bg-green-50 border-green-200">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            Implementierungskosten
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span>R&D:</span>
                              <span className="font-semibold">€344.000</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Regulatory:</span>
                              <span className="font-semibold">€800.000</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Manufacturing:</span>
                              <span className="font-semibold">€500.000</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Marketing:</span>
                              <span className="font-semibold">€134.400</span>
                            </div>
                            <hr />
                            <div className="flex justify-between font-bold">
                              <span>Timeline:</span>
                              <span>14-18 Monate bis Markteinführung</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-blue-50 border-blue-200">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                            ROI-Projektion
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm text-gray-600">Jahr 1:</span>
                              <div className="font-semibold">€1.881.600 Revenue (IRR: 40%)</div>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600">Jahr 2:</span>
                              <div className="font-semibold">€4.838.400 Revenue (IRR: 64%)</div>
                            </div>
                            <hr />
                            <div>
                              <span className="text-sm text-gray-600">Payback:</span>
                              <div className="font-semibold">30 Monate</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="ai" className="mt-6">
                    <div className="grid grid-cols-2 gap-6">
                      <Card className="bg-purple-50 border-purple-200">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Brain className="h-5 w-5 text-purple-600" />
                            KI-Empfehlungen
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {selectedUpdate.aiRecommendations?.map((rec, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-sm font-semibold text-purple-600">
                                  {index + 1}
                                </div>
                                <span className="text-sm">{rec}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-orange-50 border-orange-200">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                            Kritische Aktionen
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {selectedUpdate.criticalActions?.map((action, index) => (
                              <div key={index} className="bg-white p-3 rounded border border-orange-200">
                                <div className="font-semibold text-sm">{action.title}</div>
                                <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {action.timeline}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="content" className="mt-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="prose max-w-none">
                          <p className="whitespace-pre-line">{selectedUpdate.content}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="metadata" className="mt-6">
                    <div className="grid grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Regulatorische Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Typ:</span>
                              <span>510(k)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Region:</span>
                              <span>US</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Priorität:</span>
                              <span>Medium</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Veröffentlicht:</span>
                              <span>30.7.2025</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}