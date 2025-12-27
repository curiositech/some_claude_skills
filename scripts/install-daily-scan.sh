#!/bin/bash
# Install the daily skill scanner as a launchd service

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLIST_NAME="com.claudeskills.scan.plist"
PLIST_SOURCE="$SCRIPT_DIR/$PLIST_NAME"
PLIST_DEST="$HOME/Library/LaunchAgents/$PLIST_NAME"

echo "🔧 Installing Claude Skills Daily Scanner"
echo ""

# Create LaunchAgents directory if needed
mkdir -p "$HOME/Library/LaunchAgents"

# Unload existing service if present
if launchctl list | grep -q "com.claudeskills.scan"; then
    echo "📦 Unloading existing service..."
    launchctl unload "$PLIST_DEST" 2>/dev/null || true
fi

# Copy plist
echo "📋 Copying plist to $PLIST_DEST"
cp "$PLIST_SOURCE" "$PLIST_DEST"

# Load service
echo "🚀 Loading service..."
launchctl load "$PLIST_DEST"

echo ""
echo "✅ Daily skill scanner installed!"
echo ""
echo "📅 Schedule: Daily at 9:00 AM"
echo "📁 Scans: ~/coding/"
echo "📝 Logs: $SCRIPT_DIR/../logs/"
echo ""
echo "Commands:"
echo "  Run now:    launchctl start com.claudeskills.scan"
echo "  Check:      launchctl list | grep claudeskills"
echo "  Uninstall:  launchctl unload $PLIST_DEST && rm $PLIST_DEST"
echo "  Dry run:    python3 $SCRIPT_DIR/scan-and-ingest-skills.py --dry-run"
echo ""
