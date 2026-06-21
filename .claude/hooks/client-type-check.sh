#!/bin/bash
# Hook: PreToolUse — blocks Write/Edit if client type has not been identified
# Enforces: Conductor MUST ask "developer or business owner?" before any work

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('file_path',''))" 2>/dev/null || echo "")

# Only enforce for app source files — skip governance and config files
case "$FILE_PATH" in
  */agentic/*)        exit 0 ;;
  */.claude/*)        exit 0 ;;
  */CLAUDE.md)        exit 0 ;;
  */README.md)        exit 0 ;;
  *.toml|*.json|*.yaml|*.yml) exit 0 ;;
  *.sql)              exit 0 ;;
  *.sh)               exit 0 ;;
  *.md)               exit 0 ;;
  *)                  ;;
esac

ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
CLIENT_TYPE_FILE="$ROOT/agentic/CLIENT_TYPE.md"

# Check if CLIENT_TYPE.md exists and has a valid value
if [ ! -f "$CLIENT_TYPE_FILE" ]; then
  echo ""
  echo "╔══════════════════════════════════════════════════════════╗"
  echo "║         BLOCKED: CLIENT TYPE NOT IDENTIFIED              ║"
  echo "╚══════════════════════════════════════════════════════════╝"
  echo ""
  echo "Conductor must identify client type before writing any code."
  echo ""
  echo "Ask the client first:"
  echo "  'คุณเป็นนักพัฒนา (developer) หรือเจ้าของธุรกิจ?'"
  echo "  'Are you a developer or a business owner?'"
  echo ""
  echo "Then create: agentic/CLIENT_TYPE.md"
  echo "  Content: DEVELOPER  or  CLIENT"
  echo ""
  exit 2
fi

CLIENT_TYPE=$(cat "$CLIENT_TYPE_FILE" | tr -d '[:space:]' | tr '[:lower:]' '[:upper:]')

case "$CLIENT_TYPE" in
  DEVELOPER|CLIENT)
    exit 0
    ;;
  *)
    echo ""
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║         BLOCKED: CLIENT_TYPE.md HAS INVALID VALUE       ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo ""
    echo "agentic/CLIENT_TYPE.md must contain exactly: DEVELOPER or CLIENT"
    echo "Current value: '$CLIENT_TYPE'"
    echo ""
    exit 2
    ;;
esac
