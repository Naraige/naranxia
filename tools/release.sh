#!/usr/bin/env bash
# Bump, build, test, commit and push one release after the batch is approved.
# GitHub rebuilds dist/naranxia.html from source; generated output is not committed.
set -e
cd "$(dirname "$0")/.."
V=${1:-}; TITLE=${2:-}
[[ "$V" =~ ^v[0-9]+$ ]] && [ -n "$TITLE" ] || { echo 'usage: bash tools/release.sh vNN "title"' >&2; exit 1; }
grep -q "· $V" docs/JOURNAL.md || { echo "write the journal entry first: '## $(date +%F) · $V' on top of docs/JOURNAL.md" >&2; exit 1; }
git diff --quiet HEAD -- game/NOTES.md && { echo "game/NOTES.md is unchanged: write the notes of $V first" >&2; exit 1; }
node tools/textaudit.mjs --notes || { echo "game/NOTES.md has lines without a translation (list above): the Update page would show them in English. Translate them (python3 tools/addtexts.py texts.json, then nl/pl/tr in packages/game/src/i18n/langs/) and run again" >&2; exit 1; }
echo "$V" > game/VERSION
npm run build:release
T=${TESTS-smoke}; [ "$T" = all ] && T=--full
if [ -n "${TESTS-smoke}" ]; then node tools/test_all.mjs $T; fi
git add -A
git commit -q -m "$V: $TITLE" ${COMMIT_TRAILER:+-m "$COMMIT_TRAILER"}
git push -q origin HEAD:main
echo "pushed $V ($(git rev-parse --short HEAD)): GitHub rebuilds, tests, and publishes the release. Follow: bash tools/ci_status.sh --wait"
