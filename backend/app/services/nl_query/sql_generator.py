"""
BiteBase Intelligence Restaurant SQL Generator
Generates SQL queries from processed natural language queries
"""

import logging
import re
from typing import Dict, List, Optional, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.nl_query import ProcessedQuery, EntityExtraction, QueryIntent

logger = logging.getLogger(__name__)


class RestaurantSQLGenerator:
    """Generates SQL queries for restaurant analytics"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.sql_templates = self._load_sql_templates()
        self.field_mappings = self._load_field_mappings()
    
    def _load_sql_templates(self) -> Dict[str, Dict[str, str]]:
        """Load SQL templates for different intent types"""
        return {
            'revenue_analysis': {
                'base': """
                SELECT 
                    r.{location_field} as location,
                    {time_field} as time_period,
                    SUM(ra.estimated_revenue) as total_revenue,
                    COUNT(DISTINCT ra.restaurant_id) as restaurant_count
                FROM restaurants r
                JOIN restaurant_analytics ra ON r.id = ra.restaurant_id
                WHERE {conditions}
                GROUP BY r.{location_field}, {time_field}
                ORDER BY total_revenue DESC
                """,
                'simple': """
                SELECT SUM(ra.estimated_revenue) as total_revenue
                FROM restaurant_analytics ra
                JOIN restaurants r ON r.id = ra.restaurant_id
                WHERE {conditions}
                """
            },
            'menu_performance': {
                'base': """
                SELECT 
                    mi.name,
                    mi.category,
                    mi.price,
                    mi.popularity_score,
                    r.name as restaurant_name
                FROM menu_items mi
                JOIN restaurants r ON r.id = mi.restaurant_id
                WHERE {conditions}
                ORDER BY mi.popularity_score DESC
                """,
                'top_items': """
                SELECT 
                    mi.name,
                    mi.category,
                    AVG(mi.popularity_score) as avg_popularity,
                    COUNT(*) as restaurant_count
                FROM menu_items mi
                JOIN restaurants r ON r.id = mi.restaurant_id
                WHERE {conditions}
                GROUP BY mi.name, mi.category
                ORDER BY avg_popularity DESC
                LIMIT {limit}
                """
            },
            'customer_metrics': {
                'base': """
                SELECT 
                    r.{location_field} as location,
                    {time_field} as time_period,
                    SUM(ra.estimated_customers) as total_customers,
                    AVG(ra.estimated_customers) as avg_customers
                FROM restaurants r
                JOIN restaurant_analytics ra ON r.id = ra.restaurant_id
                WHERE {conditions}
                GROUP BY r.{location_field}, {time_field}
                ORDER BY total_customers DESC
                """,
                'simple': """
                SELECT SUM(ra.estimated_customers) as total_customers
                FROM restaurant_analytics ra
                JOIN restaurants r ON r.id = ra.restaurant_id
                WHERE {conditions}
                """
            },
            'location_comparison': {
                'base': """
                SELECT 
                    r.{location_field} as location,
                    SUM(ra.estimated_revenue) as total_revenue,
                    SUM(ra.estimated_customers) as total_customers,
                    AVG(ra.average_order_value) as avg_order_value,
                    AVG(r.average_rating) as avg_rating
                FROM restaurants r
                JOIN restaurant_analytics ra ON r.id = ra.restaurant_id
                WHERE {conditions}
                GROUP BY r.{location_field}
                ORDER BY total_revenue DESC
                """
            },
            'trend_analysis': {
                'base': """
                SELECT 
                    {time_field} as time_period,
                    SUM(ra.{metric_field}) as total_value,
                    AVG(ra.{metric_field}) as avg_value,
                    COUNT(DISTINCT ra.restaurant_id) as restaurant_count
                FROM restaurant_analytics ra
                JOIN restaurants r ON r.id = ra.restaurant_id
                WHERE {conditions}
                GROUP BY {time_field}
                ORDER BY {time_field}
                """
            }
        }
    
    def _load_field_mappings(self) -> Dict[str, Dict[str, str]]:
        """Load field mappings for different entity types"""
        return {
            'location_fields': {
                'city': 'city',
                'area': 'area',
                'location': 'city',
                'branch': 'name',
                'store': 'name',
                'restaurant': 'name'
            },
            'time_fields': {
                'daily': 'DATE(ra.date)',
                'weekly': 'DATE_TRUNC(\'week\', ra.date)',
                'monthly': 'DATE_TRUNC(\'month\', ra.date)',
                'quarterly': 'DATE_TRUNC(\'quarter\', ra.date)',
                'yearly': 'DATE_TRUNC(\'year\', ra.date)'
            },
            'metric_fields': {
                'revenue': 'estimated_revenue',
                'sales': 'estimated_revenue',
                'income': 'estimated_revenue',
                'customers': 'estimated_customers',
                'visitors': 'estimated_customers',
                'orders': 'online_orders',
                'rating': 'average_rating_period',
                'aov': 'average_order_value',
                'average_order_value': 'average_order_value'
            }
        }
    
    async def generate_sql(self, processed_query: ProcessedQuery) -> Dict[str, Any]:
        """Generate SQL query from processed natural language query"""
        try:
            intent = processed_query.intent
            entities = processed_query.entities
            context = processed_query.context
            
            # Get appropriate SQL template
            template_info = self._get_sql_template(intent.intent_type, entities)
            
            if not template_info:
                return {
                    'sql': '',
                    'errors': [f'No SQL template found for intent: {intent.intent_type}'],
                    'suggestions': ['Try rephrasing your query with more specific terms']
                }
            
            # Build SQL components
            sql_components = self._build_sql_components(entities, context, intent)
            
            # Generate final SQL
            final_sql = self._assemble_sql(template_info, sql_components)
            
            # Validate SQL
            validation_result = self._validate_sql(final_sql)
            
            if not validation_result['valid']:
                return {
                    'sql': final_sql,
                    'errors': validation_result['errors'],
                    'suggestions': validation_result['suggestions']
                }
            
            return {
                'sql': final_sql,
                'errors': [],
                'suggestions': [],
                'template_used': template_info['name'],
                'components': sql_components
            }
            
        except Exception as e:
            logger.error(f"SQL generation error: {str(e)}")
            return {
                'sql': '',
                'errors': [f'SQL generation failed: {str(e)}'],
                'suggestions': ['Please try rephrasing your query']
            }
    
    def _get_sql_template(self, intent_type: str, entities: List[EntityExtraction]) -> Optional[Dict[str, Any]]:
        """Get appropriate SQL template based on intent and entities"""
        if intent_type not in self.sql_templates:
            return None
        
        templates = self.sql_templates[intent_type]
        
        # Determine which template variant to use
        has_comparison = any(e.entity_type == 'comparison' for e in entities)
        has_time = any(e.entity_type == 'time_period' for e in entities)
        has_location = any(e.entity_type == 'location' for e in entities)
        
        # Select template based on complexity
        if intent_type == 'menu_performance' and has_comparison:
            template_name = 'top_items'
        elif not has_time and not has_location:
            template_name = 'simple'
        else:
            template_name = 'base'
        
        if template_name in templates:
            return {
                'name': template_name,
                'sql': templates[template_name],
                'intent_type': intent_type
            }
        
        # Fallback to base template
        return {
            'name': 'base',
            'sql': templates.get('base', templates[list(templates.keys())[0]]),
            'intent_type': intent_type
        }
    
    def _build_sql_components(self, entities: List[EntityExtraction], 
                             context: Dict[str, Any], intent: QueryIntent) -> Dict[str, str]:
        """Build SQL components from entities and context"""
        components = {
            'location_field': 'city',  # default
            'time_field': 'ra.date',   # default
            'metric_field': 'estimated_revenue',  # default
            'conditions': '1=1',       # default (always true)
            'limit': '10'              # default
        }
        
        conditions = []
        
        # Process entities
        for entity in entities:
            if entity.entity_type == 'location':
                components['location_field'] = self._map_location_field(entity.entity_value)
                location_condition = self._build_location_condition(entity.entity_value, context)
                if location_condition:
                    conditions.append(location_condition)
            
            elif entity.entity_type == 'time_period':
                components['time_field'] = self._map_time_field(entity.entity_value)
                time_condition = self._build_time_condition(entity.entity_value)
                if time_condition:
                    conditions.append(time_condition)
            
            elif entity.entity_type == 'metric':
                components['metric_field'] = self._map_metric_field(entity.entity_value)
            
            elif entity.entity_type == 'comparison':
                limit_value = self._extract_limit_from_comparison(entity.entity_value)
                if limit_value:
                    components['limit'] = str(limit_value)
        
        # Add default conditions
        conditions.append('r.is_active = true')
        
        # Add user context conditions
        if 'accessible_restaurants' in context:
            restaurant_ids = [r['id'] for r in context['accessible_restaurants']]
            if restaurant_ids:
                ids_str = "', '".join(restaurant_ids)
                conditions.append(f"r.id IN ('{ids_str}')")
        
        components['conditions'] = ' AND '.join(conditions)
        
        return components
    
    def _map_location_field(self, location_value: str) -> str:
        """Map location entity to database field"""
        location_lower = location_value.lower()
        
        for key, field in self.field_mappings['location_fields'].items():
            if key in location_lower:
                return field
        
        return 'city'  # default
    
    def _map_time_field(self, time_value: str) -> str:
        """Map time entity to SQL time field"""
        time_lower = time_value.lower()
        
        # Determine granularity
        if any(word in time_lower for word in ['daily', 'day', 'date']):
            return self.field_mappings['time_fields']['daily']
        elif any(word in time_lower for word in ['weekly', 'week']):
            return self.field_mappings['time_fields']['weekly']
        elif any(word in time_lower for word in ['monthly', 'month']):
            return self.field_mappings['time_fields']['monthly']
        elif any(word in time_lower for word in ['quarterly', 'quarter', 'q1', 'q2', 'q3', 'q4']):
            return self.field_mappings['time_fields']['quarterly']
        elif any(word in time_lower for word in ['yearly', 'year']):
            return self.field_mappings['time_fields']['yearly']
        
        return 'ra.date'  # default
    
    def _map_metric_field(self, metric_value: str) -> str:
        """Map metric entity to database field"""
        metric_lower = metric_value.lower()
        
        for key, field in self.field_mappings['metric_fields'].items():
            if key in metric_lower:
                return field
        
        return 'estimated_revenue'  # default
    
    def _build_location_condition(self, location_value: str, context: Dict[str, Any]) -> Optional[str]:
        """Build WHERE condition for location"""
        location_lower = location_value.lower()
        
        if location_lower in ['all locations', 'all branches', 'all stores']:
            return None  # No additional condition needed
        
        # Check if it's a specific location from context
        available_locations = context.get('available_locations', [])
        for loc in available_locations:
            if location_lower == loc.lower():
                return f"(r.city = '{loc}' OR r.area = '{loc}')"
        
        # Generic location condition
        return f"(r.city ILIKE '%{location_value}%' OR r.area ILIKE '%{location_value}%')"
    
    def _build_time_condition(self, time_value: str) -> Optional[str]:
        """Build WHERE condition for time period"""
        time_lower = time_value.lower()
        
        # Handle common time patterns
        if 'last week' in time_lower:
            return "ra.date >= CURRENT_DATE - INTERVAL '7 days'"
        elif 'this week' in time_lower:
            return "ra.date >= DATE_TRUNC('week', CURRENT_DATE)"
        elif 'last month' in time_lower:
            return "ra.date >= CURRENT_DATE - INTERVAL '30 days'"
        elif 'this month' in time_lower:
            return "ra.date >= DATE_TRUNC('month', CURRENT_DATE)"
        elif 'last quarter' in time_lower:
            return "ra.date >= CURRENT_DATE - INTERVAL '90 days'"
        elif 'this quarter' in time_lower:
            return "ra.date >= DATE_TRUNC('quarter', CURRENT_DATE)"
        elif 'last year' in time_lower:
            return "ra.date >= CURRENT_DATE - INTERVAL '365 days'"
        elif 'this year' in time_lower:
            return "ra.date >= DATE_TRUNC('year', CURRENT_DATE)"
        elif 'ytd' in time_lower:
            return "ra.date >= DATE_TRUNC('year', CURRENT_DATE)"
        
        # Handle quarter patterns
        quarter_match = re.search(r'q([1-4])', time_lower)
        if quarter_match:
            quarter = quarter_match.group(1)
            return f"EXTRACT(quarter FROM ra.date) = {quarter}"
        
        return None
    
    def _extract_limit_from_comparison(self, comparison_value: str) -> Optional[int]:
        """Extract limit number from comparison entity"""
        # Look for numbers in comparison phrases like "top 10", "best 5"
        number_match = re.search(r'\d+', comparison_value)
        if number_match:
            return int(number_match.group())
        
        return None
    
    def _assemble_sql(self, template_info: Dict[str, Any], components: Dict[str, str]) -> str:
        """Assemble final SQL from template and components"""
        sql_template = template_info['sql']
        
        # Replace placeholders with actual values
        final_sql = sql_template.format(**components)
        
        # Clean up SQL formatting
        final_sql = re.sub(r'\s+', ' ', final_sql.strip())
        final_sql = final_sql.replace('\n', ' ')
        
        return final_sql
    
    def _validate_sql(self, sql: str) -> Dict[str, Any]:
        """Validate generated SQL"""
        errors = []
        suggestions = []
        
        # Basic SQL validation
        if not sql.strip():
            errors.append("Generated SQL is empty")
            suggestions.append("Try providing more specific query terms")
            return {'valid': False, 'errors': errors, 'suggestions': suggestions}
        
        # Check for required keywords
        sql_upper = sql.upper()
        if 'SELECT' not in sql_upper:
            errors.append("SQL missing SELECT statement")
        
        if 'FROM' not in sql_upper:
            errors.append("SQL missing FROM clause")
        
        # Check for potential SQL injection patterns
        dangerous_patterns = [';--', 'DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE']
        for pattern in dangerous_patterns:
            if pattern in sql_upper:
                errors.append(f"SQL contains potentially dangerous pattern: {pattern}")
        
        # Check for balanced parentheses
        if sql.count('(') != sql.count(')'):
            errors.append("SQL has unbalanced parentheses")
        
        if errors:
            suggestions.append("Please try rephrasing your query")
            suggestions.append("Make sure your query is asking for data analysis, not data modification")
        
        return {
            'valid': len(errors) == 0,
            'errors': errors,
            'suggestions': suggestions
        }