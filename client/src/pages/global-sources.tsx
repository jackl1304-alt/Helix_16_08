import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Globe, Settings, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { DataSource } from "@shared/schema";

const dataSourceSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  type: z.string().min(1, "Typ ist erforderlich"),
  endpoint: z.string().url("Gültige URL erforderlich").optional(),
  region: z.string().min(1, "Region ist erforderlich"),
  country: z.string().optional(),
  category: z.string().min(1, "Kategorie ist erforderlich"),
  language: z.string().default("en"),
  syncFrequency: z.string().default("daily"),
  isActive: z.boolean().default(true),
});

type DataSourceFormData = z.infer<typeof dataSourceSchema>;

// Vordefinierte globale Datenquellen
const globalSources = [
  // Deutschland
  { name: "BfArM", region: "DE", country: "Germany", category: "regulations", type: "bfarm", language: "de" },
  { name: "DIN Standards", region: "DE", country: "Germany", category: "standards", type: "standards", language: "de" },
  
  // Europa
  { name: "EMA Medicines", region: "EU", category: "regulations", type: "ema", language: "en" },
  { name: "EUR-Lex", region: "EU", category: "rulings", type: "legal", language: "en" },
  { name: "CEN Standards", region: "EU", category: "standards", type: "standards", language: "en" },
  
  // Schweiz
  { name: "Swissmedic", region: "CH", country: "Switzerland", category: "regulations", type: "swissmedic", language: "de" },
  
  // England/UK
  { name: "MHRA", region: "UK", country: "United Kingdom", category: "regulations", type: "mhra", language: "en" },
  { name: "BSI Standards", region: "UK", country: "United Kingdom", category: "standards", type: "standards", language: "en" },
  
  // USA
  { name: "FDA Devices", region: "US", country: "United States", category: "approvals", type: "fda", language: "en" },
  { name: "NIST Standards", region: "US", country: "United States", category: "standards", type: "standards", language: "en" },
  
  // Asien
  { name: "PMDA Japan", region: "JP", country: "Japan", category: "regulations", type: "pmda", language: "ja" },
  { name: "NMPA China", region: "CN", country: "China", category: "regulations", type: "nmpa", language: "zh" },
  { name: "CDSCO India", region: "IN", country: "India", category: "regulations", type: "cdsco", language: "en" },
  
  // Russland
  { name: "Roszdravnadzor", region: "RU", country: "Russia", category: "regulations", type: "roszdravnadzor", language: "ru" },
  
  // Südamerika
  { name: "ANVISA Brazil", region: "BR", country: "Brazil", category: "regulations", type: "anvisa", language: "pt" },
  { name: "ANMAT Argentina", region: "AR", country: "Argentina", category: "regulations", type: "anmat", language: "es" },
];

