#!/usr/bin/env bash
# Before/after screenshots of the same pages: a baseline built from a git ref vs the tree under test, each in its
# own container stack, same repository id, viewport and theme on both sides. Per shot: before/after/diff PNG and
# the ImageMagick AE pixel count; one self-contained HTML page (swipe slider, side by side, values table).
# Usage: compare.sh --run-id ID [options] (route | name=route)...
#        compare.sh --run-id ID [options] --steps FILE.cjs
#   compare.sh --run-id cmp-1700 --repo s import graphs          # origin/master vs the current checkout
#   compare.sh --run-id cmp-1700 --tree ../wt --no-build --theme dark sparql=sparql-new
#   --ref REF        baseline commit (default origin/master; fetched first when it starts with origin/)
#   --tree PATH      tree under test (default: git toplevel of $PWD); built by container.sh unless --no-build
#   --no-build       serve the tree under test's existing dist/
#   --base-dep NAME=SRC   baseline only: replace node_modules/NAME (every package that has it) with SRC, a package
#                    dir or an `npm pack` .tgz, before building. A/B of a dependency: --ref <same commit as the tree>.
#                    The SBOM step then fails (npm ls "invalid"): WARN only, the built dist/ is used.
#   --repo SUFFIX    create repository verify-<ID>-SUFFIX on both stacks and select it before every page load
#   --viewport WxH   default 1440x900     --theme light|dark     --settle MS (default 1500)   --full-page
#   --mark SELECTOR  red box around every visible match in every shot (annotated screenshot)
#   --steps FILE.cjs one flow run on both sides instead of routes; FILE exports
#                    async ({page, go, shot, mark}) => { await go('import'); await shot('import', {mark: '#x'}); }
#   --fuzz PCT       colour tolerance for the AE count (default 2%)
#   --keep           leave both stacks up (run ids ID-before, ID-after; clean them with cleanup.sh --run-id)
# Baseline worktree: ~/.cache/verify-workbench/baseline/<sha12>[-dep], detached, installed (npm run install:local)
# and built once per commit, reused afterwards; the tree under test is never touched. Remove a cached baseline:
#   git -C <any checkout> worktree remove --force ~/.cache/verify-workbench/baseline/<dir>
# Both stacks run the GraphDB version of the tree under test (.env), so only the workbench differs.
# Output: <evidence root>/<ID>/compare/{before,after,diff}/<name>.png, results.tsv, index.html (path printed last).
# Exit 0 = compared (differences are data, not failure), 2 = a shot failed, other = setup failure (as container.sh).
set -euo pipefail
source "$(dirname "$0")/env.sh"
S="$(cd "$(dirname "$0")" && pwd)"

RUN_ID=""; REF=origin/master; TREE=""; NO_BUILD=(); DEPS=(); REPO=""; FUZZ=2%; KEEP=0; SHOOT=(); SPECS=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --run-id) RUN_ID="$2"; shift 2 ;;
    --ref) REF="$2"; shift 2 ;;
    --tree) TREE="$2"; shift 2 ;;
    --no-build) NO_BUILD=(--no-build); shift ;;
    --base-dep) DEPS+=("$2"); shift 2 ;;
    --repo) REPO="$2"; shift 2 ;;
    --fuzz) FUZZ="$2"; shift 2 ;;
    --keep) KEEP=1; shift ;;
    --viewport|--theme|--settle|--mark) SHOOT+=("$1" "$2"); shift 2 ;;
    --steps) SHOOT+=(--steps "$(realpath "$2")"); shift 2 ;;
    --full-page) SHOOT+=(--full-page); shift ;;
    -*) echo "unknown arg $1" >&2; exit 64 ;;
    *) SPECS+=("$1"); shift ;;
  esac
