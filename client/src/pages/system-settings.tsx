import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Database, Mail, Shield, Activity } from "lucide-react";

export default function SystemSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">
            Configure system parameters and preferences
          </p>
        </div>
        <Badge variant="outline" className="text-blue-600 border-blue-600">
          <Activity className="h-3 w-3 mr-1" />
          Configuration Mode
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Database Settings
            </CardTitle>
            <CardDescription>Database connection and performance settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Connection Status</span>
                <Badge variant="outline" className="text-green-600">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pool Size</span>
                <span className="text-sm text-muted-foreground">20 connections</span>
              </div>
              <Button variant="outline" size="sm">Configure Database</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Email Configuration
            </CardTitle>
            <CardDescription>SMTP and notification settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">SMTP Status</span>
                <Badge variant="outline" className="text-yellow-600">Maintenance</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Queue Size</span>
                <span className="text-sm text-muted-foreground">12 pending</span>
              </div>
              <Button variant="outline" size="sm">Configure Email</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security Settings
            </CardTitle>
            <CardDescription>Authentication and access control</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Two-Factor Auth</span>
                <Badge variant="outline" className="text-green-600">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Session Timeout</span>
                <span className="text-sm text-muted-foreground">8 hours</span>
              </div>
              <Button variant="outline" size="sm">Security Settings</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              General Settings
            </CardTitle>
            <CardDescription>Application preferences and defaults</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Theme</span>
                <span className="text-sm text-muted-foreground">System</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Language</span>
                <span className="text-sm text-muted-foreground">Deutsch</span>
              </div>
              <Button variant="outline" size="sm">General Settings</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}