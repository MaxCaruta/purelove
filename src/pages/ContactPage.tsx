import { useState } from 'react';
import { Mail, MapPin, Clock, Send, MessageSquare, HeadphonesIcon } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We\'ll get back to you within 24 hours.');
    setFormData({
      name: '',
      email: '',
      subject: '',
      category: 'general',
      message: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-rose-500 to-pink-500 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <MessageSquare className="h-16 w-16 mx-auto mb-6 fill-white" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            We're here to help you find love
          </p>
          <p className="text-lg max-w-2xl mx-auto">
            Have questions, need support, or want to share feedback? Get in touch with our team
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div>
                <h2 className="text-3xl font-bold mb-8">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="technical">Technical Support</option>
                      <option value="billing">Billing & Subscriptions</option>
                      <option value="safety">Safety & Security</option>
                      <option value="feedback">Feedback & Suggestions</option>
                      <option value="partnership">Partnership Opportunities</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="Brief description of your inquiry"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="Please provide details about your inquiry..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-rose-600 hover:to-pink-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="h-5 w-5" />
                    Send Message
                  </button>
                </form>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-3xl font-bold mb-8">Get in Touch</h2>
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="bg-rose-100 h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-rose-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Email Support</h3>
                      <p className="text-gray-600 mb-2">Get help with any questions or issues</p>
                      <div className="space-y-1">
                        <p><strong>General:</strong> support@purelove.com</p>
                        <p><strong>Safety:</strong> safety@purelove.com</p>
                        <p><strong>Billing:</strong> billing@purelove.com</p>
                      </div>
                    </div>
                  </div>
                  

                  
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Support Hours</h3>
                      <p className="text-gray-600 mb-2">We're here when you need us</p>
                      <div className="space-y-1">
                        <p><strong>Email:</strong> 24/7 (Response within 24 hours)</p>
                        <p><strong>Emergency:</strong> 24/7 Safety Hotline</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Office Address</h3>
                      <p className="text-gray-600 mb-2">Visit our headquarters</p>
                      <div className="space-y-1">
                        <p>PureLove International</p>
                        <p>123 Love Street, Suite 456</p>
                        <p>Romance City, RC 12345</p>
                        <p>United States</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Quick Answers</h2>
            <p className="text-lg text-gray-600 mb-12">
              Check out our FAQ section for instant answers to common questions
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-rose-50 p-6 rounded-lg">
                <HeadphonesIcon className="h-12 w-12 text-rose-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Technical Issues</h3>
                <p className="text-gray-600 text-sm mb-4">Having trouble with the website or app?</p>
                <button
                  onClick={() => window.location.href = '/faq'}
                  className="text-rose-500 hover:text-rose-600 font-medium"
                >
                  View Tech FAQ →
                </button>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg">
                <Mail className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Account & Billing</h3>
                <p className="text-gray-600 text-sm mb-4">Questions about your subscription or payments?</p>
                <button
                  onClick={() => window.location.href = '/faq'}
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  View Billing FAQ →
                </button>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg">
                <MessageSquare className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Safety & Dating</h3>
                <p className="text-gray-600 text-sm mb-4">Need help with safety or dating advice?</p>
                <button
                  onClick={() => window.location.href = '/safety'}
                  className="text-green-500 hover:text-green-600 font-medium"
                >
                  View Safety Tips →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="py-20 bg-gradient-to-r from-red-500 to-pink-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Emergency Support</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            If you're in immediate danger or need urgent assistance, contact our emergency hotline
          </p>
          <div className="bg-white bg-opacity-20 p-8 rounded-xl max-w-md mx-auto">
            <Mail className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">24/7 Emergency Support</h3>
            <p className="text-3xl font-bold mb-4">safety@purelove.com</p>
            <p className="text-rose-100">Available worldwide, 24 hours a day</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 