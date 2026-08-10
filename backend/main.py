from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.config import settings
from backend.database.session import Base, engine
from backend.utils.logger import app_logger, error_logger

# Import Routers
from backend.api.routers import (
    auth, dashboard, finance, investments,
    health_security, loans, documents, reports,
    notifications, ai_router, demo_router, settings_router
)

# Initialize Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure Security CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_logger.error(f"Unhandled Exception on {request.url}: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please check system logs."}
    )

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(finance.router, prefix=settings.API_V1_STR)
app.include_router(investments.router, prefix=settings.API_V1_STR)
app.include_router(health_security.router, prefix=settings.API_V1_STR)
app.include_router(loans.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(ai_router.router, prefix=settings.API_V1_STR)
app.include_router(demo_router.router, prefix=settings.API_V1_STR)
app.include_router(settings_router.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs"
    }

# Uvicorn router reload trigger
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
