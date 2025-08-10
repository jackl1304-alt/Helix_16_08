import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { 
  Building,
  Users,
  CreditCard,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Star,
  Globe,
  Shield,
  Zap,
  BarChart3,
  Clock,
  Mail,
  Phone
} from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface TenantData {
  // Company Information
  companyName: string;
  industry: string;
  companySize: string;
  website: string;
  
  // Contact Information
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  
  // Subscription
  subscriptionPlan: 'starter' | 'professional' | 'enterprise';
  billingCycle: 'monthly' | 'yearly';
  
  // Preferences
  regions: string[];
  dataCategories: string[];
  notificationPreferences: string[];
  
  // Setup
  customDomain: string;
  initialUsers: Array<{
    email: string;
    role: 'admin' | 'user' | 'viewer';
  }>;
}

const SUBSCRIPTION_PLANS = {
  starter: { 
    name: 'Starter', 
    price: { monthly: 299, yearly: 2990 }, 
    features: ['500 Updates/Monat', 'Basic Dashboard', 'Email Support', 'Standard Regions'],
    users: 5
  },
  professional: { 
    name: 'Professional', 
    price: { monthly: 899, yearly: 8990 }, 
    features: ['2.500 Updates/Monat', 'AI-Insights', 'Priority Support', 'Custom Dashboards', 'Alle Regionen', 'API-Zugang'],
    users: 25,
    popular: true
  },
  enterprise: { 
    name: 'Enterprise', 
    price: { monthly: 2499, yearly: 24990 }, 
    features: ['Unlimited Updates', 'Full AI-Analytics', 'White-label', 'API-Access', 'Dedicated Manager', 'Custom Integrations'],
    users: 'Unlimited'
  }
};

const INDUSTRIES = [
  'Medizintechnik', 'Pharma', 'Biotechnologie', 'Diagnostik',
  'Digital Health', 'Regulatory Consulting', 'Healthcare IT', 'Sonstiges'
];

const REGIONS = [
  { id: 'us', name: 'USA (FDA)', description: 'FDA-Zulassungen und Updates' },
  { id: 'eu', name: 'Europa (EMA)', description: 'EMA und MDR/IVDR Updates' },
  { id: 'asia', name: 'Asien-Pazifik', description: 'PMDA, NMPA, TGA Updates' },
  { id: 'global', name: 'Global', description: 'Weltweite regulatorische Updates' }
];

const DATA_CATEGORIES = [
  { id: 'approvals', name: 'Zulassungen', description: '510(k), PMA, CE-Kennzeichnung' },
  { id: 'guidance', name: 'Leitlinien', description: 'Regulatorische Guidance Documents' },
  { id: 'recalls', name: 'Rückrufe', description: 'Sicherheitshinweise und Recalls' },
  { id: 'legal', name: 'Rechtsprechung', description: 'Gerichtsentscheidungen und Präzedenzfälle' }
];

