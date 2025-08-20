import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  FileText, 
  Activity, 
  TrendingUp, 
  Database,
  Settings,
  Plus,
  Move
} from "lucide-react";
import { useCustomer } from "@/contexts/CustomerContext";

interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  content: any;
  size: "small" | "medium" | "large";
  position: { row: number; col: number };
}

const defaultWidgets: DashboardWidget[] = [
  {
    id: "stats-overview",
    type: "stats",
    title: "Übersicht",
    content: { updates: 24, cases: 65, sources: 70 },
    size: "large",
    position: { row: 0, col: 0 }
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
    position: { row: 1, col: 0 }
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
    position: { row: 1, col: 1 }
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
    position: { row: 0, col: 1 }
  }
];

export function DraggableDashboard() {
  const { customer, theme } = useCustomer();
  const [widgets, setWidgets] = useState<DashboardWidget[]>(defaultWidgets);
  const [isEditing, setIsEditing] = useState(false);

  const moveWidget = (fromIndex: number, toIndex: number) => {
    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, reorderedItem);
    setWidgets(items);
  };

  const moveWidgetUp = (index: number) => {
    if (index > 0) moveWidget(index, index - 1);
  };

  const moveWidgetDown = (index: number) => {
    if (index < widgets.length - 1) moveWidget(index, index + 1);
  };

  const renderWidget = (widget: DashboardWidget) => {
    const sizeClasses = {
      small: "col-span-1",
      medium: "col-span-2", 
      large: "col-span-3"
    };

    switch (widget.type) {
      case "stats":
        return (
          <Card className={`${sizeClasses[widget.size]} ${theme.secondary}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {widget.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{widget.content.updates}</div>
                  <div className="text-sm text-gray-600">Updates</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{widget.content.cases}</div>
                  <div className="text-sm text-gray-600">Cases</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{widget.content.sources}</div>
                  <div className="text-sm text-gray-600">Sources</div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "list":
        return (
          <Card className={sizeClasses[widget.size]}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {widget.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {widget.content.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{item.title}</span>
                    <span className="text-xs text-gray-500">{item.date}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case "activity":
        return (
          <Card className={sizeClasses[widget.size]}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {widget.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {widget.content.map((activity: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{activity.action}</div>
                      <div className="text-xs text-gray-500">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case "actions":
        return (
          <Card className={sizeClasses[widget.size]}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {widget.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {widget.content.map((action: any, index: number) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => console.log(`Action: ${action.action}`)}
                  >
                    <action.icon className="h-4 w-4 mr-2" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Willkommen, {customer?.companyName}
          </h1>
          <p className="text-gray-600 mt-2">
            Ihr personalisiertes Dashboard • {customer?.subscription} Plan
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            data-testid="button-edit-dashboard"
          >
            <Settings className="h-4 w-4 mr-1" />
            {isEditing ? "Fertig" : "Bearbeiten"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => console.log("Add widget")}
            data-testid="button-add-widget"
          >
            <Plus className="h-4 w-4 mr-1" />
            Widget
          </Button>
        </div>
      </div>

      {/* Widget Dashboard Grid */}
      <div className="grid grid-cols-3 gap-6 auto-rows-fr">
        {widgets.map((widget, index) => (
          <div key={widget.id} className="relative">
            {isEditing && (
              <div className="absolute top-2 right-2 z-10 flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => moveWidgetUp(index)}
                  disabled={index === 0}
                  className="p-1 h-8 w-8"
                >
                  ↑
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => moveWidgetDown(index)}
                  disabled={index === widgets.length - 1}
                  className="p-1 h-8 w-8"
                >
                  ↓
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="p-1 h-8 w-8 cursor-move"
                >
                  <Move className="h-4 w-4" />
                </Button>
              </div>
            )}
            {renderWidget(widget)}
          </div>
        ))}
      </div>
    </div>
  );
}