import { useState } from "react";
import { Search, Bell, User, Shield, MessageSquare, Globe, LogIn, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <header className="deltaways-header bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: DELTAWAYS Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 flex items-center space-x-3">
              <Badge 
                variant="outline" 
                className="bg-blue-50 text-blue-700 border-blue-200 font-semibold px-3 py-1 deltaways-brand-text"
              >
                📊 Deltaways
              </Badge>
              <span className="text-sm font-medium text-gray-600">Helix Platform</span>
            </div>
          </div>
          
          {/* Right: Actions & User Menu */}
          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <Select defaultValue="de">
              <SelectTrigger className="w-20 h-8 text-xs border-gray-300">
                <span className="text-xs font-medium">🌐 DE</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="de">🇩🇪 DE</SelectItem>
                <SelectItem value="en">🇺🇸 EN</SelectItem>
                <SelectItem value="fr">🇫🇷 FR</SelectItem>
              </SelectContent>
            </Select>

            {/* Customer Area Button - Rechts neben Sprachauswahl */}
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 text-xs px-3 py-1 h-8"
            >
              <UserCheck className="w-3 h-3 mr-1" />
              Customer Area
            </Button>

            {/* Tenant Login Button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="deltaways-button-primary text-xs px-3 py-1 h-8"
            >
              <LogIn className="w-3 h-3 mr-1" />
              Tenant Login
            </Button>

            {/* Chat Button */}
            <Button variant="ghost" size="sm" className="relative p-2 h-8 w-8">
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </Button>
            
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative p-2 h-8 w-8">
              <Bell className="h-4 w-4 text-gray-400" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-3 w-3 p-0 flex items-center justify-center text-xs"
              >
                3
              </Badge>
            </Button>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 p-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32" />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700">Dr. Sarah Chen</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
