#!/bin/bash
# Hook: PreToolUse — blocks Write/Edit if governance files contain non-English (Thai) text
# Enforced files: CLAUDE.md, agentic/*.md, .claude/**

INPUT=$(cat)

FILE_PATH=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('file_path',''))" 2>/dev/null || echo "")

# Only enforce on governance files
case "$FILE_PATH" in
  */CLAUDE.md | */agentic/*.md | */.claude/*) ;;
  *) exit 0 ;;
esac

# Extract the content being written (Edit → new_string, Write → content)
CONTENT=$(echo "$INPUT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(d.get('new_string', d.get('content', '')))
" 2>/dev/null || echo "")

# Detect Thai Unicode block (U+0E00–U+0E7F)
THAI=$(echo "$CONTENT" | python3 -c "
import sys, re
text = sys.stdin.read()
matches = re.findall(r'[฀-๿]+', text)
print('\n'.join(matches[:5]))
" 2>/dev/null || echo "")

if [ -n "$THAI" ]; then
  echo ""
  echo "╔══════════════════════════════════════════════════════════╗"
  echo "║     BLOCKED: GOVERNANCE FILES MUST BE ENGLISH ONLY      ║"
  echo "╚══════════════════════════════════════════════════════════╝"
  echo ""
  echo "File: $FILE_PATH"
  echo ""
  echo "Thai characters detected:"
  echo "$THAI" | sed 's/^/  /'
  echo ""
  echo "CLAUDE.md and all files under agentic/ and .claude/ must"
  echo "be written in English only. Rewrite the content in English."
  echo ""
  exit 2
fi

exit 0
