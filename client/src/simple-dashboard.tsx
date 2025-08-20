// Einfaches Dashboard ohne komplexe Dependencies
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Database, FileText, Users } from "lucide-react";

interface SimpleDashboardProps {
  navigate: (page: string) => void;
}

export default function SimpleDashboard({ navigate }: SimpleDashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Helix Dashboard</h1>
          <div className="text-sm text-gray-500">MedTech Intelligence Platform</div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/regulatory-updates')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Regulatory Updates</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">147</div>
              <p className="text-xs text-muted-foreground">+12% von letztem Monat</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/data-collection')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Collection</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89%</div>
              <p className="text-xs text-muted-foreground">Completion Rate</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/analytics')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Analytics</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,345</div>
              <p className="text-xs text-muted-foreground">Total Documents</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/user-management')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">Active Users</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => navigate('/knowledge-base')}
              className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium">Knowledge Base</div>
              <div className="text-sm text-gray-500">Browse regulatory information</div>
            </button>
            
            <button 
              onClick={() => navigate('/chat-support')}
              className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium">Support Chat</div>
              <div className="text-sm text-gray-500">Get help and support</div>
            </button>
            
            <button 
              onClick={() => navigate('/regulatory-updates')}
              className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium">Latest Updates</div>
              <div className="text-sm text-gray-500">View recent changes</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}