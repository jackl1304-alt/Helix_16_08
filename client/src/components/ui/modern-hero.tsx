import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, Award, ChevronDown } from "lucide-react";

interface ModernHeroProps {
  title: string;
  subtitle: string;
  badges?: Array<{
    icon: React.ComponentType<any>;
    text: string;
    color: string;
  }>;
  onScroll?: () => void;
}

export function ModernHero({ title, subtitle, badges = [], onScroll }: ModernHeroProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 text-center py-24 px-6">
        {/* Hero Icon */}
        <div className="emotional-float mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-2xl shadow-xl flex items-center justify-center mb-8">
          <Sparkles className="h-10 w-10 text-white" />
        </div>

        {/* Large Hero Headline */}
        <h1 className="headline-hero mb-8">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-12">
          {subtitle}
        </p>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {badges.map((badge, index) => {
              const IconComponent = badge.icon;
              return (
                <Badge 
                  key={index}
                  variant="outline" 
                  className={`emotional-pulse px-6 py-3 text-base ${badge.color}`}
                >
                  <IconComponent className="h-5 w-5 mr-2" />
                  {badge.text}
                </Badge>
              );
            })}
          </div>
        )}

        {/* Call to Action */}
        {onScroll && (
          <Button
            onClick={onScroll}
            variant="ghost"
            size="lg"
            className="emotional-float text-muted-foreground hover:text-foreground"
            aria-label="Scroll to content"
          >
            <ChevronDown className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent"></div>
    </div>
  );
}

// Animation styles that should be added to the main CSS
export const heroAnimationStyles = `
  @keyframes blob {
    0% {
      transform: translate(0px, 0px) scale(1);
    }
    33% {
      transform: translate(30px, -50px) scale(1.1);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
    100% {
      transform: translate(0px, 0px) scale(1);
    }
  }

  .animate-blob {
    animation: blob 7s infinite;
  }

  .animation-delay-2000 {
    animation-delay: 2s;
  }

  .animation-delay-4000 {
    animation-delay: 4s;
  }
`;