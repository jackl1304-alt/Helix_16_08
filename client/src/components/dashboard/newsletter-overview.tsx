import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Users, Send, ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useLocation } from "wouter";

interface Newsletter {
  id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  sentAt?: string;
  subscriberCount: number;
  createdAt: string;
}

interface Subscriber {
  id: string;
  email: string;
  isActive: boolean;
  subscribedAt: string;
}

export function NewsletterOverview() {
  const [, setLocation] = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: newsletters, isLoading: newslettersLoading } = useQuery<Newsletter[]>({
    queryKey: ["/api/newsletters"],
  });

  const { data: subscribers, isLoading: subscribersLoading } = useQuery<Subscriber[]>({
    queryKey: ["/api/subscribers"],
  });

  const isLoading = newslettersLoading || subscribersLoading;

  const recentNewsletters = newsletters?.slice(0, 3) || [];
  const activeSubscribers = subscribers?.filter(s => s.isActive).length || 0;
  const pendingNewsletters = newsletters?.filter(n => n.status === 'pending').length || 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Newsletter Manager</h2>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                Loading...
              </Badge>
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </div>
          </div>
        </CardHeader>
        {isExpanded && (
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
        )}
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Newsletter Manager</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
              {newsletters?.length || 0} newsletters
            </Badge>
            {pendingNewsletters > 0 && (
              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                {pendingNewsletters} pending
              </Badge>
            )}
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
      <CardContent>
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{newsletters?.length || 0}</div>
              <div className="text-xs text-blue-800">Total</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{activeSubscribers}</div>
              <div className="text-xs text-green-800">Subscribers</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{pendingNewsletters}</div>
              <div className="text-xs text-yellow-800">Pending</div>
            </div>
          </div>

          {/* Recent Newsletters */}
          {recentNewsletters.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Recent Newsletters</h3>
              {recentNewsletters.map((newsletter) => (
                <div key={newsletter.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{newsletter.title}</p>
                    <p className="text-xs text-gray-500">
                      {newsletter.sentAt ? `Sent ${new Date(newsletter.sentAt).toLocaleDateString()}` : 
                       `Created ${new Date(newsletter.createdAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {newsletter.status === 'pending' && (
                      <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">Pending</Badge>
                    )}
                    {newsletter.status === 'approved' && !newsletter.sentAt && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700">Ready</Badge>
                    )}
                    {newsletter.sentAt && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">Sent</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No newsletters state */}
          {(!newsletters || newsletters.length === 0) && (
            <div className="text-center py-6">
              <Mail className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-500 text-sm">No newsletters created yet</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => setLocation("/newsletter-manager")}
            >
              <Mail className="mr-1 h-4 w-4" />
              Manage
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => setLocation("/newsletter-manager")}
            >
              <Send className="mr-1 h-4 w-4" />
              Create New
            </Button>
          </div>
        </div>
      </CardContent>
      )}
    </Card>
  );
}