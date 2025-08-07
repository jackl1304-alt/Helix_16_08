import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Send, Edit, Trash2, Calendar, Users, AlertCircle, Menu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PDFDownloadButton } from "@/components/ui/pdf-download-button";

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
  preferences?: {
    frequency: string;
    topics: string[];
    format: string;
  };
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

  // Newsletter-Artikel aus Knowledge Base abrufen
  const { data: newsletterArticles, isLoading: articlesLoading } = useQuery({
    queryKey: ["/api/knowledge-articles?source=newsletter"],
  });

  // Newsletter-Quellen für Extraktion
  const { data: newsletterSources } = useQuery({
    queryKey: ["/api/newsletter-sources"],
  });

  const createNewsletterMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/newsletters", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/newsletters"] });
      toast({
        title: "Newsletter Created",
        description: "Newsletter has been created successfully.",
      });
      setIsCreateDialogOpen(false);
      setNewNewsletterData({ title: '', content: '', scheduledFor: '' });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create newsletter.",
        variant: "destructive",
      });
    },
  });

  const sendNewsletterMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("POST", `/api/newsletters/${id}/send`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/newsletters"] });
      toast({
        title: "Newsletter Sent",
        description: "Newsletter has been sent to all subscribers.",
      });
    },
    onError: (error) => {
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
        description: "Please provide both title and content.",
        variant: "destructive",
      });
      return;
    }
    createNewsletterMutation.mutate(newNewsletterData);
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
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with menu button */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Newsletter Manager</h1>
              <p className="text-gray-600">Create and manage regulatory intelligence newsletters</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs defaultValue="newsletters" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="newsletters">Newsletters</TabsTrigger>
            <TabsTrigger value="extracted">Extrahierte Artikel</TabsTrigger>
            <TabsTrigger value="sources">Quellen</TabsTrigger>
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

        <TabsContent value="newsletters">
          <div className="grid gap-4">
            {newsletters && newsletters.length > 0 ? (
              newsletters.map((newsletter) => (
                <Card key={newsletter.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{newsletter.title}</h3>
                        <div className="flex items-center space-x-4 mt-2">
                          {getStatusBadge(newsletter.status)}
                          <span className="text-sm text-gray-500">
                            <Calendar className="inline h-4 w-4 mr-1" />
                            {new Date(newsletter.createdAt).toLocaleDateString()}
                          </span>
                          {newsletter.sentAt && (
                            <span className="text-sm text-green-600">
                              <Send className="inline h-4 w-4 mr-1" />
                              Sent {new Date(newsletter.sentAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <PDFDownloadButton 
                          type="newsletter" 
                          id={newsletter.id} 
                          title={`PDF herunterladen: ${newsletter.title}`}
                          variant="outline" 
                          size="sm"
                        />
                        {newsletter.status === 'approved' && !newsletter.sentAt && (
                          <Button
                            size="sm"
                            onClick={() => sendNewsletterMutation.mutate(newsletter.id)}
                            disabled={sendNewsletterMutation.isPending}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Send Now
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 line-clamp-3">{newsletter.content}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Newsletters Yet</h3>
                  <p className="text-gray-500 mb-4">Create your first newsletter to get started.</p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Newsletter
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="subscribers">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Subscribers</h3>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm text-gray-600">
                      {subscribers?.filter(s => s.isActive).length || 0} active
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {subscribers && subscribers.length > 0 ? (
                  <div className="space-y-2">
                    {subscribers.slice(0, 10).map((subscriber) => (
                      <div key={subscriber.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="font-medium">{subscriber.email}</span>
                          {subscriber.name && (
                            <span className="text-gray-500 ml-2">({subscriber.name})</span>
                          )}
                        </div>
                        <Badge variant={subscriber.isActive ? "default" : "secondary"}>
                          {subscriber.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Users className="mx-auto h-8 w-8 mb-2" />
                    <p>No subscribers yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="extracted">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Extrahierte Newsletter-Artikel</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Artikel aus automatischer Newsletter-Extraktion - gespeichert in Knowledge Base
                    </p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {newsletterArticles?.length || 0} Artikel
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {articlesLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-20 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : newsletterArticles && newsletterArticles.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {newsletterArticles.slice(0, 20).map((article: any) => (
                      <div key={article.id} className="flex items-start justify-between p-3 border rounded-lg bg-white hover:bg-gray-50">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">
                            {article.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {article.source || article.authority}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(article.published_at || article.created_at).toLocaleDateString('de-DE')}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {article.summary || article.content?.slice(0, 100) + '...'}
                          </p>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <PDFDownloadButton 
                            type="knowledge-article" 
                            id={article.id} 
                            title={`PDF: ${article.title}`}
                            variant="outline" 
                            size="sm"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(`/knowledge-base?highlight=${article.id}`, '_blank')}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="mx-auto h-8 w-8 mb-2" />
                    <p>Keine Newsletter-Artikel extrahiert</p>
                    <p className="text-xs mt-1">Newsletter-Quellen werden automatisch verarbeitet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sources">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Newsletter-Quellen</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Konfigurierte Newsletter für automatische Inhaltsextraktion
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {newsletterSources?.filter((s: any) => s.isActive).length || 0} aktiv
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {newsletterSources && newsletterSources.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {newsletterSources.map((source: any) => (
                      <div key={source.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm text-gray-900">
                            {source.name}
                          </h4>
                          <Badge 
                            variant={source.isActive ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {source.isActive ? 'Aktiv' : 'Inaktiv'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {source.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{source.frequency || 'Täglich'}</span>
                          <span>{source.subscriberCount || 0} Abonnenten</span>
                        </div>
                        <div className="mt-2">
                          <a 
                            href={source.sourceUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Quelle besuchen →
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Mail className="mx-auto h-8 w-8 mb-2" />
                    <p>Keine Newsletter-Quellen konfiguriert</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {newsletters?.filter(n => n.status === 'pending').length || 0}
                    </h3>
                    <p className="text-sm text-gray-600">Pending Approval</p>
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
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}