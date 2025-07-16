import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Check, MessageCircle, Video, Phone, Gift, Star, Shield, Clock, Users, ChevronDown, ChevronUp, Heart, Zap, Crown, Coins, Calendar } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CoinPackage } from '@/components/CoinPackage';
import { SubscriptionPackage } from '@/components/SubscriptionCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { coinPackages, subscriptionPackages, coinPrices, actionDescriptions } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useToast, ToastContainer } from '@/components/ui/toast';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    id: 1,
    question: "How do coins work?",
    answer: "Coins are our virtual currency that you can use to access premium features like messaging, video calls, and sending gifts. Each action costs a specific number of coins - you only pay for what you use!"
  },
  {
    id: 2,
    question: "Do coins expire?",
    answer: "No, your coins never expire. Once purchased, they remain in your account until you use them."
  },
  {
    id: 3,
    question: "How much do different actions cost?",
    answer: "Messages require a subscription, virtual gifts range from 5-50 coins depending on the gift, video calls cost 1000 coins per minute, voice calls cost 400 coins per minute, and viewing contact info costs 700 coins."
  },
  {
    id: 4,
    question: "Can I get a refund for unused coins?",
    answer: "We do not offer refunds for purchased coins. However, you can use them at any time as they never expire."
  },
  {
    id: 5,
    question: "What payment methods do you accept?",
    answer: "We accept cryptocurrency payments including Bitcoin, Ethereum, USDT, and other major cryptocurrencies for secure and private transactions."
  },
  {
    id: 6,
    question: "Is my payment information secure?",
    answer: "Yes, all cryptocurrency payments are processed securely through blockchain technology. We never store your private keys or wallet information."
  },
  {
    id: 7,
    question: "Do I get bonus coins with larger packages?",
    answer: "Yes! Larger coin packages include bonus coins. The 500-coin package includes 50 bonus coins, 1000-coin package includes 150 bonus coins, and 2000-coin package includes 400 bonus coins."
  },
  {
    id: 8,
    question: "How do I contact customer support?",
    answer: "You can reach our 24/7 customer support team through the help section in your account, or email us at support@purelove.com. We typically respond within 2 hours."
  }
];

const testimonials = [
  {
    id: 1,
    name: "Michael R.",
    age: 32,
    text: "I love the coin system! I only pay for what I use and never waste money on unused features.",
    rating: 5,
    location: "New York, USA"
  },
  {
    id: 2,
    name: "David L.",
    age: 28,
    text: "The pay-per-use model is perfect for me. I can control my spending and use coins when I really want to connect with someone special.",
    rating: 5,
    location: "London, UK"
  },
  {
    id: 3,
    name: "James K.",
    age: 35,
    text: "Found my soulmate here! The video calls feature helped us connect on a deeper level. Worth every coin!",
    rating: 5,
    location: "Toronto, Canada"
  }
];

