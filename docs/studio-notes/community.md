# community (hd-community): drafts for v92, nothing published

All texts below are DRAFTS. Nothing goes out without the King's go-ahead.

## 0. Source and caveats for the lead

- Sources: `docs/JOURNAL.md` and `git log` of branch `release-v84` (head 3eebeb3). The v92 entries are NOT on `origin/main` or on this worktree's branch, and `docs/STUDIO_AGENT_GUIDE.md` exists only on `release-v84` too (I read it there). `game/VERSION` is still v91 and `announce/` has no v92 text.
- Journal says v92 is "not released" and several parts are untested or unverified. Draft claims are limited to what the journal marks as done. To confirm before shipping:
  - Boss abilities: commit 8f7d1db says "untested"; commit 544a62b fixes the test. Re-run `bossabil`.
  - Rebel envoy: two journal lines disagree (world camps disabled so no envoy, versus envoy done with tribute from rebel bases). Check it is reachable in play; if not, drop the envoy mentions below.
  - Ruins: loot works; the 3 looks were kept per commit 4583cac (tower stump), King's final answer to confirm.
  - Public lobby: needs a player online to act as hub; real PeerJS cloud not verified.
  - Not run after the last changes: `fitcheck`, `save` after envoy, touch devices, gamepad.
  - Languages: EN/FR/ES/DE/IT/PT plus NL/PL/TR. RU/UK/JA/ZH/KO/AR are NOT done; do not mention them.
  - Launch intro "Made with Claude" Lottie: the journal says "Check Anthropic brand terms before shipping".
  - Price ("free"), "no ads", desktop save folder and platform list are not stated in the journal: the King must confirm before any public text uses them.

## 1. Draft `game/NOTES.md` (8 bullets, English, players)

```
- New look: glass-style buttons and frames, the Inter font, cooler daylight, a new launch intro and a redesigned title screen that shows the season and weather of your last game. Text now fits inside every button, in every language.
- Wave events: a wolf pack (wave 7, then every 9th) and an eclipse (wave 8, then every 11th), plus rebel envoys and meteor showers. Each one brings a danger or a reward.
- Bosses with powers: the named wave bosses (Hollow Warden, Bell-Bearer, Frost King, Hive Queen) each have an ability: regrowth, summoned husks, a chilling aura, or a runner brood.
- Ancient ruins to explore: send a unit near one for one-time loot. They show on the minimap and come in three looks.
- New buildings and units: observatory, granary, alarm bell, sanctuary, watch beacon, orchard, royal forge, embassy, war room and sappers' workshop; scout, engineer and rebel envoy.
- Public games lobby (peer to peer), a Continue button, Records, a Chronicle page whose lore unlocks as you reach higher waves, and Dutch, Polish and Turkish.
- Comfort: Reduce motion option, F1 opens the controls help, autosave every 3 minutes, pause when the window is away, right-click a queued unit to cancel it with a full refund, and a confirmation before deleting a save.
- Saves from older versions keep loading after updates.
```

(8 bullets is the maximum. If the envoy or the lobby fail verification, delete that part.)

## 2. Discord announcement drafts

### FR (draft, enthousiaste, court)

```
**Naranxia v92 : un nouveau look et un bastion bien plus vivant** :crossed_swords:

:sparkles: boutons et cadres en verre, nouvelle intro
:wolf: loups et éclipse pendant les vagues
:crown: des boss nommés avec de vrais pouvoirs
:european_castle: des ruines à explorer pour piller leur trésor
:hammer_and_wrench: de nouveaux bâtiments et unités (éclaireur, ingénieur, émissaire rebelle)
:globe_with_meridians: un lobby de parties publiques, et le néerlandais, le polonais et le turc
:floppy_disk: vos anciennes sauvegardes continuent de fonctionner

Dites-nous sur quelle vague vous tombez ! Un bug ? Touche F8 dans le jeu.
```

### EN (draft)

