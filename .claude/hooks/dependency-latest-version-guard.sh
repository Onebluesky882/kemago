#!/bin/bash
# Hook: PreToolUse — blocks installing/pinning a dependency to anything
# older than npm's "latest" dist-tag.
# Covers two entry points:
#   1) Bash: npm install / npm i / npm add / pnpm add / pnpm install / yarn add
#      with an explicit "@<version>" that isn't latest.
#   2) Write|Edit on any package.json: a dependency line pinned to a
#      version/range whose resolved number isn't npm's latest.
#
# Network-dependent (npm view). If the registry can't be reached, the
# check is skipped (fail-open) rather than blocking on flaky network.

INPUT=$(cat)

strip_range() {
  # ^1.2.3 / ~1.2.3 / >=1.2.3 / 1.2.3 -> 1.2.3
  echo "$1" | sed -E 's/^[\^~>=< ]+//'
}

is_skippable_version() {
  case "$1" in
    ""|latest|workspace:*|file:*|link:*|git+*|http*|*"/"*) return 0 ;;
    *) return 1 ;;
  esac
}

check_pkg_version() {
  local pkg="$1" spec="$2"
  is_skippable_version "$spec" && return 0

  local pinned latest
  pinned=$(strip_range "$spec")
  latest=$(npm view "$pkg" version 2>/dev/null)
  [ -z "$latest" ] && return 0   # registry unreachable / unknown pkg — fail open

  if [ "$pinned" != "$latest" ]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║     BLOCKED: DEPENDENCY NOT PINNED TO LATEST            ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo ""
    echo "Package: $pkg"
    echo "  Requested: $spec"
    echo "  Latest on npm: $latest"
    echo ""
    echo "Install/pin the latest version instead, e.g.:"
    echo "  pnpm add $pkg@$latest"
    echo "  \"$pkg\": \"^$latest\"   // in package.json"
    echo ""
    echo "If an older version is intentional (compatibility constraint),"
    echo "ask the developer to confirm before pinning it."
    echo ""
    return 1
  fi
  return 0
}

COMMAND=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); ti=d.get('tool_input') or {}; print(ti.get('command','') or d.get('command',''))" 2>/dev/null || echo "")

if [ -n "$COMMAND" ]; then
  case "$COMMAND" in
    *"npm install"*|*"npm i "*|*"npm add"*|*"pnpm add"*|*"pnpm install"*|*"yarn add"*) ;;
    *) exit 0 ;;
  esac

  BLOCKED=0
  for TOKEN in $COMMAND; do
    case "$TOKEN" in
      -*) continue ;;
    esac
    # scoped pkg: @scope/name@version ; plain: name@version
    if [[ "$TOKEN" == @*@* ]]; then
      PKG="@${TOKEN#@}"; PKG="${PKG%@*}"
      SPEC="${TOKEN##*@}"
    elif [[ "$TOKEN" == *@* ]]; then
      PKG="${TOKEN%@*}"
      SPEC="${TOKEN##*@}"
    else
      continue
    fi
    [ -z "$PKG" ] && continue
    if ! check_pkg_version "$PKG" "$SPEC"; then
      BLOCKED=1
    fi
  done

  [ "$BLOCKED" = "1" ] && exit 2
  exit 0
fi

FILE_PATH=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); ti=d.get('tool_input') or {}; print(ti.get('file_path','') or d.get('file_path',''))" 2>/dev/null || echo "")
case "$FILE_PATH" in
  */package.json) ;;
  *) exit 0 ;;
esac

CONTENT=$(echo "$INPUT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
ti=d.get('tool_input') or {}; print(ti.get('content') or ti.get('new_string') or d.get('content') or d.get('new_string') or '')
" 2>/dev/null || echo "")

[ -z "$CONTENT" ] && exit 0

BLOCKED=0
while IFS= read -r LINE; do
  PKG=$(echo "$LINE" | sed -n 's/^[[:space:]]*"\(@\?[^"]*\)"[[:space:]]*:[[:space:]]*"[^"]*"[[:space:]]*,\?[[:space:]]*$/\1/p')
  SPEC=$(echo "$LINE" | sed -n 's/^[[:space:]]*"[^"]*"[[:space:]]*:[[:space:]]*"\([^"]*\)"[[:space:]]*,\?[[:space:]]*$/\1/p')
  [ -z "$PKG" ] && continue
  case "$PKG" in
    name|version|main|private|scripts|dependencies|devDependencies|peerDependencies) continue ;;
  esac
  if ! check_pkg_version "$PKG" "$SPEC"; then
    BLOCKED=1
  fi
done <<< "$CONTENT"

[ "$BLOCKED" = "1" ] && exit 2
exit 0
