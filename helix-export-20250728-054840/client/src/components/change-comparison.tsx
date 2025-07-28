import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Plus, 
  Minus, 
  Edit3, 
  AlertTriangle, 
  Info,
  Calendar,
  Tag,
  Users,
  BarChart3
} from "lucide-react";
import { ChangeDetection, HistoricalDataRecord } from "@shared/schema";

interface ChangeComparisonProps {
  change: ChangeDetection;
}

export function ChangeComparison({ change }: ChangeComparisonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200';
    }
  };

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'content_update': return <Edit3 className="h-4 w-4" />;
      case 'status_change': return <AlertTriangle className="h-4 w-4" />;
      case 'structural_change': return <BarChart3 className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const formatVersion = (version: HistoricalDataRecord | number): string => {
    if (typeof version === 'number') return `Version ${version}`;
    return `${version.documentTitle} (Version ${version.version})`;
  };

  const getVersionData = (version: HistoricalDataRecord | number): HistoricalDataRecord | null => {
    return typeof version === 'object' ? version : null;
  };

  const oldVersion = getVersionData(change.previousVersion);
  const newVersion = getVersionData(change.currentVersion);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                {getChangeTypeIcon(change.changeType)}
                {change.documentTitle || change.documentId}
              </CardTitle>
              <Badge className={getImpactColor(change.impactAssessment)}>
                {change.impactAssessment.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                {change.detectedAt ? new Date(change.detectedAt).toLocaleDateString('de-DE') : 'Heute'}
                {change.confidence && (
                  <span className="ml-2">• {Math.round(change.confidence * 100)}% Konfidenz</span>
                )}
              </div>
              <div className="text-sm">
                <strong>Hauptänderungen:</strong>
              </div>
              <ul className="text-sm space-y-1">
                {change.changesSummary.slice(0, 3).map((summary, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300">
                    • {summary}
                  </li>
                ))}
                {change.changesSummary.length > 3 && (
                  <li className="text-blue-600 dark:text-blue-400">
                    + {change.changesSummary.length - 3} weitere Änderungen
                  </li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getChangeTypeIcon(change.changeType)}
            Detaillierter Änderungsvergleich: {change.documentTitle || change.documentId}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Zusammenfassung</TabsTrigger>
            <TabsTrigger value="comparison">Vergleich</TabsTrigger>
            <TabsTrigger value="impact">Impact-Analyse</TabsTrigger>
            <TabsTrigger value="metadata">Metadaten</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Änderungsübersicht</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Änderungstyp:</span>
                      <Badge variant="outline">{change.changeType}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Impact:</span>
                      <Badge className={getImpactColor(change.impactAssessment)}>
                        {change.impactAssessment}
                      </Badge>
                    </div>
                    {change.confidence && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Konfidenz:</span>
                        <span className="text-sm">{Math.round(change.confidence * 100)}%</span>
                      </div>
                    )}
                    {change.detailedComparison && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Inhalt geändert:</span>
                        <span className="text-sm">{change.detailedComparison.contentDiffPercentage}%</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Betroffene Bereiche</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {change.affectedSections && change.affectedSections.length > 0 ? (
                      change.affectedSections.map((section, index) => (
                        <Badge key={index} variant="secondary" className="mr-2 mb-2">
                          {section}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">Keine spezifischen Bereiche identifiziert</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Änderungen im Detail</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-40">
                  <ul className="space-y-2">
                    {change.changesSummary.map((summary, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">{summary}</span>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            {change.detailedComparison && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Plus className="h-4 w-4 text-green-600" />
                      Hinzugefügt ({change.detailedComparison.addedContent.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-60">
                      {change.detailedComparison.addedContent.length > 0 ? (
                        <ul className="space-y-1">
                          {change.detailedComparison.addedContent.map((content, index) => (
                            <li key={index} className="text-sm p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-2 border-green-500">
                              {content}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-sm text-gray-500">Keine neuen Inhalte</span>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Minus className="h-4 w-4 text-red-600" />
                      Entfernt ({change.detailedComparison.removedContent.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-60">
                      {change.detailedComparison.removedContent.length > 0 ? (
                        <ul className="space-y-1">
                          {change.detailedComparison.removedContent.map((content, index) => (
                            <li key={index} className="text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded border-l-2 border-red-500">
                              {content}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-sm text-gray-500">Keine entfernten Inhalte</span>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Edit3 className="h-4 w-4 text-orange-600" />
                      Geändert ({change.detailedComparison.modifiedSections.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-60">
                      {change.detailedComparison.modifiedSections.length > 0 ? (
                        <ul className="space-y-1">
                          {change.detailedComparison.modifiedSections.map((section, index) => (
                            <li key={index} className="text-sm p-2 bg-orange-50 dark:bg-orange-900/20 rounded border-l-2 border-orange-500">
                              {section}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-sm text-gray-500">Keine modifizierten Bereiche</span>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="impact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Betroffene Stakeholder
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {change.affectedStakeholders && change.affectedStakeholders.length > 0 ? (
                    change.affectedStakeholders.map((stakeholder, index) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-2">
                        {stakeholder}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">Keine spezifischen Stakeholder identifiziert</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {change.detailedComparison && change.detailedComparison.structuralChanges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Strukturelle Änderungen</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {change.detailedComparison.structuralChanges.map((structuralChange, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{structuralChange}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="metadata" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Vorherige Version</CardTitle>
                </CardHeader>
                <CardContent>
                  {oldVersion ? (
                    <div className="space-y-2 text-sm">
                      <div><strong>Version:</strong> {oldVersion.version}</div>
                      <div><strong>Datum:</strong> {new Date(oldVersion.originalDate).toLocaleDateString('de-DE')}</div>
                      <div><strong>Status:</strong> {oldVersion.status}</div>
                      <div><strong>Kategorie:</strong> {oldVersion.category}</div>
                      <div><strong>Sprache:</strong> {oldVersion.language}</div>
                      <div><strong>Seiten:</strong> {oldVersion.metadata.pageCount}</div>
                      <div><strong>Geräteklassen:</strong> {oldVersion.deviceClasses.join(', ')}</div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Version {formatVersion(change.previousVersion)}</span>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Aktuelle Version</CardTitle>
                </CardHeader>
                <CardContent>
                  {newVersion ? (
                    <div className="space-y-2 text-sm">
                      <div><strong>Version:</strong> {newVersion.version}</div>
                      <div><strong>Datum:</strong> {new Date(newVersion.originalDate).toLocaleDateString('de-DE')}</div>
                      <div><strong>Status:</strong> {newVersion.status}</div>
                      <div><strong>Kategorie:</strong> {newVersion.category}</div>
                      <div><strong>Sprache:</strong> {newVersion.language}</div>
                      <div><strong>Seiten:</strong> {newVersion.metadata.pageCount}</div>
                      <div><strong>Geräteklassen:</strong> {newVersion.deviceClasses.join(', ')}</div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Version {formatVersion(change.currentVersion)}</span>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}