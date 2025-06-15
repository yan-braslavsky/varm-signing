import React from 'react';
import { Link } from 'react-router-dom';
import { FileX, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="bg-white py-12 px-3 sm:py-16 sm:px-6">
      <div className="max-w-md mx-auto text-center">
        {/* 404 Icon */}
        <div className="mb-8 animate-bounce-in">
          <FileX className="w-24 h-24 text-gray-400 mx-auto mb-4" />
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            404 - Seite nicht gefunden
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8">
            Die gesuchte Seite existiert nicht oder wurde verschoben.
          </p>
        </div>

        {/* Navigation Options */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 animate-fade-in">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Wohin möchten Sie gehen?
          </h2>
          
          <div className="space-y-4">
            <Link
              to="/offers"
              className="w-full flex items-center justify-center px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-200"
            >
              <Home className="w-5 h-5 mr-3" />
              Alle Angebote anzeigen
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="text-sm text-gray-500">
            Falls Sie glauben, dass dies ein Fehler ist, kontaktieren Sie bitte den VARM Support.
          </p>
        </div>
      </div>
    </div>
  );
};
