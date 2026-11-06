#!/usr/bin/env bash
# Compatibility entry point. npm test calls the portable Node runner directly.
set -e
cd "$(dirname "$0")/.."
node tools/test_all.mjs "$@"
