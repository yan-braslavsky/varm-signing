import React from 'react';
import { Offer } from '../types/offer';
import { DollarSign, Calendar, CheckCircle } from 'lucide-react';

interface OfferCardProps {
  offer: Offer;
  className?: string;
}

export const OfferCard: React.FC<OfferCardProps> = ({ offer, className = '' }) => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 border border-gray-100 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Hello, {offer.customerName}!
        </h2>
        <p className="text-gray-600">
          Please review your offer details below and sign to accept.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
          <DollarSign className="w-6 h-6 text-accent-600" />
          <div>
            <p className="text-sm font-medium text-gray-600">Offer Amount</p>
            <p className="text-xl font-bold text-gray-900">
              {formatAmount(offer.offerAmount)}
            </p>
          </div>
        </div>

        {offer.isSigned && offer.signedAt && (
          <div className="flex items-center space-x-3 p-4 bg-accent-50 rounded-xl border border-accent-200">
            <CheckCircle className="w-6 h-6 text-accent-600" />
            <div>
              <p className="text-sm font-medium text-accent-800">Signed On</p>
              <p className="text-sm text-accent-700">
                {formatDate(offer.signedAt)}
              </p>
            </div>
          </div>
        )}

        {offer.isSigned && (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent-100 text-accent-800">
            <CheckCircle className="w-4 h-4 mr-2" />
            Already Signed
          </div>
        )}
      </div>
    </div>
  );
};
