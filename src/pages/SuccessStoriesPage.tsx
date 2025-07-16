import { useState } from 'react';
import { Heart, Star, Calendar, MapPin, Quote } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

interface SuccessStory {
  id: number;
  coupleNames: string;
  countries: string;
  meetDate: string;
  marriageDate?: string;
  image: string;
  story: string;
  testimonial: string;
  rating: number;
}

const successStories: SuccessStory[] = [
  {
    id: 1,
    coupleNames: "Michael & Anastasia",
    countries: "USA & Ukraine",
    meetDate: "March 2022",
    marriageDate: "September 2023",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400",
    story: "We met through PureLove and instantly connected over our shared love of travel and classical music. Despite the distance, we knew we had found something special.",
    testimonial: "PureLove made it possible for us to find true love across continents. The platform's safety features and genuine profiles gave us confidence throughout our journey.",
    rating: 5
  },
  {
    id: 2,
    coupleNames: "David & Elena",
    countries: "Canada & Belarus",
    meetDate: "January 2023",
    marriageDate: "June 2024",
    image: "https://images.squarespace-cdn.com/content/v1/5f6c63274865985e13575ba8/8c657c02-0553-4ec2-816d-599ee2aa78bf/glewstone-court-country-house-wedding-decors.jpg",
    story: "After years of unsuccessful dating, we both decided to try international dating. Our first video call lasted 4 hours, and we knew we were meant to be together.",
    testimonial: "The translation services and cultural guidance from PureLove helped us navigate our differences and build a strong foundation for our relationship.",
    rating: 5
  },
  {
    id: 3,
    coupleNames: "Robert & Oksana",
    countries: "Australia & Kazakhstan",
    meetDate: "August 2021",
    marriageDate: "April 2023",
    image: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400",
    story: "We connected over our shared entrepreneurial spirit. Oksana's business acumen and warm personality captured my heart immediately.",
    testimonial: "PureLove's verification system ensured we were both serious about finding love. The support team was incredibly helpful throughout our journey.",
    rating: 5
  },
  {
    id: 4,
    coupleNames: "James & Yulia",
    countries: "UK & Russia",
    meetDate: "November 2022",
    image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400",
    story: "We're still in the process of closing the distance, but our love grows stronger every day. Video calls and messages keep us connected across time zones.",
    testimonial: "The platform's communication tools have been essential for maintaining our long-distance relationship. We're planning our wedding for next year!",
    rating: 5
  },
  {
    id: 5,
    coupleNames: "Thomas & Svetlana",
    countries: "Germany & Moldova",
    meetDate: "May 2021",
    marriageDate: "November 2022",
    image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400",
    story: "Our families were initially skeptical about international dating, but when they met us together, they could see how perfect we are for each other.",
    testimonial: "PureLove connected us with our soulmates. The cultural exchange has enriched both our lives immensely.",
    rating: 5
  },
  {
    id: 6,
    coupleNames: "William & Karina",
    countries: "USA & Uzbekistan",
    meetDate: "September 2023",
    image: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400",
    story: "We bonded over our love for cooking and trying new cuisines. Karina has taught me so much about Central Asian culture and traditions.",
    testimonial: "The detailed profiles on PureLove helped us find someone with compatible values and interests. We're planning to meet in person soon!",
    rating: 5
  }
];

export function SuccessStoriesPage() {
  const [selectedStory, setSelectedStory] = useState<SuccessStory | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-rose-500 to-pink-500 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Heart className="h-16 w-16 mx-auto mb-6 fill-white" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Success Stories</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Real couples who found love through PureLove
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">500+</div>
              <div className="text-rose-100">Happy Couples</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">150+</div>
              <div className="text-rose-100">Marriages</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">95%</div>
              <div className="text-rose-100">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {successStories.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setSelectedStory(story)}
              >
                <div className="relative h-64">
                  <img
                    src={story.image}
                    alt={story.coupleNames}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold">{story.coupleNames}</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>{story.countries}</span>
                    </div>
                  </div>
                  {story.marriageDate && (
                    <div className="absolute top-4 right-4 bg-rose-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Married
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Met {story.meetDate}</span>
                    {story.marriageDate && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-600">Married {story.marriageDate}</span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center mb-3">
                    {[...Array(story.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {story.story}
                  </p>
                  
                  <button className="text-rose-500 hover:text-rose-600 font-medium text-sm">
                    Read Full Story →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-rose-500 to-pink-500 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Write Your Own Success Story?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of singles who have found their perfect match through PureLove
          </p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.href = '/signup'}
              className="bg-white text-rose-500 px-8 py-4 rounded-lg font-semibold hover:bg-rose-50 transition-colors"
            >
              Start Your Journey
            </button>
            <button
              onClick={() => window.location.href = '/browse'}
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-rose-500 transition-colors"
            >
              Browse Profiles
            </button>
          </div>
        </div>
      </section>

      {/* Story Modal */}
      {selectedStory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative h-64">
              <img
                src={selectedStory.image}
                alt={selectedStory.coupleNames}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedStory(null)}
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70"
              >
                ×
              </button>
            </div>
            
            <div className="p-8">
              <h2 className="text-3xl font-bold mb-4">{selectedStory.coupleNames}</h2>
              <div className="flex items-center gap-4 mb-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedStory.countries}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Met {selectedStory.meetDate}</span>
                </div>
                {selectedStory.marriageDate && (
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-rose-500" />
                    <span>Married {selectedStory.marriageDate}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center mb-6">
                {[...Array(selectedStory.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">Their Story</h3>
                <p className="text-gray-700 leading-relaxed mb-6">{selectedStory.story}</p>
              </div>
              
              <div className="bg-rose-50 p-6 rounded-lg">
                <div className="flex items-start gap-3">
                  <Quote className="h-6 w-6 text-rose-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-gray-700 italic mb-3">{selectedStory.testimonial}</p>
                    <p className="text-rose-600 font-medium">- {selectedStory.coupleNames}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
} 