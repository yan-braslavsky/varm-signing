import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import type { Offer } from '../types/offer.js';
import { offerApi } from '../api/offerApi';
import { PrimaryButton } from '../components/PrimaryButton';
import { Card } from '../components/Card';
import { ErrorMessage } from '../components/ErrorMessage';
import { PDFViewer } from '../components/PDFViewer';
import { Logger } from '../utils/logger';
import { 
  Mail, 
  Hash, 
  MapPin, 
  Euro, 
  Clock, 
  CheckCircle2, 
  Clock3 
} from 'lucide-react';

export const SignPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOffer = async () => {
    if (!slug) {
      Logger.error('Attempted to fetch offer with no slug', undefined, { context: 'SignPage.fetchOffer' });
      setError('Invalid offer link. The URL appears to be incomplete or malformed.');
      setLoading(false);
      return;
    }

    Logger.info(`Fetching offer with slug: ${slug}`, { context: 'SignPage.fetchOffer' });
    try {
      setLoading(true);
      setError(null);
      
      const response = await offerApi.getOffer(slug);
      
      if (response.error) {
        if (response.status === 404) {
          Logger.warn(`Offer not found: ${slug}`, { context: 'SignPage.fetchOffer', data: { status: response.status } });
          setError('Offer not found. This link may be incorrect or the offer may have been removed.');
        } else {
          Logger.error(`Error fetching offer: ${response.error}`, undefined, { 
            context: 'SignPage.fetchOffer',
            data: { slug, status: response.status } 
          });
          setError(response.error);
        }
      } else if (response.data) {
        Logger.info(`Successfully loaded offer: ${slug}`, { 
          context: 'SignPage.fetchOffer',
          data: {
            customerName: response.data.customerName,
            offerAmount: response.data.offerAmount,
            isSigned: response.data.isSigned
          }
        });
        setOffer(response.data);
      }
    } catch (err) {
      Logger.error('Failed to fetch offer', err as Error, { context: 'SignPage.fetchOffer', data: { slug } });
      setError('Unable to connect to the server. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
      Logger.info('Completed offer fetch process', { context: 'SignPage.fetchOffer', data: { slug } });
    }
  };

  const handleSign = async () => {
    if (!slug || !offer) {
      Logger.warn('Attempted to sign offer with no slug or offer data', { 
        context: 'SignPage.handleSign',
        data: { hasSlug: Boolean(slug), hasOffer: Boolean(offer) }
      });
      return;
    }

    Logger.info(`Initiating signing process for offer: ${slug}`, { 
      context: 'SignPage.handleSign',
      data: { customerName: offer.customerName }
    });
    
    try {
      setSigning(true);
      
      const response = await offerApi.signOffer(slug);
      
      if (response.error) {
        if (response.status === 409) {
          Logger.warn(`Attempted to sign already signed offer: ${slug}`, { 
            context: 'SignPage.handleSign',
            data: { status: response.status }
          });
          toast.error('This offer has already been signed');
          // Refresh the offer data
          await fetchOffer();
        } else {
          Logger.error(`Failed to sign offer: ${response.error}`, undefined, { 
            context: 'SignPage.handleSign',
            data: { slug, status: response.status } 
          });
          toast.error(response.error);
        }
      } else if (response.data) {
        Logger.info(`Successfully signed offer: ${slug}`, { 
          context: 'SignPage.handleSign',
          data: { 
            customerName: response.data.customerName,
            signedAt: response.data.signedAt 
          }
        });
        toast.success('Offer signed successfully!');
        // Navigate to success page with offer data
        navigate('/success', { 
          state: { 
            customerName: response.data.customerName,
            signedAt: response.data.signedAt 
          } 
        });
      }
    } catch (err) {
      Logger.error('Exception in sign offer process', err as Error, { context: 'SignPage.handleSign' });
      toast.error('Failed to sign offer. Please try again.');
    } finally {
      setSigning(false);
    }
  };

  useEffect(() => {
    fetchOffer();
  }, [slug]);

  // Function to generate Google Maps URL from address
  const getGoogleMapsUrl = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-white px-3 sm:px-6 py-6">
        <div className="max-w-md mx-auto">
          <Card>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white px-3 sm:px-6 py-6">
        <div className="max-w-md mx-auto">
          <ErrorMessage
            title="Offer Not Found"
            message={error}
            onRetry={fetchOffer}
            onBack={() => navigate('/offers')}
            backLabel="Return to Offers"
            className="animate-fade-in"
          />
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="bg-white px-3 sm:px-6 py-6">
        <div className="max-w-md mx-auto">
          <ErrorMessage
            title="Offer Not Found"
            message="The requested offer could not be found. Please check the link or contact support if you believe this is an error."
            onBack={() => navigate('/offers')}
            backLabel="Return to Offers"
            className="animate-fade-in"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 px-3 sm:px-6 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign and Accept Offer</h1>
          <div className="max-w-2xl mx-auto bg-blue-50 rounded-xl p-6 mb-6">
            <p className="text-gray-800 text-base leading-relaxed mb-3">
              Bitte schau dir in Ruhe alle Details zu deinem Dämmprojekt an.
            </p>
            <p className="text-gray-800 text-base leading-relaxed mb-3">
              Hast du Fragen? Ruf uns gerne an oder schreib uns.
            </p>
            <p className="text-gray-800 text-base leading-relaxed font-medium">
              Wenn alles passt, klicke auf „Angebot annehmen & absenden".
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Offer Details */}
          <div className="order-2 lg:order-1">
            <Card className="mb-6">
              {/* Header with Customer Name and Status */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{offer.customerName}</h3>
                  {offer.customerEmail && (
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <Mail className="w-4 h-4 mr-1.5" />
                      <span>{offer.customerEmail}</span>
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  {offer.isSigned ? (
                    <span className="px-3 py-1.5 bg-green-100 text-green-700 font-semibold text-sm rounded-xl flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Signed
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 font-semibold text-sm rounded-xl flex items-center">
                      <Clock3 className="w-4 h-4 mr-1" />
                      Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Offer ID */}
              <div className="mb-4">
                <div className="text-sm text-gray-600 flex items-center">
                  <Hash className="w-4 h-4 mr-1" />
                  <span className="font-medium text-gray-900">{offer.slug || 'Missing'}</span>
                </div>
              </div>

              {/* Project Address */}
              {offer.projectAddress && (
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-1 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Projektadresse:
                  </div>
                  <button
                    onClick={() => window.open(getGoogleMapsUrl(offer.projectAddress!), '_blank', 'noopener,noreferrer')}
                    className="font-medium text-blue-600 hover:text-blue-800 underline transition-colors text-left"
                  >
                    {offer.projectAddress}
                  </button>
                </div>
              )}

              {/* Offer Amount */}
              <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-700 mb-1 flex items-center">
                  <Euro className="w-4 h-4 mr-1" />
                  Festpreisangebot
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {formatAmount(offer.offerAmount)}
                </div>
              </div>

              {/* Signed Date - only show if offer is signed */}
              {offer.isSigned && offer.signedAt && (
                <div className="mb-4 text-sm text-gray-500 flex items-center p-3 bg-green-50 rounded-lg">
                  <Clock className="w-4 h-4 mr-1.5" />
                  <span>Unterzeichnet am: {new Date(offer.signedAt).toLocaleDateString('de-DE')}</span>
                </div>
              )}
            </Card>

            {/* Sign Button or Signed Status */}
            {!offer.isSigned ? (
              <PrimaryButton
                onClick={handleSign}
                isLoading={signing}
                disabled={signing}
                className="w-full"
              >
                {signing ? 'Angebot wird abgesendet...' : 'Angebot annehmen & absenden'}
              </PrimaryButton>
            ) : (
              <div className="bg-green-50 rounded-2xl p-6 text-center">
                <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-xl font-bold text-green-800 mb-2">Angebot bereits unterzeichnet</h3>
                <p className="text-green-700 mb-4">
                  Vielen Dank für Ihre Unterschrift! Das Angebot wurde erfolgreich abgesendet.
                </p>
                <div className="text-sm text-green-600 mb-4 flex items-center justify-center">
                  <Clock className="w-4 h-4 mr-1.5" />
                  <span>Unterzeichnet am: {new Date(offer.signedAt!).toLocaleDateString('de-DE')}</span>
                </div>
                <PrimaryButton onClick={() => navigate('/offers')} className="w-full">
                  Zurück zu den Angeboten
                </PrimaryButton>
              </div>
            )}
          </div>

          {/* PDF Document Viewer */}
          <div className="order-1 lg:order-2">
            {(offer.documentURL || offer.pdfUrl) ? (
              <PDFViewer url={offer.documentURL || offer.pdfUrl} />
            ) : (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">Offer Document</h2>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <div className="text-gray-400 text-4xl mb-3">📄</div>
                  <p className="text-gray-600 font-medium">Document not available</p>
                  <p className="text-gray-500 text-sm mt-1">
                    The document will be available after processing
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
