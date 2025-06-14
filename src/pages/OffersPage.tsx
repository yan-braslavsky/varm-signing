import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { offerApi } from '../api/offerApi';
import type { Offer, ApiResponse } from '../types/offer.js';
import { FileText, CheckCircle, DollarSign, ExternalLink } from 'lucide-react';
import { Logger } from '../utils/logger';
import { ErrorMessage } from '../components/ErrorMessage';
import { CardSkeleton } from '../components/LoadingSkeleton';

export const OffersPage: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track retry attempts
  const [retryCounter, setRetryCounter] = useState<number>(0);

  useEffect(() => {
    const fetchOffers = async () => {
      Logger.info('Initiating data fetch for offers', { 
        context: 'OffersPage.fetchOffers',
        data: { retryAttempt: retryCounter }
      });
      
      try {
        const response: ApiResponse<Offer[]> = await offerApi.getAllOffers();
        
        if (response.error) {
          setError(response.error);
          Logger.error(`Error in offers response: ${response.error}`, undefined, {
            context: 'OffersPage.fetchOffers',
            data: { status: response.status }
          });
        } else if (!response.data || response.data.length === 0) {
          Logger.warn('No offers found in the response', { 
            context: 'OffersPage.fetchOffers',
            data: response
          });
          setOffers([]);
        } else {
          Logger.info(`Successfully loaded ${response.data.length} offers`, { 
            context: 'OffersPage.fetchOffers' 
          });
          
          // Log detailed information about each offer for debugging
          if (retryCounter === 0) { // Only on first load to avoid excessive logging
            Logger.inspectData(response.data, 'Offer Data Before Validation');
          }
          
          // Data validation - ensure all required fields are present with more detailed logging
          const validOffers = response.data.filter(offer => {
            // Check for individual properties based on schema requirements
            const hasSlug = Boolean(offer.slug); 
            const hasName = Boolean(offer.customerName);
            const hasValidAmount = !isNaN(offer.offerAmount) && offer.offerAmount !== null;
            const hasValidPdfUrl = Boolean(offer.pdfUrl);
            
            // Email is optional in our app but required in the schema
            const hasEmail = Boolean(offer.customerEmail);
            
            // Core requirements for displaying an offer card
            const isValid = hasSlug && hasName && hasValidAmount && hasValidPdfUrl;
            
            if (!isValid) {
              // Create a more detailed validation report
              const missingFields = [];
              if (!hasSlug) missingFields.push('slug/id');
              if (!hasName) missingFields.push('name/customerName');
              if (!hasEmail) missingFields.push('email/customerEmail');
              if (!hasValidAmount) missingFields.push('offerAmount');
              if (!hasValidPdfUrl) missingFields.push('documentURL/pdfUrl');
              
              Logger.warn(`Found invalid offer data - missing required fields: ${missingFields.join(', ')}`, { 
                context: 'OffersPage.fetchOffers',
                data: {
                  offerId: offer.slug || 'unknown',
                  customerName: offer.customerName || 'unnamed',
                  validationResults: {
                    hasSlug,
                    hasName,
                    hasEmail,
                    hasValidAmount,
                    hasValidPdfUrl,
                    offerAmountType: typeof offer.offerAmount,
                    offerAmountValue: offer.offerAmount
                  }
                }
              });
            } else if (!hasEmail) {
              // Valid for display but missing email which is required in schema
              Logger.warn('Offer is missing email but otherwise valid', {
                context: 'OffersPage.fetchOffers',
                data: { 
                  slug: offer.slug,
                  customerName: offer.customerName
                }
              });
            }
            
            return isValid;
          });
          
          if (validOffers.length < response.data.length) {
            Logger.warn(`Filtered out ${response.data.length - validOffers.length} invalid offers`, {
              context: 'OffersPage.fetchOffers'
            });
            
            if (validOffers.length === 0) {
              Logger.warn('All offers were filtered out due to validation. Using original data with warnings.', { 
                context: 'OffersPage.fetchOffers' 
              });
              // If all offers are invalid, use the original data with warnings
              // This is a fallback to ensure users see something rather than nothing
              setOffers(response.data);
              return;
            }
          }
          
          setOffers(validOffers);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        Logger.error('Failed to fetch offers', error as Error, { context: 'OffersPage.fetchOffers' });
        setError(errorMessage);
      } finally {
        setLoading(false);
        Logger.info('Completed offers fetch process', { context: 'OffersPage.fetchOffers' });
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
    Logger.info('Retrying offer fetch', { context: 'OffersPage.handleRetry' });
    setLoading(true);
    setError(null);
    
    // Re-trigger effect by using a state dependency
    setRetryCounter(prev => prev + 1);
  };
  
  if (loading) {
    Logger.debug('Rendering loading state', { context: 'OffersPage.render' });
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
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {offers.length === 0 && !loading && !error ? (
            <div className="col-span-2 p-8 bg-white rounded-2xl shadow-md text-center">
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
              className="block bg-white rounded-2xl shadow-md border border-gray-100 p-6 transition-all duration-200 hover:shadow-lg hover:scale-105"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-emerald-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {offer.customerName}
                    </h3>
                    {offer.customerEmail && (
                      <p className="text-sm text-gray-500">{offer.customerEmail}</p>
                    )}
                    <p className="text-sm text-gray-600">Slug: {offer.slug || 'Missing'}</p>
                  </div>
                </div>
                {offer.isSigned && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 text-green-800 rounded-full text-xs font-medium">
                    <CheckCircle className="w-3 h-3" />
                    <span>Signed</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
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
