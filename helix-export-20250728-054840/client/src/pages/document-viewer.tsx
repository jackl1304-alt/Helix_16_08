import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, ExternalLink, FileText, Calendar, Globe, FileIcon } from "lucide-react";

interface Document {
  id: string;
  title: string;
  content: string;
  sourceType: string;
  createdAt: string;
  metadata: {
    pages: number;
    language: string;
    fileSize: string;
    format: string;
  };
}

export default function DocumentViewer() {
  const { sourceType, documentId } = useParams();
  const [fontSize, setFontSize] = useState(16);

  const { data: document, isLoading, error } = useQuery<Document>({
    queryKey: [`/api/documents/${sourceType}/${documentId}`],
    enabled: !!(sourceType && documentId),
  });

  if (isLoading) {
    return (
      <div className="animate-pulse p-6">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="mx-auto h-8 w-8 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Document Not Found</h3>
            <p className="text-gray-500">The requested document could not be loaded.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getSourceBadge = (sourceType: string) => {
    switch (sourceType.toLowerCase()) {
      case 'fda':
        return <Badge className="bg-blue-100 text-blue-800">FDA</Badge>;
      case 'ema':
        return <Badge className="bg-green-100 text-green-800">EMA</Badge>;
      case 'bfarm':
        return <Badge className="bg-red-100 text-red-800">BfArM</Badge>;
      case 'swissmedic':
        return <Badge className="bg-purple-100 text-purple-800">Swissmedic</Badge>;
      default:
        return <Badge variant="secondary">{sourceType.toUpperCase()}</Badge>;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{document.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              {getSourceBadge(document.sourceType)}
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(document.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <Globe className="h-4 w-4 mr-1" />
                {document.metadata.language.toUpperCase()}
              </span>
              <span className="flex items-center">
                <FileIcon className="h-4 w-4 mr-1" />
                {document.metadata.pages} pages
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Original Source
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Document Controls */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Document Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Size
                </label>
                <div className="flex space-x-1">
                  {[14, 16, 18].map((size) => (
                    <Button
                      key={size}
                      variant={fontSize === size ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFontSize(size)}
                    >
                      {size}px
                    </Button>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Document Info</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>Format: {document.metadata.format}</div>
                  <div>Size: {document.metadata.fileSize}</div>
                  <div>Pages: {document.metadata.pages}</div>
                  <div>Language: {document.metadata.language.toUpperCase()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Document Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[800px] w-full">
                <div className="p-6">
                  <div 
                    className="prose max-w-none"
                    style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
                  >
                    {document.content.split('\n').map((line, index) => {
                      if (line.startsWith('# ')) {
                        return (
                          <h1 key={index} className="text-2xl font-bold mt-6 mb-4 text-gray-900">
                            {line.substring(2)}
                          </h1>
                        );
                      }
                      if (line.startsWith('## ')) {
                        return (
                          <h2 key={index} className="text-xl font-semibold mt-5 mb-3 text-gray-800">
                            {line.substring(3)}
                          </h2>
                        );
                      }
                      if (line.startsWith('### ')) {
                        return (
                          <h3 key={index} className="text-lg font-medium mt-4 mb-2 text-gray-700">
                            {line.substring(4)}
                          </h3>
                        );
                      }
                      if (line.startsWith('- ')) {
                        return (
                          <li key={index} className="ml-4 mb-1">
                            {line.substring(2)}
                          </li>
                        );
                      }
                      if (line.trim() === '') {
                        return <br key={index} />;
                      }
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return (
                          <p key={index} className="font-semibold mb-2">
                            {line.substring(2, line.length - 2)}
                          </p>
                        );
                      }
                      return (
                        <p key={index} className="mb-3 text-gray-700">
                          {line}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}