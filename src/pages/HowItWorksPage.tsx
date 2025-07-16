import { UserPlus, Search, MessageCircle, Heart, Video, Gift, Plane, CheckCircle } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-rose-500 to-pink-500 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">How It Works</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Your journey to finding true love starts here
          </p>
          <p className="text-lg max-w-2xl mx-auto">
            Follow our simple 4-step process to connect with your perfect match
          </p>
        </div>
      </section>

      {/* Main Steps */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Step 1 */}
              <div className="text-center relative">
                <div className="bg-rose-100 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <UserPlus className="h-12 w-12 text-rose-500" />
                </div>
                <div className="bg-rose-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                  1
                </div>
                <h3 className="text-2xl font-bold mb-4">Create Profile</h3>
                <p className="text-gray-600">
                  Sign up and create your detailed profile with photos and preferences
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center relative">
                <div className="bg-blue-100 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-12 w-12 text-blue-500" />
                </div>
                <div className="bg-rose-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                  2
                </div>
                <h3 className="text-2xl font-bold mb-4">Browse & Match</h3>
                <p className="text-gray-600">
                  Search through verified profiles and find women who match your criteria
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center relative">
                <div className="bg-green-100 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="h-12 w-12 text-green-500" />
                </div>
                <div className="bg-rose-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                  3
                </div>
                <h3 className="text-2xl font-bold mb-4">Connect</h3>
                <p className="text-gray-600">
                  Start conversations and build meaningful relationships through our platform
                </p>
              </div>

              {/* Step 4 */}
              <div className="text-center">
                <div className="bg-purple-100 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-12 w-12 text-purple-500" />
                </div>
                <div className="bg-rose-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                  4
                </div>
                <h3 className="text-2xl font-bold mb-4">Find Love</h3>
                <p className="text-gray-600">
                  Meet in person and start your journey together towards a lasting relationship
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Process */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">The Complete Journey</h2>
            
            {/* Registration */}
            <div className="mb-16">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-rose-100 h-16 w-16 rounded-full flex items-center justify-center">
                  <UserPlus className="h-8 w-8 text-rose-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Registration & Profile Creation</h3>
                  <p className="text-gray-600">Build your foundation for success</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-20">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold">Complete Profile Setup</h4>
                    <p className="text-sm text-gray-600">Add photos, personal information, and preferences</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold">Identity Verification</h4>
                    <p className="text-sm text-gray-600">Verify your identity for security and trust</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold">Choose Subscription</h4>
                    <p className="text-sm text-gray-600">Select the plan that fits your needs</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold">Profile Optimization</h4>
                    <p className="text-sm text-gray-600">Get tips to make your profile stand out</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Browsing & Matching */}
            <div className="mb-16">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-blue-100 h-16 w-16 rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Browsing & Matching</h3>
                  <p className="text-gray-600">Discover your perfect match</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-20">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold">Advanced Search Filters</h4>
                    <p className="text-sm text-gray-600">Filter by age, location, interests, and more</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold">Smart Matching Algorithm</h4>
                    <p className="text-sm text-gray-600">Get personalized recommendations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold">View Detailed Profiles</h4>
                    <p className="text-sm text-gray-600">Learn about potential matches in detail</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold">Express Interest</h4>
                    <p className="text-sm text-gray-600">Send likes and virtual gifts</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Communication */}
            <div className="mb-16">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-green-100 h-16 w-16 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-green-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Communication & Connection</h3>
                  <p className="text-gray-600">Build meaningful relationships</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-20">
                <div className="flex items-start gap-3">
                  <MessageCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold">Instant Messaging</h4>
                    <p className="text-sm text-gray-600">Real-time chat with translation support</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Video className="h-5 w-5 text-purple-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold">Video Calls</h4>
                    <p className="text-sm text-gray-600">Face-to-face conversations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Gift className="h-5 w-5 text-pink-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold">Virtual Gifts</h4>
                    <p className="text-sm text-gray-600">Show your affection with thoughtful gifts</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Plane className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold">Meeting Assistance</h4>
                    <p className="text-sm text-gray-600">Help with travel and meeting arrangements</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Tips */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Tips for Success</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Profile Tips</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Use high-quality, recent photos</li>
                  <li>• Write an honest and engaging bio</li>
                  <li>• Be specific about your interests</li>
                  <li>• Update your profile regularly</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Communication Tips</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Be respectful and genuine</li>
                  <li>• Ask thoughtful questions</li>
                  <li>• Share your culture and traditions</li>
                  <li>• Be patient with language barriers</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Safety Tips</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Never send money to someone</li>
                  <li>• Meet in public places first</li>
                  <li>• Trust your instincts</li>
                  <li>• Report suspicious behavior</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Relationship Tips</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Take time to know each other</li>
                  <li>• Discuss future plans openly</li>
                  <li>• Respect cultural differences</li>
                  <li>• Plan visits when ready</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-rose-500 to-pink-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of successful couples who found love through PureLove
          </p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.href = '/signup'}
              className="bg-white text-rose-500 px-8 py-4 rounded-lg font-semibold hover:bg-rose-50 transition-colors"
            >
              Get Started Now
            </button>
            <button
              onClick={() => window.location.href = '/browse'}
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-rose-500 transition-colors"
            >
              Browse Profiles
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 