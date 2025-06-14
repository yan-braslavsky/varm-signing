import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { offerApi } from '../api/offerApi';
import type { Offer, ApiResponse } from '../types/offer.js';
import { FileText, CheckCircle, DollarSign, ExternalLink } from 'lucide-react';
import { Logger } from '../utils/logger';
import { ErrorMessage } from '../components/ErrorMessage';
import { CardSkeleton } from '../components/LoadingSkeleton';

export const DemoPage: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track retry attempts
  const [retryCounter, setRetryCounter] = useState<number>(0);

  useEffect(() => {
    const fetchOffers = async () => {
      Logger.info('Initiating data fetch for offers', { 
        context: 'DemoPage.fetchOffers',
        data: { retryAttempt: retryCounter }
      });
      
      try {
        const response: ApiResponse<Offer[]> = await offerApi.getAllOffers();
        
        if (response.error) {
          setError(response.error);
          Logger.error(`Error in offers response: ${response.error}`, undefined, {
            context: 'DemoPage.fetchOffers',
            data: { status: response.status }
          });
        } else if (!response.data || response.data.length === 0) {
          Logger.warn('No offers found in the response', { 
            context: 'DemoPage.fetchOffers',
            data: response
          });
          setOffers([]);
        } else {
          Logger.info(`Successfully loaded ${response.data.length} offers`, { 
            context: 'DemoPage.fetchOffers' 
          });
          
          // Data validation - ensure all required fields are present
          const validOffers = response.data.filter(offer => {
            const isValid = Boolean(
              offer.slug && 
              offer.customerName && 
              typeof offer.offerAmount === 'number'
            );
            
            if (!isValid) {
              Logger.warn('Found invalid offer data', { 
                context: 'DemoPage.fetchOffers',
                data: offer
              });
            }
            
            return isValid;
          });
          
          if (validOffers.length < response.data.length) {
            Logger.warn(`Filtered out ${response.data.length - validOffers.length} invalid offers`, {
              context: 'DemoPage.fetchOffers'
            });
          }
          
          setOffers(validOffers);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        Logger.error('Failed to fetch offers', error as Error, { context: 'DemoPage.fetchOffers' });
        setError(errorMessage);
      } finally {
        setLoading(false);
        Logger.info('Completed offers fetch process', { context: 'DemoPage.fetchOffers' });
      }
    };

    fetchOffers();
  }, [retryCounter]); // Add retryCounter as dependency to allow retrying

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Retry handler for error state
  const handleRetry = () => {
    Logger.info('Retrying offer fetch', { context: 'DemoPage.handleRetry' });
    setLoading(true);
    setError(null);
    
    // Re-trigger effect by using a state dependency
    setRetryCounter(prev => prev + 1);
  };
  
  if (loading) {
    Logger.debug('Rendering loading state', { context: 'DemoPage.render' });
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
          <div className="grid lg:grid-cols-2 gap-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <CardSkeleton key={`skeleton-${i}`} />
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
            VARM Digital Signing Platform
          </h1>
          <p className="text-gray-600 mb-6">
            Choose an offer to view and complete the digital signing process
          </p>
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
            <p className="text-sm text-gray-700">
              <strong>Features:</strong> Secure digital signing, real-time status updates, mobile-responsive design,
              and instant confirmation upon completion.
            </p>
          </div>
          
          {/* Error Message Display */}
          {error && (
            <ErrorMessage 
              title="Error loading offers"
              message={error}
              type="error"
              className="mt-4"
              onRetry={handleRetry}
            />
          )}
          
          {/* Data Status Indicator */}
          {!error && offers.length > 0 && (
            <div className="mt-4 bg-green-50 p-2 rounded-lg text-sm text-green-700 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>Successfully loaded {offers.length} offers</span>
            </div>
          )}
        </div>

        {/* Offers Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {offers.length === 0 && !loading && !error ? (
            <div className="col-span-2 p-8 bg-white rounded-xl shadow text-center">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Offers Available</h3>
              <p className="text-gray-600">
                There are currently no offers available in the system.
              </p>
            </div>
          ) : (
            offers.map((offer, index) => (
            <Link
              key={`offer-${offer.slug || index}`}
              to={offer.slug ? `/sign/${offer.slug}` : '#'}
              className="block bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transition-all hover:scale-105 hover:shadow-xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-primary-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {offer.customerName}
                    </h3>
                    <p className="text-sm text-gray-600">Slug: {offer.slug || 'Missing'}</p>
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
          )))}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 animate-fade-in">
          <p className="text-sm text-gray-500">
            © 2024 VARM Digital Signing Platform - Powered by Airtable
          </p>
        </div>
      </div>
    </div>
  );
};
