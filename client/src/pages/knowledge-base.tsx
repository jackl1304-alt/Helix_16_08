import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Book, 
  Search, 
  Plus,
  Edit3,
  Trash2,
  FileText,
  Tag,
  Calendar,
  Eye,
  Download,
  Upload,
  Filter,
  Archive,
  Star,
  ExternalLink,
  Bookmark,
  FolderOpen,
  Users,
  Clock
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'archived';
  views: number;
  rating: number;
  isFavorite: boolean;
  attachments: Attachment[];
  relatedRegulations: string[];
  applicableRegions: string[];
  deviceClasses: string[];
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  articleCount: number;
  color: string;
}

const mockCategories: Category[] = [
  {
    id: "regulatory_guidance",
    name: "Regulatorische Leitfäden",
    description: "Umfassende Anleitungen zu regulatorischen Anforderungen",
    articleCount: 24,
    color: "bg-blue-100 text-blue-800"
  },
  {
    id: "compliance_procedures",
    name: "Compliance-Verfahren",
    description: "Schritt-für-Schritt Anleitungen für Compliance-Prozesse",
    articleCount: 18,
    color: "bg-green-100 text-green-800"
  },
  {
    id: "best_practices",
    name: "Best Practices",
    description: "Bewährte Verfahren und Empfehlungen",
    articleCount: 31,
    color: "bg-purple-100 text-purple-800"
  },
  {
    id: "case_studies",
    name: "Fallstudien",
    description: "Reale Beispiele und Lösungsansätze",
    articleCount: 15,
    color: "bg-orange-100 text-orange-800"
  },
  {
    id: "regulatory_updates",
    name: "Regulatorische Updates",
    description: "Aktuelle Änderungen und neue Anforderungen",
    articleCount: 42,
    color: "bg-red-100 text-red-800"
  },
  {
    id: "templates_checklists",
    name: "Vorlagen & Checklisten",
    description: "Praktische Hilfsmittel für den täglichen Gebrauch",
    articleCount: 27,
    color: "bg-yellow-100 text-yellow-800"
  }
];

const mockArticles: KnowledgeArticle[] = [
  {
    id: "1",
    title: "MDR Implementierung: Vollständiger Leitfaden für Klasse III Geräte",
    content: "Detaillierte Anleitung zur vollständigen Implementierung der EU MDR für Medizinprodukte der Klasse III...",
    excerpt: "Umfassender Leitfaden zur MDR-Implementierung mit praktischen Checklisten und Zeitplänen für Klasse III Medizinprodukte.",
    category: "regulatory_guidance",
    tags: ["MDR", "Klasse III", "EU", "Implementierung", "Compliance"],
    author: "Dr. Maria Schmidt",
    createdAt: "2025-01-20T10:00:00Z",
    updatedAt: "2025-01-25T14:30:00Z",
    status: "published",
    views: 342,
    rating: 4.8,
    isFavorite: true,
    attachments: [
      { id: "1", name: "MDR_Checklist_Class_III.pdf", type: "pdf", size: 2456789, url: "/attachments/mdr_checklist.pdf" },
      { id: "2", name: "Timeline_Template.xlsx", type: "excel", size: 987654, url: "/attachments/timeline.xlsx" }
    ],
    relatedRegulations: ["EU MDR 2017/745", "ISO 13485", "ISO 14971"],
    applicableRegions: ["EU", "Deutschland"],
    deviceClasses: ["Klasse III"]
  },
  {
    id: "2", 
    title: "FDA 510(k) Einreichung: Schritt-für-Schritt Anleitung",
    content: "Komplette Anleitung für erfolgreiche FDA 510(k) Einreichungen mit häufigen Fehlern und deren Vermeidung...",
    excerpt: "Praktischer Leitfaden für FDA 510(k) Einreichungen mit Beispielen, Checklisten und typischen Stolpersteinen.",
    category: "compliance_procedures",
    tags: ["FDA", "510(k)", "USA", "Einreichung", "Predicate Device"],
    author: "James Wilson",
    createdAt: "2025-01-18T08:15:00Z",
    updatedAt: "2025-01-22T16:45:00Z",
    status: "published",
    views: 287,
    rating: 4.6,
    isFavorite: false,
    attachments: [
      { id: "3", name: "510k_Submission_Template.docx", type: "word", size: 1234567, url: "/attachments/510k_template.docx" }
    ],
    relatedRegulations: ["21 CFR 807", "21 CFR 820"],
    applicableRegions: ["USA"],
    deviceClasses: ["Klasse II"]
  },
  {
    id: "3",
    title: "Cybersecurity für Medizinprodukte: Best Practices 2025",
    content: "Aktuelle Best Practices für Cybersecurity in Medizinprodukten basierend auf FDA und EU Anforderungen...",
    excerpt: "Umfassende Cybersecurity-Leitlinien für Medizinprodukte mit praktischen Implementierungsstrategien.",
    category: "best_practices",
    tags: ["Cybersecurity", "FDA", "EU", "Vernetzte Geräte", "Risikomanagement"],
    author: "Dr. Lisa Chen",
    createdAt: "2025-01-15T12:30:00Z", 
    updatedAt: "2025-01-26T09:20:00Z",
    status: "published",
    views: 456,
    rating: 4.9,
    isFavorite: true,
    attachments: [
      { id: "4", name: "Cybersecurity_Framework.pdf", type: "pdf", size: 3456789, url: "/attachments/cybersecurity.pdf" },
      { id: "5", name: "Vulnerability_Assessment_Template.xlsx", type: "excel", size: 678901, url: "/attachments/vulnerability.xlsx" }
    ],
    relatedRegulations: ["FDA Cybersecurity Guidance", "EU MDR", "IEC 62304", "ISO 27001"],
    applicableRegions: ["USA", "EU", "Global"],
    deviceClasses: ["Klasse II", "Klasse III"]
  }
];