```
**Naranxia v92: a new look and a much livelier bastion** :crossed_swords:

:sparkles: glass buttons and frames, a new intro
:wolf: wolf packs and eclipses during waves
:crown: named bosses with real powers
:european_castle: ruins to explore and loot
:hammer_and_wrench: new buildings and units (scout, engineer, rebel envoy)
:globe_with_meridians: a public games lobby, plus Dutch, Polish and Turkish
:floppy_disk: your older saves keep working

Tell us which wave got you! Found a bug? Press F8 in game.
```

Rules for the lead: webhook stays in the GitHub secret; no download links (as in earlier announcements); post only via `announce/vNN.md` once the King approves. No mention of unfinished content (other languages, Iron age look, online leaderboard).

## 3. Short presentation page (Reddit / launch sites), draft

**Title:** Naranxia: a browser tower defence and strategy game with two-player co-op, made by a small clan

**Body:**

Naranxia is a browser strategy and tower defence game. You are King Naraige, defending the last bastion of humanity against a horde, solo or in two-player co-op.

- Build walls, towers, traps and an economy, train troops, research upgrades
- Seasons and weather, named bosses with powers, wolf packs, eclipses, ruins to loot
- Peer-to-peer co-op for two, with a public games lobby, pings and shared goals
- 9 languages: English, French, Spanish, German, Italian, Portuguese, Dutch, Polish, Turkish
- Plays in the browser, with a desktop launcher (platforms and price: King to confirm)
- Minecraft-inspired pixel look

Disclosure: I am part of the team that makes Naranxia (Hammerdawn Studio, the Naranxia clan). The game is developed with AI assistance (Claude by Anthropic). Feedback and bug reports are welcome.

Link: (to fill: only the official page the King approves)

### Checks before publishing (the lead and the King, not me)

1. Affiliation disclosure: say clearly, in the post itself and not only in a comment, that we make the game. Reddit self-promotion norms and most subreddit rules require it.
2. Read each subreddit's rules first (self-promotion ratio, designated showcase days, flair, no referral links). Do not blast the same text to many subs at once.
3. No fake reviews, no sock puppets, no clan members posting as neutral players, no asking for upvotes. Real players may comment on their own.
4. AI disclosure: state that the game is made with AI help. Check Anthropic's brand terms before showing the "Made with Claude" card or logo in any trailer or screenshot.
5. Only claim what is released: re-check each line against the final `game/NOTES.md`. No screenshots of unfinished features or wip restyle.
6. Do not claim "free", "no ads" or platform support without the King confirming. No player counts or ratings.
7. Say "Minecraft-inspired", never imply affiliation with Mojang or Microsoft. Same for Hytale (the clan name is fine, no official link implied).
8. Privacy: the public lobby only shares game code, host name and version. Say so if asked.

## 4. FAQ (6 questions, draft)

**1. Will my old saves still work after the update?**
Yes. Saves are never rejected because of their version: older ones are upgraded when loaded, and a save from a newer version loads as far as the game understands it. Solo autosave runs every 3 minutes (slot "Autosave"). Deleting a save asks "Sure?" first.

**2. Where are my saves stored?**
In the browser version, in your browser's storage (clearing site data erases them). The desktop launcher has its own save storage on your computer. (Lead: confirm the exact folder before publishing.)

**3. How does co-op work, and do I need a server?**
Two players, peer to peer: one hosts and shares a room code, the other joins. There is no server of ours. Both machines run the same game and it resynchronises itself if they drift. You can list your game in the public lobby or keep it private with the code only.

**4. Which languages are available?**
English, French, Spanish, German, Italian, Portuguese, Dutch, Polish and Turkish. The game picks your browser language on first launch and you can change it anytime. No other language is announced yet.

**5. What are the main controls?**
Press F1 in game for the controls help. In co-op, Alt+click pings (+Shift defend, +Ctrl gather, +Shift+Ctrl attack). F2 opens the troops panel, `<` and `>` trigger the King's skills (rebindable in Options), right-click a queued unit to cancel it with a refund. Touch: pinch to zoom, two fingers to move, tap the ground to order.

**6. The game feels shaky or slow, or I found a bug. What do I do?**
Turn on Reduce motion in Settings > Game (no camera shake, calmer weather, no intro). To report a bug press F8: it copies a short report you can paste to us on Discord. Test mode (F10) is solo only and disables achievements and best score.
