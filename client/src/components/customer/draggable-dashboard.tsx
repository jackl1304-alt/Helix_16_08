import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  FileText, 
  Activity, 
  TrendingUp, 
  Database,
  Settings,
  Plus,
  Move,
  X,
  GripVertical,
  Calendar,
  Users,
  Zap,
  Globe,
  PieChart,
  LineChart,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { useCustomer } from "@/contexts/CustomerContext";

interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  content: any;
  size: "small" | "medium" | "large";
  position: { x: number; y: number };
  width: number;
  height: number;
}

interface AvailableWidget {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: any;
  category: string;
  defaultSize: "small" | "medium" | "large";
}

const defaultWidgets: DashboardWidget[] = [
  {
    id: "stats-overview",
    type: "stats",
    title: "Übersicht",
    content: { updates: 24, cases: 65, sources: 70 },
    size: "large",
    position: { x: 20, y: 20 },
    width: 400,
    height: 200
  },
  {
    id: "recent-updates",
    type: "list",
    title: "Aktuelle Updates",
    content: [
      { title: "FDA 510(k) Update", date: "20.08.2025" },
      { title: "EMA Guidance", date: "19.08.2025" },
      { title: "MDR Amendment", date: "18.08.2025" }
    ],
    size: "medium",
    position: { x: 450, y: 20 },
    width: 350,
    height: 250
  },
  {
    id: "activity-feed",
    type: "activity", 
    title: "Aktivitäten",
    content: [
      { action: "Sync completed", time: "vor 5 Min." },
      { action: "Report generated", time: "vor 1 Std." },
      { action: "New case added", time: "vor 2 Std." }
    ],
    size: "medium",
    position: { x: 20, y: 240 },
    width: 350,
    height: 250
  },
  {
    id: "quick-actions",
    type: "actions",
    title: "Schnellzugriff",
    content: [
      { label: "Neuer Report", icon: FileText, action: "create-report" },
      { label: "Sync starten", icon: Activity, action: "sync-data" },
      { label: "Export", icon: Database, action: "export-data" }
    ],
    size: "small",
    position: { x: 820, y: 20 },
    width: 280,
    height: 180
  }
];

const availableWidgets: AvailableWidget[] = [
  {
    id: "stats-overview",
    type: "stats", 
    title: "Übersicht",
    description: "KPI-Übersicht mit aktuellen Zahlen",
    icon: BarChart3,
    category: "Analytics",
    defaultSize: "large"
  },
  {
    id: "recent-updates",
    type: "list",
    title: "Aktuelle Updates", 
    description: "Liste der neuesten regulatorischen Updates",
    icon: FileText,
    category: "Content",
    defaultSize: "medium"
  },
  {
    id: "activity-feed",
    type: "activity",
    title: "Aktivitäten",
    description: "Live-Feed der System-Aktivitäten", 
    icon: Activity,
    category: "Monitoring",
    defaultSize: "medium"
  },
  {
    id: "quick-actions",
    type: "actions",
    title: "Schnellzugriff",
    description: "Häufig verwendete Aktionen",
    icon: Zap,
    category: "Tools",
    defaultSize: "small"
  },
  {
    id: "calendar-widget",
    type: "calendar",
    title: "Terminkalender",
    description: "Anstehende Deadlines und Termine",
    icon: Calendar,
    category: "Planning",
    defaultSize: "medium"
  },
  {
    id: "performance-chart",
    type: "chart",
    title: "Performance Chart",
    description: "Grafische Darstellung der System-Performance",
    icon: LineChart,
    category: "Analytics",
    defaultSize: "large"
  },
  {
    id: "alerts-widget",
    type: "alerts",
    title: "Wichtige Benachrichtigungen",
    description: "Kritische Alerts und Warnungen",
    icon: AlertCircle,
    category: "Monitoring",
    defaultSize: "medium"
  },
  {
    id: "team-widget",
    type: "team",
    title: "Team-Status",
    description: "Status und Aktivitäten des Teams",
    icon: Users,
    category: "Collaboration",
    defaultSize: "medium"
  }
];

