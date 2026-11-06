#!/usr/bin/env bash
# Compatibility wrapper around the root npm build scripts.
set -e
cd "$(dirname "$0")/.."
if [ "${1:-}" = "--dist" ]; then
  npm run build:release
else
  npm run build
fi
