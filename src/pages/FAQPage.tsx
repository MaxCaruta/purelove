import { useState } from 'react';
import { ChevronDown, ChevronUp, FileQuestion, HelpCircle, Search } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    id: 1,
    category: "Getting Started",
    question: "How do I create an account?",
    answer: "Creating an account is simple! Click the 'Sign Up' button, fill in your basic information, verify your email, and complete your profile. The entire process takes about 10-15 minutes."
  },
  {
    id: 2,
    category: "Getting Started",
    question: "Is PureLove free to use?",
    answer: "PureLove offers both free and premium features. You can browse profiles and receive messages for free, but to send messages and access advanced features, you'll need a premium subscription."
  },
  {
    id: 3,
    category: "Getting Started",
    question: "How do I verify my profile?",
    answer: "Profile verification involves uploading a government-issued ID and taking a verification photo. This process helps ensure the authenticity of all members and typically takes 24-48 hours to complete."
  },
  {
    id: 4,
    category: "Safety & Security",
    question: "How do you ensure member safety?",
    answer: "We employ multiple safety measures including profile verification, AI-powered scam detection, 24/7 moderation, secure messaging, and comprehensive safety guidelines. We also have a dedicated safety team available around the clock."
  },
  {
    id: 5,
    category: "Safety & Security",
    question: "What should I do if I encounter a scammer?",
    answer: "Immediately report the profile using our report feature. Do not send money or personal information. Block the user and contact our safety team at safety@purelove.com. We investigate all reports within 24 hours."
  },
  {
    id: 6,
    category: "Safety & Security",
    question: "Is my personal information secure?",
    answer: "Yes, we use industry-standard encryption and security measures to protect your data. Your financial information is never stored on our servers, and you control what information is visible in your profile."
  },
  {
    id: 7,
    category: "Communication",
    question: "How does the translation service work?",
    answer: "Our built-in translation service automatically translates messages between different languages. While it's quite accurate, we recommend learning some basic phrases in your match's language for better communication."
  },
  {
    id: 8,
    category: "Communication",
    question: "Can I video chat with matches?",
    answer: "Yes! Video chat is available for premium members. It's a great way to verify someone's identity and build a stronger connection before meeting in person."
  },
  {
    id: 9,
    category: "Communication",
    question: "What are virtual gifts?",
    answer: "Virtual gifts are digital presents you can send to show interest or affection. They range from flowers and chocolates to more elaborate gifts, and help you stand out and express your feelings."
  },
  {
    id: 10,
    category: "Matching",
    question: "How does the matching algorithm work?",
    answer: "Our algorithm considers your preferences, interests, values, and behavior on the platform to suggest compatible matches. The more complete your profile, the better the matches we can provide."
  },
  {
    id: 11,
    category: "Matching",
    question: "Why am I not getting matches?",
    answer: "Ensure your profile is complete with high-quality photos and detailed information. Be active on the platform, use search filters effectively, and consider expanding your preferences. Our customer success team can also provide personalized advice."
  },
  {
    id: 12,
    category: "Matching",
    question: "Can I search for specific criteria?",
    answer: "Yes! Our advanced search allows you to filter by age, location, education, interests, lifestyle preferences, and more. Premium members have access to additional search filters."
  },
  {
    id: 13,
    category: "Subscription",
    question: "What's included in premium membership?",
    answer: "Premium membership includes unlimited messaging, advanced search filters, video chat, priority customer support, profile boost features, and access to exclusive events and content."
  },
  {
    id: 14,
    category: "Subscription",
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time through your account settings. Your premium features will remain active until the end of your billing period."
  },
  {
    id: 15,
    category: "Subscription",
    question: "Do you offer refunds?",
    answer: "We offer a 30-day satisfaction guarantee for new subscribers. If you're not satisfied within the first 30 days, contact our support team for a full refund."
  },
  {
    id: 16,
    category: "Meeting & Travel",
    question: "How do I safely meet someone in person?",
    answer: "Always meet in public places, tell someone your plans, verify their identity through video chat first, and trust your instincts. Consider meeting in your home country initially or choose a neutral location."
  },
  {
    id: 17,
    category: "Meeting & Travel",
    question: "Do you help with travel arrangements?",
    answer: "We provide guidance and resources for international travel, including visa information and travel tips. While we don't book travel directly, our concierge service can connect you with trusted travel partners."
  },
  {
    id: 18,
    category: "Meeting & Travel",
    question: "What if my match doesn't look like their photos?",
    answer: "This is why we strongly recommend video chats before meeting. If someone misrepresented themselves, you can report the profile and leave the meeting safely. Always meet in public places with an exit strategy."
  },
 
  {
    id: 20,
    category: "Technical",
    question: "I'm having trouble with the website. What should I do?",
    answer: "Try refreshing the page, clearing your browser cache, or using a different browser. If problems persist, contact our technical support team at support@purelove.com with details about the issue."
  }
];

export function FAQPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(faqs.map(faq => faq.category)))];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-rose-500 to-pink-500 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Frequently Asked Questions</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Find answers to common questions about PureLove
          </p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No FAQs found matching your search criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <div 
                    key={faq.id} 
                    className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 ease-in-out ${
                      openFAQ === faq.id ? 'shadow-lg scale-[1.00]' : 'hover:shadow-lg'
                    }`}
                  >
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div>
                        <span className="text-sm text-rose-500 font-medium">{faq.category}</span>
                        <h3 className="text-lg font-semibold text-gray-900 mt-1">{faq.question}</h3>
                      </div>
                      <div className="flex-shrink-0">
                        <ChevronDown 
                          className={`h-5 w-5 text-gray-500 transition-transform duration-300 ease-in-out ${
                            openFAQ === faq.id ? 'rotate-180' : 'rotate-0'
                          }`} 
                        />
                      </div>
                    </button>
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        openFAQ === faq.id 
                          ? 'max-h-96 opacity-100' 
                          : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-6 pb-4 border-t border-gray-100 transform transition-transform duration-300 ease-in-out">
                        <p className="text-gray-700 leading-relaxed pt-4">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20 bg-gradient-to-r from-rose-500 to-pink-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Still Have Questions?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Our customer support team is here to help you 24/7
          </p>
          <div className="space-x-4">
            <button
                              onClick={() => window.location.href = '/contact'}
              className="bg-white text-rose-500 px-8 py-4 rounded-lg font-semibold hover:bg-rose-50 transition-colors"
            >
              Contact Support
            </button>
            <button
              onClick={() => window.location.href = 'mailto:support@purelove.com'}
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-rose-500 transition-colors"
            >
              Email Us
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 