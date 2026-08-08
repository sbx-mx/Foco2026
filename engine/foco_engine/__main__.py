from __future__ import annotations

import argparse
import json
import sys

from .generator import build_report


def parser() -> argparse.ArgumentParser:
    command = argparse.ArgumentParser(description="Genera data.js del tablero FOCO desde el Excel base.")
    command.add_argument("--excel", required=True, help="Ruta al Excel FOCO")
    command.add_argument("--output", default="data.js", help="Ruta de salida para data.js")
    command.add_argument("--audit", default="build/auditoria_datos.json", help="Ruta del informe de calidad")
    command.add_argument("--year", type=int, help="Año a procesar; por defecto usa el más reciente")
    command.add_argument("--expected-week", type=int, help="Falla si el libro no alcanza esta semana")
    return command


def main() -> int:
    args = parser().parse_args()
    try:
        result = build_report(args.excel, args.output, args.audit, year=args.year, expected_week=args.expected_week)
    except Exception as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 1
    print(json.dumps({
        "status": "ok",
        "year": result.year,
        "updatedToWeek": result.updated_to_week,
        "defaultMonth": result.default_month,
        "directoryRows": result.directory_rows,
        "metricRows": result.metric_rows,
        "ctcDMRows": result.ctc_dm_rows,
        "output": result.output,
        "audit": result.audit_output,
    }, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())

