# v92 release drafts (nothing here ships by itself)

- `NOTES.md`: draft of `game/NOTES.md`. At release it is copied there; `release.yml` posts it on Discord as an embed
  (`tools/announce.sh v92 game/NOTES.md`) with the 4 screenshots of `announce/img/v92/`. No separate `announce/v92.md` is needed
  (`announce/QUEUE` is only for reposting old versions).
- Before release: confirm every bullet against what is merged (spearman, video guide and quest marker were still in progress
  on 2026-11-11), retake the 4 screenshots with the new looks (the current ones predate units B, buildings B, blocks, mutants),
  check `DRY=1 bash tools/announce.sh v92 docs/release-v92/NOTES.md` (description under 3600 characters).
- Release needs the King's go-ahead after the full test pass.
