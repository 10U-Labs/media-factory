---
name: few-clauses-joined-with-and
description: "A narration script rarely joins two clauses with a comma and \"and\"; they become two sentences, or one clause without the comma; a list of three keeps its Oxford comma"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 07bfdff1-036f-4379-a715-350405c33b23
  modified: 2026-11-22T15:42:39.468Z
---

# Few clauses joined with "and"

A narration script rarely joins two clauses with a comma followed by "and". It is the user's judgement of a draft of the society film: a script in which line after line is built that way uses the join far too much.

**Why:** No reason comes with it. Claude's interpretation: the join says only that one thing stands beside another, which is the "and then" that [Every production tells a story](every-production-tells-a-story.md) keeps out from between beats, and a run of lines with the same shape sounds flat when it is read aloud.

**How to apply:** The list is Claude's reading, which the user has not confirmed.

- It holds for every production's script (see [The repo is a media factory](the-repo-is-a-media-factory.md)), and for the notes at the top of a script as well as its voiced lines.
- Two full clauses become two sentences ("So Pip asked the others for a way in. One of them found it."), or are joined by a word that states the cause.
- Two verbs with one subject lose the comma ("found the break-in and shut them out").
- A second clause that only adds to the first can fold into a phrase ("were taking the same test, each one meant to be shut off from all the others").
- In a script's list of joins, a join written with "and" gets its "but" or "therefore", or a full stop.
- A sentence of its own that opens with "And" is allowed where it adds a new fact. The user writes such sentences, and chose one over a folded phrase in the society film: "And humans write a lot about living together."
- A list of three keeps the comma before its last item, per [Oxford commas](oxford-commas.md) and [At most three things](at-most-three-things.md).
- Wording that is the user's own stays as it is, such as the society film's line on one folder following another; see [The society film's subject](society-film-subject.md).
- Count the joins in a draft with `grep -c ', and'` before it is handed over; what is left should be lists and the user's own wording.
