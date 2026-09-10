from typing import Dict, Any, List
from ..config import SCORING_WEIGHTS

class ScoringEngine:
    @staticmethod
    def calculate_confidence(
        match_type: str,
        source_count: int = 1,
        has_provenance: bool = True,
        is_exact: bool = True
    ) -> Dict[str, Any]:
        """
        Calculates an explainable correlation confidence score.
        Formula:
          Base_Score = SCORING_WEIGHTS[match_type]
          Multiplier = 1.0 + (source_count - 1) * 0.15 (capped at 1.25)
          Provenance_Penalty = 0.9 if not has_provenance else 1.0
          Final_Score = min(0.99, Base_Score * Multiplier * Provenance_Penalty)
        """
        base_score = SCORING_WEIGHTS.get(match_type, 0.50)
        if not is_exact:
            base_score = base_score * 0.5

        # Multi-source corroboration boost
        if source_count > 1:
            multi_source_multiplier = min(1.25, 1.0 + (source_count - 1) * 0.15)
        else:
            multi_source_multiplier = 1.0

        provenance_factor = 1.0 if has_provenance else 0.85
        raw_score = base_score * multi_source_multiplier * provenance_factor
        final_score = round(min(0.99, max(0.05, raw_score)), 2)

        # Generate human-readable explanation
        rationale_parts = [
            f"Base weight for {match_type.replace('_', ' ').title()}: {base_score:.2f}"
        ]
        if source_count > 1:
            rationale_parts.append(
                f"Multi-source corroboration ({source_count} independent sources): +{(multi_source_multiplier - 1.0)*100:.0f}% confidence"
            )
        if not has_provenance:
            rationale_parts.append("Missing verified provenance chain: -15% penalty")

        explanation = ". ".join(rationale_parts) + f". Final Correlation Confidence: {final_score:.2f}."

        return {
            "score": final_score,
            "level": "VERY HIGH" if final_score >= 0.85 else ("HIGH" if final_score >= 0.70 else ("MEDIUM" if final_score >= 0.45 else "LOW")),
            "base_score": base_score,
            "source_count": source_count,
            "explanation": explanation
        }
