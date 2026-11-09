#!/usr/bin/env bash
# Posts one version announcement to Discord as an embed, with the screenshots of announce/img/<version>/ attached.
# usage: HOOK=<webhook> bash tools/announce.sh vNN notes.md      (DRY=1 prints the payload summary and posts nothing)
# The webhook comes only from the environment (GitHub secret DISCORD_WEBHOOK); it is never printed.
set -euo pipefail
V="${1:?version, e.g. v92}"; NOTES_FILE="${2:?notes file}"
REPO="${GITHUB_REPOSITORY:-Naraige/naranxia}"
[ -f "$NOTES_FILE" ] || { echo "no notes file $NOTES_FILE"; exit 1; }
# notes without the old bold first line ("**Naranxia vNN is out!**"), the embed title replaces it
NOTES=$(sed '1{/^\*\*Naranxia .*\*\*[[:space:]]*$/d}' "$NOTES_FILE" | sed '1{/^$/d}')
DESC=$(printf '%s\n\n**Play now:** the game updates itself at next launch.\n[Release notes](https://github.com/%s/releases/tag/%s)' "${NOTES:0:3600}" "$REPO" "$V")
URL="https://github.com/$REPO/releases/tag/$V"
IMGS=(); if [ -d "announce/img/$V" ]; then while IFS= read -r f; do IMGS+=("$f"); done < <(ls announce/img/"$V"/*.png 2>/dev/null | sort | head -4); fi
EMB=$(jq -n --arg t "Naranxia $V is out!" --arg d "$DESC" --arg u "$URL" --arg f "Hammerdawn Studio · $V" --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  '{title:$t,description:$d,url:$u,color:12865562,footer:{text:$f},timestamp:$ts}')
if [ ${#IMGS[@]} -gt 0 ]; then
  # same url on every embed makes Discord show the screenshots as one gallery under the first embed
  EMBEDS=$(jq -n --argjson e "$EMB" --arg u "$URL" --args '
    [ ($e + {image:{url:("attachment://"+$ARGS.positional[0])}}) ]
    + [ $ARGS.positional[1:][] | {url:$u, image:{url:("attachment://"+.)}} ]' $(for f in "${IMGS[@]}"; do basename "$f"; done))
else
  EMBEDS=$(jq -n --argjson e "$EMB" '[$e]')
fi
PAYLOAD=$(jq -n --argjson e "$EMBEDS" '{username:"Naranxia",allowed_mentions:{parse:[]},embeds:$e}')
if [ "${DRY:-0}" = 1 ]; then echo "$PAYLOAD" | jq -c '{embeds:[.embeds[]|{title,desc_len:(.description|length),image:.image.url}],images:'"${#IMGS[@]}"'}'; exit 0; fi
[ -n "${HOOK:-}" ] || { echo "DISCORD_WEBHOOK secret is not set"; exit 1; }
if [ ${#IMGS[@]} -gt 0 ]; then
  ARGS=(-F "payload_json=$PAYLOAD"); i=0
  for f in "${IMGS[@]}"; do ARGS+=(-F "files[$i]=@$f;filename=$(basename "$f")"); i=$((i+1)); done
  curl -fsS -o /dev/null "${ARGS[@]}" "$HOOK"
else
  curl -fsS -o /dev/null -H 'Content-Type: application/json' -d "$PAYLOAD" "$HOOK"
fi
echo "announced $V (${#IMGS[@]} images)"
