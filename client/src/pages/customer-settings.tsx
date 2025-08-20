import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  User, 
  Palette, 
  Bell,
  Save,
  Eye,
  EyeOff,
  ArrowLeft,
  LayoutDashboard
} from "lucide-react";
import { useCustomer } from "@/contexts/CustomerContext";
import { CustomerLayout } from "@/components/customer/customer-layout";
import { useLocation } from "wouter";

export default function CustomerSettings() {
  const { customer, updateTheme, updateProfile } = useCustomer();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: customer?.username || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    companyName: customer?.companyName || ""
  });

  const handleProfileUpdate = () => {
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Fehler",
        description: "Passwörter stimmen nicht überein",
        variant: "destructive"
      });
      return;
    }

    updateProfile({
      username: formData.username,
      companyName: formData.companyName
    });
    
    toast({
      title: "Erfolg",
      description: "Profil erfolgreich aktualisiert"
    });
  };

  const handleThemeChange = (themeId: string) => {
    updateTheme(themeId);
    toast({
      title: "Design geändert",
      description: `Farbschema auf ${themeId} geändert`
    });
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation('/customer')}
            className="flex items-center gap-2"
            data-testid="button-back-to-dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zum Dashboard
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Settings className="h-8 w-8 text-blue-600" />
              Einstellungen
            </h1>
            <p className="text-gray-600 mt-2">
              Verwalten Sie Ihr Profil und Dashboard-Einstellungen
            </p>
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

          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Design & Erscheinungsbild
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Farbschema wählen</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {['blue', 'purple', 'green'].map((color) => (
                      <div
                        key={color}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          customer?.colorScheme === color 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleThemeChange(color)}
                        data-testid={`theme-${color}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full bg-${color}-500`}></div>
                          <span className="font-medium capitalize">{color}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Logo & Branding</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Firmen-Logo hochladen</h4>
                        <p className="text-sm text-gray-600">Anpassung des Dashboard-Logos</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Upload
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dashboard Settings */}
          <TabsContent value="dashboard">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5" />
                  Dashboard-Konfiguration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Widget-Einstellungen</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Automatisches Layout</h4>
                        <p className="text-sm text-gray-600">Widgets automatisch anordnen</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Erweiterte Widgets</h4>
                        <p className="text-sm text-gray-600">Zusätzliche Widget-Optionen anzeigen</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Live-Updates</h4>
                        <p className="text-sm text-gray-600">Echtzeit-Datenaktualisierung</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Dashboard-Layout</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: "compact", name: "Kompakt", description: "Platzsparende Darstellung" },
                      { id: "spacious", name: "Geräumig", description: "Mehr Platz zwischen Elementen" },
                      { id: "minimal", name: "Minimal", description: "Reduzierte Oberfläche" },
                      { id: "detailed", name: "Detailliert", description: "Umfassende Informationen" }
                    ].map((layout) => (
                      <div
                        key={layout.id}
                        className="p-4 border rounded-lg cursor-pointer hover:border-blue-300 transition-colors"
                        data-testid={`layout-${layout.id}`}
                      >
                        <h4 className="font-medium">{layout.name}</h4>
                        <p className="text-sm text-gray-600">{layout.description}</p>
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
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Email-Benachrichtigungen</h4>
                      <p className="text-sm text-gray-600">Wichtige Updates per Email erhalten</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Push-Benachrichtigungen</h4>
                      <p className="text-sm text-gray-600">Browser-Benachrichtigungen aktivieren</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Wöchentliche Berichte</h4>
                      <p className="text-sm text-gray-600">Automatische Zusammenfassungen</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">System-Alerts</h4>
                      <p className="text-sm text-gray-600">Kritische Warnungen und Fehler</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Benachrichtigungszeiten</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="notificationStart">Start-Zeit</Label>
                      <Input
                        id="notificationStart"
                        type="time"
                        defaultValue="09:00"
                        data-testid="input-notification-start"
                      />
                    </div>
                    <div>
                      <Label htmlFor="notificationEnd">End-Zeit</Label>
                      <Input
                        id="notificationEnd"
                        type="time"
                        defaultValue="18:00"
                        data-testid="input-notification-end"
                      />
                    </div>
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