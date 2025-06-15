import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();

  return (
    <header className="hdr-container bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="hdr-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="hdr-flex flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link 
            to="/offers" 
            className="hdr-logo flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="hdr-icon-wrapper bg-green-600 rounded-lg p-2">
              <Leaf className="hdr-icon h-6 w-6 text-white" />
            </div>
            <span className="hdr-brand-text text-xl font-bold text-gray-900">
              VARM
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hdr-nav flex items-center space-x-6">
            <Link
              to="/offers"
              className={`hdr-nav-link px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/offers'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Offers
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};
