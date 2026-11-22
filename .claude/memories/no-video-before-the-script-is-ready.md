---
name: no-video-before-the-script-is-ready
description: "No video is made from a production until its script, which the user calls the screenplay, is marked ready with ready = true in its production.toml; the productions workflow renders nothing for a draft, and the mark is the user's to give"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 01540429-97ee-40e8-8b42-534d4690b14b
  modified: 2026-11-19T14:58:08.343Z
---

# No video before the script is ready

No video is made from a production while its script is a draft: the script is judged ready first, and only then is it rendered. It is the user's rule, and it holds for every production (see [The repo is a media factory](the-repo-is-a-media-factory.md)). The user's word for the script is screenplay.

**Why:** No reason comes with it. Claude's interpretation: a script changes a great deal while it is drafted, a scene's pictures are timed to its narration, and a render takes hours of the runners that the organization's repos share, so most of a video made from a draft is made again.

**How to apply:** The mark is the line `ready = true` in the production's `production.toml`. A file without the line has a draft, so a new production starts as one. The `productions` workflow renders nothing for a draft: a push skips the production with a notice, and a run started by hand fails. The `voices` workflow makes no video, so it runs for a draft. The push that adds the line renders the production and releases its film, per [Render in GitHub workflows](render-in-github-workflows.md).

Claude's interpretation, which the user has not confirmed:

- The screenplay is the production's `script.md`.
- The user is the one who judges a script ready. Claude drafts and corrects the script, and adds `ready = true` only once the user says that this production's script is ready.
- Nothing else stands in for the user's word. A production that has been rendered, or whose film is released, can still have a draft for a script, so neither is a reason to add the line.
- Making video covers every kind of work on a production's pictures, not the workflow's render alone: writing its scenes, moving them to another renderer, and rendering one of them for a check. A draft gets none of it, whatever scenes or releases its folder already holds.
- Whether a production is ready is read from its `production.toml` before any such work, and never taken from its scenes, its releases, or a count of the films that look finished.
