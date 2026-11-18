# Privacy

Naranxia has no account, no analytics and no server of its own.

- **Saves, settings and records** stay on your device (browser storage, or the launcher's save folder). Nothing is uploaded.
- **Bug reports** (F8) are built on your device. Nothing is sent unless you choose to share the file yourself.
- **Co-op** is peer to peer (WebRTC through PeerJS). To connect, the free public PeerJS broker sees the connection set-up, and your partner's browser can see your network address, as in any direct connection. Only game commands and a state checksum are exchanged during a game.
- **Public lobby:** the list of open games is kept by the players themselves (one browser acts as the hub). It holds only the room code, the host's kingdom name and the game version, for as long as the game is listed.
- **Third-party loads:** the game fetches Three.js from cdnjs, PeerJS from jsDelivr (co-op only) and fonts from Google Fonts when it runs in a browser. Those services see the usual request data (address, browser). The desktop launcher also asks GitHub for the latest release at start.

Questions: open an issue at https://github.com/Naraige/naranxia/issues.
