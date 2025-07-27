import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Filter, Download, AlertCircle, FileText, Calendar, Globe } from "lucide-react";

interface RegulatoryUpdate {
  id: string;
  title: string;
  description: string;
  region: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  updateType: string;
  sourceUrl?: string;
  publishedAt: string;
  createdAt: string;
  deviceClasses?: string[];
  categories?: string[];
}

const priorityColors = {
  urgent: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-blue-100 text-blue-800 border-blue-200'
};

const updateTypeColors = {
  guidance: 'bg-blue-100 text-blue-800',
  standard: 'bg-green-100 text-green-800',
  recall: 'bg-red-100 text-red-800',
  approval: 'bg-emerald-100 text-emerald-800',
  variation: 'bg-yellow-100 text-yellow-800',
  notification: 'bg-purple-100 text-purple-800'
};

const mockUpdates: RegulatoryUpdate[] = [
  {
    id: "1",
    title: "FDA Issues New Guidance on AI/ML-Based Medical Device Software",
    description: "The FDA has released comprehensive guidance for manufacturers developing artificial intelligence and machine learning-based medical device software as medical devices. This guidance covers validation requirements, risk management, and quality assurance protocols.",
    region: "US",
    priority: "high",
    updateType: "guidance",
    sourceUrl: "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/artificial-intelligence-and-machine-learning-aiml-software-medical-device",
    publishedAt: "2025-01-25T10:00:00Z",
    createdAt: "2025-01-25T10:30:00Z",
    deviceClasses: ["Class II", "Class III"],
    categories: ["AI/ML", "Software", "Medical Device"]
  },
  {
    id: "2", 
    title: "EMA Updates Guidelines for Clinical Evidence Requirements",
    description: "The European Medicines Agency has updated its guidelines on clinical evidence requirements for medical devices under the Medical Device Regulation (MDR). These changes affect Class IIa, IIb, and III devices manufactured after March 2025.",
    region: "EU",
    priority: "medium",
    updateType: "standard",
    sourceUrl: "https://www.ema.europa.eu/en/documents/regulatory-procedural-guideline/guideline-clinical-evidence-requirements-medical-devices_en.pdf",
    publishedAt: "2025-01-24T14:30:00Z",
    createdAt: "2025-01-24T15:00:00Z",
    deviceClasses: ["Class IIa", "Class IIb", "Class III"],
    categories: ["Clinical Evidence", "MDR", "Guidelines"]
  },
  {
    id: "3",
    title: "BfArM Announces New Digital Health Applications Process",
    description: "Das Bundesinstitut für Arzneimittel und Medizinprodukte (BfArM) hat ein neues Verfahren für die Bewertung digitaler Gesundheitsanwendungen (DiGA) angekündigt. Das Verfahren tritt ab Februar 2025 in Kraft.",
    region: "DE", 
    priority: "urgent",
    updateType: "approval",
    sourceUrl: "https://www.bfarm.de/DE/Medizinprodukte/DiGA/_node.html",
    publishedAt: "2025-01-26T09:15:00Z",
    createdAt: "2025-01-26T09:45:00Z",
    deviceClasses: ["DiGA"],
    categories: ["Digital Health", "Apps", "Reimbursement"]
  },
  {
    id: "4",
    title: "Swissmedic Issues Recall Notice for Cardiac Monitoring Devices",
    description: "Swissmedic has issued a Class I recall for specific models of cardiac monitoring devices due to potential battery failure issues that could lead to device malfunction during critical monitoring periods.",
    region: "CH",
    priority: "urgent", 
    updateType: "recall",
    sourceUrl: "https://www.swissmedic.ch/swissmedic/en/home/medical-devices/market-surveillance/recalls.html",
    publishedAt: "2025-01-27T08:00:00Z",
    createdAt: "2025-01-27T08:15:00Z", 
    deviceClasses: ["Class III"],
    categories: ["Recall", "Cardiac", "Safety Alert"]
  },
  {
    id: "5",
    title: "PMDA Releases Updated Software as Medical Device Guidelines",
    description: "The Pharmaceuticals and Medical Devices Agency (PMDA) has released updated guidelines for Software as Medical Device (SaMD) classification and regulatory pathways in Japan.",
    region: "JP",
    priority: "medium",
    updateType: "guidance",
    sourceUrl: "https://www.pmda.go.jp/english/review-services/reviews/approved-information/medical-devices/0002.html",
    publishedAt: "2025-01-23T12:00:00Z",
    createdAt: "2025-01-23T12:30:00Z",
    deviceClasses: ["SaMD"],
    categories: ["Software", "Classification", "Japan"]
  },
  {
    id: "6",
    title: "MHRA Issues New Post-Market Surveillance Requirements",
    description: "The UK Medicines and Healthcare products Regulatory Agency (MHRA) has introduced enhanced post-market surveillance requirements for high-risk medical devices following Brexit transition arrangements.",
    region: "UK",
    priority: "high",
    updateType: "notification",
    sourceUrl: "https://www.gov.uk/government/organisations/medicines-and-healthcare-products-regulatory-agency",
    publishedAt: "2025-01-22T16:45:00Z",
    createdAt: "2025-01-22T17:00:00Z",
    deviceClasses: ["Class III"],
    categories: ["Post-Market", "Surveillance", "Brexit"]
  }
];

