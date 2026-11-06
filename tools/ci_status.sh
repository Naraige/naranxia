#!/usr/bin/env bash
# Latest GitHub Actions runs of the repository, one line each (REST API through gh; the GraphQL API may be blocked).
#   bash tools/ci_status.sh          the 6 latest runs
#   bash tools/ci_status.sh --wait   wait until the runs of the current commit are finished (max 40 min), then list them
cd "$(dirname "$0")/.."
R=$(git remote get-url origin | sed -E 's#.*github.com[:/]##; s#\.git$##')
list(){ gh api "repos/$R/actions/runs?per_page=${1:-6}" --jq '.workflow_runs[]|"\(.status)/\(.conclusion // "-")  \(.name)  \(.head_sha[0:7])  \(.head_branch)  \(.html_url)"'; }
if [ "$1" = "--wait" ]; then
  H=$(git rev-parse HEAD)
  for i in $(seq 240); do
    P=$(gh api "repos/$R/actions/runs?head_sha=$H" --jq '[.workflow_runs[]|select(.status!="completed")]|length' 2>/dev/null)
    N=$(gh api "repos/$R/actions/runs?head_sha=$H" --jq '.workflow_runs|length' 2>/dev/null)
    [ "${N:-0}" -gt 0 ] && [ "${P:-1}" = 0 ] && break
    sleep 10
  done
  gh api "repos/$R/actions/runs?head_sha=$H" --jq '.workflow_runs[]|"\(.status)/\(.conclusion // "-")  \(.name)  \(.html_url)"'
  F=$(gh api "repos/$R/actions/runs?head_sha=$H" --jq '[.workflow_runs[]|select(.conclusion!="success" and .conclusion!="skipped")]|length')
  [ "$F" = 0 ] && echo "ALL GREEN" || { echo "SOMETHING FAILED: gh api repos/$R/actions/runs/<id>/jobs, logs in the run's test-logs artifact"; exit 1; }
else list "$2"; fi
