import { useState } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 min-w-[110px] bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-[#b0d4f6] hover:border-[#07233e] transition-colors"
        data-testid="language-selector"
      >
        <Globe className="h-4 w-4 text-[#07233e]" />
        <span className="text-[#07233e] font-medium">
          {currentLanguage?.flag} {currentLanguage?.code.toUpperCase()}
        </span>
        <ChevronDown className={`h-3 w-3 text-[#07233e] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <Card className="absolute top-full right-0 mt-1 w-48 z-50 shadow-lg border border-[#b0d4f6]">
          <CardContent className="p-2">
            {languages.map((lang) => (
              <Button
                key={lang.code}
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLanguage(lang.code as 'de' | 'en');
                  setIsOpen(false);
                }}
                className={`w-full justify-between hover:bg-[#f0f8ff] text-left ${
                  language === lang.code 
                    ? 'bg-[#f0f8ff] text-[#07233e] font-medium' 
                    : 'text-gray-700 hover:text-[#07233e]'
                }`}
                data-testid={`language-option-${lang.code}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
                {language === lang.code && (
                  <Check className="h-4 w-4 text-[#07233e]" />
                )}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}