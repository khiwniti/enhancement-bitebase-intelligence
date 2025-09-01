"""
BiteBase Intelligence Restaurant Intent Classifier
Classifies natural language queries into restaurant-specific intents
"""

import re
import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime

from app.schemas.nl_query import QueryIntent, RestaurantQueryIntent

logger = logging.getLogger(__name__)


class RestaurantIntentClassifier:
    """Restaurant-specific intent classification"""
    
    def __init__(self, anthropic_client=None):
        self.anthropic_client = anthropic_client
        self.intent_patterns = self._load_intent_patterns()
        self.entity_patterns = self._load_entity_patterns()
    
    def _load_intent_patterns(self) -> Dict[str, Dict[str, Any]]:
        """Load restaurant-specific intent patterns"""
        return {
            'revenue_analysis': {
                'keywords': ['revenue', 'sales', 'income', 'earnings', 'money', 'profit', 'financial'],
                'patterns': [
                    r'(?:show|display|get|find).*(?:revenue|sales|income)',
                    r'(?:revenue|sales|income).*(?:by|for|in|across)',
                    r'(?:how much|total).*(?:revenue|sales|money)',
                    r'(?:financial|monetary).*(?:performance|results)'
                ],
                'required_entities': ['metric'],
                'optional_entities': ['time_period', 'location', 'comparison'],
                'sql_template': 'SELECT {location_field}, SUM({revenue_field}) FROM {table} WHERE {conditions} GROUP BY {location_field}',
                'confidence_boost': 0.1
            },
            'menu_performance': {
                'keywords': ['menu', 'items', 'dishes', 'food', 'popular', 'selling', 'ordered', 'bestseller'],
                'patterns': [
                    r'(?:top|best|popular|most).*(?:menu|items|dishes|food)',
                    r'(?:menu|items|dishes).*(?:performance|selling|popular)',
                    r'(?:what|which).*(?:items|dishes).*(?:selling|popular)',
                    r'(?:bestseller|top seller|most ordered)'
                ],
                'required_entities': ['menu_category'],
                'optional_entities': ['time_period', 'location', 'ranking'],
                'sql_template': 'SELECT name, popularity_score FROM menu_items WHERE {conditions} ORDER BY popularity_score DESC',
                'confidence_boost': 0.1
            },
            'customer_metrics': {
                'keywords': ['customers', 'visitors', 'traffic', 'footfall', 'people', 'guests'],
                'patterns': [
                    r'(?:how many|number of).*(?:customers|visitors|people)',
                    r'(?:customer|visitor).*(?:count|traffic|volume)',
                    r'(?:footfall|foot traffic|people traffic)',
                    r'(?:guest|patron).*(?:count|numbers)'
                ],
                'required_entities': ['metric'],
                'optional_entities': ['time_period', 'location', 'demographic'],
                'sql_template': 'SELECT date, estimated_customers FROM restaurant_analytics WHERE {conditions}',
                'confidence_boost': 0.1
            },
            'location_comparison': {
                'keywords': ['compare', 'versus', 'vs', 'locations', 'branches', 'stores', 'restaurants'],
                'patterns': [
                    r'(?:compare|versus|vs).*(?:locations|branches|stores)',
                    r'(?:locations|branches|stores).*(?:compare|versus|performance)',
                    r'(?:which|what).*(?:location|branch|store).*(?:better|best|worst)',
                    r'(?:performance|metrics).*(?:by|across).*(?:location|branch)'
                ],
                'required_entities': ['location', 'metric'],
                'optional_entities': ['time_period', 'comparison'],
                'sql_template': 'SELECT location, {metrics} FROM restaurant_analytics WHERE {conditions} GROUP BY location',
                'confidence_boost': 0.1
            },
            'trend_analysis': {
                'keywords': ['trend', 'trends', 'over time', 'growth', 'decline', 'change', 'pattern'],
                'patterns': [
                    r'(?:trend|trends|pattern).*(?:over|during|in)',
                    r'(?:growth|decline|change).*(?:over|during|in)',
                    r'(?:how.*changed|what.*trend)',
                    r'(?:monthly|weekly|daily|yearly).*(?:trend|pattern|change)'
                ],
                'required_entities': ['time_period', 'metric'],
                'optional_entities': ['location', 'comparison'],
                'sql_template': 'SELECT date, {metrics} FROM restaurant_analytics WHERE {conditions} ORDER BY date',
                'confidence_boost': 0.1
            }
        }
    
    def _load_entity_patterns(self) -> Dict[str, List[str]]:
        """Load entity recognition patterns"""
        return {
            'time_period': [
                r'(?:last|past|previous)\s+(?:week|month|quarter|year)',
                r'(?:this|current)\s+(?:week|month|quarter|year)',
                r'(?:Q[1-4]|quarter\s+[1-4])',
                r'(?:january|february|march|april|may|june|july|august|september|october|november|december)',
                r'(?:\d{4})',  # Year
                r'(?:\d{1,2}\/\d{1,2}\/\d{4})',  # Date
                r'(?:today|yesterday|tomorrow)',
                r'(?:ytd|year to date)',
                r'(?:\d+\s+(?:days?|weeks?|months?)\s+ago)'
            ],
            'location': [
                r'(?:location|branch|store|restaurant)\s+(?:\w+)',
                r'(?:in|at|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',  # City names
                r'(?:all\s+(?:locations|branches|stores))',
                r'(?:downtown|uptown|central|north|south|east|west)',
                r'(?:mall|plaza|center|district)'
            ],
            'metric': [
                r'(?:revenue|sales|income|earnings)',
                r'(?:customers?|visitors?|traffic)',
                r'(?:orders?|transactions?)',
                r'(?:rating|reviews?|feedback)',
                r'(?:profit|margin|cost)',
                r'(?:average\s+order\s+value|aov)'
            ],
            'comparison': [
                r'(?:top|best|highest|maximum)\s+(\d+)',
                r'(?:bottom|worst|lowest|minimum)\s+(\d+)',
                r'(?:more|less|greater|higher|lower)\s+than',
                r'(?:compare|versus|vs|against)',
                r'(?:rank|ranking|position)'
            ]
        }
    
    async def classify_intent(self, query: str, context: Dict[str, Any]) -> QueryIntent:
        """Classify the intent of a natural language query"""
        try:
            # First try pattern-based classification
            pattern_result = self._classify_with_patterns(query)
            
            # If pattern classification is confident enough, use it
            if pattern_result['confidence'] >= 0.8:
                return QueryIntent(
                    intent_type=pattern_result['intent'],
                    confidence=pattern_result['confidence'],
                    sub_intents=pattern_result.get('sub_intents', []),
                    parameters=pattern_result.get('parameters', {})
                )
            
            # Otherwise, use AI-enhanced classification
            if self.anthropic_client:
                ai_result = await self._classify_with_ai(query, context, pattern_result)
                return QueryIntent(
                    intent_type=ai_result['intent'],
                    confidence=ai_result['confidence'],
                    sub_intents=ai_result.get('sub_intents', []),
                    parameters=ai_result.get('parameters', {})
                )
            
            # Fallback to pattern result
            return QueryIntent(
                intent_type=pattern_result['intent'],
                confidence=pattern_result['confidence'],
                sub_intents=pattern_result.get('sub_intents', []),
                parameters=pattern_result.get('parameters', {})
            )
            
        except Exception as e:
            logger.error(f"Intent classification error: {str(e)}")
            return QueryIntent(
                intent_type='unknown',
                confidence=0.0,
                sub_intents=[],
                parameters={}
            )
    
    def _classify_with_patterns(self, query: str) -> Dict[str, Any]:
        """Classify intent using pattern matching"""
        query_lower = query.lower()
        best_match = {'intent': 'unknown', 'confidence': 0.0, 'parameters': {}}
        
        for intent_type, intent_config in self.intent_patterns.items():
            score = 0.0
            matched_patterns = []
            
            # Check keyword matches
            keyword_matches = sum(1 for keyword in intent_config['keywords'] if keyword in query_lower)
            keyword_score = min(keyword_matches / len(intent_config['keywords']), 1.0) * 0.4
            
            # Check pattern matches
            pattern_matches = 0
            for pattern in intent_config['patterns']:
                if re.search(pattern, query_lower, re.IGNORECASE):
                    pattern_matches += 1
                    matched_patterns.append(pattern)
            
            pattern_score = min(pattern_matches / len(intent_config['patterns']), 1.0) * 0.6
            
            # Calculate total score
            total_score = keyword_score + pattern_score + intent_config.get('confidence_boost', 0.0)
            
            if total_score > best_match['confidence']:
                best_match = {
                    'intent': intent_type,
                    'confidence': min(total_score, 1.0),
                    'parameters': {
                        'matched_keywords': keyword_matches,
                        'matched_patterns': matched_patterns,
                        'required_entities': intent_config['required_entities'],
                        'optional_entities': intent_config['optional_entities'],
                        'sql_template': intent_config['sql_template']
                    }
                }
        
        return best_match
    
    async def _classify_with_ai(self, query: str, context: Dict[str, Any], pattern_result: Dict[str, Any]) -> Dict[str, Any]:
        """Enhance classification using AI"""
        try:
            prompt = self._build_classification_prompt(query, context, pattern_result)
            
            # Use existing Anthropic client patterns
            response = await self.anthropic_client.generate_response(prompt)
            
            # Parse AI response
            ai_result = self._parse_ai_classification(response, pattern_result)
            
            return ai_result
            
        except Exception as e:
            logger.error(f"AI classification error: {str(e)}")
            return pattern_result
    
    def _build_classification_prompt(self, query: str, context: Dict[str, Any], pattern_result: Dict[str, Any]) -> str:
        """Build prompt for AI-enhanced classification"""
        return f"""You are an expert at classifying restaurant business intelligence queries.

Query: "{query}"

Pattern Analysis Result:
- Intent: {pattern_result['intent']}
- Confidence: {pattern_result['confidence']}

Available Intent Categories:
1. revenue_analysis - Questions about sales, revenue, financial performance
2. menu_performance - Questions about menu items, popular dishes, food performance
3. customer_metrics - Questions about customer count, traffic, visitor patterns
4. location_comparison - Questions comparing different restaurant locations
5. trend_analysis - Questions about trends, changes over time, patterns

Context:
- Available restaurants: {context.get('restaurant_count', 'unknown')}
- Date range: {context.get('date_range', 'unknown')}
- User role: {context.get('user_role', 'unknown')}

Please classify this query and provide:
1. The most appropriate intent category
2. Confidence score (0.0 to 1.0)
3. Any sub-intents or specific aspects
4. Key parameters identified

Respond in JSON format:
{{
    "intent": "intent_category",
    "confidence": 0.95,
    "sub_intents": ["specific_aspect"],
    "parameters": {{"key": "value"}}
}}"""
    
    def _parse_ai_classification(self, response: str, fallback: Dict[str, Any]) -> Dict[str, Any]:
        """Parse AI classification response"""
        try:
            import json
            
            # Extract JSON from response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = response[json_start:json_end]
                result = json.loads(json_str)
                
                # Validate result
                if 'intent' in result and 'confidence' in result:
                    return {
                        'intent': result['intent'],
                        'confidence': min(max(result['confidence'], 0.0), 1.0),
                        'sub_intents': result.get('sub_intents', []),
                        'parameters': result.get('parameters', {})
                    }
            
            return fallback
            
        except Exception as e:
            logger.error(f"AI response parsing error: {str(e)}")
            return fallback
    
    async def get_query_suggestions(self, partial_query: str, context: Optional[Dict[str, Any]] = None) -> List[str]:
        """Get query suggestions for auto-complete"""
        try:
            suggestions = []
            
            # Common restaurant query templates
            templates = [
                "Show me revenue by location for {time_period}",
                "What are the top 10 menu items this month?",
                "How many customers visited last week?",
                "Compare revenue across all locations",
                "Show revenue trends over the last 6 months",
                "Which location has the highest sales?",
                "What's the most popular dish category?",
                "Show customer traffic by day of week",
                "Compare this month's revenue to last month",
                "What are the top performing locations?"
            ]
            
            # Filter templates based on partial query
            partial_lower = partial_query.lower()
            for template in templates:
                if any(word in template.lower() for word in partial_lower.split()):
                    suggestions.append(template)
            
            # Add context-specific suggestions
            if context:
                if 'recent_queries' in context:
                    suggestions.extend(context['recent_queries'][:3])
            
            return suggestions[:8]  # Limit to 8 suggestions
            
        except Exception as e:
            logger.error(f"Query suggestions error: {str(e)}")
            return []
    
    def get_intent_requirements(self, intent_type: str) -> Dict[str, Any]:
        """Get requirements for a specific intent type"""
        if intent_type in self.intent_patterns:
            config = self.intent_patterns[intent_type]
            return {
                'required_entities': config['required_entities'],
                'optional_entities': config['optional_entities'],
                'sql_template': config['sql_template'],
                'description': f"Intent for {intent_type.replace('_', ' ')} queries"
            }
        
        return {
            'required_entities': [],
            'optional_entities': [],
            'sql_template': '',
            'description': 'Unknown intent type'
        }