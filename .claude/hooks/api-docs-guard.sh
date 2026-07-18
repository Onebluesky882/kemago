#!/bin/bash
# Hook: PreToolUse — blocks git commit if an apps/api route file (*.route.ts)
# was added/changed without also updating the OpenAPI docs
# (apps/api/src/domains/docs/docs.route.ts).
#
# Domains listed in api-docs-guard.exclude.txt are sensitive/private routes:
# they are exempt from the "must update docs" requirement, and are blocked
# from ever being added into the public OpenAPI spec.

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('command',''))" 2>/dev/null || echo "")

# Only intercept git commit commands
if ! echo "$COMMAND" | grep -qE "git commit"; then
  exit 0
fi

ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
if [ -z "$ROOT" ]; then
  exit 0
fi

DOCS_FILE="apps/api/src/domains/docs/docs.route.ts"
EXCLUDE_FILE="$ROOT/.claude/hooks/api-docs-guard.exclude.txt"

# Load excluded domain names (strip comments/blank lines)
EXCLUDED_DOMAINS=""
if [ -f "$EXCLUDE_FILE" ]; then
  EXCLUDED_DOMAINS=$(grep -vE '^\s*#|^\s*$' "$EXCLUDE_FILE" | tr -d '[:space:]')
fi

STAGED=$(git -C "$ROOT" diff --cached --name-only 2>/dev/null)

# Any *.route.ts under apps/api/src/domains, excluding the docs route itself
ROUTE_CHANGED=$(echo "$STAGED" | grep -E "^apps/api/src/domains/.*\.route\.ts$" | grep -vF "$DOCS_FILE")

# --- Guard 1: excluded domains must never be added to the public docs file ---
if [ -n "$EXCLUDED_DOMAINS" ] && echo "$STAGED" | grep -qF "$DOCS_FILE"; then
  DOCS_DIFF=$(git -C "$ROOT" diff --cached -- "$DOCS_FILE" 2>/dev/null)
  for domain in $EXCLUDED_DOMAINS; do
    if echo "$DOCS_DIFF" | grep -qE "^\+.*['\"/]$domain(['\"/]|$)"; then
      echo ""
      echo "╔══════════════════════════════════════════════════════════╗"
      echo "║     BLOCKED: SENSITIVE DOMAIN ADDED TO PUBLIC DOCS      ║"
      echo "╚══════════════════════════════════════════════════════════╝"
      echo ""
      echo "\"$domain\" is listed in api-docs-guard.exclude.txt as a domain"
      echo "that must never appear in $DOCS_FILE."
      echo ""
      echo "Remove that reference, or ask the client before documenting it"
      echo "and remove \"$domain\" from the exclude list if it's now approved."
      echo ""
      exit 2
    fi
  done
fi

# Strip excluded domains out of the "must document" set
for domain in $EXCLUDED_DOMAINS; do
  ROUTE_CHANGED=$(echo "$ROUTE_CHANGED" | grep -v "^apps/api/src/domains/$domain/")
done

if [ -z "$ROUTE_CHANGED" ]; then
  exit 0
fi

# --- Guard 2: non-excluded route changes must ship with a docs update ---
DOCS_STAGED=$(echo "$STAGED" | grep -cF "$DOCS_FILE")

if [ "$DOCS_STAGED" -eq 0 ]; then
  echo ""
  echo "╔══════════════════════════════════════════════════════════╗"
  echo "║     BLOCKED: API CHANGED WITHOUT DOCUMENTATION          ║"
  echo "╚══════════════════════════════════════════════════════════╝"
  echo ""
  echo "These API route files are staged for commit:"
  echo "$ROUTE_CHANGED" | sed 's/^/  - /'
  echo ""
  echo "But $DOCS_FILE was not updated in this commit."
  echo ""
  echo "Add or update the OpenAPI documentation for the changed endpoint(s)"
  echo "in $DOCS_FILE (rendered at GET /docs), stage it, then commit again."
  echo ""
  echo "If this domain should never be publicly documented (e.g. auth,"
  echo "admin-only, credential handling), add its folder name to"
  echo ".claude/hooks/api-docs-guard.exclude.txt instead."
  echo ""
  exit 2
fi

exit 0
