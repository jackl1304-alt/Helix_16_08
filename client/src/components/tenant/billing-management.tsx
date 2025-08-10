import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { 
  CreditCard,
  Receipt,
  Download,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Crown,
  Building,
  Zap,
  ArrowUp,
  ArrowDown,
  Clock
} from "lucide-react";

interface BillingProps {
  tenantId: string;
}

const SUBSCRIPTION_PLANS = {
  starter: { 
    name: 'Starter', 
    price: { monthly: 299, yearly: 2990 }, 
    features: ['500 Updates/Monat', 'Basic Dashboard', 'Email Support', 'Standard Regions'],
    users: 5,
    color: 'blue'
  },
  professional: { 
    name: 'Professional', 
    price: { monthly: 899, yearly: 8990 }, 
    features: ['2.500 Updates/Monat', 'AI-Insights', 'Priority Support', 'Custom Dashboards', 'Alle Regionen', 'API-Zugang'],
    users: 25,
    popular: true,
    color: 'purple'
  },
  enterprise: { 
    name: 'Enterprise', 
    price: { monthly: 2499, yearly: 24990 }, 
    features: ['Unlimited Updates', 'Full AI-Analytics', 'White-label', 'API-Access', 'Dedicated Manager', 'Custom Integrations'],
    users: 'Unlimited',
    color: 'orange'
  }
};

