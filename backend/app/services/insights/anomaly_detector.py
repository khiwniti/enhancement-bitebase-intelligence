"""
BiteBase Intelligence Anomaly Detector
Statistical algorithms for detecting anomalies in restaurant data
"""

import numpy as np
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from scipy import stats
import pandas as pd

from app.models.insights import Anomaly, AnomalyType
from app.models.restaurant import RestaurantAnalytics

logger = logging.getLogger(__name__)


class AnomalyDetector:
    """
    Advanced anomaly detection using multiple statistical algorithms
    Implements Z-score analysis and Isolation Forest for multivariate detection
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
        
        # Algorithm configurations
        self.config = {
            'z_score_threshold': 2.5,  # Standard deviations for outlier detection
            'isolation_contamination': 0.1,  # Expected proportion of outliers
            'min_data_points': 7,  # Minimum data points for analysis
            'seasonal_window': 7,  # Days for seasonal comparison
            'trend_window': 14,  # Days for trend analysis
            'confidence_threshold': 0.7
        }
        
        # Performance tracking
        self.detection_stats = {
            'anomalies_detected': 0,
            'false_positives': 0,
            'processing_time_total': 0.0
        }
    
    async def detect_revenue_anomalies(self, revenue_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Detect revenue anomalies using multiple algorithms
        Returns list of detected anomalies with confidence scores
        """
        anomalies = []
        
        try:
            if len(revenue_data) < self.config['min_data_points']:
                logger.warning(f"Insufficient data points: {len(revenue_data)}")
                return anomalies
            
            # Convert to pandas DataFrame for easier analysis
            df = pd.DataFrame(revenue_data)
            df['date'] = pd.to_datetime(df['date'])
            df = df.sort_values('date')
            
            # Z-score based anomaly detection
            z_score_anomalies = await self._detect_z_score_anomalies(df, 'revenue')
            anomalies.extend(z_score_anomalies)
            
            # Isolation Forest for multivariate anomaly detection
            isolation_anomalies = await self._detect_isolation_forest_anomalies(df)
            anomalies.extend(isolation_anomalies)
            
            # Trend deviation detection
            trend_anomalies = await self._detect_trend_anomalies(df, 'revenue')
            anomalies.extend(trend_anomalies)
            
            # Seasonal anomaly detection
            seasonal_anomalies = await self._detect_seasonal_anomalies(df, 'revenue')
            anomalies.extend(seasonal_anomalies)
            
            # Remove duplicates and rank by confidence
            anomalies = self._deduplicate_and_rank_anomalies(anomalies)
            
            return anomalies
            
        except Exception as e:
            logger.error(f"Error detecting revenue anomalies: {str(e)}")
            return anomalies
    
    async def _detect_z_score_anomalies(self, df: pd.DataFrame, metric: str) -> List[Dict[str, Any]]:
        """Detect anomalies using Z-score analysis"""
        anomalies = []
        
        try:
            if metric not in df.columns:
                return anomalies
            
            # Calculate rolling statistics for more robust detection
            window_size = min(7, len(df) // 2)
            df['rolling_mean'] = df[metric].rolling(window=window_size, min_periods=1).mean()
            df['rolling_std'] = df[metric].rolling(window=window_size, min_periods=1).std()
            
            # Calculate Z-scores
            df['z_score'] = np.abs((df[metric] - df['rolling_mean']) / df['rolling_std'])
            
            # Identify outliers
            outliers = df[df['z_score'] > self.config['z_score_threshold']]
            
            for _, row in outliers.iterrows():
                # Calculate confidence based on Z-score magnitude
                confidence = min(0.95, (row['z_score'] - self.config['z_score_threshold']) / 3.0 + 0.7)
                
                # Determine severity based on deviation magnitude
                severity = self._calculate_severity(row['z_score'], 'z_score')
                
                # Calculate impact based on absolute deviation
                expected_value = row['rolling_mean']
                actual_value = row[metric]
                impact = abs(actual_value - expected_value) / expected_value if expected_value > 0 else 0
                impact = min(1.0, impact)
                
                anomaly = {
                    'type': AnomalyType.STATISTICAL_OUTLIER,
                    'metric': metric,
                    'timestamp': row['date'],
                    'actual_value': actual_value,
                    'expected_value': expected_value,
                    'z_score': row['z_score'],
                    'confidence': confidence,
                    'severity': severity,
                    'impact': impact,
                    'urgency': self._calculate_urgency(confidence, impact),
                    'description': f"{metric.title()} shows statistical outlier: {actual_value:.2f} vs expected {expected_value:.2f}",
                    'algorithm': 'z_score',
                    'data_points': {
                        'actual': actual_value,
                        'expected': expected_value,
                        'z_score': row['z_score'],
                        'threshold': self.config['z_score_threshold']
                    },
                    'context': {
                        'window_size': window_size,
                        'deviation_percentage': ((actual_value - expected_value) / expected_value * 100) if expected_value > 0 else 0
                    }
                }
                
                # Add recommendations based on anomaly type
                anomaly['recommendations'] = self._generate_z_score_recommendations(anomaly)
                
                anomalies.append(anomaly)
            
            return anomalies
            
        except Exception as e:
            logger.error(f"Error in Z-score anomaly detection: {str(e)}")
            return anomalies
    
    async def _detect_isolation_forest_anomalies(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Detect multivariate anomalies using Isolation Forest"""
        anomalies = []
        
        try:
            # Select numeric features for analysis
            numeric_features = ['revenue', 'customers', 'avg_order_value']
            available_features = [f for f in numeric_features if f in df.columns and df[f].notna().sum() > 0]
            
            if len(available_features) < 2:
                return anomalies
            
            # Prepare data
            feature_data = df[available_features].fillna(df[available_features].mean())
            
            if len(feature_data) < self.config['min_data_points']:
                return anomalies
            
            # Standardize features
            scaler = StandardScaler()
            scaled_data = scaler.fit_transform(feature_data)
            
            # Apply Isolation Forest
            isolation_forest = IsolationForest(
                contamination=self.config['isolation_contamination'],
                random_state=42,
                n_estimators=100
            )
            
            # Fit and predict
            outlier_labels = isolation_forest.fit_predict(scaled_data)
            anomaly_scores = isolation_forest.decision_function(scaled_data)
            
            # Process results
            for i, (label, score) in enumerate(zip(outlier_labels, anomaly_scores)):
                if label == -1:  # Anomaly detected
                    row = df.iloc[i]
                    
                    # Convert isolation score to confidence (scores are typically negative)
                    confidence = min(0.95, max(0.5, (abs(score) - 0.1) / 0.4))
                    
                    # Calculate impact based on how many features are anomalous
                    feature_deviations = []
                    for feature in available_features:
                        if feature in row and not pd.isna(row[feature]):
                            feature_mean = df[feature].mean()
                            feature_std = df[feature].std()
                            if feature_std > 0:
                                deviation = abs(row[feature] - feature_mean) / feature_std
                                feature_deviations.append(deviation)
                    
                    avg_deviation = np.mean(feature_deviations) if feature_deviations else 0
                    impact = min(1.0, avg_deviation / 3.0)
                    
                    severity = self._calculate_severity(abs(score), 'isolation')
                    
                    anomaly = {
                        'type': AnomalyType.STATISTICAL_OUTLIER,
                        'metric': 'multivariate',
                        'timestamp': row['date'],
                        'actual_value': None,  # Multivariate doesn't have single value
                        'expected_value': None,
                        'isolation_score': score,
                        'confidence': confidence,
                        'severity': severity,
                        'impact': impact,
                        'urgency': self._calculate_urgency(confidence, impact),
                        'description': f"Multivariate anomaly detected across {len(available_features)} metrics",
                        'algorithm': 'isolation_forest',
                        'data_points': {
                            'features': {feature: row[feature] for feature in available_features},
                            'isolation_score': score,
                            'contamination': self.config['isolation_contamination']
                        },
                        'context': {
                            'features_analyzed': available_features,
                            'avg_deviation': avg_deviation
                        }
                    }
                    
                    anomaly['recommendations'] = self._generate_isolation_recommendations(anomaly)
                    anomalies.append(anomaly)
            
            return anomalies
            
        except Exception as e:
            logger.error(f"Error in Isolation Forest anomaly detection: {str(e)}")
            return anomalies
    
    async def _detect_trend_anomalies(self, df: pd.DataFrame, metric: str) -> List[Dict[str, Any]]:
        """Detect anomalies based on trend deviations"""
        anomalies = []
        
        try:
            if metric not in df.columns or len(df) < self.config['trend_window']:
                return anomalies
            
            # Calculate trend using linear regression
            df_copy = df.copy()
            df_copy['day_index'] = range(len(df_copy))
            
            # Rolling trend analysis
            window = self.config['trend_window']
            
            for i in range(window, len(df_copy)):
                # Get window data
                window_data = df_copy.iloc[i-window:i]
                
                # Calculate trend
                x = window_data['day_index'].values
                y = window_data[metric].values
                
                if len(x) < 3 or np.std(y) == 0:
                    continue
                
                # Linear regression
                slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)
                
                # Predict current value based on trend
                current_x = df_copy.iloc[i]['day_index']
                predicted_value = slope * current_x + intercept
                actual_value = df_copy.iloc[i][metric]
                
                # Calculate deviation from trend
                if predicted_value > 0:
                    deviation = abs(actual_value - predicted_value) / predicted_value
                else:
                    deviation = 0
                
                # Check if deviation is significant
                if deviation > 0.2 and abs(r_value) > 0.5:  # Strong trend with significant deviation
                    confidence = min(0.9, deviation * abs(r_value))
                    
                    if confidence >= self.config['confidence_threshold']:
                        severity = self._calculate_severity(deviation, 'trend')
                        impact = min(1.0, deviation)
                        
                        anomaly = {
                            'type': AnomalyType.TREND_DEVIATION,
                            'metric': metric,
                            'timestamp': df_copy.iloc[i]['date'],
                            'actual_value': actual_value,
                            'expected_value': predicted_value,
                            'confidence': confidence,
                            'severity': severity,
                            'impact': impact,
                            'urgency': self._calculate_urgency(confidence, impact),
                            'description': f"{metric.title()} deviates from established trend: {actual_value:.2f} vs predicted {predicted_value:.2f}",
                            'algorithm': 'trend_analysis',
                            'data_points': {
                                'actual': actual_value,
                                'predicted': predicted_value,
                                'slope': slope,
                                'r_value': r_value,
                                'deviation': deviation
                            },
                            'context': {
                                'trend_window': window,
                                'trend_strength': abs(r_value),
                                'trend_direction': 'increasing' if slope > 0 else 'decreasing'
                            }
                        }
                        
                        anomaly['recommendations'] = self._generate_trend_recommendations(anomaly)
                        anomalies.append(anomaly)
            
            return anomalies
            
        except Exception as e:
            logger.error(f"Error in trend anomaly detection: {str(e)}")
            return anomalies
    
    async def _detect_seasonal_anomalies(self, df: pd.DataFrame, metric: str) -> List[Dict[str, Any]]:
        """Detect seasonal anomalies by comparing with same day of week"""
        anomalies = []
        
        try:
            if metric not in df.columns or len(df) < 14:  # Need at least 2 weeks
                return anomalies
            
            df_copy = df.copy()
            df_copy['day_of_week'] = df_copy['date'].dt.dayofweek
            
            # For each day, compare with historical same-day-of-week values
            for i in range(7, len(df_copy)):  # Start after first week
                current_row = df_copy.iloc[i]
                current_dow = current_row['day_of_week']
                current_value = current_row[metric]
                
                # Get historical values for same day of week
                historical_data = df_copy.iloc[:i]
                same_dow_data = historical_data[historical_data['day_of_week'] == current_dow]
                
                if len(same_dow_data) < 2:
                    continue
                
                # Calculate seasonal baseline
                seasonal_mean = same_dow_data[metric].mean()
                seasonal_std = same_dow_data[metric].std()
                
                if seasonal_std == 0:
                    continue
                
                # Calculate seasonal Z-score
                seasonal_z_score = abs(current_value - seasonal_mean) / seasonal_std
                
                if seasonal_z_score > 2.0:  # Seasonal anomaly threshold
                    confidence = min(0.9, (seasonal_z_score - 2.0) / 2.0 + 0.7)
                    
                    if confidence >= self.config['confidence_threshold']:
                        severity = self._calculate_severity(seasonal_z_score, 'seasonal')
                        impact = abs(current_value - seasonal_mean) / seasonal_mean if seasonal_mean > 0 else 0
                        impact = min(1.0, impact)
                        
                        day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                        day_name = day_names[current_dow]
                        
                        anomaly = {
                            'type': AnomalyType.SEASONAL_ANOMALY,
                            'metric': metric,
                            'timestamp': current_row['date'],
                            'actual_value': current_value,
                            'expected_value': seasonal_mean,
                            'confidence': confidence,
                            'severity': severity,
                            'impact': impact,
                            'urgency': self._calculate_urgency(confidence, impact),
                            'description': f"{metric.title()} unusual for {day_name}: {current_value:.2f} vs typical {seasonal_mean:.2f}",
                            'algorithm': 'seasonal_analysis',
                            'data_points': {
                                'actual': current_value,
                                'seasonal_mean': seasonal_mean,
                                'seasonal_std': seasonal_std,
                                'seasonal_z_score': seasonal_z_score
                            },
                            'context': {
                                'day_of_week': day_name,
                                'historical_samples': len(same_dow_data),
                                'seasonal_pattern': 'weekly'
                            }
                        }
                        
                        anomaly['recommendations'] = self._generate_seasonal_recommendations(anomaly)
                        anomalies.append(anomaly)
            
            return anomalies
            
        except Exception as e:
            logger.error(f"Error in seasonal anomaly detection: {str(e)}")
            return anomalies
    
    def _calculate_severity(self, score: float, algorithm_type: str) -> str:
        """Calculate severity based on algorithm type and score"""
        if algorithm_type == 'z_score':
            if score > 4.0:
                return 'critical'
            elif score > 3.0:
                return 'high'
            elif score > 2.5:
                return 'medium'
            else:
                return 'low'
        elif algorithm_type == 'isolation':
            if abs(score) > 0.5:
                return 'critical'
            elif abs(score) > 0.3:
                return 'high'
            elif abs(score) > 0.1:
                return 'medium'
            else:
                return 'low'
        elif algorithm_type == 'trend':
            if score > 0.5:
                return 'critical'
            elif score > 0.3:
                return 'high'
            elif score > 0.2:
                return 'medium'
            else:
                return 'low'
        elif algorithm_type == 'seasonal':
            if score > 4.0:
                return 'critical'
            elif score > 3.0:
                return 'high'
            elif score > 2.0:
                return 'medium'
            else:
                return 'low'
        
        return 'medium'
    
    def _calculate_urgency(self, confidence: float, impact: float) -> float:
        """Calculate urgency score based on confidence and impact"""
        return min(1.0, (confidence * 0.6 + impact * 0.4))
    
    def _generate_z_score_recommendations(self, anomaly: Dict[str, Any]) -> List[str]:
        """Generate recommendations for Z-score anomalies"""
        recommendations = []
        
        actual = anomaly['actual_value']
        expected = anomaly['expected_value']
        
        if actual > expected:
            recommendations.extend([
                "Investigate factors contributing to higher than expected performance",
                "Analyze if this represents a sustainable improvement or temporary spike",
                "Consider scaling successful practices if performance is genuinely improved"
            ])
        else:
            recommendations.extend([
                "Investigate potential causes of performance decline",
                "Review operational changes or external factors",
                "Implement corrective measures to return to expected performance levels"
            ])
        
        return recommendations
    
    def _generate_isolation_recommendations(self, anomaly: Dict[str, Any]) -> List[str]:
        """Generate recommendations for isolation forest anomalies"""
        return [
            "Review multiple business metrics simultaneously for correlation",
            "Investigate operational changes that might affect multiple KPIs",
            "Consider external factors impacting overall business performance",
            "Analyze customer behavior patterns during the anomalous period"
        ]
    
    def _generate_trend_recommendations(self, anomaly: Dict[str, Any]) -> List[str]:
        """Generate recommendations for trend anomalies"""
        recommendations = []
        
        trend_direction = anomaly['context'].get('trend_direction', 'unknown')
        
        if trend_direction == 'increasing':
            recommendations.extend([
                "Investigate why positive trend was interrupted",
                "Identify and address barriers to continued growth",
                "Implement measures to restore upward trajectory"
            ])
        else:
            recommendations.extend([
                "Analyze if decline trend has been halted or accelerated",
                "Implement immediate interventions if decline continues",
                "Investigate root causes of the original declining trend"
            ])
        
        return recommendations
    
    def _generate_seasonal_recommendations(self, anomaly: Dict[str, Any]) -> List[str]:
        """Generate recommendations for seasonal anomalies"""
        day_of_week = anomaly['context'].get('day_of_week', 'Unknown')
        
        return [
            f"Investigate factors specific to {day_of_week} operations",
            "Review staffing levels and operational procedures for this day",
            "Compare with similar businesses' performance patterns",
            "Consider day-specific marketing or operational adjustments"
        ]
    
    def _deduplicate_and_rank_anomalies(self, anomalies: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate anomalies and rank by confidence"""
        if not anomalies:
            return anomalies
        
        # Group by timestamp and metric
        grouped = {}
        for anomaly in anomalies:
            key = (anomaly['timestamp'], anomaly['metric'])
            if key not in grouped:
                grouped[key] = []
            grouped[key].append(anomaly)
        
        # Keep highest confidence anomaly for each group
        deduplicated = []
        for group in grouped.values():
            best_anomaly = max(group, key=lambda x: x['confidence'])
            deduplicated.append(best_anomaly)
        
        # Sort by confidence descending
        return sorted(deduplicated, key=lambda x: x['confidence'], reverse=True)
    
    async def save_anomaly(self, anomaly_data: Dict[str, Any], insight_id: str) -> Optional[Anomaly]:
        """Save detected anomaly to database"""
        try:
            anomaly = Anomaly(
                id=str(uuid.uuid4()),
                insight_id=insight_id,
                anomaly_type=anomaly_data['type'],
                metric_name=anomaly_data['metric'],
                metric_value=anomaly_data.get('actual_value', 0),
                expected_value=anomaly_data.get('expected_value'),
                deviation_score=anomaly_data.get('confidence', 0),
                z_score=anomaly_data.get('z_score'),
                isolation_score=anomaly_data.get('isolation_score'),
                data_timestamp=anomaly_data['timestamp'],
                detection_algorithm=anomaly_data['algorithm'],
                contributing_factors=anomaly_data.get('context', {}),
                related_metrics=anomaly_data.get('data_points', {})
            )
            
            self.db.add(anomaly)
            await self.db.commit()
            await self.db.refresh(anomaly)
            
            return anomaly
            
        except Exception as e:
            logger.error(f"Error saving anomaly: {str(e)}")
            await self.db.rollback()
            return None
    
    def get_detection_stats(self) -> Dict[str, Any]:
        """Get anomaly detection statistics"""
        return {
            **self.detection_stats,
            'config': self.config
        }