from __future__ import annotations

import argparse
import shutil
from pathlib import Path


FILES = ["index.html", "style.css", "slicers.js", "app.js", "data.js", "manifest.webmanifest", "favicon.ico", "sw.js"]


def main() -> int:
    parser = argparse.ArgumentParser(description="Prepara únicamente los archivos publicables en GitHub Pages.")
    parser.add_argument("--source", default=".")
    parser.add_argument("--output", default="build/site")
    args = parser.parse_args()
    source, output = Path(args.source).resolve(), Path(args.output).resolve()
    if output.exists():
        shutil.rmtree(output)
    output.mkdir(parents=True)
    for name in FILES:
        shutil.copy2(source / name, output / name)
    shutil.copytree(source / "assets", output / "assets")
    print(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

