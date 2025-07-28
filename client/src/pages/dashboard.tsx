import { Header } from "@/components/layout/header";
import { StatusCards } from "@/components/dashboard/status-cards";
import { RecentUpdates } from "@/components/dashboard/recent-updates";
import { ApprovalWorkflow } from "@/components/dashboard/approval-workflow";
import { DataCollectionStatus } from "@/components/dashboard/data-collection-status";
import { NewsletterOverview } from "@/components/dashboard/newsletter-overview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Upload, Download, Settings, FolderSync } from "lucide-react";
import { useDevice } from "@/hooks/use-device";
import { ResponsiveGrid } from "@/components/responsive-layout";
import { HeaderLogo } from "@/components/layout/logo";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  const device = useDevice();
  const [, setLocation] = useLocation();
  
  const handleSearch = (query: string) => {
    console.log("Search query:", query);
    // TODO: Implement search functionality
  };

  const handleCreateNewsletter = () => {
    setLocation("/newsletter-manager");
  };

  const handleUploadKnowledge = () => {
    setLocation("/knowledge-base");
  };

  const handleExportData = () => {
    // Trigger data export functionality
    const data = {
      timestamp: new Date().toISOString(),
      exported_by: "dashboard",
      data_sources: "all_active"
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `helix_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleConfigureSources = () => {
    setLocation("/global-sources");
  };

  const handleSyncAllSources = async () => {
    try {
      console.log("Starting sync of all data sources...");
      // Trigger sync for all active data sources
      const result = await apiRequest("/api/data-sources/sync-all", "POST");
      console.log("Sync completed successfully:", result);
      
      // Show success message
      alert("Synchronisation erfolgreich gestartet!");
      
      // Refresh dashboard data after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Failed to sync data sources:", error);
      alert(`Sync fehlgeschlagen: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={handleSearch} />
      
      <main className="flex-1 overflow-auto">
        <div className={device.isMobile ? "p-4" : device.isTablet ? "p-6" : "p-8"}>
            {/* Dashboard Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Regulatory Intelligence Dashboard</h1>
              <p className="text-gray-600 mt-1">Real-time monitoring of global MedTech regulatory landscape</p>
            </div>

            {/* Status Cards */}
            <StatusCards />

            <div className={`grid gap-${device.isMobile ? '4' : '8'} ${
              device.isMobile ? 'grid-cols-1' : 
              device.isTablet ? 'grid-cols-1 lg:grid-cols-2' : 
              'grid-cols-1 lg:grid-cols-3'
            }`}>
              {/* Recent Updates */}
              <div className={device.isDesktop ? "lg:col-span-2" : "col-span-1"}>
                <RecentUpdates />
              </div>

              {/* Sidebar Content */}
              <div className="col-span-1">
                {/* Approval Workflow */}
                <div className="mb-6">
                  <ApprovalWorkflow />
                </div>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      className="w-full flex items-center justify-center"
                      onClick={handleCreateNewsletter}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Newsletter
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center justify-center"
                      onClick={handleUploadKnowledge}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Knowledge
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center justify-center"
                      onClick={handleExportData}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export Data
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center justify-center"
                      onClick={handleConfigureSources}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Configure Sources
                    </Button>
                    <Button 
                      className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700"
                      onClick={handleSyncAllSources}
                    >
                      <FolderSync className="mr-2 h-4 w-4" />
                      Sync All Sources
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* System Management */}
            <div className="mt-8 space-y-6">
              <DataCollectionStatus />
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <ApprovalWorkflow />
                <NewsletterOverview />
              </div>
            </div>
          </div>
        </main>
    </div>
  );
}
