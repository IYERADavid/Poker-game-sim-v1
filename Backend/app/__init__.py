from fastapi import FastAPI
from app.config import settings
from app.routes.main.routes import router as main_router

def create_app():
    app = FastAPI(
        title=settings.app_name,
        description="A simple Pocke game built using FastAPI",
        version="1.0.0",
        contact={
            "name": "Pocker game API",
            "url": "https://david-iyera-portifolio.netlify.app/",
            "email": "iyeradavid@gmail.com",
        },
        docs_url="/docs",          # Swagger UI
        redoc_url="/redoc",        # ReDoc UI
        openapi_url="/openapi.json"  # Raw OpenAPI spec
    )
    
    app.include_router(main_router)
    return app
