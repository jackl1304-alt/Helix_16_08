import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PDFDownloadButtonProps {
  type: 'regulatory-update' | 'legal-case' | 'article' | 'historical-document';
  id: string;
  title?: string;
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showText?: boolean;
}

export function PDFDownloadButton({ 
  type, 
  id, 
  title, 
  variant = "outline", 
  size = "sm", 
  className = "",
  showText = true 
}: PDFDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getApiEndpoint = () => {
    switch (type) {
      case 'regulatory-update':
        return `/api/regulatory-updates/${id}/pdf`;
      case 'legal-case':
        return `/api/legal-cases/${id}/pdf`;
      case 'article':
        return `/api/articles/${id}/pdf`;
      case 'historical-document':
        return `/api/historical/document/${id}/pdf`;
      default:
        return null;
    }
  };

  const getDownloadEndpoint = () => {
    switch (type) {
      case 'regulatory-update':
        return `/api/regulatory-updates/${id}/download`;
      case 'legal-case':
        return `/api/legal-cases/${id}/download`;
      case 'article':
        return `/api/articles/${id}/download`;
      case 'historical-document':
        return `/api/historical/document/${id}/download`;
      default:
        return null;
    }
  };

  const handlePDFDownload = async () => {
    const endpoint = getApiEndpoint();
    if (!endpoint) {
      toast({
        title: "Fehler",
        description: "PDF-Download für diesen Typ nicht verfügbar",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Get PDF data from API
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success || !data.content) {
        throw new Error('PDF-Generierung fehlgeschlagen');
      }

      // Convert base64 to blob and download
      const binaryString = atob(data.content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = data.filename || `document-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "PDF erstellt",
        description: `${data.filename} wurde erfolgreich heruntergeladen`,
      });
      
    } catch (error: any) {
      console.error('PDF Download error:', error);
      toast({
        title: "PDF-Download fehlgeschlagen",
        description: error.message || "Ein unbekannter Fehler ist aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectDownload = () => {
    const downloadEndpoint = getDownloadEndpoint();
    if (downloadEndpoint) {
      window.open(downloadEndpoint, '_blank');
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handlePDFDownload}
      disabled={isLoading}
      className={`flex items-center gap-2 ${className}`}
      title={title || `Als PDF herunterladen`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileText className="h-4 w-4" />
      )}
      {showText && (
        <span className="hidden sm:inline">
          {isLoading ? "Generiere..." : "PDF"}
        </span>
      )}
    </Button>
  );
}

// Simplified version for icon-only buttons
export function PDFDownloadIconButton({ type, id, title, className = "" }: Omit<PDFDownloadButtonProps, 'showText' | 'variant' | 'size'>) {
  return (
    <PDFDownloadButton
      type={type}
      id={id}
      title={title}
      variant="ghost"
      size="icon"
      className={className}
      showText={false}
    />
  );
}