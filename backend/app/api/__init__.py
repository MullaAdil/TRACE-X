from .dashboard import router as dashboard_router
from .investigations import router as investigations_router
from .search import router as search_router
from .entities import router as entities_router
from .graph import router as graph_router
from .blockchain import router as blockchain_router
from .cti import router as cti_router
from .darkweb import router as darkweb_router
from .pgp import router as pgp_router
from .timeline import router as timeline_router
from .evidence import router as evidence_router
from .reports import router as reports_router
from .assistant import router as assistant_router
from .demo import router as demo_router
from .enrichment import router as enrichment_router

__all__ = [
    "dashboard_router",
    "investigations_router",
    "search_router",
    "entities_router",
    "graph_router",
    "blockchain_router",
    "cti_router",
    "darkweb_router",
    "pgp_router",
    "timeline_router",
    "evidence_router",
    "reports_router",
    "assistant_router",
    "demo_router",
    "enrichment_router"
]

