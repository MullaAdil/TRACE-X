from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import APP_NAME, APP_DESCRIPTION, VERSION
from .database import engine, Base, SessionLocal
from .engine.normalizer import IngestionManager
from .engine.correlation import CorrelationEngine
from .api import (
    dashboard_router,
    investigations_router,
    search_router,
    entities_router,
    graph_router,
    blockchain_router,
    cti_router,
    darkweb_router,
    pgp_router,
    timeline_router,
    evidence_router,
    reports_router,
    assistant_router,
    demo_router,
    enrichment_router
)
from .api.deanonymization import router as deanonymization_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Ensure DB tables exist
    Base.metadata.create_all(bind=engine)

    # 2. Run initial ingestion and correlation
    db = SessionLocal()
    try:
        im = IngestionManager(db)
        im.run_ingestion(reset=False)

        ce = CorrelationEngine(db)
        ce.run_correlation(reset=False)
    finally:
        db.close()

    yield

app = FastAPI(
    title=APP_NAME,
    description=APP_DESCRIPTION,
    version=VERSION,
    lifespan=lifespan
)

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

# Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# Enable CORS for local development and standard frontend origins
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Register API routers under /api
app.include_router(dashboard_router, prefix="/api")
app.include_router(investigations_router, prefix="/api")
app.include_router(search_router, prefix="/api")
app.include_router(entities_router, prefix="/api")
app.include_router(graph_router, prefix="/api")
app.include_router(blockchain_router, prefix="/api")
app.include_router(cti_router, prefix="/api")
app.include_router(darkweb_router, prefix="/api")
app.include_router(pgp_router, prefix="/api")
app.include_router(timeline_router, prefix="/api")
app.include_router(evidence_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(assistant_router, prefix="/api")
app.include_router(demo_router, prefix="/api")
app.include_router(deanonymization_router, prefix="/api")
app.include_router(enrichment_router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": APP_NAME,
        "version": VERSION,
        "mode": "PROTOTYPE_INVESTIGATOR_SUPPORT"
    }

@app.post("/api/reindex")
def reindex_data():
    db = SessionLocal()
    try:
        im = IngestionManager(db)
        ing_res = im.run_ingestion(reset=True)
        ce = CorrelationEngine(db)
        cor_res = ce.run_correlation(reset=True)
        return {"ingestion": ing_res, "correlation": cor_res}
    finally:
        db.close()
