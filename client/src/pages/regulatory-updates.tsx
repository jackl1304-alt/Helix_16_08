import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { ArrowLeft, FileText, Calendar, Globe, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function RegulatoryUpdates() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  const { data: updates, isLoading } = useQuery({
    queryKey: ['/api/regulatory-updates'],
    queryFn: async () => {
      const response = await fetch('/api/regulatory-updates');
      if (!response.ok) throw new Error('Failed to fetch updates');
      return response.json();
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'draft': return <AlertTriangle className="h-4 w-4 text-gray-600" />;
      default: return <FileText className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Zurück zum Dashboard</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Regulatory Updates
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Aktuelle regulatorische Änderungen aus globalen Behörden
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Updates werden geladen...</p>
          </div>
        ) : updates && updates.length > 0 ? (
          <div className="space-y-6">
            {updates.map((update: any) => (
              <Card key={update.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-blue-600 hover:text-blue-800">
                        {update.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {update.summary}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(update.status)}
                      <Badge className={getPriorityColor(update.priority)}>
                        {update.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(update.date).toLocaleDateString('de-DE')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Globe className="h-4 w-4" />
                        <span>{update.region}</span>
                      </div>
                      <Badge variant="outline">{update.category}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Keine Updates verfügbar
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Regulatory Updates werden automatisch synchronisiert
            </p>
          </div>
        )}
      </div>
    </div>
  );
}