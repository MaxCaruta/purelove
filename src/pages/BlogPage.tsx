import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ChevronRight, Search } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

// Mock data
const blogPosts = [
  {
    id: '1',
    title: 'How to Start a Conversation with a Slavic Woman',
    excerpt: 'Breaking the ice can be challenging, especially across cultures. Learn effective conversation starters that resonate with Eastern European women.',
    content: `
      Starting a conversation with someone from a different cultural background can be both exciting and challenging. When it comes to connecting with Slavic women, understanding cultural nuances can make all the difference.

      ## Understand Cultural Context
      
      Eastern European cultures often value directness combined with politeness. Small talk is less common than in Western cultures, and conversations tend to go deeper more quickly.
      
      ## Effective Conversation Starters
      
      1. **Ask about her city or region** - Many Eastern European women are proud of their heritage and will appreciate genuine interest in their hometown.
      
      2. **Discuss literature or arts** - Education in humanities is highly valued in Slavic countries, and many women have strong opinions about literature, music, and art.
      
      3. **Share travel experiences** - If you've visited Eastern Europe, sharing your impressions can create common ground. If not, express interest in places you'd like to visit.
      
      4. **Ask about traditions** - Inquiring about holidays, celebrations, or family traditions shows respect for her culture.
      
      ## Topics to Avoid Initially
      
      - Politics and historical conflicts
      - Stereotypes about Eastern European women
      - Overly personal questions about family or finances
      
      ## Be Authentic
      
      Above all, be genuine in your approach. Slavic women often have a strong intuition for insincerity. Show real interest in getting to know her as an individual, not just as a representative of her culture.
      
      Remember that while these guidelines can be helpful, every person is unique. The most important thing is to listen actively and respond thoughtfully to build a meaningful connection.
    `,
    author: 'Elena Petrova',
    authorTitle: 'Cultural Relationship Coach',
    date: new Date('2023-05-15'),
    category: 'Dating Tips',
    image: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
  },
  {
    id: '2',
    title: 'Understanding Cultural Differences in Relationships',
    excerpt: 'Navigating cross-cultural relationships requires awareness and adaptation. Discover key differences between Western and Eastern European relationship expectations.',
    content: `
      Cross-cultural relationships can be incredibly rewarding, offering new perspectives and rich experiences. However, they also come with unique challenges, particularly when navigating different expectations around relationships.

      ## Family Dynamics
      
      In many Eastern European cultures, family plays a central role in daily life. Close relationships with extended family are common, and family approval of relationships is often important.
      
      - **Western Perspective**: Individual independence is highly valued, and while family is important, adult children often make decisions independently.
      - **Eastern European Perspective**: Family opinions matter significantly, and multi-generational households are more common.
      
      ## Communication Styles
      
      Communication patterns can vary significantly between cultures, leading to potential misunderstandings.
      
      - **Western Perspective**: Often values explicit communication where thoughts and feelings are directly expressed.
      - **Eastern European Perspective**: May rely more on context and implicit communication, with greater emphasis on non-verbal cues.
      
      ## Gender Roles
      
      While both Western and Eastern societies are evolving, there can still be differences in expectations around gender roles.
      
      - **Western Perspective**: Generally emphasizes equality and shared responsibilities in relationships.
      - **Eastern European Perspective**: May maintain some traditional gender role distinctions while also embracing modern equality.
      
      ## Expressions of Affection
      
      How love and affection are expressed can vary between cultures.
      
      - **Western Perspective**: Often comfortable with public displays of affection and verbal expressions of feelings.
      - **Eastern European Perspective**: May express love through acts of service and care, with deep emotional connections that might take longer to develop.
      
      ## Navigating Differences
      
      1. **Practice active listening** - Take time to understand your partner's perspective without judgment.
      2. **Ask questions** - Don't make assumptions about what behaviors or expectations are cultural versus personal.
      3. **Be flexible** - Successful cross-cultural relationships require adaptation from both partners.
      4. **Communicate openly** - Discuss expectations explicitly to avoid misunderstandings.
      
      Remember that these are generalizations, and individual differences always outweigh cultural patterns. The key to success is approaching your relationship with respect, curiosity, and a willingness to learn and grow together.
    `,
    author: 'Dr. Mikhail Ivanov',
    authorTitle: 'Cross-Cultural Psychologist',
    date: new Date('2023-06-22'),
    category: 'Relationships',
    image: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1769&q=80',
  },
  {
    id: '3',
    title: 'Planning Your First Visit: What to Expect',
    excerpt: 'Preparing for your first trip to meet your Eastern European partner? This comprehensive guide covers everything from travel preparations to cultural etiquette.',
    content: `
      Meeting your partner in person for the first time is an exciting milestone in any long-distance relationship. When that meeting involves international travel to Eastern Europe, proper preparation can make the experience much smoother.

      ## Before You Travel
      
      ### Documentation
      
      - **Passport and Visa** - Ensure your passport is valid for at least six months beyond your planned stay. Check visa requirements for the specific country you're visiting.
      - **Travel Insurance** - Comprehensive travel insurance is essential, covering both health emergencies and trip cancellations.
      - **Copies of Documents** - Keep digital and physical copies of all important documents.
      
      ### Communication Preparation
      
      - **Language Basics** - Learning a few phrases in your partner's language shows respect and effort.
      - **Offline Translation App** - Download a reliable translation app that works offline.
      - **International Phone Plan** - Arrange for international roaming or purchase a local SIM card upon arrival.
      
      ## Cultural Considerations
      
      ### Meeting the Family
      
      In many Eastern European cultures, meeting the family is a significant step. If you're invited to a family meal:
      
      - Bring a small gift (flowers, quality chocolate, or a bottle of wine are appropriate)
      - Be prepared to answer questions about your life, work, and family
      - Compliment the food and home
      
      ### Social Etiquette
      
      - **Punctuality** - Being on time is generally expected and appreciated
      - **Dress Code** - Eastern Europeans often dress more formally than Westerners for everyday activities
      - **Table Manners** - Wait to be seated, keep hands visible on the table, and try everything offered
      
      ## Planning Your Stay
      
      ### Accommodation
      
      Consider staying in a hotel or rental apartment initially, even if your partner offers accommodation. This gives both of you space and reduces pressure.
      
      ### Activities
      
      - Plan a mix of activities that allow for different types of interaction
      - Include opportunities to meet friends and family
      - Allow for some downtime to process the experience
      
      ### Safety Considerations
      
      - Share your itinerary with someone at home
      - Have a backup plan for accommodation if needed
      - Keep emergency contact information accessible
      
      ## Managing Expectations
      
      The first in-person meeting can be both wonderful and challenging. Remember:
      
      - Initial awkwardness is normal
      - Give yourselves time to adjust to being in each other's physical presence
      - Be flexible with your plans
      - Communicate openly about your feelings
      
      By preparing thoroughly and approaching the visit with an open mind, you'll create the best possible foundation for this important step in your relationship.
    `,
    author: 'Anna Kowalski',
    authorTitle: 'International Dating Consultant',
    date: new Date('2023-07-10'),
    category: 'Travel',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80',
  },
];

