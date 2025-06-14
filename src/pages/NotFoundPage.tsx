import React from 'react';
import { Link } from 'react-router-dom';
import { FileX, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Icon */}
        <div className="mb-8 animate-bounce-in">
          <FileX className="w-24 h-24 text-gray-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            404 - Page Not Found
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Navigation Options */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 animate-fade-in">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Where would you like to go?
          </h2>
          
          <div className="space-y-4">
            <Link
              to="/demo"
              className="w-full flex items-center justify-center px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all hover-scale-102 focus-outline-none focus-ring-4 focus-ring-primary-200"
            >
              <Home className="w-5 h-5 mr-3" />
              View All Offers
            </Link>
            
            <Link
              to="/sign/test-offer-123"
              className="w-full flex items-center justify-center px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all hover-scale-102"
            >
              <FileX className="w-5 h-5 mr-3" />
              Try Demo Offer
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="text-sm text-gray-500">
            If you believe this is an error, please contact VARM support.
          </p>
        </div>
      </div>
    </div>
  );
};
