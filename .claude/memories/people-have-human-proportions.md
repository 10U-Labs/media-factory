---
name: people-have-human-proportions
description: "A person drawn in a production has human proportions: widest at the shoulders, narrower at the hips, with legs about as long as the torso; a figure that widens toward its hem reads as a pear"
metadata:
  type: feedback
---

# People have human proportions

A person drawn in a production has the proportions of a human body: the figure is widest at the shoulders and narrows to the hips, and its legs are about as long as its torso. It is the user's judgement: a figure whose outline widens from the shoulders down is shaped like a pear, and looks odd.

**Why:** No further reason comes with it. Claude's interpretation: a viewer reads a figure by its outline first, and an outline that is wrong takes attention from the story. People carry a production's story, per [Show people, not panels](show-people-not-panels.md), so they have to read as people at a glance.

**How to apply:** The figure is drawn by `person` in `src/hyperframes/kit.js`, which every production uses, so the rule and any change to the figure reach every film (see [The repo is a media factory](the-repo-is-a-media-factory.md)). Claude's reading, which the user has not confirmed: the jacket is widest at the shoulders and ends at the hips, the legs are separate and end in shoes, both arms show, and the head is large enough to read at the size people are drawn in a wide scene. A figure that is new or changed is checked in a render's stills, per [Render in GitHub workflows](render-in-github-workflows.md), before many scenes use it.
