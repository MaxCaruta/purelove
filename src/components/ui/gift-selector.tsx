import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Coins, Plus, Minus, ShoppingBag } from 'lucide-react';
import { getGiftsByCategory, getGiftCategories } from '@/lib/utils';
import type { RealGift } from '@/lib/utils';

interface GiftSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGift: (gift: RealGift, type: 'real', quantity?: number) => void;
  userCoins: number;
  recipientName: string;
}

export function GiftSelector({ isOpen, onClose, onSelectGift, userCoins, recipientName }: GiftSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [gifts, setGifts] = useState<RealGift[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // Load gifts from database
  useEffect(() => {
    const loadGifts = async () => {
      if (!isOpen) return;
      
      try {
        const [allGifts, allCategories] = await Promise.all([
          getGiftsByCategory(selectedCategory === 'all' ? undefined : selectedCategory),
          getGiftCategories()
        ]);
        setGifts(allGifts);
        setCategories(['all', ...allCategories]);
      } catch (error) {
        console.error('Error loading gifts:', error);
      }
    };

    loadGifts();
  }, [isOpen, selectedCategory]);

  // Get gift quantity
  const getQuantity = (giftId: string) => quantities[giftId] || 1;

  // Set gift quantity  
  const setQuantity = (giftId: string, quantity: number) => {
    setQuantities(prev => ({ ...prev, [giftId]: Math.max(1, quantity) }));
  };

  // Category display names and icons
  const categoryInfo: Record<string, { name: string; icon: string }> = {
    all: { name: 'All Gifts', icon: '🎁' },
    flowers: { name: 'Flowers', icon: '🌹' },
    perfumes: { name: 'Perfumes', icon: '💐' },
    gift_baskets: { name: 'Gift Baskets', icon: '🧺' },
    electronics: { name: 'Electronics', icon: '📱' },
    jewelry: { name: 'Jewelry', icon: '💎' },
    beauty: { name: 'Beauty', icon: '💄' },
    fashion: { name: 'Fashion', icon: '👗' },
    home: { name: 'Home', icon: '🏠' },
  };

  // Get category display info with fallback
  const getCategoryInfo = (category: string) => {
    const info = categoryInfo[category];
    if (info) return info;
    
    // Fallback for unknown categories
    const fallbackName = category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ');
    return {
      name: fallbackName,
      icon: '🎁'
    };
  };

  const handleGiftSelect = (gift: RealGift) => {
    const quantity = getQuantity(gift.id);
    onSelectGift(gift, 'real', quantity);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 px-4 sm:px-6 py-4 sm:py-4 border-b border-gray-200">
            <div className="flex items-start sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">Send a Gift to {recipientName}</h2>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Choose the perfect gift to make them smile</p>
              </div>
              <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 flex-shrink-0">
                <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                  <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-semibold text-sm sm:text-base">{userCoins} coins</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white border-b border-gray-200">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              
              {categories.map((category) => {
                const { name, icon } = getCategoryInfo(category);
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1 sm:space-x-2 ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{icon}</span>
                    <span className="hidden sm:inline">{name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gift Grid */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6">
            {gifts.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">😔</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No gifts available</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  {userCoins === 0 
                    ? "You don't have enough coins. Purchase more coins to send gifts!"
                    : "Try selecting a different category."
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {gifts.map((gift, index) => {
                  const quantity = getQuantity(gift.id);
                  const totalCost = gift.cost * quantity;
                  const canAfford = totalCost <= userCoins;

                  return (
                    <motion.div
                      key={gift.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`bg-white rounded-xl border-2 overflow-hidden transition-all hover:shadow-lg ${
                        canAfford ? 'border-gray-200 hover:border-emerald-300' : 'border-gray-100 opacity-60'
                      }`}
                    >
                      {/* Real gift image */}
                      <div className="bg-gray-50">
                        <img
                          src={gift.image}
                          alt={gift.name}
                          className="w-full h-32 sm:h-48 object-cover"
                        />
                      </div>

                      {/* Real gift content */}
                      <div className="p-3 sm:p-4">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-2 line-clamp-2">
                          {gift.name}
                        </h3>
                        
                        {gift.description && (
                          <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
                            {gift.description}
                          </p>
                        )}

                        {/* Price */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <span className="text-lg sm:text-xl font-bold text-gray-900">{totalCost}</span>
                              <span className="text-sm text-amber-600">coins</span>
                            </div>
                          </div>
                          {totalCost !== gift.cost && (
                            <div className="text-xs text-gray-500">
                              {gift.cost} coins each
                            </div>
                          )}
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center justify-center space-x-3 mb-3">
                          <button
                            onClick={() => setQuantity(gift.id, Math.max(1, quantity - 1))}
                            disabled={quantity <= 1}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <span className="text-lg font-semibold min-w-[2rem] text-center">{quantity}</span>
                          <button
                            onClick={() => setQuantity(gift.id, Math.max(1, quantity + 1))}
                            disabled={!canAfford}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>

                        {/* Send Gift Button */}
                        <button
                          onClick={() => handleGiftSelect(gift)}
                          disabled={!canAfford}
                          className={`w-full py-2.5 sm:py-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center space-x-2 ${
                            canAfford
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-md hover:shadow-lg'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>
                            {canAfford ? 'SEND GIFT' : `Need ${totalCost - userCoins} more coins`}
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4" />
                  <span>Virtual purchase with coins</span>
                </div>
              </div>
              <div className="text-right">
                <span>Showing {gifts.length} gift{gifts.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 