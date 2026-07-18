#!/bin/bash
# Hook: PreToolUse — blocks Write/Edit on real app code until the minimum
# client-info questions have been answered (not just CLIENT_TYPE set).
#
# CLIENT_TYPE.md only records DEVELOPER/CLIENT — it says nothing about
# whether QUESTIONS.md / CUSTOMER_SETUP.md were actually answered. This
# hook checks the first identity questions were filled in before any
# code work starts:
#   DEVELOPER -> QUESTIONS.md Q0 (owner email) + Q1 (project name),
#                reflected in agentic/PROJECT.md
#   CLIENT    -> CUSTOMER_SETUP.md Q0 (language) + Q1 (business name)

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); ti=d.get('tool_input') or {}; print(ti.get('file_path','') or d.get('file_path',''))" 2>/dev/null || echo "")

# Only enforce for app source files — skip governance and config files,
# so the conductor can still record answers into these files.
case "$FILE_PATH" in
  */agentic/*)        exit 0 ;;
  */.claude/*)        exit 0 ;;
  */CLAUDE.md)        exit 0 ;;
  */README.md)        exit 0 ;;
  *.toml|*.json|*.yaml|*.yml) exit 0 ;;
  *.sql)              exit 0 ;;
  *.sh)               exit 0 ;;
  *.md)               exit 0 ;;
  "")                 exit 0 ;;
  *)                  ;;
esac

ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
[ -z "$ROOT" ] && exit 0

CLIENT_TYPE_FILE="$ROOT/agentic/CLIENT_TYPE.md"
if [ -f "$CLIENT_TYPE_FILE" ]; then
  CLIENT_TYPE=$(sed 's/<!--[^>]*-->//g' "$CLIENT_TYPE_FILE" | tr -d '[:space:]' | tr '[:lower:]' '[:upper:]')
else
  CLIENT_TYPE=""
fi

# CLIENT_TYPE not yet resolved -> client-type-check.sh already blocks this
case "$CLIENT_TYPE" in
  DEVELOPER|CLIENT) ;;
  *) exit 0 ;;
esac

block() {
  echo ""
  echo "╔══════════════════════════════════════════════════════════╗"
  echo "║     BLOCKED: CLIENT INFO NOT COLLECTED YET              ║"
  echo "╚══════════════════════════════════════════════════════════╝"
  echo ""
  echo "$1"
  echo ""
  exit 2
}

extract_answer_after() {
  # $1 = file, $2 = heading/question line pattern (grep -F literal)
  awk -v pat="$2" '
    index($0, pat) { found=1 }
    found && /^Answer:/ { print; exit }
  ' "$1"
}

if [ "$CLIENT_TYPE" = "DEVELOPER" ]; then
  PROJECT_MD="$ROOT/agentic/PROJECT.md"
  [ ! -f "$PROJECT_MD" ] && exit 0

  NAME_PLACEHOLDER_STILL_THERE=0
  grep -qF "<!-- Replace with your project name -->" "$PROJECT_MD" && NAME_PLACEHOLDER_STILL_THERE=1

  OWNER_EMAIL_LINE=$(grep -E "^owner_email:" "$PROJECT_MD" | head -1)
  OWNER_EMAIL_VALUE=$(echo "$OWNER_EMAIL_LINE" | sed 's/^owner_email:[[:space:]]*//')

  if [ "$NAME_PLACEHOLDER_STILL_THERE" = "1" ] || [ -z "$OWNER_EMAIL_VALUE" ]; then
    block "Before writing app code, ask the developer QUESTIONS.md Q0 (owner email) and Q1 (project name), then record the answers in agentic/PROJECT.md:
  - Project Name section must contain the real name, not the placeholder comment
  - owner_email: must be filled in

See agentic/QUESTIONS.md — Section 0 and Section 1."
  fi
fi

if [ "$CLIENT_TYPE" = "CLIENT" ]; then
  SETUP_MD="$ROOT/agentic/CUSTOMER_SETUP.md"
  [ ! -f "$SETUP_MD" ] && exit 0

  LANG_LINE=$(grep -E "^language:" "$SETUP_MD" | head -1)
  Q1_ANSWER=$(extract_answer_after "$SETUP_MD" "Q1. What is the name of your business or website?")

  if echo "$LANG_LINE" | grep -q "\[TBD\]"; then
    block "Before customizing anything, ask the customer Q0 (language) in agentic/CUSTOMER_SETUP.md and record it in the 'language:' field."
  fi
  if echo "$Q1_ANSWER" | grep -q "\[TBD\]"; then
    block "Before customizing anything, ask the customer Q1 (business/website name) in agentic/CUSTOMER_SETUP.md and record the answer."
  fi
fi

exit 0
