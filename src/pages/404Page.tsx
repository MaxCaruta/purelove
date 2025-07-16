import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 Icon */}
          <div className="mb-8">
            <div className="relative">
              <div className="text-9xl font-bold text-rose-200 select-none">404</div>
              <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl font-bold text-rose-500">404</div>
          </div>
            </div>
          </div>
          
          {/* Error Message */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          {/* Suggested Actions */}
          <div className="space-y-4 mb-12">
            <p className="text-gray-500">
              Maybe you meant to visit one of these pages?
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600 text-white px-6 py-3">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </Link>
              
              <Link to="/browse">
                <Button variant="outline" className="w-full sm:w-auto px-6 py-3">
                  <Search className="w-4 h-4 mr-2" />
                  Browse Profiles
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Go Back Button */}
          <div className="flex justify-center">
            <Button 
              variant="ghost" 
              onClick={() => window.history.back()}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
          
          {/* Helpful Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">
              Need help? Try these popular pages:
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link to="/about" className="text-rose-500 hover:text-rose-600 hover:underline">
                About Us
              </Link>
              <Link to="/how-it-works" className="text-rose-500 hover:text-rose-600 hover:underline">
                How It Works
              </Link>
              <Link to="/pricing" className="text-rose-500 hover:text-rose-600 hover:underline">
                Pricing
              </Link>
              <Link to="/contact" className="text-rose-500 hover:text-rose-600 hover:underline">
                Contact
              </Link>
              <Link to="/faq" className="text-rose-500 hover:text-rose-600 hover:underline">
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 