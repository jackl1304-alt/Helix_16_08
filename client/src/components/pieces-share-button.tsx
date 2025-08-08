import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PiecesShareButtonProps {
  type: 'regulatory' | 'legal' | 'newsletter';
  itemId: string;
  title: string;
  compact?: boolean;
}

export function PiecesShareButton({ type, itemId, title, compact = false }: PiecesShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isShared, setIsShared] = useState(false);
  const { toast } = useToast();
  
  const handleShare = async () => {
    setIsSharing(true);
    
    try {
      // Bestimme den korrekten API-Endpunkt
      const endpoint = `/api/pieces/share/${type}`;
      const body = type === 'regulatory' ? { updateId: itemId } : 
                   type === 'legal' ? { caseId: itemId } : 
                   { newsletterId: itemId };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });
      
      const result = await response.json();
      
      if (result.success && result.shareUrl) {
        setShareUrl(result.shareUrl);
        setIsShared(true);
        
        // Kopiere die URL automatisch in die Zwischenablage
        try {
          await navigator.clipboard.writeText(result.shareUrl);
          toast({
            title: "✅ Erfolgreich geteilt",
            description: `"${title}" wurde über Pieces geteilt und Link in Zwischenablage kopiert.`,
          });
        } catch (clipboardError) {
          toast({
            title: "✅ Erfolgreich geteilt",
            description: `"${title}" wurde über Pieces geteilt: ${result.shareUrl}`,
          });
        }
      } else {
        throw new Error(result.error || 'Teilen fehlgeschlagen');
      }
    } catch (error) {
      console.error('Fehler beim Teilen:', error);
      toast({
        title: "❌ Fehler beim Teilen",
        description: error instanceof Error ? error.message : "Pieces API nicht verfügbar",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };
  
  const openSharedContent = () => {
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };
  
  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={handleShare}
          disabled={isSharing}
          className="px-2 py-1"
        >
          {isSharing ? (
            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          ) : isShared ? (
            <Check className="w-3 h-3 text-green-600" />
          ) : (
            <Share2 className="w-3 h-3" />
          )}
        </Button>
        
        {shareUrl && (
          <Button
            size="sm"
            variant="outline"
            onClick={openSharedContent}
            className="px-2 py-1"
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleShare}
        disabled={isSharing}
        variant={isShared ? "default" : "outline"}
        className="flex items-center gap-2"
      >
        {isSharing ? (
          <>
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            Teile...
          </>
        ) : isShared ? (
          <>
            <Check className="w-4 h-4" />
            Geteilt
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4" />
            Über Pieces teilen
          </>
        )}
      </Button>
      
      {shareUrl && (
        <Button
          onClick={openSharedContent}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Öffnen
        </Button>
      )}
    </div>
  );
}

// Pieces Health Status Komponente
export function PiecesHealthStatus() {
  const [health, setHealth] = useState<{ healthy: boolean; status: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const checkHealth = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/pieces/health');
      const result = await response.json();
      setHealth(result);
    } catch (error) {
      setHealth({ healthy: false, status: 'Error' });
    } finally {
      setIsLoading(false);
    }
  };
  
  React.useEffect(() => {
    checkHealth();
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        Prüfe Pieces API...
      </div>
    );
  }
  
  if (!health) return null;
  
  return (
    <div className="flex items-center gap-2 text-sm">
      {health.healthy ? (
        <>
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-green-600">Pieces API verfügbar</span>
        </>
      ) : (
        <>
          <AlertCircle className="w-3 h-3 text-yellow-500" />
          <span className="text-yellow-600">Pieces API nicht verfügbar</span>
        </>
      )}
    </div>
  );
}

// Auto-Share Komponente für kritische Updates
export function AutoShareCritical() {
  const [isSharing, setIsSharing] = useState(false);
  const [result, setResult] = useState<{ sharedCount: number; message: string } | null>(null);
  const { toast } = useToast();
  
  const handleAutoShare = async () => {
    setIsSharing(true);
    
    try {
      const response = await fetch('/api/pieces/auto-share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setResult(data);
      
      toast({
        title: "🚀 Automatisches Teilen abgeschlossen",
        description: data.message,
      });
    } catch (error) {
      toast({
        title: "❌ Fehler beim automatischen Teilen",
        description: "Pieces API nicht verfügbar oder Fehler aufgetreten",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };
  
  return (
    <div className="space-y-3">
      <Button
        onClick={handleAutoShare}
        disabled={isSharing}
        variant="outline"
        className="w-full"
      >
        {isSharing ? (
          <>
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
            Teile kritische Updates...
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4 mr-2" />
            Kritische Updates automatisch teilen
          </>
        )}
      </Button>
      
      {result && (
        <div className="text-sm text-center text-gray-600 bg-gray-50 p-3 rounded">
          ✅ {result.message}
        </div>
      )}
    </div>
  );
}