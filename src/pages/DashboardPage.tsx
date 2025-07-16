import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  CreditCard, 
  Receipt, 
  Crown, 
  Coins, 
  Heart, 
  MessageCircle, 
  Eye, 
  Calendar, 
  TrendingUp, 
  Download, 
  Edit, 
  CheckCircle, 
  Clock, 
  XCircle, 
  RefreshCw,
  AlertCircle,
  Plus,
  Camera,
  Mail,
  Phone,
  MapPin,
  Globe,
  Star,
  Award,
  Shield,
  Zap,
  Activity,
  LogOut,
  Video,
  Gift,
  Gift as GiftIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { generateReceipt, createReceiptData, ReceiptTemplate } from '../lib/receiptGenerator';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

import { Navbar } from '../components/Navbar';
import toast from 'react-hot-toast';

interface Transaction {
  id: string;
  order_id?: string;
  user_id: string;
  subscription_plan?: string;
  amount: number;
  crypto_asset?: string;
  crypto_amount?: string;
  crypto_address?: string;
  transaction_hash?: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  created_at: string;
  expires_at?: string;
  coins_added?: number;
  subscription_duration?: number;
}

interface DashboardStats {
  profileViews: number;
  messagesReceived: number;
  profileCompleteness: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    profileViews: 0,
    messagesReceived: 0,
    profileCompleteness: 0
  });
  const [loading, setLoading] = useState(true);

  console.log('🔍 [DASHBOARD] DashboardPage rendered, user:', !!user, user?.email);

  useEffect(() => {
    console.log('🔍 [DASHBOARD] useEffect triggered, user:', !!user, user?.email);
    if (user) {
      console.log('✅ [DASHBOARD] User found, fetching dashboard data...');
      fetchDashboardData();
    } else {
      console.log('❌ [DASHBOARD] No user found, setting loading to false');
      setLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) {
      console.log('❌ [DASHBOARD] fetchDashboardData called without user');
      return;
    }

    console.log('🔄 [DASHBOARD] Starting to fetch dashboard data for user:', user.id);

    try {
      setLoading(true);

      // Fetch recent transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (transactionsError) {
        console.error('❌ [DASHBOARD] Transactions error:', transactionsError);
        throw transactionsError;
      }

      console.log('✅ [DASHBOARD] Transactions fetched:', transactionsData?.length || 0);

      // Calculate profile completeness
      const calculateCompleteness = () => {
        let completed = 0;
        const total = 10;
        
        if (user.firstName) completed++;
        if (user.lastName) completed++;
        if (user.bio) completed++;
        if (user.profession) completed++;
        if (user.country) completed++;
        if (user.city) completed++;
        if (user.photos && user.photos.length > 0) completed++;
        if (user.interests && user.interests.length > 0) completed++;
        if (user.languages && user.languages.length > 0) completed++;
        if (user.birthDate) completed++;
        
        return Math.round((completed / total) * 100);
      };

      // Mock stats for now (in real app, these would come from database)
      const mockStats = {
        profileViews: Math.floor(Math.random() * 100) + 50,
        messagesReceived: Math.floor(Math.random() * 25) + 10,
        profileCompleteness: calculateCompleteness()
      };

      setTransactions(transactionsData || []);
      setStats(mockStats);
      console.log('✅ [DASHBOARD] Dashboard data loaded successfully');
    } catch (error) {
      console.error('❌ [DASHBOARD] Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      console.log('✅ [DASHBOARD] Loading set to false');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'refunded':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
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
    try {
      if (!user?.email || !transaction.subscription_plan) {
        toast.error('Receipt data incomplete');
        return;
      }

      const receiptData = createReceiptData(
        transaction.id,
        transaction.subscription_plan,
        `${transaction.subscription_duration || 30} days`,
        user.email,
        transaction.amount,
        getCryptoDisplayName(transaction.crypto_asset || 'crypto'),
        transaction.created_at,
        transaction.expires_at || new Date(new Date(transaction.created_at).getTime() + (transaction.subscription_duration || 30) * 24 * 60 * 60 * 1000).toISOString(),
        transaction.coins_added || 0,
        getSubscriptionFeatures(transaction.subscription_plan),
        {
          cryptoAsset: getCryptoDisplayName(transaction.crypto_asset || 'crypto'),
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
      day: 'numeric'
    });
  };

  const currentSubscription = user?.chatSubscription;
  const isSubscriptionActive = currentSubscription && new Date(currentSubscription.expiresAt) > new Date();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'subscription', label: 'Subscription', icon: Crown },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <Navbar />
      <div className="py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-3 md:px-4">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.firstName || 'User'}!</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <Badge variant="secondary" className="font-medium text-xs md:text-sm">
                <Coins className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                {user?.coins || 0} Coins
              </Badge>
              {isSubscriptionActive && (
                <Badge className="bg-green-100 text-green-800 font-medium text-xs md:text-sm">
                  <Crown className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Premium Active
                </Badge>
              )}
            </div>
          </div>
          
          {/* User Profile Summary */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
              <div className="relative mx-auto sm:mx-0">
                <Avatar className="h-16 w-16 md:h-20 md:w-20">
                  <AvatarImage src={user?.photos?.[0] || "https://danielschule.de/wp-content/uploads/2019/12/avatar.jpg"} />
                  <AvatarFallback className="text-base md:text-lg">{user?.firstName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                {user?.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                    <Shield className="h-2 w-2 md:h-3 md:w-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  {user?.premium && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 mx-auto sm:mx-0 w-fit">
                      <Star className="h-2 w-2 md:h-3 md:w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs md:text-sm text-gray-600">
                  <div className="flex items-center justify-center sm:justify-start gap-1">
                    <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="truncate">{user?.city}, {user?.country}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-1">
                    <Mail className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="truncate">{user?.email}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-1">
                    <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">Joined </span>
                    <span>{formatDate(user?.createdAt || new Date().toISOString())}</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => navigate('/edit-profile')}
                className="bg-rose-500 hover:bg-rose-600 text-white w-full sm:w-auto text-sm md:text-base"
              >
                <Edit className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 md:mb-8">
          <div className="bg-white rounded-xl shadow-lg p-1 md:p-2">
            {/* Mobile: Column layout */}
            <div className="flex flex-col md:hidden space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
            
            {/* Desktop: Full width tabs */}
            <div className="hidden md:flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6 md:space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="bg-blue-100 p-2 md:p-3 rounded-lg">
                    <Eye className="h-4 w-4 md:h-6 md:w-6 text-blue-600" />
                  </div>
                  <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                </div>
                <h3 className="text-lg md:text-2xl font-bold text-gray-900">{stats.profileViews}</h3>
                <p className="text-gray-600 text-xs md:text-sm">Profile Views</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="bg-green-100 p-2 md:p-3 rounded-lg">
                    <MessageCircle className="h-4 w-4 md:h-6 md:w-6 text-green-600" />
                  </div>
                  <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                </div>
                <h3 className="text-lg md:text-2xl font-bold text-gray-900">{stats.messagesReceived}</h3>
                <p className="text-gray-600 text-xs md:text-sm">Messages Received</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="bg-purple-100 p-2 md:p-3 rounded-lg">
                    <Award className="h-4 w-4 md:h-6 md:w-6 text-purple-600" />
                  </div>
                  <span className="text-xs md:text-sm text-gray-500">{stats.profileCompleteness}%</span>
                </div>
                <h3 className="text-lg md:text-2xl font-bold text-gray-900">{stats.profileCompleteness}%</h3>
                <p className="text-gray-600 text-xs md:text-sm">Profile Complete</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <Button
                  onClick={() => navigate('/browse')}
                  className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white p-3 md:p-4 h-auto justify-start"
                >
                  <Heart className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium text-sm md:text-base">Find Matches</div>
                    <div className="text-xs md:text-sm opacity-90">Browse profiles</div>
                  </div>
                </Button>
                
                <Button
                  onClick={() => {
                    toast.success('Chat feature will open in the navbar');
                    // Note: In a real app, this would trigger the chat window
                    // For now, we'll show a message since chat is handled by navbar
                  }}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white p-3 md:p-4 h-auto justify-start"
                >
                  <MessageCircle className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium text-sm md:text-base">Messages</div>
                    <div className="text-xs md:text-sm opacity-90">Use chat button in navbar</div>
                  </div>
                </Button>
                
                <Button
                  onClick={() => navigate('/pricing')}
                  className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white p-3 md:p-4 h-auto justify-start"
                >
                  <Crown className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium text-sm md:text-base">Upgrade</div>
                    <div className="text-xs md:text-sm opacity-90">Get premium features</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
              {transactions.length === 0 ? (
                <div className="text-center py-6 md:py-8">
                  <Receipt className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-sm md:text-base">No transactions yet</p>
                  <Button
                    onClick={() => navigate('/pricing')}
                    className="mt-4 bg-rose-500 hover:bg-rose-600 text-white text-sm md:text-base"
                  >
                    View Plans
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {transactions.slice(0, 3).map((transaction) => (
                    <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 border border-gray-200 rounded-lg gap-3 sm:gap-0">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(transaction.status)}
                        <div>
                          <p className="font-medium text-gray-900 text-sm md:text-base">
                            {(transaction.subscription_plan && typeof transaction.subscription_plan === 'string') ? 
                              transaction.subscription_plan.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) + ' Plan' :
                              'Subscription Plan'
                            }
                          </p>
                          <p className="text-xs md:text-sm text-gray-600">{formatDate(transaction.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="font-semibold text-gray-900 text-sm md:text-base">€{transaction.amount.toFixed(2)}</p>
                        {transaction.status === 'completed' && (
                          <Button
                            onClick={() => handleDownloadReceipt(transaction)}
                            variant="ghost"
                            size="sm"
                            className="text-rose-600 hover:text-rose-700 text-xs md:text-sm p-0 h-auto mt-1"
                          >
                            <Download className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                            Receipt
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    onClick={() => setActiveTab('billing')}
                    variant="outline"
                    className="w-full text-sm md:text-base"
                  >
                    View All Transactions
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3 sm:gap-0">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Profile Information</h2>
              <Button
                onClick={() => navigate('/edit-profile')}
                className="bg-rose-500 hover:bg-rose-600 text-white w-full sm:w-auto text-sm md:text-base"
              >
                <Edit className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                Edit Profile
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Basic Information</label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="h-3 w-3 md:h-4 md:w-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm md:text-base truncate">{user?.firstName} {user?.lastName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-3 w-3 md:h-4 md:w-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm md:text-base truncate">{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-3 w-3 md:h-4 md:w-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm md:text-base truncate">{user?.city}, {user?.country}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-3 w-3 md:h-4 md:w-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm md:text-base">{user?.birthDate ? new Date(user.birthDate).toLocaleDateString() : 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">About Me</label>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg text-sm md:text-base">
                    {user?.bio || 'No bio added yet. Click Edit Profile to add one.'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
                  <p className="text-gray-600 text-sm md:text-base">
                    {user?.profession || 'Not specified'}
                  </p>
                </div>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {user?.interests && user.interests.length > 0 ? (
                      user.interests.map((interest, index) => (
                        <Badge key={index} variant="secondary" className="text-xs md:text-sm">
                          {interest}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-500 text-xs md:text-sm">No interests added yet</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                  <div className="flex flex-wrap gap-2">
                    {user?.languages && user.languages.length > 0 ? (
                      user.languages.map((language, index) => (
                        <Badge key={index} variant="outline" className="text-xs md:text-sm">
                          <Globe className="h-2 w-2 md:h-3 md:w-3 mr-1" />
                          {language}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-500 text-xs md:text-sm">No languages added yet</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Completeness</label>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{stats.profileCompleteness}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-rose-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stats.profileCompleteness}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Complete your profile to get more matches and views
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="space-y-4 md:space-y-6">
            {/* Always show coin balance - no subscription logic needed */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4 md:p-6">
              <div className="text-center">
                <div className="bg-amber-100 h-16 w-16 md:h-20 md:w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="h-8 w-8 md:h-10 md:w-10 text-amber-600" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-amber-800 mb-2">{user?.coins || 0} Coins</h3>
                <p className="text-amber-700 mb-4 text-sm md:text-base">
                  Use your coins for messages, calls, gifts, and premium features
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    onClick={() => navigate('/pricing')}
                    className="bg-amber-500 hover:bg-amber-600 text-white text-sm md:text-base"
                  >
                    Buy More Coins
                  </Button>
                  <Button
                    onClick={() => navigate('/browse')}
                    variant="outline"
                    className="text-amber-600 border-amber-300 hover:bg-amber-50 text-sm md:text-base"
                  >
                    Start Messaging
                  </Button>
                </div>
              </div>
            </div>

            {/* Coin Usage Guide */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">How to Use Your Coins</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <MessageCircle className="h-4 w-4 md:h-5 md:w-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <span className="text-xs md:text-sm font-medium block">Send Messages</span>
                    <span className="text-xs text-blue-600">Subscription</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <Gift className="h-4 w-4 md:h-5 md:w-5 text-purple-600 flex-shrink-0" />
                  <div>
                    <span className="text-xs md:text-sm font-medium block">Virtual Gifts</span>
                    <span className="text-xs text-purple-600">5-50 coins each</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <Phone className="h-4 w-4 md:h-5 md:w-5 text-orange-600 flex-shrink-0" />
                  <div>
                    <span className="text-xs md:text-sm font-medium block">Voice Calls</span>
                    <span className="text-xs text-orange-600">400 coins/min</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Video className="h-4 w-4 md:h-5 md:w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <span className="text-xs md:text-sm font-medium block">Video Calls</span>
                    <span className="text-xs text-green-600">1000 coins/min</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-lg">
                  <Phone className="h-4 w-4 md:h-5 md:w-5 text-rose-600 flex-shrink-0" />
                  <div>
                    <span className="text-xs md:text-sm font-medium block">Contact Info</span>
                    <span className="text-xs text-rose-600">700 coins</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-4 md:space-y-6">
            {/* Billing Overview */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-3 sm:gap-0">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-rose-500" />
                  Billing & Payments
                </h2>
                <Button
                  onClick={() => navigate('/billing')}
                  variant="outline"
                  className="w-full sm:w-auto text-sm md:text-base"
                >
                  <Settings className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                  Manage Billing
                </Button>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-6 md:py-8">
                  <Receipt className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No Payment History</h3>
                  <p className="text-gray-600 text-sm md:text-base">
                    Your payment history will appear here once you make a purchase
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                        <span className="text-xs md:text-sm font-medium text-blue-800">Total Spent</span>
                      </div>
                      <p className="text-lg md:text-2xl font-bold text-blue-900">
                        €{transactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                        <span className="text-xs md:text-sm font-medium text-green-800">Completed</span>
                      </div>
                      <p className="text-lg md:text-2xl font-bold text-green-900">
                        {transactions.filter(t => t.status === 'completed').length}
                      </p>
                    </div>
                    
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 md:h-5 md:w-5 text-yellow-600" />
                        <span className="text-xs md:text-sm font-medium text-yellow-800">Pending</span>
                      </div>
                      <p className="text-lg md:text-2xl font-bold text-yellow-900">
                        {transactions.filter(t => t.status === 'pending').length}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Transaction History */}
            {transactions.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
                <div className="space-y-3 md:space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="border border-gray-200 rounded-lg p-3 md:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(transaction.status)}
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                              <p className="font-medium text-gray-900 text-sm md:text-base">
                                {(transaction.subscription_plan && typeof transaction.subscription_plan === 'string') ? 
                                  transaction.subscription_plan.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) + ' Plan' :
                                  'Subscription Plan'
                                }
                              </p>
                              <span className="text-xs text-gray-500">
                                #{(transaction.order_id || 'unknown').slice(-8)}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs md:text-sm text-gray-600">
                              <span>{formatDate(transaction.created_at)}</span>
                              <span className="hidden sm:inline">•</span>
                              <span>{getCryptoDisplayName(transaction.crypto_asset || 'crypto')}</span>
                              <span className="hidden sm:inline">•</span>
                              <span>{transaction.crypto_amount || '0'} {(transaction.crypto_asset || 'crypto').toUpperCase()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-semibold text-gray-900 text-sm md:text-base">€{transaction.amount.toFixed(2)}</p>
                          <div className="flex flex-col sm:items-end gap-1 mt-1">
                            <Badge 
                              variant={transaction.status === 'completed' ? 'default' : 
                                     transaction.status === 'pending' ? 'secondary' : 'destructive'}
                              className="text-xs w-fit"
                            >
                              {transaction.status}
                            </Badge>
                            {transaction.status === 'completed' && (
                              <Button
                                onClick={() => handleDownloadReceipt(transaction)}
                                variant="ghost"
                                size="sm"
                                className="text-rose-600 hover:text-rose-700 text-xs p-0 h-auto"
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Receipt
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3 sm:gap-0">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">Account Settings</h2>
                <Button
                  onClick={() => navigate('/settings')}
                  variant="outline"
                  className="w-full sm:w-auto text-sm md:text-base"
                >
                  <Settings className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                  Advanced Settings
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-4 md:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Information</label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Mail className="h-3 w-3 md:h-4 md:w-4 text-gray-500" />
                          <span className="text-xs md:text-sm text-gray-700">Email Address</span>
                        </div>
                        <span className="text-xs md:text-sm font-medium truncate ml-2">{user?.email}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-3 w-3 md:h-4 md:w-4 text-gray-500" />
                          <span className="text-xs md:text-sm text-gray-700">Member Since</span>
                        </div>
                        <span className="text-xs md:text-sm font-medium">{formatDate(user?.createdAt || new Date().toISOString())}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Shield className="h-3 w-3 md:h-4 md:w-4 text-gray-500" />
                          <span className="text-xs md:text-sm text-gray-700">Account Status</span>
                        </div>
                        <Badge variant={user?.verified ? 'default' : 'secondary'} className="text-xs">
                          {user?.verified ? 'Verified' : 'Unverified'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quick Actions</label>
                    <div className="space-y-3">
                      <Button
                        onClick={() => navigate('/edit-profile')}
                        variant="outline"
                        className="w-full justify-start text-sm md:text-base"
                      >
                        <Edit className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Button
                        onClick={() => navigate('/settings')}
                        variant="outline"
                        className="w-full justify-start text-sm md:text-base"
                      >
                        <Settings className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                        Privacy Settings
                      </Button>
                      <Button
                        onClick={() => navigate('/billing')}
                        variant="outline"
                        className="w-full justify-start text-sm md:text-base"
                      >
                        <CreditCard className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                        Billing Information
                      </Button>
                      <Button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to sign out?')) {
                            supabase.auth.signOut();
                          }
                        }}
                        variant="outline"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 text-sm md:text-base"
                      >
                        <LogOut className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}