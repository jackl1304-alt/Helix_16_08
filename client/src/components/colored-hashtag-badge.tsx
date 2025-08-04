import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ColoredHashtagBadgeProps {
  tag: string;
  className?: string;
}

const getHashtagColor = (tag: string): string => {
  // Critical/High Impact Tags - Red
  if (tag.includes('Critical') || tag.includes('HighImpact') || tag.includes('Urgent') || tag.includes('Historic') || tag.includes('CriticalRisk')) {
    return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
  }
  
  // Major Updates/Reforms - Orange  
  if (tag.includes('Major') || tag.includes('Reform') || tag.includes('Comprehensive') || tag.includes('Revolution') || tag.includes('€150-200M')) {
    return 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200';
  }
  
  // Innovation/Tech - Blue
  if (tag.includes('Innovation') || tag.includes('Tech') || tag.includes('AI') || tag.includes('Digital') || tag.includes('SaMD') || tag.includes('KI')) {
    return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
  }
  
  // Success/Performance Metrics - Green
  if (tag.includes('%') || tag.includes('Accuracy') || tag.includes('Faster') || tag.includes('Success') || tag.includes('Prevented') || tag.includes('Leader')) {
    return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
  }
  
  // Compliance/Regulatory - Purple
  if (tag.includes('Compliance') || tag.includes('FDA') || tag.includes('MDR') || tag.includes('ISO') || tag.includes('Approved') || tag.includes('Regulation')) {
    return 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200';
  }
  
  // Financial/Business - Yellow
  if (tag.includes('Cost') || tag.includes('Market') || tag.includes('Business') || tag.includes('€') || tag.includes('AUD') || tag.includes('Years')) {
    return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200';
  }
  
  // Healthcare/Medical - Teal
  if (tag.includes('Health') || tag.includes('Medical') || tag.includes('Patient') || tag.includes('Clinical') || tag.includes('Pharma')) {
    return 'bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-200';
  }
  
  // Time/Speed - Indigo
  if (tag.includes('Month') || tag.includes('Hour') || tag.includes('Time') || tag.includes('Fast') || tag.includes('Quick')) {
    return 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200';
  }
  
  // Default - Gray
  return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
};

export function ColoredHashtagBadge({ tag, className }: ColoredHashtagBadgeProps) {
  const colorClass = getHashtagColor(tag);
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        'text-xs font-medium transition-colors duration-200 cursor-default px-2 py-1 whitespace-nowrap',
        colorClass,
        className
      )}
    >
      {tag}
    </Badge>
  );
}