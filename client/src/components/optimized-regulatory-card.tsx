import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/performance-optimized-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AISummary } from "@/components/ai-summary";
import { FormattedText } from "@/components/formatted-text";
import { Bell, FileText, Download, ExternalLink, Clock, Eye, Shield } from "lucide-react";

interface RegulatoryUpdate {
  id: string;
  title: string;
  description: string;
  source_id: string;
  source_url: string;
  region: string;
  update_type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  device_classes: any[];
  categories: any;
  published_at: string;
  created_at: string;
  content?: string;
  fullText?: string;
}

interface OptimizedRegulatoryCardProps {
  update: RegulatoryUpdate;
  onDownload: (update: RegulatoryUpdate) => void;
  priorityColors: Record<string, string>;
  priorityLabels: Record<string, string>;
}

// Memoized Priority Badge for better performance
const PriorityBadge = React.memo(({ priority, priorityColors, priorityLabels }: {
  priority: string;
  priorityColors: Record<string, string>;
  priorityLabels: Record<string, string>;
}) => (
  <Badge className={`${priorityColors[priority]} border font-medium`}>
    <Bell className="w-3 h-3 mr-1" />
    {priorityLabels[priority]}
  </Badge>
));

// Memoized Region Badge
const RegionBadge = React.memo(({ region }: { region: string }) => (
  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
    {region}
  </Badge>
));

// Memoized Date Display
const DateDisplay = React.memo(({ date }: { date: string }) => {
  const displayDate = new Date(date).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  return (
    <div className="flex items-center text-sm text-muted-foreground">
      <Clock className="w-4 h-4 mr-1" />
      {displayDate}
    </div>
  );
});

// Memoized Action Buttons
const ActionButtons = React.memo(({ update, onDownload }: {
  update: RegulatoryUpdate;
  onDownload: (update: RegulatoryUpdate) => void;
}) => (
  <div className="flex gap-2 mt-4">
    <Button 
      variant="outline" 
      size="sm" 
      onClick={() => onDownload(update)}
      className="flex-1"
    >
      <Download className="w-4 h-4 mr-2" />
      Download
    </Button>
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => window.open(update.source_url, '_blank')}
      className="flex-1"
    >
      <ExternalLink className="w-4 h-4 mr-2" />
      Quelle
    </Button>
  </div>
));

// Main optimized card component
export const OptimizedRegulatoryCard = React.memo(({
  update,
  onDownload,
  priorityColors,
  priorityLabels
}: OptimizedRegulatoryCardProps) => {
  return (
    <Card className="h-full hover:shadow-md transition-shadow duration-200 will-change-transform">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap gap-2 mb-2">
          <PriorityBadge 
            priority={update.priority} 
            priorityColors={priorityColors}
            priorityLabels={priorityLabels}
          />
          <RegionBadge region={update.region} />
          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
            <Shield className="w-3 h-3 mr-1" />
            {update.source_id}
          </Badge>
        </div>
        
        <CardTitle className="text-lg leading-tight line-clamp-2">
          {update.title}
        </CardTitle>
        
        <DateDisplay date={update.published_at} />
      </CardHeader>
      
      <CardContent className="space-y-4">
        <CardDescription className="line-clamp-3 text-sm leading-relaxed">
          {update.description}
        </CardDescription>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="w-4 h-4 mr-2" />
              Details anzeigen
            </Button>
          </DialogTrigger>
          <DialogContent 
            className="max-w-4xl max-h-[80vh] overflow-hidden"
            aria-describedby={`dialog-description-${update.id}`}
          >
            <DialogHeader>
              <DialogTitle className="text-xl">{update.title}</DialogTitle>
              <div id={`dialog-description-${update.id}`} className="sr-only">
                Detaillierte Informationen zum Regulatory Update
              </div>
            </DialogHeader>
            
            <div className="overflow-y-auto max-h-[60vh] space-y-6">
              <div className="flex flex-wrap gap-2">
                <PriorityBadge 
                  priority={update.priority} 
                  priorityColors={priorityColors}
                  priorityLabels={priorityLabels}
                />
                <RegionBadge region={update.region} />
                <Badge variant="secondary">
                  <FileText className="w-3 h-3 mr-1" />
                  {update.update_type}
                </Badge>
              </div>

              <div className="prose max-w-none">
                <FormattedText text={update.fullText || update.content || update.description} />
              </div>

              <AISummary 
                content={update.fullText || update.content || update.description}
                contentType="regulatory_update"
                className="border-t pt-4"
              />
            </div>
          </DialogContent>
        </Dialog>

        <ActionButtons update={update} onDownload={onDownload} />
      </CardContent>
    </Card>
  );
});

OptimizedRegulatoryCard.displayName = "OptimizedRegulatoryCard";