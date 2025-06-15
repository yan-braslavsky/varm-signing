import React from 'react';
import { Heart, Leaf } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="ftr-container bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="ftr-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="ftr-grid grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="ftr-brand">
            <div className="ftr-logo flex items-center space-x-2 mb-4">
              <div className="ftr-icon-wrapper bg-green-600 rounded-lg p-2">
                <Leaf className="ftr-icon h-5 w-5 text-white" />
              </div>
              <span className="ftr-brand-text text-lg font-bold text-gray-900">
                VARM
              </span>
            </div>
            <p className="ftr-description text-sm text-gray-600">
              Climate-tech offer signing platform for sustainable investments.
            </p>
          </div>

          {/* Quick Links */}
          <div className="ftr-links">
            <h3 className="ftr-links-title text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Quick Links
            </h3>
            <ul className="ftr-links-list space-y-2">
              <li>
                <a href="/offers" className="ftr-link text-sm text-gray-600 hover:text-green-600 transition-colors">
                  View Offers
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="ftr-legal">
            <h3 className="ftr-legal-title text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Legal
            </h3>
            <ul className="ftr-legal-list space-y-2">
              <li>
                <a href="#" className="ftr-link text-sm text-gray-600 hover:text-green-600 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="ftr-link text-sm text-gray-600 hover:text-green-600 transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="ftr-bottom border-t border-gray-200 pt-6 mt-8">
          <div className="ftr-bottom-content flex flex-col sm:flex-row justify-between items-center">
            <p className="ftr-copyright text-sm text-gray-500">
              © {currentYear} VARM. All rights reserved.
            </p>
            <p className="ftr-credit flex items-center text-sm text-gray-500 mt-2 sm:mt-0">
              Made with <Heart className="ftr-heart h-4 w-4 text-red-500 mx-1" /> for the planet
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
