import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { 
  Building,
  User,
  Crown,
  Settings,
  Rocket,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Globe,
  Mail,
  Phone,
  CreditCard,
  Shield,
  Zap,
  Activity
} from "lucide-react";

const ONBOARDING_STEPS = [
  { id: 1, title: 'Unternehmen', description: 'Grundlegende Unternehmensdaten' },
  { id: 2, title: 'Kontakt', description: 'Ansprechpartner und Kontaktdaten' },
  { id: 3, title: 'Subscription', description: 'Passenden Plan auswählen' },
  { id: 4, title: 'Präferenzen', description: 'Einstellungen und Regionen' },
  { id: 5, title: 'Abschluss', description: 'Tenant Setup abschließen' }
];

const SUBSCRIPTION_PLANS = {
  starter: { 
    name: 'Starter', 
    price: 299, 
    features: ['500 Updates/Monat', 'Basic Dashboard', 'Email Support', 'Standard Regionen'],
    users: 5,
    color: 'blue'
  },
  professional: { 
    name: 'Professional', 
    price: 899, 
    features: ['2.500 Updates/Monat', 'AI-Insights', 'Priority Support', 'Custom Dashboards', 'Alle Regionen', 'API-Zugang'],
    users: 25,
    popular: true,
    color: 'purple'
  },
  enterprise: { 
    name: 'Enterprise', 
    price: 2499, 
    features: ['Unlimited Updates', 'Full AI-Analytics', 'White-label', 'API-Access', 'Dedicated Manager', 'Custom Integrations'],
    users: 'Unlimited',
    color: 'orange'
  }
};

