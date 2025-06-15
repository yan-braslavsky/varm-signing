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
              Klima-Tech Angebot-Unterzeichnungsplattform für nachhaltige Investitionen.
            </p>
          </div>

          {/* Quick Links */}
          <div className="ftr-links">
            <h3 className="ftr-links-title text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Schnellzugriff
            </h3>
            <ul className="ftr-links-list space-y-2">
              <li>
                <a 
                  href="https://www.varm.earth/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="ftr-link text-sm text-gray-600 hover:text-green-600 transition-colors"
                >
                  VARM Webseite
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="ftr-legal">
            <h3 className="ftr-legal-title text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Rechtliches
            </h3>
            <ul className="ftr-legal-list space-y-2">
              <li>
                <a href="#" className="ftr-link text-sm text-gray-600 hover:text-green-600 transition-colors">
                  Datenschutzerklärung
                </a>
              </li>
              <li>
                <a href="#" className="ftr-link text-sm text-gray-600 hover:text-green-600 transition-colors">
                  Allgemeine Geschäftsbedingungen
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="ftr-bottom border-t border-gray-200 pt-6 mt-8">
          <div className="ftr-bottom-content flex flex-col sm:flex-row justify-between items-center">
            <p className="ftr-copyright text-sm text-gray-500">
              © {currentYear} VARM. Alle Rechte vorbehalten.
            </p>
            <p className="ftr-credit flex items-center text-sm text-gray-500 mt-2 sm:mt-0">
              Mit <Heart className="ftr-heart h-4 w-4 text-red-500 mx-1" /> für den Planeten erstellt
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
