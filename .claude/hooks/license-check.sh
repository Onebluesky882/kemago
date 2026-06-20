#!/bin/bash
# Hook: PreToolUse — blocks Write/Edit if license_status is not active
# Exempt: governance files, PROJECT.md itself, .claude/*, .gitkeep

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('file_path',''))" 2>/dev/null || echo "")

# Exempt paths — Dev authority files and meta files
case "$FILE_PATH" in
  */agentic/PROJECT.md)       exit 0 ;;
  */agentic/GOVERNANCE_CORE.md) exit 0 ;;
  */agentic/DEV.md)           exit 0 ;;
  */agentic/DEV_LOG.md)       exit 0 ;;
  */.claude/*)                exit 0 ;;
  *.gitkeep)                  exit 0 ;;
  *.example)                  exit 0 ;;
esac

# Check license_status: active in PROJECT.md
ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
PROJECT_MD="$ROOT/agentic/PROJECT.md"

if ! grep -q "license_status: active" "$PROJECT_MD" 2>/dev/null; then
  echo ""
  echo "╔══════════════════════════════════════════════════╗"
  echo "║         BLOCKED: LICENSE_NOT_ACTIVE              ║"
  echo "╚══════════════════════════════════════════════════╝"
  echo ""
  echo "File: $FILE_PATH"
  echo "Fix: Set 'license_status: active' in agentic/PROJECT.md"
  echo ""
  exit 2
fi

exit 0
