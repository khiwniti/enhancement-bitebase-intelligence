"""
BiteBase Intelligence Backend - Main Entry Point
"""
from app.main import app

# Export the app instance for uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)