import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Shield, 
  Crown, 
  Eye, 
  Mail,
  Calendar,
  Activity,
  Settings,
  Key
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'reviewer' | 'user';
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  permissions: string[];
  profileImageUrl?: string;
}

interface UserActivity {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

const userFormSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  firstName: z.string().min(1, "Vorname erforderlich"),
  lastName: z.string().min(1, "Nachname erforderlich"),
  role: z.enum(['admin', 'reviewer', 'user']),
  isActive: z.boolean(),
  permissions: z.array(z.string()).optional()
});

type UserFormData = z.infer<typeof userFormSchema>;

const initialUsers: User[] = [
  {
    id: "1",
    email: "admin@helix.com",
    firstName: "Max",
    lastName: "Mustermann",
    role: "admin",
    isActive: true,
    lastLoginAt: "2025-01-27T10:30:00Z",
    createdAt: "2024-12-01T09:00:00Z",
    permissions: ["read", "write", "delete", "admin", "user_management"],
    profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
  },
  {
    id: "2",
    email: "reviewer@helix.com",
    firstName: "Anna",
    lastName: "Schmidt",
    role: "reviewer",
    isActive: true,
    lastLoginAt: "2025-01-27T08:15:00Z",
    createdAt: "2024-12-15T14:30:00Z",
    permissions: ["read", "write", "approve"],
    profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=reviewer"
  },
  {
    id: "3",
    email: "user@helix.com",
    firstName: "Thomas",
    lastName: "Weber",
    role: "user",
    isActive: true,
    lastLoginAt: "2025-01-26T16:45:00Z",
    createdAt: "2025-01-10T11:20:00Z",
    permissions: ["read"],
    profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=user"
  },
  {
    id: "4",
    email: "inactive@helix.com",
    firstName: "Maria",
    lastName: "Klein",
    role: "user",
    isActive: false,
    createdAt: "2024-11-20T12:00:00Z",
    permissions: ["read"]
  }
];

const recentActivity: UserActivity[] = [
  {
    id: "1",
    userId: "1",
    action: "User Login",
    details: "Successful login via SSO",
    timestamp: "2025-01-27T10:30:00Z",
    ipAddress: "192.168.1.100"
  },
  {
    id: "2",
    userId: "2",
    action: "Approval Action",
    details: "Approved newsletter 'Weekly MedTech Update'",
    timestamp: "2025-01-27T08:15:00Z",
    ipAddress: "192.168.1.101"
  },
  {
    id: "3",
    userId: "1",
    action: "User Created",
    details: "Created new user account for thomas.weber@helix.com",
    timestamp: "2025-01-26T14:20:00Z",
    ipAddress: "192.168.1.100"
  }
];

const roleColors = {
  admin: "bg-red-100 text-red-800 border-red-200",
  reviewer: "bg-blue-100 text-blue-800 border-blue-200",
  user: "bg-green-100 text-green-800 border-green-200"
};

const roleIcons = {
  admin: Crown,
  reviewer: Shield,
  user: Users
};

const availablePermissions = [
  { id: "read", label: "Lesen", description: "Daten anzeigen und lesen" },
  { id: "write", label: "Schreiben", description: "Daten erstellen und bearbeiten" },
  { id: "delete", label: "Löschen", description: "Daten löschen" },
  { id: "approve", label: "Genehmigen", description: "Inhalte genehmigen oder ablehnen" },
  { id: "admin", label: "Administration", description: "Vollzugriff auf alle Funktionen" },
  { id: "user_management", label: "Benutzerverwaltung", description: "Benutzer verwalten" }
];