export function PricingPage() {
  const [activeTab, setActiveTab] = useState<'payPerUse' | 'subscription'>('subscription');
  const [selectedCoinPackage, setSelectedCoinPackage] = useState<number | null>(null);
  const [selectedSubscriptionPackage, setSelectedSubscriptionPackage] = useState<string | null>(null);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  
  const handleSelectCoinPackage = (id: number) => {
    setSelectedCoinPackage(id);
    setSelectedSubscriptionPackage(null); // Clear subscription selection
    console.log('Selected coin package:', id);
    
    // Navigate to checkout page with the selected package
    navigate(`/checkout?package=${id}`);
  };

  const handleSelectSubscriptionPackage = (id: string) => {
    setSelectedSubscriptionPackage(id);
    setSelectedCoinPackage(null); // Clear coin package selection
    console.log('Selected subscription package:', id);
    
    // Navigate to checkout page with the selected subscription
    navigate(`/checkout?subscription=${id}`);
  };

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white py-16 sm:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Pay Only for What You Use
            </h1>
            <p className="text-xl sm:text-2xl opacity-90 mb-8 leading-relaxed">
              Buy coins and spend them on messages, calls, gifts, and premium features. No subscriptions, no waste!
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-lg">
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                <Shield className="h-5 w-5" />
                <span>Secure Crypto Payments</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                <Users className="h-5 w-5" />
                <span>50,000+ Members</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                <Heart className="h-5 w-5" />
                <span>1,000+ Success Stories</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <main className="flex-1 py-8 sm:py-16">
        <div className="container mx-auto px-4">
          
          {/* Current Balance */}
          {user && (
            <div className="mb-12 sm:mb-16">
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-6 sm:p-8 text-center shadow-lg">
                <div className="bg-amber-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-amber-800 mb-2">Your Current Balance</h3>
                <p className="text-amber-700 mb-4 text-3xl font-bold">
                  {user.coins || 0} Coins
                </p>
                <div className="text-sm text-amber-600">
                  ✨ Use your coins for messages, calls, gifts, and more!
                </div>
              </div>
            </div>
          )}

          {/* Action Costs Overview */}
          <div className="mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              What Can You Do With Coins?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="bg-blue-100 h-12 w-12 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Send Messages</h3>
                <p className="text-gray-600 mb-3">Connect with amazing women</p>
                <div className="text-2xl font-bold text-blue-600">Subscription</div>
                <p className="text-sm text-gray-500">required</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="bg-purple-100 h-12 w-12 rounded-full flex items-center justify-center mb-4">
                  <Gift className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Virtual Gifts</h3>
                <p className="text-gray-600 mb-3">Show your appreciation</p>
                <div className="text-2xl font-bold text-purple-600">5-50 coins</div>
                <p className="text-sm text-gray-500">per gift</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="bg-orange-100 h-12 w-12 rounded-full flex items-center justify-center mb-4">
                  <Phone className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Voice Calls</h3>
                <p className="text-gray-600 mb-3">High-quality voice chat</p>
                <div className="text-2xl font-bold text-orange-600">{coinPrices.voiceCall} coins</div>
                <p className="text-sm text-gray-500">per minute</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="bg-green-100 h-12 w-12 rounded-full flex items-center justify-center mb-4">
                  <Video className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Video Calls</h3>
                <p className="text-gray-600 mb-3">Face-to-face conversations</p>
                <div className="text-2xl font-bold text-green-600">{coinPrices.videoCall} coins</div>
                <p className="text-sm text-gray-500">per minute</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="bg-rose-100 h-12 w-12 rounded-full flex items-center justify-center mb-4">
                  <Phone className="h-6 w-6 text-rose-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Contact Info</h3>
                <p className="text-gray-600 mb-3">WhatsApp, Email addresses</p>
                <div className="text-2xl font-bold text-rose-600">{coinPrices.contactInfo} coins</div>
                <p className="text-sm text-gray-500">one-time access</p>
              </div>
            </div>
          </div>

          {/* Pricing Tabs */}
          <div className="mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              Choose Your Pricing Plan
            </h2>
            
            {/* Tab Navigation */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-100 rounded-lg p-1 inline-flex">
                <button
                  onClick={() => setActiveTab('payPerUse')}
                  className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                    activeTab === 'payPerUse'
                      ? 'bg-white text-rose-600 shadow-md'
                      : 'text-gray-600 hover:text-rose-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4" />
                    Pay Per Use
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('subscription')}
                  className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                    activeTab === 'subscription'
                      ? 'bg-white text-rose-600 shadow-md'
                      : 'text-gray-600 hover:text-rose-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Subscription Plans
                  </div>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'payPerUse' && (
              <div className="animate-fade-in">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Pay Per Use - Coin Packages</h3>
                  <p className="text-gray-600">Buy coins and use them for messages, calls, gifts, and more. No monthly fees!</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {coinPackages.map((pkg) => (
                    <CoinPackage
                      key={pkg.id}
                      id={pkg.id}
                      amount={pkg.amount}
                      price={pkg.price}
                      bonus={pkg.bonus}
                      popular={pkg.popular}
                      selected={selectedCoinPackage === pkg.id}
                      onSelect={handleSelectCoinPackage}
                    />
                  ))}
                </div>
                
                {/* Proceed to Checkout Button */}
                {selectedCoinPackage && (
                  <div className="text-center mt-8">
                    <Button 
                      onClick={() => navigate(`/checkout?package=${selectedCoinPackage}`)}
                      className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Proceed to Checkout
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'subscription' && (
              <div className="animate-fade-in">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Subscription Plans</h3>
                  <p className="text-gray-600">Get unlimited access to premium features with our monthly subscription plans.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {subscriptionPackages.map((pkg) => (
                    <SubscriptionPackage
                      key={pkg.id}
                      id={pkg.id}
                      name={pkg.name}
                      duration={pkg.duration}
                      durationUnit={pkg.durationUnit}
                      price={pkg.price}
                      features={pkg.features}
                      popular={pkg.popular}
                      selected={selectedSubscriptionPackage === pkg.id}
                      onSelect={handleSelectSubscriptionPackage}
                    />
                  ))}
                </div>
                
                {/* Proceed to Checkout Button */}
                {selectedSubscriptionPackage && (
                  <div className="text-center mt-8">
                    <Button 
                      onClick={() => navigate(`/checkout?subscription=${selectedSubscriptionPackage}`)}
                      className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Proceed to Checkout
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Testimonials */}
          <div className="mb-16 sm:mb-20">
            <div className="text-center mb-12">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">What Our Members Say</h3>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
                Join thousands of happy couples who found love through our platform
              </p>
              {/* Fake Trustpilot Badge */}
              <div className="inline-flex flex-col items-center gap-3 bg-white rounded-lg shadow-md px-6 py-3 border">
                <div className="flex items-center gap-2">
                  
                  <img src="/lcn/trustpilot-logo.png" alt="Trustpilot" width={150} height={150} />
                  {/* <span className="font-bold text-green-600">Trustpilot</span> */}
                </div>
                
                <div className="text-sm text-slate-600">
                  <span className="font-semibold">4.8/5</span> based on 2,847 reviews
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="hover:shadow-lg transition-all duration-300 relative">
                  <CardContent className="p-6">
                    {/* Trustpilot-style header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-green-500 fill-current" />
                        ))}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                      <img src="/lcn/trustpilot-logo2.png" alt="Trustpilot" width={80} height={80} />
                        
                      </div>
                    </div>
                    <p className="text-slate-600 mb-4 italic">"{testimonial.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold">{testimonial.name}, {testimonial.age}</div>
                        <div className="text-sm text-slate-500">{testimonial.location}</div>
                        <div className="text-xs text-slate-400">Verified Customer</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="mb-16 sm:mb-20">
            <div className="text-center mb-12">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">Frequently Asked Questions</h3>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Everything you need to know about our pricing and features
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <button
                        onClick={() => toggleFAQ(item.id)}
                        className="w-full p-6 text-left hover:bg-slate-50 transition-colors duration-200 flex items-center justify-between"
                      >
                        <h4 className="font-semibold text-lg pr-4">{item.question}</h4>
                        {openFAQ === item.id ? (
                          <ChevronUp className="h-5 w-5 text-slate-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0" />
                        )}
                      </button>
                      {openFAQ === item.id && (
                        <div className="px-6 pb-6">
                          <p className="text-slate-600 leading-relaxed">{item.answer}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Security & Trust */}
          <div className="mb-16">
            <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-0">
              <CardContent className="p-8 sm:p-12 text-center">
                <div className="max-w-3xl mx-auto">
                  <Shield className="h-16 w-16 text-slate-600 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-4">Your Security is Our Priority</h3>
                  <p className="text-lg text-slate-600 mb-6">
                    All cryptocurrency payments are processed securely through blockchain technology. 
                    Your personal and financial information is always protected.
                  </p>
                  <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Blockchain Security</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>24/7 Support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Money Back Guarantee</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
}
