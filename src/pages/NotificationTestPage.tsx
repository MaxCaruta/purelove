import React from 'react';
import { useMessageNotifications } from '@/context/MessageNotificationContext';
import { useChat } from '@/context/ChatContext';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MessageCircle, Bell, BellOff } from 'lucide-react';
import { Profile } from '@/types';

export function NotificationTestPage() {
  const { notifications, addNotification, clearAllNotifications } = useMessageNotifications();
  const { openChat } = useChat();

  const testNotification = () => {
    const testMessages = [
      "Hi! How are you doing today? 😊",
      "I was thinking about our last conversation...",
      "Would you like to meet for coffee sometime?",
      "Your profile really caught my attention!",
      "I'd love to get to know you better 💕"
    ];

    // Create mock profiles that will work with ChatWindow
    const testSenders = [
      {
        name: "Elena K.",
        photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=776&q=80",
        id: "test-elena",
        profile: {
          id: 'test-elena',
          userId: 'test-elena',
          firstName: 'Elena',
          lastName: 'K.',
          gender: 'female' as const,
          birthDate: '1995-05-15',
          country: 'Ukraine',
          city: 'Kyiv',
          bio: 'I feel music in every cell of my body. Looking for someone who shares my passion for arts and travel.',
          interests: ['Music', 'Travel', 'Art'],
          profession: 'Graphic Designer',
          languages: ['Ukrainian', 'English', 'Russian'],
          photos: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=776&q=80'],
          verified: true,
          createdAt: '2023-01-15',
          height: 168,
          weight: 55,
          eyeColor: 'blue',
          hairColor: 'blonde',
          appearanceType: 'slim',
          alcohol: 'socially',
          smoking: 'never',
          children: 'want',
          religion: 'orthodox',
          zodiacSign: 'taurus',
          englishLevel: 'intermediate',
          hasIntroVideo: true,
          isOnline: true,
          hasVideo: true,
          hasCameraOn: false,
          birthdaySoon: false,
          newProfile: false,
          top1000: true,
        } as Profile
      },
      {
        name: "Anastasia M.",
        photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=776&q=80",
        id: "test-anastasia",
        profile: {
          id: 'test-anastasia',
          userId: 'test-anastasia',
          firstName: 'Anastasia',
          lastName: 'M.',
          gender: 'female' as const,
          birthDate: '1992-08-23',
          country: 'Russia',
          city: 'Moscow',
          bio: 'Passionate about literature and philosophy. I enjoy deep conversations and quiet evenings with good wine.',
          interests: ['Reading', 'Philosophy', 'Wine Tasting'],
          profession: 'Literature Professor',
          languages: ['Russian', 'English', 'French'],
          photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=776&q=80'],
          verified: true,
          createdAt: '2023-02-10',
          height: 172,
          weight: 58,
          eyeColor: 'brown',
          hairColor: 'brunette',
          appearanceType: 'average',
          alcohol: 'regularly',
          smoking: 'rarely',
          children: 'none',
          religion: 'orthodox',
          zodiacSign: 'virgo',
          englishLevel: 'advanced',
          hasIntroVideo: false,
          isOnline: false,
          hasVideo: true,
          hasCameraOn: true,
          birthdaySoon: false,
          newProfile: false,
          top1000: true,
        } as Profile
      }
    ];

    const randomSender = testSenders[Math.floor(Math.random() * testSenders.length)];
    const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)];

    // Create a custom notification that will open the ChatWindow directly
    const notification = {
      id: `test-${Date.now()}`,
      senderName: randomSender.name,
      senderPhoto: randomSender.photo,
      message: randomMessage,
      senderId: randomSender.id,
      timestamp: new Date().toISOString()
    };

    // Override the notification click handler to open ChatWindow directly with mock profile
    addNotification(notification);

    // Store the mock profile for testing
    (window as any).testProfiles = (window as any).testProfiles || {};
    (window as any).testProfiles[randomSender.id] = randomSender.profile;
  };

  const testDirectChatOpen = () => {
    // Test opening ChatWindow directly
    const testProfile: Profile = {
      id: 'test-direct',
      userId: 'test-direct',
      firstName: 'Sofia',
      lastName: 'R.',
      gender: 'female' as const,
      birthDate: '1994-09-30',
      country: 'Romania',
      city: 'Bucharest',
      bio: 'Software engineer by day, book lover by night. Looking for an intellectual partner who enjoys deep conversations and traveling.',
      interests: ['Technology', 'Reading', 'Travel'],
      profession: 'Software Engineer',
      languages: ['Romanian', 'English', 'French'],
      photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80'],
      verified: true,
      createdAt: '2023-01-05',
      height: 175,
      weight: 62,
      eyeColor: 'gray',
      hairColor: 'brunette',
      appearanceType: 'average',
      alcohol: 'socially',
      smoking: 'never',
      children: 'no-want',
      religion: 'christian',
      zodiacSign: 'libra',
      englishLevel: 'fluent',
      hasIntroVideo: false,
      isOnline: true,
      hasVideo: true,
      hasCameraOn: false,
      birthdaySoon: false,
      newProfile: false,
      top1000: true,
    };

    openChat(testProfile);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
              <Bell className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Message Notification Test
            </h1>
            <p className="text-xl text-gray-600">
              Test the real-time message notification system
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Click the button below to simulate receiving a message notification
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={testNotification}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg w-full"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Trigger Test Notification
                  </Button>
                  <Button
                    onClick={testDirectChatOpen}
                    variant="outline"
                    className="border-blue-500 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg w-full"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Open Test Chat Directly
                  </Button>
                </div>
              </div>

              {notifications.length > 0 && (
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Active Notifications ({notifications.length})
                    </h3>
                    <Button
                      onClick={clearAllNotifications}
                      variant="outline"
                      size="sm"
                    >
                      <BellOff className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          {notification.senderPhoto ? (
                            <img
                              src={notification.senderPhoto}
                              alt={notification.senderName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {notification.senderName[0]}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{notification.senderName}</p>
                            <p className="text-sm text-gray-600">{notification.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">How it works</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-semibold text-xs">1</span>
                    </div>
                    <p>When someone sends you a message, a notification appears in the top-right corner</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-semibold text-xs">2</span>
                    </div>
                    <p>Notifications include the sender's photo, name, and message preview</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-semibold text-xs">3</span>
                    </div>
                    <p>Click "Reply" or "View Chat" to open the conversation</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-semibold text-xs">4</span>
                    </div>
                    <p>Notifications auto-dismiss after 8 seconds or when you're in an active chat</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-semibold text-xs">5</span>
                    </div>
                    <p>Browser notifications are also shown if you've granted permission</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 