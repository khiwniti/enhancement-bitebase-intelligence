# BiteBase Intelligence Backend - Quick Start Script

import os
import sys

# Add backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

# Create dummy GeoIP database path to prevent errors
os.environ["GEOIP_DATABASE_PATH"] = "/tmp/dummy.mmdb"

# Import and run the application
from app.main import app
import uvicorn

if __name__ == "__main__":
    # Run the application
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[backend_dir]
    )