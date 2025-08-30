from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.v1 import auth, documents, processing
from app.core.config import settings

app = FastAPI(
    title="AI Document Insight Tool",
    description="A FastAPI application for AI-powered document processing",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# API routes
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["documents"])
app.include_router(processing.router, prefix="/api/v1/process", tags=["processing"])

@app.get("/")
async def root():
    return {"message": "AI Document Insight Tool API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
