from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
from ..database import get_db
from ..engine.graph_engine import GraphEngine
from ..schemas.schemas import GraphData

router = APIRouter(prefix="/graph", tags=["Graph"])

@router.get("/data", response_model=GraphData)
def get_graph_data(
    limit: int = Query(250, ge=10, le=1000),
    db: Session = Depends(get_db)
):
    engine = GraphEngine(db)
    return engine.get_full_graph(limit_nodes=limit)

@router.get("/neighborhood/{entity_id}", response_model=GraphData)
def get_entity_neighborhood(
    entity_id: int,
    radius: int = Query(1, ge=1, le=3),
    db: Session = Depends(get_db)
):
    engine = GraphEngine(db)
    return engine.get_entity_neighborhood(entity_id=entity_id, radius=radius)

@router.get("/path")
def find_correlation_path(
    source_id: int = Query(..., description="Source entity ID"),
    target_id: int = Query(..., description="Target entity ID"),
    db: Session = Depends(get_db)
):
    engine = GraphEngine(db)
    path = engine.find_shortest_path(source_id=source_id, target_id=target_id)
    if path is None:
        raise HTTPException(status_code=404, detail="No correlation path discovered between the selected entities")
    return {"path": path, "hops": len(path) - 1}
