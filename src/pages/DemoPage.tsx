import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { offerApi } from '../api/offerApi';
import type { Offer } from '../types/offer.js';
import { FileText, CheckCircle, DollarSign, ExternalLink } from 'lucide-react';

export const DemoPage: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await offerApi.getAllOffers();
        if (response.data) {
          setOffers(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch offers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-6"></div>
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
          <div className="grid lg-grid-cols-2 gap-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded mb-3 w-1/2"></div>
                <div className="h-16 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            VARM Digital Signing Demo
          </h1>
          <p className="text-gray-600 mb-6">
            Choose an offer to test the digital signing experience
          </p>
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
            <p className="text-sm text-gray-700">
              <strong>Demo Features:</strong> Realistic API delays, error handling, mobile-responsive design, 
              loading states, success animations, and comprehensive edge case coverage.
            </p>
          </div>
        </div>

        {/* Offers Grid */}
        <div className="grid lg-grid-cols-2 gap-8 mb-8">
          {offers.map((offer) => (
            <Link
              key={offer.slug}
              to={`/sign/${offer.slug}`}
              className="block bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transition-all hover-scale-102 hover:shadow-xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-primary-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {offer.customerName}
                    </h3>
                    <p className="text-sm text-gray-600">Slug: {offer.slug}</p>
                  </div>
                </div>
                {offer.isSigned && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-accent-100 text-accent-800 rounded-full text-xs font-medium">
                    <CheckCircle className="w-3 h-3" />
                    <span>Signed</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-accent-600" />
                  <div>
                    <p className="text-sm text-gray-600">Offer Amount</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatAmount(offer.offerAmount)}
                    </p>
                  </div>
                </div>

                {offer.signedAt && (
                  <div className="text-xs text-gray-500">
                    Signed: {new Date(offer.signedAt).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center text-primary-600 text-sm font-medium">
                <span>View Offer</span>
                <ExternalLink className="w-4 h-4 ml-2" />
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 animate-fade-in">
          <p className="text-sm text-gray-500">
            © 2024 VARM Digital Signing Platform - Built with React + TypeScript
          </p>
        </div>
      </div>
    </div>
  );
};
