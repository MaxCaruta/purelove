import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight, Coins, Heart, AlertCircle, Calendar, CreditCard, Receipt, Download } from 'lucide-react';
import { generateReceipt, createReceiptData, ReceiptTemplate } from '../lib/receiptGenerator';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function SuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Check if this is a dev bypass
  const searchParams = new URLSearchParams(location.search);
  const isDevBypass = searchParams.get('dev_bypass') === 'true';
  
  // Get data from location state
  const message = location.state?.message || (isDevBypass ? 'Development bypass completed successfully!' : 'Payment completed successfully!');
  const coins = location.state?.coins || 0;
  const subscription = location.state?.subscription;
  const transactionId = location.state?.transactionId;
  const expiresAt = location.state?.expiresAt;
  const amount = location.state?.amount;
  const paymentMethod = location.state?.paymentMethod;
  const hasError = location.state?.error;
  const cryptoAmount = location.state?.cryptoAmount;
  const cryptoAddress = location.state?.cryptoAddress;
  const transactionHash = location.state?.transactionHash;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCryptoDisplayName = (method: string) => {
    const names: { [key: string]: string } = {
      'btc': 'Bitcoin (BTC)',
      'eth': 'Ethereum (ETH)',
      'usdttrc20': 'USDT (TRC-20)',
      'usdterc20': 'USDT (ERC-20)',
      'usdc': 'USD Coin (USDC)',
      'ltc': 'Litecoin (LTC)',
      'sol': 'Solana (SOL)'
    };
    return names[method] || method.toUpperCase();
  };

  const getSubscriptionFeatures = (subscriptionName: string) => {
    const features: { [key: string]: string[] } = {
      'Weekly Chat Subscription': [
        'Unlimited messaging for 7 days',
        '50 bonus coins included',
        'Priority customer support',
        'Advanced search filters',
        'Profile boost feature'
      ],
      'Monthly Chat Subscription': [
        'Unlimited messaging for 30 days',
        '200 bonus coins included',
        'Priority customer support',
        'Advanced search filters',
        'Profile boost feature',
        'Read receipts',
        'Online status visibility'
      ],
      'Quarterly Chat Subscription': [
        'Unlimited messaging for 90 days',
        '600 bonus coins included',
        'Priority customer support',
        'Advanced search filters',
        'Profile boost feature',
        'Read receipts',
        'Online status visibility',
        'VIP profile badge',
        'Extended profile visibility'
      ]
    };
    return features[subscriptionName] || ['Premium subscription features'];
  };

  const handleDownloadReceipt = async () => {
    if (!subscription || !transactionId || !user?.email) {
      toast.error('Receipt data not available');
      return;
    }

    try {
      const startDate = new Date().toISOString();
      const endDate = expiresAt || new Date(Date.now() + subscription.duration * 24 * 60 * 60 * 1000).toISOString();
      
      const receiptData = createReceiptData(
        transactionId,
        subscription.name,
        `${subscription.duration} days`,
        user.email,
        amount || subscription.price,
        getCryptoDisplayName(paymentMethod || 'Cryptocurrency'),
        startDate,
        endDate,
        coins || subscription.coins || 0,
        getSubscriptionFeatures(subscription.name),
        {
          cryptoAsset: getCryptoDisplayName(paymentMethod || ''),
          cryptoAmount: cryptoAmount,
          cryptoAddress: cryptoAddress,
          transactionHash: transactionHash,
          customerName: user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user.email?.split('@')[0] || 'Customer'
        }
      );

      await generateReceipt(receiptData, ReceiptTemplate.DETAILED);
      toast.success('Receipt downloaded successfully!');
    } catch (error) {
      console.error('Receipt generation failed:', error);
      toast.error('Failed to generate receipt. Please try again.');
    }
  };

  return (
    <div className={`min-h-screen ${hasError ? 'bg-gradient-to-br from-amber-50 to-orange-50' : 'bg-gradient-to-br from-green-50 to-emerald-50'} flex items-center justify-center py-8`}>
      <div className="max-w-lg w-full mx-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Success/Error Icon */}
          <div className={`${hasError ? 'bg-amber-100' : 'bg-green-100'} h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6`}>
            {hasError ? (
              <AlertCircle className="h-12 w-12 text-amber-600" />
            ) : (
              <CheckCircle className="h-12 w-12 text-green-600" />
            )}
          </div>

          {/* Title */}
          <h1 className={`text-3xl font-bold ${hasError ? 'text-amber-900' : 'text-gray-900'} mb-4 text-center`}>
            {hasError ? 'Payment Received' : 'Payment Successful!'}
          </h1>
          
          {/* Dev Bypass Indicator */}
          {isDevBypass && (
            <div className="bg-orange-100 border border-orange-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-center gap-2">
                <span className="text-orange-600">🚀</span>
                <span className="text-sm font-medium text-orange-800">Development Bypass Mode</span>
              </div>
              <p className="text-xs text-center text-orange-700 mt-1">
                This subscription was activated using the development bypass feature
              </p>
            </div>
          )}
          
          <p className="text-gray-600 mb-6 text-center">
            {message}
          </p>

          {/* Receipt Details */}
          {subscription && transactionId && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Order Receipt</h3>
                </div>
                <button
                  onClick={handleDownloadReceipt}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subscription:</span>
                  <span className="font-medium text-gray-900">{subscription.name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium text-gray-900">{subscription.duration} days</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-medium text-gray-900">€{amount?.toFixed(2)}</span>
                </div>
                
                {paymentMethod && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium text-gray-900">{getCryptoDisplayName(paymentMethod)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-mono text-xs text-gray-900 break-all">{transactionId}</span>
                </div>
                
                {expiresAt && !hasError && (
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-gray-600">Expires:</span>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{formatDate(expiresAt)}</div>
                      <div className="text-xs text-green-600 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Active subscription
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Coins Added (legacy support) */}
          {coins > 0 && (
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-4 mb-6 border border-rose-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Coins className="h-6 w-6 text-rose-600" />
                <span className="font-semibold text-rose-600">{coins} coins</span>
              </div>
              <p className="text-sm text-gray-600 text-center">
                have been added to your account
              </p>
            </div>
          )}

          {/* Error Contact Info */}
          {hasError && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-amber-800 text-sm text-center">
                <strong>Important:</strong> Your payment was processed successfully, but there was a technical issue activating your subscription. 
                Please contact support with your transaction ID above, and we'll activate your subscription manually within 24 hours.
              </p>
            </div>
          )}

          {/* Next Steps */}
          <div className="space-y-4">
            {!hasError && subscription ? (
              <button
                onClick={() => navigate('/messages')}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all duration-300 font-medium flex items-center justify-center gap-2"
              >
                <Heart className="h-5 w-5" />
                Start Messaging
                <ArrowRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={() => navigate('/browse')}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all duration-300 font-medium flex items-center justify-center gap-2"
              >
                <Heart className="h-5 w-5" />
                Start Browsing Profiles
                <ArrowRight className="h-5 w-5" />
              </button>
            )}
            
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-white border-2 border-rose-300 text-rose-600 py-3 rounded-lg hover:bg-rose-50 transition-all duration-300 font-medium"
            >
              View My Dashboard
            </button>
          </div>

          {/* Support Contact */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500 mb-2">
              {hasError ? 'Need immediate help?' : 'Questions about your purchase?'}
            </p>
            <a 
              href="mailto:support@purelove.com" 
              className="text-rose-600 hover:text-rose-700 text-sm font-medium"
            >
              support@purelove.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 