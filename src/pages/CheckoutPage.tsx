import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, 
  Check, 
  AlertCircle, 
  ArrowLeft,
  Shield,
  Clock,
  Wallet,
  ChevronDown,
  Star,
  Gift,
  Coins
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { coinPackages, subscriptionPackages } from '@/lib/utils';

interface CoinPackage {
  id: number;
  amount: number;
  price: number;
  bonus: number;
  popular?: boolean;
}

interface SubscriptionPackage {
  id: string;
  name: string;
  duration: number;
  durationUnit: string;
  price: number;
  features: string[];
  popular?: boolean;
}

// Crypto assets with enhanced data
const cryptoAssets = [
  { 
    id: 'btc', 
    name: 'Bitcoin', 
    symbol: 'BTC', 
    color: 'from-orange-400 to-orange-600',
    icon: "https://icones.pro/wp-content/uploads/2024/03/icone-bitcoin-official.png"
  },
  { 
    id: 'eth', 
    name: 'Ethereum', 
    symbol: 'ETH', 
    color: 'from-blue-400 to-blue-600',
    icon: "https://icones.pro/wp-content/uploads/2024/03/blue-ethereum-icon-logo-symbol-original-official.png"
  },
  { 
    id: 'usdttrc20', 
    name: 'USDT (TRC-20)', 
    symbol: 'USDT', 
    color: 'from-green-400 to-green-600',
    icon: "https://www.iconarchive.com/download/i109679/cjdowner/cryptocurrency-flat/Tether-USDT.1024.png"
  },
  { 
    id: 'usdterc20', 
    name: 'USDT (ERC-20)', 
    symbol: 'USDT', 
    color: 'from-green-400 to-green-600',
    icon: "https://www.iconarchive.com/download/i109679/cjdowner/cryptocurrency-flat/Tether-USDT.1024.png"
  },
  { 
    id: 'usdc', 
    name: 'USD Coin', 
    symbol: 'USDC', 
    color: 'from-blue-400 to-blue-600',
    icon: "https://icones.pro/wp-content/uploads/2024/04/blue-usdc-icon-symbol-logo.png"
  },
  { 
    id: 'ltc', 
    name: 'Litecoin', 
    symbol: 'LTC', 
    color: 'from-gray-400 to-gray-600',
    icon: "https://upload.wikimedia.org/wikipedia/commons/f/f8/LTC-400.png"
  },
  { 
    id: 'sol', 
    name: 'Solana', 
    symbol: 'SOL', 
    color: 'from-purple-400 to-purple-600',
    icon: "https://icones.pro/wp-content/uploads/2024/04/icone-officielle-de-solana-logo-du-symbole-png-1536x1536.png"
  }
];

// Crypto Icon Component
const CryptoIcon = ({ asset, size = 'w-8 h-8' }: { asset: any; size?: string }) => (
  <img 
    src={asset.icon} 
    alt={`${asset.symbol} icon`}
    className={`${size} rounded-full`}
  />
);

