import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import type { Offer } from '../types/offer.js';
import { offerApi } from '../api/offerApi';
import { OfferCard } from '../components/OfferCard';
import { SignButton } from '../components/SignButton';
import { PDFViewer } from '../components/PDFViewer';
import { ErrorMessage } from '../components/ErrorMessage';
import { CardSkeleton, PDFSkeleton } from '../components/LoadingSkeleton';
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
      setError('Invalid offer link');
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
          setError('This offer link is invalid or has expired');
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
      setError('Failed to load offer. Please check your connection and try again.');
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
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg-grid-cols-2 gap-8">
            <div>
              <CardSkeleton />
            </div>
            <div>
              <PDFSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <ErrorMessage
            title="Unable to Load Offer"
            message={error}
            onRetry={fetchOffer}
            className="animate-fade-in"
          />
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <ErrorMessage
            title="Offer Not Found"
            message="The requested offer could not be found."
            className="animate-fade-in"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <Link 
              to="/demo" 
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Demo
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            VARM Digital Signing
          </h1>
          <p className="text-gray-600">
            Review and sign your personalized offer
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg-grid-cols-2 gap-8">
          {/* Left Column - Offer Details */}
          <div className="space-y-6 animate-slide-up">
            <OfferCard offer={offer} />
            
            <SignButton
              onSign={handleSign}
              isSigned={offer.isSigned}
              isLoading={signing}
            />

            {offer.isSigned && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  This offer has already been signed. Thank you!
                </p>
              </div>
            )}
          </div>

          {/* Right Column - PDF Viewer */}
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <PDFViewer url={offer.pdfUrl} />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="text-sm text-gray-500">
            © 2024 VARM. Powered by clean energy solutions.
          </p>
        </div>
      </div>
    </div>
  );
};
