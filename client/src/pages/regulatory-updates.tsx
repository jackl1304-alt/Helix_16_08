import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Filter, Download, AlertCircle } from "lucide-react";
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
  deviceClasses?: string[];
  categories?: string[];
}

const priorityColors = {
  urgent: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  low: 'bg-blue-50 text-blue-700 border-blue-200'
};

const updateTypeColors = {
  guidance: 'bg-blue-100 text-blue-800',
  standard: 'bg-green-100 text-green-800',
  recall: 'bg-red-100 text-red-800',
  approval: 'bg-green-100 text-green-800',
  variation: 'bg-yellow-100 text-yellow-800'
};

export default function RegulatoryUpdates() {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: updates, isLoading } = useQuery<RegulatoryUpdate[]>({
    queryKey: ["/api/regulatory-updates", { 
      region: selectedRegion === 'all' ? undefined : selectedRegion,
      priority: selectedPriority === 'all' ? undefined : selectedPriority,
      limit: 50 
    }],
  });

  const filteredUpdates = updates?.filter(update => 
    searchQuery === '' || 
    update.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    update.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onSearch={handleSearch} />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="grid gap-4">
                {[...Array(5)].map((_, i) => (
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
      <Header onSearch={handleSearch} />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Regulatory Updates</h1>
              <p className="text-gray-600 mt-1">Track global MedTech regulatory changes and requirements</p>
            </div>

            <Tabs defaultValue="all" className="space-y-6">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="all">All Updates</TabsTrigger>
                  <TabsTrigger value="urgent">Urgent</TabsTrigger>
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                </TabsList>
                
                <div className="flex space-x-4">
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Advanced Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
                      <Input
                        placeholder="Search updates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Region</label>
                      <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Regions</SelectItem>
                          <SelectItem value="US">United States (FDA)</SelectItem>
                          <SelectItem value="EU">European Union (EMA)</SelectItem>
                          <SelectItem value="UK">United Kingdom (MHRA)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Priority</label>
                      <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priorities</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-end">
                      <Button className="w-full">
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <TabsContent value="all" className="space-y-4">
                {!updates || updates.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Regulatory Updates</h3>
                      <p className="text-gray-600 mb-6">No regulatory updates have been collected yet.</p>
                      <p className="text-sm text-gray-500">Data collection may still be in progress or no new updates are available.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredUpdates.map((update) => (
                      <Card key={update.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <h3 className="text-lg font-semibold text-gray-900">{update.title}</h3>
                                <Badge variant="outline" className={priorityColors[update.priority]}>
                                  {update.priority.toUpperCase()}
                                </Badge>
                                <Badge variant="outline" className={updateTypeColors[update.updateType as keyof typeof updateTypeColors] || 'bg-gray-100 text-gray-800'}>
                                  {update.updateType}
                                </Badge>
                              </div>
                              
                              <p className="text-gray-600 mb-4 leading-relaxed">{update.description}</p>
                              
                              <div className="flex items-center space-x-6 text-sm text-gray-500">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">Region:</span>
                                  <Badge variant="outline">{update.region}</Badge>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">Published:</span>
                                  <span>{new Date(update.publishedAt).toLocaleDateString()}</span>
                                </div>
                                
                                {update.deviceClasses && update.deviceClasses.length > 0 && (
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium">Device Classes:</span>
                                    <div className="flex space-x-1">
                                      {update.deviceClasses.slice(0, 2).map((deviceClass, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                          {deviceClass}
                                        </Badge>
                                      ))}
                                      {update.deviceClasses.length > 2 && (
                                        <span className="text-xs text-gray-400">+{update.deviceClasses.length - 2} more</span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {update.categories && update.categories.length > 0 && (
                                <div className="mt-3 flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-500">Categories:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {update.categories.slice(0, 4).map((category, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {category}
                                      </Badge>
                                    ))}
                                    {update.categories.length > 4 && (
                                      <span className="text-xs text-gray-400">+{update.categories.length - 4} more</span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex space-x-2 ml-4">
                              {update.sourceUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(update.sourceUrl, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {filteredUpdates.length === 0 && searchQuery && (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <p className="text-gray-500">No updates match your search criteria.</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="urgent" className="space-y-4">
                <div className="space-y-4">
                  {filteredUpdates
                    .filter(update => update.priority === 'urgent' || update.priority === 'high')
                    .map((update) => (
                      <Card key={update.id} className="border-red-200 bg-red-50">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <h3 className="text-lg font-semibold text-gray-900">{update.title}</h3>
                                <Badge className="bg-red-100 text-red-800">
                                  {update.priority.toUpperCase()}
                                </Badge>
                              </div>
                              
                              <p className="text-gray-600 mb-4">{update.description}</p>
                              
                              <div className="flex items-center space-x-6 text-sm text-gray-500">
                                <span>Region: {update.region}</span>
                                <span>Published: {new Date(update.publishedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            {update.sourceUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(update.sourceUrl, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="recent" className="space-y-4">
                <div className="space-y-4">
                  {filteredUpdates
                    .filter(update => {
                      const updateDate = new Date(update.createdAt);
                      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                      return updateDate > sevenDaysAgo;
                    })
                    .map((update) => (
                      <Card key={update.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <h3 className="text-lg font-semibold text-gray-900">{update.title}</h3>
                                <Badge variant="outline" className={priorityColors[update.priority]}>
                                  {update.priority.toUpperCase()}
                                </Badge>
                                <Badge variant="outline" className="bg-green-100 text-green-800">
                                  NEW
                                </Badge>
                              </div>
                              
                              <p className="text-gray-600 mb-4">{update.description}</p>
                              
                              <div className="flex items-center space-x-6 text-sm text-gray-500">
                                <span>Region: {update.region}</span>
                                <span>Published: {new Date(update.publishedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            {update.sourceUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(update.sourceUrl, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
