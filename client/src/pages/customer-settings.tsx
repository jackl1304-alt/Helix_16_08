import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  User, 
  Palette, 
  Bell,
  Lock,
  Save,
  Eye,
  EyeOff,
  ArrowLeft,
  Home
} from "lucide-react";
import { useCustomer } from "@/contexts/CustomerContext";
import { CustomerLayout } from "@/components/customer/customer-layout";

export default function CustomerSettings() {
  const { customer, updateTheme, updateProfile } = useCustomer();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: customer?.username || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    companyName: customer?.companyName || ""
  });
  const [selectedTheme, setSelectedTheme] = useState(customer?.theme || "blue");
  
  const themes = [
    { id: "blue", name: "Blau", primary: "bg-blue-600", secondary: "bg-blue-100", preview: "border-blue-500" },
    { id: "purple", name: "Lila", primary: "bg-purple-600", secondary: "bg-purple-100", preview: "border-purple-500" },
    { id: "green", name: "Grün", primary: "bg-green-600", secondary: "bg-green-100", preview: "border-green-500" }
  ];

  const dashboardTemplates = [
    { id: "executive", name: "Executive Dashboard", description: "Fokus auf KPIs und Übersicht" },
    { id: "detailed", name: "Detaillierte Ansicht", description: "Umfassende Datenvisualisierung" }, 
    { id: "minimal", name: "Minimal", description: "Reduzierte, fokussierte Darstellung" },
    { id: "custom", name: "Benutzerdefiniert", description: "Vollständig anpassbar" }
  ];

  const handleProfileUpdate = () => {
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      alert("Passwörter stimmen nicht überein");
      return;
    }

    updateProfile({
      username: formData.username,
      companyName: formData.companyName
    });
    
    alert("Profil erfolgreich aktualisiert");
  };

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    updateTheme(themeId);
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Header mit Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/customer-area'}
              data-testid="button-back-dashboard"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zum Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Einstellungen</h1>
              <p className="text-gray-600">Verwalten Sie Ihr Profil und Dashboard-Einstellungen</p>
            </div>
          </div>
          <Badge variant="outline">{customer?.subscription} Plan</Badge>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="appearance">Design</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="notifications">Benachrichtigungen</TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profil & Sicherheit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="username">Benutzername</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      data-testid="input-username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyName">Firmenname</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      data-testid="input-company-name"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Passwort ändern</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPassword ? "text" : "password"}
                          value={formData.currentPassword}
                          onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                          data-testid="input-current-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="newPassword">Neues Passwort</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                        data-testid="input-new-password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        data-testid="input-confirm-password"
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleProfileUpdate} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  Änderungen speichern
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <Settings className="h-8 w-8 text-blue-600" />
          Einstellungen
        </h1>
        <p className="text-gray-600 mt-2">
          Personalisieren Sie Ihr Customer Portal • {customer?.subscription} Plan
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="appearance">Design</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="notifications">Benachrichtigungen</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profil & Anmeldedaten
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Firmenname</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    data-testid="input-company-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Benutzername</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    data-testid="input-username"
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Passwort ändern</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                        data-testid="input-current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Neues Passwort</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                        data-testid="input-new-password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        data-testid="input-confirm-password"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={handleProfileUpdate} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                Änderungen speichern
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Design & Farbschema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Farbschema wählen</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {themes.map(theme => (
                    <div
                      key={theme.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedTheme === theme.id ? theme.preview : "border-gray-200"
                      }`}
                      onClick={() => handleThemeChange(theme.id)}
                      data-testid={`theme-${theme.id}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{theme.name}</h4>
                        {selectedTheme === theme.id && (
                          <Badge className="bg-green-500 text-white">Aktiv</Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <div className={`w-8 h-8 rounded ${theme.primary}`}></div>
                        <div className={`w-8 h-8 rounded ${theme.secondary}`}></div>
                        <div className="w-8 h-8 rounded bg-gray-200"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dashboard Settings */}
        <TabsContent value="dashboard">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Layout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Template auswählen</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {dashboardTemplates.map(template => (
                    <div
                      key={template.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      data-testid={`template-${template.id}`}
                    >
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Benachrichtigungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">E-Mail Benachrichtigungen</h4>
                    <p className="text-sm text-gray-600">Updates und wichtige Änderungen</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Konfigurieren
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">System Alerts</h4>
                    <p className="text-sm text-gray-600">Warnungen und Fehlermeldungen</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Konfigurieren
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Weekly Reports</h4>
                    <p className="text-sm text-gray-600">Wöchentliche Zusammenfassungen</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Konfigurieren
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </CustomerLayout>
  );
}