// Enhanced Crypto Selection Component
const CryptoSelector = ({ 
  selectedAsset, 
  onSelect 
}: { 
  selectedAsset: string; 
  onSelect: (assetId: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = cryptoAssets.find(asset => asset.id === selectedAsset);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-rose-300 focus:outline-none focus:border-rose-500 transition-all duration-200 shadow-sm"
      >
        <div className="flex items-center space-x-4">
          <CryptoIcon asset={selected} />
          <div className="text-left">
            <div className="font-semibold text-gray-900">{selected?.name}</div>
            <div className="text-sm text-gray-500">{selected?.symbol}</div>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute z-30 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
          >
            {cryptoAssets.map((asset) => (
              <button
                key={asset.id}
                onClick={() => {
                  onSelect(asset.id);
                  setIsOpen(false);
                }}
                className="w-full flex items-center space-x-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <CryptoIcon asset={asset} />
                <div className="text-left flex-1">
                  <div className="font-semibold text-gray-900">{asset.name}</div>
                  <div className="text-sm text-gray-500">{asset.symbol}</div>
                </div>
                {asset.id === selectedAsset && (
                  <Check className="w-5 h-5 text-rose-500" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Get package from URL params
  const searchParams = new URLSearchParams(location.search);
  const packageId = searchParams.get('package');
  const subscriptionId = searchParams.get('subscription');
  
  // Determine which type of package is selected
  const isSubscription = !!subscriptionId;
  
  // Get the selected package
  let selectedCoinPackage: CoinPackage | null = null;
  let selectedSubscriptionPackage: SubscriptionPackage | null = null;
  
  if (isSubscription) {
    selectedSubscriptionPackage = subscriptionPackages.find(pkg => pkg.id === subscriptionId) || subscriptionPackages[1];
  } else {
    const coinPackageId = parseInt(packageId || '2');
    selectedCoinPackage = coinPackages.find(pkg => pkg.id === coinPackageId) || coinPackages[1];
  }

  // Payment states
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('btc');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentAddress, setPaymentAddress] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [currentStep, setCurrentStep] = useState<'summary' | 'payment'>('summary');
  const [paymentExpired, setPaymentExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [amountCopied, setAmountCopied] = useState(false);
  const [isPolicyAcknowledged, setIsPolicyAcknowledged] = useState(false);

  // Calculate final price
  const selectedAsset = cryptoAssets.find(asset => asset.id === selectedPaymentMethod);
  const finalPrice = isSubscription 
    ? selectedSubscriptionPackage?.price || 0
    : selectedCoinPackage?.price || 0;

  // Helper function to safely get coin amounts
  const getCoinAmount = () => {
    if (!selectedCoinPackage) return 0;
    return (selectedCoinPackage.amount || 0) + (selectedCoinPackage.bonus || 0);
  };

  // Payment creation function
  const handlePayment = async () => {
    if (!isPolicyAcknowledged) {
      setError('Please accept the terms of service first');
      return;
    }

    if (!user) {
      setError('Please log in to complete your purchase');
      return;
    }

    if (!selectedCoinPackage && !selectedSubscriptionPackage) {
      setError('No package selected');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      const orderDescription = isSubscription 
        ? `${selectedSubscriptionPackage?.name} - €${selectedSubscriptionPackage?.price}`
        : `${(selectedCoinPackage?.amount ?? 0) + (selectedCoinPackage?.bonus ?? 0)} Coins Package - €${selectedCoinPackage?.price}`;

      const response = await fetch('https://api.nowpayments.io/v1/payment', {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_NOWPAYMENTS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          price_amount: finalPrice,
          price_currency: 'EUR',
          pay_currency: selectedPaymentMethod,
          order_id: `PURELOVE-${Date.now()}-${user.id}`,
          order_description: orderDescription,
          success_url: `${window.location.origin}/success`,
          cancel_url: isSubscription 
            ? `${window.location.origin}/checkout?subscription=${subscriptionId}`
            : `${window.location.origin}/checkout?package=${packageId}`,
          is_fixed_rate: false,
          is_fee_paid_by_user: false
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `API error: ${response.status} ${response.statusText}`);
      }

      if (data.payment_id && data.pay_address) {
        setPaymentId(data.payment_id);
        setPaymentAddress(data.pay_address);
        setPaymentAmount(data.pay_amount);
        setPaymentStatus('confirming');
        setCurrentStep('payment');
        setPaymentExpired(false);
        setTimeLeft(20 * 60); // 20 minutes
        
        toast.success('Payment address generated successfully!');
      } else {
        throw new Error('Invalid payment response');
      }
    } catch (err) {
      console.error('Payment creation failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create payment. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Development bypass function
  const handleDevBypass = async () => {
    if (!user) {
      setError('Please log in to complete your purchase');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      console.log('🚀 [DEV_BYPASS] Simulating successful payment...');
      
      // Simulate payment data
      const mockPaymentData = {
        payment_id: `DEV_BYPASS_${Date.now()}`,
        payment_status: 'finished',
        pay_amount: finalPrice,
        pay_currency: selectedPaymentMethod,
        order_id: `PURELOVE-DEV-${Date.now()}-${user.id}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Process as successful payment
      await processSuccessfulPayment(mockPaymentData);
      
      toast.success('🎉 Development bypass successful! Subscription activated.');
      
      // Navigate to success page
      setTimeout(() => {
        navigate('/success?dev_bypass=true');
      }, 1500);
      
    } catch (err) {
      console.error('Dev bypass failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Development bypass failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if we're in development mode
  const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (paymentAddress && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setPaymentExpired(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [paymentAddress, timeLeft]);

  // Payment status checking
  const checkPaymentStatus = async () => {
    if (!paymentId) return false;

    try {
      const response = await fetch(`https://api.nowpayments.io/v1/payment/${paymentId}`, {
        method: 'GET',
        headers: {
          'x-api-key': import.meta.env.VITE_NOWPAYMENTS_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `API error: ${response.status} ${response.statusText}`);
      }

      setPaymentStatus(data.payment_status);

      switch (data.payment_status) {
        case 'finished':
          // Payment successful - now activate subscription
          await processSuccessfulPayment(data);
          return true;
        case 'failed':
          toast.error('Payment failed. Please try again.');
          return false;
        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      return false;
    }
  };

  // Process successful payment and activate subscription
  const processSuccessfulPayment = async (paymentData: any) => {
    try {
      if (!user) {
        throw new Error('User not found');
      }

      // Declare variables that will be used outside if/else blocks
      let expiresAt: Date;
      let transactionData: any;
      let coinsToAdd = 0;
      let packageName = '';

      if (isSubscription) {
        console.log('🎉 [PAYMENT] Processing successful payment for subscription:', selectedSubscriptionPackage?.name);
        
        // Extract bonus coins from subscription features
        const bonusCoinsMatch = selectedSubscriptionPackage?.features.find(f => f.includes('bonus coins'))?.match(/(\d+)/);
        const bonusCoins = bonusCoinsMatch ? parseInt(bonusCoinsMatch[1]) : 0;
        coinsToAdd = bonusCoins;
        packageName = selectedSubscriptionPackage?.name || 'Subscription';
        
        console.log('💰 [PAYMENT] Subscription bonus coins:', bonusCoins);
        console.log('👤 [PAYMENT] User ID:', user.id);

        // Calculate subscription expiry based on duration
        expiresAt = new Date();
        if (selectedSubscriptionPackage?.durationUnit === 'days') {
          expiresAt.setDate(expiresAt.getDate() + selectedSubscriptionPackage.duration);
        } else if (selectedSubscriptionPackage?.durationUnit === 'month') {
          expiresAt.setMonth(expiresAt.getMonth() + selectedSubscriptionPackage.duration);
        } else if (selectedSubscriptionPackage?.durationUnit === 'months') {
          expiresAt.setMonth(expiresAt.getMonth() + selectedSubscriptionPackage.duration);
        }

        console.log('📅 [PAYMENT] Subscription expires at:', expiresAt.toISOString());

        // Store transaction record for subscription
        console.log('💾 [PAYMENT] Storing subscription transaction record...');
        transactionData = {
          user_id: user.id,
          order_id: paymentData.order_id || `PURELOVE-${Date.now()}-${user.id}`,
          amount: finalPrice,
          coins: bonusCoins,
          type: 'subscription',
          crypto_asset: selectedPaymentMethod,
          crypto_amount: paymentData.pay_amount?.toString() || '0',
          crypto_address: paymentData.pay_address || '',
          transaction_hash: paymentData.outcome?.hash || '',
          status: 'completed',
          created_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          coins_added: bonusCoins,
          subscription_plan: selectedSubscriptionPackage?.id,
          subscription_duration: selectedSubscriptionPackage?.duration
        };
      } else {
        console.log('🎉 [PAYMENT] Processing successful payment for coin package:', `${(selectedCoinPackage?.amount ?? 0) + (selectedCoinPackage?.bonus ?? 0)} Coins`);
        
        coinsToAdd = (selectedCoinPackage?.amount ?? 0) + (selectedCoinPackage?.bonus ?? 0);
        packageName = `${coinsToAdd} Coins Package`;
        
        console.log('💰 [PAYMENT] Coins to add:', coinsToAdd);
        console.log('👤 [PAYMENT] User ID:', user.id);

        // Calculate expiry for coins (1 year)
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 365);

        console.log('📅 [PAYMENT] Coins purchased at:', new Date().toISOString());

        // Store transaction record for coin purchase
        console.log('💾 [PAYMENT] Storing coin purchase transaction record...');
        transactionData = {
          user_id: user.id,
          order_id: paymentData.order_id || `PURELOVE-${Date.now()}-${user.id}`,
          amount: finalPrice,
          coins: coinsToAdd,
          type: 'coins',
          crypto_asset: selectedPaymentMethod,
          crypto_amount: paymentData.pay_amount?.toString() || '0',
          crypto_address: paymentData.pay_address || '',
          transaction_hash: paymentData.outcome?.hash || '',
          status: 'completed',
          created_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          coins_added: coinsToAdd,
          subscription_duration: null
        };
      }

      // Get current user profile
      const { data: currentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('coins')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('❌ [PAYMENT] Error fetching current profile:', profileError);
      }

      const currentCoins = currentProfile?.coins || 0;
      const newCoinsTotal = currentCoins + coinsToAdd;

      console.log('💰 [PAYMENT] Current coins:', currentCoins);
      console.log('💰 [PAYMENT] Adding coins:', coinsToAdd);
      console.log('💰 [PAYMENT] New total:', newCoinsTotal);

      console.log('📋 [PAYMENT] Transaction data:', transactionData);

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert(transactionData);

      if (transactionError) {
        console.error('❌ [PAYMENT] Error storing transaction:', transactionError);
        console.error('❌ [PAYMENT] Transaction error details:', transactionError.details);
        console.error('❌ [PAYMENT] Transaction error hint:', transactionError.hint);
        // Continue anyway - don't block subscription activation
      } else {
        console.log('✅ [PAYMENT] Transaction record stored successfully');
      }

      // Handle subscription or coin purchase
      console.log('👤 [PAYMENT] Updating user profile...');
      
      if (isSubscription) {
        // For subscriptions: add coins and activate subscription
        const { error: addCoinsError } = await supabase.rpc('add_subscription_coins', {
          p_user_id: user.id,
          p_amount: coinsToAdd,
          p_expires_at: expiresAt.toISOString()
        });

        if (addCoinsError) {
          console.error('❌ [PAYMENT] Error adding subscription coins:', addCoinsError);
          console.error('❌ [PAYMENT] Coin error details:', addCoinsError.details);
          // Continue anyway - we'll update profile directly as fallback
          
          // Fallback: add coins directly to profile
          const profileUpdateData = {
            coins: newCoinsTotal,
            chat_subscription: {
              type: selectedSubscriptionPackage?.id.toString(),
              expiresAt: expiresAt.toISOString(),
              purchasedAt: new Date().toISOString(),
              paymentMethod: 'crypto',
              transactionId: paymentData.payment_id
            },
            updated_at: new Date().toISOString()
          };
          
          console.log('📋 [PAYMENT] Fallback profile update:', profileUpdateData);
          
          const { error: subscriptionError } = await supabase
            .from('profiles')
            .update(profileUpdateData)
            .eq('id', user.id);

          if (subscriptionError) {
            console.error('❌ [PAYMENT] Error updating profile:', subscriptionError);
            throw new Error(`Failed to activate subscription: ${subscriptionError.message}`);
          }
        } else {
          console.log('✅ [PAYMENT] Subscription coins added with expiration tracking');
          
          // Update subscription info only (coins already handled by function)
          const profileUpdateData = {
            chat_subscription: {
              type: selectedSubscriptionPackage?.id.toString(),
              expiresAt: expiresAt.toISOString(),
              purchasedAt: new Date().toISOString(),
              paymentMethod: 'crypto',
              transactionId: paymentData.payment_id
            },
            updated_at: new Date().toISOString()
          };

          console.log('📋 [PAYMENT] Profile update data:', profileUpdateData);

          const { error: subscriptionError } = await supabase
            .from('profiles')
            .update(profileUpdateData)
            .eq('id', user.id);

          if (subscriptionError) {
            console.error('❌ [PAYMENT] Error updating profile:', subscriptionError);
            console.error('❌ [PAYMENT] Profile error details:', subscriptionError.details);
            console.error('❌ [PAYMENT] Profile error hint:', subscriptionError.hint);
            throw new Error(`Failed to activate subscription: ${subscriptionError.message}`);
          }
        }

        // Store subscription purchase record
        console.log('💾 [PAYMENT] Storing subscription purchase record...');
        const { error: purchaseError } = await supabase
          .from('subscription_purchases')
          .insert({
            user_id: user.id,
            subscription_id: selectedSubscriptionPackage?.id.toString(),
            payment_method: 'crypto',
            amount_paid: finalPrice,
            coins_spent: 0,
            expires_at: expiresAt.toISOString(),
            is_active: true
          });

        if (purchaseError) {
          console.error('❌ [PAYMENT] Error storing subscription purchase:', purchaseError);
          console.error('❌ [PAYMENT] Purchase error details:', purchaseError.details);
          // Continue anyway - subscription is already activated
        } else {
          console.log('✅ [PAYMENT] Subscription purchase record stored');
        }
      } else {
        // For coin purchases: just add coins to profile
        const profileUpdateData = {
          coins: newCoinsTotal,
          updated_at: new Date().toISOString()
        };
        
        console.log('📋 [PAYMENT] Coin purchase profile update:', profileUpdateData);
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update(profileUpdateData)
          .eq('id', user.id);

        if (updateError) {
          console.error('❌ [PAYMENT] Error updating profile with coins:', updateError);
          throw new Error(`Failed to add coins: ${updateError.message}`);
        }
        
        console.log('✅ [PAYMENT] Coins added to profile successfully');
      }

      // Update local user state (trigger auth context refresh)
      console.log('🔄 [PAYMENT] Refreshing page to update user data...');
      window.location.reload(); // Simple way to refresh user data

      const successMessage = isSubscription 
        ? `Payment completed! Subscription activated and ${coinsToAdd} bonus coins added!`
        : `Payment completed! ${coinsToAdd} coins added to your account!`;
      
      toast.success(successMessage);
      
      // Redirect to success page with complete order details
      navigate('/success', { 
        state: { 
          message: isSubscription 
            ? `Payment successful! Your subscription is now active and ${coinsToAdd} bonus coins have been added to your account.`
            : `Payment successful! ${coinsToAdd} coins have been added to your account.`,
          subscription: isSubscription ? selectedSubscriptionPackage : undefined,
          coinPackage: !isSubscription ? selectedCoinPackage : undefined,
          transactionId: paymentData.payment_id,
          expiresAt: expiresAt.toISOString(),
          amount: finalPrice,
          paymentMethod: selectedPaymentMethod,
          coins: coinsToAdd
        }
      });

    } catch (error) {
      console.error('❌ [PAYMENT] Error processing successful payment:', error);
      console.error('❌ [PAYMENT] Full error object:', JSON.stringify(error, null, 2));
      toast.error('Payment was successful but there was an error activating your subscription. Please contact support.');
      
      // Still redirect to success page but with error info
      navigate('/success', { 
        state: { 
          message: 'Payment completed but subscription activation failed. Please contact support.',
          error: true,
          transactionId: paymentData.payment_id
        }
      });
    }
  };

  // Poll for payment status
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (currentStep === 'payment' && timeLeft > 0 && !paymentExpired) {
      intervalId = setInterval(async () => {
        const isCompleted = await checkPaymentStatus();
        if (isCompleted && intervalId) {
          clearInterval(intervalId);
        }
      }, 10000); // Check every 10 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [currentStep, timeLeft, paymentExpired, paymentId]);

  // Copy to clipboard functions
  const copyToClipboard = (text: string, type: 'address' | 'amount') => {
    navigator.clipboard.writeText(text);
    if (type === 'address') {
      setCopied(true);
      toast.success('Address copied!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      setAmountCopied(true);
      toast.success('Amount copied!');
      setTimeout(() => setAmountCopied(false), 2000);
    }
  };

  // Reset payment
  const resetPayment = () => {
    setPaymentAddress('');
    setPaymentAmount('');
    setPaymentId('');
    setTimeLeft(0);
    setPaymentExpired(false);
    setError(null);
    setCurrentStep('summary');
    setIsPolicyAcknowledged(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
          >
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-rose-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
            <p className="text-gray-600 mb-8">Please sign in to complete your purchase securely.</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-rose-600 text-white py-3 rounded-xl hover:bg-rose-700 transition-colors font-semibold"
            >
              Sign In
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <Navbar />
      
      <main className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <button
              onClick={() => navigate('/pricing')}
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-rose-600 transition-colors mb-6 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Pricing</span>
            </button>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Secure Checkout</h1>
            <p className="text-xl text-gray-600">Complete your purchase with cryptocurrency</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Order Summary - Left Side */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-4"
            >
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8 border border-gray-100">
                <div className="flex items-center space-x-2 mb-6">
                  <Gift className="w-6 h-6 text-rose-600" />
                  <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
                </div>
                
                <div className="space-y-6">
                  {/* Plan Details */}
                  <div className="relative p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-100">
                    {(isSubscription ? selectedSubscriptionPackage?.popular : selectedCoinPackage?.popular) && (
                      <div className="absolute -top-2 left-4">
                        <span className="bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                          <Star className="w-3 h-3" />
                          <span>Popular</span>
                        </span>
                      </div>
                    )}
                    <div className="pt-2">
                      {isSubscription ? (
                        <>
                          <h3 className="font-bold text-gray-900 text-lg">
                            {selectedSubscriptionPackage?.name}
                          </h3>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <Coins className="w-4 h-4" />
                              <span>{selectedSubscriptionPackage?.features.find(f => f.includes('bonus coins'))?.match(/\d+/)?.[0] || '0'} bonus coins included</span>
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <h3 className="font-bold text-gray-900 text-lg">
                            {(selectedCoinPackage?.amount ?? 0) + (selectedCoinPackage?.bonus ?? 0)} Coins Package
                          </h3>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <Coins className="w-4 h-4" />
                              <span>{(selectedCoinPackage?.amount ?? 0)} + {(selectedCoinPackage?.bonus ?? 0)} bonus coins</span>
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    {isSubscription ? (
                      <>
                        <h4 className="font-semibold text-gray-900">What's included:</h4>
                        <div className="space-y-2">
                          {selectedSubscriptionPackage?.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-green-600" />
                              </div>
                              <span className="text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <h4 className="font-semibold text-gray-900">What you can do with {(selectedCoinPackage?.amount ?? 0) + (selectedCoinPackage?.bonus ?? 0)} coins:</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-green-600" />
                            </div>
                            <span className="text-gray-700">Send {(selectedCoinPackage?.amount ?? 0) + (selectedCoinPackage?.bonus ?? 0)} messages</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-green-600" />
                            </div>
                            <span className="text-gray-700">Send {Math.floor(((selectedCoinPackage?.amount ?? 0) + (selectedCoinPackage?.bonus ?? 0)) / 5)}-{Math.floor(((selectedCoinPackage?.amount ?? 0) + (selectedCoinPackage?.bonus ?? 0)) / 50)} virtual gifts</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-green-600" />
                            </div>
                            <span className="text-gray-700">{Math.floor(((selectedCoinPackage?.amount ?? 0) + (selectedCoinPackage?.bonus ?? 0)) / 400)} minutes of voice calls</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-green-600" />
                            </div>
                            <span className="text-gray-700">{Math.floor(((selectedCoinPackage?.amount ?? 0) + (selectedCoinPackage?.bonus ?? 0)) / 1000)} minutes of video calls</span>
                          </div>
                          {((selectedCoinPackage?.amount ?? 0) + (selectedCoinPackage?.bonus ?? 0)) >= 700 && (
                            <div className="flex items-center space-x-3">
                              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-green-600" />
                              </div>
                              <span className="text-gray-700">View contact info {Math.floor(((selectedCoinPackage?.amount ?? 0) + (selectedCoinPackage?.bonus ?? 0)) / 700)} time{Math.floor(((selectedCoinPackage?.amount ?? 0) + (selectedCoinPackage?.bonus ?? 0)) / 700) > 1 ? 's' : ''}</span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Pricing */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-xl font-bold text-gray-900">
                      <span>Total</span>
                      <span className="text-rose-600">€{finalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Payment Section - Right Side */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-8"
            >
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <AnimatePresence mode="wait">
                  {currentStep === 'summary' ? (
                    <motion.div
                      key="summary"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-8"
                    >
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Payment Method</h2>
                        <p className="text-gray-600">Select your preferred cryptocurrency for secure payment</p>
                      </div>

                      {/* Crypto Selection */}
                      <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-900 uppercase tracking-wide">
                          Cryptocurrency
                        </label>
                        <CryptoSelector
                          selectedAsset={selectedPaymentMethod}
                          onSelect={setSelectedPaymentMethod}
                        />
                      </div>

                      {/* Benefits */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-xl p-4 text-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Shield className="w-5 h-5 text-blue-600" />
                          </div>
                          <h3 className="font-semibold text-blue-900 mb-1">Secure</h3>
                          <p className="text-sm text-blue-700">End-to-end encrypted</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4 text-center">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Clock className="w-5 h-5 text-green-600" />
                          </div>
                          <h3 className="font-semibold text-green-900 mb-1">Fast</h3>
                          <p className="text-sm text-green-700">Instant processing</p>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-4 text-center">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Gift className="w-5 h-5 text-purple-600" />
                          </div>
                          <h3 className="font-semibold text-purple-900 mb-1">Convenient</h3>
                          <p className="text-sm text-purple-700">Easy payments</p>
                        </div>
                      </div>

                      {/* Terms */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isPolicyAcknowledged}
                            onChange={(e) => setIsPolicyAcknowledged(e.target.checked)}
                            className="mt-1 w-4 h-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
                          />
                          <span className="text-sm text-gray-700">
                            I agree to the{' '}
                            <a href="#" className="text-rose-600 hover:underline font-medium">Terms of Service</a>
                            {' '}and{' '}
                            <a href="#" className="text-rose-600 hover:underline font-medium">Privacy Policy</a>
                          </span>
                        </label>
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center space-x-2 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200"
                        >
                          <AlertCircle className="w-5 h-5" />
                          <span className="text-sm">{error}</span>
                        </motion.div>
                      )}

                      {/* Pay Button */}
                      <button
                        onClick={handlePayment}
                        disabled={isProcessing || !isPolicyAcknowledged}
                        className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white py-4 rounded-xl hover:from-rose-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        {isProcessing ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                            Processing...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-2">
                            <Wallet className="w-5 h-5" />
                            <span>Pay €{finalPrice.toFixed(2)} with {selectedAsset?.symbol}</span>
                          </div>
                        )}
                      </button>

                      {/* Development Bypass Button - Only show in development */}
                      {isDevelopment && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-center">
                            <div className="border-t border-gray-200 flex-1"></div>
                            <span className="px-3 text-sm text-gray-500 bg-white">Development Mode</span>
                            <div className="border-t border-gray-200 flex-1"></div>
                          </div>
                          
                          <button
                            onClick={handleDevBypass}
                            disabled={isProcessing}
                            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 rounded-xl hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                          >
                            {isProcessing ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                Bypassing...
                              </div>
                            ) : (
                              <div className="flex items-center justify-center space-x-2">
                                <span>🚀</span>
                                <span>DEV: Bypass Payment & Activate Subscription</span>
                              </div>
                            )}
                          </button>
                          
                          <p className="text-xs text-center text-gray-500">
                            ⚠️ This button is only visible in development mode and will instantly activate the subscription without payment.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="payment"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-8"
                    >
                      <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Send Payment</h2>
                        <p className="text-gray-600">Send the exact amount to the address below</p>
                      </div>

                      {/* Payment Info */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 space-y-6">
                        
                        {/* Amount and Timer */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="text-center md:text-left">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                              Send Exactly
                            </label>
                            <div className="flex items-center justify-center md:justify-start space-x-3">
                              <CryptoIcon asset={selectedAsset} size="w-10 h-10" />
                              <div>
                                <div className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                                  <span>{paymentAmount}</span>
                                  <button
                                    onClick={() => copyToClipboard(paymentAmount, 'amount')}
                                    className="p-1 hover:bg-white rounded-lg transition-colors"
                                  >
                                    {amountCopied ? (
                                      <Check className="w-5 h-5 text-green-500" />
                                    ) : (
                                      <Copy className="w-5 h-5 text-gray-400" />
                                    )}
                                  </button>
                                </div>
                                <div className="text-sm text-gray-500">{selectedAsset?.symbol}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-center md:text-right">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                              Time Remaining
                            </label>
                            <div className="text-2xl font-bold text-rose-600 flex items-center justify-center md:justify-end space-x-2">
                              <Clock className="w-6 h-6" />
                              <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                            </div>
                            <div className="text-sm text-gray-500">Payment expires</div>
                          </div>
                        </div>

                        {/* Payment Address */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                            To This Address
                          </label>
                          <div className="flex items-center space-x-3 bg-white rounded-xl p-4 border-2 border-gray-200">
                            <code className="flex-1 text-sm font-mono text-gray-900 break-all">
                              {paymentAddress}
                            </code>
                            <button
                              onClick={() => copyToClipboard(paymentAddress, 'address')}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              {copied ? (
                                <Check className="w-5 h-5 text-green-500" />
                              ) : (
                                <Copy className="w-5 h-5 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* QR Code */}
                        <div className="flex justify-center">
                          <div className="bg-white p-6 rounded-2xl shadow-lg">
                            <QRCodeSVG
                              value={`${selectedPaymentMethod}:${paymentAddress}?amount=${paymentAmount}`}
                              size={160}
                              level="H"
                              includeMargin={true}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Warning */}
                      <div className="flex items-start space-x-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                        <AlertCircle className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="text-amber-800">
                          <p className="font-medium mb-1">Important Payment Instructions</p>
                          <p className="text-sm">Send the exact amount shown above. Different amounts may result in payment failure and require manual processing.</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button
                          onClick={resetPayment}
                          className="flex-1 py-3 px-6 rounded-xl font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Back to Payment Method
                        </button>
                        <button
                          onClick={() => navigate('/pricing')}
                          className="flex-1 py-3 px-6 rounded-xl font-semibold border-2 border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Cancel Order
                        </button>
                      </div>

                      {/* Development Bypass Button - Payment Step */}
                      {isDevelopment && (
                        <div className="space-y-3 border-t border-gray-200 pt-6">
                          <div className="flex items-center justify-center">
                            <div className="border-t border-orange-200 flex-1"></div>
                            <span className="px-3 text-sm text-orange-600 bg-white font-medium">Development Mode</span>
                            <div className="border-t border-orange-200 flex-1"></div>
                          </div>
                          
                          <button
                            onClick={handleDevBypass}
                            disabled={isProcessing}
                            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 rounded-xl hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                          >
                            {isProcessing ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                Bypassing Payment...
                              </div>
                            ) : (
                              <div className="flex items-center justify-center space-x-2">
                                <span>🚀</span>
                                <span>DEV: Skip Payment & Complete Order</span>
                              </div>
                            )}
                          </button>
                          
                          <p className="text-xs text-center text-orange-600">
                            ⚠️ Development bypass - instantly completes payment and activates subscription
                          </p>
                        </div>
                      )}

                      {paymentExpired && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center space-x-2 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200"
                        >
                          <AlertCircle className="w-5 h-5" />
                          <span className="text-sm">Payment window expired. Please create a new payment.</span>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
} 