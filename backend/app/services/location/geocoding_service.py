"""
BiteBase Intelligence Geocoding Service
Location geocoding and reverse geocoding functionality
"""

from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
from typing import Optional, Dict, Any, Tuple
import logging

logger = logging.getLogger(__name__)


class GeocodingService:
    """Service for geocoding and reverse geocoding operations"""
    
    def __init__(self):
        self.geolocator = Nominatim(user_agent="bitebase-intelligence")
    
    async def geocode_address(self, address: str) -> Optional[Dict[str, Any]]:
        """
        Convert address to coordinates
        """
        try:
            location = self.geolocator.geocode(address, timeout=10)
            
            if location:
                return {
                    'latitude': location.latitude,
                    'longitude': location.longitude,
                    'formatted_address': location.address,
                    'raw': location.raw
                }
            
            return None
            
        except (GeocoderTimedOut, GeocoderServiceError) as e:
            logger.error(f"Geocoding failed for address '{address}': {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected geocoding error: {str(e)}")
            return None
    
    async def reverse_geocode(self, latitude: float, longitude: float) -> Optional[Dict[str, Any]]:
        """
        Convert coordinates to address
        """
        try:
            location = self.geolocator.reverse((latitude, longitude), timeout=10)
            
            if location:
                return {
                    'formatted_address': location.address,
                    'raw': location.raw
                }
            
            return None
            
        except (GeocoderTimedOut, GeocoderServiceError) as e:
            logger.error(f"Reverse geocoding failed for coordinates ({latitude}, {longitude}): {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected reverse geocoding error: {str(e)}")
            return None
    
    def validate_coordinates(self, latitude: float, longitude: float) -> bool:
        """
        Validate coordinate ranges
        """
        return -90 <= latitude <= 90 and -180 <= longitude <= 180
    
    def calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate distance between two points using Haversine formula
        Returns distance in kilometers
        """
        from math import radians, cos, sin, asin, sqrt
        
        # Convert to radians
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        
        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        
        # Earth's radius in kilometers
        r = 6371
        
        return c * r