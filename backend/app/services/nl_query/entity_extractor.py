"""
BiteBase Intelligence Restaurant Entity Extractor
Extracts restaurant-specific entities from natural language queries
"""

import re
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dateutil import parser as date_parser

from app.schemas.nl_query import EntityExtraction, RestaurantEntity

logger = logging.getLogger(__name__)


class RestaurantEntityExtractor:
    """Restaurant-specific entity extraction"""
    
    def __init__(self):
        self.entity_patterns = self._load_entity_patterns()
        self.time_patterns = self._load_time_patterns()
        self.location_patterns = self._load_location_patterns()
        self.metric_patterns = self._load_metric_patterns()
    
    def _load_entity_patterns(self) -> Dict[str, List[Dict[str, Any]]]:
        """Load entity extraction patterns"""
        return {
            'time_period': [
                {'pattern': r'(?:last|past|previous)\s+(\d+)\s+(day|week|month|quarter|year)s?', 'type': 'relative_period'},
                {'pattern': r'(?:this|current)\s+(week|month|quarter|year)', 'type': 'current_period'},
                {'pattern': r'(Q[1-4]|quarter\s+[1-4])', 'type': 'quarter'},
                {'pattern': r'(january|february|march|april|may|june|july|august|september|october|november|december)', 'type': 'month'},
                {'pattern': r'(\d{4})', 'type': 'year'},
                {'pattern': r'(\d{1,2}\/\d{1,2}\/\d{4})', 'type': 'date'},
                {'pattern': r'(today|yesterday|tomorrow)', 'type': 'relative_day'},
                {'pattern': r'(ytd|year to date)', 'type': 'ytd'},
                {'pattern': r'(\d+)\s+(days?|weeks?|months?)\s+ago', 'type': 'ago_period'}
            ],
            'location': [
                {'pattern': r'(?:location|branch|store|restaurant)\s+([A-Za-z0-9\s]+)', 'type': 'named_location'},
                {'pattern': r'(?:in|at|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', 'type': 'city'},
                {'pattern': r'(all\s+(?:locations|branches|stores))', 'type': 'all_locations'},
                {'pattern': r'(downtown|uptown|central|north|south|east|west)', 'type': 'area'},
                {'pattern': r'([A-Z][a-z]+\s+(?:mall|plaza|center|district))', 'type': 'venue'}
            ],
            'metric': [
                {'pattern': r'(revenue|sales|income|earnings)', 'type': 'financial'},
                {'pattern': r'(customers?|visitors?|traffic)', 'type': 'customer'},
                {'pattern': r'(orders?|transactions?)', 'type': 'transaction'},
                {'pattern': r'(rating|reviews?|feedback)', 'type': 'rating'},
                {'pattern': r'(profit|margin|cost)', 'type': 'profitability'},
                {'pattern': r'(average\s+order\s+value|aov)', 'type': 'aov'}
            ],
            'menu_item': [
                {'pattern': r'(pizza|burger|sandwich|salad|pasta|chicken|beef|fish)', 'type': 'food_item'},
                {'pattern': r'(appetizer|main|dessert|drink|beverage)', 'type': 'menu_category'},
                {'pattern': r'(vegetarian|vegan|gluten.free)', 'type': 'dietary'},
                {'pattern': r'(spicy|mild|hot|cold)', 'type': 'preparation'}
            ],
            'comparison': [
                {'pattern': r'(top|best|highest|maximum)\s+(\d+)', 'type': 'top_n'},
                {'pattern': r'(bottom|worst|lowest|minimum)\s+(\d+)', 'type': 'bottom_n'},
                {'pattern': r'(more|less|greater|higher|lower)\s+than', 'type': 'comparative'},
                {'pattern': r'(compare|versus|vs|against)', 'type': 'comparison'},
                {'pattern': r'(rank|ranking|position)', 'type': 'ranking'}
            ]
        }
    
    def _load_time_patterns(self) -> Dict[str, str]:
        """Load time-specific patterns for normalization"""
        return {
            'last week': 'DATEADD(week, -1, CURRENT_DATE)',
            'this week': 'DATEPART(week, CURRENT_DATE)',
            'last month': 'DATEADD(month, -1, CURRENT_DATE)',
            'this month': 'DATEPART(month, CURRENT_DATE)',
            'last quarter': 'DATEADD(quarter, -1, CURRENT_DATE)',
            'this quarter': 'DATEPART(quarter, CURRENT_DATE)',
            'last year': 'DATEADD(year, -1, CURRENT_DATE)',
            'this year': 'DATEPART(year, CURRENT_DATE)',
            'ytd': 'DATEPART(year, CURRENT_DATE)',
            'today': 'CURRENT_DATE',
            'yesterday': 'DATEADD(day, -1, CURRENT_DATE)',
            'Q1': 'DATEPART(quarter, CURRENT_DATE) = 1',
            'Q2': 'DATEPART(quarter, CURRENT_DATE) = 2',
            'Q3': 'DATEPART(quarter, CURRENT_DATE) = 3',
            'Q4': 'DATEPART(quarter, CURRENT_DATE) = 4'
        }
    
    def _load_location_patterns(self) -> Dict[str, str]:
        """Load location normalization patterns"""
        return {
            'all locations': 'ALL',
            'all branches': 'ALL',
            'all stores': 'ALL',
            'downtown': 'DOWNTOWN',
            'uptown': 'UPTOWN',
            'central': 'CENTRAL',
            'north': 'NORTH',
            'south': 'SOUTH',
            'east': 'EAST',
            'west': 'WEST'
        }
    
    def _load_metric_patterns(self) -> Dict[str, str]:
        """Load metric normalization patterns"""
        return {
            'revenue': 'estimated_revenue',
            'sales': 'estimated_revenue',
            'income': 'estimated_revenue',
            'earnings': 'estimated_revenue',
            'customers': 'estimated_customers',
            'visitors': 'estimated_customers',
            'traffic': 'estimated_customers',
            'orders': 'online_orders',
            'transactions': 'online_orders',
            'rating': 'average_rating_period',
            'reviews': 'new_reviews',
            'profit': 'estimated_revenue',
            'aov': 'average_order_value',
            'average order value': 'average_order_value'
        }
    
    async def extract_entities(self, query: str, context: Dict[str, Any]) -> List[EntityExtraction]:
        """Extract entities from natural language query"""
        try:
            entities = []
            query_lower = query.lower()
            
            # Extract each entity type
            for entity_type, patterns in self.entity_patterns.items():
                type_entities = self._extract_entity_type(query, query_lower, entity_type, patterns)
                entities.extend(type_entities)
            
            # Post-process and normalize entities
            entities = self._normalize_entities(entities, context)
            
            # Remove duplicates and sort by confidence
            entities = self._deduplicate_entities(entities)
            
            return entities
            
        except Exception as e:
            logger.error(f"Entity extraction error: {str(e)}")
            return []
    
    def _extract_entity_type(self, original_query: str, query_lower: str, entity_type: str, patterns: List[Dict[str, Any]]) -> List[EntityExtraction]:
        """Extract entities of a specific type"""
        entities = []
        
        for pattern_config in patterns:
            pattern = pattern_config['pattern']
            subtype = pattern_config['type']
            
            matches = re.finditer(pattern, query_lower, re.IGNORECASE)
            
            for match in matches:
                entity_value = match.group(1) if match.groups() else match.group(0)
                
                # Calculate confidence based on pattern specificity and context
                confidence = self._calculate_entity_confidence(entity_value, entity_type, subtype, query_lower)
                
                entities.append(EntityExtraction(
                    entity_type=entity_type,
                    entity_value=entity_value.strip(),
                    confidence=confidence,
                    start_pos=match.start(),
                    end_pos=match.end()
                ))
        
        return entities
    
    def _calculate_entity_confidence(self, entity_value: str, entity_type: str, subtype: str, query: str) -> float:
        """Calculate confidence score for extracted entity"""
        base_confidence = 0.7
        
        # Boost confidence for specific patterns
        confidence_boosts = {
            'relative_period': 0.2,
            'current_period': 0.2,
            'quarter': 0.15,
            'month': 0.1,
            'financial': 0.15,
            'customer': 0.15,
            'top_n': 0.2,
            'comparison': 0.1
        }
        
        confidence = base_confidence + confidence_boosts.get(subtype, 0.0)
        
        # Reduce confidence for very short entities
        if len(entity_value) < 3:
            confidence -= 0.1
        
        # Boost confidence for entities that appear multiple times
        if query.count(entity_value.lower()) > 1:
            confidence += 0.05
        
        return min(max(confidence, 0.0), 1.0)
    
    def _normalize_entities(self, entities: List[EntityExtraction], context: Dict[str, Any]) -> List[EntityExtraction]:
        """Normalize extracted entities"""
        normalized_entities = []
        
        for entity in entities:
            normalized_entity = self._normalize_single_entity(entity, context)
            normalized_entities.append(normalized_entity)
        
        return normalized_entities
    
    def _normalize_single_entity(self, entity: EntityExtraction, context: Dict[str, Any]) -> EntityExtraction:
        """Normalize a single entity"""
        entity_value = entity.entity_value.lower().strip()
        
        # Normalize time periods
        if entity.entity_type == 'time_period':
            normalized_value = self._normalize_time_entity(entity_value)
            if normalized_value != entity_value:
                entity.entity_value = normalized_value
                entity.confidence = min(entity.confidence + 0.1, 1.0)
        
        # Normalize locations
        elif entity.entity_type == 'location':
            normalized_value = self._normalize_location_entity(entity_value, context)
            if normalized_value != entity_value:
                entity.entity_value = normalized_value
                entity.confidence = min(entity.confidence + 0.1, 1.0)
        
        # Normalize metrics
        elif entity.entity_type == 'metric':
            normalized_value = self._normalize_metric_entity(entity_value)
            if normalized_value != entity_value:
                entity.entity_value = normalized_value
                entity.confidence = min(entity.confidence + 0.1, 1.0)
        
        return entity
    
    def _normalize_time_entity(self, entity_value: str) -> str:
        """Normalize time-related entities"""
        # Direct mapping
        if entity_value in self.time_patterns:
            return self.time_patterns[entity_value]
        
        # Handle relative periods like "last 3 months"
        relative_match = re.match(r'last\s+(\d+)\s+(day|week|month|quarter|year)s?', entity_value)
        if relative_match:
            number, period = relative_match.groups()
            return f'DATEADD({period}, -{number}, CURRENT_DATE)'
        
        # Handle "X days/weeks/months ago"
        ago_match = re.match(r'(\d+)\s+(day|week|month)s?\s+ago', entity_value)
        if ago_match:
            number, period = ago_match.groups()
            return f'DATEADD({period}, -{number}, CURRENT_DATE)'
        
        # Try to parse as date
        try:
            parsed_date = date_parser.parse(entity_value)
            return parsed_date.strftime('%Y-%m-%d')
        except:
            pass
        
        return entity_value
    
    def _normalize_location_entity(self, entity_value: str, context: Dict[str, Any]) -> str:
        """Normalize location entities"""
        # Direct mapping
        if entity_value in self.location_patterns:
            return self.location_patterns[entity_value]
        
        # Check against available locations in context
        if 'available_locations' in context:
            available_locations = context['available_locations']
            
            # Exact match
            for location in available_locations:
                if entity_value.lower() == location.lower():
                    return location
            
            # Partial match
            for location in available_locations:
                if entity_value.lower() in location.lower() or location.lower() in entity_value.lower():
                    return location
        
        # Capitalize properly for city names
        if re.match(r'^[a-z\s]+$', entity_value):
            return entity_value.title()
        
        return entity_value
    
    def _normalize_metric_entity(self, entity_value: str) -> str:
        """Normalize metric entities"""
        # Direct mapping
        if entity_value in self.metric_patterns:
            return self.metric_patterns[entity_value]
        
        # Handle compound metrics
        if 'average order value' in entity_value or 'aov' in entity_value:
            return 'average_order_value'
        
        return entity_value
    
    def _deduplicate_entities(self, entities: List[EntityExtraction]) -> List[EntityExtraction]:
        """Remove duplicate entities and sort by confidence"""
        # Group by entity type and value
        entity_groups = {}
        
        for entity in entities:
            key = f"{entity.entity_type}:{entity.entity_value.lower()}"
            
            if key not in entity_groups:
                entity_groups[key] = []
            
            entity_groups[key].append(entity)
        
        # Keep the highest confidence entity from each group
        deduplicated = []
        for group in entity_groups.values():
            best_entity = max(group, key=lambda e: e.confidence)
            deduplicated.append(best_entity)
        
        # Sort by confidence descending
        return sorted(deduplicated, key=lambda e: e.confidence, reverse=True)
    
    def get_entity_suggestions(self, entity_type: str, context: Dict[str, Any]) -> List[str]:
        """Get entity suggestions for auto-complete"""
        suggestions = []
        
        if entity_type == 'time_period':
            suggestions = [
                'last week', 'this week', 'last month', 'this month',
                'last quarter', 'this quarter', 'last year', 'this year',
                'Q1', 'Q2', 'Q3', 'Q4', 'YTD'
            ]
        
        elif entity_type == 'location':
            suggestions = ['all locations', 'downtown', 'uptown', 'central']
            if 'available_locations' in context:
                suggestions.extend(context['available_locations'][:10])
        
        elif entity_type == 'metric':
            suggestions = [
                'revenue', 'sales', 'customers', 'visitors', 'orders',
                'rating', 'reviews', 'profit', 'average order value'
            ]
        
        elif entity_type == 'comparison':
            suggestions = [
                'top 5', 'top 10', 'best', 'worst', 'highest', 'lowest',
                'compare', 'versus', 'ranking'
            ]
        
        return suggestions