export default function TenantOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Company
    companyName: '',
    industry: '',
    companySize: '',
    website: '',
    description: '',
    // Step 2: Contact
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contactRole: '',
    // Step 3: Subscription
    selectedPlan: 'professional' as keyof typeof SUBSCRIPTION_PLANS,
    billingCycle: 'monthly',
    // Step 4: Preferences
    regions: [] as string[],
    notifications: {
      email: true,
      sms: false,
      slack: false
    } as Record<string, boolean>,
    integrations: [] as string[]
  });

  const createTenantMutation = useMutation({
    mutationFn: async (tenantData: any) => {
      // Transform form data to match backend schema
      const baseSlug = tenantData.companyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp for uniqueness
      
      const payload = {
        name: tenantData.companyName,
        slug: `${baseSlug}-${timestamp}`,
        industry: tenantData.industry || 'Medical Technology',
        description: tenantData.description,
        website: tenantData.website,
        subscriptionPlan: tenantData.selectedPlan || 'professional',
        subscriptionStatus: 'trial',
        billingEmail: tenantData.contactEmail,
        contactName: tenantData.contactName,
        contactEmail: tenantData.contactEmail,
        maxUsers: tenantData.selectedPlan === 'starter' ? 5 : 
                 tenantData.selectedPlan === 'professional' ? 25 : 999999,
        maxDataSources: tenantData.selectedPlan === 'starter' ? 10 : 
                       tenantData.selectedPlan === 'professional' ? 50 : 999999,
        apiAccessEnabled: tenantData.selectedPlan !== 'starter',
        customBrandingEnabled: tenantData.selectedPlan === 'enterprise'
      };

      const response = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create tenant');
      }

      return await response.json();
    },
    onSuccess: (data) => {
      console.log('[TENANT-ONBOARDING] Success response:', data);
      toast({
        title: "Tenant erfolgreich erstellt!",
        description: `Willkommen bei Helix! Ihr Tenant-ID: ${data.data?.id || 'Unbekannt'}`,
      });
      setCurrentStep(5);
    },
    onError: (error) => {
      console.error('[TENANT-ONBOARDING] Error:', error);
      let errorMessage = error.message || "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.";
      
      if (error.message?.includes('Slug bereits vergeben') || error.message?.includes('Slug already exists')) {
        errorMessage = "Dieser Unternehmensname ist bereits registriert. Bitte wählen Sie einen anderen Namen oder kontaktieren Sie den Support.";
      }
      
      toast({
        title: "Fehler beim Erstellen",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    createTenantMutation.mutate(formData);
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-2">
        {ONBOARDING_STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
              ${currentStep >= step.id 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
              }
            `}>
              {currentStep > step.id ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                step.id
              )}
            </div>
            {index < ONBOARDING_STEPS.length - 1 && (
              <div className={`
                w-12 h-0.5 mx-2
                ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'}
              `} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const PlanCard = ({ planKey, plan, isSelected, onSelect }: {
    planKey: string;
    plan: any;
    isSelected: boolean;
    onSelect: (key: string) => void;
  }) => (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${
        isSelected ? 'ring-2 ring-blue-500 border-blue-200' : 'hover:shadow-md'
      } ${plan.popular ? 'border-purple-200 bg-purple-50/30' : ''}`}
      onClick={() => onSelect(planKey)}
    >
      {plan.popular && (
        <div className="bg-purple-500 text-white text-xs font-medium px-3 py-1 rounded-t-lg text-center">
          ⭐ Empfohlen
        </div>
      )}
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            €{plan.price.toLocaleString()}
            <span className="text-sm text-muted-foreground">/Monat</span>
          </div>
          <div className="text-sm text-muted-foreground mb-4">
            Bis zu {plan.users} {typeof plan.users === 'string' ? '' : 'Benutzer'}
          </div>
        </div>
        <ul className="space-y-2">
          {plan.features.map((feature: string, index: number) => (
            <li key={index} className="flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-700 rounded-2xl flex items-center justify-center">
              <Building className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Willkommen bei Helix
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Lassen Sie uns Ihren Regulatory Intelligence Workspace einrichten
          </p>
          
          <div className="mb-8">
            <Progress value={(currentStep / ONBOARDING_STEPS.length) * 100} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Schritt {currentStep} von {ONBOARDING_STEPS.length}
            </p>
          </div>
        </div>

        <StepIndicator />

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep === 1 && <Building className="h-5 w-5" />}
              {currentStep === 2 && <User className="h-5 w-5" />}
              {currentStep === 3 && <Crown className="h-5 w-5" />}
              {currentStep === 4 && <Settings className="h-5 w-5" />}
              {currentStep === 5 && <Rocket className="h-5 w-5" />}
              {ONBOARDING_STEPS[currentStep - 1]?.title}
            </CardTitle>
            <CardDescription>
              {ONBOARDING_STEPS[currentStep - 1]?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Company Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Firmenname *</Label>
                    <Input 
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => updateFormData('companyName', e.target.value)}
                      placeholder="Ihre Firma GmbH"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Branche *</Label>
                    <Select 
                      value={formData.industry} 
                      onValueChange={(value) => updateFormData('industry', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Branche auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Medizintechnik">Medizintechnik</SelectItem>
                        <SelectItem value="Pharma">Pharma</SelectItem>
                        <SelectItem value="Biotechnologie">Biotechnologie</SelectItem>
                        <SelectItem value="Regulatory Consulting">Regulatory Consulting</SelectItem>
                        <SelectItem value="Other">Sonstiges</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companySize">Unternehmensgröße</Label>
                    <Select 
                      value={formData.companySize} 
                      onValueChange={(value) => updateFormData('companySize', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Größe auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 Mitarbeiter</SelectItem>
                        <SelectItem value="11-50">11-50 Mitarbeiter</SelectItem>
                        <SelectItem value="51-200">51-200 Mitarbeiter</SelectItem>
                        <SelectItem value="201-1000">201-1000 Mitarbeiter</SelectItem>
                        <SelectItem value="1000+">1000+ Mitarbeiter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input 
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => updateFormData('website', e.target.value)}
                      placeholder="https://ihre-website.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Kurze Beschreibung Ihres Unternehmens</Label>
                  <Textarea 
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    placeholder="Beschreiben Sie kurz, was Ihr Unternehmen macht..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Contact Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Vollständiger Name *</Label>
                    <Input 
                      id="contactName"
                      value={formData.contactName}
                      onChange={(e) => updateFormData('contactName', e.target.value)}
                      placeholder="Max Mustermann"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactRole">Position</Label>
                    <Input 
                      id="contactRole"
                      value={formData.contactRole}
                      onChange={(e) => updateFormData('contactRole', e.target.value)}
                      placeholder="Chief Regulatory Officer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">E-Mail Adresse *</Label>
                    <Input 
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => updateFormData('contactEmail', e.target.value)}
                      placeholder="max@unternehmen.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Telefonnummer</Label>
                    <Input 
                      id="contactPhone"
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => updateFormData('contactPhone', e.target.value)}
                      placeholder="+49 89 123456789"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    E-Mail Bestätigung
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    An Ihre E-Mail-Adresse wird eine Bestätigungsmail gesendet. 
                    Überprüfen Sie auch Ihren Spam-Ordner.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Subscription Plan */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Wählen Sie Ihren Plan</h3>
                  <p className="text-muted-foreground">
                    Sie können Ihren Plan jederzeit ändern oder upgraden
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
                    <PlanCard
                      key={key}
                      planKey={key}
                      plan={plan}
                      isSelected={formData.selectedPlan === key}
                      onSelect={(key) => updateFormData('selectedPlan', key)}
                    />
                  ))}
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-800">14 Tage kostenlos testen</h4>
                  </div>
                  <p className="text-sm text-green-700">
                    Starten Sie mit einer kostenlosen Testphase. Keine Kreditkarte erforderlich.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Preferences */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Regionale Abdeckung</h3>
                  <div className="grid gap-3 md:grid-cols-3">
                    {[
                      { key: 'US', label: 'USA (FDA)', desc: 'FDA Regulierungen und 510(k) Updates' },
                      { key: 'EU', label: 'Europa (EMA)', desc: 'EU MDR/IVDR und EMA Guidelines' },
                      { key: 'Asia', label: 'Asien-Pazifik', desc: 'PMDA Japan, NMPA China, TGA Australia' }
                    ].map(region => (
                      <div key={region.key} className="border rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Checkbox 
                            id={region.key}
                            checked={formData.regions.includes(region.key)}
                            onCheckedChange={(checked) => {
                              const newRegions = checked 
                                ? [...formData.regions, region.key]
                                : formData.regions.filter(r => r !== region.key);
                              updateFormData('regions', newRegions);
                            }}
                          />
                          <div>
                            <label htmlFor={region.key} className="font-medium cursor-pointer">
                              {region.label}
                            </label>
                            <p className="text-sm text-muted-foreground mt-1">{region.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">Benachrichtigungseinstellungen</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'email', label: 'E-Mail Benachrichtigungen', icon: Mail, desc: 'Updates und kritische Warnungen per E-Mail' },
                      { key: 'sms', label: 'SMS Benachrichtigungen', icon: Phone, desc: 'Nur für kritische Compliance-Warnungen' },
                      { key: 'slack', label: 'Slack Integration', icon: Activity, desc: 'Updates direkt in Ihren Slack-Channel' }
                    ].map(notif => (
                      <div key={notif.key} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Checkbox 
                          id={notif.key}
                          checked={formData.notifications[notif.key]}
                          onCheckedChange={(checked) => {
                            updateFormData('notifications', {
                              ...formData.notifications,
                              [notif.key]: checked
                            });
                          }}
                        />
                        <notif.icon className="w-5 h-5 text-blue-600" />
                        <div className="flex-1">
                          <label htmlFor={notif.key} className="font-medium cursor-pointer">
                            {notif.label}
                          </label>
                          <p className="text-sm text-muted-foreground">{notif.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Completion */}
            {currentStep === 5 && (
              <div className="text-center space-y-6">
                {createTenantMutation.isPending ? (
                  <div>
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Tenant wird erstellt...</h3>
                    <p className="text-muted-foreground">
                      Bitte warten Sie, während wir Ihren Workspace einrichten.
                    </p>
                  </div>
                ) : createTenantMutation.isSuccess ? (
                  <div>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Willkommen bei Helix!</h3>
                    <p className="text-muted-foreground mb-6">
                      Ihr Tenant wurde erfolgreich erstellt. Sie können jetzt mit der Nutzung beginnen.
                    </p>
                    
                    <div className="bg-blue-50 p-6 rounded-lg text-left max-w-md mx-auto">
                      <h4 className="font-semibold mb-3">Nächste Schritte:</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          E-Mail-Bestätigung abwarten
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Team-Mitglieder einladen
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Dashboard erkunden
                        </li>
                      </ul>
                    </div>

                    <Button 
                      size="lg" 
                      className="mt-6"
                      onClick={() => window.location.href = '/customer-dashboard'}
                    >
                      <Rocket className="w-4 h-4 mr-2" />
                      Zum Dashboard
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Rocket className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Bereit zum Start!</h3>
                    <p className="text-muted-foreground mb-6">
                      Überprüfen Sie Ihre Eingaben und erstellen Sie Ihren Helix Tenant.
                    </p>

                    <div className="bg-gray-50 p-6 rounded-lg text-left max-w-md mx-auto mb-6">
                      <h4 className="font-semibold mb-3">Zusammenfassung:</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Unternehmen:</span>
                          <span className="font-medium">{formData.companyName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Plan:</span>
                          <span className="font-medium">{SUBSCRIPTION_PLANS[formData.selectedPlan as keyof typeof SUBSCRIPTION_PLANS]?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Regionen:</span>
                          <span className="font-medium">{formData.regions.length || 'Keine'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>E-Mail:</span>
                          <span className="font-medium">{formData.contactEmail}</span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      size="lg" 
                      onClick={handleSubmit}
                      disabled={createTenantMutation.isPending}
                    >
                      <Building className="w-4 h-4 mr-2" />
                      Tenant erstellen
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        {currentStep < 5 && !createTenantMutation.isPending && (
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={prevStep} 
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
            
            <Button 
              onClick={currentStep === 4 ? () => setCurrentStep(5) : nextStep}
              disabled={
                (currentStep === 1 && (!formData.companyName || !formData.industry)) ||
                (currentStep === 2 && (!formData.contactName || !formData.contactEmail))
              }
            >
              {currentStep === 4 ? 'Abschließen' : 'Weiter'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}