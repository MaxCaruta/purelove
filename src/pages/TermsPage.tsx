import { Scale, Calendar, Shield, AlertTriangle, FileText, Users, CreditCard, Lock, Globe, Phone } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-transparent"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="bg-white/20 backdrop-blur-sm rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <Scale className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-rose-100 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-rose-100">
            Simple terms for using PureLove
          </p>
          <div className="flex items-center justify-center gap-2 text-rose-100 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 w-fit mx-auto">
            <Calendar className="h-5 w-5" />
            <span className="font-medium">Last updated: December 15, 2024</span>
          </div>
        </div>
      </section>

      {/* Key Points Overview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Terms</h2>
              <p className="text-lg text-gray-600">What you need to know</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300">
                <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Age 18+</h3>
                <p className="text-blue-700 text-sm">Must be 18 or older to use our service</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-300">
                <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">Safe & Legal</h3>
                <p className="text-green-700 text-sm">IMBRA compliant and fully regulated</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-300">
                <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-purple-900 mb-2">Fair Billing</h3>
                <p className="text-purple-700 text-sm">Clear pricing with 30-day refunds</p>
              </div>
              <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-6 rounded-xl border border-rose-200 hover:shadow-lg transition-all duration-300">
                <div className="bg-rose-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-rose-900 mb-2">Your Privacy</h3>
                <p className="text-rose-700 text-sm">Your data is secure and protected</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-8 rounded-2xl mb-12 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="bg-amber-500 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-900 mb-3">Agreement</h3>
                  <p className="text-amber-800 leading-relaxed">
                    By using PureLove, you agree to these terms. If you don't agree, please don't use our service.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* What We Offer */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-500 w-8 h-8 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">What We Offer</h2>
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  PureLove is a dating platform connecting people for meaningful relationships.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="text-blue-900 font-medium">Profile creation & browsing</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                    <FileText className="h-5 w-5 text-green-600" />
                    <span className="text-green-900 font-medium">Messaging & communication</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                    <Phone className="h-5 w-5 text-purple-600" />
                    <span className="text-purple-900 font-medium">Video chat features</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-rose-50 to-rose-100 rounded-lg">
                    <Globe className="h-5 w-5 text-rose-600" />
                    <span className="text-rose-900 font-medium">Translation services</span>
                  </div>
                </div>
              </div>

              {/* Your Responsibilities */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-green-500 w-8 h-8 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Your Responsibilities</h2>
                </div>
                <div className="space-y-3">
                  {[
                    "Be 18+ years old",
                    "Provide truthful information",
                    "Keep your account secure",
                    "Be respectful to other users",
                    "Follow all applicable laws"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payments & Refunds */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-purple-500 w-8 h-8 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Payments & Refunds</h2>
                </div>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    • Subscriptions renew automatically<br/>
                    • 30-day refund policy for new subscribers<br/>
                    • Cancel anytime in your account settings<br/>
                    • Price changes announced 30 days in advance
                  </p>
                </div>
              </div>

              {/* Contact Us */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-rose-500 w-8 h-8 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">4</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Questions?</h2>
                </div>
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-xl">
                  <p className="text-gray-700 mb-4">If you have questions about these terms:</p>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Email:</strong> legal@purelove.com</p>
                    <p><strong>Support:</strong> support@purelove.com</p>
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
            <Shield className="h-12 w-12 text-rose-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-6">Need Help?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Our team is here to help with any questions about our terms
            </p>
            <div className="space-x-4">
              <button
                onClick={() => window.location.href = '/contact'}
                className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-4 rounded-lg font-semibold hover:from-rose-600 hover:to-pink-600 transition-colors"
              >
                Contact Us
              </button>
              <button
                onClick={() => window.location.href = '/faq'}
                className="border-2 border-rose-500 text-rose-500 px-8 py-4 rounded-lg font-semibold hover:bg-rose-50 transition-colors"
              >
                View FAQ
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 