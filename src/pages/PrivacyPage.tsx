import { Shield, Eye, Lock, Database, Globe, AlertTriangle, Calendar, Users, FileText, Server, Trash2 } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="bg-white/20 backdrop-blur-sm rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <Shield className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100">
            How we protect your information
          </p>
          <div className="flex items-center justify-center gap-2 text-blue-100 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 w-fit mx-auto">
            <Calendar className="h-5 w-5" />
            <span className="font-medium">Last updated: December 15, 2024</span>
          </div>
        </div>
      </section>

      {/* Privacy Overview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Privacy Matters</h2>
              <p className="text-lg text-gray-600">We protect your personal information</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300">
                <div className="bg-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-4 text-center">Secure</h3>
                <p className="text-blue-700 text-center leading-relaxed">Your data is encrypted and protected</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-300">
                <div className="bg-green-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-green-900 mb-4 text-center">Transparent</h3>
                <p className="text-green-700 text-center leading-relaxed">We're clear about what we collect</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-300">
                <div className="bg-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-purple-900 mb-4 text-center">Your Control</h3>
                <p className="text-purple-700 text-center leading-relaxed">You control your data and settings</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-8 rounded-2xl mt-12 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-900 mb-3">Simple Promise</h3>
                  <p className="text-blue-800 leading-relaxed">
                    We protect your privacy, use your data responsibly, and give you control over your information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {/* What We Collect */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-500 w-8 h-8 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">What We Collect</h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="h-6 w-6 text-blue-600" />
                      <h3 className="text-xl font-semibold text-gray-900">Profile Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        "Name, age, and location",
                        "Email and phone number",
                        "Photos and descriptions",
                        "Relationship preferences"
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-700 text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Database className="h-6 w-6 text-green-600" />
                      <h3 className="text-xl font-semibold text-gray-900">Usage Data</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        "Pages you visit",
                        "Messages you send",
                        "Device information",
                        "How you use our features"
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-700 text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* How We Use It */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-green-500 w-8 h-8 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">How We Use Your Data</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                    <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                      <Server className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Provide Service</h3>
                    <ul className="space-y-2 text-blue-800 text-sm">
                      <li>• Create your profile</li>
                      <li>• Find matches</li>
                      <li>• Enable messaging</li>
                      <li>• Process payments</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                    <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-900 mb-3">Keep You Safe</h3>
                    <ul className="space-y-2 text-green-800 text-sm">
                      <li>• Verify identities</li>
                      <li>• Prevent fraud</li>
                      <li>• Monitor for abuse</li>
                      <li>• Follow laws</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                    <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-purple-900 mb-3">Improve Service</h3>
                    <ul className="space-y-2 text-purple-800 text-sm">
                      <li>• Better matching</li>
                      <li>• New features</li>
                      <li>• Fix problems</li>
                      <li>• Understand usage</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Your Rights */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-purple-500 w-8 h-8 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Your Rights</h2>
                </div>
                
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed mb-4">You can:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "See what data we have",
                      "Update your information",
                      "Delete your account",
                      "Download your data",
                      "Control who sees your profile",
                      "Stop marketing emails"
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
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
                  <p className="text-gray-700 mb-4">Contact us about privacy:</p>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Email:</strong> privacy@purelove.com</p>
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
            <Shield className="h-12 w-12 text-blue-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-6">Privacy Questions?</h2>
            <p className="text-lg text-gray-600 mb-8">
              We're here to help you understand how we protect your privacy
            </p>
            <div className="space-x-4">
              <button
                onClick={() => window.location.href = '/contact'}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-600 transition-colors"
              >
                Contact Us
              </button>
              <button
                onClick={() => window.location.href = '/settings'}
                className="border-2 border-blue-500 text-blue-500 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Privacy Settings
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 