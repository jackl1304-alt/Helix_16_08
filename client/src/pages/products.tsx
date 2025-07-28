import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Package, 
  Search, 
  Plus, 
  Bot, 
  Edit,
  Trash2,
  AlertTriangle,
  TrendingUp,
  Euro
} from "lucide-react";

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState("all");
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/products', { search: searchQuery, categoryId: selectedCategory !== 'all' ? selectedCategory : undefined }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (selectedCategory !== 'all') params.set('categoryId', selectedCategory);
      if (selectedSupplier !== 'all') params.set('supplierId', selectedSupplier);
      return fetch(`/api/products?${params}`).then(res => res.json());
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: suppliers } = useQuery({
    queryKey: ['/api/suppliers'],
  });

  const optimizeProductMutation = useMutation({
    mutationFn: (productId: string) => 
      apiRequest('/api/ai/optimize-product', {
        method: 'POST',
        body: { productId }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (productId: string) => 
      apiRequest(`/api/products/${productId}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Produktverwaltung
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            KI-gestützte Produktoptimierung und -verwaltung
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={() => {
              fetch('/api/ai/optimize-product', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ allProducts: true })
              });
            }}
          >
            <Bot className="h-4 w-4 mr-2" />
            Alle KI-optimieren
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Neues Produkt
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Produkte suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Kategorie auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                {categories?.map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
              <SelectTrigger>
                <SelectValue placeholder="Lieferant auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Lieferanten</SelectItem>
                {suppliers?.map((supplier: any) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full">
              <Package className="h-4 w-4 mr-2" />
              Filter anwenden
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Product Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt Produkte</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Aktive Produkte</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">KI-Optimiert</CardTitle>
            <Bot className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products?.filter((p: any) => p.aiOptimized).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Automatisch verbessert</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Niedriger Bestand</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products?.filter((p: any) => p.inventory <= p.lowStockThreshold).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Nachbestellung erforderlich</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Durchschnittspreis</CardTitle>
            <Euro className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{products && products.length > 0 
                ? (products.reduce((sum: number, p: any) => sum + parseFloat(p.price), 0) / products.length).toFixed(2)
                : '0.00'
              }
            </div>
            <p className="text-xs text-muted-foreground">Automatisch optimiert</p>
          </CardContent>
        </Card>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products && products.length > 0 ? (
          products.map((product: any) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                    <CardDescription className="mt-2">
                      SKU: {product.sku}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 ml-2">
                    {product.aiOptimized && (
                      <Badge variant="secondary" className="bg-green-50 text-green-700">
                        🤖 KI
                      </Badge>
                    )}
                    <Badge variant={
                      product.status === 'active' ? 'default' :
                      product.status === 'draft' ? 'secondary' : 'destructive'
                    }>
                      {product.status === 'active' ? 'Aktiv' :
                       product.status === 'draft' ? 'Entwurf' : 
                       product.status === 'inactive' ? 'Inaktiv' : product.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Product Image Placeholder */}
                <div className="w-full h-40 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Package className="h-12 w-12 text-gray-400" />
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Preis:</span>
                    <span className="font-bold text-lg">€{parseFloat(product.price).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Bestand:</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${
                        product.inventory <= product.lowStockThreshold 
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`}>
                        {product.inventory}
                      </span>
                      {product.inventory <= product.lowStockThreshold && (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Gewinn:</span>
                    <span className="font-medium text-green-600">
                      {product.cost ? `${(((parseFloat(product.price) - parseFloat(product.cost)) / parseFloat(product.price)) * 100).toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => optimizeProductMutation.mutate(product.id)}
                    disabled={optimizeProductMutation.isPending}
                  >
                    <Bot className="h-4 w-4 mr-2" />
                    KI-Optimieren
                  </Button>
                  
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => deleteProductMutation.mutate(product.id)}
                    disabled={deleteProductMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* AI Insights */}
                {product.aiOptimized && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-medium">KI-Optimierung aktiv</span>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Preis, Titel und Beschreibung wurden automatisch optimiert
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Keine Produkte gefunden
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Fügen Sie Ihr erstes Produkt hinzu oder passen Sie Ihre Suchfilter an.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Erstes Produkt hinzufügen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}