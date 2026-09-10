import networkx as nx
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from ..models.entities import Entity, Relationship

class GraphEngine:
    def __init__(self, db: Session):
        self.db = db
        self.graph = nx.Graph()
        self._build_graph()

    def _build_graph(self):
        self.graph.clear()
        entities = self.db.query(Entity).all()
        for ent in entities:
            self.graph.add_node(
                str(ent.id),
                canonical_id=ent.canonical_id,
                label=ent.display_name or ent.value[:25],
                type=ent.entity_type,
                value=ent.value,
                risk_score=ent.risk_score,
                is_synthetic=ent.is_synthetic
            )

        relationships = self.db.query(Relationship).all()
        for rel in relationships:
            self.graph.add_edge(
                str(rel.source_entity_id),
                str(rel.target_entity_id),
                relationship_id=rel.relationship_id,
                relationship=rel.relationship_type,
                confidence=rel.confidence_score,
                explanation=rel.explanation,
                evidence_ids=rel.evidence_ids.split(",") if rel.evidence_ids else []
            )

    def get_full_graph(self, limit_nodes: int = 250) -> Dict[str, Any]:
        """Returns nodes and edges formatted for visualization"""
        nodes_out = []
        edges_out = []

        # Sort nodes by degree centrality so most connected nodes appear first
        degrees = dict(self.graph.degree())
        sorted_node_ids = sorted(degrees.keys(), key=lambda k: degrees[k], reverse=True)[:limit_nodes]
        allowed_set = set(sorted_node_ids)

        for node_id in sorted_node_ids:
            data = self.graph.nodes[node_id]
            nodes_out.append({
                "id": str(node_id),
                "label": data.get("label", ""),
                "type": data.get("type", "entity"),
                "value": data.get("value", ""),
                "risk_score": data.get("risk_score", 0.0),
                "is_synthetic": data.get("is_synthetic", False)
            })

        for u, v, data in self.graph.edges(data=True):
            if str(u) in allowed_set and str(v) in allowed_set:
                edges_out.append({
                    "id": data.get("relationship_id", f"{u}-{v}"),
                    "source": str(u),
                    "target": str(v),
                    "relationship": data.get("relationship", "ASSOCIATED_WITH"),
                    "confidence": data.get("confidence", 0.5),
                    "explanation": data.get("explanation", ""),
                    "evidence_ids": data.get("evidence_ids", [])
                })

        return {"nodes": nodes_out, "edges": edges_out}

    def get_entity_neighborhood(self, entity_id: int, radius: int = 1) -> Dict[str, Any]:
        """Returns the local ego graph for a specific entity"""
        str_id = str(entity_id)
        if str_id not in self.graph:
            return {"nodes": [], "edges": []}

        sub_nodes = set(nx.ego_graph(self.graph, str_id, radius=radius).nodes())
        nodes_out = []
        for nid in sub_nodes:
            data = self.graph.nodes[nid]
            nodes_out.append({
                "id": str(nid),
                "label": data.get("label", ""),
                "type": data.get("type", "entity"),
                "value": data.get("value", ""),
                "risk_score": data.get("risk_score", 0.0),
                "is_synthetic": data.get("is_synthetic", False)
            })

        edges_out = []
        for u, v, data in self.graph.edges(sub_nodes, data=True):
            if u in sub_nodes and v in sub_nodes:
                edges_out.append({
                    "id": data.get("relationship_id", f"{u}-{v}"),
                    "source": str(u),
                    "target": str(v),
                    "relationship": data.get("relationship", "ASSOCIATED_WITH"),
                    "confidence": data.get("confidence", 0.5),
                    "explanation": data.get("explanation", ""),
                    "evidence_ids": data.get("evidence_ids", [])
                })

        return {"nodes": nodes_out, "edges": edges_out}

    def find_shortest_path(self, source_id: int, target_id: int) -> Optional[List[Dict[str, Any]]]:
        """Calculates shortest forensic correlation path between two entities"""
        s_id = str(source_id)
        t_id = str(target_id)
        if s_id not in self.graph or t_id not in self.graph:
            return None

        try:
            path = nx.shortest_path(self.graph, source=s_id, target=t_id)
            path_details = []
            for nid in path:
                d = self.graph.nodes[nid]
                path_details.append({
                    "id": nid,
                    "label": d.get("label"),
                    "type": d.get("type"),
                    "value": d.get("value")
                })
            return path_details
        except nx.NetworkXNoPath:
            return None
