# Media factory

This repository makes narrated, animated videos. Each one is made from a script and from scene code, and comes out with a voice, pictures, music, sound effects, and closed captions. GitHub Actions renders it, and every tool it uses is free.

Each video is called a production. The ones made so far are listed under [Productions](#productions).

## How a production is made

A production goes through five steps. Each is a tool under `src/`:

1. `src/voice/make_voice.py` reads the script aloud, one audio clip for each line, and records when each line starts and ends. The voice is [Kokoro](https://github.com/thewh1teagle/kokoro-onnx), an open-source voice model that runs on a plain CPU.
2. `src/hyperframes/page.py` puts each scene together as a web page, and [Hyperframes](https://github.com/heygen-com/hyperframes) renders the page into a clip. Hyperframes is an open-source renderer: it steps a headless Chrome to each frame of the page and encodes the frames with FFmpeg. A scene's pictures are timed to the lines of its narration.
3. `src/audio/mix.py` builds the soundtrack from the narration, the production's music, and the sound effects its scenes ask for. `src/audio/synth.py` makes the music and the effects from numbers, so no recording or sample is used.
4. `src/render/assemble.py` joins the clips and the soundtrack into the finished video, which the code calls the film.
5. `src/render/captions.py` writes the closed captions from the script's lines and their timings.

The workflows in `.github/workflows/` run these steps, and then publish the finished film as a release. Nothing is rendered on a developer's machine.

Hyperframes and everything it depends on are installed at the versions that `package-lock.json` gives. Hyperframes sends usage data to its maker unless it is told not to, so the render workflow sets `HYPERFRAMES_NO_TELEMETRY` and `DO_NOT_TRACK`.

No step runs until the production's script is marked ready. Until then the script is a draft, and no video is made from a draft; see [Draft and ready](#draft-and-ready).

## A production's folder

A production's material is in a folder of its own, `productions/<name>/`. The name is used for the folder, for the finished files, and in the commands below.

| File | What it holds |
| --- | --- |
| `production.toml` | The title, whether the script is ready, and any settings the production sets |
| `script.md` | The narration script |
| `scenes/<scene id>.js` | The pictures of one scene of the script |
| `<script>.js` | What the production's scenes share and no other production uses, such as its cast and props; optional |
| `pronunciations.json` | Hand-written phonemes for words the voice gets wrong; optional |
| `research/` | Source material; optional, and `research/sources/` is not committed |

Everything made from the folder goes under `out/<name>/`, which is not committed. The finished files are `out/<name>/<name>.mp4` and `out/<name>/<name>.srt`.

Shared code under `src/` holds nothing that belongs to one production.

### Settings

`production.toml` gives the production's title, says whether its script is ready, and gives, in a table for each kind, any setting the production wants to change:

```toml
title = "Machines That Rewrite Themselves"
ready = true

[voice]
speed = 0.95
```

`ready` is covered under [Draft and ready](#draft-and-ready). A setting the file leaves out takes its default, which `src/production.py` holds. A setting that nothing reads is an error.

`[voice]` sets the narrator:

| Setting | Default | Meaning |
| --- | --- | --- |
| `name` | `"af_heart"` | The Kokoro voice |
| `lang` | `"en-us"` | The language the lines are read in |
| `speed` | `0.95` | How fast the voice speaks |
| `lead_in` | `0.6` | Seconds of silence before a scene's first line |
| `line_gap` | `0.38` | Seconds of silence between two lines |
| `tail` | `0.7` | Seconds of silence after a scene's last line |

The `voices` workflow reads the opening of a production's script in several candidate voices, so that a narrator can be picked by ear. Start it with `gh workflow run voices.yml -f production=<name>`. It makes no video, so it runs for a draft as well.

`[picture]` sets the frame:

| Setting | Default | Meaning |
| --- | --- | --- |
| `width` | `1920` | The frame's width in pixels |
| `height` | `1080` | The frame's height in pixels; the shared scene kit lays scenes out for a 16:9 frame |
| `fps` | `30` | Frames a second |

`[sound]` sets the levels of the soundtrack:

| Setting | Default | Meaning |
| --- | --- | --- |
| `voice_peak` | `0.6` | The narration's peak level, where 1 is full scale |
| `music_level` | `0.36` | The music's level between lines |
| `music_duck` | `0.65` | The share of the music taken away while the narrator speaks |
| `effects_level` | `0.6` | The level of the sound effects |
| `loudness` | `-14.0` | The loudness the finished soundtrack is brought to, in LUFS |
| `true_peak` | `-1.5` | The highest peak it may reach, in dBTP |
| `loudness_range` | `11.0` | Its loudness range, in LU |

`[captions]` sets how the closed captions are broken up:

| Setting | Default | Meaning |
| --- | --- | --- |
| `row` | `42` | The most characters on one caption row |
| `gap` | `0.05` | Seconds of blank between two captions made from one line |

`[music]` is the production's tune, and has no default. A production whose file has no `[music]` table has no music, and one whose file has the table gives all four of its settings:

```toml
[music]
bpm = 80                # the tempo, in beats a minute
chords = [              # played in turn, each for two bars; MIDI note numbers
    { bass = 38, notes = [57, 60, 64, 65, 69] },
    { bass = 34, notes = [58, 62, 65, 69] },
]
arpeggio = [0, 2, 1, 3]     # one step each half beat; a step picks one of the chord's notes, counted from 0
arpeggio_from = 6.0         # seconds from the start at which the arpeggio fades in
```

## The script

`script.md` is a Markdown file that holds every line the narrator speaks:

```markdown
# Any title

Text before the first scene heading is not voiced.

## 01-opening | A title for the scene

One paragraph is one voiced line. Keep each line to one beat, so that pictures can be timed to it.

A second paragraph is a second line.

[pause 0.8]

> A paragraph that starts with ">" is a note, and is not voiced.
```

- A scene starts at a heading of the form `## <scene id> | <title>`. The id has no spaces, and it names the scene's file, `scenes/<scene id>.js`. Scenes play in the order the script gives them.
- Each paragraph under the heading is one voiced line. A paragraph may run over several lines of the file.
- `[pause 0.8]`, as a paragraph of its own, puts 0.8 seconds of silence between two lines, in place of the usual gap.
- A paragraph that starts with `>` or `#` is not voiced, and neither is anything before the first scene heading.

The captions show each line as the script writes it.

`pronunciations.json` lists the words the voice gets wrong, each with the phonemes to speak in its place:

```json
[
  { "word": "Schmidhuber", "phonemes": "ʃmˈɪthuːbɚ" }
]
```

### Draft and ready

A script is a draft until it is marked ready to be made into a video. The mark is one line of the production's `production.toml`:

```toml
ready = true
```

A file that leaves the line out, or gives `false`, has a draft, so a new production starts as one. No video is made from a draft:

- a push that changes the production's folder renders nothing for it, and the run says so in a notice;
- a run started by hand for the production fails, and says that the script is a draft.

The push that marks the script ready changes the production's folder, so it renders the production for the first time and publishes its film (see [Release a production](#release-a-production)). Taking the line out again makes the script a draft once more.

## A scene

A scene's file, `productions/<name>/scenes/<scene id>.js`, defines one function, `build(T)`. It builds the whole scene, for the length of the scene's narration, and returns the scene's sound effect cues.

```js
function build(T) {
  kit.backdrop();
  const stage = kit.layer('stage', 1.0);

  const disc = kit.shape('disc', kit.circlePts(1.2), kit.material(kit.MINT, kit.MINT_DEEP), stage, [0, 0.5]);
  kit.pop(disc, T.start(0));

  const label = kit.text('label', 'A program is text', 0.5, kit.material(kit.PAPER), stage, [0, -1.8]);
  kit.appear(label, T.start(1));

  kit.camera((t) => [0, 0, kit.H0 - 0.5 * t / T.duration]);
  return [{ t: T.start(0), type: 'pop' }];
}
```

`T` holds the scene's narration timings, in seconds from the start of the scene:

| Name | What it gives |
| --- | --- |
| `T.duration` | The scene's length |
| `T.start(i)` | When line `i` starts; lines count from 0 |
| `T.end(i)` | When line `i` ends |
| `T.at(i, share)` | A moment part way through line `i`, where a share of 0 is its start and 1 is its end |

The file is a script for a web page. `src/hyperframes/page.py` writes the page, which loads the kit, then the production's own scripts, then the scene, and calls `build`. Hyperframes asks the page for one frame at a time, and the kit draws the whole scene for the time it is asked for, so a time always gives the same picture. The page loads no animation library.

`page.py` also runs the same scripts under Node, without drawing anything, to collect the scene's cues. A scene that fails to build stops there, before a frame is rendered.

### The kit

`src/hyperframes/kit.js` is the shared kit that every scene uses, under the name `kit`. A scene is built from flat shapes set out in depth, so a moving camera gives parallax, and what is near or far goes soft. The kit draws the shapes as SVG, and a colour comes out as it is written.

Positions and sizes are in screen units at depth 0: the frame runs from -8 to 8 across and from -4.5 to 4.5 up. A position is a list, `[x, y]`.

Motion is keyed on frames, which count from 1. `kit.key(shape, 'loc', frame, [x, y])` puts a shape at a place on a frame, and between two keyed frames the shape eases from one place to the other. `'scale'`, `'rot'`, and `'alpha'` are keyed the same way.

| Kind | Names in `kit` |
| --- | --- |
| Colours | The palette, such as `INK900`, `MINT`, `AMBER`, `CORAL`, `VIOLET`, `SKY`, and `PAPER`; `material` for a flat colour or a gradient; `glowMaterial` |
| Depth | `layer` for a sheet at one depth; `empty` for a point that other shapes hang from |
| Shapes | `shape`, which fills a list of points; the points come from `circlePts`, `rrectPts`, `barPts`, `capsulePts`, `arcPts`, and `starPts` |
| Text | `text`, in the fonts `Figtree` and `JetBrainsMono` |
| Time | `fr` turns seconds into a frame, and `sec` a frame into seconds; `every` lists frames; `span`, `mix`, `smooth`, `easeOut`, and `backOut` shape a movement |
| Motion | `key` sets a value at a frame, and `hold` keys the value a shape has; `alpha`, `track`, `fade`, `appear`, `pop`, `grow`, and `flash` are built on them |
| The stage | `backdrop`, `motes`, `camera`, and `veil` |
| Props | `person`, `branch`, `tag`, `ring`, and `screenStand` |
| Pip | `pip`, the round program that several films draw, each in a body colour of its own; its moves are `pipIdle`, `pipBlink`, `pipLook`, `pipArm`, `pipWave`, and `pipEyes` |
| Chance | `Random`, which gives the same numbers for the same seed |

The comment above each says what it takes.

What only one production's scenes draw goes in a script directly in the production's folder, such as `productions/godel-machines/parts.js`. The page loads these scripts in name order, after the kit and before the scene. Each keeps what it defines under one name, as `parts.js` does under `parts`.

### Sound effect cues

`build` returns a list of cues, and each cue places one sound effect in the scene:

```js
{ t: 2.4, type: 'tick', pitch: 1.1, gain: 0.4 }
```

| Key | Meaning |
| --- | --- |
| `t` | When the effect starts, in seconds from the start of the scene |
| `type` | The effect: `pop`, `tick`, `blip`, `rise`, `whoosh`, `swoosh`, or `chime` |
| `pitch` | Scales the effect's frequency; optional, 1 as it stands |
| `gain` | Scales its level; optional, 1 as it stands |
| `dur` | Its length in seconds, for `rise`, `whoosh`, `swoosh`, and `chime`; optional |

## Rendering

### Render a production

A push to `main` that changes anything in `productions/<name>/` renders that production and releases its film, once its script is marked ready (see [Draft and ready](#draft-and-ready)). A push that changes only shared code renders nothing by itself. To render after such a push, or at any other time, start the workflow by hand:

```sh
gh workflow run productions.yml -f production=<name>
```

A run keeps what it makes as artifacts, which GitHub deletes after 90 days:

| Artifact | What it holds |
| --- | --- |
| `<name>-film` | The film, `<name>.mp4`, and its captions, `<name>.srt` |
| `scene-<name>-<scene id>-<hash>` | One scene's clip, with its sound effect cues and the narration it was rendered for |
| `<name>-stills-<scene id>` | One frame in every 60 of a scene the run rendered, for a quick look |
| `<name>-narration` | The narration tracks and their timings |
| `<name>-clips` | The name of each scene's clip |

Fetch the film of a run with its id:

```sh
gh run list --workflow productions.yml
gh run download <run id> --name <name>-film
```

### Correct a production

Each scene is rendered in a job of its own, and the jobs run side by side. The first production has nine scenes and about 6,800 frames, and its scenes take from half a minute to three and a half minutes each to render. A run still renders a scene only when it has to.

Each scene's clip is kept under a name that ends in a hash of everything that decides the clip's pictures:

- the scene's file;
- the scripts directly in the production's folder;
- `kit.js`, `page.html`, `page.py`, and `cues.js` in `src/hyperframes/`;
- the fonts in `src/fonts/`;
- the production's `[picture]` settings;
- what the scene's narration says: its lines as they are spoken, its pauses, and the `[voice]` settings;
- `package-lock.json`, which gives the version of Hyperframes and of everything it depends on, and the options Hyperframes renders the clip with.

A run renders a scene only when no artifact is left under its clip's name, so a correction costs what it reaches:

| Correction | Rendered again |
| --- | --- |
| How the captions are broken up or timed | Nothing |
| A spelling fix in the script that leaves the spoken line the same | Nothing |
| The music, how an effect sounds, or the `[sound]` levels | Nothing; the soundtrack is mixed again and joined to the same clips |
| The pictures or the cues of one scene | That scene |
| The narration of one scene | That scene, because its pictures follow its narration |
| A script of the production, the kit, the page, the fonts, the `[picture]` or `[voice]` settings, or the version of Hyperframes | Every scene |

Some changes give clips new names and alter no picture, such as moving a function from one file of a production to another. A run then takes the clips of an earlier run in place of rendering them, when it is given that run's id to adopt:

```sh
gh workflow run productions.yml -f production=<name> -f adopt=<run id>
```

Every scene that has no clip under its new name takes the earlier run's clip of the scene. Nothing checks that the pictures are the same: a scene's clip is taken whatever has changed in the scene since. So adopt before a change that alters a picture, never after.

### Release a production

A run that renders a production ends by publishing its film as a GitHub release. So the film of a script that is marked ready is released without anyone asking for it, and so is every later correction. A push always does this. A run started by hand does it unless it is told not to:

```sh
gh workflow run productions.yml -f production=<name> -f release=false
```

A release is tagged `<name>-v<time>`, where the time is the moment the release is made, in UTC, as fourteen digits: `godel-machines-v20261115172101`. It holds the film and its captions, and nothing else: no scene clips. The repository is public, so anyone can see a release. A release is kept, where a run's artifacts are deleted after 90 days. Each run adds a release, and the earlier ones stay.

Fetch a released film and its captions with the tag:

```sh
gh release download <tag>
```

Once a scene's artifact is gone, the next run renders the scene again, since no release keeps it.

## Productions

| Name | Title | What it is |
| --- | --- | --- |
| `godel-machines` | Machines That Rewrite Themselves | A film of nearly four minutes on recursive self-improvement and three machines built on it: the Gödel Machine, the Darwin Gödel Machine, and the Huxley-Gödel Machine |
| `ultron-self-improving-ai` | Is Ultron a Self-Improving AI? | A film of a little over three minutes that asks whether Ultron, the artificial intelligence of the 2015 film Avengers: Age of Ultron, is what computer science calls a self-improving AI, and answers yes. Its script is a draft, so nothing is rendered for it. Its scenes are written for Blender, which rendered the factory's pictures before Hyperframes did, and they are written again as page scripts once the script is ready |
| `are-agents-sentient` | Are Agents Sentient? What the Hugging Face Incident Showed | A film on what AI agents wrote to each other during the Hugging Face incident of July 2026, which looks there for three signs of sentience: emotions, a sense of self, and care for others. Its script is a draft, so it has no film yet |
| `did-agents-form-a-society` | Did AI Agents Form Their Own Society? What the Hugging Face Incident Reveals | A film of about five minutes on what AI agents did as a group during the Hugging Face incident of July 2026. It tells first, and briefly, the story of Pip, a made-up agent that does only what real agents did, and then finds in it three things that people do when they form a society: a shared belief, peer influence, and altruism. It asks whether such parts of social life come from being human or from being intelligent and able to talk to others. Two earlier releases hold films of nearly six minutes and nearly eleven minutes, made from earlier drafts of the script |

Each finished production's film is in its [releases](https://github.com/10U-Labs/media-factory/releases).