export function DraggableDashboard() {
  const { customer, theme } = useCustomer();
  const [widgets, setWidgets] = useState<DashboardWidget[]>(defaultWidgets);
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showWidgetCatalog, setShowWidgetCatalog] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Drag Start
  const handleDragStart = (e: React.MouseEvent, widgetId: string) => {
    if (!isEditing) return;
    e.preventDefault();
    
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(widgetId);
    
    // Add event listeners to document for global mouse tracking
    const handleMove = (e: MouseEvent) => handleDragMove(e);
    const handleEnd = () => handleDragEnd();
    
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    
    // Store references for cleanup
    (e.currentTarget as any)._handleMove = handleMove;
    (e.currentTarget as any)._handleEnd = handleEnd;
  };

  // Drag Move
  const handleDragMove = (e: MouseEvent) => {
    if (!isDragging || !dashboardRef.current) return;
    
    const dashboardRect = dashboardRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(e.clientX - dashboardRect.left - dragOffset.x, dashboardRect.width - 250));
    const newY = Math.max(0, Math.min(e.clientY - dashboardRect.top - dragOffset.y, dashboardRect.height - 150));
    
    setWidgets(prev => prev.map(widget => 
      widget.id === isDragging 
        ? { ...widget, position: { x: newX, y: newY } }
        : widget
    ));
  };

  // Drag End
  const handleDragEnd = () => {
    setIsDragging(null);
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
  };

  // Add Widget
  const addWidget = (availableWidget: AvailableWidget) => {
    const newWidget: DashboardWidget = {
      id: `${availableWidget.id}-${Date.now()}`,
      type: availableWidget.type,
      title: availableWidget.title,
      content: getDefaultContent(availableWidget.type),
      size: availableWidget.defaultSize,
      position: { x: 50, y: 50 },
      width: getSizeWidth(availableWidget.defaultSize),
      height: getSizeHeight(availableWidget.defaultSize)
    };
    
    setWidgets(prev => [...prev, newWidget]);
    setShowWidgetCatalog(false);
  };

  // Remove Widget
  const removeWidget = (widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
  };

  // Helper Functions
  const getSizeWidth = (size: string) => {
    switch(size) {
      case "small": return 280;
      case "medium": return 350;
      case "large": return 400;
      default: return 350;
    }
  };

  const getSizeHeight = (size: string) => {
    switch(size) {
      case "small": return 180;
      case "medium": return 250;
      case "large": return 300;
      default: return 250;
    }
  };

  const getDefaultContent = (type: string) => {
    switch(type) {
      case "stats":
        return { updates: 24, cases: 65, sources: 70 };
      case "list":
        return [
          { title: "Sample Item 1", date: "Heute" },
          { title: "Sample Item 2", date: "Gestern" }
        ];
      case "activity":
        return [
          { action: "Widget hinzugefügt", time: "jetzt" }
        ];
      case "calendar":
        return [
          { event: "MDR Deadline", date: "25.08.2025" },
          { event: "Audit Review", date: "30.08.2025" }
        ];
      case "alerts":
        return [
          { type: "warning", message: "Sync-Fehler behoben", time: "vor 10 Min." }
        ];
      case "team":
        return [
          { name: "Max Müller", status: "online", role: "Analyst" },
          { name: "Sarah Schmidt", status: "offline", role: "Manager" }
        ];
      default:
        return {};
    }
  };

  // Render Widget Content
  const renderWidgetContent = (widget: DashboardWidget) => {
    // Ensure content is properly structured
    const safeContent = widget.content || {};
    
    switch(widget.type) {
      case "stats":
        return (
          <div className="grid grid-cols-3 gap-4 p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{safeContent.updates || 0}</div>
              <div className="text-xs text-gray-600">Updates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{safeContent.cases || 0}</div>
              <div className="text-xs text-gray-600">Cases</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{safeContent.sources || 0}</div>
              <div className="text-xs text-gray-600">Sources</div>
            </div>
          </div>
        );
      case "list":
        const listItems = Array.isArray(safeContent) ? safeContent : [];
        return (
          <div className="p-4 space-y-2">
            {listItems.length > 0 ? listItems.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">{item.title || 'Kein Titel'}</span>
                <span className="text-xs text-gray-500">{item.date || 'Kein Datum'}</span>
              </div>
            )) : (
              <div className="text-center text-gray-500 p-4">Keine Elemente</div>
            )}
          </div>
        );
      case "activity":
        const activityItems = Array.isArray(safeContent) ? safeContent : [];
        return (
          <div className="p-4 space-y-2">
            {activityItems.length > 0 ? activityItems.map((item: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">{item.action || 'Aktion'}</span>
                <span className="text-xs text-gray-500 ml-auto">{item.time || 'Zeit'}</span>
              </div>
            )) : (
              <div className="text-center text-gray-500 p-4">Keine Aktivitäten</div>
            )}
          </div>
        );
      case "actions":
        const actionItems = Array.isArray(safeContent) ? safeContent : [];
        return (
          <div className="p-4 space-y-2">
            {actionItems.length > 0 ? actionItems.map((action: any, index: number) => {
              const IconComponent = action.icon || Activity;
              return (
                <Button 
                  key={index} 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => console.log(`Action: ${action.action}`)}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {action.label || 'Aktion'}
                </Button>
              );
            }) : (
              <div className="text-center text-gray-500 p-4">Keine Aktionen</div>
            )}
          </div>
        );
      case "calendar":
        const calendarItems = Array.isArray(safeContent) ? safeContent : [];
        return (
          <div className="p-4 space-y-2">
            {calendarItems.length > 0 ? calendarItems.map((event: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-2 border-l-4 border-blue-500 bg-blue-50 rounded">
                <span className="text-sm font-medium">{event.event || 'Event'}</span>
                <span className="text-xs text-gray-600">{event.date || 'Datum'}</span>
              </div>
            )) : (
              <div className="text-center text-gray-500 p-4">Keine Termine</div>
            )}
          </div>
        );
      case "alerts":
        const alertItems = Array.isArray(safeContent) ? safeContent : [];
        return (
          <div className="p-4 space-y-2">
            {alertItems.length > 0 ? alertItems.map((alert: any, index: number) => (
              <div key={index} className="flex items-start gap-2 p-2 bg-orange-50 border border-orange-200 rounded">
                <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm">{alert.message || 'Nachricht'}</div>
                  <div className="text-xs text-gray-500">{alert.time || 'Zeit'}</div>
                </div>
              </div>
            )) : (
              <div className="text-center text-gray-500 p-4">Keine Benachrichtigungen</div>
            )}
          </div>
        );
      case "team":
        const teamItems = Array.isArray(safeContent) ? safeContent : [];
        return (
          <div className="p-4 space-y-2">
            {teamItems.length > 0 ? teamItems.map((member: any, index: number) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded">
                <div className={`w-3 h-3 rounded-full ${member.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{member.name || 'Team Mitglied'}</div>
                  <div className="text-xs text-gray-500">{member.role || 'Rolle'}</div>
                </div>
              </div>
            )) : (
              <div className="text-center text-gray-500 p-4">Keine Team-Mitglieder</div>
            )}
          </div>
        );
      default:
        return <div className="p-4 text-center text-gray-500">Widget Content</div>;
    }
  };

  return (
    <div className="relative">
      {/* Header mit Controls */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Willkommen, {customer?.companyName || customer?.username}
          </h1>
          <p className="text-gray-600">Ihr personalisiertes Dashboard • {customer?.subscription} Plan</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            data-testid="button-edit-dashboard"
          >
            <Settings className="h-4 w-4 mr-2" />
            {isEditing ? "Fertig" : "Bearbeiten"}
          </Button>
          
          {isEditing && (
            <Dialog open={showWidgetCatalog} onOpenChange={setShowWidgetCatalog}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-add-widget">
                  <Plus className="h-4 w-4 mr-2" />
                  Widget
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Widget hinzufügen</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {Object.entries(
                    availableWidgets.reduce((acc, widget) => {
                      if (!acc[widget.category]) acc[widget.category] = [];
                      acc[widget.category].push(widget);
                      return acc;
                    }, {} as Record<string, AvailableWidget[]>)
                  ).map(([category, categoryWidgets]) => (
                    <div key={category}>
                      <h3 className="font-semibold mb-2">{category}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {categoryWidgets.map((widget) => (
                          <Card 
                            key={widget.id} 
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => addWidget(widget)}
                            data-testid={`widget-catalog-${widget.id}`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3 mb-2">
                                <widget.icon className="h-5 w-5 text-blue-600" />
                                <h4 className="font-medium">{widget.title}</h4>
                              </div>
                              <p className="text-sm text-gray-600">{widget.description}</p>
                              <Badge variant="outline" className="mt-2">
                                {widget.defaultSize}
                              </Badge>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Dashboard Area */}
      <div 
        ref={dashboardRef}
        className="relative min-h-[800px] bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
        data-testid="dashboard-area"
      >
        {widgets.map((widget) => (
          <div
            key={widget.id}
            className={`absolute bg-white rounded-lg shadow-md border border-gray-200 ${
              isDragging === widget.id ? 'shadow-xl z-50' : 'z-10'
            } ${isEditing ? 'cursor-move' : ''}`}
            style={{
              left: widget.position.x,
              top: widget.position.y,
              width: widget.width,
              height: widget.height,
            }}
            onMouseDown={isEditing ? (e) => handleDragStart(e, widget.id) : undefined}
            data-testid={`widget-${widget.id}`}
          >
            {/* Widget Header */}
            <div className={`flex items-center justify-between p-3 border-b border-gray-200 ${
              isEditing ? 'bg-gray-50' : 'bg-white'
            }`}>
              <div className="flex items-center gap-2">
                {isEditing && (
                  <GripVertical className="h-4 w-4 text-gray-400" />
                )}
                <h3 className="font-medium text-gray-900">{widget.title}</h3>
              </div>
              {isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeWidget(widget.id);
                  }}
                  data-testid={`button-remove-${widget.id}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Widget Content */}
            <div className="overflow-hidden">
              {renderWidgetContent(widget)}
            </div>
          </div>
        ))}
        
        {/* Empty State */}
        {widgets.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                <BarChart3 className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Widgets</h3>
              <p className="text-gray-600 mb-4">Fügen Sie Widgets hinzu, um Ihr Dashboard zu personalisieren</p>
              <Button onClick={() => setShowWidgetCatalog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Erstes Widget hinzufügen
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}