import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface RegulatoryUpdate {
  id: string;
  title: string;
  description: string;
  region: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  updateType: string;
  sourceUrl?: string;
  publishedAt: string;
  createdAt: string;
}

const priorityColors = {
  urgent: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  low: 'bg-blue-50 text-blue-700 border-blue-200'
};

const priorityLabels = {
  urgent: 'Urgent Priority',
  high: 'High Priority',
  medium: 'Medium Priority',
  low: 'Low Priority'
};

export function RecentUpdates() {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  
  const { data: updates, isLoading } = useQuery<RegulatoryUpdate[]>({
    queryKey: ["/api/regulatory-updates", { region: selectedRegion === 'all' ? undefined : selectedRegion, limit: 10 }],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Regulatory Updates</h2>
            <div className="flex space-x-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-4 w-full mb-3" />
                <div className="flex space-x-4">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!updates || updates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Regulatory Updates</h2>
            <div className="flex space-x-2">
              <Button
                variant={selectedRegion === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRegion('all')}
              >
                All Regions
              </Button>
              <Button
                variant={selectedRegion === 'US' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRegion('US')}
              >
                FDA
              </Button>
              <Button
                variant={selectedRegion === 'EU' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRegion('EU')}
              >
                EMA
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">No regulatory updates found</p>
            <p className="text-sm text-gray-400 mt-1">Data collection may still be in progress</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Regulatory Updates</h2>
          <div className="flex space-x-2">
            <Button
              variant={selectedRegion === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRegion('all')}
            >
              All Regions
            </Button>
            <Button
              variant={selectedRegion === 'US' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRegion('US')}
            >
              FDA
            </Button>
            <Button
              variant={selectedRegion === 'EU' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRegion('EU')}
            >
              EMA
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {updates.map((update) => {
            const timeAgo = new Date(update.createdAt).toLocaleString();
            
            return (
              <div
                key={update.id}
                className={`p-4 rounded-lg border ${priorityColors[update.priority]}`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      update.priority === 'urgent' ? 'bg-red-500' :
                      update.priority === 'high' ? 'bg-red-400' :
                      update.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{update.title}</p>
                      <span className="text-xs text-gray-500">{timeAgo}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{update.description}</p>
                    <div className="flex items-center mt-3 space-x-4">
                      <Badge variant="outline" className={priorityColors[update.priority]}>
                        {priorityLabels[update.priority]}
                      </Badge>
                      <span className="text-xs text-gray-500">Source: {update.region}</span>
                      {update.sourceUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-primary hover:text-primary/80 p-0 h-auto"
                          onClick={() => window.open(update.sourceUrl, '_blank')}
                        >
                          View Details <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 text-center">
          <Button variant="ghost" size="sm">
            View All Updates <ExternalLink className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
