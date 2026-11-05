#!/usr/bin/env bash
# Builds the game from src/ into dist/ (version taken from game/VERSION).
#   bash tools/build.sh          -> dist/naranxia_readable.html + syntax check
#   bash tools/build.sh --dist   -> also dist/naranxia_min.html and dist/naranxia.html (packed: the file that ships as game/naranxia.html)
# GAME_JS=path overrides the source script (used to preview work in progress, e.g. the restyle patch output).
set -e
cd "$(dirname "$0")/.."
V=$(tr -d '[:space:]v' < game/VERSION)
SRC=${GAME_JS:-src/game.js}
mkdir -p dist
sed -e "s/<title>Naranxia v[0-9]*/<title>Naranxia v$V/" src/shell.html > dist/naranxia_readable.html
sed -e "s/T_('v[0-9][0-9]*'/T_('v$V'/" -e "s/const GVER='v[0-9]*'/const GVER='v$V'/" "$SRC" >> dist/naranxia_readable.html
printf '\n</script></body></html>\n' >> dist/naranxia_readable.html
python3 -c "s=open('dist/naranxia_readable.html').read();open('dist/chk.js','w').write(s[s.index('<script>\n')+9:s.rindex('</script>')])"
node --check dist/chk.js && echo "SYNTAX_OK v$V"
if [ "$1" = "--dist" ]; then node tools/build_dist.mjs; fi
