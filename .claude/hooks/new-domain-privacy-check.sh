#!/bin/bash
# Hook: PreToolUse — when the first *.route.ts file for a brand-new
# apps/api domain is about to be created, blocks once and requires the
# conductor to ask the developer whether that domain should be public
# (documented in docs.route.ts) or private (added to
# api-docs-guard.exclude.txt and never documented).
#
# Established domains (already have a route file on disk) are untouched —
# this only fires on the very first file of a new domain folder.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('file_path',''))" 2>/dev/null || echo "")

case "$FILE_PATH" in
  */apps/api/src/domains/*/*.route.ts) ;;
  *) exit 0 ;;
esac

# Only new files trigger this — editing an existing route file is fine
if [ -f "$FILE_PATH" ]; then
  exit 0
fi

ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
if [ -z "$ROOT" ]; then
  exit 0
fi

DOMAIN=$(echo "$FILE_PATH" | sed -n 's#.*/apps/api/src/domains/\([^/]*\)/.*#\1#p')
[ -z "$DOMAIN" ] && exit 0

# The docs scaffold itself is not a "domain" in this sense
[ "$DOMAIN" = "docs" ] && exit 0

DOMAIN_DIR="$ROOT/apps/api/src/domains/$DOMAIN"

# Domain already has at least one route file -> decision already made before
if [ -d "$DOMAIN_DIR" ] && find "$DOMAIN_DIR" -maxdepth 1 -name "*.route.ts" 2>/dev/null | grep -q .; then
  exit 0
fi

EXCLUDE_FILE="$ROOT/.claude/hooks/api-docs-guard.exclude.txt"
CONFIRMED_FILE="$ROOT/.claude/hooks/api-docs-guard.confirmed-public.txt"

if [ -f "$EXCLUDE_FILE" ] && grep -qxF "$DOMAIN" "$EXCLUDE_FILE"; then
  exit 0
fi
if [ -f "$CONFIRMED_FILE" ] && grep -qxF "$DOMAIN" "$CONFIRMED_FILE"; then
  exit 0
fi

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║     NEW API DOMAIN — PRIVACY DECISION REQUIRED          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "This is the first route file for domain \"$DOMAIN\"."
echo ""
echo "Before creating it, ask the developer:"
echo "  \"Should the '$DOMAIN' API be public in the docs (GET /docs), or"
echo "   private and never documented (e.g. auth internals, admin-only)?\""
echo ""
echo "Then record the answer, and only then retry creating $FILE_PATH:"
echo "  Public  -> echo '$DOMAIN' >> .claude/hooks/api-docs-guard.confirmed-public.txt"
echo "  Private -> echo '$DOMAIN' >> .claude/hooks/api-docs-guard.exclude.txt"
echo ""
exit 2
