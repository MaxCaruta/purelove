import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Download, 
  Calendar, 
  Receipt, 
  CheckCircle, 
  Clock, 
  XCircle, 
  RefreshCw,
  Coins,
  Crown,
  AlertCircle,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { generateReceipt, createReceiptData, ReceiptTemplate } from '../lib/receiptGenerator';
import toast from 'react-hot-toast';

interface Transaction {
  id: string;
  order_id: string;
  user_id: string;
  subscription_plan: string;
  amount: number;
  crypto_asset: string;
  crypto_amount: string;
  crypto_address: string;
  transaction_hash?: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  created_at: string;
  expires_at?: string;
  coins_added: number;
  subscription_duration: number;
}

interface SubscriptionPurchase {
  id: string;
  user_id: string;
  subscription_type: string;
  expires_at: string;
  purchased_at: string;
  transaction_id: string;
  amount_paid: number;
  payment_method: string;
}

export default function BillingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchBillingData();
    }
  }, [user]);

  const fetchBillingData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (transactionsError) throw transactionsError;

      // Fetch subscription purchases
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('subscription_purchases')
        .select('*')
        .eq('user_id', user.id)
        .order('purchased_at', { ascending: false });

      if (subscriptionsError) throw subscriptionsError;

      setTransactions(transactionsData || []);
      setSubscriptions(subscriptionsData || []);
    } catch (error) {
      console.error('Error fetching billing data:', error);
      toast.error('Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'refunded':
        return <RefreshCw className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCryptoDisplayName = (asset: string) => {
    const names: { [key: string]: string } = {
      'btc': 'Bitcoin (BTC)',
      'eth': 'Ethereum (ETH)',
      'usdttrc20': 'USDT (TRC-20)',
      'usdterc20': 'USDT (ERC-20)',
      'usdc': 'USD Coin (USDC)',
      'ltc': 'Litecoin (LTC)',
      'sol': 'Solana (SOL)'
    };
    return names[asset] || asset.toUpperCase();
  };

  const getSubscriptionFeatures = (plan: string) => {
    const features: { [key: string]: string[] } = {
      'weekly-chat': [
        'Unlimited messaging for 7 days',
        '50 bonus coins included',
        'Priority customer support',
        'Advanced search filters',
        'Profile boost feature'
      ],
      'monthly-chat': [
        'Unlimited messaging for 30 days',
        '200 bonus coins included',
        'Priority customer support',
        'Advanced search filters',
        'Profile boost feature',
        'Read receipts',
        'Online status visibility'
      ],
      'quarterly-chat': [
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
    return features[plan] || ['Premium subscription features'];
  };

  const handleDownloadReceipt = async (transaction: Transaction) => {
    if (!user?.email) {
      toast.error('User email not available');
      return;
    }

    try {
      const planNames: { [key: string]: string } = {
        'weekly-chat': 'Weekly Chat Subscription',
        'monthly-chat': 'Monthly Chat Subscription',
        'quarterly-chat': 'Quarterly Chat Subscription'
      };

      const receiptData = createReceiptData(
        transaction.order_id,
        planNames[transaction.subscription_plan] || transaction.subscription_plan,
        `${transaction.subscription_duration} days`,
        user.email,
        transaction.amount,
        getCryptoDisplayName(transaction.crypto_asset),
        transaction.created_at,
        transaction.expires_at || new Date(new Date(transaction.created_at).getTime() + transaction.subscription_duration * 24 * 60 * 60 * 1000).toISOString(),
        transaction.coins_added,
        getSubscriptionFeatures(transaction.subscription_plan),
        {
          cryptoAsset: getCryptoDisplayName(transaction.crypto_asset),
          cryptoAmount: transaction.crypto_amount,
          cryptoAddress: transaction.crypto_address,
          transactionHash: transaction.transaction_hash,
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === 'all' || transaction.status === filter;
    const matchesSearch = searchTerm === '' || 
      transaction.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.subscription_plan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCryptoDisplayName(transaction.crypto_asset).toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const currentSubscription = user?.chatSubscription;
  const isSubscriptionActive = currentSubscription && new Date(currentSubscription.expiresAt) > new Date();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Subscriptions</h1>
          <p className="text-gray-600">Manage your payments, subscriptions, and download receipts</p>
        </div>

        {/* Current Subscription Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Crown className="h-6 w-6 text-rose-500" />
              Current Subscription
            </h2>
            <button
              onClick={() => navigate('/pricing')}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Upgrade Plan
            </button>
          </div>

          {isSubscriptionActive ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-800">Active Subscription</span>
                  </div>
                  <p className="text-green-700">
                    {currentSubscription.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Plan
                  </p>
                  <p className="text-sm text-green-600">
                    Expires: {formatDate(currentSubscription.expiresAt)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-green-600 mb-1">
                    <Coins className="h-4 w-4" />
                    <span className="text-sm">{user.coins} coins available</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              {user?.chatSubscription ? (
                // Show expired subscription info
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <span className="font-medium text-gray-700">
                      {user.chatSubscription.type ? 
                        `${user.chatSubscription.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Subscription Expired` :
                        'Subscription Expired'
                      }
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">
                    Your subscription expired on {new Date(user.chatSubscription.expiresAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-gray-600 mb-3">
                    Renew to continue unlimited messaging and premium features
                  </p>
                  <button
                    onClick={() => navigate('/pricing')}
                    className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                  >
                    Renew Subscription
                  </button>
                </div>
              ) : (
                // Show no subscription info
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-gray-500" />
                    <span className="font-medium text-gray-700">No Active Subscription</span>
                  </div>
                  <p className="text-gray-600 mb-3">
                    Subscribe to unlock unlimited messaging and premium features
                  </p>
                  <button
                    onClick={() => navigate('/pricing')}
                    className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                  >
                    View Plans
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                >
                  <option value="all">All Transactions</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Search className="h-5 w-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 w-full sm:w-64"
              />
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Receipt className="h-6 w-6 text-rose-500" />
              Payment History
            </h2>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-600 mb-4">
                {transactions.length === 0 
                  ? "You haven't made any payments yet." 
                  : "No transactions match your current filters."}
              </p>
              {transactions.length === 0 && (
                <button
                  onClick={() => navigate('/pricing')}
                  className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                >
                  View Subscription Plans
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(transaction.status)}
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {transaction.subscription_plan.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Plan
                        </h3>
                        <p className="text-sm text-gray-600">Order #{transaction.order_id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">€{transaction.amount.toFixed(2)}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="font-medium">{getCryptoDisplayName(transaction.crypto_asset)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium">{formatDate(transaction.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Coins Added</p>
                      <div className="flex items-center gap-1">
                        <Coins className="h-4 w-4 text-rose-500" />
                        <span className="font-medium">{transaction.coins_added}</span>
                      </div>
                    </div>
                  </div>

                  {transaction.crypto_amount && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">Crypto Amount</p>
                      <p className="font-mono text-sm">{transaction.crypto_amount}</p>
                    </div>
                  )}

                  {transaction.transaction_hash && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">Transaction Hash</p>
                      <p className="font-mono text-xs text-gray-500 break-all">{transaction.transaction_hash}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Duration: {transaction.subscription_duration} days
                      </span>
                    </div>
                    
                    {transaction.status === 'completed' && (
                      <button
                        onClick={() => handleDownloadReceipt(transaction)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Download Receipt
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Support Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Payment Issues</h4>
              <p className="text-sm text-gray-600 mb-2">
                Having trouble with a payment or need a refund?
              </p>
              <a 
                href="mailto:billing@purelove.com" 
                className="text-rose-600 hover:text-rose-700 text-sm font-medium"
              >
                billing@purelove.com
              </a>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Subscription Support</h4>
              <p className="text-sm text-gray-600 mb-2">
                Questions about your subscription or features?
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
    </div>
  );
} 