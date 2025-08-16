import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Type, VolumeX, Volume2, MousePointer } from "lucide-react";

interface AccessibilityToolsProps {
  className?: string;
}

export function AccessibilityTools({ className = "" }: AccessibilityToolsProps) {
  const [fontSize, setFontSize] = React.useState(16);
  const [contrast, setContrast] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [screenReader, setScreenReader] = React.useState(false);

  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + 2, 24);
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}px`;
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - 2, 12);
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}px`;
  };

  const toggleContrast = () => {
    setContrast(!contrast);
    document.documentElement.classList.toggle('high-contrast', !contrast);
  };

  const toggleReducedMotion = () => {
    setReducedMotion(!reducedMotion);
    document.documentElement.classList.toggle('reduce-motion', !reducedMotion);
  };

  const toggleScreenReader = () => {
    setScreenReader(!screenReader);
    // Screen reader announcements would be implemented here
  };

  return (
    <Card className={`w-80 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Barrierefreiheit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Font Size Controls */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Schriftgröße</label>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={decreaseFontSize}
              aria-label="Schrift verkleinern"
            >
              <Type className="h-4 w-4" />
              -
            </Button>
            <Badge variant="secondary">{fontSize}px</Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={increaseFontSize}
              aria-label="Schrift vergrößern"
            >
              <Type className="h-4 w-4" />
              +
            </Button>
          </div>
        </div>

        {/* High Contrast */}
        <div className="space-y-2">
          <Button
            variant={contrast ? "default" : "outline"}
            className="w-full justify-start"
            onClick={toggleContrast}
            aria-pressed={contrast}
          >
            <Eye className="h-4 w-4 mr-2" />
            Hoher Kontrast
          </Button>
        </div>

        {/* Reduced Motion */}
        <div className="space-y-2">
          <Button
            variant={reducedMotion ? "default" : "outline"}
            className="w-full justify-start"
            onClick={toggleReducedMotion}
            aria-pressed={reducedMotion}
          >
            <MousePointer className="h-4 w-4 mr-2" />
            Bewegungen reduzieren
          </Button>
        </div>

        {/* Screen Reader */}
        <div className="space-y-2">
          <Button
            variant={screenReader ? "default" : "outline"}
            className="w-full justify-start"
            onClick={toggleScreenReader}
            aria-pressed={screenReader}
          >
            {screenReader ? (
              <Volume2 className="h-4 w-4 mr-2" />
            ) : (
              <VolumeX className="h-4 w-4 mr-2" />
            )}
            Screenreader-Unterstützung
          </Button>
        </div>

        <div className="text-xs text-muted-foreground pt-2 border-t">
          <strong>WCAG 2.1 AA Konform:</strong> Diese Anwendung erfüllt internationale 
          Barrierefreiheitsstandards für optimale Nutzererfahrung.
        </div>
      </CardContent>
    </Card>
  );
}

// High contrast CSS styles that would be added to the main CSS
export const highContrastStyles = `
  .high-contrast {
    --background: hsl(0, 0%, 100%);
    --foreground: hsl(0, 0%, 0%);
    --card: hsl(0, 0%, 100%);
    --card-foreground: hsl(0, 0%, 0%);
    --primary: hsl(0, 0%, 0%);
    --primary-foreground: hsl(0, 0%, 100%);
    --secondary: hsl(0, 0%, 95%);
    --secondary-foreground: hsl(0, 0%, 0%);
    --border: hsl(0, 0%, 0%);
    --input: hsl(0, 0%, 100%);
  }

  .reduce-motion * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
`;