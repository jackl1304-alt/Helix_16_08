import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, Lock, User, Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/layout/logo";

interface CustomerLoginProps {
  onLogin: (customerData: any) => void;
}

export default function CustomerLogin({ onLogin }: CustomerLoginProps) {
  const [, setLocation] = useLocation();
  const [credentials, setCredentials] = useState({
    companyId: "",
    username: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Demo Customer Accounts
  const demoAccounts = [
    {
      companyId: "demo-medical",
      username: "admin",
      password: "demo123",
      companyName: "Demo Medical Devices GmbH",
      permissions: ["regulatory-updates", "data-collection", "rechtsprechung", "reports"],
      theme: "blue",
      subscription: "Professional"
    },
    {
      companyId: "acme-health",
      username: "manager", 
      password: "acme456",
      companyName: "ACME Healthcare Solutions",
      permissions: ["regulatory-updates", "reports"],
      theme: "purple", 
      subscription: "Basic"
    },
    {
      companyId: "medtech-pro",
      username: "director",
      password: "medtech789",
      companyName: "MedTech Pro International",
      permissions: ["regulatory-updates", "data-collection", "rechtsprechung", "zulassungen-global", "reports", "ai-insights"],
      theme: "green",
      subscription: "Enterprise"
    }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const customer = demoAccounts.find(
      acc => acc.companyId === credentials.companyId && 
             acc.username === credentials.username && 
             acc.password === credentials.password
    );

    if (customer) {
      // Store customer session
      localStorage.setItem("customerAuthenticated", "true");
      localStorage.setItem("customerData", JSON.stringify(customer));
      localStorage.setItem("customerLoginTime", new Date().toISOString());
      
      onLogin(customer);
      setLocation("/customer-area");
    } else {
      setError("Ungültige Anmeldedaten. Bitte überprüfen Sie Company ID, Benutzername und Passwort.");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <Logo size="lg" showText={true} />
          </div>
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2 text-gray-800">
            <Building2 className="h-6 w-6 text-blue-600" />
            Customer Portal
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Melden Sie sich in Ihren Customer Bereich an
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyId" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Company ID
              </Label>
              <Input
                id="companyId"
                type="text"
                value={credentials.companyId}
                onChange={(e) => setCredentials({...credentials, companyId: e.target.value})}
                placeholder="demo-medical"
                required
                className="w-full"
                data-testid="input-company-id"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Benutzername
              </Label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                placeholder="admin"
                required
                className="w-full"
                data-testid="input-username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Passwort
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  placeholder="••••••••"
                  required
                  className="w-full pr-10"
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Anmelden...
                </div>
              ) : (
                "Anmelden"
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Demo Accounts:</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div><strong>demo-medical</strong> / admin / demo123</div>
              <div><strong>acme-health</strong> / manager / acme456</div>
              <div><strong>medtech-pro</strong> / director / medtech789</div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => setLocation("/")}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
              data-testid="link-back-admin"
            >
              ← Zurück zum Admin Portal
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}