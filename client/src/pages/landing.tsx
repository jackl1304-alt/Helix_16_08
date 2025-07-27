import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FullLogo } from "@/components/layout/logo";
import { 
  Activity, 
  Globe, 
  Brain, 
  Shield, 
  TrendingUp, 
  Zap,
  CheckCircle,
  ArrowRight
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <FullLogo />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Intelligente <span className="text-blue-600">MedTech</span>
              <br />
              Regulatory Compliance
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Automatisierte globale Überwachung regulatorischer Landschaften, 
              KI-gestützte Analyse und nahtlose Compliance-Workflows für die Medizintechnik-Industrie.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-3">
                Jetzt anmelden
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Demo ansehen
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Warum Helix wählen?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Revolutionieren Sie Ihre regulatorische Compliance mit modernster Technologie
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Globale Abdeckung</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Überwachung von FDA, EMA, BfArM, Swissmedic, MHRA und weiteren 
                  internationalen Behörden in Echtzeit.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>KI-Powered Analyse</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Intelligente Kategorisierung, Risikobewertung und 
                  automatische Relevanzfilterung durch fortschrittliche NLP.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Compliance Assurance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Automatisierte Workflows, Audit-Trails und 
                  lückenlose Dokumentation für regulatory readiness.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Analytics & Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Detaillierte Trends, Compliance-Gaps Analyse und 
                  strategische Intelligence für bessere Entscheidungen.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Real-time Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Sofortige Benachrichtigungen bei kritischen 
                  regulatorischen Änderungen und Deadline-Alerts.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Activity className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>Seamless Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Nahtlose Integration in bestehende QM-Systeme und 
                  Unternehmensprozesse mit flexiblen APIs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-blue-600">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Bereit für die Zukunft der Regulatory Intelligence?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Schließen Sie sich führenden MedTech-Unternehmen an und revolutionieren Sie Ihre Compliance-Prozesse.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
            Kostenlosen Zugang erhalten
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <FullLogo />
            </div>
            <div className="text-sm">
              © 2025 Helix MedTech Intelligence. Alle Rechte vorbehalten.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}