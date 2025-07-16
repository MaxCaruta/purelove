import { Heart, Users, Shield, Globe, Award, CheckCircle } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-rose-500 to-pink-500 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Heart className="h-16 w-16 mx-auto mb-6 fill-white" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">About PureLove</h1>
            <p className="text-xl md:text-2xl mb-8">
              Connecting hearts across borders since 2018
            </p>
            <p className="text-lg max-w-3xl mx-auto">
              We believe that true love knows no boundaries. Our mission is to help Western men 
              find meaningful relationships with Eastern European and Central Asian women through 
              a safe, authentic, and supportive platform.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Story</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600"
                  alt="Team meeting"
                  className="rounded-xl shadow-lg"
                />
              </div>
              <div>
                <p className="text-lg text-gray-700 mb-6">
                  PureLove was founded in 2018 by a team of relationship experts and technology 
                  professionals who recognized the need for a more authentic approach to international dating.
                </p>
                <p className="text-lg text-gray-700 mb-6">
                  After witnessing countless success stories and the transformative power of 
                  cross-cultural relationships, we dedicated ourselves to creating a platform 
                  that prioritizes safety, authenticity, and genuine connections.
                </p>
                <p className="text-lg text-gray-700">
                  Today, we're proud to have facilitated over 500 successful relationships 
                  and continue to grow our community of love-seekers worldwide.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission & Values */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Mission & Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-rose-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-10 w-10 text-rose-500" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Authentic Love</h3>
                <p className="text-gray-600">
                  We believe in genuine connections built on mutual respect, understanding, and shared values.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-10 w-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Safety First</h3>
                <p className="text-gray-600">
                  Your safety and privacy are our top priorities. We implement strict verification and security measures.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Globe className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Cultural Bridge</h3>
                <p className="text-gray-600">
                  We celebrate cultural diversity and help bridge differences to create lasting relationships.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-10 w-10 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Community</h3>
                <p className="text-gray-600">
                  We foster a supportive community where members can share experiences and find guidance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 bg-gradient-to-r from-rose-500 to-pink-500 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">Our Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl font-bold mb-2">50,000+</div>
                <div className="text-rose-100">Active Members</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">500+</div>
                <div className="text-rose-100">Success Stories</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">25+</div>
                <div className="text-rose-100">Countries</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">6</div>
                <div className="text-rose-100">Years of Excellence</div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Call to Action */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Find Your Perfect Match?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of successful couples who found love through PureLove
          </p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.href = '/signup'}
              className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-4 rounded-lg font-semibold hover:from-rose-600 hover:to-pink-600 transition-colors"
            >
              Get Started Today
            </button>
            <button
              onClick={() => window.location.href = '/contact'}
              className="border-2 border-rose-500 text-rose-500 px-8 py-4 rounded-lg font-semibold hover:bg-rose-50 transition-colors"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 