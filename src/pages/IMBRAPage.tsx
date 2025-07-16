import { Shield, FileText, Users, AlertTriangle, CheckCircle, Calendar, Search, Phone, BookOpen, Scale } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export function IMBRAPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-transparent"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="bg-white/20 backdrop-blur-sm rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <Shield className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            IMBRA Compliance
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100">
            Your safety and protection matter
          </p>
          <div className="flex items-center justify-center gap-2 text-blue-100 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 w-fit mx-auto">
            <Calendar className="h-5 w-5" />
            <span className="font-medium">Last updated: December 15, 2024</span>
          </div>
        </div>
      </section>

      {/* IMBRA Overview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-8 rounded-2xl mb-12 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-blue-900 mb-4">What is IMBRA?</h2>
                  <p className="text-blue-800 leading-relaxed">
                    The International Marriage Broker Regulation Act (IMBRA) is a US law that protects people using international dating services.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Commitment</h2>
              <p className="text-lg text-gray-600">How we keep you safe</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-300">
                <div className="bg-green-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-green-900 mb-4 text-center">Full Compliance</h3>
                <p className="text-green-700 text-center leading-relaxed">We follow all IMBRA requirements</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300">
                <div className="bg-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-4 text-center">Background Checks</h3>
                <p className="text-blue-700 text-center leading-relaxed">We verify user information</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-300">
                <div className="bg-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-purple-900 mb-4 text-center">Your Rights</h3>
                <p className="text-purple-700 text-center leading-relaxed">You have important protections</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IMBRA Details */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {/* What We Do */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-500 w-8 h-8 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">What We Do</h2>
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  We follow IMBRA rules to keep you safe and informed.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                    <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                      <Search className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Background Checks</h3>
                    <ul className="space-y-2 text-blue-800 text-sm">
                      <li>• Verify user identities</li>
                      <li>• Check criminal records</li>
                      <li>• Confirm personal details</li>
                      <li>• Regular updates</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                    <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-900 mb-3">Information Sharing</h3>
                    <ul className="space-y-2 text-green-800 text-sm">
                      <li>• Share background info</li>
                      <li>• Provide safety resources</li>
                      <li>• Offer support</li>
                      <li>• Keep records</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Your Rights */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-green-500 w-8 h-8 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Your Rights</h2>
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  IMBRA gives you important rights and protections.
                </p>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "Get background information",
                      "Know about criminal history",
                      "Receive safety information",
                      "Report problems",
                      "Get help and support",
                      "Control your information"
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Safety Resources */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-purple-500 w-8 h-8 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Safety Resources</h2>
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  We provide resources to help you stay safe.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl text-center">
                    <div className="bg-red-500 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-red-900 mb-3">Warning Signs</h3>
                    <p className="text-red-800 text-sm">Learn to spot potential problems</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl text-center">
                    <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Support</h3>
                    <p className="text-blue-800 text-sm">Get help when you need it</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl text-center">
                    <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-900 mb-3">Education</h3>
                    <p className="text-green-800 text-sm">Learn about safe dating</p>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-rose-500 w-8 h-8 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">4</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Questions?</h2>
                </div>
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-xl">
                  <p className="text-gray-700 mb-4">Contact us about IMBRA:</p>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Email:</strong> legal@purelove.com</p>
                    <p><strong>Support:</strong> support@purelove.com</p>
                    <p><strong>Safety:</strong> safety@purelove.com</p>
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
            <Shield className="h-12 w-12 text-indigo-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-6">Need Help?</h2>
            <p className="text-lg text-gray-600 mb-8">
              We're here to help you understand your rights and stay safe
            </p>
            <div className="space-x-4">
              <button
                onClick={() => window.location.href = '/contact'}
                className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-8 py-4 rounded-lg font-semibold hover:from-indigo-600 hover:to-blue-600 transition-colors"
              >
                Contact Us
              </button>
              <button
                onClick={() => window.location.href = '/safety'}
                className="border-2 border-indigo-500 text-indigo-500 px-8 py-4 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
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