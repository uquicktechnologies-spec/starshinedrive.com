---
name: Vite workflow "port already in use" after env/shell reload
description: A vite artifact workflow can fail with "Port X already in use" right after an "Environment updated. Reloading shell..." log line, even though nothing else changed.
---

In this project, the `artifacts/starshine-drives: web` (vite) workflow has failed more than
once with `Error: Port <N> is already in use` immediately preceded by an
`Environment updated. Reloading shell...` log line — with no code/config change from the agent
that would explain a crash. `WorkflowsRestart` alone did not clear it because the *previous*
vite process was still bound to the port (an orphan, not the one the failed run just spawned).

**Why:** something about a shell/environment reload (e.g. a secret or env var change) appears
to race with the running dev server: a stale vite process keeps holding the port while a new
one tries to start on it and loses.

**How to apply:** if a workflow fails with "Port already in use" (as opposed to
`DIDNT_OPEN_A_PORT`, which is a different failure mode — see the `debug-workflow-ports-issues`
skill), don't just retry `WorkflowsRestart` blindly:
1. `lsof -i :<port>` to find what's actually holding it.
2. `kill -9 <pid>` the stray listener.
3. `sleep 1` and confirm `lsof -i :<port>` is empty, then `WorkflowsRestart`.

This is safe here because the artifact's dev server is stateless and cheap to restart; don't
assume the same is true of every process before killing it.