export function BlogPage() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredPosts = blogPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dating Blog</h1>
              <p className="text-slate-600">
                Tips, advice, and insights for cross-cultural relationships
              </p>
            </div>
            
            <div className="w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search articles..."
                  className="pl-9 w-full md:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* Featured Post */}
          <div className="mb-12">
            <Card className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="h-64 md:h-auto">
                  <img
                    src={blogPosts[0].image}
                    alt={blogPosts[0].title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 md:p-8 flex flex-col">
                  <Badge className="self-start mb-2">{blogPosts[0].category}</Badge>
                  <h2 className="text-2xl font-bold mb-2">{blogPosts[0].title}</h2>
                  <p className="text-slate-600 mb-4">{blogPosts[0].excerpt}</p>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{blogPosts[0].author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(blogPosts[0].date)}</span>
                    </div>
                  </div>
                  
                  <Link to={`/blog/${blogPosts[0].id}`} className="mt-auto">
                    <Button className="gap-2">
                      <span>Read Article</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.slice(1).map((post) => (
              <Card key={post.id} className="overflow-hidden flex flex-col">
                <div className="h-48">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6 flex-1 flex flex-col">
                  <Badge className="self-start mb-2">{post.category}</Badge>
                  <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                  <p className="text-slate-600 mb-4 line-clamp-3">{post.excerpt}</p>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(post.date)}</span>
                    </div>
                  </div>
                  
                  <Link to={`/blog/${post.id}`} className="mt-auto">
                    <Button variant="outline" className="gap-2 w-full">
                      <span>Read Article</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No articles found</h3>
              <p className="text-slate-600 mb-4">Try adjusting your search query</p>
              <Button onClick={() => setSearchQuery('')}>Clear Search</Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export function BlogPostPage() {
  const [user, setUser] = useState(null);
  // In a real app, you would use useParams to get the post ID from the URL
  const postId = '1'; // Example post ID
  
  // Find the post based on the ID
  const post = blogPosts.find((p) => p.id === postId) || blogPosts[0];
  
  // Get related posts (excluding the current post)
  const relatedPosts = blogPosts
    .filter((p) => p.id !== post.id && p.category === post.category)
    .slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Link to="/blog" className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 mb-4">
              <ChevronRight className="h-4 w-4 rotate-180" />
              <span>Back to Blog</span>
            </Link>
            
            <Badge className="mb-4">{post.category}</Badge>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="font-medium">{post.author}</p>
                  <p className="text-sm text-slate-500">{post.authorTitle}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-slate-500">
                <Calendar className="h-5 w-5" />
                <span>{formatDate(post.date)}</span>
              </div>
            </div>
            
            <div className="mb-8">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-80 object-cover rounded-lg"
              />
            </div>
            
            <div className="prose prose-slate max-w-none mb-12">
              {post.content.split('\n\n').map((paragraph, index) => {
                // Handle markdown headings
                if (paragraph.startsWith('## ')) {
                  return (
                    <h2 key={index} className="text-2xl font-bold mt-8 mb-4">
                      {paragraph.replace('## ', '')}
                    </h2>
                  );
                }
                
                // Handle markdown subheadings
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3 key={index} className="text-xl font-bold mt-6 mb-3">
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }
                
                // Handle markdown lists
                if (paragraph.includes('- **')) {
                  const listItems = paragraph.split('\n- ');
                  return (
                    <ul key={index} className="list-disc pl-6 space-y-2 my-4">
                      {listItems.map((item, itemIndex) => {
                        if (itemIndex === 0 && !item.startsWith('- ')) return null;
                        const cleanItem = item.replace(/- /, '');
                        
                        // Handle bold text in list items
                        if (cleanItem.includes('**')) {
                          const parts = cleanItem.split('**');
                          return (
                            <li key={itemIndex} className="text-slate-700">
                              <strong>{parts[1]}</strong>
                              {parts[2]}
                            </li>
                          );
                        }
                        
                        return (
                          <li key={itemIndex} className="text-slate-700">
                            {cleanItem}
                          </li>
                        );
                      })}
                    </ul>
                  );
                }
                
                // Handle markdown numbered lists
                if (paragraph.includes('. **')) {
                  const listItems = paragraph.split('\n');
                  return (
                    <ol key={index} className="list-decimal pl-6 space-y-2 my-4">
                      {listItems.map((item, itemIndex) => {
                        // Extract the number and content
                        const match = item.match(/(\d+)\. (.*)/);
                        if (!match) return null;
                        
                        const [, number, content] = match;
                        
                        // Handle bold text in list items
                        if (content.includes('**')) {
                          const parts = content.split('**');
                          return (
                            <li key={itemIndex} className="text-slate-700">
                              <strong>{parts[1]}</strong>
                              {parts[2]}
                            </li>
                          );
                        }
                        
                        return (
                          <li key={itemIndex} className="text-slate-700">
                            {content}
                          </li>
                        );
                      })}
                    </ol>
                  );
                }
                
                // Regular paragraphs
                return (
                  <p key={index} className="text-slate-700 mb-4">
                    {paragraph}
                  </p>
                );
              })}
            </div>
            
            {/* Actions */}
            <div className="flex flex-wrap justify-end items-center border-t border-b py-4 mb-8">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Save Article
                </Button>
                <Button size="sm">
                  Join Discussion
                </Button>
              </div>
            </div>
            
            {/* Related Articles */}
            {relatedPosts.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Card key={relatedPost.id} className="overflow-hidden">
                      <div className="h-40">
                        <img
                          src={relatedPost.image}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <Badge className="mb-2">{relatedPost.category}</Badge>
                        <h3 className="font-bold mb-2">{relatedPost.title}</h3>
                        <Link to={`/blog/${relatedPost.id}`}>
                          <Button variant="outline" size="sm" className="gap-1">
                            <span>Read Article</span>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}


