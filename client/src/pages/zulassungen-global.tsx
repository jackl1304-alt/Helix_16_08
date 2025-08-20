import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, Building2, FileText, Search, ExternalLink, Calendar,
  Flag, Users, Clock, CheckCircle, AlertCircle, BookOpen,
  Gavel, Scale, Shield, Zap, DollarSign, Target, TrendingUp
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
    },
    {
      id: 'australia-tga',
      name: 'Australien - TGA',
      flag: '🇦🇺',
      agency: 'Therapeutic Goods Administration',
      website: 'https://www.tga.gov.au',
      keyRequirements: [
        'Australian Register of Therapeutic Goods (ARTG)',
        'Essential Principles Compliance',
        'Conformity Assessment Evidence',
        'TGA Conformity Assessment Certification',
        'Comparable Overseas Regulator Evidence',
        'Post-Market Monitoring'
      ],
      classes: ['Class I', 'Class IIa', 'Class IIb', 'Class III'],
      timeline: '90-270 Tage',
      costs: 'AUD $3.000-$50.000',
      description: 'TGA bietet flexible Zulassungswege einschließlich Nutzung von Marktzulassungen vergleichbarer Übersee-Regulatoren.'
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
      'EU - Europäische Kommission - Generaldirektion Gesundheit',
      'Japan - PMDA und Ministerium für Gesundheit, Arbeit und Soziales',
      'Singapur - Health Sciences Authority',
      'Südkorea - Ministry of Food and Drug Safety',
      'UK - MHRA (Medicines and Healthcare products Regulatory Agency)',
      'USA - FDA'
    ],
    workingGroups: [
      'Adverse Event Terminology',
      'Artificial Intelligence/Machine Learning-Enabled',
      'Good Regulatory Review Practices', 
      'Personalized Medical Devices',
      'Quality Management Systems (QMS)',
      'Regulated Product Submission',
      'Software as a Medical Device (SaMD)'
    ],
    objectives: [
      'Harmonisierung regulatorischer Anforderungen weltweit',
      'Entwicklung international vereinbarter Dokumente',
      'Förderung freiwilliger Zusammenarbeit zwischen Behörden',
      'Öffentliche Konsultation zu Entwurfsdokumenten',
      'Anpassung an spezifische regulatorische Anforderungen'
    ]
  };

  const whoGamd = {
    name: 'WHO Global Atlas of Medical Devices (GAMD)',
    description: 'Globale, regionale und länderspezifische Daten zur Verfügbarkeit von Gesundheitstechnologien',
    indicators: [
      'Nationale Politik für Gesundheitstechnologie',
      'Regulierung von Medizinprodukten', 
      'Nationale Health Technology Assessment Einheiten',
      'Management von Gesundheitstechnologien',
      'Nomenklatursysteme für Medizinprodukte',
      'Nationale Listen prioritärer Medizinprodukte',
      'Hochpreisige medizinische Geräte',
      'Dichte medizinischer Geräte'
    ],
    updates: [
      '2009: WHO Baseline Country Survey entwickelt',
      '2013: Als Global Atlas of Medical Devices neu aufgelegt', 
      '2017: GAMD aktualisiert',
      '2022: Aktuelle Aktualisierung in Arbeit',
      '2025: Nächste Überarbeitung geplant'
    ],
    purpose: [
      'Zentrale Anlaufstelle für Gesundheitstechnologien identifizieren',
      'Globale, regionale und länderspezifische Datenbereitstellung',
      'Verfügbarkeit von Medizinprodukten dokumentieren',
      'Politische Entscheidungsfindung unterstützen'
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0 mb-8">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-700 rounded-2xl shadow-lg">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Globale Medizintechnik-Zulassungen
            </h1>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-xl text-sm font-semibold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                {filteredRegions.length} Aktive Behörden
              </div>
              <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-xl text-sm font-semibold flex items-center gap-1">
                <Flag className="w-4 h-4" />
                Weltweite Abdeckung
              </div>
              <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-xl text-sm font-semibold flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Authentische Daten
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Komplette Regulierungslandschaft basierend auf offiziellen Behördendokumenten
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-3">
          <div className="text-right bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl">
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{regulationRegions.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Jurisdiktionen</div>
          </div>
          <div className="text-right bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">100%</div>
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Authentizität</div>
          </div>
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
        <TabsList className="grid w-full grid-cols-4 h-14 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-1">
          <TabsTrigger value="regions" className="text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-lg">
            🌍 Regionale Behörden
          </TabsTrigger>
          <TabsTrigger value="imdrf" className="text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-lg">
            🤝 IMDRF Harmonisierung
          </TabsTrigger>
          <TabsTrigger value="who" className="text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-lg">
            🏥 WHO GAMD
          </TabsTrigger>
          <TabsTrigger value="timeline" className="text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-orange-700 data-[state=active]:shadow-lg">
            ⚡ Cybersicherheit & PMS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="regions" className="space-y-6 mt-6">
          {/* Regional Authorities */}
          <div className="grid gap-6">
            {filteredRegions.map((region) => (
              <Card key={region.id} className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 bg-gradient-to-r from-white via-blue-50/30 to-white dark:from-gray-900 dark:via-blue-900/10 dark:to-gray-900">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 rounded-xl shadow-sm">
                        <span className="text-2xl">{region.flag}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            {region.name}
                          </CardTitle>
                          {getRegionBadge(region.id)}
                          <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            AKTIV
                          </div>
                        </div>
                        <CardDescription className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {region.agency}
                        </CardDescription>
                        <div className="flex items-center gap-1 mt-1">
                          <ExternalLink className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">{region.website}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                          <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">{region.timeline}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                          <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">{region.costs}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                        onClick={() => window.open(region.website, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Offizielle Website
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 via-purple-50/30 to-blue-50 dark:from-blue-900/20 dark:via-purple-900/10 dark:to-blue-900/20 rounded-xl p-4 border border-blue-200/30 dark:border-blue-700/30">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-lg">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Regulatorische Übersicht</h5>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{region.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                          <div className="flex items-center justify-center w-6 h-6 bg-green-500 text-white rounded-full">
                            <Shield className="w-3 h-3" />
                          </div>
                          Kritische Compliance-Anforderungen
                        </h4>
                        <div className="space-y-3">
                          {region.keyRequirements.map((req, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200/50 dark:border-green-700/30 hover:shadow-md transition-all">
                              <div className="flex items-center justify-center w-5 h-5 bg-green-500 text-white rounded-full text-xs font-bold">
                                ✓
                              </div>
                              <span className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed">{req}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/30">
                          <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                            <div className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full">
                              <Scale className="w-3 h-3" />
                            </div>
                            Regulatorische Klassifizierung
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {region.classes.map((cls, idx) => (
                              <div key={idx} className="px-3 py-2 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-600 rounded-lg text-sm font-semibold text-blue-700 dark:text-blue-300 shadow-sm">
                                {cls}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl p-4 border border-orange-200/50 dark:border-orange-700/30">
                          <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                            <div className="flex items-center justify-center w-6 h-6 bg-orange-500 text-white rounded-full">
                              <Clock className="w-3 h-3" />
                            </div>
                            Bearbeitungszeit
                          </h4>
                          <p className="text-lg font-bold text-orange-700 dark:text-orange-300">{region.timeline}</p>
                        </div>
                        
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200/50 dark:border-purple-700/30">
                          <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                            <div className="flex items-center justify-center w-6 h-6 bg-purple-500 text-white rounded-full">
                              <Building2 className="w-3 h-3" />
                            </div>
                            Investitionsaufwand
                          </h4>
                          <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{region.costs}</p>
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
          {/* Cybersecurity Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Cybersicherheit in Medizinprodukten
              </CardTitle>
              <CardDescription>
                Besondere Anforderungen für vernetzte Medizinprodukte (FDA Section 524B)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">FDA Cybersicherheitsanforderungen</h4>
                  <div className="space-y-2">
                    {[
                      'Consolidated Appropriations Act 2023 - Section 3305',
                      'Cybersecurity in Medical Devices Guidance (Juni 2025)',
                      'Software Bill of Materials (SBOM) erforderlich',
                      'Threat Modeling für vernetzte Geräte',
                      'Vulnerability Disclosure Programs'
                    ].map((req, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Shield className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Post-Market Surveillance (WHO)</h4>
                  <div className="space-y-2">
                    {[
                      'Laufende Sicherheits- und Leistungsüberwachung',
                      'Sammlung von Erfahrungsdaten nach Markteinführung',
                      'Identifizierung von Korrekturbedarf',
                      'Adverse Event Reporting Systeme',
                      'Corrective and Preventive Actions (CAPA)'
                    ].map((req, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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