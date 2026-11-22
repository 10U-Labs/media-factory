---
name: a-rule-the-repo-can-enforce-goes-in-a-workflow
description: "A rule that says something must happen every time, such as releasing the film of an approved script, is built into a GitHub workflow or the code and not left to a memory; a memory holds what cannot be automated"
metadata:
  type: feedback
---

# A rule the repo can enforce goes in a workflow

When a rule says that something must happen every time, it is built into a GitHub workflow or into the code, so that it happens without anyone remembering it. It is not written down as a memory for Claude to act on. It is the user's rule. An example: the film of an approved script is released by the `productions` workflow, in the run that renders it, and no memory tells Claude to start a release.

**Why:** No further reason comes with it. Claude's interpretation: a memory works only when it is read and followed. One that is missed, or that another memory contradicts, lets the step drop without a sign. A workflow does the step on every run, and fails in the open where it cannot.

**How to apply:** The list is Claude's reading, which the user has not confirmed.

- Before saving a rule as a memory, ask whether a workflow, a script, or a check could carry it out, or refuse what breaks it. If one could, change that, and let the README say what it does.
- A memory is for what cannot be automated: taste, judgement, how a script or a picture is made, and what the user wants to be asked.
- A step that is found to rest on a memory alone is moved into a workflow, and the memory that told Claude to do it by hand is deleted.
- The rule holds for every production (see [The repo is a media factory](the-repo-is-a-media-factory.md)).
