import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, Building2, FileText, Search, ExternalLink, Calendar,
  Flag, Users, Clock, CheckCircle, AlertCircle, BookOpen,
  Gavel, Scale, Shield, Zap
} from 'lucide-react';
// import { PiecesShareButton } from '../components/pieces-share-button';

interface RegulationRegion {
  id: string;
  name: string;
  flag: string;
  agency: string;
  website: string;
  keyRequirements: string[];
  classes: string[];
  timeline: string;
  costs: string;
  description: string;
  keyChanges?: string[];
  workingGroups?: string[];
}

export default function ZulassungenGlobal() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const regulationRegions: RegulationRegion[] = [
    {
      id: 'usa-fda',
      name: 'USA - FDA',
      flag: '🇺🇸',
      agency: 'U.S. Food and Drug Administration (CDRH)',
      website: 'https://www.fda.gov/medical-devices',
      keyRequirements: [
        'Establishment Registration (21 CFR Part 807)',
        'Medical Device Listing (21 CFR Part 807)', 
        'Premarket Notification 510(k)',
        'Premarket Approval (PMA)',
        'Quality System Regulation (21 CFR Part 820)',
        'Medical Device Reporting (MDR)'
      ],
      classes: ['Class I (Low Risk)', 'Class II (Moderate Risk)', 'Class III (High Risk)'],
      timeline: '90-180 Tage (510k), 180-320 Tage (PMA)',
      costs: '$12.000-$365.000 je nach Klasse',
      description: 'Die FDA reguliert Medizinprodukte über das Center for Devices and Radiological Health (CDRH). Produkte werden in drei Risikoklassen eingeteilt mit entsprechenden Zulassungsanforderungen.'
    },
    {
      id: 'eu-mdr',
      name: 'EU - MDR/IVDR',
      flag: '🇪🇺',
      agency: 'Europäische Kommission - Generaldirektion Gesundheit',
      website: 'https://ec.europa.eu/health/medical-devices-sector/new-regulations_en',
      keyRequirements: [
        'CE-Kennzeichnung',
        'Benannte Stelle Zertifizierung',
        'EUDAMED Registrierung',
        'Unique Device Identification (UDI)',
        'Post-Market Surveillance',
        'Klinische Bewertung'
      ],
      classes: ['Klasse I', 'Klasse IIa', 'Klasse IIb', 'Klasse III'],
      timeline: '6-18 Monate je nach Klasse',
      costs: '€15.000-€200.000 + laufende Kosten',
      description: 'Die neue Medical Devices Regulation (MDR) und In Vitro Diagnostic Regulation (IVDR) ersetzen die alten Richtlinien und bringen strengere Anforderungen.',
      keyChanges: [
        'Strengere Vorkontrolle durch Expertengremien',
        'Verbesserte Post-Market Surveillance',
        'EUDAMED Transparenz-Datenbank',
        'UDI-System für Rückverfolgbarkeit',
        'Klarere Verantwortlichkeiten'
      ]
    },
    {
      id: 'japan-pmda',
      name: 'Japan - PMDA',
      flag: '🇯🇵',
      agency: 'Pharmaceuticals and Medical Devices Agency',
      website: 'https://www.pmda.go.jp/english/',
      keyRequirements: [
        'Marketing Authorization Application',
        'Quality Management System (QMS)',
        'Clinical Data Requirements',
        'Japanese Agent Appointment',
        'Post-Market Study Obligation (GPSP)',
        'Adverse Event Reporting'
      ],
      classes: ['Class I', 'Class II', 'Class III', 'Class IV'],
      timeline: '12-24 Monate',
      costs: '¥2.000.000-¥15.000.000',
      description: 'Japan hat ein eigenständiges Zulassungssystem mit spezifischen klinischen Datenanforderungen und QMS-Standards.'
    },
    {
      id: 'china-nmpa',
      name: 'China - NMPA',
      flag: '🇨🇳',
      agency: 'National Medical Products Administration',
      website: 'https://www.nmpa.gov.cn',
      keyRequirements: [
        'Product Registration Certificate',
        'Quality Management System Certificate',
        'Clinical Trial Approval (wenn erforderlich)',
        'Chinese Agent Appointment',
        'Factory Inspection',
        'Adverse Event Reporting'
      ],
      classes: ['Class I', 'Class II', 'Class III'],
      timeline: '6-36 Monate je nach Klasse',
      costs: '¥100.000-¥2.000.000',
      description: 'China hat sein Zulassungssystem modernisiert und arbeitet an der Harmonisierung mit internationalen Standards.'
    },
    {
      id: 'canada-hc',
      name: 'Kanada - Health Canada',
      flag: '🇨🇦',
      agency: 'Health Canada - Medical Device Bureau',
      website: 'https://www.canada.ca/en/health-canada/services/drugs-health-products/medical-devices.html',
      keyRequirements: [
        'Medical Device License (MDL)',
        'Quality System Certification',
        'Canadian Medical Device License',
        'Adverse Event Reporting',
        'Post-Market Requirements',
        'Labeling Requirements'
      ],
      classes: ['Class I', 'Class II', 'Class III', 'Class IV'],
      timeline: '75-365 Tage',
      costs: 'CAD $4.590-$73.440',
      description: 'Kanada folgt ähnlichen Prinzipien wie die USA, hat aber eigene spezifische Anforderungen und Prozesse.'
    },
    {
      id: 'brazil-anvisa',
      name: 'Brasilien - ANVISA',
      flag: '🇧🇷',
      agency: 'Brazilian Health Regulatory Agency',
      website: 'https://www.gov.br/anvisa/pt-br',
      keyRequirements: [
        'ANVISA Registration',
        'Good Manufacturing Practices (GMP)',
        'Brazilian Responsible Representative',
        'Clinical Evidence Requirements',
        'Post-Market Surveillance',
        'Quality Management System'
      ],
      classes: ['Class I', 'Class II', 'Class III', 'Class IV'],
      timeline: '180-540 Tage',
      costs: 'R$ 15.000-R$ 200.000',
      description: 'Brasilien als größter lateinamerikanischer Markt hat strenge Anforderungen und lokale Vertreterpflicht.'
    }
  ];

  const imdrf = {
    name: 'International Medical Device Regulators Forum (IMDRF)',
    description: 'Gruppe von Medizinprodukte-Regulierungsbehörden aus der ganzen Welt zur Harmonisierung regulatorischer Anforderungen',
    members: [
      'Australien - Therapeutic Goods Administration',
      'Brasilien - ANVISA', 
      'Kanada - Health Canada',
      'China - National Medical Products Administration',
      'EU - Europäische Kommission',
      'Japan - PMDA',
      'Singapur - Health Sciences Authority',
      'Südkorea - Ministry of Food and Drug Safety',
      'UK - MHRA',
      'USA - FDA'
    ],
    workingGroups: [
      'Adverse Event Terminology',
      'Artificial Intelligence/Machine Learning-Enabled',
      'Good Regulatory Review Practices', 
      'Personalized Medical Devices',
      'Quality Management Systems (QMS)',
      'Software as a Medical Device (SaMD)'
    ]
  };

  const whoGamd = {
    name: 'WHO Global Atlas of Medical Devices (GAMD)',
    description: 'Globale, regionale und länderspezifische Daten zur Verfügbarkeit von Gesundheitstechnologien',
    indicators: [
      'Nationale Politik für Gesundheitstechnologie',
      'Regulierung von Medizinprodukten', 
      'Health Technology Assessment Einheiten',
      'Nomenklatursysteme für Medizinprodukte',
      'Nationale Listen prioritärer Medizinprodukte',
      'Dichte medizinischer Geräte'
    ],
    updates: [
      '2010: Baseline Country Survey launched',
      '2017: Global Atlas updated', 
      '2022: Latest version published',
      '2025: Next update in development'
    ]
  };

  const filteredRegions = regulationRegions.filter(region => {
    const matchesSearch = region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         region.agency.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         region.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === 'all' || region.id === selectedRegion;
    
    return matchesSearch && matchesRegion;
  });

  const getRegionBadge = (regionId: string) => {
    switch (regionId) {
      case 'usa-fda':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">Nordamerika</Badge>;
      case 'eu-mdr':
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">Europa</Badge>;
      case 'japan-pmda':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">Asien-Pazifik</Badge>;
      case 'china-nmpa':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">Asien-Pazifik</Badge>;
      case 'canada-hc':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">Nordamerika</Badge>;
      case 'brazil-anvisa':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Südamerika</Badge>;
      default:
        return <Badge variant="outline">Global</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <Globe className="w-8 h-8" />
            Globale Medizintechnik-Zulassungen
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Weltweite Regulierungslandschaft für Medizinprodukte • {filteredRegions.length} von {regulationRegions.length} Regionen
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Pieces Share Button temporarily disabled due to plugin conflict */}
        </div>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Nach Region oder Behörde suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="regions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="regions">Regionale Behörden</TabsTrigger>
          <TabsTrigger value="imdrf">IMDRF Harmonisierung</TabsTrigger>
          <TabsTrigger value="who">WHO GAMD</TabsTrigger>
          <TabsTrigger value="timeline">Zulassungsprozess</TabsTrigger>
        </TabsList>

        <TabsContent value="regions" className="space-y-6 mt-6">
          {/* Regional Authorities */}
          <div className="grid gap-6">
            {filteredRegions.map((region) => (
              <Card key={region.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{region.flag}</span>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {region.name}
                          {getRegionBadge(region.id)}
                        </CardTitle>
                        <CardDescription>{region.agency}</CardDescription>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(region.website, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <p className="text-gray-700 dark:text-gray-300">{region.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Schlüsselanforderungen
                        </h4>
                        <div className="space-y-2">
                          {region.keyRequirements.map((req, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">{req}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                            <Scale className="w-4 h-4" />
                            Produktklassen
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {region.classes.map((cls, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {cls}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Bearbeitungszeit
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{region.timeline}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Typische Kosten
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{region.costs}</p>
                        </div>
                      </div>
                    </div>

                    {region.keyChanges && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Wichtige Neuerungen
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {region.keyChanges.map((change, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">{change}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="imdrf" className="space-y-6 mt-6">
          {/* IMDRF Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {imdrf.name}
              </CardTitle>
              <CardDescription>{imdrf.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Flag className="w-4 h-4" />
                    Mitgliedsbehörden
                  </h4>
                  <div className="space-y-2">
                    {imdrf.members.map((member, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{member}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Arbeitsgruppen
                  </h4>
                  <div className="space-y-2">
                    {imdrf.workingGroups.map((group, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Users className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{group}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="who" className="space-y-6 mt-6">
          {/* WHO GAMD Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {whoGamd.name}
              </CardTitle>
              <CardDescription>{whoGamd.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Erfasste Indikatoren
                  </h4>
                  <div className="space-y-2">
                    {whoGamd.indicators.map((indicator, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{indicator}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Entwicklungshistorie
                  </h4>
                  <div className="space-y-2">
                    {whoGamd.updates.map((update, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{update}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6 mt-6">
          {/* Process Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="w-5 h-5" />
                Globaler Zulassungsprozess-Überblick
              </CardTitle>
              <CardDescription>
                Typische Schritte und Zeitrahmen für Medizinprodukt-Zulassungen weltweit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                  
                  <div className="space-y-6">
                    {[
                      {
                        phase: 'Vorbereitung',
                        duration: '2-6 Monate',
                        description: 'Produktklassifizierung, Dokumentation, Qualitätssystem-Aufbau',
                        color: 'blue'
                      },
                      {
                        phase: 'Präklinische Tests',
                        duration: '3-12 Monate', 
                        description: 'Biokompatibilität, Performance-Tests, Risikomanagement',
                        color: 'purple'
                      },
                      {
                        phase: 'Klinische Bewertung',
                        duration: '6-24 Monate',
                        description: 'Klinische Studien oder Literaturrecherche je nach Klasse',
                        color: 'orange'
                      },
                      {
                        phase: 'Behördenantrag',
                        duration: '3-18 Monate',
                        description: 'Einreichung bei Zulassungsbehörde, Review-Prozess, Rückfragen',
                        color: 'green'
                      },
                      {
                        phase: 'Markteinführung',
                        duration: '1-3 Monate',
                        description: 'Post-Market Surveillance, Vigilanz-System, Qualitätsüberwachung',
                        color: 'red'
                      }
                    ].map((step, idx) => (
                      <div key={idx} className="relative flex items-start gap-4">
                        <div className={`
                          relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium
                          ${step.color === 'blue' ? 'bg-blue-500' :
                            step.color === 'purple' ? 'bg-purple-500' :
                            step.color === 'orange' ? 'bg-orange-500' :
                            step.color === 'green' ? 'bg-green-500' :
                            'bg-red-500'}
                        `}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{step.phase}</h4>
                            <Badge variant="outline">{step.duration}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Wichtiger Hinweis</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Zeitrahmen und Kosten variieren erheblich je nach Produktklasse, Region und Komplexität. 
                    Für spezifische Projekte sollten immer Fachexperten und lokale Beratungsunternehmen konsultiert werden.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {filteredRegions.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Keine Regionen gefunden</h2>
              <p className="text-gray-500">
                Keine Zulassungsbehörden entsprechen den aktuellen Suchkriterien.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}