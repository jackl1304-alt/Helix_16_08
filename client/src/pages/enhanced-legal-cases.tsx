import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Scale, DollarSign, FileText, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface ComprehensiveLegalCase {
  id: string;
  caseNumber: string;
  title: string;
  court: string;
  jurisdiction: string;
  decisionDate: string;
  summary: string;
  content: string;
  documentUrl?: string;
  impactLevel: 'high' | 'medium' | 'low';
  keywords: string[];
}

export default function EnhancedLegalCases() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('all');
  const [selectedImpactLevel, setSelectedImpactLevel] = useState('all');
  const queryClient = useQueryClient();

  // Fetch comprehensive legal cases
  const { data: legalCases = [], isLoading: isLoadingCases } = useQuery<ComprehensiveLegalCase[]>({
    queryKey: ['/api/legal/cases'],
  });

  // Enhanced legal cases generation mutation
  const generateEnhancedCasesMutation = useMutation({
    mutationFn: () => fetch('/api/legal/comprehensive-cases', { method: 'POST' }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/legal/cases'] });
    },
  });

  // Filter cases based on search and filters
  const filteredCases = (legalCases as ComprehensiveLegalCase[]).filter((legalCase: ComprehensiveLegalCase) => {
    const matchesSearch = !searchTerm || 
      legalCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      legalCase.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      legalCase.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesJurisdiction = selectedJurisdiction === 'all' || legalCase.jurisdiction === selectedJurisdiction;
    const matchesImpactLevel = selectedImpactLevel === 'all' || legalCase.impactLevel === selectedImpactLevel;
    
    return matchesSearch && matchesJurisdiction && matchesImpactLevel;
  });

  // Extract case details from content for display
  const extractCaseDetails = (content: string) => {
    const details = {
      settlementAmount: '',
      plaintiffInjuries: '',
      deviceName: '',
      recallStatus: '',
      adverseEvents: ''
    };

    // Extract settlement amount
    const settlementMatch = content.match(/\$([0-9,]+(?:\.[0-9]{2})?(?:\s*billion|\s*million)?)/i);
    if (settlementMatch) {
      details.settlementAmount = settlementMatch[0];
    }

    // Extract device name
    const deviceMatch = content.match(/\*\*Device:\*\* ([^\n]+)/);
    if (deviceMatch) {
      details.deviceName = deviceMatch[1];
    }

    // Extract recall status
    const recallMatch = content.match(/\*\*Recall Status:\*\* ([^\n]+)/);
    if (recallMatch) {
      details.recallStatus = recallMatch[1];
    }

    // Extract adverse events
    const adverseMatch = content.match(/• Total Reports: ([0-9,]+)/);
    if (adverseMatch) {
      details.adverseEvents = adverseMatch[1];
    }

    return details;
  };

  const getImpactBadgeColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getJurisdictionIcon = (jurisdiction: string) => {
    if (jurisdiction.includes('US')) return '🇺🇸';
    if (jurisdiction.includes('EU')) return '🇪🇺';
    if (jurisdiction.includes('DE')) return '🇩🇪';
    return '⚖️';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Legal Cases</h1>
          <p className="text-gray-600 mt-1">Comprehensive case reconstruction with detailed analysis</p>
        </div>
        <Button 
          onClick={() => generateEnhancedCasesMutation.mutate()}
          disabled={generateEnhancedCasesMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {generateEnhancedCasesMutation.isPending ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Generating Enhanced Cases...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4 mr-2" />
              Generate Enhanced Cases
            </>
          )}
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Cases</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Case title, device, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Jurisdiction</label>
              <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
                <SelectTrigger>
                  <SelectValue placeholder="All Jurisdictions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jurisdictions</SelectItem>
                  <SelectItem value="US Federal">US Federal</SelectItem>
                  <SelectItem value="EU">European Union</SelectItem>
                  <SelectItem value="DE">Germany</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Impact Level</label>
              <Select value={selectedImpactLevel} onValueChange={setSelectedImpactLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="All Impact Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Impact Levels</SelectItem>
                  <SelectItem value="high">High Impact</SelectItem>
                  <SelectItem value="medium">Medium Impact</SelectItem>
                  <SelectItem value="low">Low Impact</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cases Display */}
      <div className="grid gap-6">
        {isLoadingCases ? (
          <div className="text-center py-8">
            <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Loading comprehensive legal cases...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Enhanced Cases Found</h3>
              <p className="text-gray-600 mb-4">
                {legalCases.length === 0 
                  ? 'No comprehensive legal cases available. Generate enhanced cases to see detailed reconstructions.'
                  : 'No cases match your current search criteria.'}
              </p>
              {legalCases.length === 0 && (
                <Button 
                  onClick={() => generateEnhancedCasesMutation.mutate()}
                  disabled={generateEnhancedCasesMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Generate Enhanced Cases
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredCases.map((legalCase: ComprehensiveLegalCase) => {
            const caseDetails = extractCaseDetails(legalCase.content);
            
            return (
              <Card key={legalCase.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 flex items-center gap-2">
                        <span className="text-2xl">{getJurisdictionIcon(legalCase.jurisdiction)}</span>
                        {legalCase.title}
                      </CardTitle>
                      <CardDescription className="text-base">
                        <strong>Case Number:</strong> {legalCase.caseNumber} | 
                        <strong> Court:</strong> {legalCase.court}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge className={getImpactBadgeColor(legalCase.impactLevel)}>
                        {legalCase.impactLevel.toUpperCase()} IMPACT
                      </Badge>
                      <Badge variant="outline">
                        {legalCase.jurisdiction}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview" className="flex items-center gap-1">
                        <Scale className="w-4 h-4" />
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="financial" className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        Financial
                      </TabsTrigger>
                      <TabsTrigger value="device" className="flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        Device
                      </TabsTrigger>
                      <TabsTrigger value="details" className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        Full Details
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="mt-4">
                      <div className="space-y-4">
                        <p className="text-gray-700 leading-relaxed">{legalCase.summary}</p>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-1">Decision Date</h4>
                            <p className="text-gray-700">{new Date(legalCase.decisionDate).toLocaleDateString()}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-1">Keywords</h4>
                            <div className="flex flex-wrap gap-1">
                              {legalCase.keywords.slice(0, 4).map((keyword, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="financial" className="mt-4">
                      <div className="space-y-4">
                        {caseDetails.settlementAmount && (
                          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                            <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                              <DollarSign className="w-5 h-5" />
                              Settlement Amount
                            </h4>
                            <p className="text-2xl font-bold text-green-700">{caseDetails.settlementAmount}</p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-1">Case Type</h4>
                            <p className="text-gray-700">Product Liability / Medical Device</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-1">Status</h4>
                            <p className="text-gray-700 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              Resolved
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="device" className="mt-4">
                      <div className="space-y-4">
                        {caseDetails.deviceName && (
                          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                            <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5" />
                              Medical Device
                            </h4>
                            <p className="text-lg font-medium text-red-700">{caseDetails.deviceName}</p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {caseDetails.recallStatus && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <h4 className="font-semibold text-gray-900 mb-1">Recall Status</h4>
                              <p className="text-gray-700">{caseDetails.recallStatus}</p>
                            </div>
                          )}
                          {caseDetails.adverseEvents && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <h4 className="font-semibold text-gray-900 mb-1">Adverse Event Reports</h4>
                              <p className="text-gray-700">{caseDetails.adverseEvents}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="details" className="mt-4">
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Complete Case Reconstruction
                          </h4>
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                            {legalCase.content}
                          </pre>
                        </div>
                        
                        {legalCase.documentUrl && (
                          <div className="flex justify-end">
                            <Button variant="outline" asChild>
                              <a href={legalCase.documentUrl} target="_blank" rel="noopener noreferrer">
                                <FileText className="w-4 h-4 mr-2" />
                                View Court Documents
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Success Message */}
      {generateEnhancedCasesMutation.isSuccess && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Enhanced legal cases generated successfully!</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}