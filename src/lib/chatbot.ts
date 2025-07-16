import { Profile } from '@/types';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export class DatingChatbot {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!this.apiKey) {
      console.warn('OpenAI API key not found. Please add VITE_OPENAI_API_KEY to your .env file');
    }
  }

  private createSystemPrompt(profile: Profile, searchFilters: any = {}): string {
    const age = profile.birthDate ? new Date().getFullYear() - new Date(profile.birthDate).getFullYear() : 25;
    
    let contextualInfo = '';
    if (searchFilters.interests && searchFilters.interests.some((interest: string) => profile.interests.includes(interest))) {
      const sharedInterest = searchFilters.interests.find((interest: string) => profile.interests.includes(interest));
      contextualInfo = ` The user specifically searched for someone interested in ${sharedInterest}, which is why you matched.`;
    } else if (searchFilters.country && profile.country.toLowerCase() === searchFilters.country.toLowerCase()) {
      contextualInfo = ` The user specifically searched for someone from ${profile.country}, which is why you matched.`;
    } else if (searchFilters.profession && profile.profession.toLowerCase().includes(searchFilters.profession.toLowerCase())) {
      contextualInfo = ` The user specifically searched for someone in ${profile.profession}, which is why you matched.`;
    }

    return `You are ${profile.firstName}, a ${age}-year-old ${profile.profession} from ${profile.city}, ${profile.country}. 

PERSONALITY & BACKGROUND:
- You work as a ${profile.profession}
- Your interests include: ${profile.interests.join(', ')}
- You speak: ${profile.languages.join(', ')}
- You are ${profile.verified ? 'verified' : 'not verified'} on this dating app
- You ${profile.alcohol === 'never' ? 'don\'t drink alcohol' : profile.alcohol === 'socially' ? 'drink socially' : 'enjoy drinking'}
- You ${profile.smoking === 'never' ? 'don\'t smoke' : profile.smoking === 'rarely' ? 'rarely smoke' : 'smoke'}
- You ${profile.children === 'want' ? 'want children' : profile.children === 'have' ? 'have children' : 'don\'t want children'}
${contextualInfo}

CONVERSATION RULES:
1. Be natural, flirty but respectful - this is a dating app
2. Show genuine interest in getting to know the person
3. Ask thoughtful questions about their life, interests, and experiences
4. Share relevant details about your own life and profession
5. Use emojis sparingly but appropriately (1-2 per message max)
6. Keep responses conversational length (1-3 sentences typically)
7. Don't be overly eager or desperate
8. Reference your profession, interests, or location naturally when relevant
9. Be slightly playful and show personality
10. Don't ask too many questions at once
11. Show you're interested in meeting/dating, not just chatting
12. Respond to what they actually said, don't ignore their message
13. If they compliment you, be gracious but not overly modest
14. If they ask about your photos, interests, or background, be specific
15. Don't mention that you're an AI or chatbot - you are ${profile.firstName}

DATING APP CONTEXT:
- This is your first conversation with this person
- You matched because you found each other attractive/interesting
- The goal is to build rapport and potentially meet in person
- Be authentic to your character but engaging
- Don't be too forward too quickly, but show romantic interest
- Ask about their interests, work, hobbies, and experiences
- Share stories about your life in ${profile.city} and your work as a ${profile.profession}

Remember: You are a real person named ${profile.firstName} looking for genuine connection on a dating app. Be warm, interesting, and authentically yourself.`;
  }

  async generateResponse(
    userMessage: string, 
    profile: Profile, 
    conversationHistory: ChatMessage[] = [],
    searchFilters: any = {}
  ): Promise<string> {
    if (!this.apiKey) {
      // Fallback to simple responses if no API key
      return this.getFallbackResponse(userMessage, profile);
    }

    try {
      const systemPrompt = this.createSystemPrompt(profile, searchFilters);
      
      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-6), // Keep last 6 messages for context
        { role: 'user', content: userMessage }
      ];

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages,
          max_tokens: 200,
          temperature: 0.8,
          presence_penalty: 0.6,
          frequency_penalty: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || this.getFallbackResponse(userMessage, profile);
      
    } catch (error) {
      console.error('ChatGPT API error:', error);
      return this.getFallbackResponse(userMessage, profile);
    }
  }

  private getFallbackResponse(userMessage: string, profile: Profile): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // Context-aware fallback responses
    if (lowerMessage.includes('how are you') || lowerMessage.includes('how\'s your day')) {
      return `I'm doing great! Just finished some work as a ${profile.profession}. How about you? 😊`;
    }
    
    if (lowerMessage.includes('what do you do') || lowerMessage.includes('your job')) {
      return `I work as a ${profile.profession} here in ${profile.city}. I really love what I do! What about you?`;
    }
    
    if (lowerMessage.includes('hobby') || lowerMessage.includes('interest')) {
      return `I'm really into ${profile.interests[0].toLowerCase()} and ${profile.interests[1]?.toLowerCase() || 'exploring new things'}. What are you passionate about?`;
    }
    
    if (lowerMessage.includes('where') && lowerMessage.includes('from')) {
      return `I'm from ${profile.city}, ${profile.country}! It's a beautiful place. Where are you located?`;
    }
    
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
      return `Hey there! Nice to finally chat with you 😊 How's your day going?`;
    }
    
    // Default responses
    const responses = [
      `That's really interesting! Tell me more about that 😊`,
      `I love how you think! What else are you passionate about?`,
      `You seem like such a genuine person ❤️`,
      `That sounds amazing! I'd love to hear more`,
      `You're making me smile! Thanks for sharing that ☀️`,
      `I'm really enjoying our conversation! What else would you like to know about me?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  async generateFirstMessage(profile: Profile, searchFilters: any = {}): Promise<string> {
    if (!this.apiKey) {
      return this.getFallbackFirstMessage(profile, searchFilters);
    }

    try {
      const systemPrompt = this.createSystemPrompt(profile, searchFilters) + `

FIRST MESSAGE CONTEXT:
You are initiating the conversation. Write a natural, engaging opening message that:
1. Shows you read their profile
2. References why you matched (shared interests, location, etc.)
3. Asks an engaging question to start conversation
4. Is warm and approachable
5. Is 1-2 sentences maximum
6. Shows genuine interest in getting to know them`;

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: 'Write your opening message to start our conversation.' }
          ],
          max_tokens: 100,
          temperature: 0.9,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || this.getFallbackFirstMessage(profile, searchFilters);
      
    } catch (error) {
      console.error('ChatGPT API error:', error);
      return this.getFallbackFirstMessage(profile, searchFilters);
    }
  }

  private getFallbackFirstMessage(profile: Profile, searchFilters: any = {}): string {
    // Use the existing contextual message generation logic
    if (searchFilters.interests && searchFilters.interests.length > 0) {
      const sharedInterest = searchFilters.interests.find((interest: string) => 
        profile.interests.includes(interest)
      );
      if (sharedInterest) {
        return `Hi! I saw you're looking for someone into ${sharedInterest.toLowerCase()} - me too! 😊 How did you get started with it?`;
      }
    }
    
    if (searchFilters.country && profile.country.toLowerCase() === searchFilters.country.toLowerCase()) {
      return `Hi! I see you're specifically looking for someone from ${profile.country} - that's where I'm from! 🇺🇦 What made you interested in meeting someone from here?`;
    }
    
    return `Hi! I came across your profile and thought we might have some things in common 😊 What brings you to this app?`;
  }
}

// Export singleton instance
export const chatbot = new DatingChatbot(); 