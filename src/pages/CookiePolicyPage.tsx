import { Cookie, Settings, Eye, BarChart, Calendar, Shield, Lock, Globe, Zap, Monitor } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-transparent"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="bg-white/20 backdrop-blur-sm rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <Cookie className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
            Cookie Policy
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-orange-100">
            How cookies improve your experience
          </p>
          <div className="flex items-center justify-center gap-2 text-orange-100 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 w-fit mx-auto">
            <Calendar className="h-5 w-5" />
            <span className="font-medium">Last updated: December 15, 2024</span>
          </div>
        </div>
      </section>

      {/* Cookie Overview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 p-8 rounded-2xl mb-12 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="bg-orange-500 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                  <Cookie className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-orange-900 mb-4">What Are Cookies?</h2>
                  <p className="text-orange-800 leading-relaxed">
                    Cookies are small files that help us remember your preferences and improve your experience on our website.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Types of Cookies</h2>
              <p className="text-lg text-gray-600">How different cookies help you</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-300">
                <div className="bg-green-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-green-900 mb-4 text-center">Essential</h3>
                <p className="text-green-700 text-center text-sm leading-relaxed">Required for the site to work properly</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300">
                <div className="bg-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-4 text-center">Preferences</h3>
                <p className="text-blue-700 text-center text-sm leading-relaxed">Remember your settings and choices</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-300">
                <div className="bg-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BarChart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-purple-900 mb-4 text-center">Analytics</h3>
                <p className="text-purple-700 text-center text-sm leading-relaxed">Help us improve the website</p>
              </div>
              <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-8 rounded-2xl border border-rose-200 hover:shadow-lg transition-all duration-300">
                <div className="bg-rose-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-rose-900 mb-4 text-center">Marketing</h3>
                <p className="text-rose-700 text-center text-sm leading-relaxed">Show you relevant content</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cookie Details */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {/* Essential Cookies */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-green-500 w-8 h-8 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Essential Cookies</h2>
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  These cookies are necessary for the website to work. They help you log in, navigate pages, and use basic features.
                </p>
                
                <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="h-6 w-6 text-green-600" />
                    <h4 className="text-lg font-semibold text-green-900">What they do:</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "Keep you logged in",
                      "Remember your session",
                      "Provide security",
                      "Make the site work"
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-800 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preference Cookies */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-500 w-8 h-8 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Preference Cookies</h2>
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  These cookies remember your choices so you don't have to set them again each time you visit.
                </p>
                
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <Settings className="h-6 w-6 text-blue-600" />
                    <h4 className="text-lg font-semibold text-blue-900">What they remember:</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "Your language",
                      "Theme settings",
                      "Location preferences",
                      "Display options"
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-blue-800 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-purple-500 w-8 h-8 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Analytics Cookies</h2>
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  These cookies help us understand how you use our website so we can make it better.
                </p>
                
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <BarChart className="h-6 w-6 text-purple-600" />
                    <h4 className="text-lg font-semibold text-purple-900">What we learn:</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "Which pages you visit",
                      "How long you stay",
                      "What features you use",
                      "How to improve the site"
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-purple-800 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Your Control */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-rose-500 w-8 h-8 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">4</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Your Control</h2>
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  You can control which cookies we use through your browser settings or our cookie preferences.
                </p>
                
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-xl">
                  <div className="space-y-4">
                    <p className="text-gray-700"><strong>Browser Settings:</strong> Block or delete cookies in your browser</p>
                    <p className="text-gray-700"><strong>Cookie Banner:</strong> Choose your preferences when you first visit</p>
                    <p className="text-gray-700"><strong>Contact Us:</strong> support@purelove.com for cookie questions</p>
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
            <Cookie className="h-12 w-12 text-orange-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-6">Cookie Questions?</h2>
            <p className="text-lg text-gray-600 mb-8">
              We're here to help you understand how cookies work
            </p>
            <div className="space-x-4">
              <button
                onClick={() => window.location.href = '/contact'}
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-4 rounded-lg font-semibold hover:from-orange-600 hover:to-amber-600 transition-colors"
              >
                Contact Us
              </button>
              <button
                onClick={() => window.location.href = '/settings'}
                className="border-2 border-orange-500 text-orange-500 px-8 py-4 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
              >
                Cookie Settings
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 