import { Shield, AlertTriangle, Eye, Lock, Phone, Mail, CreditCard, Users, Calendar, CheckCircle, FileText } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export function AntiScamPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="bg-white/20 backdrop-blur-sm rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <Shield className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent">
            Anti-Scam Policy
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-red-100">
            Stay safe from scams and fraud
          </p>
          <div className="flex items-center justify-center gap-2 text-red-100 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 w-fit mx-auto">
            <Calendar className="h-5 w-5" />
            <span className="font-medium">Last updated: December 15, 2024</span>
          </div>
        </div>
      </section>

      {/* Scam Overview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 p-8 rounded-2xl mb-12 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="bg-red-500 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-red-900 mb-4">Stay Alert</h2>
                  <p className="text-red-800 leading-relaxed">
                    Scammers try to trick people on dating sites. Learn how to spot them and stay safe.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Common Scams</h2>
              <p className="text-lg text-gray-600">Watch out for these warning signs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-2xl border border-red-200 hover:shadow-lg transition-all duration-300">
                <div className="bg-red-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CreditCard className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-red-900 mb-4 text-center">Money Requests</h3>
                <p className="text-red-700 text-center text-sm leading-relaxed">Asking for money or financial help</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl border border-orange-200 hover:shadow-lg transition-all duration-300">
                <div className="bg-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-orange-900 mb-4 text-center">Fake Profiles</h3>
                <p className="text-orange-700 text-center text-sm leading-relaxed">Using stolen photos and fake info</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-8 rounded-2xl border border-yellow-200 hover:shadow-lg transition-all duration-300">
                <div className="bg-yellow-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-yellow-900 mb-4 text-center">Quick Romance</h3>
                <p className="text-yellow-700 text-center text-sm leading-relaxed">Saying "I love you" too quickly</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-300">
                <div className="bg-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-purple-900 mb-4 text-center">Off-Site Contact</h3>
                <p className="text-purple-700 text-center text-sm leading-relaxed">Pushing to move off the platform</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Protection Details */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {/* How to Stay Safe */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-green-500 w-8 h-8 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">How to Stay Safe</h2>
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Follow these simple rules to protect yourself.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "Never send money to someone online",
                    "Don't share personal financial info",
                    "Keep conversations on our platform",
                    "Video chat before meeting",
                    "Meet in public places first",
                    "Trust your instincts",
                    "Report suspicious behavior",
                    "Take relationships slowly"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Red Flags */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-red-500 w-8 h-8 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Red Flags</h2>
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Be careful if someone does these things.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl">
                    <div className="bg-red-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-red-900 mb-3">Money Talk</h3>
                    <ul className="space-y-2 text-red-800 text-sm">
                      <li>• Asks for money</li>
                      <li>• Has financial emergency</li>
                      <li>• Wants gift cards</li>
                      <li>• Needs help with fees</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl">
                    <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-orange-900 mb-3">Fake Signs</h3>
                    <ul className="space-y-2 text-orange-800 text-sm">
                      <li>• Photos look too perfect</li>
                      <li>• Won't video chat</li>
                      <li>• Story keeps changing</li>
                      <li>• Grammar is poor</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl">
                    <div className="bg-yellow-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-yellow-900 mb-3">Pushy Behavior</h3>
                    <ul className="space-y-2 text-yellow-800 text-sm">
                      <li>• Says "I love you" quickly</li>
                      <li>• Wants to leave the site</li>
                      <li>• Pressures for meetings</li>
                      <li>• Gets angry when questioned</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* What We Do */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-500 w-8 h-8 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">How We Protect You</h2>
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  We work hard to keep scammers off our platform.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                    <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">We Monitor</h3>
                    <ul className="space-y-2 text-blue-800 text-sm">
                      <li>• Check all profiles</li>
                      <li>• Watch for suspicious activity</li>
                      <li>• Use automated systems</li>
                      <li>• Review reported users</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                    <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-900 mb-3">We Verify</h3>
                    <ul className="space-y-2 text-green-800 text-sm">
                      <li>• Require photo verification</li>
                      <li>• Check profile information</li>
                      <li>• Validate identities</li>
                      <li>• Remove fake accounts</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Report Scams */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-rose-500 w-8 h-8 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">4</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Report Scams</h2>
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  If you see something suspicious, tell us right away.
                </p>
                
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-xl">
                  <div className="space-y-4">
                    <p className="text-gray-700"><strong>Report Button:</strong> Use the report button on any profile or message</p>
                    <p className="text-gray-700"><strong>Email Us:</strong> safety@purelove.com</p>
                    <p className="text-gray-700"><strong>24/7 Support:</strong> support@purelove.com</p>
                    <p className="text-gray-700"><strong>What to Include:</strong> Screenshots, user details, and what happened</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-6">Need Help?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Report scams or get help staying safe
            </p>
            <div className="space-x-4">
              <button
                onClick={() => window.location.href = '/contact'}
                className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-8 py-4 rounded-lg font-semibold hover:from-red-600 hover:to-rose-600 transition-colors"
              >
                Report Scam
              </button>
              <button
                onClick={() => window.location.href = '/safety'}
                className="border-2 border-red-500 text-red-500 px-8 py-4 rounded-lg font-semibold hover:bg-red-50 transition-colors"
              >
                Safety Guide
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 