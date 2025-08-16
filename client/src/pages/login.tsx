import React, { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, User, AlertCircle } from "lucide-react";
// Logo wird inline als gradient ersetzt für bessere Kompatibilität

interface LoginProps {
  onLogin?: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Feste Credentials: admin / admin123
    if (username === "admin" && password === "admin123") {
      // Login erfolgreich - Session speichern
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", "admin");
      localStorage.setItem("loginTime", new Date().toISOString());
      
      setTimeout(() => {
        onLogin?.();
        setLocation("/");
      }, 500);
    } else {
      setError("Ungültige Zugangsdaten. Bitte versuchen Sie es erneut.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-20 w-20 bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-700 rounded-xl ring-4 ring-blue-100 flex items-center justify-center text-white font-bold text-2xl">
                H
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
                  HELIX
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Regulatory Intelligence Platform
                </CardDescription>
                <p className="text-xs text-gray-500 mt-1">Powered by DELTA WAYS</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                    Benutzername
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Benutzername eingeben"
                      className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                      data-testid="input-username"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Passwort
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Passwort eingeben"
                      className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                      data-testid="input-password"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="py-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Anmeldung läuft...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Anmelden</span>
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="text-center space-y-2">
                <p className="text-xs text-gray-500">Demo-Zugangsdaten:</p>
                <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1">
                  <div><strong>Benutzername:</strong> admin</div>
                  <div><strong>Passwort:</strong> admin123</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            © 2025 Delta Ways. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </div>
  );
}