export default function GlobalSources() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: dataSources = [], isLoading } = useQuery<DataSource[]>({
    queryKey: ["/api/data-sources"],
  });

  const form = useForm<DataSourceFormData>({
    resolver: zodResolver(dataSourceSchema),
    defaultValues: {
      language: "en",
      syncFrequency: "daily",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: DataSourceFormData) => {
      return apiRequest("/api/data-sources", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/data-sources"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Datenquelle hinzugefügt",
        description: "Die neue Datenquelle wurde erfolgreich erstellt.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Fehler beim Erstellen der Datenquelle.",
        variant: "destructive",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      console.log(`Toggling ${id} to ${isActive}`);
      return apiRequest(`/api/data-sources/${id}`, "PATCH", { isActive });
    },
    onMutate: async ({ id, isActive }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/data-sources"] });

      // Snapshot the previous value
      const previousDataSources = queryClient.getQueryData(["/api/data-sources"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["/api/data-sources"], (old: DataSource[] = []) =>
        old.map(source => 
          source.id === id 
            ? { ...source, isActive }
            : source
        )
      );

      // Return a context object with the snapshotted value
      return { previousDataSources };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousDataSources) {
        queryClient.setQueryData(["/api/data-sources"], context.previousDataSources);
      }
      toast({
        title: "Fehler beim Toggle",
        description: "Status konnte nicht geändert werden.",
        variant: "destructive",
      });
    },
    onSuccess: (data, { id, isActive }) => {
      console.log(`Toggle successful for ${id}:`, data);
      toast({
        title: "Datenquelle aktualisiert",
        description: `${isActive ? 'Aktiviert' : 'Deaktiviert'}`,
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ["/api/data-sources"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sync/stats"] });
    },
  });

  const addPredefinedSource = (source: typeof globalSources[0]) => {
    form.reset({
      name: source.name,
      type: source.type,
      region: source.region,
      country: source.country,
      category: source.category,
      language: source.language,
      syncFrequency: "daily",
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: DataSourceFormData) => {
    createMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Globale Datenquellen</h1>
          <p className="text-muted-foreground">
            Verwaltung weltweiter regulatorischer Datenquellen für MedTech-Compliance
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Datenquelle hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Neue Datenquelle</DialogTitle>
              <DialogDescription>
                Fügen Sie eine neue regulatorische Datenquelle hinzu.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. BfArM Deutschland" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Typ</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Typ wählen" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fda">FDA</SelectItem>
                            <SelectItem value="ema">EMA</SelectItem>
                            <SelectItem value="bfarm">BfArM</SelectItem>
                            <SelectItem value="swissmedic">Swissmedic</SelectItem>
                            <SelectItem value="mhra">MHRA</SelectItem>
                            <SelectItem value="pmda">PMDA</SelectItem>
                            <SelectItem value="nmpa">NMPA</SelectItem>
                            <SelectItem value="anvisa">ANVISA</SelectItem>
                            <SelectItem value="standards">Standards</SelectItem>
                            <SelectItem value="legal">Rechtsprechung</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kategorie</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Kategorie" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="regulations">Regulierungen</SelectItem>
                            <SelectItem value="standards">Standards</SelectItem>
                            <SelectItem value="rulings">Rechtsprechung</SelectItem>
                            <SelectItem value="approvals">Zulassungen</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region</FormLabel>
                        <FormControl>
                          <Input placeholder="z.B. DE, EU, US" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sprache</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="de">Deutsch</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="pt">Português</SelectItem>
                            <SelectItem value="zh">中文</SelectItem>
                            <SelectItem value="ja">日本語</SelectItem>
                            <SelectItem value="ru">Русский</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="endpoint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Endpoint (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://api.example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Aktiv</FormLabel>
                        <FormDescription>
                          Automatische Datensammlung aktivieren
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                    Abbrechen
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Wird erstellt..." : "Erstellen"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vordefinierte Quellen */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Vordefinierte globale Quellen</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {globalSources.map((source, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => addPredefinedSource(source)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{source.name}</CardTitle>
                  <Badge variant="outline">{source.region}</Badge>
                </div>
                <CardDescription>
                  {source.category} • {source.country}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Globe className="mr-2 h-4 w-4" />
                  {source.language.toUpperCase()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Konfigurierte Quellen */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Konfigurierte Datenquellen</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dataSources.map((source) => (
            <Card key={source.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{source.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{source.region}</Badge>
                    {source.isActive ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
                <CardDescription>
                  {source.category} • {source.type}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Globe className="mr-2 h-4 w-4" />
                    {source.language?.toUpperCase() || "EN"}
                  </div>
                  <Switch
                    checked={source.isActive || false}
                    onCheckedChange={(checked) => 
                      toggleMutation.mutate({ id: source.id, isActive: checked })
                    }
                    disabled={toggleMutation.isPending}
                  />
                </div>
                {source.lastSyncAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Letzte Synchronisation: {new Date(source.lastSyncAt).toLocaleDateString('de-DE')}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}