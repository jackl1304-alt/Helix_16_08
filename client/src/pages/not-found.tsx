import React from 'react';
import { Link } from 'wouter';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg mx-auto mb-4">
            <span className="text-white font-bold text-2xl">H</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-xl text-gray-600 mb-4">Page Not Found</h2>
          <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
        </div>
        
        <div className="space-x-4">
          <Link to="/">
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </button>
          </Link>
          <button 
            onClick={() => window.history.back()} 
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}