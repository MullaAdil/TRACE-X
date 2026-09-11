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

# Enable CORS for local development, production, and AWS deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
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

@app.get("/team-guide")
@app.get("/api/team-guide")
def get_team_guide():
    guide_path = Path(__file__).resolve().parent.parent.parent / "TRACE_X_TEAM_GUIDE.html"
    if guide_path.exists():
        return FileResponse(guide_path, media_type="text/html")
    return {"error": "Team guide not found on server"}

# Mount frontend/dist if built (for seamless single-port AWS deployment)
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if FRONTEND_DIST.exists():
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="static-assets")

    @app.get("/{full_path:path}")
    async def serve_spa_frontend(full_path: str):
        target = FRONTEND_DIST / full_path
        if full_path and target.exists() and target.is_file():
            return FileResponse(target)
        return FileResponse(FRONTEND_DIST / "index.html")
