import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { NavigationHeader } from "@/components/ui/navigation-header";
import { Building, Shield, User, Lock, Eye, EyeOff } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";

interface TenantAuthProps {
  tenantSubdomain?: string;
  tenantName?: string;
  colorScheme?: 'blue' | 'purple' | 'green';
}

export default function TenantAuth({ 
  tenantSubdomain = 'demo', 
  tenantName = 'Demo Tenant',
  colorScheme = 'blue' 
}: TenantAuthProps) {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  // Color scheme configuration
  const getColorScheme = () => {
    switch (colorScheme) {
      case 'purple':
        return {
          primary: 'from-purple-500 to-indigo-600',
          badge: 'text-purple-600',
          glow: 'from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900',
          button: 'bg-purple-600 hover:bg-purple-700'
        };
      case 'green':
        return {
          primary: 'from-green-500 to-emerald-600',
          badge: 'text-green-600',
          glow: 'from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900',
          button: 'bg-green-600 hover:bg-green-700'
        };
      default:
        return {
          primary: 'from-blue-500 to-cyan-600',
          badge: 'text-blue-600',
          glow: 'from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const colors = getColorScheme();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate tenant login
      const response = await fetch('/api/tenant/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Subdomain': tenantSubdomain
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const userData = await response.json();
      
      // Store user session
      localStorage.setItem('tenant_user', JSON.stringify(userData));
      
      // Small delay to ensure localStorage is set before navigation
      setTimeout(() => {
        setLocation('/tenant/dashboard');
      }, 150);
      
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || t('auth.loginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = () => {
    // Demo login with predefined credentials
    setEmail('admin@demo-medical.local');
    setPassword('demo123');
  };

  return (
    <div className="custom-cursor min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-6 relative">
      <CustomCursor />
      
      {/* Language Selector - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector />
      </div>
      
      <div className="w-full max-w-md space-y-8">
        {/* Tenant Header */}
        <div className="text-center">
          <div className={`emotional-float mx-auto w-16 h-16 bg-gradient-to-r ${colors.primary} rounded-2xl shadow-xl flex items-center justify-center mb-6`}>
            <Building className="h-8 w-8 text-white" />
          </div>
          
          <h1 className="headline-section text-3xl mb-2">
            {tenantName}
          </h1>
          
          <p className="text-muted-foreground text-lg">
            Secure Tenant Login
          </p>
          
          <div className="flex justify-center gap-3 mt-4">
            <Badge variant="outline" className="emotional-pulse px-3 py-1">
              <Shield className="h-3 w-3 mr-1" />
              Isolated Access
            </Badge>
            <Badge variant="outline" className={`px-3 py-1 ${colors.badge}`}>
              <Building className="h-3 w-3 mr-1" />
              {tenantSubdomain}
            </Badge>
          </div>
        </div>

        {/* Login Form */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Anmelden</CardTitle>
            <CardDescription className="text-center">
              Zugang zu Ihrem personalisierten Helix-Bereich
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="ihre.email@unternehmen.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    data-testid="input-email"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ihr Passwort"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    data-testid="input-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className={`w-full ${colors.button} cursor-hover`}
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Anmelden...
                  </>
                ) : (
                  'Anmelden'
                )}
              </Button>
            </form>

            {/* Demo Access */}
            <div className="mt-6 pt-6 border-t">
              <Button
                variant="outline"
                className="w-full cursor-hover"
                onClick={handleDemo}
                data-testid="button-demo"
              >
                Demo-Zugang verwenden
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Für Testzwecke und Demonstrationen
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            <Shield className="inline h-3 w-3 mr-1" />
            Ihre Daten sind sicher isoliert und verschlüsselt
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Administratoren haben keinen Zugriff auf Tenant-Bereiche
          </p>
        </div>

        {/* Dezente Admin-Verlinkung */}
        <div className="text-center mt-6">
          <button
            onClick={() => setLocation('/')}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors duration-200 underline-offset-4 hover:underline"
            data-testid="link-admin-access"
          >
            Admin-Zugang
          </button>
        </div>
      </div>
    </div>
  );
}