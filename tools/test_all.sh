#!/usr/bin/env bash
# Runs the headless tests and prints one line per test (PASS / FAIL and seconds); the full output of each test
# goes to dist/test-logs/<name>.log (read it only when a test fails).
#   bash tools/test_all.sh               the quick suite (about 6 minutes on 2 cores)
#   bash tools/test_all.sh det mp8       only these tests
#   bash tools/test_all.sh --full        the quick suite + the save round trip (several minutes more)
#   J=2 bash tools/test_all.sh           two tests at a time
# Needs the builds: bash tools/build.sh --dist (smoke runs on the packed file). Exit code 1 when a test fails.
cd "$(dirname "$0")/.."
mkdir -p dist/test-logs
declare -A CMD=(
 [smoke]="python3 tools/run.py tests/smoke.js - 1280 720 300 naranxia.html"
 [det]="python3 tools/run.py tests/det.js"
 [tools]="python3 tests/tools.py"
 [mp8]="python3 tests/mp8.py naranxia_readable.html 40"
 [mpk]="python3 tests/mpk.py naranxia_readable.html 40"
 [mp_resync]="python3 tests/mp_resync.py naranxia_readable.html 220"
 [mp_convoy]="python3 tests/mp_convoy.py naranxia_readable.html 150"
 [save]="python3 tools/run.py tests/save.js"
)
QUICK="smoke det tools mp8 mpk mp_resync mp_convoy"
# a test passes when its log shows this, and none of: Traceback, EXC, FIRST DIVERGENCE, an ERRS line with errors
declare -A OK=(
 [smoke]='^ERRS \[\]' [det]='"same":true' [tools]='^RESULT OK' [mp8]='^ERRS \[\] \[\]' [mpk]='^ERRS \[\] \[\]'
 [mp_resync]='^RESULT OK' [mp_convoy]='^RESULT OK' [save]='"same0":true'
)
L=()
for a in "$@"; do case $a in --full) L+=($QUICK save);; *) L+=($a);; esac; done
[ ${#L[@]} -eq 0 ] && L=($QUICK)
one(){ local n=$1 t0=$SECONDS log=dist/test-logs/$1.log
  if [ -z "${CMD[$n]}" ]; then echo "?    $n (unknown test)"; return 1; fi
  timeout 1200 ${CMD[$n]} > "$log" 2>&1
  local st=FAIL
  if grep -qE "${OK[$n]}" "$log" && ! grep -qE "^Traceback|^EXC|FIRST DIVERGENCE|^ERRS \\['|^ERRS \\[\\] \\['|\"ds\":true" "$log"; then st=PASS; fi
  printf '%-4s %-10s %4ss\n' "$st" "$n" $((SECONDS-t0)); [ $st = PASS ]
}
export -f one 2>/dev/null
FAIL=0
if [ "${J:-1}" -gt 1 ]; then
  for n in "${L[@]}"; do ( one "$n" ) & while [ "$(jobs -rp | wc -l)" -ge "$J" ]; do wait -n || FAIL=1; done; done
  while [ "$(jobs -rp | wc -l)" -gt 0 ]; do wait -n || FAIL=1; done
else
  for n in "${L[@]}"; do one "$n" || FAIL=1; done
fi
[ $FAIL = 0 ] && echo "ALL PASS" || { echo "SOME FAILED: see dist/test-logs/"; exit 1; }
