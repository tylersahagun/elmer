#!/bin/bash
#
# PM Workspace Automation Setup
# This script sets up launchd agents for scheduled automation on macOS
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"

echo "=================================="
echo "PM Workspace Automation Setup"
echo "=================================="
echo ""
echo "Script directory: $SCRIPT_DIR"
echo "Workspace root: $WORKSPACE_ROOT"
echo ""

# Create LaunchAgents directory if it doesn't exist
mkdir -p "$LAUNCH_AGENTS_DIR"

# ============================================
# Daily Health Check (9am weekdays)
# ============================================

DAILY_PLIST="$LAUNCH_AGENTS_DIR/com.pmworkspace.daily-health.plist"

cat > "$DAILY_PLIST" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.pmworkspace.daily-health</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>$SCRIPT_DIR/daily-health.py</string>
        <string>--refresh</string>
        <string>--slack</string>
    </array>
    
    <key>StartCalendarInterval</key>
    <array>
        <!-- Monday through Friday at 9:00 AM -->
        <dict>
            <key>Weekday</key><integer>1</integer>
            <key>Hour</key><integer>9</integer>
            <key>Minute</key><integer>0</integer>
        </dict>
        <dict>
            <key>Weekday</key><integer>2</integer>
            <key>Hour</key><integer>9</integer>
            <key>Minute</key><integer>0</integer>
        </dict>
        <dict>
            <key>Weekday</key><integer>3</integer>
            <key>Hour</key><integer>9</integer>
            <key>Minute</key><integer>0</integer>
        </dict>
        <dict>
            <key>Weekday</key><integer>4</integer>
            <key>Hour</key><integer>9</integer>
            <key>Minute</key><integer>0</integer>
        </dict>
        <dict>
            <key>Weekday</key><integer>5</integer>
            <key>Hour</key><integer>9</integer>
            <key>Minute</key><integer>0</integer>
        </dict>
    </array>
    
    <key>EnvironmentVariables</key>
    <dict>
        <key>PM_SLACK_WEBHOOK</key>
        <string>\${PM_SLACK_WEBHOOK}</string>
    </dict>
    
    <key>StandardOutPath</key>
    <string>$WORKSPACE_ROOT/maintenance/logs/daily-health.log</string>
    
    <key>StandardErrorPath</key>
    <string>$WORKSPACE_ROOT/maintenance/logs/daily-health.error.log</string>
    
    <key>WorkingDirectory</key>
    <string>$WORKSPACE_ROOT</string>
</dict>
</plist>
EOF

echo "✅ Created daily health check plist"

# ============================================
# Weekly Recap (Monday 8:30am)
# ============================================

WEEKLY_PLIST="$LAUNCH_AGENTS_DIR/com.pmworkspace.weekly-recap.plist"

cat > "$WEEKLY_PLIST" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.pmworkspace.weekly-recap</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>$SCRIPT_DIR/weekly-recap.py</string>
        <string>--slack</string>
    </array>
    
    <key>StartCalendarInterval</key>
    <dict>
        <!-- Monday at 8:30 AM -->
        <key>Weekday</key><integer>1</integer>
        <key>Hour</key><integer>8</integer>
        <key>Minute</key><integer>30</integer>
    </dict>
    
    <key>EnvironmentVariables</key>
    <dict>
        <key>PM_SLACK_WEBHOOK</key>
        <string>\${PM_SLACK_WEBHOOK}</string>
    </dict>
    
    <key>StandardOutPath</key>
    <string>$WORKSPACE_ROOT/maintenance/logs/weekly-recap.log</string>
    
    <key>StandardErrorPath</key>
    <string>$WORKSPACE_ROOT/maintenance/logs/weekly-recap.error.log</string>
    
    <key>WorkingDirectory</key>
    <string>$WORKSPACE_ROOT</string>
</dict>
</plist>
EOF

echo "✅ Created weekly recap plist"

# ============================================
# Roadmap Snapshot (Daily at midnight)
# ============================================

SNAPSHOT_PLIST="$LAUNCH_AGENTS_DIR/com.pmworkspace.roadmap-snapshot.plist"

cat > "$SNAPSHOT_PLIST" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.pmworkspace.roadmap-snapshot</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>$WORKSPACE_ROOT/scripts/generate-roadmap.py</string>
    </array>
    
    <key>StartCalendarInterval</key>
    <dict>
        <!-- Daily at midnight -->
        <key>Hour</key><integer>0</integer>
        <key>Minute</key><integer>0</integer>
    </dict>
    
    <key>StandardOutPath</key>
    <string>$WORKSPACE_ROOT/maintenance/logs/roadmap-snapshot.log</string>
    
    <key>StandardErrorPath</key>
    <string>$WORKSPACE_ROOT/maintenance/logs/roadmap-snapshot.error.log</string>
    
    <key>WorkingDirectory</key>
    <string>$WORKSPACE_ROOT</string>
</dict>
</plist>
EOF

echo "✅ Created roadmap snapshot plist"

# Create logs directory
mkdir -p "$WORKSPACE_ROOT/maintenance/logs"
echo "✅ Created logs directory"

echo ""
echo "=================================="
echo "Setup Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Set your Slack webhook URL:"
echo "   export PM_SLACK_WEBHOOK='https://hooks.slack.com/services/YOUR/WEBHOOK/URL'"
echo ""
echo "2. Add to your shell profile (~/.zshrc or ~/.bashrc):"
echo "   echo 'export PM_SLACK_WEBHOOK=\"your-webhook-url\"' >> ~/.zshrc"
echo ""
echo "3. Load the launch agents:"
echo "   launchctl load $DAILY_PLIST"
echo "   launchctl load $WEEKLY_PLIST"
echo "   launchctl load $SNAPSHOT_PLIST"
echo ""
echo "4. To test immediately:"
echo "   python3 $SCRIPT_DIR/daily-health.py --refresh"
echo "   python3 $SCRIPT_DIR/weekly-recap.py"
echo ""
echo "5. To unload agents later:"
echo "   launchctl unload $DAILY_PLIST"
echo "   launchctl unload $WEEKLY_PLIST"
echo "   launchctl unload $SNAPSHOT_PLIST"
echo ""
