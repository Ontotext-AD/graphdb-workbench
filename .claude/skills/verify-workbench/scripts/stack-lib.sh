# Stack preparation shared by container.sh and cluster.sh: tree, license, image, build, staging.
# Sourced after env.sh, not executed. Uses the caller's TREE, LOG (build log), STACK_DIR and STATE_DIR.

# TREE (default: git toplevel of $PWD) -> the checkout's toplevel; MAIN_ROOT -> the main checkout that owns the
# git dir every worktree shares (REPO_ROOT is only the checkout running the script).
resolve_tree() {
  TREE="$(cd "${TREE:-$PWD}" && git rev-parse --show-toplevel 2>/dev/null)" \
    || { echo "FAIL: --tree / \$PWD is not inside a git checkout" >&2; exit 66; }
  [[ -f "$TREE/webpack.config.prod.js" ]] || { echo "FAIL: $TREE is not a graphdb-workbench checkout" >&2; exit 66; }
  MAIN_ROOT="$(dirname "$(git -C "$TREE" rev-parse --path-format=absolute --git-common-dir)")"
  if [[ "$TREE" == "$MAIN_ROOT" ]]; then
    echo "WARN: $TREE is the main checkout, not a worktree - the build rewrites its dist/, which the user's own" \
         "stacks may serve. Prefer: git worktree add <path> <branch>, then --tree <path>."
  fi
}

# Workbench and GraphDB are released in pairs: WB 4.0 <-> GraphDB 12.0, 3.5 <-> 11.5, 2.0 <-> 10.0 (major + 8, same
# minor), one release branch each. Any other combination is unsupported: it may load or not (a 4.x dist/ on
# 10.7 gets 406 for /resources/*), and what it shows is no evidence about the product. FAIL unless
# VERIFY_WB_ALLOW_GDB_MISMATCH=1. Uses TREE and GDB_VERSION.
check_gdb_pairing() {
  local wb wb_mm gdb_mm expected
  wb="$(jq -r .version "$TREE/package.json" 2>/dev/null)"
  [[ "$wb" =~ ^([0-9]+)\.([0-9]+) ]] || { echo "WARN: cannot read the Workbench version of $TREE; skipping the GraphDB pairing check"; return 0; }
  wb_mm="${BASH_REMATCH[1]}.${BASH_REMATCH[2]}"
  expected="$(( BASH_REMATCH[1] + 8 )).${BASH_REMATCH[2]}"
  [[ "$GDB_VERSION" =~ ^([0-9]+)\.([0-9]+) ]] || { echo "WARN: GraphDB tag '$GDB_VERSION' has no major.minor; skipping the pairing check"; return 0; }
  gdb_mm="${BASH_REMATCH[1]}.${BASH_REMATCH[2]}"
  [[ "$gdb_mm" == "$expected" ]] && return 0
  local msg="Workbench $wb (tree) is paired with GraphDB $expected.x, not $GDB_VERSION: unsupported combination, its failures are not product bugs. Verify an older GraphDB from its own release branch (--tree)"
  if [[ "${VERIFY_WB_ALLOW_GDB_MISMATCH:-}" == 1 ]]; then echo "WARN: $msg."; return 0; fi
  echo "FAIL: $msg, or set VERIFY_WB_ALLOW_GDB_MISMATCH=1 on purpose." >&2; exit 64
}

# LICENSE (--license / VERIFY_WB_LICENSE) or the first fixture found -> absolute path. Handled by path only.
find_license() {   # <hint for the FAIL message>
  local f
  if [[ -z "$LICENSE" ]]; then
    for f in "$TREE/e2e-tests/fixtures/graphdb.license" "$MAIN_ROOT/e2e-tests/fixtures/graphdb.license"; do
      [[ -f "$f" ]] && { LICENSE="$f"; break; }
    done
  fi
  [[ -n "$LICENSE" ]] || { echo "FAIL: no GraphDB license - put it at $MAIN_ROOT/e2e-tests/fixtures/graphdb.license (git-ignored), pass --license FILE / VERIFY_WB_LICENSE$1" >&2; exit 66; }
  LICENSE="$(realpath "$LICENSE")"; [[ -f "$LICENSE" ]] || { echo "FAIL: no license file $LICENSE" >&2; exit 66; }
}

