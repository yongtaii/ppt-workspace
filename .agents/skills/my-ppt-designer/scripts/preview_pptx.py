"""Inspect and render a basic PPTX on macOS. Paths are relative to the caller."""
import argparse
import os
import platform
import subprocess
import sys
import tempfile
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('pptx', type=Path)
    parser.add_argument('--out-dir', type=Path)
    parser.add_argument('--expected-slides', type=int)
    args = parser.parse_args()
    scripts = Path(__file__).resolve().parent
    source = args.pptx.resolve()
    dest = (args.out_dir or source.parent / (source.stem + '-preview')).resolve()
    cmd = [sys.executable, str(scripts / 'inspect_pptx.py'), str(source), '--out-dir', str(dest)]
    if args.expected_slides is not None:
        cmd += ['--expected-slides', str(args.expected_slides)]
    subprocess.run(cmd, check=True)
    if platform.system() != 'Darwin':
        raise SystemExit('Structural checks passed; AppKit rendering requires macOS. Use PowerPoint/LibreOffice for native rendering.')
    env = dict(os.environ)
    env.setdefault('CLANG_MODULE_CACHE_PATH', str(Path(tempfile.gettempdir()) / 'ppt-skill-clang-cache'))
    subprocess.run(['swift', str(scripts / 'render_pptx.swift'), str(dest)], check=True, env=env)

if __name__ == '__main__':
    main()