export default function RegulatoryUpdates() {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { data: updates = mockUpdates, isLoading } = useQuery<RegulatoryUpdate[]>({
    queryKey: ["/api/regulatory-updates", { 
      region: selectedRegion === 'all' ? undefined : selectedRegion,
      priority: selectedPriority === 'all' ? undefined : selectedPriority,
      type: selectedType === 'all' ? undefined : selectedType,
      limit: 50 
    }],
    enabled: false // Use mock data for development
  });

  const filteredUpdates = updates?.filter(update => {
    // Text search filter
    const matchesSearch = searchQuery === '' || 
      update.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      update.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      update.categories?.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()));

    // Region filter
    const matchesRegion = selectedRegion === 'all' || update.region === selectedRegion;
    
    // Priority filter  
    const matchesPriority = selectedPriority === 'all' || update.priority === selectedPriority;
    
    // Type filter
    const matchesType = selectedType === 'all' || update.updateType === selectedType;

    // Tab filter
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'urgent' && update.priority === 'urgent') ||
      (activeTab === 'recent' && new Date(update.publishedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

    return matchesSearch && matchesRegion && matchesPriority && matchesType && matchesTab;
  }) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUpdateTypeColor = (type: string) => {
    return updateTypeColors[type as keyof typeof updateTypeColors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Regulatory Updates</h1>
          <p className="text-muted-foreground">
            Aktuelle regulatorische Änderungen aus aller Welt im Überblick
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">Alle Updates</TabsTrigger>
            <TabsTrigger value="urgent" className="text-red-600">
              Dringend ({updates.filter(u => u.priority === 'urgent').length})
            </TabsTrigger>
            <TabsTrigger value="recent">
              Neu (7 Tage)
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filter & Suche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Suche</label>
                <Input
                  placeholder="Titel, Beschreibung, Kategorien..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Region</label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Regionen</SelectItem>
                    <SelectItem value="US">🇺🇸 USA (FDA)</SelectItem>
                    <SelectItem value="EU">🇪🇺 Europa (EMA)</SelectItem>
                    <SelectItem value="DE">🇩🇪 Deutschland (BfArM)</SelectItem>
                    <SelectItem value="CH">🇨🇭 Schweiz (Swissmedic)</SelectItem>
                    <SelectItem value="UK">🇬🇧 UK (MHRA)</SelectItem>
                    <SelectItem value="JP">🇯🇵 Japan (PMDA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Priorität</label>
                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Prioritäten</SelectItem>
                    <SelectItem value="urgent">🚨 Dringend</SelectItem>
                    <SelectItem value="high">🔴 Hoch</SelectItem>
                    <SelectItem value="medium">🟡 Mittel</SelectItem>
                    <SelectItem value="low">🔵 Niedrig</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Update-Typ</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Typen</SelectItem>
                    <SelectItem value="guidance">Leitlinien</SelectItem>
                    <SelectItem value="standard">Standards</SelectItem>
                    <SelectItem value="recall">Rückrufe</SelectItem>
                    <SelectItem value="approval">Zulassungen</SelectItem>
                    <SelectItem value="notification">Benachrichtigungen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSelectedRegion('all');
                    setSelectedPriority('all');
                    setSelectedType('all');
                    setSearchQuery('');
                  }}
                >
                  Filter zurücksetzen
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <TabsContent value={activeTab}>
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {filteredUpdates.length} von {updates.length} Updates gefunden
            </p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Letzte Aktualisierung: {formatDate(new Date().toISOString())}</span>
            </div>
          </div>

          {/* Updates Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredUpdates.map((update) => (
              <Card key={update.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-transparent hover:border-l-primary">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-3">
                    <Badge className={priorityColors[update.priority]} variant="outline">
                      {update.priority === 'urgent' && '🚨 '}
                      {update.priority.toUpperCase()}
                    </Badge>
                    <div className="flex items-center space-x-2">
                      <Badge className={getUpdateTypeColor(update.updateType)} variant="secondary">
                        {update.updateType}
                      </Badge>
                      <Badge variant="outline">
                        {update.region}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg line-clamp-2 leading-6">
                    {update.title}
                  </CardTitle>
                  
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Globe className="h-3 w-3" />
                    <span>{formatDate(update.publishedAt)}</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <CardDescription className="mb-4 line-clamp-3">
                    {update.description}
                  </CardDescription>
                  
                  {update.deviceClasses && update.deviceClasses.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Geräteklassen:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {update.deviceClasses.map((deviceClass) => (
                          <Badge key={deviceClass} variant="outline" className="text-xs">
                            {deviceClass}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {update.categories && update.categories.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Kategorien:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {update.categories.map((category) => (
                          <Badge key={category} variant="secondary" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t">
                    {update.sourceUrl ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={update.sourceUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-3 w-3" />
                          Quelle
                        </a>
                      </Button>
                    ) : (
                      <div />
                    )}
                    
                    {update.priority === 'urgent' && (
                      <div className="flex items-center text-red-600">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">Aktion erforderlich</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredUpdates.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Keine Updates gefunden</h3>
              <p className="text-muted-foreground">
                Passen Sie Ihre Filter an oder versuchen Sie andere Suchbegriffe.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}