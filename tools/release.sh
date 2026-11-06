#!/usr/bin/env bash
# Releases the next version in one command (only after the King's go-ahead for this batch).
#   bash tools/release.sh v90 "short title of the batch"
# Before: game/NOTES.md rewritten for players (English, 3-8 bullets) and a "## <date> · v90" entry on top of docs/JOURNAL.md.
# It bumps game/VERSION and CLAUDE.md, builds the packed game, runs the quick local check (TESTS="smoke" by default;
# TESTS=all for the whole suite, TESTS= to skip), copies dist/naranxia.html to game/, commits (+ $COMMIT_TRAILER) and
# pushes to main. GitHub then runs every test (test.yml) and only if they pass publishes the release and the Discord post.
# Follow it with: bash tools/ci_status.sh --wait     then publish dist/naranxia.html to the claude.ai artifact.
set -e
cd "$(dirname "$0")/.."
V=$1; TITLE=$2
[[ "$V" =~ ^v[0-9]+$ ]] && [ -n "$TITLE" ] || { echo 'usage: bash tools/release.sh vNN "title"'; exit 1; }
grep -q "· $V" docs/JOURNAL.md || { echo "write the journal entry first: '## $(date +%F) · $V' on top of docs/JOURNAL.md"; exit 1; }
git diff --quiet HEAD -- game/NOTES.md && { echo "game/NOTES.md is unchanged: write the notes of $V first"; exit 1; }
echo "$V" > game/VERSION
sed -i -E "s/current version \(\`v[0-9]+\`\)/current version (\`$V\`)/" CLAUDE.md
bash tools/build.sh --dist > /dev/null
T=${TESTS-smoke}; [ "$T" = all ] && T=""
if [ -n "${TESTS-smoke}" ]; then bash tools/test_all.sh $T; fi
cp dist/naranxia.html game/naranxia.html
git add -A
git commit -q -m "$V: $TITLE" ${COMMIT_TRAILER:+-m "$COMMIT_TRAILER"}
git push -q origin HEAD:main
echo "pushed $V ($(git rev-parse --short HEAD)): GitHub runs the tests, then the release. Follow: bash tools/ci_status.sh --wait"
