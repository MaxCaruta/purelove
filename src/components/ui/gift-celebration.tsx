import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Star } from 'lucide-react';

interface GiftCelebrationProps {
  isVisible: boolean;
  gift: {
    name: string;
    image: string; // for real gifts
    cost: number;
    category: string;
    giftType: 'real';
  } | null;
  recipientName: string;
  onComplete: () => void;
}

// Confetti particle component
const ConfettiParticle = ({ delay = 0 }: { delay?: number }) => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{ backgroundColor: color }}
      initial={{
        x: Math.random() * 400 - 200,
        y: -20,
        rotate: 0,
        scale: 0,
      }}
      animate={{
        x: Math.random() * 600 - 300,
        y: 400,
        rotate: 360,
        scale: [0, 1, 0.8, 0],
      }}
      transition={{
        duration: 3,
        delay: delay,
        ease: "easeOut",
      }}
    />
  );
};

// Floating hearts animation
const FloatingHeart = ({ delay = 0 }: { delay?: number }) => {
  return (
    <motion.div
      className="absolute text-red-400"
      initial={{
        x: Math.random() * 300 - 150,
        y: 100,
        scale: 0,
        rotate: 0,
      }}
      animate={{
        x: Math.random() * 400 - 200,
        y: -100,
        scale: [0, 1.2, 0.8, 0],
        rotate: [0, 15, -15, 0],
      }}
      transition={{
        duration: 2.5,
        delay: delay,
        ease: "easeOut",
      }}
    >
      <Heart className="w-6 h-6 fill-current" />
    </motion.div>
  );
};

// Sparkle animation
const SparkleEffect = ({ delay = 0 }: { delay?: number }) => {
  return (
    <motion.div
      className="absolute text-yellow-400"
      initial={{
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        scale: 0,
        rotate: 0,
      }}
      animate={{
        scale: [0, 1, 0],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 1.5,
        delay: delay,
        ease: "easeOut",
      }}
    >
      <Sparkles className="w-4 h-4 fill-current" />
    </motion.div>
  );
};

export function GiftCelebration({ isVisible, gift, recipientName, onComplete }: GiftCelebrationProps) {
  const [showMessage, setShowMessage] = useState(false);
  const [playSound, setPlaySound] = useState(false);

  useEffect(() => {
    if (isVisible && gift) {
      // Show celebration message after a short delay
      const messageTimer = setTimeout(() => {
        setShowMessage(true);
      }, 500);

      // Play celebration sound
      setPlaySound(true);

      // Complete the celebration after animation
      const completeTimer = setTimeout(() => {
        onComplete();
      }, 2500);

      return () => {
        clearTimeout(messageTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [isVisible, gift, onComplete]);

  // Play celebration sound effect
  useEffect(() => {
    if (playSound && isVisible) {
      // Create a simple celebration sound using Web Audio API
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create a sequence of cheerful tones
        const playTone = (frequency: number, startTime: number, duration: number) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = frequency;
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
          
          oscillator.start(startTime);
          oscillator.stop(startTime + duration);
        };

        const now = audioContext.currentTime;
        // Play a cheerful melody
        playTone(523, now, 0.2); // C5
        playTone(659, now + 0.1, 0.2); // E5
        playTone(784, now + 0.2, 0.3); // G5
        playTone(1047, now + 0.4, 0.4); // C6
      } catch (error) {
        console.log('Audio not supported');
      }
      
      setPlaySound(false);
    }
  }, [playSound, isVisible]);

  if (!isVisible || !gift) return null;

  const getCelebrationMessage = () => {
    const messages = [
      `${gift.name} sent with love! 💕`,
      `${recipientName} will love this ${gift.name}! ✨`,
      `What a thoughtful gift! 🎁`,
      `${gift.name} delivered with sparkles! ⭐`,
      `Special delivery for ${recipientName}! 🚀`,
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getGiftAnimation = () => {
    switch (gift.category) {
      case 'romantic':
        return 'animate-pulse';
      case 'luxury':
        return 'animate-bounce';
      case 'celebration':
        return 'animate-spin';
      default:
        return 'animate-pulse';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 pointer-events-none"
      >
        {/* Confetti particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <ConfettiParticle key={`confetti-${i}`} delay={i * 0.1} />
        ))}

        {/* Floating hearts for romantic gifts */}
        {gift.category === 'romantic' && Array.from({ length: 5 }).map((_, i) => (
          <FloatingHeart key={`heart-${i}`} delay={i * 0.3} />
        ))}

        {/* Sparkles for luxury gifts */}
        {gift.category === 'luxury' && Array.from({ length: 8 }).map((_, i) => (
          <SparkleEffect key={`sparkle-${i}`} delay={i * 0.2} />
        ))}

        {/* Main gift animation - more subtle */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 1.2, 1],
            opacity: [0, 1, 0.8],
          }}
          transition={{ 
            duration: 1,
            ease: "easeOut",
            times: [0, 0.7, 1]
          }}
          className="text-center relative"
        >
          {/* Gift emoji/image with gentle pulse */}
          <div className="text-6xl flex items-center justify-center">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: 2,
                ease: "easeInOut"
              }}
              className="flex items-center justify-center"
            >
              <img 
                src={gift.image} 
                alt={gift.name}
                className="w-24 h-24 object-cover rounded-lg shadow-lg"
              />
            </motion.div>
          </div>

          {/* Subtle celebration indicator - gift emoji/image floating up */}
          <AnimatePresence>
            {showMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: -100 }}
                exit={{ opacity: 0, scale: 0.5, y: -150 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 0.5, 
                    repeat: 3,
                    ease: "easeInOut"
                  }}
                  className="flex items-center justify-center"
                >
                  <img 
                    src={gift.image} 
                    alt={gift.name}
                    className="w-16 h-16 object-cover rounded-lg shadow-lg"
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Subtle radiating circles */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {Array.from({ length: 2 }).map((_, i) => (
              <motion.div
                key={`circle-${i}`}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border border-rose-200 rounded-full"
                initial={{ width: 0, height: 0, opacity: 0.8 }}
                animate={{
                  width: [0, 150, 200],
                  height: [0, 150, 200],
                  opacity: [0.8, 0.3, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.2,
                  ease: "easeOut",
                }}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Background glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-rose-200/20 via-transparent to-transparent"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1.5 }}
          transition={{ duration: 1.5 }}
        />
      </motion.div>
    </AnimatePresence>
  );
} 