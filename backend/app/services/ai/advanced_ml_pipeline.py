"""
BiteBase Intelligence Advanced AI/ML Pipeline
Enhanced AI capabilities with advanced forecasting, anomaly detection, and predictive analytics
"""

import asyncio
import logging
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from uuid import UUID
import joblib
import json
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.model_selection import train_test_split
import warnings
warnings.filterwarnings('ignore')

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from app.core.database import get_db
from app.models.restaurant import Restaurant
from app.models.analytics import AnalyticsEvent

logger = logging.getLogger(__name__)

class MLModelManager:
    """Manages machine learning models for the AI pipeline"""
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.model_metadata = {}
        self.is_initialized = False
    
    async def initialize_models(self):
        """Initialize and load ML models"""
        try:
            # Revenue Forecasting Model
            self.models['revenue_forecaster'] = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
            
            # Customer Behavior Clustering
            self.models['customer_segmenter'] = KMeans(
                n_clusters=5,
                random_state=42,
                n_init=10
            )
            
            # Demand Prediction Model
            self.models['demand_predictor'] = RandomForestRegressor(
                n_estimators=150,
                max_depth=12,
                random_state=42
            )
            
            # Anomaly Detection Model
            self.models['anomaly_detector'] = IsolationForest(
                contamination=0.1,
                random_state=42,
                n_estimators=100
            )
            
            # Price Optimization Model
            self.models['price_optimizer'] = RandomForestRegressor(
                n_estimators=80,
                max_depth=8,
                random_state=42
            )
            
            # Initialize scalers
            self.scalers['revenue'] = StandardScaler()
            self.scalers['customer'] = StandardScaler()
            self.scalers['demand'] = MinMaxScaler()
            self.scalers['price'] = StandardScaler()
            
            self.is_initialized = True
            logger.info("ML models initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing ML models: {e}")
            raise
    
    def get_model(self, model_name: str):
        """Get a specific model"""
        if not self.is_initialized:
            raise ValueError("Models not initialized. Call initialize_models() first.")
        return self.models.get(model_name)
    
    def get_scaler(self, scaler_name: str):
        """Get a specific scaler"""
        if not self.is_initialized:
            raise ValueError("Models not initialized. Call initialize_models() first.")
        return self.scalers.get(scaler_name)

