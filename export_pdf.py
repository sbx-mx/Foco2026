#!/usr/bin/env python3
"""Exporta FOCO 2026 a PDF con Chromium headless.

Ejemplos:
  python export_pdf.py --url http://localhost:8000 --view rd --out FOCO_RD.pdf
  python export_pdf.py --url https://sbx-mx.github.io/Foco2026/ --view dm --out FOCO_DM.pdf
"""
from __future__ import annotations

import argparse
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

from playwright.sync_api import sync_playwright


def with_view(url: str, view: str) -> str:
    parts = urlsplit(url)
    path = parts.path or "/"
    return urlunsplit((parts.scheme, parts.netloc, path, parts.query, view))


def main() -> None:
    parser = argparse.ArgumentParser(description="Exportador PDF limpio para FOCO 2026")
    parser.add_argument("--url", default="http://127.0.0.1:8000", help="URL de la app")
    parser.add_argument("--view", choices=("rd", "dm", "tienda"), default="rd")
    parser.add_argument("--out", default="FOCO_2026.pdf")
    parser.add_argument("--timeout", type=int, default=60000)
    args = parser.parse_args()

    output = Path(args.out).expanduser().resolve()
    output.parent.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1600, "height": 1000}, device_scale_factor=1)
        page.goto(with_view(args.url, args.view), wait_until="networkidle", timeout=args.timeout)
        page.wait_for_selector("#content", state="visible", timeout=args.timeout)
        page.emulate_media(media="print")
        page.evaluate("document.body.classList.add('exporting', 'export-' + location.hash.slice(1))")
        page.pdf(
            path=str(output),
            format="A4",
            landscape=True,
            print_background=True,
            prefer_css_page_size=True,
            margin={"top": "8mm", "right": "8mm", "bottom": "9mm", "left": "8mm"},
        )
        browser.close()

    print(output)


if __name__ == "__main__":
    main()
