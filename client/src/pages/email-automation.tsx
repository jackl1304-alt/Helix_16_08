import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Settings, CheckCircle, AlertTriangle, Plus, Edit, Zap, Clock, Mail, Users, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  trigger: string;
  condition: string;
  emailTemplate: string;
  recipients: string[];
  frequency: string;
  lastExecuted: string;
  totalSent: number;
}

interface AutomationData {
  success: boolean;
  automationRules: AutomationRule[];
  totalRules: number;
  activeRules: number;
}

export default function EmailAutomation() {
  const [, setLocation] = useLocation();
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const { toast } = useToast();

  // Fetch automation rules
  const { data: automationData, isLoading, refetch } = useQuery<AutomationData>({
    queryKey: ['/api/email/automation'],
  });

  // Toggle rule status mutation
  const toggleRuleMutation = useMutation({
    mutationFn: async ({ ruleId, isActive }: { ruleId: string; isActive: boolean }) => {
      // In a real implementation, this would call the API to toggle the rule
      return { success: true, ruleId, newStatus: !isActive };
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Regel aktualisiert",
        description: `Automatisierungsregel wurde ${data.newStatus ? 'aktiviert' : 'deaktiviert'}`
      });
      refetch();
    }
  });

  const handleToggleRule = (rule: AutomationRule) => {
    toggleRuleMutation.mutate({ ruleId: rule.id, isActive: rule.isActive });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/email-management')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Zurück zum E-Mail-Management</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                E-Mail-Automatisierung
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {automationData ? `${automationData.activeRules} aktive Regeln von ${automationData.totalRules} insgesamt` : 'Laden...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Zap className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Aktive Regeln</p>
                  <p className="text-2xl font-bold">{automationData?.activeRules || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Mail className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Heute versendet</p>
                  <p className="text-2xl font-bold">
                    {automationData?.automationRules?.reduce((sum, rule) => sum + (rule.lastExecuted === new Date().toISOString().split('T')[0] ? rule.totalSent : 0), 0) || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Gesamt versendet</p>
                  <p className="text-2xl font-bold">
                    {automationData?.automationRules?.reduce((sum, rule) => sum + rule.totalSent, 0) || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Automatisierungsregeln</h2>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Neue Regel erstellen
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Automatisierungsregeln werden geladen...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Automation Rules List */}
          {!isLoading && automationData?.automationRules && (
            <div className="space-y-4">
              {automationData.automationRules.map((rule) => (
                <Card key={rule.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${rule.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          {rule.isActive ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{rule.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{rule.description}</p>
                          
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge variant={rule.isActive ? "default" : "secondary"}>
                              {rule.isActive ? 'Aktiv' : 'Inaktiv'}
                            </Badge>
                            <Badge variant="outline" className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{rule.frequency}</span>
                            </Badge>
                            <Badge variant="outline">
                              Template: {rule.emailTemplate}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant={rule.isActive ? "secondary" : "default"}
                          onClick={() => handleToggleRule(rule)}
                          disabled={toggleRuleMutation.isPending}
                        >
                          {rule.isActive ? (
                            <>
                              <Pause className="w-3 h-3 mr-1" />
                              Deaktivieren
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 mr-1" />
                              Aktivieren
                            </>
                          )}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3 mr-1" />
                          Bearbeiten
                        </Button>
                      </div>
                    </div>

                    {/* Rule Details */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Trigger</p>
                        <p className="text-sm font-semibold">{rule.trigger}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Bedingung</p>
                        <p className="text-sm font-semibold">{rule.condition}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Zuletzt ausgeführt</p>
                        <p className="text-sm font-semibold">
                          {new Date(rule.lastExecuted).toLocaleString('de-DE')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">E-Mails versendet</p>
                        <p className="text-sm font-semibold">{rule.totalSent.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Recipients */}
                    <div className="mt-4">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-2">Empfänger</p>
                      <div className="flex flex-wrap gap-2">
                        {rule.recipients.map((recipient, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {recipient}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && (!automationData?.automationRules || automationData.automationRules.length === 0) && (
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <Zap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Keine Automatisierungsregeln
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Erstellen Sie Ihre erste Automatisierungsregel für effizientes E-Mail-Management.
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Erste Regel erstellen
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help Card */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900 dark:text-blue-100">
                <Settings className="w-5 h-5 mr-2" />
                Automatisierung-Übersicht
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Optimieren Sie Ihre E-Mail-Kommunikation mit intelligenten Automatisierungsregeln
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Sofortige Benachrichtigungen</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Automatische E-Mails bei kritischen regulatorischen Updates
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Geplante Digest</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Wöchentliche Zusammenfassungen und regelmäßige Updates
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Kunden-Lifecycle</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Onboarding, Billing-Erinnerungen und Offboarding automatisiert
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}