class AdvancedForecastingEngine:
    """Advanced forecasting engine with multiple algorithms"""
    
    def __init__(self, model_manager: MLModelManager):
        self.model_manager = model_manager
        self.forecast_cache = {}
    
    async def generate_revenue_forecast(
        self, 
        restaurant_id: UUID, 
        historical_data: pd.DataFrame,
        forecast_days: int = 30
    ) -> Dict[str, Any]:
        """Generate advanced revenue forecast"""
        try:
            if len(historical_data) < 14:
                return self._generate_simple_forecast(historical_data, forecast_days)
            
            # Prepare features
            features = self._prepare_revenue_features(historical_data)
            
            # Train model if needed
            model = self.model_manager.get_model('revenue_forecaster')
            scaler = self.model_manager.get_scaler('revenue')
            
            if len(features) > 30:  # Enough data for training
                X, y = self._prepare_training_data(features, 'revenue')
                X_scaled = scaler.fit_transform(X)
                model.fit(X_scaled, y)
            
            # Generate forecast
            forecast_data = self._generate_forecast_features(features, forecast_days)
            forecast_scaled = scaler.transform(forecast_data)
            predictions = model.predict(forecast_scaled)
            
            # Calculate confidence intervals
            confidence_intervals = self._calculate_confidence_intervals(
                historical_data['revenue'].values, predictions
            )
            
            # Detect seasonality and trends
            seasonality = self._detect_seasonality(historical_data['revenue'])
            trend = self._detect_trend(historical_data['revenue'])
            
            return {
                'forecast_type': 'advanced_ml',
                'predictions': predictions.tolist(),
                'confidence_intervals': confidence_intervals,
                'seasonality': seasonality,
                'trend': trend,
                'model_accuracy': self._calculate_model_accuracy(model, X_scaled, y) if len(features) > 30 else None,
                'forecast_period_days': forecast_days,
                'generated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in revenue forecasting: {e}")
            return self._generate_simple_forecast(historical_data, forecast_days)
    
    async def generate_demand_forecast(
        self,
        restaurant_id: UUID,
        menu_item_data: pd.DataFrame,
        forecast_days: int = 14
    ) -> Dict[str, Any]:
        """Generate demand forecast for menu items"""
        try:
            model = self.model_manager.get_model('demand_predictor')
            scaler = self.model_manager.get_scaler('demand')
            
            # Prepare features for demand prediction
            features = self._prepare_demand_features(menu_item_data)
            
            if len(features) > 20:
                X, y = self._prepare_training_data(features, 'demand')
                X_scaled = scaler.fit_transform(X)
                model.fit(X_scaled, y)
                
                # Generate demand forecast
                forecast_features = self._generate_demand_forecast_features(features, forecast_days)
                forecast_scaled = scaler.transform(forecast_features)
                demand_predictions = model.predict(forecast_scaled)
                
                return {
                    'demand_forecast': demand_predictions.tolist(),
                    'peak_demand_days': self._identify_peak_demand_days(demand_predictions),
                    'inventory_recommendations': self._generate_inventory_recommendations(demand_predictions),
                    'forecast_accuracy': self._calculate_model_accuracy(model, X_scaled, y),
                    'generated_at': datetime.utcnow().isoformat()
                }
            else:
                return self._generate_simple_demand_forecast(menu_item_data, forecast_days)
                
        except Exception as e:
            logger.error(f"Error in demand forecasting: {e}")
            return self._generate_simple_demand_forecast(menu_item_data, forecast_days)
    
    def _prepare_revenue_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """Prepare features for revenue forecasting"""
        features = data.copy()
        
        # Time-based features
        features['day_of_week'] = pd.to_datetime(features['date']).dt.dayofweek
        features['month'] = pd.to_datetime(features['date']).dt.month
        features['day_of_month'] = pd.to_datetime(features['date']).dt.day
        
        # Rolling averages
        features['revenue_7d_avg'] = features['revenue'].rolling(window=7, min_periods=1).mean()
        features['revenue_14d_avg'] = features['revenue'].rolling(window=14, min_periods=1).mean()
        
        # Lag features
        features['revenue_lag_1'] = features['revenue'].shift(1)
        features['revenue_lag_7'] = features['revenue'].shift(7)
        
        # Growth rates
        features['revenue_growth_1d'] = features['revenue'].pct_change(1)
        features['revenue_growth_7d'] = features['revenue'].pct_change(7)
        
        return features.fillna(method='ffill').fillna(0)
    
    def _prepare_demand_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """Prepare features for demand forecasting"""
        features = data.copy()
        
        # Time-based features
        features['day_of_week'] = pd.to_datetime(features['date']).dt.dayofweek
        features['is_weekend'] = features['day_of_week'].isin([5, 6]).astype(int)
        
        # Item-specific features
        if 'price' in features.columns:
            features['price_change'] = features['price'].pct_change()
        
        # Rolling demand averages
        features['demand_7d_avg'] = features['quantity'].rolling(window=7, min_periods=1).mean()
        features['demand_14d_avg'] = features['quantity'].rolling(window=14, min_periods=1).mean()
        
        return features.fillna(method='ffill').fillna(0)
    
    def _prepare_training_data(self, features: pd.DataFrame, target_type: str) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare training data for ML models"""
        if target_type == 'revenue':
            target_col = 'revenue'
            feature_cols = ['day_of_week', 'month', 'day_of_month', 'revenue_7d_avg', 
                          'revenue_14d_avg', 'revenue_lag_1', 'revenue_lag_7']
        elif target_type == 'demand':
            target_col = 'quantity'
            feature_cols = ['day_of_week', 'is_weekend', 'demand_7d_avg', 'demand_14d_avg']
            if 'price_change' in features.columns:
                feature_cols.append('price_change')
        
        # Filter available columns
        available_cols = [col for col in feature_cols if col in features.columns]
        
        X = features[available_cols].values
        y = features[target_col].values
        
        return X, y
    
    def _generate_forecast_features(self, historical_features: pd.DataFrame, forecast_days: int) -> np.ndarray:
        """Generate features for forecasting future periods"""
        last_row = historical_features.iloc[-1]
        forecast_features = []
        
        for i in range(forecast_days):
            future_date = pd.to_datetime(last_row['date']) + timedelta(days=i+1)
            
            feature_row = [
                future_date.dayofweek,  # day_of_week
                future_date.month,      # month
                future_date.day,        # day_of_month
                last_row['revenue_7d_avg'],   # revenue_7d_avg (using last known)
                last_row['revenue_14d_avg'],  # revenue_14d_avg (using last known)
                last_row['revenue'],          # revenue_lag_1 (using last known)
                last_row['revenue']           # revenue_lag_7 (simplified)
            ]
            
            forecast_features.append(feature_row)
        
        return np.array(forecast_features)
    
    def _generate_demand_forecast_features(self, historical_features: pd.DataFrame, forecast_days: int) -> np.ndarray:
        """Generate features for demand forecasting"""
        last_row = historical_features.iloc[-1]
        forecast_features = []
        
        for i in range(forecast_days):
            future_date = pd.to_datetime(last_row['date']) + timedelta(days=i+1)
            
            feature_row = [
                future_date.dayofweek,        # day_of_week
                1 if future_date.dayofweek >= 5 else 0,  # is_weekend
                last_row['demand_7d_avg'],    # demand_7d_avg
                last_row['demand_14d_avg']    # demand_14d_avg
            ]
            
            if 'price_change' in historical_features.columns:
                feature_row.append(0)  # Assume no price change
            
            forecast_features.append(feature_row)
        
        return np.array(forecast_features)
    
    def _calculate_confidence_intervals(self, historical_values: np.ndarray, predictions: np.ndarray) -> Dict[str, List]:
        """Calculate confidence intervals for predictions"""
        historical_std = np.std(historical_values)
        
        # 95% confidence interval
        lower_bound = predictions - (1.96 * historical_std)
        upper_bound = predictions + (1.96 * historical_std)
        
        return {
            'lower_95': lower_bound.tolist(),
            'upper_95': upper_bound.tolist(),
            'lower_80': (predictions - (1.28 * historical_std)).tolist(),
            'upper_80': (predictions + (1.28 * historical_std)).tolist()
        }
    
    def _detect_seasonality(self, revenue_series: pd.Series) -> Dict[str, Any]:
        """Detect seasonal patterns in revenue data"""
        if len(revenue_series) < 14:
            return {'detected': False, 'pattern': None}
        
        # Simple seasonality detection using autocorrelation
        weekly_correlation = revenue_series.autocorr(lag=7)
        
        return {
            'detected': weekly_correlation > 0.3,
            'weekly_correlation': weekly_correlation,
            'pattern': 'weekly' if weekly_correlation > 0.3 else 'none'
        }
    
    def _detect_trend(self, revenue_series: pd.Series) -> Dict[str, Any]:
        """Detect trend in revenue data"""
        if len(revenue_series) < 7:
            return {'direction': 'insufficient_data', 'strength': 0}
        
        # Calculate trend using linear regression slope
        x = np.arange(len(revenue_series))
        y = revenue_series.values
        
        slope = np.polyfit(x, y, 1)[0]
        
        if slope > 0.01:
            direction = 'increasing'
        elif slope < -0.01:
            direction = 'decreasing'
        else:
            direction = 'stable'
        
        return {
            'direction': direction,
            'strength': abs(slope),
            'slope': slope
        }
    
    def _calculate_model_accuracy(self, model, X: np.ndarray, y: np.ndarray) -> Dict[str, float]:
        """Calculate model accuracy metrics"""
        try:
            predictions = model.predict(X)
            mae = mean_absolute_error(y, predictions)
            mse = mean_squared_error(y, predictions)
            rmse = np.sqrt(mse)
            
            # Calculate MAPE (Mean Absolute Percentage Error)
            mape = np.mean(np.abs((y - predictions) / y)) * 100
            
            return {
                'mae': float(mae),
                'mse': float(mse),
                'rmse': float(rmse),
                'mape': float(mape)
            }
        except Exception as e:
            logger.error(f"Error calculating model accuracy: {e}")
            return {'mae': 0, 'mse': 0, 'rmse': 0, 'mape': 0}
    
    def _generate_simple_forecast(self, data: pd.DataFrame, forecast_days: int) -> Dict[str, Any]:
        """Generate simple forecast when insufficient data for ML"""
        if len(data) == 0:
            return {'forecast_type': 'insufficient_data', 'predictions': []}
        
        # Simple moving average forecast
        recent_avg = data['revenue'].tail(7).mean()
        predictions = [recent_avg] * forecast_days
        
        return {
            'forecast_type': 'simple_average',
            'predictions': predictions,
            'confidence_intervals': {
                'lower_95': [p * 0.8 for p in predictions],
                'upper_95': [p * 1.2 for p in predictions]
            },
            'forecast_period_days': forecast_days,
            'generated_at': datetime.utcnow().isoformat()
        }
    
    def _generate_simple_demand_forecast(self, data: pd.DataFrame, forecast_days: int) -> Dict[str, Any]:
        """Generate simple demand forecast"""
        if len(data) == 0:
            return {'demand_forecast': [], 'peak_demand_days': []}
        
        recent_avg = data['quantity'].tail(7).mean()
        demand_predictions = [recent_avg] * forecast_days
        
        return {
            'demand_forecast': demand_predictions,
            'peak_demand_days': [],
            'inventory_recommendations': [],
            'forecast_accuracy': None,
            'generated_at': datetime.utcnow().isoformat()
        }
    
    def _identify_peak_demand_days(self, predictions: np.ndarray) -> List[int]:
        """Identify days with peak demand"""
        if len(predictions) == 0:
            return []
        
        threshold = np.mean(predictions) + np.std(predictions)
        peak_days = [i for i, pred in enumerate(predictions) if pred > threshold]
        return peak_days
    
    def _generate_inventory_recommendations(self, predictions: np.ndarray) -> List[Dict[str, Any]]:
        """Generate inventory recommendations based on demand forecast"""
        if len(predictions) == 0:
            return []
        
        recommendations = []
        avg_demand = np.mean(predictions)
        
        for i, demand in enumerate(predictions):
            if demand > avg_demand * 1.2:
                recommendations.append({
                    'day': i + 1,
                    'action': 'increase_inventory',
                    'recommended_quantity': demand * 1.1,
                    'reason': 'High demand predicted'
                })
            elif demand < avg_demand * 0.8:
                recommendations.append({
                    'day': i + 1,
                    'action': 'reduce_inventory',
                    'recommended_quantity': demand * 0.9,
                    'reason': 'Low demand predicted'
                })
        
        return recommendations

class AdvancedMLPipeline:
    """Main Advanced AI/ML Pipeline orchestrator"""
    
    def __init__(self):
        self.model_manager = MLModelManager()
        self.forecasting_engine = AdvancedForecastingEngine(self.model_manager)
        self.is_initialized = False
    
    async def initialize(self):
        """Initialize the ML pipeline"""
        try:
            await self.model_manager.initialize_models()
            self.is_initialized = True
            logger.info("Advanced ML Pipeline initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize ML Pipeline: {e}")
            raise
    
    async def generate_comprehensive_forecast(
        self,
        restaurant_id: UUID,
        db: AsyncSession
    ) -> Dict[str, Any]:
        """Generate comprehensive forecast using all available models"""
        if not self.is_initialized:
            await self.initialize()
        
        try:
            # Get historical data
            historical_data = await self._get_historical_data(restaurant_id, db)
            menu_data = await self._get_menu_performance_data(restaurant_id, db)
            
            # Generate forecasts
            revenue_forecast = await self.forecasting_engine.generate_revenue_forecast(
                restaurant_id, historical_data
            )
            
            demand_forecast = await self.forecasting_engine.generate_demand_forecast(
                restaurant_id, menu_data
            )
            
            return {
                'restaurant_id': str(restaurant_id),
                'revenue_forecast': revenue_forecast,
                'demand_forecast': demand_forecast,
                'generated_at': datetime.utcnow().isoformat(),
                'pipeline_version': '1.0.0'
            }
            
        except Exception as e:
            logger.error(f"Error generating comprehensive forecast: {e}")
            return {
                'restaurant_id': str(restaurant_id),
                'error': str(e),
                'generated_at': datetime.utcnow().isoformat()
            }
    
    async def _get_historical_data(self, restaurant_id: UUID, db: AsyncSession) -> pd.DataFrame:
        """Get historical revenue data for forecasting"""
        # Mock historical data - in production, this would query actual data
        dates = pd.date_range(start='2024-01-01', end='2024-12-31', freq='D')
        np.random.seed(42)
        
        # Generate realistic revenue data with trends and seasonality
        base_revenue = 1000
        trend = np.linspace(0, 200, len(dates))
        seasonality = 100 * np.sin(2 * np.pi * np.arange(len(dates)) / 7)  # Weekly pattern
        noise = np.random.normal(0, 50, len(dates))
        
        revenue = base_revenue + trend + seasonality + noise
        revenue = np.maximum(revenue, 100)  # Ensure positive values
        
        return pd.DataFrame({
            'date': dates,
            'revenue': revenue,
            'customers': np.random.randint(50, 200, len(dates)),
            'avg_order_value': revenue / np.random.randint(50, 200, len(dates))
        })
    
    async def _get_menu_performance_data(self, restaurant_id: UUID, db: AsyncSession) -> pd.DataFrame:
        """Get menu item performance data"""
        # Mock menu performance data
        dates = pd.date_range(start='2024-01-01', end='2024-12-31', freq='D')
        np.random.seed(42)
        
        return pd.DataFrame({
            'date': dates,
            'quantity': np.random.randint(10, 100, len(dates)),
            'price': np.random.uniform(8, 25, len(dates)),
            'item_id': 'mock_item_1'
        })

class PredictiveAnalyticsEngine:
    """Advanced predictive analytics for business intelligence"""

    def __init__(self, model_manager: MLModelManager):
        self.model_manager = model_manager

    async def predict_customer_behavior(
        self,
        restaurant_id: UUID,
        customer_data: pd.DataFrame
    ) -> Dict[str, Any]:
        """Predict customer behavior patterns"""
        try:
            model = self.model_manager.get_model('customer_segmenter')
            scaler = self.model_manager.get_scaler('customer')

            if len(customer_data) < 10:
                return self._generate_simple_customer_insights(customer_data)

            # Prepare customer features
            features = self._prepare_customer_features(customer_data)
            features_scaled = scaler.fit_transform(features)

            # Perform clustering
            clusters = model.fit_predict(features_scaled)

            # Analyze clusters
            cluster_analysis = self._analyze_customer_clusters(customer_data, clusters)

            # Predict customer lifetime value
            clv_predictions = self._predict_customer_lifetime_value(customer_data, clusters)

            # Churn risk analysis
            churn_risk = self._analyze_churn_risk(customer_data, clusters)

            return {
                'customer_segments': cluster_analysis,
                'lifetime_value_predictions': clv_predictions,
                'churn_risk_analysis': churn_risk,
                'total_customers_analyzed': len(customer_data),
                'generated_at': datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Error in customer behavior prediction: {e}")
            return self._generate_simple_customer_insights(customer_data)

    async def predict_price_optimization(
        self,
        restaurant_id: UUID,
        menu_data: pd.DataFrame,
        market_data: Optional[pd.DataFrame] = None
    ) -> Dict[str, Any]:
        """Predict optimal pricing strategies"""
        try:
            model = self.model_manager.get_model('price_optimizer')
            scaler = self.model_manager.get_scaler('price')

            if len(menu_data) < 5:
                return self._generate_simple_pricing_insights(menu_data)

            # Prepare pricing features
            features = self._prepare_pricing_features(menu_data, market_data)

            if len(features) > 10:
                X, y = self._prepare_pricing_training_data(features)
                X_scaled = scaler.fit_transform(X)
                model.fit(X_scaled, y)

                # Generate price recommendations
                price_recommendations = self._generate_price_recommendations(
                    model, scaler, features
                )

                # Calculate price elasticity
                elasticity_analysis = self._calculate_price_elasticity(menu_data)

                # Revenue impact analysis
                revenue_impact = self._analyze_revenue_impact(price_recommendations, menu_data)

                return {
                    'price_recommendations': price_recommendations,
                    'elasticity_analysis': elasticity_analysis,
                    'revenue_impact': revenue_impact,
                    'optimization_confidence': self._calculate_optimization_confidence(model, X_scaled, y),
                    'generated_at': datetime.utcnow().isoformat()
                }
            else:
                return self._generate_simple_pricing_insights(menu_data)

        except Exception as e:
            logger.error(f"Error in price optimization: {e}")
            return self._generate_simple_pricing_insights(menu_data)

    def _prepare_customer_features(self, data: pd.DataFrame) -> np.ndarray:
        """Prepare features for customer analysis"""
        features = []

        # Calculate RFM metrics if possible
        if 'last_order_date' in data.columns:
            data['recency'] = (datetime.now() - pd.to_datetime(data['last_order_date'])).dt.days
            features.append('recency')

        if 'order_frequency' in data.columns:
            features.append('order_frequency')

        if 'total_spent' in data.columns:
            features.append('total_spent')

        if 'avg_order_value' in data.columns:
            features.append('avg_order_value')

        # Use available features or create mock ones
        if not features:
            # Create mock RFM features
            np.random.seed(42)
            return np.random.rand(len(data), 3)

        return data[features].fillna(0).values

    def _analyze_customer_clusters(self, data: pd.DataFrame, clusters: np.ndarray) -> List[Dict[str, Any]]:
        """Analyze customer clusters"""
        cluster_analysis = []

        for cluster_id in np.unique(clusters):
            cluster_data = data[clusters == cluster_id]

            analysis = {
                'cluster_id': int(cluster_id),
                'size': len(cluster_data),
                'percentage': len(cluster_data) / len(data) * 100,
                'characteristics': self._describe_cluster_characteristics(cluster_data),
                'recommended_strategies': self._recommend_cluster_strategies(cluster_id, cluster_data)
            }

            cluster_analysis.append(analysis)

        return cluster_analysis

    def _describe_cluster_characteristics(self, cluster_data: pd.DataFrame) -> Dict[str, Any]:
        """Describe characteristics of a customer cluster"""
        characteristics = {}

        if 'total_spent' in cluster_data.columns:
            characteristics['avg_total_spent'] = float(cluster_data['total_spent'].mean())
            characteristics['spending_tier'] = self._categorize_spending(cluster_data['total_spent'].mean())

        if 'order_frequency' in cluster_data.columns:
            characteristics['avg_order_frequency'] = float(cluster_data['order_frequency'].mean())
            characteristics['frequency_tier'] = self._categorize_frequency(cluster_data['order_frequency'].mean())

        if 'avg_order_value' in cluster_data.columns:
            characteristics['avg_order_value'] = float(cluster_data['avg_order_value'].mean())

        return characteristics

    def _recommend_cluster_strategies(self, cluster_id: int, cluster_data: pd.DataFrame) -> List[str]:
        """Recommend strategies for customer cluster"""
        strategies = []

        # Simple rule-based recommendations
        if len(cluster_data) > 0:
            if 'total_spent' in cluster_data.columns:
                avg_spent = cluster_data['total_spent'].mean()
                if avg_spent > 500:
                    strategies.append("VIP treatment and exclusive offers")
                    strategies.append("Loyalty program premium tier")
                elif avg_spent > 200:
                    strategies.append("Targeted promotions to increase frequency")
                    strategies.append("Cross-selling opportunities")
                else:
                    strategies.append("Welcome offers and onboarding")
                    strategies.append("Value-focused promotions")

        if not strategies:
            strategies = ["Personalized marketing campaigns", "Engagement improvement initiatives"]

        return strategies

    def _predict_customer_lifetime_value(self, data: pd.DataFrame, clusters: np.ndarray) -> Dict[str, Any]:
        """Predict customer lifetime value"""
        clv_predictions = {}

        for cluster_id in np.unique(clusters):
            cluster_data = data[clusters == cluster_id]

            # Simple CLV calculation
            if 'total_spent' in cluster_data.columns and 'order_frequency' in cluster_data.columns:
                avg_spent = cluster_data['total_spent'].mean()
                avg_frequency = cluster_data['order_frequency'].mean()
                predicted_clv = avg_spent * avg_frequency * 2  # Simple 2-year projection
            else:
                predicted_clv = 250.0  # Default value

            clv_predictions[f'cluster_{cluster_id}'] = {
                'predicted_clv': float(predicted_clv),
                'confidence': 0.75,
                'time_horizon_months': 24
            }

        return clv_predictions

    def _analyze_churn_risk(self, data: pd.DataFrame, clusters: np.ndarray) -> Dict[str, Any]:
        """Analyze churn risk by cluster"""
        churn_analysis = {}

        for cluster_id in np.unique(clusters):
            cluster_data = data[clusters == cluster_id]

            # Simple churn risk calculation
            if 'last_order_date' in cluster_data.columns:
                days_since_last_order = (datetime.now() - pd.to_datetime(cluster_data['last_order_date'])).dt.days.mean()
                if days_since_last_order > 60:
                    risk_level = 'high'
                elif days_since_last_order > 30:
                    risk_level = 'medium'
                else:
                    risk_level = 'low'
            else:
                risk_level = 'medium'  # Default

            churn_analysis[f'cluster_{cluster_id}'] = {
                'risk_level': risk_level,
                'customers_at_risk': len(cluster_data) if risk_level == 'high' else 0,
                'recommended_actions': self._get_churn_prevention_actions(risk_level)
            }

        return churn_analysis

    def _get_churn_prevention_actions(self, risk_level: str) -> List[str]:
        """Get churn prevention actions based on risk level"""
        actions = {
            'high': [
                "Immediate personalized outreach",
                "Special win-back offers",
                "Customer service follow-up"
            ],
            'medium': [
                "Engagement campaigns",
                "Loyalty program incentives",
                "Feedback collection"
            ],
            'low': [
                "Regular engagement maintenance",
                "Satisfaction surveys",
                "Proactive communication"
            ]
        }
        return actions.get(risk_level, [])

    def _categorize_spending(self, avg_spent: float) -> str:
        """Categorize spending level"""
        if avg_spent > 500:
            return 'high'
        elif avg_spent > 200:
            return 'medium'
        else:
            return 'low'

    def _categorize_frequency(self, avg_frequency: float) -> str:
        """Categorize order frequency"""
        if avg_frequency > 10:
            return 'high'
        elif avg_frequency > 5:
            return 'medium'
        else:
            return 'low'

    def _generate_simple_customer_insights(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Generate simple customer insights when ML is not applicable"""
        return {
            'customer_segments': [
                {
                    'cluster_id': 0,
                    'size': len(data),
                    'percentage': 100.0,
                    'characteristics': {'note': 'Insufficient data for detailed segmentation'},
                    'recommended_strategies': ['Collect more customer data', 'Implement loyalty program']
                }
            ],
            'lifetime_value_predictions': {'overall': {'predicted_clv': 200.0, 'confidence': 0.5}},
            'churn_risk_analysis': {'overall': {'risk_level': 'unknown', 'customers_at_risk': 0}},
            'total_customers_analyzed': len(data),
            'generated_at': datetime.utcnow().isoformat()
        }

# Global ML pipeline instance
ml_pipeline = AdvancedMLPipeline()