export default function BillingManagement({ tenantId }: BillingProps) {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Fetch billing information
  const { data: billing, isLoading } = useQuery({
    queryKey: ['/api/customer/subscription', tenantId],
    queryFn: async () => {
      return {
        currentPlan: 'professional',
        status: 'active',
        nextBilling: new Date('2025-09-10'),
        billingCycle: 'monthly',
        usage: {
          currentMonth: 1247,
          limit: 2500,
          percentage: 50,
          users: 12,
          userLimit: 25
        },
        invoices: [
          { id: 'inv_001', date: '2025-08-10', amount: 899, status: 'paid', plan: 'Professional' },
          { id: 'inv_002', date: '2025-07-10', amount: 899, status: 'paid', plan: 'Professional' },
          { id: 'inv_003', date: '2025-06-10', amount: 899, status: 'paid', plan: 'Professional' }
        ],
        paymentMethod: {
          type: 'card',
          last4: '1234',
          brand: 'Visa',
          expiresAt: '12/27'
        }
      };
    }
  });

  // Plan change mutation
  const changePlanMutation = useMutation({
    mutationFn: async ({ plan, cycle }: { plan: string; cycle: string }) => {
      // In production: await apiRequest(`/api/customer/subscription/${tenantId}`, 'PUT', { plan, cycle })
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { plan, cycle };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customer/subscription'] });
      setShowUpgradeDialog(false);
      toast({
        title: "Plan erfolgreich geändert",
        description: "Ihr neuer Plan ist sofort aktiv.",
      });
    }
  });

  const currentPlanInfo = SUBSCRIPTION_PLANS[billing?.currentPlan as keyof typeof SUBSCRIPTION_PLANS];

  const PlanCard = ({ planKey, plan, isCurrent, onSelect }: {
    planKey: string;
    plan: any;
    isCurrent: boolean;
    onSelect: (key: string) => void;
  }) => (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${
        selectedPlan === planKey ? 'ring-2 ring-blue-500 border-blue-200' : 'hover:shadow-md'
      } ${isCurrent ? 'border-green-200 bg-green-50/30' : ''} ${plan.popular ? 'border-purple-200 bg-purple-50/30' : ''}`}
      onClick={() => onSelect(planKey)}
    >
      {plan.popular && !isCurrent && (
        <div className="bg-purple-500 text-white text-xs font-medium px-3 py-1 rounded-t-lg text-center">
          ⭐ Beliebteste Wahl
        </div>
      )}
      {isCurrent && (
        <div className="bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-t-lg text-center">
          ✓ Aktueller Plan
        </div>
      )}
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            €{plan.price[billingCycle].toLocaleString()}
            <span className="text-sm text-muted-foreground">
              /{billingCycle === 'monthly' ? 'Monat' : 'Jahr'}
            </span>
          </div>
          {billingCycle === 'yearly' && (
            <Badge variant="secondary" className="mb-2">17% Ersparnis</Badge>
          )}
        </div>
        <ul className="space-y-2 mb-4">
          {plan.features.map((feature: string, index: number) => (
            <li key={index} className="flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
        {!isCurrent && (
          <Button 
            className="w-full" 
            variant={selectedPlan === planKey ? "default" : "outline"}
            disabled={changePlanMutation.isPending}
          >
            {planKey === 'starter' ? 'Downgrade' : 'Upgrade'}
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      <div className="h-32 bg-gray-200 rounded"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Aktuelles Abonnement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-lg bg-${currentPlanInfo?.color}-100 flex items-center justify-center`}>
                  {billing?.currentPlan === 'starter' && <Building className="h-6 w-6 text-blue-600" />}
                  {billing?.currentPlan === 'professional' && <Crown className="h-6 w-6 text-purple-600" />}
                  {billing?.currentPlan === 'enterprise' && <Zap className="h-6 w-6 text-orange-600" />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{currentPlanInfo?.name} Plan</h3>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {billing?.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      €{currentPlanInfo?.price[billing?.billingCycle as keyof typeof currentPlanInfo.price]}/{billing?.billingCycle === 'monthly' ? 'Monat' : 'Jahr'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Monatliche Updates</span>
                    <span>{billing?.usage.currentMonth} / {billing?.usage.limit}</span>
                  </div>
                  <Progress value={billing?.usage.percentage} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Team-Mitglieder</span>
                    <span>{billing?.usage.users} / {billing?.usage.userLimit}</span>
                  </div>
                  <Progress value={(billing?.usage.users / billing?.usage.userLimit) * 100} className="h-2" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-4">Nächste Abrechnung</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Fälligkeitsdatum</span>
                  </div>
                  <span className="text-sm">{billing?.nextBilling?.toLocaleDateString('de-DE')}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Zahlungsart</span>
                  </div>
                  <span className="text-sm">{billing?.paymentMethod.brand} •••• {billing?.paymentMethod.last4}</span>
                </div>

                <div className="text-center pt-2">
                  <div className="text-2xl font-bold text-green-600">
                    €{currentPlanInfo?.price[billing?.billingCycle as keyof typeof currentPlanInfo.price]}
                  </div>
                  <p className="text-sm text-muted-foreground">Nächster Rechnungsbetrag</p>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex gap-3">
            <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
              <DialogTrigger asChild>
                <Button>
                  <ArrowUp className="w-4 h-4 mr-2" />
                  Plan ändern
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Subscription Plan ändern</DialogTitle>
                  <DialogDescription>
                    Wählen Sie den Plan, der am besten zu Ihren Anforderungen passt.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  <div className="flex justify-center gap-4">
                    <Button
                      variant={billingCycle === 'monthly' ? 'default' : 'outline'}
                      onClick={() => setBillingCycle('monthly')}
                    >
                      Monatlich
                    </Button>
                    <Button
                      variant={billingCycle === 'yearly' ? 'default' : 'outline'}
                      onClick={() => setBillingCycle('yearly')}
                    >
                      Jährlich <Badge variant="secondary" className="ml-2">-17%</Badge>
                    </Button>
                  </div>

                  <div className="grid gap-6 md:grid-cols-3">
                    {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
                      <PlanCard
                        key={key}
                        planKey={key}
                        plan={plan}
                        isCurrent={billing?.currentPlan === key}
                        onSelect={setSelectedPlan}
                      />
                    ))}
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
                      Abbrechen
                    </Button>
                    <Button 
                      onClick={() => changePlanMutation.mutate({ plan: selectedPlan, cycle: billingCycle })}
                      disabled={changePlanMutation.isPending || selectedPlan === billing?.currentPlan}
                    >
                      {changePlanMutation.isPending ? 'Wird geändert...' : 'Plan ändern'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline">
              <CreditCard className="w-4 h-4 mr-2" />
              Zahlungsart ändern
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Rechnungshistorie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {billing?.invoices?.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                    <Receipt className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{invoice.plan} Plan</p>
                    <p className="text-sm text-muted-foreground">{invoice.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-medium">€{invoice.amount}</p>
                    <Badge className={invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {invoice.status === 'paid' ? 'Bezahlt' : 'Offen'}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}