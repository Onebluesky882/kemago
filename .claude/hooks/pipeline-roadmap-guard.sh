#!/bin/bash
# Hook: PreToolUse — blocks git commit if agentic/pipeline.md or agentic/roadmap.md
# were not updated in the staged changes.
#
# pipeline.md  = technical progress log for the conductor
# roadmap.md   = plain-language progress for the client (human-readable)

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

PIPELINE="$ROOT/agentic/PIPELINE.md"
ROADMAP="$ROOT/agentic/ROADMAP.md"

MISSING=""

# Check files exist
[ ! -f "$PIPELINE" ] && MISSING="$MISSING\n  - agentic/PIPELINE.md"
[ ! -f "$ROADMAP"  ] && MISSING="$MISSING\n  - agentic/ROADMAP.md"

if [ -n "$MISSING" ]; then
  echo ""
  echo "╔══════════════════════════════════════════════════════════╗"
  echo "║     BLOCKED: REQUIRED DOCS NOT FOUND                   ║"
  echo "╚══════════════════════════════════════════════════════════╝"
  echo ""
  echo "You must create these files before committing:"
  echo -e "$MISSING"
  echo ""
  echo "  agentic/PIPELINE.md  — technical progress log (for conductor)"
  echo "  agentic/ROADMAP.md   — plain-language progress (for client)"
  echo ""
  echo "See CLAUDE.md section 'Pipeline & Roadmap Docs' for format."
  echo ""
  exit 2
fi

# Check at least one of them is staged in this commit
STAGED=$(git -C "$ROOT" diff --cached --name-only 2>/dev/null)

PIPELINE_STAGED=$(echo "$STAGED" | grep -c "agentic/PIPELINE.md")
ROADMAP_STAGED=$(echo "$STAGED" | grep -c "agentic/ROADMAP.md")

if [ "$PIPELINE_STAGED" -eq 0 ] && [ "$ROADMAP_STAGED" -eq 0 ]; then
  echo ""
  echo "╔══════════════════════════════════════════════════════════╗"
  echo "║     BLOCKED: DOCS NOT UPDATED IN THIS COMMIT            ║"
  echo "╚══════════════════════════════════════════════════════════╝"
  echo ""
  echo "Every commit must update at least one of:"
  echo "  agentic/PIPELINE.md  — what you did technically"
  echo "  agentic/ROADMAP.md   — what the client sees as progress"
  echo ""
  echo "Stage and include the updated file, then commit again."
  echo ""
  exit 2
fi

exit 0
