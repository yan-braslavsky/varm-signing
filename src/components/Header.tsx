import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export const Header: React.FC = () => {
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
            {/* Navigation items removed - logo click provides navigation to offers */}
          </nav>
        </div>
      </div>
    </header>
  );
};
