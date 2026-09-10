import re
from typing import Tuple

class EntityResolver:
    @staticmethod
    def normalize_value(entity_type: str, value: str) -> Tuple[str, str]:
        """
        Normalizes an entity value and generates a canonical ID.
        Returns (canonical_id, normalized_value)
        """
        val_clean = str(value).strip()
        etype = entity_type.lower()

        if etype in ["wallet", "address"]:
            norm_val = val_clean.lower()
            if not norm_val.startswith("0x") and len(norm_val) == 40:
                norm_val = "0x" + norm_val
            return f"ENT-WALLET-{norm_val}", norm_val

        elif etype in ["transaction", "tx_hash"]:
            norm_val = val_clean.lower()
            return f"ENT-TX-{norm_val}", norm_val

        elif etype in ["pgp_fingerprint", "fingerprint"]:
            norm_val = norm_val = re.sub(r'[^A-Fa-f0-9]', '', val_clean).upper()
            return f"ENT-PGP-{norm_val}", norm_val

        elif etype in ["domain", "hostname"]:
            norm_val = val_clean.lower().strip(".")
            return f"ENT-DOM-{norm_val}", norm_val

        elif etype in ["ip", "ip-dst", "ip-src"]:
            norm_val = val_clean.strip()
            return f"ENT-IP-{norm_val}", norm_val

        elif etype in ["hash", "md5", "sha1", "sha256"]:
            norm_val = val_clean.lower()
            return f"ENT-HASH-{norm_val}", norm_val

        elif etype in ["email"]:
            norm_val = val_clean.lower()
            return f"ENT-EMAIL-{norm_val}", norm_val

        elif etype in ["threat_actor"]:
            norm_val = val_clean
            return f"ENT-ACTOR-{norm_val.replace(' ', '_')}", norm_val

        elif etype in ["darkweb_thread"]:
            return f"ENT-DW-{abs(hash(val_clean)) % 1000000}", val_clean

        else:
            return f"ENT-MISC-{abs(hash(val_clean)) % 1000000}", val_clean