done
[[ -n "$RUN_ID" ]] || { echo "--run-id is required" >&2; exit 64; }
[[ ${#SPECS[@]} -gt 0 || " ${SHOOT[*]} " == *" --steps "* ]] || { echo "name at least one route, or --steps FILE" >&2; exit 64; }
command -v compare >/dev/null || { echo "FAIL: ImageMagick 'compare' not on PATH" >&2; exit 127; }
export PW_CORE="$(npm root -g)/@playwright/cli/node_modules/playwright-core"
[[ -d "$PW_CORE" ]] || { echo "playwright-core not found under the global @playwright/cli: npm i -g @playwright/cli" >&2; exit 127; }
export PW_CHROME="${PW_CHROME:-$(command -v google-chrome || command -v chromium)}"

TREE="$(cd "${TREE:-$PWD}" && git rev-parse --show-toplevel)"
[[ -f "$TREE/webpack.config.prod.js" ]] || { echo "FAIL: $TREE is not a graphdb-workbench checkout" >&2; exit 66; }
export VERIFY_WB_GDB_VERSION="${VERIFY_WB_GDB_VERSION:-$(sed -n 's/^GDB_VERSION=//p' "$TREE/.env" | tr -d '[:space:]')}"

# ---- baseline worktree -------------------------------------------------------------------------------------------
if [[ "$REF" == origin/* ]]; then
  git -C "$TREE" fetch -q origin "${REF#origin/}" || echo "WARN  fetch of $REF failed, using the local ref"
fi
SHA="$(git -C "$TREE" rev-parse --verify "$REF^{commit}")" || { echo "FAIL: unknown ref $REF" >&2; exit 66; }
BASE_ROOT="$HOME/.cache/verify-workbench/baseline"
BASE="$BASE_ROOT/${SHA:0:12}"; [[ ${#DEPS[@]} -gt 0 ]] && BASE+="-dep"
mkdir -p "$BASE_ROOT"
OUT="$EVIDENCE_ROOT/$RUN_ID/compare"
rm -rf "$OUT"; mkdir -p "$OUT"/{before,after,diff}
LOG="$OUT/baseline-build.log"
echo "baseline $REF = ${SHA:0:12} in $BASE (log: $LOG)"
{
  flock 7   # one build per baseline dir, parallel compares wait
  if [[ ! -d "$BASE/.git" && ! -f "$BASE/.git" ]]; then
    git -C "$TREE" worktree add -q --detach "$BASE" "$SHA"
  fi
  [[ "$(git -C "$BASE" rev-parse HEAD)" == "$SHA" ]] || { echo "FAIL: $BASE is not at $SHA - remove it (see --help)" >&2; exit 66; }
  want_deps="${DEPS[*]:-}"
  if [[ -f "$BASE/.verify-built" && -z "$want_deps" ]]; then
    echo "reusing built baseline"
  else
    # A dependency override that differs from the last one: start from a clean install.
    if [[ -n "$want_deps" && "$(cat "$BASE/.verify-deps" 2>/dev/null)" != "$want_deps" && -f "$BASE/.verify-deps" ]]; then
      rm -rf "$BASE"/node_modules "$BASE"/packages/*/node_modules
    fi
    if [[ ! -d "$BASE/packages/workbench/node_modules" ]]; then
      echo "installing baseline dependencies (npm run install:local) ..."
      (cd "$BASE" && npm run install:local) >>"$LOG" 2>&1 || { echo "FAIL: install:local, see $LOG" >&2; tail -n 20 "$LOG" >&2; exit 5; }
    fi
    for dep in "${DEPS[@]}"; do
      name="${dep%%=*}"; src="$(realpath "${dep#*=}")"
      tmp=""
      if [[ -f "$src" ]]; then   # npm pack tarball: contents under package/
        tmp="$(mktemp -d)"; tar -xzf "$src" -C "$tmp"; src="$tmp/package"
      fi
      [[ -f "$src/package.json" ]] || { echo "FAIL: $src is not a package (no package.json)" >&2; exit 66; }
      targets="$(find "$BASE/node_modules/$name" "$BASE"/packages/*/node_modules/"$name" -maxdepth 0 -type d 2>/dev/null || true)"
      [[ -n "$targets" ]] || { echo "FAIL: no node_modules/$name in the baseline" >&2; exit 66; }
      for t in $targets; do rsync -a --delete "$src/" "$t/"; echo "override $name <- ${dep#*=} ($(jq -r .version "$src/package.json")) in ${t#"$BASE"/}"; done
      [[ "$src" == */package && -n "${tmp:-}" ]] && rm -rf "$tmp"; tmp=""
    done
    printf '%s' "$want_deps" > "$BASE/.verify-deps"
    echo "building baseline (npm run build) ..."
    s=$SECONDS
    touch "$BASE/.verify-build-start"
    if ! (cd "$BASE" && npm run build) >>"$LOG" 2>&1; then
      # The SBOM step runs after dist/ is complete and fails on an overridden (npm-ls "invalid") dependency.
      if tail -n 80 "$LOG" | grep -q 'build-sbom' && [[ "$BASE/dist/index.html" -nt "$BASE/.verify-build-start" ]]; then
        echo "WARN  baseline SBOM step failed after dist/ was built (expected with --base-dep); using dist/"
      else
        echo "FAIL: baseline build, see $LOG" >&2; tail -n 20 "$LOG" >&2; exit 5
      fi
    fi
    echo "baseline built in $((SECONDS - s))s"
    [[ -z "$want_deps" ]] && touch "$BASE/.verify-built"
  fi
} 7>"$BASE_ROOT/${BASE##*/}.lock"

# ---- stacks ------------------------------------------------------------------------------------------------------
RB="$RUN_ID-before"; RA="$RUN_ID-after"
finish() {
  [[ $KEEP -eq 1 ]] && { echo "kept: run ids $RB, $RA"; return; }
  "$S/cleanup.sh" --run-id "$RB" --run-id "$RA" >/dev/null 2>&1 || echo "WARN  cleanup failed: cleanup.sh --run-id $RB --run-id $RA"
}
# Parallel runs (other agents) can grab the chosen port between check and bind: retry `up` once.
up() { "$S/container.sh" up "$@" || { echo "retrying container.sh up $*"; sleep 3; "$S/container.sh" up "$@"; }; }
trap finish EXIT
up --run-id "$RB" --tree "$BASE" --no-build 2>&1 | sed 's/^/[before] /'
up --run-id "$RA" --tree "$TREE" "${NO_BUILD[@]}" 2>&1 | sed 's/^/[after]  /'

# Same repository id on both sides: the header shows it, so per-run ids would differ in every shot.
TEMPLATE="$TREE/e2e-tests/fixtures/repo-template.json"
REPO_ID=""
if [[ -n "$REPO" ]]; then
  REPO_ID="verify-$RUN_ID-$REPO"
  body="$(jq -c --arg id "$REPO_ID" '.id = $id' "$TEMPLATE")"
  for rid in "$RB" "$RA"; do
    url="$("$S/container.sh" url --run-id "$rid")"
    code="$(curl -s -o /dev/null -m 60 -w '%{http_code}' -X POST "$url/rest/repositories" -H 'Content-Type: application/json' -d "$body")"
    [[ "$code" == 2* ]] || { echo "FAIL: create $REPO_ID on $rid -> $code" >&2; exit 4; }
  done
  SHOOT+=(--repo "$REPO_ID")
fi

# ---- shots -------------------------------------------------------------------------------------------------------
rc=0
for side in before after; do
  rid="$RB"; [[ $side == after ]] && rid="$RA"
  node "$S/compare/shoot.cjs" --base "$("$S/container.sh" url --run-id "$rid")" --out "$OUT/$side" "${SHOOT[@]}" -- "${SPECS[@]}" \
    > "$OUT/$side.tsv" || { echo "FAIL: $side shots (see above)" >&2; rc=2; }
done

: > "$OUT/results.tsv"
printf '%-24s %-28s %12s %9s\n' shot route "AE px" share
while IFS=$'\t' read -r name route; do
  b="$OUT/before/$name.png"; a="$OUT/after/$name.png"
  [[ -f "$b" && -f "$a" ]] || { echo "WARN  $name: missing on one side"; rc=2; continue; }
  # Pages of different height (full-page): pad both to the larger canvas so the diff covers everything.
  wh="$(identify -format '%w %h\n' "$b" "$a" | awk '{w=$1>w?$1:w; h=$2>h?$2:h} END {print w"x"h}')"
  for f in "$b" "$a"; do [[ "$(identify -format '%wx%h' "$f")" == "$wh" ]] || convert "$f" -background white -extent "$wh" "$f"; done
  ae="$(compare -metric AE -fuzz "$FUZZ" "$b" "$a" "$OUT/diff/$name.png" 2>&1 >/dev/null || true)"
  ae="${ae%% *}"; [[ "$ae" =~ ^[0-9.e+]+$ ]] && ae="$(printf '%.0f' "$ae")"
  total=$(( ${wh%x*} * ${wh#*x} ))
  printf '%s\t%s\t%s\t%s\t%s\t%s\n' "$name" "$route" "$ae" "$total" "${wh%x*}" "${wh#*x}" >> "$OUT/results.tsv"
  share=""; [[ "$ae" =~ ^[0-9]+$ ]] && share="$(awk -v a="$ae" -v t="$total" 'BEGIN {printf "%.3f%%", 100*a/t}')"
  printf '%-24s %-28s %12s %9s\n' "$name" "$route" "$ae" "$share"
done < "$OUT/before.tsv"

node "$S/compare/report.cjs" "$OUT" "$REF (${SHA:0:12}) vs $(basename "$TREE") @ $(git -C "$TREE" rev-parse --short HEAD) - fuzz $FUZZ"
exit $rc
