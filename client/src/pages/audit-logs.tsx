import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { 
  FileText, 
  Search, 
  Download, 
  Filter,
  User,
  Shield,
  Database,
  Mail,
  Settings,
  Eye,
  Edit,
  Trash2,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure';
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
}

// Remove mock data and use API data instead
const mockAuditLogs: AuditLog[] = [
  {
    id: "1",
    timestamp: "2025-01-27T11:30:00Z",
    userId: "admin-1",
    userName: "Max Mustermann",
    userRole: "admin",
    action: "USER_CREATED",
    resource: "User",
    resourceId: "user-123",
    details: "Created new user account: thomas.weber@helix.com",
    severity: "medium",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    status: "success",
    changes: [
      { field: "email", oldValue: "", newValue: "thomas.weber@helix.com" },
      { field: "role", oldValue: "", newValue: "user" },
      { field: "status", oldValue: "", newValue: "active" }
    ]
  },
  {
    id: "2",
    timestamp: "2025-01-27T10:45:00Z",
    userId: "reviewer-1",
    userName: "Anna Schmidt",
    userRole: "reviewer",
    action: "CONTENT_APPROVED",
    resource: "Newsletter",
    resourceId: "newsletter-456",
    details: "Approved newsletter: Weekly MedTech Update",
    severity: "low",
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0 (macOS; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    status: "success"
  },
  {
    id: "3",
    timestamp: "2025-01-27T09:15:00Z",
    userId: "admin-1",
    userName: "Max Mustermann", 
    userRole: "admin",
    action: "SETTINGS_UPDATED",
    resource: "SystemSettings",
    resourceId: "setting-789",
    details: "Updated SMTP configuration",
    severity: "high",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    status: "success",
    changes: [
      { field: "SMTP_HOST", oldValue: "smtp.gmail.com", newValue: "smtp.sendgrid.net" },
      { field: "SMTP_PORT", oldValue: "465", newValue: "587" }
    ]
  },
  {
    id: "4",
    timestamp: "2025-01-27T08:30:00Z",
    userId: "user-1",
    userName: "Thomas Weber",
    userRole: "user",
    action: "LOGIN_FAILED",
    resource: "Authentication",
    details: "Failed login attempt - invalid password",
    severity: "medium",
    ipAddress: "203.0.113.45",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)",
    status: "failure"
  },
  {
    id: "5",
    timestamp: "2025-01-26T16:20:00Z",
    userId: "admin-1",
    userName: "Max Mustermann",
    userRole: "admin",
    action: "DATA_EXPORT",
    resource: "RegulatoryUpdates",
    details: "Exported regulatory updates for Q4 2024",
    severity: "medium",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    status: "success"
  },
  {
    id: "6",
    timestamp: "2025-01-26T14:45:00Z",
    userId: "admin-1",
    userName: "Max Mustermann",
    userRole: "admin",
    action: "USER_DELETED",
    resource: "User",
    resourceId: "user-old-123",
    details: "Deleted inactive user account: old.user@helix.com",
    severity: "high",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    status: "success"
  }
];

const actionCategories = {
  "USER_CREATED": "Benutzerverwaltung",
  "USER_UPDATED": "Benutzerverwaltung", 
  "USER_DELETED": "Benutzerverwaltung",
  "LOGIN_SUCCESS": "Authentifizierung",
  "LOGIN_FAILED": "Authentifizierung",
  "LOGOUT": "Authentifizierung",
  "CONTENT_APPROVED": "Genehmigung",
  "CONTENT_REJECTED": "Genehmigung",
  "SETTINGS_UPDATED": "Systemkonfiguration",
  "DATA_EXPORT": "Datenexport",
  "DATA_IMPORT": "Datenimport",
  "NEWSLETTER_SENT": "Newsletter",
  "BACKUP_CREATED": "System",
  "SYSTEM_RESTART": "System"
};

const severityColors = {
  low: "bg-blue-100 text-blue-800 border-blue-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  critical: "bg-red-100 text-red-800 border-red-200"
};

const statusColors = {
  success: "bg-green-100 text-green-800",
  failure: "bg-red-100 text-red-800"
};

const actionIcons = {
  "USER_CREATED": User,
  "USER_UPDATED": Edit,
  "USER_DELETED": Trash2,
  "LOGIN_SUCCESS": Unlock,
  "LOGIN_FAILED": Lock,
  "LOGOUT": Lock,
  "CONTENT_APPROVED": CheckCircle,
  "CONTENT_REJECTED": AlertTriangle,
  "SETTINGS_UPDATED": Settings,
  "DATA_EXPORT": Download,
  "DATA_IMPORT": Download,
  "NEWSLETTER_SENT": Mail,
  "BACKUP_CREATED": Database,
  "SYSTEM_RESTART": Settings
};

