---
name: render-in-github-workflows
description: "Renderings for any production run in GitHub Actions workflows, never on the local Mac; commit and push to main without asking whenever a change should be rendered or checked; a push of shared code alone renders and releases nothing, and a released film is not rendered again for one"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 07bfdff1-036f-4379-a715-350405c33b23
  modified: 2026-11-22T17:04:43.988Z
---

# Render in GitHub workflows

Renderings in this repo, for any production, run in GitHub workflows, not on the local machine.

**Why:** It is the user's rule, and no reason comes with it. Claude's interpretation: it matches the practice in the sibling 10U-Labs repos, where work runs in CI and not on the developer's machine.

**How to apply:** Do not run frame capture, encoding, or final assembly locally. Push to `main` and let the workflow in `.github/workflows/` render; fetch results with `gh run download`. A run's artifacts last 90 days. The run that renders a production also publishes its film as a GitHub release, which is kept: a push always does, and a run started by hand does unless it is given `-f release=false`. That an approved script's film is released is the user's rule, and the workflow carries it out, per [A rule the repo can enforce goes in a workflow](a-rule-the-repo-can-enforce-goes-in-a-workflow.md). Fetch a released film with `gh release download <tag>`. A release holds the film and its captions and nothing else, no scene clips: that is the user's rule, with no reason given. A clip whose artifact is gone is rendered again. A push renders the productions whose folders it changes and whose scripts are marked ready, per [No video before the script is ready](no-video-before-the-script-is-ready.md). A push that changes only shared code renders and releases nothing, and the workflow stays that way: it is the user's decision that such a push does not render and release every approved production, and no reason comes with it. A film that is already released is not rendered again because shared code changed: that is the user's decision for the Gödel machines film, whose release shows the kit's people as they were drawn before they were given human proportions. Claude's reading, which the user has not confirmed: the same holds for every released film, and such a film takes up the change when its own folder next changes. A change to shared code is checked in the production it was made for, with `gh workflow run productions.yml -f production=<name>` when the push does not change that production's folder. Commit and push to `main` without asking whenever a change should be rendered or checked: that is the user's instruction as well, and its reason is that the runners cost nothing. Claude's interpretation, still to be confirmed by the user: the rule also covers still frames used to check layout, so get those from workflow artifacts too. Related: [Video production decisions](video-production-decisions.md).
