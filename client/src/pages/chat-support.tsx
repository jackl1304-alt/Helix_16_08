// Chat Support Seite für Tenant-Administrator-Kommunikation
import { SimpleChatDemo } from '@/components/chat/simple-chat-demo';
import { NavigationHeader } from '@/components/ui/navigation-header';
import { ResponsiveLayout } from '@/components/responsive-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Users, Clock, CheckCircle } from 'lucide-react';

export default function ChatSupportPage() {
  // Demo Tenant für Testphase
  const demoTenant = {
    id: 'demo-tenant-id',
    name: 'Demo Medical Company',
    subdomain: 'demo-medical'
  };

  // Demo User für Testphase
  const demoUser = {
    type: 'tenant' as const,
    email: 'admin@demo-medical.local',
    name: 'Demo Admin User'
  };

  return (
    <ResponsiveLayout>
      <NavigationHeader showTenantLinks={true} currentView="tenant" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Header Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              Support Chat Board
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Testphase
              </Badge>
            </CardTitle>
            <CardDescription className="text-gray-700">
              Direkte Kommunikation mit dem Administrator für Probleme, Wünsche und Feedback während der Testphase.
              Ihre Nachrichten werden in Echtzeit übertragen und priorisiert bearbeitet.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900">Sofortige Antwort</h3>
              <p className="text-sm text-gray-600 mt-1">
                Ihre Nachrichten werden in Echtzeit an den Administrator weitergeleitet
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900">Testphase Support</h3>
              <p className="text-sm text-gray-600 mt-1">
                Spezieller Support für Feedback, Bugs und Feature-Wünsche
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-purple-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900">Status-Tracking</h3>
              <p className="text-sm text-gray-600 mt-1">
                Verfolgen Sie den Bearbeitungsstatus Ihrer Anfragen in Echtzeit
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Chat Board Demo Component */}
        <SimpleChatDemo />

        {/* Hilfe-Informationen */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg">Hilfe & Tipps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Nachrichtentypen:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• <strong>Frage:</strong> Allgemeine Fragen zur Plattform</li>
                  <li>• <strong>Bug Report:</strong> Technische Probleme melden</li>
                  <li>• <strong>Feature-Wunsch:</strong> Neue Funktionen vorschlagen</li>
                  <li>• <strong>Feedback:</strong> Verbesserungsvorschläge</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Prioritäten:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• <strong>Dringend:</strong> Kritische Probleme (&lt; 2h)</li>
                  <li>• <strong>Hoch:</strong> Wichtige Probleme (&lt; 4h)</li>
                  <li>• <strong>Normal:</strong> Allgemeine Anfragen (&lt; 24h)</li>
                  <li>• <strong>Niedrig:</strong> Vorschläge (&lt; 48h)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  );
}