#!/usr/bin/env python3
"""Run the ICT SMO Club Budget form on localhost with no extra packages."""

from __future__ import annotations

import argparse
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from zipfile import ZipFile


APP_DIR = Path(__file__).resolve().parent


def extract_logo(template_path: Path | None) -> None:
    """Extract the existing template logo if one was provided."""
    logo_path = APP_DIR / "assets" / "logo.png"
    if logo_path.exists() or template_path is None:
        return

    if not template_path.exists():
        print(f"Template not found; using the text header instead: {template_path}")
        return

    try:
        with ZipFile(template_path) as template:
            image_name = "word/media/image1.png"
            if image_name not in template.namelist():
                print("No word/media/image1.png was found; using the text header instead.")
                return
            logo_path.parent.mkdir(parents=True, exist_ok=True)
            logo_path.write_bytes(template.read(image_name))
            print(f"Extracted the header image to {logo_path}")
    except Exception as exc:
        print(f"Could not extract the template image ({exc}); using the text header instead.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the Club Budget Proposal form locally.")
    parser.add_argument("--port", type=int, default=8000, help="Local port (default: 8000)")
    parser.add_argument(
        "--template",
        type=Path,
        default=None,
        help="Optional DOTX file used only to extract its header image",
    )
    args = parser.parse_args()

    extract_logo(args.template.expanduser() if args.template else None)
    os.chdir(APP_DIR)

    class QuietHandler(SimpleHTTPRequestHandler):
        def log_message(self, format: str, *values: object) -> None:
            print(f"[club-budget] {format % values}")

    server = ThreadingHTTPServer(("127.0.0.1", args.port), QuietHandler)
    url = f"http://127.0.0.1:{args.port}"
    print(f"Club Budget Proposal is running at {url}")
    print("Press Control-C to stop it.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
