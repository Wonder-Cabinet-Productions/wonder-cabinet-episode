#!/usr/bin/env bash
# Fails if any image or font in the built theme zip differs from the committed file.
# Guards against gulp 5's UTF-8 default mangling binaries (see the zipper task in gulpfile.js).
#   usage: scripts/check-zip-binaries.sh [dist/wonder-cabinet-episode.zip]
set -euo pipefail
ZIP="${1:-dist/wonder-cabinet-episode.zip}"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
unzip -q "$ZIP" -d "$TMP"

checked=0
bad=0
while IFS= read -r f; do
  [ -f "$TMP/$f" ] || continue   # excluded from the zip on purpose
  checked=$((checked + 1))
  if ! cmp -s "$f" "$TMP/$f"; then
    echo "::error::$f differs in the zip ($(wc -c < "$f") bytes committed, $(wc -c < "$TMP/$f") in zip)"
    bad=$((bad + 1))
  fi
done < <(git ls-files | grep -Ei '\.(png|jpe?g|webp|gif|ico|woff2?|ttf|otf|eot)$')

echo "binary files checked: $checked, corrupted: $bad"
[ "$checked" -gt 0 ] || { echo "::error::no binaries found in $ZIP"; exit 1; }
[ "$bad" -eq 0 ]
