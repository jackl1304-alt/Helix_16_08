import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Scale, 
  ExternalLink, 
  Calendar, 
  MapPin, 
  FileText, 
  Gavel, 
  Users, 
  Quote,
  Database,
  Globe,
  Eye,
  Download
} from "lucide-react";
import { PDFDownloadButton } from "@/components/ui/pdf-download-button";

interface LegalDataRecord {
  id: string;
  title: string;
  caseNumber: string;
  court: string;
  jurisdiction: string;
  dateDecided: string;
  summary: string;
  fullText?: string;
  outcome: string;
  significance: string;
  deviceType: string;
  legalIssues: string[];
  documentUrl: string;
  citations: string[];
  tags: string[];
  language: string;
  metadata?: {
    sourceDatabase: string;
    sourceUrl: string;
    originalLanguage: string;
    translationAvailable: boolean;
    judgeNames: string[];
    legalPrecedent: string;
    relatedCases: string[];
    accessLevel: string;
    citationFormat: string;
    digitalArchiveId: string;
    complianceTopics: string[];
    lastVerified: string;
  };
}

interface EnhancedLegalCardProps {
  case: LegalDataRecord;
}

export function EnhancedLegalCard({ case: legalCase }: EnhancedLegalCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getSignificanceColor = (significance: string) => {
    switch (significance.toLowerCase()) {
      case 'high':
      case 'precedent-setting':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg leading-6 mb-2">
              {legalCase.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Gavel className="h-4 w-4" />
                {legalCase.caseNumber}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {legalCase.jurisdiction}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(legalCase.dateDecided)}
              </span>
            </CardDescription>
          </div>
          <Badge className={getSignificanceColor(legalCase.significance)}>
            {legalCase.significance}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Case Summary */}
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
            {legalCase.summary}
          </p>
        </div>

        {/* Case Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong className="text-gray-700 dark:text-gray-300">Gericht:</strong>
            <p className="text-gray-600 dark:text-gray-400">{legalCase.court}</p>
          </div>
          <div className="col-span-2">
            <strong className="text-gray-700 dark:text-gray-300">Ergebnis:</strong>
            <p className="text-gray-600 dark:text-gray-400">{legalCase.outcome}</p>
            
            {legalCase.verdict && (
              <div className="mt-2 bg-red-50 dark:bg-red-900/20 p-2 rounded border-l-4 border-red-500">
                <strong className="text-red-700 dark:text-red-300 text-xs">Urteilsspruch:</strong>
                <p className="text-red-600 dark:text-red-400 text-xs mt-1 font-medium">{legalCase.verdict}</p>
              </div>
            )}
            
            {legalCase.damages && (
              <div className="mt-2 bg-green-50 dark:bg-green-900/20 p-2 rounded border-l-4 border-green-500">
                <strong className="text-green-700 dark:text-green-300 text-xs">Schadensersatz:</strong>
                <p className="text-green-600 dark:text-green-400 text-xs mt-1 font-medium">{legalCase.damages}</p>
              </div>
            )}
          </div>
          <div>
            <strong className="text-gray-700 dark:text-gray-300">Gerätetype:</strong>
            <p className="text-gray-600 dark:text-gray-400">{legalCase.deviceType}</p>
          </div>
          <div>
            <strong className="text-gray-700 dark:text-gray-300">Sprache:</strong>
            <p className="text-gray-600 dark:text-gray-400">{legalCase.language}</p>
          </div>
        </div>

        {/* Legal Issues Tags */}
        <div>
          <strong className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">Rechtsfragen:</strong>
          <div className="flex flex-wrap gap-1">
            {legalCase.legalIssues.slice(0, 3).map((issue, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {issue}
              </Badge>
            ))}
            {legalCase.legalIssues.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{legalCase.legalIssues.length - 3} weitere
              </Badge>
            )}
          </div>
        </div>

        {/* Enhanced Source Information */}
        {legalCase.metadata && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-blue-600" />
              <strong className="text-sm text-blue-800 dark:text-blue-200">Quellenangaben</strong>
            </div>
            <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
              <div className="flex items-center gap-2">
                <Globe className="h-3 w-3" />
                <span>Datenbank: {legalCase.metadata.sourceDatabase}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-3 w-3" />
                <span>Archiv-ID: {legalCase.metadata.digitalArchiveId}</span>
              </div>
              <div className="flex items-center gap-2">
                <Scale className="h-3 w-3" />
                <span>Präzedenzwert: {legalCase.metadata.legalPrecedent}</span>
              </div>
              {legalCase.metadata.judgeNames.length > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  <span>Richter: {legalCase.metadata.judgeNames.join(", ")}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            <PDFDownloadButton 
              type="legal-case" 
              id={legalCase.id} 
              title={`PDF herunterladen: ${legalCase.title}`}
              variant="outline" 
              size="sm"
            />
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl w-[90vw] h-[80vh]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-blue-600" />
                    {legalCase.title}
                  </DialogTitle>
                </DialogHeader>
                <div className="overflow-auto space-y-6">
                  {/* Full Case Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Falldetails</h3>
                        <div className="space-y-2 text-sm">
                          <div><strong>Aktenzeichen:</strong> {legalCase.caseNumber}</div>
                          <div><strong>Gericht:</strong> {legalCase.court}</div>
                          <div><strong>Jurisdiktion:</strong> {legalCase.jurisdiction}</div>
                          <div><strong>Entscheidungsdatum:</strong> {formatDate(legalCase.dateDecided)}</div>
                          <div><strong>Ergebnis:</strong> {legalCase.outcome}</div>
                          <div><strong>Relevanz:</strong> {legalCase.significance}</div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Rechtsfragen</h3>
                        <div className="flex flex-wrap gap-1">
                          {legalCase.legalIssues.map((issue, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {issue}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Zitationen</h3>
                        <div className="space-y-1 text-sm font-mono bg-gray-50 p-2 rounded">
                          {legalCase.citations.map((citation, index) => (
                            <div key={index}>{citation}</div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Enhanced Source Details */}
                      {legalCase.metadata && (
                        <div>
                          <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            Vollständige Quellenangaben
                          </h3>
                          <div className="bg-blue-50 p-3 rounded-lg space-y-2 text-sm">
                            <div><strong>Quelldatenbank:</strong> {legalCase.metadata.sourceDatabase}</div>
                            <div><strong>Original-URL:</strong> 
                              <a href={legalCase.metadata.sourceUrl} target="_blank" rel="noopener noreferrer" 
                                 className="text-blue-600 hover:underline ml-1 inline-flex items-center gap-1">
                                Zur Quelle <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                            <div><strong>Archiv-ID:</strong> {legalCase.metadata.digitalArchiveId}</div>
                            <div><strong>Zitierformat:</strong> {legalCase.metadata.citationFormat}</div>
                            <div><strong>Zugriffslevel:</strong> {legalCase.metadata.accessLevel}</div>
                            <div><strong>Letzte Verifikation:</strong> {formatDate(legalCase.metadata.lastVerified)}</div>
                            <div><strong>Richter:</strong> {legalCase.metadata.judgeNames.join(", ")}</div>
                            <div><strong>Präzedenzwert:</strong> {legalCase.metadata.legalPrecedent}</div>
                            {legalCase.metadata.relatedCases.length > 0 && (
                              <div><strong>Verwandte Fälle:</strong> {legalCase.metadata.relatedCases.join(", ")}</div>
                            )}
                          </div>
                        </div>
                      )}

                      <div>
                        <h3 className="font-semibold mb-2">Compliance-Themen</h3>
                        <div className="flex flex-wrap gap-1">
                          {legalCase.metadata?.complianceTopics.map((topic, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Zusammenfassung</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {legalCase.summary}
                    </p>
                  </div>

                  {legalCase.fullText && (
                    <div>
                      <h3 className="font-semibold mb-2">Volltext der Entscheidung</h3>
                      <div className="text-sm text-gray-700 bg-white border p-4 rounded max-h-60 overflow-y-auto whitespace-pre-line">
                        {legalCase.fullText}
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {legalCase.documentUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={legalCase.documentUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Dokument
                </a>
              </Button>
            )}
          </div>

          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}