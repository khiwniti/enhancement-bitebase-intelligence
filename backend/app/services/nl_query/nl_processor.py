"""
BiteBase Intelligence Natural Language Processor
Main orchestrator for NL query processing
"""

import asyncio
import hashlib
import json
import logging
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.nl_query import NLQueryHistory, NLQueryCache, QueryPattern
from app.schemas.nl_query import (
    NLQueryRequest, NLQueryResponse, ProcessedQuery, ConfidenceScore,
    QueryResult, ChartSuggestion, RestaurantQueryContext
)
from app.services.dashboard.visualization_engine import VisualizationEngine
from .intent_classifier import RestaurantIntentClassifier
from .entity_extractor import RestaurantEntityExtractor
from .context_manager import RestaurantContextManager
from .sql_generator import RestaurantSQLGenerator
from .confidence_scorer import ConfidenceScorer
from .thai_language_processor import ThaiLanguageProcessor, ThaiQueryContext

logger = logging.getLogger(__name__)


class NLProcessor:
    """Main Natural Language Processing orchestrator"""
    
    def __init__(self, db: AsyncSession, anthropic_client=None):
        self.db = db
        self.anthropic_client = anthropic_client
        
        # Initialize sub-components
        self.intent_classifier = RestaurantIntentClassifier(anthropic_client)
        self.entity_extractor = RestaurantEntityExtractor()
        self.context_manager = RestaurantContextManager(db)
        self.sql_generator = RestaurantSQLGenerator(db)
        self.confidence_scorer = ConfidenceScorer()
        self.visualization_engine = VisualizationEngine(db)
        self.thai_processor = ThaiLanguageProcessor()
        
        # Performance tracking
        self.processing_stats = {
            'total_queries': 0,
            'cache_hits': 0,
            'avg_processing_time': 0.0
        }
    
    async def process_query(self, request: NLQueryRequest, user_id: str) -> NLQueryResponse:
        """
        Main entry point for processing natural language queries
        Target: <0.5s processing time
        """
        start_time = datetime.utcnow()
        query_id = str(uuid.uuid4())
        
        try:
            # Step 1: Check cache first for performance
            cache_result = await self._check_cache(request.query, request.dashboard_id)
            if cache_result:
                logger.info(f"Cache hit for query: {request.query[:50]}...")
                self.processing_stats['cache_hits'] += 1
                return await self._build_response_from_cache(cache_result, query_id, start_time)
            
            # Step 2: Detect language and process Thai queries
            language = self.thai_processor.detect_language(request.query)
            thai_context = None
            
            if language == "thai":
                thai_context = self.thai_processor.process_thai_query(request.query)
                logger.info(f"Thai query detected: {request.query[:50]}...")
            
            # Step 3: Load user context
            context = await self.context_manager.get_user_context(
                user_id, request.dashboard_id, request.user_context
            )
            
            # Add Thai context to user context if detected
            if thai_context:
                context['thai_context'] = thai_context
                context['language'] = 'thai'
            
            # Step 4: Parallel processing for performance
            intent_task = asyncio.create_task(
                self.intent_classifier.classify_intent(request.query, context)
            )
            entities_task = asyncio.create_task(
                self.entity_extractor.extract_entities(request.query, context)
            )
            
            # Wait for parallel tasks
            intent, entities = await asyncio.gather(intent_task, entities_task)
            
            # If Thai query, use Thai-specific intent and entities
            if thai_context:
                intent = thai_context.intent
                # Merge Thai entities with extracted entities
                for entity in thai_context.entities:
                    entities[entity] = thai_context.entities[entity]
            
            # Step 5: Create processed query
            processed_query = ProcessedQuery(
                original_query=request.query,
                normalized_query=self._normalize_query(request.query),
                intent=intent,
                entities=entities,
                context=context
            )
            
            # Step 6: Generate SQL
            sql_result = await self.sql_generator.generate_sql(processed_query)
            
            # Step 7: Calculate confidence score
            confidence = await self.confidence_scorer.calculate_confidence(
                processed_query, sql_result, context
            )
            
            # Step 8: Execute query if confidence is sufficient or auto_execute is True
            result = None
            if confidence.overall_confidence >= 0.7 or request.auto_execute:
                result = await self._execute_query(sql_result['sql'], processed_query)
            
            # Step 9: Generate chart suggestions
            chart_suggestions = []
            if result:
                chart_suggestions = await self._generate_chart_suggestions(result, processed_query)
            
            # Step 10: Cache successful results
            if confidence.overall_confidence >= 0.8:
                await self._cache_result(request.query, processed_query, sql_result, chart_suggestions)
            
            # Step 11: Log query for analytics
            await self._log_query(query_id, user_id, request, processed_query, sql_result, confidence, result)
            
            # Step 12: Generate Thai response if Thai query
            thai_response = None
            if thai_context and result:
                thai_response = self.thai_processor.generate_thai_response(thai_context, result.data)
            
            # Step 13: Build response
            processing_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            
            response = NLQueryResponse(
                query_id=uuid.UUID(query_id),
                processed_query=processed_query,
                generated_sql=sql_result['sql'],
                confidence=confidence,
                result=result,
                suggestions=sql_result.get('suggestions', []),
                errors=sql_result.get('errors', []),
                processing_time_ms=processing_time,
                success=len(sql_result.get('errors', [])) == 0
            )
            
            # Add Thai response if available
            if thai_response:
                response.thai_response = thai_response
            
            # Update stats
            self.processing_stats['total_queries'] += 1
            self._update_processing_stats(processing_time)
            
            return response
            
        except Exception as e:
            logger.error(f"Error processing NL query: {str(e)}")
            processing_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            
            # Return error response
            return NLQueryResponse(
                query_id=uuid.UUID(query_id),
                processed_query=ProcessedQuery(
                    original_query=request.query,
                    normalized_query=request.query,
                    intent=None,
                    entities=[],
                    context={}
                ),
                generated_sql="",
                confidence=ConfidenceScore(
                    overall_confidence=0.0,
                    intent_confidence=0.0,
                    entity_confidence=0.0,
                    sql_confidence=0.0,
                    data_availability=0.0,
                    historical_success=0.0
                ),
                result=None,
                suggestions=[],
                errors=[f"Processing error: {str(e)}"],
                processing_time_ms=processing_time,
                success=False
            )
    
    async def _build_response_from_cache(self, cache_result: Dict[str, Any], query_id: str, start_time: datetime) -> NLQueryResponse:
        """Build response from cached results"""
        processing_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        
        processed_query = ProcessedQuery(**cache_result['processed_query'])
        
        return NLQueryResponse(
            query_id=uuid.UUID(query_id),
            processed_query=processed_query,
            generated_sql=cache_result['generated_sql'],
            confidence=ConfidenceScore(
                overall_confidence=0.9,  # High confidence for cached results
                intent_confidence=0.9,
                entity_confidence=0.9,
                sql_confidence=0.9,
                data_availability=0.9,
                historical_success=0.9
            ),
            result=None,  # Could cache result data too if needed
            suggestions=[],
            errors=[],
            processing_time_ms=processing_time,
            success=True
        )
    
    async def _check_cache(self, query: str, dashboard_id: Optional[str]) -> Optional[Dict[str, Any]]:
        """Check if query result is cached"""
        try:
            cache_key = self._generate_cache_key(query, dashboard_id)
            
            cache_query = select(NLQueryCache).where(
                NLQueryCache.cache_key == cache_key,
                NLQueryCache.expires_at > datetime.utcnow()
            )
            
            result = await self.db.execute(cache_query)
            cache_entry = result.scalar_one_or_none()
            
            if cache_entry:
                # Update hit count
                cache_entry.hit_count += 1
                cache_entry.last_accessed = datetime.utcnow()
                await self.db.commit()
                
                return {
                    'processed_query': cache_entry.processed_query,
                    'generated_sql': cache_entry.generated_sql,
                    'chart_suggestion': cache_entry.chart_suggestion
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Cache check error: {str(e)}")
            return None
    
    async def _execute_query(self, sql: str, processed_query: ProcessedQuery) -> Optional[QueryResult]:
        """Execute the generated SQL query"""
        try:
            start_time = datetime.utcnow()
            
            # Execute SQL query
            result = await self.db.execute(sql)
            rows = result.fetchall()
            columns = list(result.keys()) if rows else []
            
            execution_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            
            # Convert rows to list of dictionaries
            data = [dict(row) for row in rows]
            
            # Generate chart suggestions based on data
            chart_suggestions = await self._generate_chart_suggestions_from_data(data, processed_query)
            
            return QueryResult(
                data=data,
                columns=columns,
                row_count=len(data),
                execution_time_ms=execution_time,
                chart_suggestions=chart_suggestions
            )
            
        except Exception as e:
            logger.error(f"Query execution error: {str(e)}")
            return None
    
    async def _generate_chart_suggestions_from_data(self, data: List[Dict[str, Any]], processed_query: ProcessedQuery) -> List[ChartSuggestion]:
        """Generate chart type suggestions based on query results"""
        try:
            if not data:
                return []
            
            # Use existing visualization engine for chart suggestions
            suggestions = self.visualization_engine.suggest_chart_types(data)
            
            chart_suggestions = []
            for suggestion in suggestions:
                chart_suggestions.append(ChartSuggestion(
                    chart_type=suggestion['chart_type'],
                    confidence=suggestion['confidence'],
                    reasoning=suggestion['reason'],
                    config=suggestion.get('config', {})
                ))
            
            return chart_suggestions
            
        except Exception as e:
            logger.error(f"Chart suggestion error: {str(e)}")
            return []
    
    async def _cache_result(self, query: str, processed_query: ProcessedQuery, sql_result: Dict[str, Any], chart_suggestions: List[ChartSuggestion]):
        """Cache successful query results"""
        try:
            cache_key = self._generate_cache_key(query, None)
            query_hash = hashlib.sha256(query.encode()).hexdigest()
            
            cache_entry = NLQueryCache(
                cache_key=cache_key,
                query_hash=query_hash,
                processed_query=processed_query.dict(),
                generated_sql=sql_result['sql'],
                chart_suggestion=[cs.dict() for cs in chart_suggestions],
                expires_at=datetime.utcnow() + timedelta(hours=24)  # Cache for 24 hours
            )
            
            self.db.add(cache_entry)
            await self.db.commit()
            
        except Exception as e:
            logger.error(f"Cache storage error: {str(e)}")
    
    async def _log_query(self, query_id: str, user_id: str, request: NLQueryRequest, 
                        processed_query: ProcessedQuery, sql_result: Dict[str, Any], 
                        confidence: ConfidenceScore, result: Optional[QueryResult]):
        """Log query for analytics and learning"""
        try:
            processing_time = sql_result.get('processing_time_ms', 0)
            execution_time = result.execution_time_ms if result else 0
            
            history_entry = NLQueryHistory(
                id=query_id,
                user_id=user_id,
                dashboard_id=str(request.dashboard_id) if request.dashboard_id else None,
                original_query=request.query,
                processed_query=processed_query.dict(),
                generated_sql=sql_result['sql'],
                confidence_score=confidence.overall_confidence,
                execution_time_ms=execution_time,
                processing_time_ms=processing_time,
                result_count=result.row_count if result else 0,
                chart_type=result.chart_suggestions[0].chart_type if result and result.chart_suggestions else None,
                chart_config=result.chart_suggestions[0].config if result and result.chart_suggestions else None,
                success=len(sql_result.get('errors', [])) == 0,
                error_message='; '.join(sql_result.get('errors', []))
            )
            
            self.db.add(history_entry)
            await self.db.commit()
            
        except Exception as e:
            logger.error(f"Query logging error: {str(e)}")
    
    def _normalize_query(self, query: str) -> str:
        """Normalize query text for processing"""
        # Basic normalization - can be enhanced
        return query.lower().strip()
    
    def _generate_cache_key(self, query: str, dashboard_id: Optional[str]) -> str:
        """Generate cache key for query"""
        key_data = f"{query}:{dashboard_id or 'global'}"
        return hashlib.md5(key_data.encode()).hexdigest()
    
    def _update_processing_stats(self, processing_time: int):
        """Update processing statistics"""
        total = self.processing_stats['total_queries']
        current_avg = self.processing_stats['avg_processing_time']
        
        # Calculate new average
        new_avg = ((current_avg * (total - 1)) + processing_time) / total
        self.processing_stats['avg_processing_time'] = new_avg
    
    async def get_query_suggestions(self, partial_query: str, context: Optional[Dict[str, Any]] = None) -> List[str]:
        """Get query suggestions for auto-complete"""
        try:
            # Get suggestions from patterns and history
            suggestions = await self.intent_classifier.get_query_suggestions(partial_query, context)
            return suggestions
            
        except Exception as e:
            logger.error(f"Query suggestions error: {str(e)}")
            return []
    
    async def get_processing_stats(self) -> Dict[str, Any]:
        """Get processing statistics"""
        return {
            **self.processing_stats,
            'cache_hit_rate': self.processing_stats['cache_hits'] / max(self.processing_stats['total_queries'], 1)
        }