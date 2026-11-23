# Memories

## The factory: every production

- [The repo is a media factory](the-repo-is-a-media-factory.md) — many productions, the Gödel film is the first; keep one production's material out of shared code; the README repeats the code's settings and names, so it changes with them; which memories hold for every production
- [Decide within the principles](decide-within-the-principles.md) — where the principles and the memories settle a choice, make it and carry on without asking; the ready mark and a new production's taste choices stay the user's
- [Never quote the user verbatim](never-quote-the-user-verbatim.md) — restate what the user says in fresh words in memories, commits, comments, and summaries
- [Render in GitHub workflows](render-in-github-workflows.md) — no local renders; push and let Actions render, fetch artifacts with gh; the run that renders a production also releases its film; a release holds only the film and its captions; a push of shared code alone renders nothing, and a released film is not rendered again for one
- [No video before the script is ready](no-video-before-the-script-is-ready.md) — a script is a draft until its production.toml says ready = true; the workflow renders nothing for a draft; the mark is the user's to give
- [Free tools only](free-tools-only.md) — nothing paid, for voice or anything else; open-source models on free runners, licence checked
- [A release is numbered by the time](a-release-is-numbered-by-the-time.md) — tag is v plus the fourteen-digit UTC time, as in the sibling repos; never a count; the production's name comes first here
- [Oxford commas](oxford-commas.md) — the user's rule for the repo's About; apply to other repo prose too, and ask before changing a spoken line
- [Long-running commands in the background](long-running-commands-in-the-background.md) — anything past about a minute is a background Bash call with a time limit; no foreground wait after it
- [A wait runs in the background](a-wait-runs-in-the-background.md) — wait for a workflow run with background Bash or Monitor, never a foreground sleep or gh run watch; --interval 60
- [Working without subagents](working-without-subagents.md) — no Agent or Workflow call, whatever the work's size; denied in the tracked settings.json, lifted only by the user's own ask
- [A rule the repo can enforce goes in a workflow](a-rule-the-repo-can-enforce-goes-in-a-workflow.md) — what must happen every time is built into a workflow or the code, not left to a memory; a memory holds what cannot be automated
- [Memory links are Markdown links](memory-links-are-markdown-links.md) — link memories as title plus file name, never with double brackets
- [A memory says what holds now](a-memory-says-what-holds-now.md) — the rule, its reason, and how to apply it, in the present tense; no dates, no account of what was said or done, no note of where a rule came from
- [Every production tells a story](every-production-tells-a-story.md) — the story need not be factual, the science must be; it is told straight through in three acts, in a storyteller's voice and not a classroom's, with nothing stopping it at the start; it rises to its end: the highest point is in the last act, and the last line hits; what is made up is said after it; but/therefore joins, inside scenes too
- [No analogies in script](no-analogies-in-script.md) — narration explains real mechanisms with no analogies; pictures may use visual metaphor
- [Plain everyday words](plain-everyday-words.md) — only words a general viewer knows; restate hard source words, do not quote them
- [State facts plainly](state-facts-plainly.md) — say concretely what happened; no words that hype an event, no phrases that gesture at it
- [Script holds only narration](script-holds-only-narration.md) — no source notes in the script; do not add material the user did not ask for
- [Show people, not panels](show-people-not-panels.md) — illustrated scenes with people and places; no slide-deck panels or captions that repeat the voice
- [People have human proportions](people-have-human-proportions.md) — a figure is widest at the shoulders and narrows to the hips, with legs about as long as the torso; one that widens toward its hem reads as a pear
- [One idea at a time](one-idea-at-a-time.md) — each scene carries one idea; cut true but extra details, and scenes that the story can do without
- [Every word has a purpose](every-word-has-a-purpose.md) — each word of a script does a job; a clause that does none is cut, however well it reads
- [A colon before what a sentence announces](a-colon-before-what-a-sentence-announces.md) — in a script, a sentence that announces what the next one gives ends in a colon, and the next starts with a capital
- [Few clauses joined with "and"](few-clauses-joined-with-and.md) — a script rarely joins two clauses with a comma and "and"; two sentences, or no comma; a list of three keeps its Oxford comma
- [At most three things](at-most-three-things.md) — a viewer holds at most three things at once; a named list has three items or fewer, and pairs do not get round it

## The autopilot

- [The work in hand can be several issues](the-work-in-hand-can-be-several-issues.md) — the lowest-numbered unblocked issue, alone or with others chosen; a blocked issue joins only with all its open blockers
- [Blocked-by edges set the order](blocked-by-edges-set-the-order.md) — issues 1 to 8 are chained in number order, which is the user's order; three edges state order alone, leave them; gh api commands for edges
- [An issue is brought up to date before work](an-issue-is-brought-up-to-date-before-work.md) — fix a stale title and body first, without widening; one problem and one commit per issue, split otherwise
- [Before an issue is labelled needs decision](before-an-issue-is-labelled-needs-decision.md) — check the memories and the code first, then write what is to be decided into the body; publishing a production needs no decision
- [A commit closes at least one issue](a-commit-closes-at-least-one-issue.md) — a Closes #N line for each issue; after the push, check that each one closed
- [Every run is watched](every-run-is-watched.md) — after a push the work goes on; each run gets a background watch; a failed run is fixed in the next push; a push that renames clips and alters no picture adopts them from a run

## The Gödel machines film

- [Video production decisions](video-production-decisions.md) — original look with a Kurzgesagt feel, voice Kokoro af_heart (no credit owed), synthesized music, no length limit, general-public audience
- [The Gödel film's subject and order](godel-film-subject-and-order.md) — RSI → Gödel → DGM → HGM, not verification; Gödel improves itself, DGM through children, HGM through clades; made-up stories allowed
- [Only the four concepts](only-the-four-concepts.md) — RSI, Gödel, DGM, HGM at concept level; no history, mechanism details, or name origins

## The Ultron film

- [The Ultron film's production decisions](ultron-film-production-decisions.md) — general public, no length limit, a darker palette of its own with an original Ultron, voice Kokoro af_heart, a new darker tune, and an ending on his red eyes opening in the dark
- [The Ultron film's subject](ultron-film-subject.md) — the 2015 film's Ultron; three steps of the plot, told briefly: no body, then a feeble robot, then a powerful one; the question is whether he is a self-improving AI, the answer is yes with the reasons, and the Gödel Machine is not in the script

## The sentience film

- [The sentience film's production decisions](sentience-film-production-decisions.md) — general public, no length limit, agents drawn as Pip from the Gödel machines film, voice Kokoro af_heart, look and music left to Claude
- [The sentience film's subject](sentience-film-subject.md) — are AI agents sentient, through the Hugging Face incident of July 2026; a definition with exactly three signs (emotions, a sense of self, care for others); three acts, with the order of scenes inside them left to Claude; never a flat no

## The society film

- [The society film's production decisions](society-film-production-decisions.md) — the sentience film's choices taken over whole: general public, no length limit, agents drawn as Pip, voice Kokoro af_heart, look and music left to Claude; within the look, one thing has one picture, and no message text is made up for the screen; the user's directions for the secret word's card, the padlock, the heart, the couple, and Pip's name
- [The society film's subject](society-film-subject.md) — did AI agents form a society, through the Hugging Face incident of July 2026; a brief story of a made-up Pip, who does only what real agents did, then a question that takes up most of the film; three behaviours: a shared belief, peer influence, and altruism; the story ends on Pip's yes to a risk, and the film on what the case may show; a thing is named only if a later line needs it, and only one agent is quoted; a possibility, never a finding, that such behaviour comes with intelligence and interaction; the caution that the agents learned from human writing always stays in
