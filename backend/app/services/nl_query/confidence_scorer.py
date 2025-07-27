"""
BiteBase Intelligence Confidence Scorer
Calculates confidence scores for natural language query processing
"""

import logging
from typing import Dict, List, Optional, Any
from datetime import datetime

from app.schemas.nl_query import ProcessedQuery, ConfidenceScore, EntityExtraction, QueryIntent

logger = logging.getLogger(__name__)


class ConfidenceScorer:
    """Calculates confidence scores for NL query processing"""
    
    def __init__(self):
        self.confidence_weights = self._load_confidence_weights()
        self.historical_success_rates = self._load_historical_success_rates()
    
    def _load_confidence_weights(self) -> Dict[str, float]:
        """Load confidence calculation weights"""
        return {
            'intent_confidence': 0.25,      # 25% weight for intent classification
            'entity_confidence': 0.20,      # 20% weight for entity extraction
            'sql_confidence': 0.25,         # 25% weight for SQL generation
            'data_availability': 0.20,      # 20% weight for data availability
            'historical_success': 0.10      # 10% weight for historical success
        }
    
    def _load_historical_success_rates(self) -> Dict[str, float]:
        """Load historical success rates by intent type"""
        return {
            'revenue_analysis': 0.92,
            'menu_performance': 0.88,
            'customer_metrics': 0.90,
            'location_comparison': 0.85,
            'trend_analysis': 0.87,
            'unknown': 0.50
        }
    
    async def calculate_confidence(self, processed_query: ProcessedQuery, 
                                 sql_result: Dict[str, Any], 
                                 context: Dict[str, Any]) -> ConfidenceScore:
        """Calculate overall confidence score for the processed query"""
        try:
            # Calculate individual confidence components
            intent_confidence = self._calculate_intent_confidence(processed_query.intent)
            entity_confidence = self._calculate_entity_confidence(processed_query.entities)
            sql_confidence = self._calculate_sql_confidence(sql_result)
            data_availability = self._calculate_data_availability(processed_query, context)
            historical_success = self._calculate_historical_success(processed_query.intent.intent_type)
            
            # Calculate weighted overall confidence
            overall_confidence = (
                intent_confidence * self.confidence_weights['intent_confidence'] +
                entity_confidence * self.confidence_weights['entity_confidence'] +
                sql_confidence * self.confidence_weights['sql_confidence'] +
                data_availability * self.confidence_weights['data_availability'] +
                historical_success * self.confidence_weights['historical_success']
            )
            
            # Apply confidence adjustments
            overall_confidence = self._apply_confidence_adjustments(
                overall_confidence, processed_query, sql_result, context
            )
            
            # Ensure confidence is within bounds
            overall_confidence = max(0.0, min(1.0, overall_confidence))
            
            return ConfidenceScore(
                overall_confidence=overall_confidence,
                intent_confidence=intent_confidence,
                entity_confidence=entity_confidence,
                sql_confidence=sql_confidence,
                data_availability=data_availability,
                historical_success=historical_success
            )
            
        except Exception as e:
            logger.error(f"Confidence calculation error: {str(e)}")
            return ConfidenceScore(
                overall_confidence=0.0,
                intent_confidence=0.0,
                entity_confidence=0.0,
                sql_confidence=0.0,
                data_availability=0.0,
                historical_success=0.0
            )
    
    def _calculate_intent_confidence(self, intent: QueryIntent) -> float:
        """Calculate confidence score for intent classification"""
        base_confidence = intent.confidence
        
        # Boost confidence for well-defined intents
        if intent.intent_type in ['revenue_analysis', 'menu_performance', 'customer_metrics']:
            base_confidence += 0.05
        
        # Reduce confidence for unknown intents
        if intent.intent_type == 'unknown':
            base_confidence = max(0.0, base_confidence - 0.2)
        
        # Boost confidence if sub-intents are present
        if intent.sub_intents and len(intent.sub_intents) > 0:
            base_confidence += 0.03
        
        return max(0.0, min(1.0, base_confidence))
    
    def _calculate_entity_confidence(self, entities: List[EntityExtraction]) -> float:
        """Calculate confidence score for entity extraction"""
        if not entities:
            return 0.3  # Low confidence if no entities found
        
        # Calculate average entity confidence
        total_confidence = sum(entity.confidence for entity in entities)
        avg_confidence = total_confidence / len(entities)
        
        # Boost confidence based on entity diversity
        entity_types = set(entity.entity_type for entity in entities)
        diversity_boost = min(0.1, len(entity_types) * 0.02)
        
        # Boost confidence for high-value entities
        high_value_entities = ['time_period', 'location', 'metric']
        high_value_count = sum(1 for entity in entities if entity.entity_type in high_value_entities)
        high_value_boost = min(0.1, high_value_count * 0.03)
        
        final_confidence = avg_confidence + diversity_boost + high_value_boost
        
        return max(0.0, min(1.0, final_confidence))
    
    def _calculate_sql_confidence(self, sql_result: Dict[str, Any]) -> float:
        """Calculate confidence score for SQL generation"""
        base_confidence = 0.8  # Start with high confidence
        
        # Reduce confidence if there are errors
        if sql_result.get('errors'):
            error_count = len(sql_result['errors'])
            base_confidence -= min(0.5, error_count * 0.2)
        
        # Reduce confidence if SQL is empty
        if not sql_result.get('sql', '').strip():
            base_confidence = 0.0
        
        # Boost confidence if a specific template was used
        if sql_result.get('template_used'):
            base_confidence += 0.05
        
        # Boost confidence if SQL components are well-formed
        if sql_result.get('components'):
            components = sql_result['components']
            if components.get('conditions') and components['conditions'] != '1=1':
                base_confidence += 0.05
        
        return max(0.0, min(1.0, base_confidence))
    
    def _calculate_data_availability(self, processed_query: ProcessedQuery, 
                                   context: Dict[str, Any]) -> float:
        """Calculate confidence score for data availability"""
        base_confidence = 0.7  # Start with moderate confidence
        
        # Check if user has accessible restaurants
        accessible_restaurants = context.get('accessible_restaurants', [])
        if not accessible_restaurants:
            return 0.2  # Low confidence if no accessible data
        
        # Boost confidence based on number of accessible restaurants
        restaurant_count = len(accessible_restaurants)
        if restaurant_count > 10:
            base_confidence += 0.1
        elif restaurant_count > 5:
            base_confidence += 0.05
        
        # Check date range availability
        date_range = context.get('available_date_range', {})
        if date_range.get('start_date') and date_range.get('end_date'):
            base_confidence += 0.1
        
        # Check for specific entity data availability
        entities = processed_query.entities
        for entity in entities:
            if entity.entity_type == 'location':
                available_locations = context.get('available_locations', [])
                if entity.entity_value.lower() in [loc.lower() for loc in available_locations]:
                    base_confidence += 0.05
            
            elif entity.entity_type == 'menu_item':
                menu_categories = context.get('menu_categories', [])
                if menu_categories:
                    base_confidence += 0.05
        
        return max(0.0, min(1.0, base_confidence))
    
    def _calculate_historical_success(self, intent_type: str) -> float:
        """Calculate confidence based on historical success rates"""
        return self.historical_success_rates.get(intent_type, 0.5)
    
    def _apply_confidence_adjustments(self, base_confidence: float, 
                                    processed_query: ProcessedQuery,
                                    sql_result: Dict[str, Any], 
                                    context: Dict[str, Any]) -> float:
        """Apply additional confidence adjustments based on query characteristics"""
        adjusted_confidence = base_confidence
        
        # Reduce confidence for very short queries
        if len(processed_query.original_query.split()) < 3:
            adjusted_confidence -= 0.1
        
        # Reduce confidence for very long queries
        if len(processed_query.original_query.split()) > 20:
            adjusted_confidence -= 0.05
        
        # Boost confidence for queries with clear business intent
        business_keywords = ['revenue', 'sales', 'customers', 'performance', 'analysis']
        query_lower = processed_query.original_query.lower()
        business_keyword_count = sum(1 for keyword in business_keywords if keyword in query_lower)
        if business_keyword_count >= 2:
            adjusted_confidence += 0.05
        
        # Reduce confidence for ambiguous queries
        ambiguous_words = ['thing', 'stuff', 'data', 'information', 'something']
        ambiguous_count = sum(1 for word in ambiguous_words if word in query_lower)
        if ambiguous_count > 0:
            adjusted_confidence -= min(0.1, ambiguous_count * 0.03)
        
        # Boost confidence for queries with specific time periods
        specific_time_patterns = ['last week', 'this month', 'q1', 'q2', 'q3', 'q4', 'ytd']
        if any(pattern in query_lower for pattern in specific_time_patterns):
            adjusted_confidence += 0.03
        
        # Boost confidence for queries with specific metrics
        specific_metrics = ['revenue', 'customers', 'orders', 'rating', 'aov']
        metric_count = sum(1 for metric in specific_metrics if metric in query_lower)
        if metric_count > 0:
            adjusted_confidence += min(0.05, metric_count * 0.02)
        
        return adjusted_confidence
    
    def get_confidence_explanation(self, confidence_score: ConfidenceScore, 
                                 processed_query: ProcessedQuery) -> Dict[str, Any]:
        """Get detailed explanation of confidence score"""
        explanation = {
            'overall_confidence': confidence_score.overall_confidence,
            'confidence_level': self._get_confidence_level(confidence_score.overall_confidence),
            'components': {
                'intent_classification': {
                    'score': confidence_score.intent_confidence,
                    'weight': self.confidence_weights['intent_confidence'],
                    'contribution': confidence_score.intent_confidence * self.confidence_weights['intent_confidence']
                },
                'entity_extraction': {
                    'score': confidence_score.entity_confidence,
                    'weight': self.confidence_weights['entity_confidence'],
                    'contribution': confidence_score.entity_confidence * self.confidence_weights['entity_confidence']
                },
                'sql_generation': {
                    'score': confidence_score.sql_confidence,
                    'weight': self.confidence_weights['sql_confidence'],
                    'contribution': confidence_score.sql_confidence * self.confidence_weights['sql_confidence']
                },
                'data_availability': {
                    'score': confidence_score.data_availability,
                    'weight': self.confidence_weights['data_availability'],
                    'contribution': confidence_score.data_availability * self.confidence_weights['data_availability']
                },
                'historical_success': {
                    'score': confidence_score.historical_success,
                    'weight': self.confidence_weights['historical_success'],
                    'contribution': confidence_score.historical_success * self.confidence_weights['historical_success']
                }
            },
            'recommendations': self._get_confidence_recommendations(confidence_score, processed_query)
        }
        
        return explanation
    
    def _get_confidence_level(self, confidence: float) -> str:
        """Get human-readable confidence level"""
        if confidence >= 0.9:
            return 'Very High'
        elif confidence >= 0.8:
            return 'High'
        elif confidence >= 0.7:
            return 'Medium'
        elif confidence >= 0.5:
            return 'Low'
        else:
            return 'Very Low'
    
    def _get_confidence_recommendations(self, confidence_score: ConfidenceScore, 
                                      processed_query: ProcessedQuery) -> List[str]:
        """Get recommendations to improve confidence"""
        recommendations = []
        
        if confidence_score.intent_confidence < 0.7:
            recommendations.append("Try using more specific terms like 'revenue', 'customers', or 'menu performance'")
        
        if confidence_score.entity_confidence < 0.7:
            recommendations.append("Include specific time periods (e.g., 'last month') and locations")
        
        if confidence_score.sql_confidence < 0.7:
            recommendations.append("Make sure your query asks for data analysis, not data modification")
        
        if confidence_score.data_availability < 0.7:
            recommendations.append("Check that you have access to the requested data and time periods")
        
        if confidence_score.overall_confidence < 0.5:
            recommendations.append("Try rephrasing your query with more specific business terms")
            recommendations.append("Consider breaking complex queries into simpler parts")
        
        return recommendations
    
    def should_auto_execute(self, confidence_score: ConfidenceScore) -> bool:
        """Determine if query should be auto-executed based on confidence"""
        return confidence_score.overall_confidence >= 0.85
    
    def should_ask_confirmation(self, confidence_score: ConfidenceScore) -> bool:
        """Determine if user confirmation should be requested"""
        return 0.7 <= confidence_score.overall_confidence < 0.85
    
    def should_suggest_corrections(self, confidence_score: ConfidenceScore) -> bool:
        """Determine if corrections should be suggested"""
        return confidence_score.overall_confidence < 0.7