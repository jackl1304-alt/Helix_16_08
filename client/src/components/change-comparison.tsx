import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Calendar, 
  AlertTriangle,
  ArrowRight,
  Download,
  ExternalLink
} from "lucide-react";

interface ChangeComparisonProps {
  change: {
    id: string;
    document_id: string;
    change_type: string;
    description: string;
    detected_at: string;
  };
}

export function ChangeComparison({ change }: ChangeComparisonProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Erkannte Änderung
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm">
            {new Date(change.detected_at).toLocaleDateString('de-DE')}
          </span>
        </div>
        
        <div className="space-y-2">
          <Badge variant="outline">{change.change_type}</Badge>
          <p className="text-sm text-gray-600">{change.description}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4" />
            Vollständige Änderung anzeigen
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            Vergleich herunterladen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}