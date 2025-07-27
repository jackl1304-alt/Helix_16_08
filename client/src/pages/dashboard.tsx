import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { StatusCards } from "@/components/dashboard/status-cards";
import { RecentUpdates } from "@/components/dashboard/recent-updates";
import { ApprovalWorkflow } from "@/components/dashboard/approval-workflow";
import { DataCollectionStatus } from "@/components/dashboard/data-collection-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Upload, Download, Settings } from "lucide-react";

export default function Dashboard() {
  const handleSearch = (query: string) => {
    console.log("Search query:", query);
    // TODO: Implement search functionality
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={handleSearch} />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {/* Dashboard Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Regulatory Intelligence Dashboard</h1>
              <p className="text-gray-600 mt-1">Real-time monitoring of global MedTech regulatory landscape</p>
            </div>

            {/* Status Cards */}
            <StatusCards />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Updates */}
              <div className="lg:col-span-2">
                <RecentUpdates />
              </div>

              {/* Sidebar Content */}
              <div>
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
                    <Button className="w-full flex items-center justify-center">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Newsletter
                    </Button>
                    <Button variant="outline" className="w-full flex items-center justify-center">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Knowledge
                    </Button>
                    <Button variant="outline" className="w-full flex items-center justify-center">
                      <Download className="mr-2 h-4 w-4" />
                      Export Data
                    </Button>
                    <Button variant="outline" className="w-full flex items-center justify-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Configure Sources
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Data Collection Status */}
            <div className="mt-8">
              <DataCollectionStatus />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