export default function TenantOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [tenantData, setTenantData] = useState<TenantData>({
    companyName: '',
    industry: '',
    companySize: '',
    website: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    subscriptionPlan: 'professional',
    billingCycle: 'monthly',
    regions: [],
    dataCategories: [],
    notificationPreferences: ['email'],
    customDomain: '',
    initialUsers: []
  });

  const totalSteps = 5;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const steps: OnboardingStep[] = [
    {
      id: 'company',
      title: 'Unternehmensinformationen',
      description: 'Grundlegende Informationen über Ihr Unternehmen',
      completed: currentStep > 1
    },
    {
      id: 'contact',
      title: 'Kontaktdaten',
      description: 'Ihre Kontaktinformationen für den Account',
      completed: currentStep > 2
    },
    {
      id: 'subscription',
      title: 'Plan auswählen',
      description: 'Wählen Sie den passenden Subscription-Plan',
      completed: currentStep > 3
    },
    {
      id: 'preferences',
      title: 'Präferenzen',
      description: 'Konfigurieren Sie Ihre Datenquellen und Benachrichtigungen',
      completed: currentStep > 4
    },
    {
      id: 'setup',
      title: 'Finale Einrichtung',
      description: 'Benutzer hinzufügen und Domain konfigurieren',
      completed: currentStep > 5
    }
  ];

  const createTenantMutation = useMutation({
    mutationFn: async (data: TenantData) => {
      // In production: await apiRequest('/api/admin/tenants', 'POST', data)
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { id: 'tenant_' + Math.random().toString(36).substr(2, 9), ...data };
    },
    onSuccess: (tenant) => {
      toast({
        title: "Tenant erfolgreich erstellt!",
        description: `Willkommen bei Helix, ${tenant.companyName}!`,
      });
      // Redirect to customer dashboard
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Tenant konnte nicht erstellt werden.",
        variant: "destructive",
      });
    }
  });

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      createTenantMutation.mutate(tenantData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateTenantData = (field: keyof TenantData, value: any) => {
    setTenantData(prev => ({ ...prev, [field]: value }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return tenantData.companyName && tenantData.industry && tenantData.companySize;
      case 2:
        return tenantData.contactName && tenantData.contactEmail;
      case 3:
        return tenantData.subscriptionPlan;
      case 4:
        return tenantData.regions.length > 0 && tenantData.dataCategories.length > 0;
      case 5:
        return true; // Optional fields
      default:
        return false;
    }
  };

  const PlanCard = ({ planKey, plan, selected, onSelect }) => (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${
        selected ? 'ring-2 ring-blue-500 border-blue-200' : 'hover:shadow-md'
      } ${plan.popular ? 'border-purple-200 bg-purple-50/30' : ''}`}
      onClick={() => onSelect(planKey)}
    >
      {plan.popular && (
        <div className="bg-purple-500 text-white text-xs font-medium px-3 py-1 rounded-t-lg text-center">
          ⭐ Beliebteste Wahl
        </div>
      )}
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            €{plan.price[tenantData.billingCycle].toLocaleString()}
            <span className="text-sm text-muted-foreground">
              /{tenantData.billingCycle === 'monthly' ? 'Monat' : 'Jahr'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Bis zu {typeof plan.users === 'number' ? plan.users : plan.users} Benutzer
          </p>
        </div>
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
        {selected && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center">
            <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-800">Ausgewählt</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Willkommen bei Helix
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Richten Sie Ihr Regulatory Intelligence Dashboard ein
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-600">
              Schritt {currentStep} von {totalSteps}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(progressPercentage)}% abgeschlossen
            </span>
          </div>
          <Progress value={progressPercentage} className="mb-4" />
          
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step.completed ? 'bg-green-500 text-white' :
                  currentStep === index + 1 ? 'bg-blue-500 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {step.completed ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    step.completed ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Firmenname *</Label>
                    <Input
                      id="company-name"
                      value={tenantData.companyName}
                      onChange={(e) => updateTenantData('companyName', e.target.value)}
                      placeholder="MedTech Solutions GmbH"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={tenantData.website}
                      onChange={(e) => updateTenantData('website', e.target.value)}
                      placeholder="https://www.medtech-solutions.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Branche *</Label>
                    <Select value={tenantData.industry} onValueChange={(value) => updateTenantData('industry', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Branche auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map(industry => (
                          <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Unternehmensgröße *</Label>
                    <Select value={tenantData.companySize} onValueChange={(value) => updateTenantData('companySize', value)}>
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
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Vollständiger Name *</Label>
                    <Input
                      id="contact-name"
                      value={tenantData.contactName}
                      onChange={(e) => updateTenantData('contactName', e.target.value)}
                      placeholder="Max Mustermann"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contact-phone">Telefonnummer</Label>
                    <Input
                      id="contact-phone"
                      value={tenantData.contactPhone}
                      onChange={(e) => updateTenantData('contactPhone', e.target.value)}
                      placeholder="+49 123 456789"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-email">E-Mail-Adresse *</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={tenantData.contactEmail}
                    onChange={(e) => updateTenantData('contactEmail', e.target.value)}
                    placeholder="max.mustermann@medtech-solutions.com"
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex justify-center gap-4 mb-6">
                  <Button
                    variant={tenantData.billingCycle === 'monthly' ? 'default' : 'outline'}
                    onClick={() => updateTenantData('billingCycle', 'monthly')}
                  >
                    Monatlich
                  </Button>
                  <Button
                    variant={tenantData.billingCycle === 'yearly' ? 'default' : 'outline'}
                    onClick={() => updateTenantData('billingCycle', 'yearly')}
                  >
                    Jährlich <Badge variant="secondary" className="ml-2">-17%</Badge>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
                    <PlanCard
                      key={key}
                      planKey={key}
                      plan={plan}
                      selected={tenantData.subscriptionPlan === key}
                      onSelect={(planKey) => updateTenantData('subscriptionPlan', planKey)}
                    />
                  ))}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Relevante Regionen *</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Wählen Sie die Regionen aus, für die Sie regulatorische Updates erhalten möchten.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {REGIONS.map(region => (
                      <div key={region.id} className="flex items-start space-x-3">
                        <Checkbox
                          id={region.id}
                          checked={tenantData.regions.includes(region.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateTenantData('regions', [...tenantData.regions, region.id]);
                            } else {
                              updateTenantData('regions', tenantData.regions.filter(r => r !== region.id));
                            }
                          }}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor={region.id} className="font-medium">
                            {region.name}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {region.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-medium">Datenkategorien *</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Wählen Sie die Arten von regulatorischen Informationen aus, die Sie interessieren.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {DATA_CATEGORIES.map(category => (
                      <div key={category.id} className="flex items-start space-x-3">
                        <Checkbox
                          id={category.id}
                          checked={tenantData.dataCategories.includes(category.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateTenantData('dataCategories', [...tenantData.dataCategories, category.id]);
                            } else {
                              updateTenantData('dataCategories', tenantData.dataCategories.filter(c => c !== category.id));
                            }
                          }}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor={category.id} className="font-medium">
                            {category.name}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {category.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="custom-domain">Custom Domain (optional)</Label>
                  <div className="flex">
                    <Input
                      id="custom-domain"
                      value={tenantData.customDomain}
                      onChange={(e) => updateTenantData('customDomain', e.target.value)}
                      placeholder="your-company"
                    />
                    <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-l-0 border-gray-300 rounded-r-md">
                      .helix.ai
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Falls leer gelassen, wird automatisch eine Domain basierend auf Ihrem Firmennamen erstellt.
                  </p>
                </div>

                <Separator />

                <div className="text-center py-8">
                  <Building className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                  <h3 className="text-lg font-semibold mb-2">Fast geschafft!</h3>
                  <p className="text-muted-foreground mb-4">
                    Klicken Sie auf "Konto erstellen", um Ihr Helix Dashboard zu aktivieren.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg inline-block">
                    <p className="text-sm text-blue-800">
                      Sie erhalten eine E-Mail mit den Zugangsdaten und weiteren Einrichtungsschritten.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!isStepValid() || createTenantMutation.isPending}
          >
            {createTenantMutation.isPending ? (
              <>Wird erstellt...</>
            ) : currentStep === totalSteps ? (
              <>
                <Building className="mr-2 h-4 w-4" />
                Konto erstellen
              </>
            ) : (
              <>
                Weiter
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}