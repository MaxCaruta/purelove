import { Heart, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-6 w-6 text-primary-500 fill-primary-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">PureLove</span>
            </div>
            <p className="text-gray-600 mb-4">
              Connecting Western men with Eastern European and Central Asian women for meaningful relationships.
            </p>
            <div className="space-y-2">
{/*               
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4" />
                <span>support@purelove.com</span>
              </div> */}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/browse" className="text-gray-600 hover:text-primary-500 transition-colors">
                  Browse Profiles
                </Link>
              </li>
              <li>
                <Link to="/messages" className="text-gray-600 hover:text-primary-500 transition-colors">
                  Messages
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-600 hover:text-primary-500 transition-colors">
                  Dating Blog
                </Link>
              </li>
              <li>
                <Link to="/success-stories" className="text-gray-600 hover:text-primary-500 transition-colors">
                  Success Stories
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-600 hover:text-primary-500 transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Information</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-600 hover:text-primary-500 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-600 hover:text-primary-500 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/safety" className="text-gray-600 hover:text-primary-500 transition-colors">
                  Safety Tips
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-primary-500 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-primary-500 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-primary-500 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-primary-500 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="text-gray-600 hover:text-primary-500 transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/imbra" className="text-gray-600 hover:text-primary-500 transition-colors">
                  IMBRA Compliance
                </Link>
              </li>
              <li>
                <Link to="/anti-scam" className="text-gray-600 hover:text-primary-500 transition-colors">
                  Anti-Scam Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-gray-600">
          <p>© {new Date().getFullYear()} PureLove. All rights reserved.</p>
          <p className="mt-2 text-sm">
            PureLove is committed to ensuring a safe and authentic dating experience. We comply with all international dating regulations including IMBRA.
          </p>
        </div>
      </div>
    </footer>
  );
}
