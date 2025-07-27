import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Send, Edit, Trash2, Calendar, Users, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Newsletter {
  id: string;
  title: string;
  content: string;
  htmlContent?: string;
  status: 'pending' | 'approved' | 'rejected';
  scheduledFor?: string;
  sentAt?: string;
  subscriberCount: number;
  createdAt: string;
}

interface Subscriber {
  id: string;
  email: string;
  name?: string;
  isActive: boolean;
  preferences?: any;
  subscribedAt: string;
}

export default function NewsletterManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newNewsletterData, setNewNewsletterData] = useState({
    title: '',
    content: '',
    scheduledFor: ''
  });

  const { data: newsletters, isLoading: newslettersLoading } = useQuery<Newsletter[]>({
    queryKey: ["/api/newsletters"],
  });

  const { data: subscribers, isLoading: subscribersLoading } = useQuery<Subscriber[]>({
    queryKey: ["/api/subscribers"],
  });

  const createNewsletterMutation = useMutation({
    mutationFn: async (newsletterData: any) => {
      await apiRequest("POST", "/api/newsletters", newsletterData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/newsletters"] });
      setIsCreateDialogOpen(false);
      setNewNewsletterData({ title: '', content: '', scheduledFor: '' });
      toast({
        title: "Newsletter Created",
        description: "Your newsletter has been created and is pending approval.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create newsletter.",
        variant: "destructive",
      });
    },
  });

  const sendNewsletterMutation = useMutation({
    mutationFn: async (newsletterId: string) => {
      await apiRequest("POST", `/api/newsletters/${newsletterId}/send`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/newsletters"] });
      toast({
        title: "Newsletter Sent",
        description: "The newsletter has been sent to all active subscribers.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send newsletter.",
        variant: "destructive",
      });
    },
  });

  const handleCreateNewsletter = () => {
    if (!newNewsletterData.title || !newNewsletterData.content) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createNewsletterMutation.mutate({
      title: newNewsletterData.title,
      content: newNewsletterData.content,
      scheduledFor: newNewsletterData.scheduledFor ? new Date(newNewsletterData.scheduledFor) : undefined,
      status: 'pending'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (newslettersLoading || subscribersLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="grid gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Newsletter Manager</h1>
              <p className="text-gray-600 mt-1">Create and manage regulatory intelligence newsletters</p>
            </div>

            <Tabs defaultValue="newsletters" className="space-y-6">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="newsletters">Newsletters</TabsTrigger>
                  <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>
                
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Newsletter
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Newsletter</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Newsletter Title</Label>
                        <Input
                          id="title"
                          value={newNewsletterData.title}
                          onChange={(e) => setNewNewsletterData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Weekly MedTech Regulatory Updates"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                          id="content"
                          value={newNewsletterData.content}
                          onChange={(e) => setNewNewsletterData(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Enter newsletter content..."
                          rows={8}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="scheduledFor">Schedule For (Optional)</Label>
                        <Input
                          id="scheduledFor"
                          type="datetime-local"
                          value={newNewsletterData.scheduledFor}
                          onChange={(e) => setNewNewsletterData(prev => ({ ...prev, scheduledFor: e.target.value }))}
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateNewsletter} disabled={createNewsletterMutation.isPending}>
                          Create Newsletter
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <TabsContent value="newsletters" className="space-y-6">
                {!newsletters || newsletters.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Newsletters</h3>
                      <p className="text-gray-600 mb-6">You haven't created any newsletters yet.</p>
                      <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Newsletter
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {newsletters.map((newsletter) => (
                      <Card key={newsletter.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <h3 className="text-lg font-semibold text-gray-900">{newsletter.title}</h3>
                                {getStatusBadge(newsletter.status)}
                              </div>
                              
                              <p className="text-gray-600 mb-4 line-clamp-3">
                                {newsletter.content.length > 200 
                                  ? newsletter.content.substring(0, 200) + '...'
                                  : newsletter.content
                                }
                              </p>
                              
                              <div className="flex items-center space-x-6 text-sm text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>Created: {new Date(newsletter.createdAt).toLocaleDateString()}</span>
                                </div>
                                
                                <div className="flex items-center space-x-1">
                                  <Users className="h-4 w-4" />
                                  <span>Subscribers: {newsletter.subscriberCount}</span>
                                </div>
                                
                                {newsletter.scheduledFor && (
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>Scheduled: {new Date(newsletter.scheduledFor).toLocaleDateString()}</span>
                                  </div>
                                )}
                                
                                {newsletter.sentAt && (
                                  <div className="flex items-center space-x-1">
                                    <Send className="h-4 w-4" />
                                    <span>Sent: {new Date(newsletter.sentAt).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex space-x-2 ml-4">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              {newsletter.status === 'approved' && !newsletter.sentAt && (
                                <Button
                                  size="sm"
                                  onClick={() => sendNewsletterMutation.mutate(newsletter.id)}
                                  disabled={sendNewsletterMutation.isPending}
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                              )}
                              
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="subscribers" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Subscriber Management</h2>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Subscriber
                  </Button>
                </div>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Active Subscribers</h3>
                      <Badge className="bg-blue-100 text-blue-800">
                        {subscribers?.filter(s => s.isActive).length || 0} Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!subscribers || subscribers.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">No subscribers yet</p>
                        <p className="text-sm text-gray-400 mt-1">Add subscribers to start sending newsletters</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {subscribers.filter(s => s.isActive).slice(0, 10).map((subscriber) => (
                          <div key={subscriber.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{subscriber.name || subscriber.email}</p>
                              <p className="text-sm text-gray-600">{subscriber.email}</p>
                              <p className="text-xs text-gray-500">
                                Subscribed: {new Date(subscriber.subscribedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600">
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                        
                        {subscribers.filter(s => s.isActive).length > 10 && (
                          <div className="text-center py-4">
                            <Button variant="outline">
                              View All {subscribers.filter(s => s.isActive).length} Subscribers
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-gray-900">
                          {newsletters?.length || 0}
                        </h3>
                        <p className="text-sm text-gray-600">Total Newsletters</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-gray-900">
                          {newsletters?.filter(n => n.sentAt).length || 0}
                        </h3>
                        <p className="text-sm text-gray-600">Newsletters Sent</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-gray-900">
                          {subscribers?.filter(s => s.isActive).length || 0}
                        </h3>
                        <p className="text-sm text-gray-600">Active Subscribers</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Newsletter Performance</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                      <p>Analytics data will appear here once newsletters are sent</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