export default function KnowledgeBase() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [newArticleDialog, setNewArticleDialog] = useState(false);
  const [newArticle, setNewArticle] = useState({
    title: "",
    content: "",
    category: "",
    tags: "",
    relatedRegulations: ""
  });

  const { data: articles = mockArticles, isLoading: articlesLoading } = useQuery<KnowledgeArticle[]>({
    queryKey: ["/api/knowledge-base/articles"],
    enabled: false // Use mock data
  });

  const { data: categories = mockCategories } = useQuery<Category[]>({
    queryKey: ["/api/knowledge-base/categories"],
    enabled: false // Use mock data  
  });

  const createArticleMutation = useMutation({
    mutationFn: async (article: any) => {
      return await apiRequest("/api/knowledge-base/articles", "POST", article);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge-base/articles"] });
      setNewArticleDialog(false);
      setNewArticle({ title: "", content: "", category: "", tags: "", relatedRegulations: "" });
      toast({
        title: "Artikel erstellt",
        description: "Der Knowledge Base Artikel wurde erfolgreich erstellt."
      });
    }
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ articleId, isFavorite }: { articleId: string; isFavorite: boolean }) => {
      return await apiRequest(`/api/knowledge-base/articles/${articleId}/favorite`, "PATCH", { isFavorite });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge-base/articles"] });
    }
  });

  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleCreateArticle = () => {
    if (newArticle.title && newArticle.content && newArticle.category) {
      createArticleMutation.mutate({
        ...newArticle,
        tags: newArticle.tags.split(',').map(tag => tag.trim()),
        relatedRegulations: newArticle.relatedRegulations.split(',').map(reg => reg.trim())
      });
    }
  };

  const toggleFavorite = (articleId: string, currentFavorite: boolean) => {
    toggleFavoriteMutation.mutate({ articleId, isFavorite: !currentFavorite });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Book className="mr-3 h-8 w-8 text-primary" />
            Knowledge Base
          </h1>
          <p className="text-muted-foreground">
            Zentrale Wissensdatenbank für regulatorische Compliance und Best Practices
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={newArticleDialog} onOpenChange={setNewArticleDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Artikel erstellen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Neuen Artikel erstellen</DialogTitle>
                <DialogDescription>
                  Erstellen Sie einen neuen Knowledge Base Artikel
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Titel</label>
                  <Input
                    value={newArticle.title}
                    onChange={(e) => setNewArticle({...newArticle, title: e.target.value})}
                    placeholder="Artikel-Titel eingeben..."
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Kategorie</label>
                  <Select value={newArticle.category} onValueChange={(value) => setNewArticle({...newArticle, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategorie auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Inhalt</label>
                  <Textarea
                    value={newArticle.content}
                    onChange={(e) => setNewArticle({...newArticle, content: e.target.value})}
                    placeholder="Artikel-Inhalt..."
                    rows={6}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Tags (kommagetrennt)</label>
                  <Input
                    value={newArticle.tags}
                    onChange={(e) => setNewArticle({...newArticle, tags: e.target.value})}
                    placeholder="Tag1, Tag2, Tag3..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Zugehörige Vorschriften (kommagetrennt)</label>
                  <Input
                    value={newArticle.relatedRegulations}
                    onChange={(e) => setNewArticle({...newArticle, relatedRegulations: e.target.value})}
                    placeholder="MDR 2017/745, ISO 13485..."
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setNewArticleDialog(false)}>
                    Abbrechen
                  </Button>
                  <Button onClick={handleCreateArticle} disabled={createArticleMutation.isPending}>
                    {createArticleMutation.isPending ? "Erstelle..." : "Artikel erstellen"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="articles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="articles">Artikel</TabsTrigger>
          <TabsTrigger value="categories">Kategorien</TabsTrigger>
          <TabsTrigger value="favorites">Favoriten</TabsTrigger>
        </TabsList>

        <TabsContent value="articles">
          {/* Search and Filter */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Knowledge Base durchsuchen..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Kategorien</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Articles Grid */}
          <div className="grid gap-6">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <Badge className={categories.find(c => c.id === article.category)?.color || "bg-gray-100 text-gray-800"}>
                        {categories.find(c => c.id === article.category)?.name || article.category}
                      </Badge>
                      {article.status === 'draft' && (
                        <Badge variant="outline">Entwurf</Badge>
                      )}
                      {article.isFavorite && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(article.id, article.isFavorite)}
                      >
                        <Star className={`h-4 w-4 ${article.isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedArticle(article)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl mb-2">{article.title}</CardTitle>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(article.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{article.views} Aufrufe</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4" />
                      <span>{article.rating}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{article.excerpt}</p>

                  {article.tags.length > 0 && (
                    <div>
                      <div className="flex flex-wrap gap-2">
                        {article.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {article.relatedRegulations.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Zugehörige Vorschriften:</p>
                      <div className="flex flex-wrap gap-2">
                        {article.relatedRegulations.map((regulation) => (
                          <Badge key={regulation} variant="outline">
                            <FileText className="h-3 w-3 mr-1" />
                            {regulation}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {article.attachments.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Anhänge:</p>
                      <div className="space-y-1">
                        {article.attachments.map((attachment) => (
                          <div key={attachment.id} className="flex items-center space-x-2 text-sm">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>{attachment.name}</span>
                            <span className="text-muted-foreground">({formatFileSize(attachment.size)})</span>
                            <Button variant="ghost" size="sm">
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex space-x-2">
                      {article.applicableRegions.map((region) => (
                        <Badge key={region} variant="outline" className="text-xs">
                          {region}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="outline" size="sm">
                      Vollständig lesen
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <Book className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Keine Artikel gefunden</h3>
              <p className="text-muted-foreground">
                Passen Sie Ihre Suchkriterien an oder erstellen Sie einen neuen Artikel.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className={category.color} variant="secondary">
                      {category.articleCount} Artikel
                    </Badge>
                    <FolderOpen className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{category.description}</p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    Artikel anzeigen
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="favorites">
          <div className="grid gap-6">
            {articles.filter(article => article.isFavorite).map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        <Star className="h-5 w-5 text-yellow-500 fill-current mr-2" />
                        {article.title}
                      </CardTitle>
                      <p className="text-muted-foreground mt-2">{article.excerpt}</p>
                    </div>
                    <Badge className={categories.find(c => c.id === article.category)?.color || "bg-gray-100 text-gray-800"}>
                      {categories.find(c => c.id === article.category)?.name || article.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{article.author}</span>
                      <span>{formatDate(article.updatedAt)}</span>
                      <span>{article.views} Aufrufe</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Öffnen
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {articles.filter(article => article.isFavorite).length === 0 && (
            <div className="text-center py-12">
              <Bookmark className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Keine Favoriten gespeichert</h3>
              <p className="text-muted-foreground">
                Markieren Sie Artikel mit einem Stern, um sie hier zu sammeln.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedArticle.title}</DialogTitle>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>{selectedArticle.author}</span>
                <span>{formatDate(selectedArticle.createdAt)}</span>
                <span>{selectedArticle.views} Aufrufe</span>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4" />
                  <span>{selectedArticle.rating}</span>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-6">
              <div className="prose max-w-none">
                <p>{selectedArticle.content}</p>
              </div>

              {selectedArticle.attachments.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Anhänge</h4>
                  <div className="space-y-2">
                    {selectedArticle.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{attachment.name}</p>
                            <p className="text-sm text-muted-foreground">{formatFileSize(attachment.size)}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}