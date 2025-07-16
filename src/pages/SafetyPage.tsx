import { Shield, AlertTriangle, Eye, Lock, Phone, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export function SafetyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-rose-500 to-pink-500 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Shield className="h-16 w-16 mx-auto mb-6 fill-white" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Safety Tips</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Your safety is our top priority
          </p>
          <p className="text-lg max-w-2xl mx-auto">
            Follow these essential safety guidelines to ensure a secure and positive dating experience
          </p>
        </div>
      </section>

      {/* Key Safety Rules */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Essential Safety Rules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <XCircle className="h-8 w-8 text-red-500" />
                  <h3 className="text-xl font-bold text-red-700">Never Do This</h3>
                </div>
                <ul className="space-y-3 text-red-700">
                  <li>• Never send money, gifts, or personal financial information</li>
                  <li>• Don't share your home address or workplace details</li>
                  <li>• Never give out your social security number or bank details</li>
                  <li>• Don't meet in private or isolated locations</li>
                  <li>• Never travel to meet someone without proper verification</li>
                </ul>
              </div>
              
              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <h3 className="text-xl font-bold text-green-700">Always Do This</h3>
                </div>
                <ul className="space-y-3 text-green-700">
                  <li>• Meet in public places for first meetings</li>
                  <li>• Tell friends/family about your dating plans</li>
                  <li>• Trust your instincts and gut feelings</li>
                  <li>• Verify identity through video calls</li>
                  <li>• Report suspicious behavior immediately</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Safety Guidelines */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Comprehensive Safety Guidelines</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Online Safety */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Lock className="h-8 w-8 text-blue-500" />
                  <h3 className="text-2xl font-bold">Online Safety</h3>
                </div>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-200 pl-4">
                    <h4 className="font-semibold mb-2">Profile Protection</h4>
                    <p className="text-gray-600 text-sm">Use privacy settings to control who can see your information. Don't include personal details like phone numbers or addresses in your profile.</p>
                  </div>
                  <div className="border-l-4 border-blue-200 pl-4">
                    <h4 className="font-semibold mb-2">Communication Security</h4>
                    <p className="text-gray-600 text-sm">Keep conversations on the platform initially. Be cautious about sharing personal contact information too quickly.</p>
                  </div>
                  <div className="border-l-4 border-blue-200 pl-4">
                    <h4 className="font-semibold mb-2">Photo Safety</h4>
                    <p className="text-gray-600 text-sm">Avoid photos that reveal your location, workplace, or other identifying information in the background.</p>
                  </div>
                </div>
              </div>

              {/* Meeting Safety */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Eye className="h-8 w-8 text-green-500" />
                  <h3 className="text-2xl font-bold">Meeting Safety</h3>
                </div>
                <div className="space-y-4">
                  <div className="border-l-4 border-green-200 pl-4">
                    <h4 className="font-semibold mb-2">First Meeting Guidelines</h4>
                    <p className="text-gray-600 text-sm">Always meet in busy, public places like cafes, restaurants, or shopping centers. Arrive and leave independently.</p>
                  </div>
                  <div className="border-l-4 border-green-200 pl-4">
                    <h4 className="font-semibold mb-2">Tell Someone</h4>
                    <p className="text-gray-600 text-sm">Inform a trusted friend or family member about your plans, including where you're going and when you expect to return.</p>
                  </div>
                  <div className="border-l-4 border-green-200 pl-4">
                    <h4 className="font-semibold mb-2">Stay Alert</h4>
                    <p className="text-gray-600 text-sm">Stay sober and alert. Don't leave drinks unattended and trust your instincts if something feels wrong.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Red Flags */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-8">
              <AlertTriangle className="h-10 w-10 text-red-500" />
              <h2 className="text-3xl md:text-4xl font-bold text-center">Red Flags to Watch For</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <h3 className="text-lg font-semibold text-red-700 mb-3">Financial Red Flags</h3>
                <ul className="space-y-2 text-red-600 text-sm">
                  <li>• Asking for money, loans, or financial assistance</li>
                  <li>• Requesting gift cards or wire transfers</li>
                  <li>• Claims of financial emergencies</li>
                  <li>• Asking for banking or credit card information</li>
                  <li>• Investment or business opportunities</li>
                </ul>
              </div>
              
              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <h3 className="text-lg font-semibold text-red-700 mb-3">Behavioral Red Flags</h3>
                <ul className="space-y-2 text-red-600 text-sm">
                  <li>• Professing love very quickly</li>
                  <li>• Avoiding phone or video calls</li>
                  <li>• Inconsistent stories or information</li>
                  <li>• Pressuring for personal information</li>
                  <li>• Refusing to meet in public places</li>
                </ul>
              </div>
              
              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <h3 className="text-lg font-semibold text-red-700 mb-3">Profile Red Flags</h3>
                <ul className="space-y-2 text-red-600 text-sm">
                  <li>• Limited or professional model-like photos</li>
                  <li>• Vague or minimal profile information</li>
                  <li>• Claims of being widowed or in military</li>
                  <li>• Poor grammar despite claiming education</li>
                  <li>• Recently created profiles with perfect details</li>
                </ul>
              </div>
              
              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <h3 className="text-lg font-semibold text-red-700 mb-3">Communication Red Flags</h3>
                <ul className="space-y-2 text-red-600 text-sm">
                  <li>• Generic messages that could be sent to anyone</li>
                  <li>• Immediately asking to move off the platform</li>
                  <li>• Avoiding specific questions about their life</li>
                  <li>• Using overly romantic language too soon</li>
                  <li>• Inconsistent time zones or availability</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* International Dating Safety */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">International Dating Safety</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MessageSquare className="h-6 w-6 text-rose-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Verify Identity</h3>
                    <p className="text-gray-600">Always verify someone's identity through video calls before making any commitments. Ask for multiple forms of verification.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <MessageSquare className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Language Barriers</h3>
                    <p className="text-gray-600">Be patient with language differences, but be wary if someone's language skills don't match their claimed education level.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Shield className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Cultural Research</h3>
                    <p className="text-gray-600">Learn about your match's culture and customs. This helps you understand normal behavior and spot inconsistencies.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
                <h3 className="text-lg font-semibold text-amber-800 mb-4">Travel Safety Tips</h3>
                <ul className="space-y-2 text-amber-700 text-sm">
                  <li>• Research visa requirements and travel advisories</li>
                  <li>• Book refundable accommodations initially</li>
                  <li>• Register with your embassy when traveling</li>
                  <li>• Keep emergency contacts and embassy information handy</li>
                  <li>• Have an exit strategy and return ticket</li>
                  <li>• Meet in public places even when traveling to meet them</li>
                  <li>• Don't stay at their residence initially</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reporting System */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Report Suspicious Activity</h2>
            <p className="text-lg text-gray-600 mb-8">
              Help us keep the community safe by reporting suspicious behavior or profiles
            </p>
            
            <div className="bg-rose-50 p-8 rounded-xl border border-rose-200">
              <h3 className="text-xl font-semibold mb-4">How to Report</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="text-center">
                  <div className="bg-rose-100 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-rose-600 font-bold">1</span>
                  </div>
                  <p>Use the report button on any profile or message</p>
                </div>
                <div className="text-center">
                  <div className="bg-rose-100 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-rose-600 font-bold">2</span>
                  </div>
                  <p>Provide detailed information about the issue</p>
                </div>
                <div className="text-center">
                  <div className="bg-rose-100 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-rose-600 font-bold">3</span>
                  </div>
                  <p>Our team will investigate within 24 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Contacts */}
      <section className="py-20 bg-gradient-to-r from-rose-500 to-pink-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Need Help?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Our safety team is available 24/7 to assist you
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white bg-opacity-20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Emergency Support</h3>
              <p className="text-rose-100">support@purelove.com</p>
              <p className="text-rose-100">safety@purelove.com</p>
            </div>
            <div className="bg-white bg-opacity-20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Safety Team</h3>
              <p className="text-rose-100">safety@purelove.com</p>
              <p className="text-rose-100">24/7 Response</p>
            </div>
            <div className="bg-white bg-opacity-20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Local Authorities</h3>
              <p className="text-rose-100">Always contact local police</p>
              <p className="text-rose-100">in case of emergency</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 