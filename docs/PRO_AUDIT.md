# Professional finish audit (2026-11-18)

Scope: what makes the game and the repository look finished rather than improvised. Gameplay was not changed.

## Done

| Area | Finding | Change |
| --- | --- | --- |
| Robustness | `core/frame-loop.js`: a frame that threw stopped the loop for good (frozen game, no message). | The loop always schedules the next frame, logs the first errors, and tells the player once per 20 s that the game goes on (translated, 9 languages). Test `frame_guard`. |
| Repository | README opened with a developer paragraph and a French subtitle. | README opens with what the game is, its features, where to get it. |
| Repository | No changelog. | `CHANGELOG.md` from the 14 GitHub releases; `tools/changelog.py` regenerates it (step 5 of the release routine in CLAUDE.md). |
| Releases | The Discord banner step failed silently on `ubuntu-latest` (Ubuntu 26.04, no Playwright chromium). | Release job pinned to `ubuntu-24.04` (done at v96 follow-up). |
| Performance | `solid()` Map lookup dominated the swarm (#21). | Occupancy byte table, 6000-tick profile 45.6 s to 27.6 s, hashes unchanged. |

## Already in good shape

ESLint and Prettier on every JS file, architecture checker with a ratchet baseline, 44 browser and contract tests with structured results, mutation fault sites, deterministic packed build, issue templates, CI on push and release, contributor and architecture guides.

## Open points for the King (decisions, not done)

- **No LICENSE file.** Needs the King's choice (all rights reserved, or an open licence). Without one, GitHub shows the repo as unlicensed.
- **`docs/` weighs 99 MB (541 tracked files, 471 in `studio-boards`).** Design review boards are build output; they bloat clones. Candidates: move to a release asset or an untracked folder.
- **No in-game About / credits screen** (name, version, licence, links). A small screen on the title menu; needs a design choice (board).
- **Legacy coupling:** 121 import-cycle groups remain (`docs/CLEANUP_AUDIT.md`); each cut needs deterministic evidence. Large modules: `ui/video-guide.js` (2634 lines), `ui/icons.js`, `ai/kingdoms.js`.
- **Not verifiable headless:** real GPU rendering, real touch and gamepad, real PeerJS between two machines.
