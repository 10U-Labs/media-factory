---
name: every-run-is-watched
description: "After a push the autopilot goes straight on with the next work, further pushes included; every workflow run the push starts is watched to its end by a background command, and a run that failed is fixed in the next commit pushed, ahead of other work"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 07bfdff1-036f-4379-a715-350405c33b23
  modified: 2026-11-22T17:04:34.513Z
---

# Every run is watched

After a push, the autopilot (`.claude/skills/autopilot/SKILL.md`) goes straight on with the next work, further commits and pushes included. Every workflow run the push started is watched to its end by a background command.

**Why:** A run that nobody watches can fail unseen, most of all when the session has no new work and stops. A render of a whole film takes some minutes, and a session that waited for each run would sit idle through every one of them. The user allows other work during a run in this repo, per [A wait runs in the background](a-wait-runs-in-the-background.md). That further pushes go on as well, that each run is watched, and that a failed run is fixed first are the user's rules for the autopilot in the sibling repo `cladenc`. That they hold in this repo is Claude's reading, which the user has not confirmed.

**How to apply:**

- Right after a push, list the runs it started: `gh run list --commit <sha> --json databaseId,workflowName,status`, where `<sha>` is the full hash that `git rev-parse HEAD` prints; a short hash lists nothing. A run takes a few seconds to appear, so when the listing shows fewer runs than the `on:` sections of the workflows in `.github/workflows/` say the push starts, list again.
- Start one watch for each run as a background `Bash` call: `perl -e 'alarm 21600; exec @ARGV' gh run watch <id> --exit-status --interval 60 --compact`, with its output sent to a file in the scratchpad.
- Go on with the work. When nothing but the watches is left, end the turn; the notification of a watch that ends resumes the session.
- A watch that ends with status 0 says the run passed. For any other status, read `gh run view <id> --json conclusion --jq .conclusion`.
- Each workflow cancels its own earlier run on `main` when a later push starts it again. A run cancelled that way is left alone, since the later run is watched in its place.
- A watch that its time limit ended, with the run still queued or in progress, is started again.
- A run that failed is fixed in the next commit the session pushes, ahead of any other work not yet pushed. Read `gh run view <id> --log-failed`, set work in the tree that is not part of the fix aside with `git stash`, push the fix as a commit of its own, and bring the work back. The issues the failed commit closed stay closed while the fix goes in.
- A session that starts or resumes while a run of an earlier push is still queued or in progress watches that run too.
- Tell the user how each run ended.

Claude's interpretation: the sibling repo `cladenc` records that the organization's free runners are shared by all its repos, so a render holds up their runs while it lasts. Before a push, work out what it will render. The `productions` workflow starts a render for each production whose folder under `productions/` the push changes and whose script is marked ready, per [No video before the script is ready](no-video-before-the-script-is-ready.md), and the run releases the film it makes; it starts none when the push changes only shared code, which by the user's decision stays so, per [Render in GitHub workflows](render-in-github-workflows.md); a change to shared code is checked in the production it was made for, with `gh workflow run productions.yml -f production=<name>`, and a film already released is not rendered again for it. A render makes a scene's pictures only when no artifact is left under its clip's name, and `src/hyperframes/clips.py` says what that name covers: the scene's file, the scripts directly in the production's folder, `kit.js`, `page.html`, `page.py`, `cues.js`, the fonts, the production's picture settings, what the scene's narration says, `package-lock.json`, and the options Hyperframes renders a clip with. A push that changes one of those and alters no picture is followed at once by `gh workflow run productions.yml -f production=<name> -f adopt=<run>`, where `<run>` is the latest run whose film was right. That run takes the earlier run's clips under their new names, and cancels the render the push started for the production, if it started one. GitHub deletes a run's artifacts after 90 days, and a release keeps no clips, so a clip older than that is rendered again. Adoption takes a scene's clip whatever has changed in the scene since, so it is done before a push that alters a picture, never after.