# Pull before anything slow, once per machine: parallel runs wait on the lock instead of pulling twice.
pull_image() {   # <image>
  mkdir -p "$STATE_DIR"
  {
    flock 8
    if ! docker image inspect "$1" >/dev/null 2>&1; then
      echo "pulling $1 ..."
      docker pull -q "$1" >/dev/null || { echo "FAIL: cannot pull $1 (docker login docker-registry.ontotext.com?)" >&2; exit 6; }
    fi
  } 8>"$STATE_DIR/pull.lock"
}

install_deps() {
  echo "installing dependencies (npm run install:local) ..."
  (cd "$TREE" && npm run install:local) >>"$LOG" 2>&1 || { echo "FAIL: install:local, see $LOG" >&2; tail -n 30 "$LOG" >&2; exit 5; }
}

# Stale dependencies (a module added upstream after node_modules was installed) break the build: reinstall once
# and retry. The SBOM step runs after webpack: when only it fails, dist/ is complete and good enough to verify.
build_tree() {
  local s=$SECONDS retried=0 from start seg
  [[ -d "$TREE/packages/workbench/node_modules" ]] || install_deps
  while :; do
    echo "building (npm run build) ..."
    from="$(wc -l < "$LOG")"; start="$(date +%s)"
    (cd "$TREE" && npm run build) >>"$LOG" 2>&1 && break
    seg="$(tail -n +"$((from + 1))" "$LOG")"
    if grep -q 'build-sbom' <<<"$seg" && (( $(stat -c %Y "$TREE/dist/index.html" 2>/dev/null || echo 0) >= start )); then
      echo "WARN: only the SBOM step failed, dist/ is built - continuing (the UI does not need the SBOM), see $LOG"
      break
    fi
    if [[ $retried -eq 0 ]] && grep -qE "TS2307|Cannot find module|Module not found|Can't resolve" <<<"$seg"; then
      echo "build cannot resolve a module - node_modules is stale; reinstalling and retrying once"
      retried=1; install_deps; continue
    fi
    echo "FAIL: npm run build, see $LOG" >&2; tail -n 30 "$LOG" >&2; exit 5
  done
  echo "built in $((SECONDS - s))s"
}

# The build deletes and recreates dist/: a dist/ owned by someone else (root, when the user's own GraphDB compose
# bind-mounts it) dies late with EACCES. Fail before minutes of building instead.
check_writable() {
  local d bad why fix
  for d in "$TREE/dist" "$TREE"/packages/*/dist; do
    [[ -e "$d" ]] || continue
    bad="$(find "$d" \( ! -user "$(id -u)" -o -type d ! -writable \) -print -quit 2>/dev/null)"
    [[ -z "$bad" ]] && continue
    if [[ "$(stat -c %u "$bad")" != "$(id -u)" ]]; then why="is owned by $(stat -c %U "$bad"), not $(id -un)"; fix="sudo chown -R $(id -un): $d"
    else why="is not writable"; fix="chmod -R u+w $d"; fi
    echo "FAIL: $bad $why - the build would fail with EACCES." >&2
    echo "      Verify in a worktree (git worktree add), or if nothing else uses it: $fix" >&2
    exit 5
  done
}

# The container never mounts the tree itself: snap docker cannot see /tmp (where agent worktrees live), and
# the build recreates dist/, which would orphan a bind mount of it. dist/ is synced into the run's stack dir
# instead (directory kept, contents replaced), so rebuild + page reload is enough - no container restart.
stage() {   # [--no-dist]: import fixtures only (cluster.sh --bundled-ui serves the image's own UI)
  if [[ "${1:-}" != --no-dist ]]; then
    [[ -f "$TREE/dist/index.html" ]] || { echo "FAIL: $TREE/dist/index.html missing - build first or drop --no-build" >&2; exit 5; }
    mkdir -p "$STACK_DIR/wb/dist"
    rsync -a --delete "$TREE/dist/" "$STACK_DIR/wb/dist/"
  fi
  mkdir -p "$STACK_DIR/wb/import"
  rsync -a --delete "$TREE/e2e-tests/fixtures/graphdb-import/" "$STACK_DIR/wb/import/"
}
