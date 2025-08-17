import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Globe, Activity, Filter } from "lucide-react";

export default function RegulatoryUpdates() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Regulatory Updates</h1>
          <p className="text-muted-foreground">
            Latest regulatory changes and compliance updates
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Activity className="h-3 w-3 mr-1" />
            Live Updates
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Updates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">+23 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jurisdictions</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">Global coverage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Updates */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Regulatory Updates</CardTitle>
          <CardDescription>
            Latest updates from regulatory authorities worldwide
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 border rounded-lg">
              <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">FDA Medical Device Safety Communication</h4>
                  <Badge variant="destructive" size="sm">Critical</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  New safety requirements for implantable cardiac devices
                </p>
                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  2 hours ago
                  <Globe className="h-3 w-3 ml-4 mr-1" />
                  United States
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 border rounded-lg">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">EU MDR Implementation Update</h4>
                  <Badge variant="secondary" size="sm">Important</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Extended deadlines for legacy device transition
                </p>
                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  4 hours ago
                  <Globe className="h-3 w-3 ml-4 mr-1" />
                  European Union
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 border rounded-lg">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Health Canada Guidance Document</h4>
                  <Badge variant="outline" size="sm">Standard</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Updated quality system requirements for medical devices
                </p>
                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  6 hours ago
                  <Globe className="h-3 w-3 ml-4 mr-1" />
                  Canada
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 border rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">TGA Consultation Paper</h4>
                  <Badge variant="outline" size="sm">Info</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Proposed changes to therapeutic goods regulations
                </p>
                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  8 hours ago
                  <Globe className="h-3 w-3 ml-4 mr-1" />
                  Australia
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}