#!/usr/bin/env bash
# Builds the game from src/ into dist/ (version taken from game/VERSION).
#   bash tools/build.sh          -> dist/naranxia_readable.html + syntax check
#   bash tools/build.sh --dist   -> also dist/naranxia_min.html and dist/naranxia.html (packed: the file that ships as game/naranxia.html)
# The game script is src/game/*.js joined in name order into dist/game.js (00_core.js first).
# GAME_JS=path overrides the joined script (used to preview work in progress, e.g. the restyle patch output).
set -e
cd "$(dirname "$0")/.."
V=$(tr -d '[:space:]v' < game/VERSION)
mkdir -p dist
cat src/game/*.js > dist/game.js
SRC=${GAME_JS:-dist/game.js}
sed -e "s/<title>Naranxia v[0-9]*/<title>Naranxia v$V/" src/shell.html > dist/naranxia_readable.html
sed -e "s/T_('v[0-9][0-9]*'/T_('v$V'/" -e "s/const GVER='v[0-9]*'/const GVER='v$V'/" "$SRC" >> dist/naranxia_readable.html
printf '\n</script></body></html>\n' >> dist/naranxia_readable.html
python3 -c "s=open('dist/naranxia_readable.html').read();open('dist/chk.js','w').write(s[s.index('<script>\n')+9:s.rindex('</script>')])"
node --check dist/chk.js && echo "SYNTAX_OK v$V"
if [ "$1" = "--dist" ]; then node tools/build_dist.mjs; fi
