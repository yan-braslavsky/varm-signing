import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { offerApi } from '../api/offerApi';
import type { Offer, ApiResponse } from '../types/offer.js';
import { FileText, CheckCircle } from 'lucide-react';
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
            
            // Project address is optional but nice to have
            const hasAddress = Boolean(offer.projectAddress);
            
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
                    hasAddress,
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
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
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
      <div className="bg-gray-50 py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-6"></div>
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <CardSkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Digital Signing Platform
          </h1>
          <p className="text-gray-600 mb-6">
            Choose an offer to view and complete the digital signing process
          </p>
          
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
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
              className="block bg-white rounded-2xl shadow-md border border-gray-100 max-w-md p-5 transition-all duration-200 hover:shadow-lg hover:scale-105"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {offer.customerName}
                  </h3>
                  {offer.customerEmail && (
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-1.5">📧</span>
                      <span>{offer.customerEmail}</span>
                    </div>
                  )}
                </div>
                {offer.isSigned ? (
                  <span className="px-2.5 py-1 bg-green-100 text-green-700 font-semibold text-sm rounded-xl">
                    ✅ Signed
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 font-semibold text-sm rounded-xl">
                    📋 Pending
                  </span>
                )}
              </div>

              {/* Project Info */}
              <div className="mb-5">
                <div className="text-sm text-gray-600">
                  🆔 Slug: <span className="font-medium text-gray-900">{offer.slug || 'Missing'}</span>
                </div>
                
                {/* Project address from Airtable */}
                <div className="mt-3">
                  <div className="text-sm text-gray-600 mb-1">📍 Projektadresse:</div>
                  <div className="font-medium">
                    {offer.projectAddress || 'Adresse nicht verfügbar'}
                  </div>
                </div>
              </div>

              {/* Offer Info */}
              <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-700 mb-1">💶 Festpreisangebot</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatAmount(offer.offerAmount)}
                </div>
              </div>

              {/* Info Text from Airtable Notes */}
              <div className="mb-3 text-sm text-gray-500">
                📝 {offer.notes || 'Bitte schau dir in Ruhe alle Details zu deinem Dämmprojekt an. Wenn alles passt, klicke auf „Angebot ansehen".'}
              </div>

              {/* Signed At */}
              {offer.signedAt && (
                <div className="mb-4 text-sm text-gray-500">
                  🕒 Unterzeichnet am: {new Date(offer.signedAt).toLocaleDateString('de-DE')}
                </div>
              )}

              {/* View Offer */}
              <div className="flex items-center font-semibold text-emerald-700 text-sm">
                <span className="mr-1">📄</span>
                <span>View Offer</span>
              </div>
            </Link>
          )))}
        </div>
      </div>
    </div>
  );
};