export default function UserManagement() {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: "user",
      isActive: true,
      permissions: ["read"]
    }
  });

  const { data: users = initialUsers, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: false // Use mock data
  });

  const { data: userActivity = recentActivity, isLoading: activityLoading } = useQuery<UserActivity[]>({
    queryKey: ["/api/users/activity"],
    enabled: false // Use mock data
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: UserFormData) => {
      return await apiRequest("/api/users", "POST", userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Benutzer erstellt",
        description: "Der neue Benutzer wurde erfolgreich erstellt."
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Benutzer konnte nicht erstellt werden.",
        variant: "destructive"
      });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, ...userData }: UserFormData & { id: string }) => {
      return await apiRequest(`/api/users/${id}`, "PATCH", userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      form.reset();
      toast({
        title: "Benutzer aktualisiert",
        description: "Die Benutzerdaten wurden erfolgreich aktualisiert."
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Benutzer konnte nicht aktualisiert werden.",
        variant: "destructive"
      });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest(`/api/users/${userId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Benutzer gelöscht",
        description: "Der Benutzer wurde erfolgreich gelöscht."
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Benutzer konnte nicht gelöscht werden.",
        variant: "destructive"
      });
    }
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === "" || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    form.reset({
      email: user.email,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      role: user.role,
      isActive: user.isActive,
      permissions: user.permissions
    });
    setIsEditDialogOpen(true);
  };

  const onSubmit = (data: UserFormData) => {
    if (selectedUser) {
      updateUserMutation.mutate({ ...data, id: selectedUser.id });
    } else {
      createUserMutation.mutate(data);
    }
  };

  const getRoleIcon = (role: string) => {
    const Icon = roleIcons[role as keyof typeof roleIcons] || Users;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Benutzerverwaltung</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Benutzer, Rollen und Berechtigungen
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Neuer Benutzer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Neuen Benutzer erstellen</DialogTitle>
              <DialogDescription>
                Erstellen Sie ein neues Benutzerkonto mit entsprechenden Berechtigungen.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vorname</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nachname</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-Mail</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rolle</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="user">Benutzer</SelectItem>
                            <SelectItem value="reviewer">Reviewer</SelectItem>
                            <SelectItem value="admin">Administrator</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Aktiv</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Benutzer kann sich anmelden
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Abbrechen
                  </Button>
                  <Button type="submit" disabled={createUserMutation.isPending}>
                    {createUserMutation.isPending ? "Erstelle..." : "Erstellen"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Benutzer</TabsTrigger>
          <TabsTrigger value="activity">Aktivitäten</TabsTrigger>
          <TabsTrigger value="permissions">Berechtigungen</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Alle Benutzer</CardTitle>
              <CardDescription>
                Übersicht über alle registrierten Benutzer im System
              </CardDescription>
              <div className="flex space-x-4">
                <Input
                  placeholder="Benutzer suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Rollen</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="reviewer">Reviewer</SelectItem>
                    <SelectItem value="user">Benutzer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Benutzer</TableHead>
                    <TableHead>Rolle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Letzter Login</TableHead>
                    <TableHead>Erstellt</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            {user.profileImageUrl ? (
                              <img 
                                src={user.profileImageUrl} 
                                alt={`${user.firstName} ${user.lastName}`}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <Users className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={roleColors[user.role]} variant="outline">
                          {getRoleIcon(user.role)}
                          <span className="ml-1 capitalize">{user.role}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Aktiv" : "Inaktiv"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.lastLoginAt ? formatDate(user.lastLoginAt) : "Nie"}
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteUserMutation.mutate(user.id)}
                            disabled={user.role === 'admin'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Benutzeraktivitäten</CardTitle>
              <CardDescription>
                Letzte Aktivitäten und Aktionen der Benutzer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userActivity.map((activity) => {
                  const user = users.find(u => u.id === activity.userId);
                  return (
                    <div key={activity.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Activity className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.details}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                          <span>Benutzer: {user?.firstName} {user?.lastName}</span>
                          <span>•</span>
                          <span>{formatDate(activity.timestamp)}</span>
                          {activity.ipAddress && (
                            <>
                              <span>•</span>
                              <span>IP: {activity.ipAddress}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Berechtigungen verwalten</CardTitle>
              <CardDescription>
                Übersicht über verfügbare Berechtigungen im System
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {availablePermissions.map((permission) => (
                  <div key={permission.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{permission.label}</h3>
                      <Badge variant="outline">
                        <Key className="h-3 w-3 mr-1" />
                        {permission.id}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {permission.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Benutzer bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeiten Sie die Benutzerdaten und Berechtigungen.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vorname</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nachname</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-Mail</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rolle</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">Benutzer</SelectItem>
                          <SelectItem value="reviewer">Reviewer</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Aktiv</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Benutzer kann sich anmelden
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Abbrechen
                </Button>
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? "Speichere..." : "Speichern"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}