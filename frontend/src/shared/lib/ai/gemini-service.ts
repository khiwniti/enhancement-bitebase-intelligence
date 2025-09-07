/**
 * Google Gemini AI Service
 * Provides intelligent AI responses with natural human-like conversation
 */

interface GeminiResponse {
  text: string;
  confidence: number;
  context?: string;
}

interface RestaurantAnalysis {
  insights: string[];
  recommendations: string[];
  trends: string[];
  summary: string;
}

interface LocationIntelligence {
  marketAnalysis: string;
  competitorInsights: string[];
  demographicData: string;
  recommendations: string[];
}

class GeminiAIService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || '';
  }

  /**
   * Generate natural AI response with context awareness
   */
  async generateResponse(prompt: string, context?: string): Promise<GeminiResponse> {
    try {
      const enhancedPrompt = this.enhancePrompt(prompt, context);
      
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: enhancedPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I couldn\'t generate a response at the moment.';

      return {
        text: this.humanizeResponse(text),
        confidence: this.calculateConfidence(data),
        context: context || ''
      };
    } catch (error) {
      console.error('Gemini AI Error:', error);
      return this.getFallbackResponse(prompt);
    }
  }

  /**
   * Analyze restaurant data with AI insights
   */
  async analyzeRestaurantData(restaurantData: any): Promise<RestaurantAnalysis> {
    const prompt = `
    As a restaurant business intelligence expert, analyze this restaurant data and provide actionable insights:
    
    Restaurant: ${restaurantData.name}
    Location: ${restaurantData.location}
    Cuisine: ${restaurantData.cuisine}
    Rating: ${restaurantData.rating}/5
    Reviews: ${restaurantData.reviews}
    Monthly Revenue: $${restaurantData.monthlyRevenue}
    Staff Count: ${restaurantData.staff}
    
    Please provide:
    1. Key business insights
    2. Specific recommendations for improvement
    3. Market trends affecting this restaurant
    4. Executive summary
    
    Respond in a professional, actionable manner.
    `;

    const response = await this.generateResponse(prompt, 'restaurant_analysis');
    return this.parseRestaurantAnalysis(response.text);
  }

  /**
   * Generate location intelligence insights
   */
  async generateLocationIntelligence(locationData: any): Promise<LocationIntelligence> {
    const prompt = `
    As a location intelligence specialist, analyze this area for restaurant business opportunities:
    
    Location: ${locationData.address}
    Population Density: ${locationData.populationDensity}
    Average Income: $${locationData.averageIncome}
    Foot Traffic: ${locationData.footTraffic}
    Nearby Competitors: ${locationData.competitors?.length || 0}
    
    Provide:
    1. Market analysis for this location
    2. Competitor insights and positioning
    3. Demographic analysis
    4. Strategic recommendations
    
    Be specific and actionable in your analysis.
    `;

    const response = await this.generateResponse(prompt, 'location_intelligence');
    return this.parseLocationIntelligence(response.text);
  }

  /**
   * Generate research insights
   */
  async generateResearchInsights(query: string, dataPoints: any[]): Promise<string> {
    const prompt = `
    As a research analyst, investigate: "${query}"
    
    Available data points: ${JSON.stringify(dataPoints, null, 2)}
    
    Provide comprehensive research insights with:
    - Key findings
    - Data-driven conclusions
    - Actionable recommendations
    - Future trends to watch
    
    Present findings in a clear, professional manner.
    `;

    const response = await this.generateResponse(prompt, 'research_analysis');
    return response.text;
  }

  /**
   * Enhance prompts with context and personality
   */
  private enhancePrompt(prompt: string, context?: string): string {
    const systemContext = `
    You are an intelligent business assistant for BiteBase Intelligence, a restaurant analytics platform.
    You provide helpful, accurate, and actionable insights about restaurant business operations.
    
    Your personality:
    - Professional yet approachable
    - Data-driven but human-friendly
    - Proactive in offering solutions
    - Clear and concise in communication
    
    Context: ${context || 'general_assistance'}
    
    User Query: ${prompt}
    
    Please respond naturally and helpfully, as if you're a knowledgeable business consultant.
    `;

    return systemContext;
  }

  /**
   * Make AI responses more human-like
   */
  private humanizeResponse(text: string): string {
    // Add natural conversation elements
    const humanizedText = text
      .replace(/^(Based on|According to)/i, 'Looking at')
      .replace(/In conclusion/i, 'To sum up')
      .replace(/Furthermore/i, 'Also')
      .replace(/Additionally/i, 'Plus')
      .replace(/Therefore/i, 'So');

    return humanizedText;
  }

  /**
   * Calculate confidence score from API response
   */
  private calculateConfidence(data: any): number {
    // Simple confidence calculation based on response quality
    const hasContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const contentLength = hasContent?.length || 0;
    
    if (contentLength > 500) return 0.9;
    if (contentLength > 200) return 0.7;
    if (contentLength > 50) return 0.5;
    return 0.3;
  }

  /**
   * Provide fallback responses when AI fails
   */
  private getFallbackResponse(prompt: string): GeminiResponse {
    const fallbacks = [
      "I'm here to help you with restaurant analytics and insights. Could you please rephrase your question?",
      "Let me assist you with that. Could you provide more specific details about what you're looking for?",
      "I'd be happy to help analyze your restaurant data. What specific insights are you seeking?",
    ];

    return {
      text: fallbacks[Math.floor(Math.random() * fallbacks.length)] || "I'm here to help with your restaurant analysis.",
      confidence: 0.3,
      context: 'fallback'
    };
  }

  /**
   * Parse restaurant analysis response
   */
  private parseRestaurantAnalysis(text: string): RestaurantAnalysis {
    // Simple parsing - in production, use more sophisticated NLP
    const sections = text.split('\n\n');
    
    return {
      insights: this.extractBulletPoints(text, 'insights'),
      recommendations: this.extractBulletPoints(text, 'recommendations'),
      trends: this.extractBulletPoints(text, 'trends'),
      summary: sections[sections.length - 1] || text.substring(0, 200) + '...'
    };
  }

  /**
   * Parse location intelligence response
   */
  private parseLocationIntelligence(text: string): LocationIntelligence {
    const sections = text.split('\n\n');
    
    return {
      marketAnalysis: sections[0] || 'Market analysis pending...',
      competitorInsights: this.extractBulletPoints(text, 'competitor'),
      demographicData: sections[2] || 'Demographic data analysis...',
      recommendations: this.extractBulletPoints(text, 'recommendations')
    };
  }

  /**
   * Extract bullet points from text
   */
  private extractBulletPoints(text: string, keyword: string): string[] {
    const lines = text.split('\n');
    const relevantLines = lines.filter(line => 
      line.includes('•') || line.includes('-') || line.includes('*') ||
      line.toLowerCase().includes(keyword)
    );
    
    return relevantLines.slice(0, 5).map(line => 
      line.replace(/^[•\-*]\s*/, '').trim()
    ).filter(line => line.length > 0);
  }
}

export const geminiAI = new GeminiAIService();
export type { GeminiResponse, RestaurantAnalysis, LocationIntelligence };
