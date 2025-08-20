import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BookOpen, Search, Filter, Eye, ExternalLink } from 'lucide-react';

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  source: string;
  category: string;
  tags: string[];
  device_types: string[];
  is_featured: boolean;
  priority: string;
  quality_score: number;
  published_date: string;
  created_at: string;
}

export default function KnowledgeBase() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);

  const { data: articlesData, isLoading, error } = useQuery({
    queryKey: ['/api/knowledge-articles'],
  });

  const articles = articlesData?.articles || [];
  const categories = ['all', 'Regulations', 'Compliance', 'Best Practices', 'Technology', 'Quality'];

  const filteredArticles = articles.filter((article: KnowledgeArticle) => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedArticle(null)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Zurück zur Übersicht</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedArticle.title}
                </h1>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary">{selectedArticle.source}</Badge>
                  <Badge variant={selectedArticle.category === 'Regulations' ? 'destructive' : 'default'}>
                    {selectedArticle.category}
                  </Badge>
                  {selectedArticle.is_featured && <Badge variant="secondary">Featured</Badge>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Zusammenfassung</h2>
                  <p className="text-gray-600 dark:text-gray-400">{selectedArticle.summary}</p>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Vollständiger Inhalt</h2>
                  <div 
                    className="prose dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                  />
                </div>

                {selectedArticle.device_types && selectedArticle.device_types.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Betroffene Geräteklassen</h2>
                    <div className="flex flex-wrap gap-2">
                      {selectedArticle.device_types.map((type: string, index: number) => (
                        <Badge key={index} variant="outline">{type}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Tags</h2>
                    <div className="flex flex-wrap gap-2">
                      {selectedArticle.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary">#{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Zurück zum Dashboard</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Knowledge Base
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {isLoading ? 'Laden...' : `${filteredArticles.length} MedTech Knowledge-Artikel`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Artikel durchsuchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'Alle Kategorien' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Knowledge-Artikel werden geladen...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <div className="text-red-600 mb-4">❌</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Fehler beim Laden
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Die Knowledge-Artikel konnten nicht geladen werden.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Articles Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article: KnowledgeArticle) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">
                      {article.title}
                    </CardTitle>
                    {article.is_featured && (
                      <Badge variant="secondary" className="ml-2">Featured</Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="outline">{article.source}</Badge>
                    <Badge variant={article.category === 'Regulations' ? 'destructive' : 'default'}>
                      {article.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                    {article.summary}
                  </p>
                  
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {article.tags.slice(0, 3).map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                      {article.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{article.tags.length - 3} mehr
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(article.published_date || article.created_at).toLocaleDateString('de-DE')}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => setSelectedArticle(article)}
                      className="flex items-center space-x-1"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Lesen</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredArticles.length === 0 && (
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Keine Artikel gefunden
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Versuchen Sie eine andere Suche oder Kategorie.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}