export default function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { data: auditLogs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ["/api/audit-logs", {
      search: searchQuery,
      action: selectedAction === "all" ? undefined : selectedAction,
      severity: selectedSeverity === "all" ? undefined : selectedSeverity,
      status: selectedStatus === "all" ? undefined : selectedStatus,
      user: selectedUser === "all" ? undefined : selectedUser,
      dateFrom: dateFrom?.toISOString(),
      dateTo: dateTo?.toISOString()
    }],
    enabled: true // Use real API data for current logs
  });

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = searchQuery === "" || 
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = selectedAction === "all" || log.action === selectedAction;
    const matchesSeverity = selectedSeverity === "all" || log.severity === selectedSeverity;
    const matchesStatus = selectedStatus === "all" || log.status === selectedStatus;
    const matchesUser = selectedUser === "all" || log.userId === selectedUser;

    const logDate = new Date(log.timestamp);
    const matchesDateFrom = !dateFrom || logDate >= dateFrom;
    const matchesDateTo = !dateTo || logDate <= dateTo;

    return matchesSearch && matchesAction && matchesSeverity && 
           matchesStatus && matchesUser && matchesDateFrom && matchesDateTo;
  });

  const uniqueActions = Array.from(new Set(auditLogs.map(log => log.action)));
  const uniqueUsers = Array.from(new Set(auditLogs.map(log => ({ id: log.userId, name: log.userName }))));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionIcon = (action: string) => {
    const Icon = actionIcons[action as keyof typeof actionIcons] || FileText;
    return <Icon className="h-4 w-4" />;
  };

  const exportLogs = () => {
    const csvContent = [
      "Zeitstempel,Benutzer,Aktion,Resource,Details,Schweregrad,Status,IP-Adresse",
      ...filteredLogs.map(log => 
        `"${log.timestamp}","${log.userName}","${log.action}","${log.resource}","${log.details}","${log.severity}","${log.status}","${log.ipAddress}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit-Protokolle</h1>
          <p className="text-muted-foreground">
            Vollständige Aufzeichnung aller Systemaktivitäten und Änderungen
          </p>
        </div>
        
        <Button onClick={exportLogs}>
          <Download className="mr-2 h-4 w-4" />
          Protokolle exportieren
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Filter Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filter & Suche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Suche</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Details, Benutzer, Aktion..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Aktion</label>
                <Select value={selectedAction} onValueChange={setSelectedAction}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Aktionen</SelectItem>
                    {uniqueActions.map((action) => (
                      <SelectItem key={action} value={action}>
                        {actionCategories[action as keyof typeof actionCategories] || action}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Schweregrad</label>
                <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Schweregrade</SelectItem>
                    <SelectItem value="critical">🔴 Kritisch</SelectItem>
                    <SelectItem value="high">🟠 Hoch</SelectItem>
                    <SelectItem value="medium">🟡 Mittel</SelectItem>
                    <SelectItem value="low">🔵 Niedrig</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Status</SelectItem>
                    <SelectItem value="success">✅ Erfolgreich</SelectItem>
                    <SelectItem value="failure">❌ Fehlgeschlagen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Benutzer</label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Benutzer</SelectItem>
                    {uniqueUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Von Datum</label>
                <Input
                  type="date"
                  value={dateFrom ? dateFrom.toISOString().split('T')[0] : ''}
                  onChange={(e) => setDateFrom(e.target.value ? new Date(e.target.value) : undefined)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Bis Datum</label>
                <Input
                  type="date"
                  value={dateTo ? dateTo.toISOString().split('T')[0] : ''}
                  onChange={(e) => setDateTo(e.target.value ? new Date(e.target.value) : undefined)}
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-muted-foreground">
                {filteredLogs.length} von {auditLogs.length} Einträgen gefunden
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedAction("all");
                  setSelectedSeverity("all");
                  setSelectedStatus("all");
                  setSelectedUser("all");
                  setDateFrom(undefined);
                  setDateTo(undefined);
                }}
              >
                Filter zurücksetzen
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Systemaktivitäten</CardTitle>
            <CardDescription>
              Chronologische Auflistung aller wichtigen Systemereignisse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zeitstempel</TableHead>
                  <TableHead>Benutzer</TableHead>
                  <TableHead>Aktion</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Schweregrad</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow 
                    key={log.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedLog(log)}
                  >
                    <TableCell className="font-mono text-xs">
                      {formatDate(log.timestamp)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{log.userName}</p>
                        <p className="text-xs text-muted-foreground">{log.userRole}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getActionIcon(log.action)}
                        <span className="text-sm">
                          {actionCategories[log.action as keyof typeof actionCategories] || log.action}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {log.resource}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={severityColors[log.severity]} variant="outline">
                        {log.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[log.status]} variant="secondary">
                        {log.status === 'success' ? 'Erfolg' : 'Fehler'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredLogs.length === 0 && (
              <div className="text-center py-12">
                <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Keine Protokolleinträge gefunden</h3>
                <p className="text-muted-foreground">
                  Passen Sie Ihre Filter an oder erweitern Sie den Zeitraum.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold">Aktivitätsdetails</h2>
                <p className="text-muted-foreground">
                  {formatDate(selectedLog.timestamp)}
                </p>
              </div>
              <Button variant="ghost" onClick={() => setSelectedLog(null)}>
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Benutzer</label>
                  <p className="font-medium">{selectedLog.userName}</p>
                  <p className="text-sm text-muted-foreground">{selectedLog.userRole}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Aktion</label>
                  <div className="flex items-center space-x-2">
                    {getActionIcon(selectedLog.action)}
                    <span>{actionCategories[selectedLog.action as keyof typeof actionCategories] || selectedLog.action}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Details</label>
                <p className="bg-muted p-3 rounded text-sm">{selectedLog.details}</p>
              </div>

              {selectedLog.changes && selectedLog.changes.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Änderungen</label>
                  <div className="border rounded overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Feld</TableHead>
                          <TableHead>Alter Wert</TableHead>
                          <TableHead>Neuer Wert</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedLog.changes.map((change, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{change.field}</TableCell>
                            <TableCell className="font-mono text-sm text-red-600">
                              {change.oldValue || '(leer)'}
                            </TableCell>
                            <TableCell className="font-mono text-sm text-green-600">
                              {change.newValue || '(leer)'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">IP-Adresse</label>
                  <p className="font-mono">{selectedLog.ipAddress}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User Agent</label>
                  <p className="text-xs break-all">{selectedLog.userAgent}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}