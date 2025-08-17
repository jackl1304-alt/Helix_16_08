import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Scale, Calendar, MapPin, TrendingUp, AlertTriangle } from "lucide-react";
import { useLegalCases } from "@/hooks/useCleanData";

export default function RechtsprechungKompaktClean() {
  const { data: legalData, isLoading, error } = useLegalCases();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Rechtsprechung Kompakt</h1>
        </div>
        <div className="text-center py-8">Lade Rechtsfälle...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Rechtsprechung Kompakt</h1>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Fehler beim Laden der Rechtsfälle: {error.message}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const legalCases = legalData?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Rechtsprechung Kompakt</h1>
          <p className="text-gray-600 mt-2">
            Aktuelle Rechtsfälle und Urteile im Bereich Medizintechnik
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          {legalCases.length} Rechtsfälle
        </Badge>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Suche in Rechtsfällen..." 
                className="pl-10"
              />
            </div>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="ongoing">Laufend</SelectItem>
                <SelectItem value="resolved">Abgeschlossen</SelectItem>
                <SelectItem value="pending">Anhängig</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Relevanz filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Relevanz</SelectItem>
                <SelectItem value="high">Hoch</SelectItem>
                <SelectItem value="medium">Mittel</SelectItem>
                <SelectItem value="low">Niedrig</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gesamt Rechtsfälle</p>
                <p className="text-2xl font-bold text-blue-600">{legalCases.length}</p>
              </div>
              <Scale className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Laufende Verfahren</p>
                <p className="text-2xl font-bold text-orange-600">
                  {legalCases.filter(c => c.status === 'ongoing').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hohe Relevanz</p>
                <p className="text-2xl font-bold text-red-600">
                  {legalCases.filter(c => c.relevance === 'high').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Abgeschlossen</p>
                <p className="text-2xl font-bold text-green-600">
                  {legalCases.filter(c => c.status === 'resolved').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legal Cases List */}
      <div className="space-y-4">
        {legalCases.map((legalCase: {
          id: string;
          title: string;
          description: string;
          court: string;
          date: string;
          status: string;
          relevance: string;
          deviceType: string;
        }) => (
          <Card key={legalCase.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{legalCase.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {legalCase.description}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge 
                    variant={legalCase.status === 'ongoing' ? 'default' : 'secondary'}
                  >
                    {legalCase.status === 'ongoing' ? 'Laufend' : 
                     legalCase.status === 'resolved' ? 'Abgeschlossen' : 'Anhängig'}
                  </Badge>
                  <Badge 
                    variant={legalCase.relevance === 'high' ? 'destructive' : 
                             legalCase.relevance === 'medium' ? 'default' : 'secondary'}
                  >
                    {legalCase.relevance === 'high' ? 'Hoch' :
                     legalCase.relevance === 'medium' ? 'Mittel' : 'Niedrig'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Scale className="h-4 w-4" />
                    <span>{legalCase.court}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(legalCase.date).toLocaleDateString('de-DE')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{legalCase.deviceType}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Details anzeigen
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {legalCases.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Keine Rechtsfälle gefunden
            </h3>
            <p className="text-gray-600">
              Es wurden keine Rechtsfälle gefunden, die Ihren Suchkriterien entsprechen.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}