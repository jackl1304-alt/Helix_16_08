import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PDFDownloadButtonProps {
  type: 'regulatory-update' | 'legal-case' | 'article' | 'historical-document' | 'newsletter' | 'knowledge-article';
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
      case 'newsletter':
        return `/api/newsletters/${id}/pdf`;
      case 'knowledge-article':
        return `/api/knowledge-articles/${id}/pdf`;
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
      // Fetch PDF with correct headers for download
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
          'Content-Type': 'application/pdf',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `helix-document-${id}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      // Get PDF blob and force download
      const blob = await response.blob();
      
      // Create download link with proper MIME type
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `document-${id}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "PDF erstellt",
        description: `${filename} wurde erfolgreich heruntergeladen`,
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