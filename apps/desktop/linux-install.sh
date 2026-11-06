#!/bin/sh
# Installs Naranxia for the current user: copies the game to ~/.local/share/naranxia and adds a menu entry.
set -e
D="$HOME/.local/share/naranxia"
SRC="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$D" "$HOME/.local/share/applications" "$HOME/.local/bin"
cp -r "$SRC"/. "$D"/
chmod +x "$D/naranxia"
cat > "$HOME/.local/share/applications/naranxia.desktop" <<EOF
[Desktop Entry]
Name=Naranxia
Comment=The kingdom of King Naraige
Exec="$D/naranxia" %U
Icon=$D/resources/app/icon.png
Terminal=false
Type=Application
Categories=Game;StrategyGame;
EOF
ln -sf "$D/naranxia" "$HOME/.local/bin/naranxia"
echo "Naranxia installed. Launch it from your applications menu, or run: naranxia"
