import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCustomerTheme, type CustomerTheme } from "@/contexts/customer-theme-context";
import { 
  Palette,
  Check,
  Upload,
  Save,
  Eye,
  Building
} from "lucide-react";

const themeOptions: Array<{
  id: CustomerTheme;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}> = [
  {
    id: 'blue',
    name: 'Ocean Blue',
    description: 'Vertrauen und Professionalität',
    colors: {
      primary: 'bg-blue-500',
      secondary: 'bg-blue-100',
      accent: 'bg-blue-600'
    }
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    description: 'Innovation und Kreativität',
    colors: {
      primary: 'bg-purple-500',
      secondary: 'bg-purple-100',
      accent: 'bg-purple-600'
    }
  },
  {
    id: 'green',
    name: 'Nature Green',
    description: 'Wachstum und Stabilität',
    colors: {
      primary: 'bg-green-500',
      secondary: 'bg-green-100',
      accent: 'bg-green-600'
    }
  }
];

interface ThemeCustomizerProps {
  className?: string;
}

export default function ThemeCustomizer({ className }: ThemeCustomizerProps) {
  const { themeSettings, setTheme, setCompanyLogo, setCompanyName, getThemeColors } = useCustomerTheme();
  const [tempCompanyName, setTempCompanyName] = useState(themeSettings.companyName);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const colors = getThemeColors();

  const handleThemeChange = (newTheme: CustomerTheme) => {
    setTheme(newTheme);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      // In production, upload to server and get URL
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setCompanyLogo(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    setCompanyName(tempCompanyName);
    // In production: Save changes to server
    console.log('Theme settings saved:', {
      theme: themeSettings.theme,
      companyName: tempCompanyName,
      logo: themeSettings.companyLogo
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Color Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Farbthema auswählen
          </CardTitle>
          <CardDescription>
            Wählen Sie ein Farbthema, das zu Ihrem Unternehmen passt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themeOptions.map((option) => (
              <div
                key={option.id}
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  themeSettings.theme === option.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleThemeChange(option.id)}
              >
                {themeSettings.theme === option.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
                
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {option.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {option.description}
                  </p>
                  
                  {/* Color Preview */}
                  <div className="flex gap-2">
                    <div className={`w-8 h-8 rounded-full ${option.colors.primary}`}></div>
                    <div className={`w-8 h-8 rounded-full ${option.colors.secondary}`}></div>
                    <div className={`w-8 h-8 rounded-full ${option.colors.accent}`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Company Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Unternehmens-Branding
          </CardTitle>
          <CardDescription>
            Personalisieren Sie das Erscheinungsbild Ihres Customer Portals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Unternehmensname</Label>
            <Input
              id="company-name"
              value={tempCompanyName}
              onChange={(e) => setTempCompanyName(e.target.value)}
              placeholder="Ihr Unternehmensname"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo-upload">Firmenlogo hochladen</Label>
            <div className="flex items-center gap-4">
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="flex-1"
              />
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Hochladen
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Empfohlen: PNG oder SVG, max. 2MB
            </p>
          </div>

          {themeSettings.companyLogo && (
            <div className="space-y-2">
              <Label>Vorschau des aktuellen Logos</Label>
              <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <img
                  src={themeSettings.companyLogo}
                  alt="Company Logo"
                  className="h-12 w-auto object-contain"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Vorschau
          </CardTitle>
          <CardDescription>
            So wird Ihr personalisiertes Portal aussehen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`p-6 rounded-lg bg-gradient-to-r ${colors.gradient}`}>
            <div className="flex items-center gap-4 mb-4">
              {themeSettings.companyLogo ? (
                <img
                  src={themeSettings.companyLogo}
                  alt="Logo Preview"
                  className="h-8 w-auto"
                />
              ) : (
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold">
                  {tempCompanyName.charAt(0) || 'H'}
                </div>
              )}
              <span className="text-white font-medium">
                {tempCompanyName || 'Helix Customer Portal'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${colors.cardBg} shadow-sm`}>
                <h4 className={`font-semibold ${colors.textPrimary}`}>Dashboard</h4>
                <p className={`text-sm ${colors.textSecondary}`}>Ihr personalisiertes Dashboard</p>
              </div>
              <div className={`p-4 rounded-lg ${colors.cardBg} shadow-sm`}>
                <h4 className={`font-semibold ${colors.textPrimary}`}>Analytics</h4>
                <p className={`text-sm ${colors.textSecondary}`}>Datenanalyse und Berichte</p>
              </div>
              <div className={`p-4 rounded-lg ${colors.cardBg} shadow-sm`}>
                <h4 className={`font-semibold ${colors.textPrimary}`}>Settings</h4>
                <p className={`text-sm ${colors.textSecondary}`}>Einstellungen verwalten</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveChanges} className="min-w-32">
          <Save className="h-4 w-4 mr-2" />
          Änderungen speichern
        </Button>
      </div>
    </div>
  );
}