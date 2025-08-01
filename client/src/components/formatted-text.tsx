import React from 'react';

interface FormattedTextProps {
  text: string;
  className?: string;
  maxLength?: number;
}

export const FormattedText = React.memo(({ text, className = "", maxLength }: FormattedTextProps) => {
  if (!text) return null;

  // Kürze Text wenn maxLength gesetzt ist
  const displayText = maxLength && text.length > maxLength 
    ? text.substring(0, maxLength) + '...' 
    : text;

  // Formatiere Text in gut lesbare Absätze
  const formatTextIntoSections = (text: string): string[] => {
    // Entferne überschüssige Leerzeichen und normalisiere
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    // Teile bei natürlichen Absätzen auf
    let sections = cleanText.split(/\n\s*\n|\. (?=[A-Z])/);
    
    // Falls keine natürlichen Absätze vorhanden, teile bei Satzenden
    if (sections.length === 1 && cleanText.length > 300) {
      sections = cleanText.split(/\. (?=[A-Z][^.]*[.!?])/);
    }
    
    // Stelle sicher, dass Abschnitte nicht zu kurz oder zu lang sind
    const optimizedSections: string[] = [];
    let currentSection = '';
    
    sections.forEach(section => {
      const trimmedSection = section.trim();
      if (!trimmedSection) return;
      
      // Füge Punkt hinzu wenn er fehlt
      const sectionWithPeriod = trimmedSection.endsWith('.') || trimmedSection.endsWith('!') || trimmedSection.endsWith('?')
        ? trimmedSection
        : trimmedSection + '.';
      
      // Wenn aktueller Abschnitt + neuer Abschnitt < 150 Zeichen, kombiniere sie
      if (currentSection.length + sectionWithPeriod.length < 150 && currentSection.length > 0) {
        currentSection += ' ' + sectionWithPeriod;
      } else {
        // Speichere vorherigen Abschnitt falls vorhanden
        if (currentSection) {
          optimizedSections.push(currentSection);
        }
        currentSection = sectionWithPeriod;
      }
    });
    
    // Füge letzten Abschnitt hinzu
    if (currentSection) {
      optimizedSections.push(currentSection);
    }
    
    return optimizedSections.filter(section => section.length > 20); // Filtere sehr kurze Abschnitte
  };

  const sections = formatTextIntoSections(displayText);

  return (
    <div className={`formatted-text space-y-4 ${className}`}>
      {sections.map((section, index) => (
        <p 
          key={index} 
          className="text-sm leading-relaxed text-gray-700 dark:text-gray-300"
        >
          {section}
        </p>
      ))}
    </div>
  );
});

FormattedText.displayName = 'FormattedText';