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
      setError('Der ungültige Angebot-Link. Die URL scheint unvollständig oder fehlerhaft zu sein.');
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
          setError('Angebot nicht gefunden. Dieser Link ist möglicherweise falsch oder das Angebot wurde entfernt.');
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
      setError('Verbindung zum Server nicht möglich. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.');
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
          toast.error('Dieses Angebot wurde bereits unterzeichnet');
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
        toast.success('Angebot erfolgreich unterzeichnet!');
        // Navigate to success page with offer data
        navigate('/success', { 
          state: { 
            customerName: response.data.customerName,
            signedAt: response.data.signedAt,
            offerSlug: slug
          } 
        });
      }
    } catch (err) {
      Logger.error('Exception in sign offer process', err as Error, { context: 'SignPage.handleSign' });
      toast.error('Fehler beim Unterzeichnen des Angebots. Bitte versuchen Sie es erneut.');
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
            title="Angebot nicht gefunden"
            message={error}
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
            title="Angebot nicht gefunden"
            message="Das angeforderte Angebot konnte nicht gefunden werden. Bitte überprüfen Sie den Link oder kontaktieren Sie den Support, falls Sie glauben, dass dies ein Fehler ist."
            className="animate-fade-in"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 px-3 sm:px-6 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Page Header - Show instructions only for unsigned offers */}
        {!offer.isSigned ? (
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Angebot unterzeichnen und annehmen</h1>
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
        ) : (
          <div className="text-center mb-8">
            <div className="max-w-2xl mx-auto bg-green-50 rounded-xl p-6 mb-6">
              <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h1 className="text-2xl font-bold text-green-800 mb-3">Angebot bereits unterzeichnet</h1>
              <p className="text-green-700 text-lg mb-4">
                Vielen Dank für Ihre Unterschrift! Das Angebot wurde erfolgreich abgesendet.
              </p>
              <div className="text-base text-green-600 flex items-center justify-center">
                <Clock className="w-4 h-4 mr-1.5" />
                <span>Unterzeichnet am: {new Date(offer.signedAt!).toLocaleDateString('de-DE')}</span>
              </div>
            </div>
          </div>
        )}

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
                      Unterzeichnet
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 font-semibold text-sm rounded-xl flex items-center">
                      <Clock3 className="w-4 h-4 mr-1" />
                      Ausstehend
                    </span>
                  )}
                </div>
              </div>

              {/* Offer ID */}
              <div className="mb-4">
                <div className="text-sm text-gray-600 flex items-center">
                  <Hash className="w-4 h-4 mr-1" />
                  <span className="font-medium text-gray-900">{offer.slug || 'Fehlt'}</span>
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
            ) : null}
          </div>

          {/* PDF Document Viewer */}
          <div className="order-1 lg:order-2">
            {(offer.documentURL || offer.pdfUrl) ? (
              <PDFViewer url={offer.documentURL || offer.pdfUrl} />
            ) : (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">Angebotsdokument</h2>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <div className="text-gray-400 text-4xl mb-3">📄</div>
                  <p className="text-gray-600 font-medium">Dokument nicht verfügbar</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Das Dokument wird nach der Verarbeitung verfügbar sein
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
