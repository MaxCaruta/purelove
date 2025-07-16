import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Volume2, VolumeX, User } from 'lucide-react';
import { Profile } from '@/types';

interface CallModalProps {
  isOpen: boolean;
  isVideoCall: boolean;
  profile: Profile;
  onEndCall: () => void;
  userName: string;
}

export function CallModal({ isOpen, isVideoCall, profile, onEndCall, userName }: CallModalProps) {
  const [callStatus, setCallStatus] = useState<'connecting' | 'ringing' | 'ended'>('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const ringTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const syntheticIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize call sounds and video
  useEffect(() => {
    if (isOpen && callStatus === 'connecting') {
      // Initialize user camera for video calls
      if (isVideoCall) {
        initializeUserCamera();
      }

      // Start with connecting sound
      setTimeout(() => {
        setCallStatus('ringing');
        
        // Play ringing sound
        const audio = new Audio('/sounds/ringtone.mp3');
        audio.loop = true;
        audio.volume = 0.5;
        audioRef.current = audio;
        
        audio.play().catch(e => {
          console.log('Could not play ringtone:', e);
          // Fallback: create synthetic ringtone
          createSyntheticRingtone();
        });

        // Auto-end call after 15 seconds of ringing
        ringTimerRef.current = setTimeout(() => {
          endCall();
        }, 15000);
        
      }, 2000); // 2 seconds connecting delay
    }

    return () => {
      cleanupAudio();
      cleanupVideo();
    };
  }, [isOpen, isVideoCall]);

  // Initialize user camera
  const initializeUserCamera = async () => {
    try {
      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }, 
        audio: false 
      });
      
      console.log('Camera stream obtained:', stream);
      streamRef.current = stream;
      setHasCamera(true);
      
      // Wait a bit for video element to be ready
      setTimeout(() => {
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.log('Video play error:', e));
          console.log('Video stream assigned to element');
        }
      }, 100);
      
    } catch (error) {
      console.error('Could not access camera:', error);
      // Camera access failed, but call can continue
    }
  };

  // Cleanup functions
  const cleanupAudio = () => {
    console.log('Cleaning up audio...');
    
    // Stop regular audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
      audioRef.current.load();
      audioRef.current = null;
    }
    
    // Stop synthetic audio
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {
        console.log('Error closing audio context:', e);
      }
      audioContextRef.current = null;
    }
    
    if (syntheticIntervalRef.current) {
      clearInterval(syntheticIntervalRef.current);
      syntheticIntervalRef.current = null;
    }
    
    // Clear timers
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    if (ringTimerRef.current) {
      clearTimeout(ringTimerRef.current);
      ringTimerRef.current = null;
    }
  };

  const cleanupVideo = () => {
    console.log('Cleaning up video...');
    
    // Stop video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped video track:', track.kind);
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.pause();
    }
    
    setHasCamera(false);
  };

  // Create synthetic ringtone using Web Audio API
  const createSyntheticRingtone = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const playTone = () => {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') return;
        
        // Create two-tone ringtone (like iPhone)
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator1.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator2.frequency.setValueAtTime(1000, audioContext.currentTime);
        
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator1.start(audioContext.currentTime);
        oscillator2.start(audioContext.currentTime);
        oscillator1.stop(audioContext.currentTime + 0.3);
        oscillator2.stop(audioContext.currentTime + 0.3);
      };
      
      playTone();
      
      // Set up repeating tone
      syntheticIntervalRef.current = setInterval(() => {
        playTone();
      }, 1000); // Ring every second
      
    } catch (error) {
      console.log('Could not create synthetic ringtone:', error);
    }
  };

  const endCall = () => {
    console.log('Ending call...');
    setCallStatus('ended');
    
    // Clean up all audio and video immediately
    cleanupAudio();
    cleanupVideo();
    
    // Close modal immediately
    onEndCall();
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    switch (callStatus) {
      case 'connecting':
        return 'Connecting...';
      case 'ringing':
        return 'Ringing...';
      case 'ended':
        return 'Call ended';
      default:
        return '';
    }
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCallStatus('connecting');
      setCallDuration(0);
      setIsMuted(false);
      setIsCameraOff(false);
      setIsSpeakerOn(false);
      setHasCamera(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        // Only close if clicking the backdrop, not the modal content
        if (e.target === e.currentTarget) {
          console.log('Backdrop clicked, ending call');
          endCall();
        }
      }}
    >
      <div 
        className="bg-gradient-to-b from-blue-900 via-purple-900 to-pink-900 rounded-2xl shadow-2xl w-full max-w-md h-[650px] flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
      {/* Call Header */}
      <div className="flex-1 flex flex-col items-center justify-center text-white px-6 pt-8 pb-4">
        {/* Profile Section */}
        <div className="text-center mb-6">
          <div className="relative mb-4">
            <div className={`relative inline-block ${callStatus === 'ringing' ? 'animate-pulse' : ''}`}>
              <img
                src={profile.photos?.[0] || '/default-avatar.png'}
                alt={profile.firstName}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white/30 shadow-2xl"
              />
              {callStatus === 'ringing' && (
                <div className="absolute inset-0 rounded-full border-4 border-white/50 animate-ping"></div>
              )}
            </div>
          </div>
          
          <h2 className="text-xl md:text-2xl font-semibold mb-2">
            {profile.firstName} {profile.lastName}
          </h2>
          
          <p className="text-base text-white/80 mb-3">
            {getStatusText()}
          </p>
          
          {callDuration > 0 && (
            <p className="text-lg font-mono text-green-400">
              {formatCallDuration(callDuration)}
            </p>
          )}
        </div>

        {/* Video Preview (for video calls) */}
        {isVideoCall && (
          <div className="relative mb-4">
            <div className="w-40 h-30 md:w-48 md:h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/30 relative">
              {/* Real user video */}
              {!isCameraOff && (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }} // Mirror effect like most video calls
                />
              )}
              
              {/* Camera off or fallback */}
              {(isCameraOff || !hasCamera) && (
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <User className="w-8 h-8 mx-auto mb-1 text-white/50" />
                    <p className="text-xs text-white/70">
                      {isCameraOff ? 'Camera Off' : userName}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="absolute top-2 right-2 bg-black/50 rounded px-2 py-1">
              <span className="text-xs text-white">You</span>
            </div>
          </div>
        )}

        {/* Call Type Indicator */}
        <div className="flex items-center gap-2 mb-4">
          {isVideoCall ? (
            <Video className="w-5 h-5 text-white/80" />
          ) : (
            <Phone className="w-5 h-5 text-white/80" />
          )}
          <span className="text-sm text-white/80">
            {isVideoCall ? 'Video Call' : 'Voice Call'}
          </span>
        </div>
      </div>

      {/* Call Controls - Fixed at bottom */}
      <div className="flex-shrink-0 p-6 bg-black/30 backdrop-blur-sm border-t border-white/10">
        <div className="flex items-center justify-center gap-6">
          {/* Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
              isMuted 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            {isMuted ? (
              <MicOff className="w-5 h-5 md:w-6 md:h-6 text-white" />
            ) : (
              <Mic className="w-5 h-5 md:w-6 md:h-6 text-white" />
            )}
          </button>

          {/* End Call Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('End call button clicked');
              endCall();
            }}
            className="w-14 h-14 md:w-16 md:h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105"
          >
            <PhoneOff className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </button>

          {/* Video/Speaker Toggle */}
          {isVideoCall ? (
            <button
              onClick={() => {
                setIsCameraOff(!isCameraOff);
                if (!isCameraOff && hasCamera && videoRef.current) {
                  // Turning camera off
                  videoRef.current.style.display = 'none';
                } else if (isCameraOff && hasCamera && videoRef.current) {
                  // Turning camera on
                  videoRef.current.style.display = 'block';
                }
              }}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                isCameraOff 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {isCameraOff ? (
                <VideoOff className="w-5 h-5 md:w-6 md:h-6 text-white" />
              ) : (
                <Video className="w-5 h-5 md:w-6 md:h-6 text-white" />
              )}
            </button>
          ) : (
            <button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                isSpeakerOn 
                  ? 'bg-blue-500 hover:bg-blue-600' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {isSpeakerOn ? (
                <Volume2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
              ) : (
                <VolumeX className="w-5 h-5 md:w-6 md:h-6 text-white" />
              )}
            </button>
          )}
        </div>

        {/* Control Labels */}
        <div className="flex items-center justify-center gap-6 mt-3">
          <span className="text-xs text-white/60 w-12 md:w-14 text-center">
            {isMuted ? 'Unmute' : 'Mute'}
          </span>
          <span className="text-xs text-white/60 w-14 md:w-16 text-center">End Call</span>
          <span className="text-xs text-white/60 w-12 md:w-14 text-center">
            {isVideoCall 
              ? (isCameraOff ? 'Camera' : 'Camera') 
              : (isSpeakerOn ? 'Speaker' : 'Speaker')
            }
          </span>
        </div>
      </div>

        {/* Animated Background Particles */}
        <div className="absolute inset-0 overflow-hidden -z-20">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
} 