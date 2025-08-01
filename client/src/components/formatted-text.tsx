
import { cn } from '@/lib/utils';

interface FormattedTextProps {
  content: string;
  className?: string;
  maxHeight?: string;
}

export function FormattedText({ content, className, maxHeight = 'max-h-96' }: FormattedTextProps) {
  return (
    <div className={cn("prose prose-sm max-w-none", maxHeight, "overflow-y-auto", className)}>
      {content
        .split(/\n\s*\n/)
        .map((paragraph, index) => {
          // Skip empty paragraphs
          if (!paragraph.trim()) return null;
          
          // Handle main headers (### or lines in ALL CAPS)
          if (paragraph.includes('###') || (paragraph === paragraph.toUpperCase() && paragraph.length > 10 && !paragraph.includes(':'))) {
            return (
              <h3 key={index} className="font-bold text-blue-900 mt-6 mb-3 first:mt-0 text-lg border-b border-blue-200 pb-1">
                {paragraph.replace(/###/g, '').trim()}
              </h3>
            );
          }
          
          // Handle sub-headers (## or shorter caps lines)
          if (paragraph.includes('##') || (paragraph === paragraph.toUpperCase() && paragraph.length <= 50)) {
            return (
              <h4 key={index} className="font-semibold text-blue-800 mt-5 mb-2 first:mt-0 text-base">
                {paragraph.replace(/##/g, '').trim()}
              </h4>
            );
          }
          
          // Handle phase/step headers (PHASE 1, KATEGORIE I, etc.)
          if (/^(PHASE|KATEGORIE|STEP|TEIL)\s+[IVX0-9]+/i.test(paragraph) || paragraph.includes(' - ')) {
            return (
              <h5 key={index} className="font-semibold text-indigo-700 mt-4 mb-2 text-sm bg-indigo-50 p-2 rounded">
                {paragraph.trim()}
              </h5>
            );
          }
          
          // Handle bullet point lists
          if (paragraph.includes('•') || paragraph.includes('□') || paragraph.includes('✓')) {
            const items = paragraph.split(/\n/).filter(line => line.trim());
            return (
              <div key={index} className="mb-4">
                {items.map((item, itemIndex) => {
                  if (item.includes('•') || item.includes('□') || item.includes('✓')) {
                    return (
                      <div key={itemIndex} className="flex items-start gap-3 mb-2 pl-4">
                        <span className="text-blue-600 mt-1 flex-shrink-0">•</span>
                        <span className="text-gray-700">{item.replace(/[•□✓]/g, '').trim()}</span>
                      </div>
                    );
                  }
                  // Section header within list
                  return (
                    <div key={itemIndex} className="font-medium text-gray-800 mb-2 mt-3">
                      {item.trim()}
                    </div>
                  );
                })}
              </div>
            );
          }
          
          // Handle numbered lists
          if (/^\d+\./.test(paragraph.trim())) {
            const items = paragraph.split(/\n/).filter(line => line.trim());
            return (
              <ol key={index} className="list-decimal list-inside space-y-2 mb-4 pl-4">
                {items.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-gray-700">
                    {item.replace(/^\d+\.\s*/, '').trim()}
                  </li>
                ))}
              </ol>
            );
          }
          
          // Handle checklist items
          if (paragraph.includes('□')) {
            const items = paragraph.split(/\n/).filter(line => line.trim());
            return (
              <div key={index} className="mb-4 bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                {items.map((item, itemIndex) => {
                  if (item.includes('□')) {
                    return (
                      <div key={itemIndex} className="flex items-start gap-3 mb-2">
                        <span className="text-yellow-600 mt-1">☐</span>
                        <span className="text-gray-700">{item.replace(/□/g, '').trim()}</span>
                      </div>
                    );
                  }
                  return (
                    <div key={itemIndex} className="font-medium text-gray-800 mb-2">
                      {item.trim()}
                    </div>
                  );
                })}
              </div>
            );
          }
          
          // Handle bold/emphasis sections
          if (paragraph.includes('**') || paragraph.includes('____')) {
            const formatted = paragraph
              .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900">$1</strong>')
              .replace(/__(.*?)__/g, '<em class="text-blue-700">$1</em>');
            
            return (
              <p key={index} className="mb-3 text-gray-700 leading-relaxed" 
                 dangerouslySetInnerHTML={{ __html: formatted }} />
            );
          }
          
          // Handle data/statistics sections (lines with colons)
          if (paragraph.includes(':') && paragraph.split(':').length >= 2) {
            const items = paragraph.split(/\n/).filter(line => line.trim());
            return (
              <div key={index} className="mb-4 bg-gray-50 p-3 rounded border">
                {items.map((item, itemIndex) => {
                  if (item.includes(':')) {
                    const parts = item.split(':');
                    const label = parts[0];
                    const value = parts.slice(1).join(':');
                    return (
                      <div key={itemIndex} className="flex justify-between items-start mb-1 text-sm">
                        <span className="font-medium text-gray-600">{label?.trim() || ''}:</span>
                        <span className="text-gray-800 text-right ml-4">{value?.trim() || ''}</span>
                      </div>
                    );
                  }
                  return (
                    <div key={itemIndex} className="font-medium text-gray-800 mb-2">
                      {item.trim()}
                    </div>
                  );
                })}
              </div>
            );
          }
          
          // Regular paragraphs
          return (
            <p key={index} className="mb-4 text-gray-700 leading-relaxed">
              {paragraph.trim()}
            </p>
          );
        })}
    </div>
  );
}

// Specific variant for legal content
export function FormattedLegalText({ content, className }: { content: string; className?: string }) {
  return (
    <FormattedText 
      content={content} 
      className={cn("text-sm", className)}
      maxHeight="max-h-80"
    />
  );
}

// Specific variant for regulatory content  
export function FormattedRegulatoryText({ content, className }: { content: string; className?: string }) {
  return (
    <FormattedText 
      content={content} 
      className={cn("", className)}
      maxHeight="max-h-96"
    />
  );
}