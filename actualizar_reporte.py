#!/usr/bin/env python3
"""Atajo local: actualiza data.js usando input/Foco_2026.xlsx."""

import sys

from engine.foco_engine.__main__ import main


if __name__ == "__main__":
    if "--excel" not in sys.argv:
        sys.argv.extend(["--excel", "input/Foco_2026.xlsx"])
    if "--output" not in sys.argv:
        sys.argv.extend(["--output", "data.js"])
    if "--audit" not in sys.argv:
        sys.argv.extend(["--audit", "AUDITORIA_DATOS.json"])
    raise SystemExit(main())
