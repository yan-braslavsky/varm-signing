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

  if (loading) {
    return (
      <div className="min-h-screen bg-white px-3 sm:px-6 py-4 sm:py-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">VARM</h1>
          </div>
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
      <div className="min-h-screen bg-white px-3 sm:px-6 py-4 sm:py-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">VARM</h1>
          </div>
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
      <div className="min-h-screen bg-white px-3 sm:px-6 py-4 sm:py-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">VARM</h1>
          </div>
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
    <div className="min-h-screen bg-white px-3 sm:px-6 py-4 sm:py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">VARM</h1>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sign and Accept</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Offer Details */}
          <div className="order-2 lg:order-1">
            <Card className="mb-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{offer.customerName}</h3>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                  {new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 2,
                  }).format(offer.offerAmount)}
                </div>
              </div>
            </Card>

            {/* Sign Button */}
            {!offer.isSigned ? (
              <PrimaryButton
                onClick={handleSign}
                isLoading={signing}
                disabled={signing}
              >
                Sign and Accept
              </PrimaryButton>
            ) : (
              <div className="text-center">
                <div className="bg-green-50 rounded-2xl p-4 mb-4">
                  <div className="text-green-600 text-4xl mb-2">✅</div>
                  <p className="text-green-800 font-semibold">Already Signed</p>
                  <p className="text-green-600 text-sm">Thank you for your signature!</p>
                </div>
                <PrimaryButton onClick={() => window.location.href = '/'}>
                  Back to VARM
                </PrimaryButton>
              </div>
            )}
          </div>

          {/* PDF Document Viewer */}
          <div className="order-1 lg:order-2">
            {(offer.documentURL || offer.pdfUrl) ? (
              <PDFViewer url={offer.documentURL || offer.pdfUrl} />
            ) : (
              <div className="bg-white rounded-xl shadow-md p-4">
                <h2 className="text-lg font-semibold mb-3 text-gray-900">Offer Document</h2>
                <div className="bg-gray-50 rounded-md p-8 text-center">
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
