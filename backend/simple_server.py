# Simple backend test - just start a minimal FastAPI server
import os
os.environ["GEOIP_DATABASE_PATH"] = "/tmp/dummy.mmdb"

from fastapi import FastAPI
import uvicorn

app = FastAPI(title="BiteBase Intelligence API", version="1.0.0")

@app.get("/")
async def root():
    return {"message": "BiteBase Intelligence Backend is running"}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "bitebase-intelligence"}

@app.get("/api/v1/test")
async def test_endpoint():
    return {"message": "API test successful", "version": "1.0.0"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)