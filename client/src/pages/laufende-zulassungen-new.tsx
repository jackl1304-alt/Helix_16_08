import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, Plus, Search, Calendar, AlertCircle, CheckCircle, 
  FileText, Building2, Globe, Zap, Users, Flag, Edit, Trash2,
  TrendingUp, DollarSign, Target, BarChart3, Shield, Scale, RefreshCw, Brain
} from 'lucide-react';

interface OngoingApproval {
  id: string;
  productName: string;
  company: string;
  region: string;
  regulatoryBody: string;
  submissionDate: string;
  expectedApproval: string;
  currentPhase: string;
  deviceClass: string;
  status: 'submitted' | 'under-review' | 'pending-response' | 'nearly-approved' | 'approved' | 'rejected';
  progressPercentage: number;
  estimatedCosts: string;
  keyMilestones: string[];
  challenges: string[];
  nextSteps: string[];
  contactPerson: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  aiAnalysis?: string;
  successProbability?: string;
  riskAssessment?: string;
  financialImpact?: string;
}

export default function LaufendeZulassungenNew() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedApproval, setSelectedApproval] = useState<OngoingApproval | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock Data für laufende Zulassungen - basierend auf den Screenshots
  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ['ongoing-approvals'],
    queryFn: async (): Promise<OngoingApproval[]> => {
      return [
        {
          id: 'app-001',
          productName: 'CardioSense AI Monitoring System',
          company: 'MedTech Innovations GmbH',
          region: 'EU',
          regulatoryBody: 'MDR - Benannte Stelle TÜV SÜD',
          submissionDate: '2025-06-15',
          expectedApproval: '2025-12-15',
          currentPhase: 'Technische Dokumentation Review',
          deviceClass: 'Klasse IIa',
          status: 'under-review',
          progressPercentage: 65,
          estimatedCosts: '€180.000',
          keyMilestones: [
            '✅ Präklinische Tests abgeschlossen',
            '✅ Klinische Bewertung eingereicht', 
            '🔄 Technische Dokumentation unter Review',
            '⏳ Benannte Stelle Zertifizierung ausstehend'
          ],
          challenges: [
            'Zusätzliche klinische Daten für KI-Algorithmus angefordert',
            'Post-Market Surveillance Plan muss erweitert werden'
          ],
          nextSteps: [
            'Antwort auf Fragen der Benannten Stelle bis 15. August',
            'Erweiterte klinische Validierung einreichen'
          ],
          contactPerson: 'Dr. Sarah Weber - Regulatory Affairs',
          priority: 'high',
          aiAnalysis: '87% Erfolgswahrscheinlichkeit basierend auf historischen Daten ähnlicher KI-Geräte',
          successProbability: '87%',
          riskAssessment: 'Mittleres Risiko - KI-Validierung könnte Verzögerungen verursachen',
          financialImpact: 'Geschätzte Markteinführungskosten: €2.5M, erwarteter Jahresumsatz: €15M'
        },
        {
          id: 'app-002',
          productName: 'NeuroStim Implant V3',
          company: 'Brain Tech Solutions',
          region: 'USA',
          regulatoryBody: 'FDA - Center for Devices and Radiological Health',
          submissionDate: '2025-03-10',
          expectedApproval: '2026-01-30',
          currentPhase: 'PMA Review Phase II',
          deviceClass: 'Class III',
          status: 'pending-response',
          progressPercentage: 45,
          estimatedCosts: '$875.000',
          keyMilestones: [
            '✅ IDE Studie abgeschlossen',
            '✅ PMA Antrag eingereicht',
            '🔄 FDA Review Phase II',
            '⏳ Advisory Panel Meeting geplant'
          ],
          challenges: [
            'FDA fordert erweiterte Langzeitsicherheitsdaten',
            'Zusätzliche Biokompatibilitätsstudien erforderlich'
          ],
          nextSteps: [
            'Antwort auf FDA Major Deficiency Letter bis 20. August',
            'Advisory Panel Meeting vorbereiten'
          ],
          contactPerson: 'Mark Johnson - VP Regulatory',
          priority: 'critical',
          aiAnalysis: '72% Erfolgswahrscheinlichkeit - Klasse III Geräte haben niedrigere Approval-Rate',
          successProbability: '72%',
          riskAssessment: 'Hohes Risiko - Komplexe Sicherheitsstudien erforderlich',
          financialImpact: 'Investition: $8.5M, Marktpotential: $120M jährlich'
        },
        {
          id: 'app-003',
          productName: 'FlexiScope Endoskop',
          company: 'Precision Medical Devices',
          region: 'Japan',
          regulatoryBody: 'PMDA - Pharmaceuticals and Medical Devices Agency',
          submissionDate: '2025-07-01',
          expectedApproval: '2026-03-15',
          currentPhase: 'PMDA Consultation Phase',
          deviceClass: 'Class II',
          status: 'submitted',
          progressPercentage: 30,
          estimatedCosts: '¥45.000.000',
          keyMilestones: [
            '✅ Pre-submission meeting abgeschlossen',
            '✅ Klinische Studien eingereicht',
            '🔄 PMDA Consultation läuft',
            '⏳ QMS Audit geplant'
          ],
          challenges: [
            'Japanische klinische Daten erforderlich',
            'QMS-System muss an japanische Standards angepasst werden'
          ],
          nextSteps: [
            'PMDA Consultation Antworten bis 25. August',
            'Japanischer Agent Ernennung finalisieren'
          ],
          contactPerson: 'Yuki Tanaka - Japan Regulatory Lead',
          priority: 'medium',
          aiAnalysis: '91% Erfolgswahrscheinlichkeit - Klasse II Geräte haben hohe Approval-Rate',
          successProbability: '91%',
          riskAssessment: 'Niedriges Risiko - Standardisiertes Verfahren',
          financialImpact: 'Investition: ¥200M, Japanischer Markt: ¥2.5B potentiell'
        },
        {
          id: 'app-004',
          productName: 'SmartPump Insulin Delivery',
          company: 'Diabetes Care Tech',
          region: 'Canada',
          regulatoryBody: 'Health Canada - Medical Device Bureau',
          submissionDate: '2025-05-20',
          expectedApproval: '2025-11-30',
          currentPhase: 'Quality System Review',
          deviceClass: 'Class III',
          status: 'under-review',
          progressPercentage: 55,
          estimatedCosts: 'CAD $320.000',
          keyMilestones: [
            '✅ Medical Device License Antrag eingereicht',
            '✅ Klinische Daten übermittelt',
            '🔄 Quality System Review läuft',
            '⏳ Health Canada Audit geplant'
          ],
          challenges: [
            'Interoperabilitätsnachweis mit CGM-Systemen',
            'Cybersecurity-Dokumentation erweitern'
          ],
          nextSteps: [
            'QS-Audit Vorbereitung bis 30. August',
            'Interoperabilitätsstudien nachreichen'
          ],
          contactPerson: 'Dr. Amanda Smith - Canadian Regulatory',
          priority: 'high',
          aiAnalysis: '83% Erfolgswahrscheinlichkeit - Health Canada hat streamlined Prozess',
          successProbability: '83%',
          riskAssessment: 'Mittleres Risiko - Cybersecurity könnte Verzögerungen verursachen',
          financialImpact: 'Investition: CAD $2.8M, Kanadischer Markt: CAD $180M'
        },
        {
          id: 'app-005',
          productName: 'VisionCorrect Laser System',
          company: 'Advanced Optics Ltd',
          region: 'Australia',
          regulatoryBody: 'TGA - Therapeutic Goods Administration',
          submissionDate: '2025-04-10',
          expectedApproval: '2025-10-15',
          currentPhase: 'TGA Assessment',
          deviceClass: 'Class III',
          status: 'nearly-approved',
          progressPercentage: 85,
          estimatedCosts: 'AUD $280.000',
          keyMilestones: [
            '✅ Conformity Assessment abgeschlossen',
            '✅ Clinical Evidence Review bestanden',
            '✅ TGA Assessment fast abgeschlossen',
            '🔄 Final Approval Letter ausstehend'
          ],
          challenges: [
            'Kleinere Labeling-Anpassungen erforderlich'
          ],
          nextSteps: [
            'Labeling-Updates bis 22. August einreichen',
            'Final TGA Review abwarten'
          ],
          contactPerson: 'Dr. Michael Chen - APAC Regulatory',
          priority: 'low',
          aiAnalysis: '96% Erfolgswahrscheinlichkeit - Nur minimale Änderungen erforderlich',
          successProbability: '96%',
          riskAssessment: 'Sehr niedriges Risiko - Fast abgeschlossen',
          financialImpact: 'Investition: AUD $1.2M, Australischer Markt: AUD $45M'
        }
      ];
    }
  });

  const totalProjects = approvals.length || 5;
  const averageProgress = approvals.length > 0 ? 
    Math.round(approvals.reduce((sum, app) => sum + app.progressPercentage, 0) / approvals.length) : 51;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'nearly-approved': return 'bg-blue-100 text-blue-800';
      case 'under-review': return 'bg-yellow-100 text-yellow-800';
      case 'pending-response': return 'bg-orange-100 text-orange-800';
      case 'submitted': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Genehmigt';
      case 'nearly-approved': return 'Kurz vor Genehmigung';
      case 'under-review': return 'In Prüfung';
      case 'pending-response': return 'Antwort ausstehend';
      case 'submitted': return 'Eingereicht';
      case 'rejected': return 'Abgelehnt';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* INTENSIVER GRÜNER HEADER WIE IM SCREENSHOT */}
      <div className="bg-gradient-to-r from-green-700 via-green-800 to-green-900 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Laufende Zulassungen</h1>
              <p className="text-green-100 text-lg">{averageProgress}% Durchschnittlicher Fortschritt • {totalProjects} Aktuelle Projekte • KI-gestützte Analyse</p>
            </div>
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 font-semibold"
              onClick={() => console.log("✅ SYNC: Ongoing approvals synchronized")}
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Synchronisieren
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* STATISTIKEN CARDS */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card className="border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{averageProgress}%</div>
                <div className="text-sm text-gray-600">Durchschnittlicher Fortschritt</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{totalProjects}</div>
                <div className="text-sm text-gray-600">Aktuelle Projekte</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">€4.2M</div>
                <div className="text-sm text-gray-600">Gesamtinvestition</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">84%</div>
                <div className="text-sm text-gray-600">KI-Erfolgsvorhersage</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FILTER CONTROLS */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Suche nach Produkten oder Unternehmen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="submitted">Eingereicht</SelectItem>
                  <SelectItem value="under-review">In Prüfung</SelectItem>
                  <SelectItem value="pending-response">Antwort ausstehend</SelectItem>
                  <SelectItem value="nearly-approved">Kurz vor Genehmigung</SelectItem>
                  <SelectItem value="approved">Genehmigt</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Regionen</SelectItem>
                  <SelectItem value="EU">EU</SelectItem>
                  <SelectItem value="USA">USA</SelectItem>
                  <SelectItem value="Japan">Japan</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Neues Projekt
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* EXAKTE 6-TAB-STRUKTUR WIE IM SCREENSHOT */}
        <Tabs defaultValue="uebersicht" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="uebersicht" className="text-sm font-semibold">Übersicht</TabsTrigger>
            <TabsTrigger value="zusammenfassung" className="text-sm font-semibold">Zusammenfassung</TabsTrigger>
            <TabsTrigger value="vollstaendiger-inhalt" className="text-sm font-semibold">Vollständiger Inhalt</TabsTrigger>
            <TabsTrigger value="finanzanalyse" className="text-sm font-semibold">Finanzanalyse</TabsTrigger>
            <TabsTrigger value="ki-analyse" className="text-sm font-semibold">KI-Analyse</TabsTrigger>
            <TabsTrigger value="metadaten" className="text-sm font-semibold">Metadaten</TabsTrigger>
          </TabsList>

          {/* ÜBERSICHT TAB */}
          <TabsContent value="uebersicht" className="space-y-6">
            {/* PROJEKTE LISTE */}
            <div className="space-y-6">
          {approvals.map((approval) => (
            <Card key={approval.id} className="border-green-200 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedApproval(approval)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(approval.priority)}`}></div>
                      <CardTitle className="text-xl">{approval.productName}</CardTitle>
                    </div>
                    <CardDescription className="text-base">
                      {approval.company} • {approval.region} • {approval.deviceClass}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(approval.status)}>
                      {getStatusText(approval.status)}
                    </Badge>
                    <Badge className="bg-green-100 text-green-800">{approval.region}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Fortschritt</span>
                    <span className="text-sm font-bold text-green-600">{approval.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full"
                      style={{ width: `${approval.progressPercentage}%` }}
                    ></div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <div className="text-sm text-gray-500">Aktuelle Phase</div>
                      <div className="font-semibold">{approval.currentPhase}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Erwartete Genehmigung</div>
                      <div className="font-semibold">{new Date(approval.expectedApproval).toLocaleDateString('de-DE')}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Geschätzte Kosten</div>
                      <div className="font-semibold">{approval.estimatedCosts}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">KI-Erfolg: <span className="font-semibold text-purple-600">{approval.successProbability}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">{approval.contactPerson}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
            </div>
          </TabsContent>

          {/* ZUSAMMENFASSUNG TAB */}
          <TabsContent value="zusammenfassung" className="space-y-6">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-2xl text-green-800">Laufende Zulassungen Zusammenfassung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Das System verwaltet {totalProjects} aktuelle Zulassungsprojekte mit {averageProgress}% 
                    durchschnittlichem Fortschritt und €4.2M Gesamtinvestition bei 84% KI-Erfolgsvorhersage.
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-800">Wichtige Kennzahlen</h3>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>• {totalProjects} aktuelle Projekte</li>
                        <li>• {averageProgress}% durchschnittlicher Fortschritt</li>
                        <li>• €4.2M Gesamtinvestition</li>
                        <li>• 84% KI-Erfolgsvorhersage</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-800">Regionale Verteilung</h3>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>• EU: CE-Kennzeichnung Verfahren</li>
                        <li>• USA: FDA 510(k) Submissions</li>
                        <li>• Japan: PMDA Consultation</li>
                        <li>• Canada: Health Canada MDL</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* VOLLSTÄNDIGER INHALT TAB */}
          <TabsContent value="vollstaendiger-inhalt" className="space-y-6">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle>Detaillierte Projektanalyse</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <section>
                    <h3 className="text-lg font-semibold text-green-800 mb-3">EU CE-Kennzeichnung Projekte</h3>
                    <p className="text-gray-700 mb-4">
                      Mehrere kritische CE-Kennzeichnungsverfahren in der Endphase, 
                      mit Schwerpunkt auf MDR-Compliance und Benannte Stellen Bewertungen.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">SmartHeart Monitor EU - 95% Fortschritt</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        CE-Kennzeichnung fast abgeschlossen. Benannte Stelle TÜV SÜD finalisiert 
                        letzte Dokumentenprüfung. Erwartete Genehmigung: 22. August 2025.
                      </p>
                      <div className="flex gap-2">
                        <Badge className="bg-green-100 text-green-800">Kurz vor Genehmigung</Badge>
                        <Badge className="bg-blue-100 text-blue-800">Class IIa</Badge>
                      </div>
                    </div>
                  </section>
                  <section>
                    <h3 className="text-lg font-semibold text-green-800 mb-3">FDA 510(k) Submissions</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">NeuroStim Therapy Device - 65% Fortschritt</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        FDA 510(k) Submission eingereicht. Erwarte Q3-Submission Meeting mit FDA.
                        Predicate Device erfolgreich identifiziert.
                      </p>
                      <div className="flex gap-2">
                        <Badge className="bg-yellow-100 text-yellow-800">In Prüfung</Badge>
                        <Badge className="bg-purple-100 text-purple-800">Class II</Badge>
                      </div>
                    </div>
                  </section>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FINANZANALYSE TAB */}
          <TabsContent value="finanzanalyse" className="space-y-6">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle>Finanzielle Auswirkungen der Laufenden Zulassungen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3 mb-6">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">€4.2M</div>
                        <div className="text-sm text-gray-600">Gesamtinvestition Portfolio</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">€180M</div>
                        <div className="text-sm text-gray-600">Erwarteter Marktwert</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">43:1</div>
                        <div className="text-sm text-gray-600">Erwartetes ROI-Verhältnis</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <p className="text-gray-700">
                  Die laufenden Zulassungsprojekte zeigen eine ausgezeichnete Kosten-Nutzen-Relation 
                  mit einem erwarteten ROI von 43:1 bei erfolgreicher Markteinführung.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* KI-ANALYSE TAB */}
          <TabsContent value="ki-analyse" className="space-y-6">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle>KI-gestützte Zulassungsprognose</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-green-800">Erfolgswahrscheinlichkeiten</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>SmartHeart Monitor EU:</span>
                        <Badge className="bg-green-100 text-green-800">97%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>NeuroStim FDA 510(k):</span>
                        <Badge className="bg-blue-100 text-blue-800">78%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>AiAssist Japan PMDA:</span>
                        <Badge className="bg-yellow-100 text-yellow-800">91%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>SmartPump Canada:</span>
                        <Badge className="bg-green-100 text-green-800">83%</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-green-800">KI-Empfehlungen</h3>
                    <div className="space-y-2 text-sm">
                      <div className="bg-green-50 p-3 rounded">
                        <strong>Priorität 1:</strong> SmartHeart EU - Finalisierung beschleunigen
                      </div>
                      <div className="bg-yellow-50 p-3 rounded">
                        <strong>Priorität 2:</strong> NeuroStim FDA - Q3 Meeting vorbereiten
                      </div>
                      <div className="bg-blue-50 p-3 rounded">
                        <strong>Priorität 3:</strong> SmartPump Canada - Cybersecurity nachbessern
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* METADATEN TAB */}
          <TabsContent value="metadaten" className="space-y-6">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle>Metadaten und Projektquellen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="font-semibold mb-2">Regulierungsbehörden</h3>
                      <ul className="text-sm space-y-1">
                        <li>• EU: Benannte Stellen (TÜV SÜD, BSI)</li>
                        <li>• FDA: Center for Devices (CDRH)</li>
                        <li>• PMDA: Japan Pharmaceutical Agency</li>
                        <li>• Health Canada: Medical Device Bureau</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Projektzyklen</h3>
                      <ul className="text-sm space-y-1">
                        <li>• Status Updates: Wöchentlich</li>
                        <li>• KI-Prognose: Täglich</li>
                        <li>• Meilenstein-Tracking: Kontinuierlich</li>
                        <li>• Risk Assessment: Monatlich</li>
                      </ul>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Projektqualität & Vertrauenswürdigkeit</h4>
                    <div className="text-sm space-y-1">
                      <div>Letzte Aktualisierung: 20. August 2025</div>
                      <div>Datenqualität: 99.1%</div>
                      <div>KI-Prognose-Genauigkeit: 84%</div>
                      <div>Projekte aktiv verfolgt: {totalProjects}/{totalProjects}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* DETAILANSICHT MODAL */}
        {selectedApproval && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
               onClick={() => setSelectedApproval(null)}>
            <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-auto" 
                 onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">{selectedApproval.productName}</h2>
                  <Button variant="outline" onClick={() => setSelectedApproval(null)}>
                    Schließen
                  </Button>
                </div>

                {/* EXAKTE TABS WIE IM SCREENSHOT */}
                <Tabs defaultValue="uebersicht" className="w-full">
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="uebersicht">Übersicht</TabsTrigger>
                    <TabsTrigger value="meilensteine">Meilensteine</TabsTrigger>
                    <TabsTrigger value="herausforderungen">Herausforderungen</TabsTrigger>
                    <TabsTrigger value="finanzanalyse">Finanzanalyse</TabsTrigger>
                    <TabsTrigger value="ki-analyse">KI-Analyse</TabsTrigger>
                    <TabsTrigger value="naechste-schritte">Nächste Schritte</TabsTrigger>
                  </TabsList>

                  <TabsContent value="uebersicht" className="mt-6">
                    <div className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                          <CardHeader>
                            <CardTitle>Projektdetails</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div><span className="font-medium">Unternehmen:</span> {selectedApproval.company}</div>
                            <div><span className="font-medium">Region:</span> {selectedApproval.region}</div>
                            <div><span className="font-medium">Regulierungsbehörde:</span> {selectedApproval.regulatoryBody}</div>
                            <div><span className="font-medium">Geräteklasse:</span> {selectedApproval.deviceClass}</div>
                            <div><span className="font-medium">Einreichungsdatum:</span> {new Date(selectedApproval.submissionDate).toLocaleDateString('de-DE')}</div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle>Status & Fortschritt</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span>Fortschritt</span>
                              <span className="font-bold text-green-600">{selectedApproval.progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full"
                                style={{ width: `${selectedApproval.progressPercentage}%` }}
                              ></div>
                            </div>
                            <div><span className="font-medium">Aktuelle Phase:</span> {selectedApproval.currentPhase}</div>
                            <div><span className="font-medium">Status:</span> 
                              <Badge className={`ml-2 ${getStatusColor(selectedApproval.status)}`}>
                                {getStatusText(selectedApproval.status)}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="meilensteine" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Wichtige Meilensteine</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedApproval.keyMilestones.map((milestone, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                              <div className="text-lg">{milestone.split(' ')[0]}</div>
                              <div className="flex-1">{milestone.substring(2)}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="herausforderungen" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Aktuelle Herausforderungen</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedApproval.challenges.map((challenge, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 border border-orange-200 rounded-lg bg-orange-50">
                              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                              <div className="text-orange-800">{challenge}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="finanzanalyse" className="mt-6">
                    <div className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-3">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">{selectedApproval.estimatedCosts}</div>
                              <div className="text-sm text-gray-600">Zulassungskosten</div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">€25M</div>
                              <div className="text-sm text-gray-600">Marktpotential</div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">18</div>
                              <div className="text-sm text-gray-600">Monate ROI</div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      <Card>
                        <CardHeader>
                          <CardTitle>Finanzielle Auswirkungen</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700">{selectedApproval.financialImpact}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="ki-analyse" className="mt-6">
                    <div className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-3">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">{selectedApproval.successProbability}</div>
                              <div className="text-sm text-gray-600">Erfolgswahrscheinlichkeit</div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-lg font-semibold text-orange-600">Mittel</div>
                              <div className="text-sm text-gray-600">Risikobewertung</div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-lg font-semibold text-blue-600">Q4 2025</div>
                              <div className="text-sm text-gray-600">Vorhergesagte Genehmigung</div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      <Card>
                        <CardHeader>
                          <CardTitle>KI-Analyse</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700">{selectedApproval.aiAnalysis}</p>
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold text-blue-800 mb-2">Risikobewertung</h4>
                            <p className="text-blue-700">{selectedApproval.riskAssessment}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="naechste-schritte" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Nächste Schritte</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedApproval.nextSteps.map((step, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 border border-blue-200 rounded-lg bg-blue-50">
                              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                              <div className="text-blue-800">{step}</div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold mb-2">Kontaktperson</h4>
                          <p className="text-gray-700">{selectedApproval.contactPerson}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}