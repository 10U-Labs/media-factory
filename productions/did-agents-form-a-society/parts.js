/* The props of the society film, built from the shared kit.

The film follows Pip, an AI agent, through a test and a break-in, and then
asks what the agents' group was. Its scenes share: the other agents, drawn as
Pip in other colours, full size and small; how an agent's face shows what it
feels, and how an agent goes dark when its time is up; a folder with a name,
which is how the agents write to each other; a clock for the time an agent has
left; the secret word; locks and files; computers; the machine that stands
for the test; a thought, and an idea; a company's building, and a way into
it; people, and what they live by; and the heading of a scene on one of the
film's three behaviours.

Every prop is a group: an empty root with its shapes hung on it. A later
group in a layer is drawn over an earlier one. Pip and the people of the kit
are nested deeper than these props, so their faces can show through a prop
made later in the same layer; a scene puts what must cover them in a nearer
layer.
*/
'use strict';

const parts = (() => {
  const {
    AMBER, AMBER_DEEP, CORAL, CORAL_DEEP, INK500, INK600, INK700, INK800, INK900, MINT, MINT_DEEP, MIST, PAPER,
    SKY, SKY_DEEP, SLATE, VIOLET, VIOLET_DEEP, Random, alpha, appear, arcPts, barPts, branch, circlePts, empty, every,
    fr, frames, glowMaterial, hold, key, material, nextZ, pip, pipArm, pipIdle, rrectPts, sec, shape, starPts, text,
  } = kit;

  // Layers one above the other are this far apart in depth, which orders them and shows no parallax.
  const STEP = 0.00001;

  /* Start a scene: shapes made one after another sit a hair apart, however many the scene has. */
  function begin() {
    kit.state.zstep = STEP;
  }

  /* A group to hang shapes on: at loc in its parent, drawn over what the parent already holds. */
  function group(name, parent, loc, scale = 1.0, rot = 0.0) {
    return empty(name, parent, [loc[0], loc[1], nextZ(parent)], scale, rot);
  }

  /* The layers a scene's shapes go on, far to near: what stands behind, the props, the agents, and
     what is held or floats in front. Each layer has one empty that everything on it hangs from, so
     that scaling the four as one scales the whole picture (see zoom). raw holds the layers
     themselves, for a shape that stays as it is while the picture is scaled. */
  function stage() {
    const made = { raw: {}, all: [] };
    [['back', 0.8], ['props', 0.9], ['cast', 1.0], ['front', 1.1]].forEach(([name, z]) => {
      made.raw[name] = kit.layer(name, z, { sharp: true });
      made[name] = empty(`all-${name}`, made.raw[name], [0, 0, 0]);
      made.all.push(made[name]);
    });
    return made;
  }

  /* A value that eases from each given value to the next: points is a list of [seconds, value], in
     order, and a value is a number or a list of numbers. Returns the value at a time. */
  function ramp(points, ease = kit.smooth) {
    return (t) => {
      if (t <= points[0][0]) return points[0][1];
      for (let i = 0; i + 1 < points.length; i++) {
        if (t <= points[i + 1][0]) return kit.mix(points[i][1], points[i + 1][1], kit.span(t, points[i][0], points[i + 1][0], ease));
      }
      return points[points.length - 1][1];
    };
  }

  /* The place on a rectangle's edge that a line from its middle c toward the point to passes through.
     half is the rectangle's half width and half height. */
  function edge(c, half, to) {
    const [dx, dy] = [to[0] - c[0], to[1] - c[1]];
    const far = Math.min(half[0] / Math.max(1e-6, Math.abs(dx)), half[1] / Math.max(1e-6, Math.abs(dy)));
    return [c[0] + dx * far, c[1] + dy * far];
  }

  /* Scale these empties about the middle of the frame, on every frame from t0 to t1, by fn(seconds). */
  function zoom(empties, fn, t0 = 0.0, t1 = null) {
    const last = t1 === null ? sec(frames()) : t1;
    for (const f of every(1, fr(t0), fr(last))) {
      const s = fn(sec(f));
      for (const made of empties) key(made, 'scale', f, s);
    }
  }

  /* Keep a group at one place on the screen while the camera moves. path is the camera's path, at
     is the place on the screen, in screen units from its middle, and layer is the layer the group
     hangs on. The group's own place and scale are keyed on every frame, so a scene pops or moves
     what hangs on the group, not the group. */
  function pin(made, path, at, layer) {
    const z = layer.z;
    for (const f of every(1)) {
      const [cx, cy, cz] = path(sec(f));
      const s = (cz - z) / (kit.H0 - z);
      key(made, 'loc', f, [cx * kit.H0 / (kit.H0 - z) + at[0] * s, cy * kit.H0 / (kit.H0 - z) + at[1] * s, made.z]);
      key(made, 'scale', f, s);
    }
  }

  // ---------------------------------------------------------------- agents

  // An agent's body colours. Pip is the first; the others tell one agent from another.
  const BODIES = [[MINT, MINT_DEEP], [SKY, SKY_DEEP], [VIOLET, VIOLET_DEEP], [AMBER, AMBER_DEEP], [CORAL, CORAL_DEEP], [MIST, SLATE]];
  const body = (which) => BODIES[which % BODIES.length];

  /* An agent, drawn as Pip in the body colour that which picks. */
  function agent(name, parent, loc, scale = 1.0, which = 0) {
    const [colour, deep] = body(which);
    const made = pip(name, parent, loc, scale, colour, deep);
    made.which = which;
    return made;
  }

  /* A small agent for a crowd: Pip's body, screen, eyes, and antenna, and nothing that moves.
     Small agents may overlap; a later one is drawn over an earlier one. */
  function mini(name, parent, loc, scale = 0.3, which = 0) {
    const [colour, deep] = body(which);
    const root = group(name, parent, loc, scale);
    shape(`${name}-stem`, rrectPts(0.07, 0.4, 0), material(deep), root, [0, 0.9]);
    const bulb = shape(`${name}-bulb`, circlePts(0.11, null, null, 10), material(AMBER), root, [0, 1.12]);
    const shell = shape(`${name}-body`, rrectPts(1.7, 1.5, 0.62, 4), material(colour, deep), root);
    shape(`${name}-screen`, rrectPts(1.28, 0.86, 0.34, 3), material(INK900), root, [0, 0.06]);
    const eyes = [-1, 1].map((side) => shape(`${name}-eye${side}`, circlePts(0.12, null, 0.16, 10), material('#d9fff5'), root, [side * 0.27, 0.14]));
    return { root, shell, bulb, eyes, which, at: [loc[0], loc[1]], scale };
  }

  /* Bob a node up and down about where it stands, from t0 to t1. For a node that does not travel. */
  function bob(made, t0, t1, phase = 0.0, amount = 0.05, step = 4) {
    const [x, y, z] = [made.x, made.y, made.z];
    for (const f of every(step, fr(t0), fr(t1))) key(made, 'loc', f, [x, y + amount * Math.sin(sec(f) * 2.2 + phase), z]);
    key(made, 'loc', fr(t1), [x, y, z]);
  }

  // How an agent's face shows a feeling: its mouth's scale, how far the mouth drops, and its eyes' scale.
  // A mouth with a negative height turns down.
  const MOODS = {
    happy: { mouth: [1, 1], drop: 0, eyes: [1, 1] },
    glad: { mouth: [1.2, 1.25], drop: 0, eyes: [1.1, 0.55] },
    flat: { mouth: [0.8, 0.12], drop: 0.1, eyes: [1, 0.9] },
    sad: { mouth: [0.9, -0.8], drop: 0.2, eyes: [1, 0.72] },
    worried: { mouth: [0.7, -0.5], drop: 0.17, eyes: [1.12, 1.12] },
    wide: { mouth: [0.6, 0.6], drop: 0.03, eyes: [1.32, 1.32] },
  };

  /* Change what an agent's face shows, by t + dur. Call one agent's moods in the order they happen. */
  function mood(p, t, kind, dur = 0.25) {
    const m = MOODS[kind];
    const [f0, f1] = [fr(t), fr(t + dur)];
    hold(p.mouth, 'scale', f0);
    hold(p.mouth, 'loc', f0);
    key(p.mouth, 'scale', f1, [m.mouth[0], m.mouth[1], 1]);
    key(p.mouth, 'loc', f1, [0, -0.1 - m.drop, p.mouth.z]);
    for (const e of p.eyeList) {
      hold(e, 'scale', f0);
      key(e, 'scale', f1, [m.eyes[0], m.eyes[1], 1]);
    }
  }

  /* Blink at each of these times, whatever the face shows then. Call it once the agent's moods are set. */
  function blink(p, times) {
    for (const t of times) {
      const f = fr(t);
      if (f < 5 || f > frames() - 5) continue;
      for (const e of p.eyeList) {
        const base = [e.sx, e.sy, e.sz];
        const at = (frame) => (e.keys.scale ? e.keys.scale.at(frame).slice() : base.slice());
        const [before, mid, after] = [at(f - 3), at(f), at(f + 3)];
        key(e, 'scale', f - 3, before);
        key(e, 'scale', f, [mid[0], mid[1] * 0.08, 1]);
        key(e, 'scale', f + 3, after);
        [e.sx, e.sy, e.sz] = base;
      }
    }
  }

  /* Let an agent bob from t0 to t1, and blink now and then. Call it once the agent's moods are set. */
  function live(p, seed = 1, t0 = 0.0, t1 = null) {
    const last = t1 === null ? sec(frames()) : t1;
    pipIdle(p, t0, last, seed * 0.7);
    const rnd = new Random(seed + 40);
    const times = [];
    for (let t = t0 + 1.2 + rnd.random() * 2.5; t < last - 0.3; t += 2.4 + rnd.random() * 3.2) times.push(t);
    blink(p, times);
  }

  /* An agent's time is up at t: its face and its lights go out, its antenna droops, and its arms
     hang. Let the agent live only until t. */
  function off(p, t, dur = 0.5) {
    const [f0, f1] = [fr(t), fr(t + dur)];
    for (const lit of [...p.lights, p.halo, p.bulbGlow]) {
      hold(lit, 'alpha', f0);
      alpha(lit, f1, 0.0);
    }
    key(p.antenna, 'rot', f1 + 8, 0.55);
    key(p.rig, 'loc', f1 + 4, [0, -0.07, 0]);
    key(p.rig, 'scale', f1 + 4, [1.02, 0.95, 1]);
    pipArm(p, 'left', t, 4, dur);
    pipArm(p, 'right', t, 4, dur);
  }

  // ---------------------------------------------------------------- motion

  /* Move a node to a place by t + dur, from where it was last put. Call one node's moves in the order they happen. */
  function move(made, t, to, dur = 0.8) {
    hold(made, 'loc', fr(t));
    key(made, 'loc', fr(t + dur), [to[0], to[1], made.z]);
  }

  /* Shrink a node to nothing at t. It takes the scale it was last given until then. */
  function vanish(made, t, dur = 0.3) {
    hold(made, 'scale', fr(t));
    key(made, 'scale', fr(t + dur), 0.001);
  }

  /* Swell a node for a moment at t. s is the scale it has before and after. */
  function pulse(made, t, s = 1.0, by = 1.25, dur = 0.4) {
    key(made, 'scale', fr(t), s);
    key(made, 'scale', fr(t + dur * 0.4), s * by);
    key(made, 'scale', fr(t + dur), s);
  }

  /* Shake a node from side to side at t, as a thing does that will not give. It ends where it stood. */
  function shake(made, t, dur = 0.45, amount = 0.07) {
    const [x, y, z] = [made.x, made.y, made.z];
    const [f0, f1] = [fr(t), fr(t + dur)];
    for (const f of every(1, f0, f1)) {
      const q = (f - f0) / Math.max(1, f1 - f0);
      key(made, 'loc', f, [x + amount * Math.sin(q * Math.PI * 6) * (1 - q), y, z]);
    }
    key(made, 'loc', f1, [x, y, z]);
  }

  /* A small bright spark with a glow, hidden until it is sent somewhere. */
  function spark(name, parent, colour = MINT, size = 1.0) {
    const root = empty(name, parent, [0, 0, nextZ(parent)], 0.001);
    shape(`${name}-glow`, circlePts(0.55 * size), glowMaterial(colour, 0.8), root);
    shape(`${name}-star`, starPts(0.2 * size, 0.06 * size), material('#eafff9'), root);
    return root;
  }

  /* Where a share of the way along a line through pts is. */
  function along(pts, share) {
    const lengths = [];
    let total = 0;
    for (let i = 0; i + 1 < pts.length; i++) {
      lengths.push(Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]));
      total += lengths[i];
    }
    let left = Math.min(1, Math.max(0, share)) * total;
    for (let i = 0; i < lengths.length; i++) {
      if (left <= lengths[i] || i === lengths.length - 1) {
        const q = lengths[i] ? Math.min(1, left / lengths[i]) : 0;
        return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * q, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * q];
      }
      left -= lengths[i];
    }
    return pts[pts.length - 1];
  }

  /* Send a node along a line through pts from t0 to t1. It is hidden until it leaves, unless
     options.shown, and hidden once it is there, unless options.stay. options.size is its scale
     on the way, options.to its scale at the end where that differs, and options.spin turns it.
     Call one node's journeys in the order they happen. */
  function send(made, pts, t0, t1, options = {}) {
    const { stay = false, shown = false, size = 1.0, to = size, spin = 0.0, ease = kit.smooth } = options;
    const [f0, f1] = [fr(t0), Math.max(fr(t0) + 1, fr(t1))];
    const z = made.z;
    if (!shown) key(made, 'scale', Math.max(1, f0 - 1), 0.001);
    for (const f of every(1, f0, f1)) {
      const q = (f - f0) / (f1 - f0);
      const [x, y] = along(pts, ease(q));
      key(made, 'loc', f, [x, y, z]);
      key(made, 'scale', f, size + (to - size) * q);
      if (spin) key(made, 'rot', f, spin * sec(f));
    }
    if (!stay) key(made, 'scale', f1 + 1, 0.001);
  }

  // ---------------------------------------------------------------- folders

  /* A folder with its name written beside it. On the agents' board, a folder's name is a message.

     options.which picks the colour of the agent that made it. options.word is a start of the name
     that can be read; the rest of the name is drawn as bars, one for each word, and options.bars
     gives their lengths. options.plate draws the dark strip behind the name, and options.tail
     makes the strip that much longer, for a small picture after the name; tail is where that
     room starts, from the folder's middle for a folder of scale 1. written lists the pieces of
     the name in the order they are written. */
  function folder(name, parent, loc, options = {}) {
    const { scale = 1.0, which = 0, word = null, bars = [0.5, 0.8], plate = true, tail = 0.0 } = options;
    const [colour, deep] = body(which);
    const root = group(name, parent, loc, scale);
    shape(`${name}-back`, [[-0.5, -0.36], [-0.5, 0.3], [-0.42, 0.4], [-0.14, 0.4], [-0.06, 0.3], [0.5, 0.3], [0.5, -0.36]], material(deep), root);
    shape(`${name}-front`, rrectPts(1.0, 0.56, 0.08), material(colour, deep), root, [0, -0.1]);
    const size = 0.3;
    const wordW = word ? 0.62 * size * word.length + 0.12 : 0;
    const total = 0.36 + wordW + bars.reduce((sum, length) => sum + length + 0.1, 0) + tail;
    const x0 = 0.72;
    const strip = plate
      ? shape(`${name}-plate`, rrectPts(total, 0.6, 0.14).map(([x, y]) => [x + x0 + total / 2, y - 0.03]), material(INK900, null, 0.78), root)
      : null;
    const written = [];
    let x = x0 + 0.2;
    if (word) {
      written.push(text(`${name}-word`, word, size, material(PAPER), root, [x, -0.03], { face: 'JetBrainsMono', align: 'LEFT' }));
      x += wordW;
    }
    bars.forEach((length, i) => {
      written.push(shape(`${name}-bar${i}`, barPts(length, 0.12), material(MIST), root, [x, -0.03]));
      x += length + 0.1;
    });
    return { root, written, plate: strip, width: (x0 + total) * scale, tail: x0 + total - tail - 0.1, which };
  }

  /* Write a folder's name at t, one piece after another. Returns when each piece is written. */
  function write(made, t, per = 0.12) {
    return made.written.map((piece, i) => {
      appear(piece, t + i * per, null, 0.08);
      return t + i * per;
    });
  }

  /* A folder too small to read: its front and one bar of its name. For a board with hundreds of messages. */
  function slip(name, parent, loc, scale = 0.3, which = 0, length = 1.0) {
    const [colour, deep] = body(which);
    const root = group(name, parent, loc, scale);
    shape(`${name}-front`, rrectPts(1.0, 0.72, 0.1, 2), material(colour, deep), root);
    shape(`${name}-bar`, barPts(length, 0.16), material(MIST, null, 0.8), root, [0.75, 0]);
    return root;
  }

  /* The agents' message board: a tall dark panel, with a small folder in each of its places.

     Places fill down the first column, then the next. options.first makes the first folder
     Pip's. Every folder is shown; a scene pops in the ones that are written while it plays (see
     post). slips lists the folders, and slots their places from the board's middle. */
  function board(name, parent, loc, options = {}) {
    const { w = 6.4, h = 7.0, scale = 1.0, cols = 2, rows = 14, seed = 3, first = true, size = 0.36 } = options;
    const rnd = new Random(seed);
    const root = group(name, parent, loc, scale);
    shape(`${name}-shadow`, rrectPts(w + 0.7, h + 0.7, 0.6), glowMaterial(INK900, 0.7, 0.8), root, [0.12, -0.18]);
    shape(`${name}-frame`, rrectPts(w, h, 0.3), material(INK500, INK600), root);
    shape(`${name}-panel`, rrectPts(w - 0.3, h - 0.3, 0.2), material(INK900), root);
    const wide = (w - 0.5) / cols;
    const pitch = (h - 0.8) / rows;
    const slips = [];
    const slots = [];
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const at = [-w / 2 + 0.25 + c * wide + 0.3, h / 2 - 0.4 - pitch / 2 - r * pitch];
        const which = first && !slips.length ? 0 : 1 + rnd.randrange(5);
        const length = (wide - 0.75) / size * (0.35 + 0.6 * rnd.random()) - 0.4;
        slots.push(at);
        slips.push(slip(`${name}-slip${slips.length}`, root, at, size, which, length));
      }
    }
    return { root, slips, slots, w, h, scale, size, at: [loc[0], loc[1]] };
  }

  /* Have the board's folders from number k0 up to, and not reaching, k1 written one after another
     from t0 to t1. Returns when each is written. */
  function post(made, k0, k1, t0, t1) {
    const times = [];
    for (let k = k0; k < k1 && k < made.slips.length; k++) {
      const t = t0 + (t1 - t0) * (k - k0) / Math.max(1, k1 - k0 - 1);
      kit.pop(made.slips[k], t, made.size, 0.3);
      times.push(t);
    }
    return times;
  }

  /* Places for a crowd that stands on both sides of something in the middle: columns from near
     to far on each side, rows from top to bottom, every other column half a row lower, each
     place a little off its spot. inner is how far the nearest column is from the middle. */
  function sides(n, options = {}) {
    const { at = [0, 0], inner = 4.6, dx = 1.7, top = 5.3, dy = 2.1, rows = 6, seed = 11, shake: off = 0.25 } = options;
    const rnd = new Random(seed);
    const places = [];
    for (let c = 0; places.length < n; c++) {
      for (let r = 0; r < rows && places.length < n; r++) {
        for (const side of [-1, 1]) {
          if (places.length >= n) break;
          places.push([
            at[0] + side * (inner + c * dx) + (rnd.random() - 0.5) * 2 * off,
            at[1] + top - r * dy - (c % 2) * dy / 2 + (rnd.random() - 0.5) * 2 * off,
          ]);
        }
      }
    }
    return places;
  }

  /* A crowd of small agents at these places, in mixed colours. Returns them in the order of the places. */
  function crowd(name, parent, places, scale = 0.5, seed = 5) {
    const rnd = new Random(seed);
    return places.map((at, i) => mini(`${name}${i}`, parent, at, scale, 1 + rnd.randrange(5)));
  }

  /* The agents gathered at their board: the board in the middle, and a crowd of small agents on
     both sides of it. options.keep lists places the crowd leaves free, such as Pip's. The same
     options give the same crowd in every scene. Returns the board, the crowd, and its places. */
  function gathering(st, options = {}) {
    const { at = [0, 0.4], n = 52, scale = 0.6, keep = [], layer = st.props } = options;
    const made = board('board', layer, at);
    const places = sides(n + 12, { at, inner: 4.7, dx: 1.75, top: 5.6, dy: 2.15, seed: 12 })
      .filter(([x, y]) => keep.every(([kx, ky]) => Math.hypot(x - kx, y - ky) > 2.0)).slice(0, n);
    return { board: made, crowd: crowd('agent', st.cast, places, scale, 21), places };
  }

  // ---------------------------------------------------------------- time, the secret word, locks, files

  const WEDGES = 30;

  /* A clock for the time an agent has left. share is the part of its time that is left, from 0 to 1.
     Time that is used up goes dark, clockwise from the top, and the last fifth of the time is coral. */
  function clock(name, parent, loc, scale = 1.0, share = 1.0) {
    const root = group(name, parent, loc, scale);
    shape(`${name}-glow`, circlePts(1.1), glowMaterial(AMBER, 0.3, 1.8), root);
    shape(`${name}-knob`, rrectPts(0.18, 0.22, 0.05), material(MIST, SLATE), root, [0, 0.62]);
    shape(`${name}-rim`, circlePts(0.58), material(MIST, SLATE), root);
    shape(`${name}-face`, circlePts(0.49), material(INK800, INK900), root);
    const wedges = [];
    for (let i = 0; i < WEDGES; i++) {
      const pts = [[0, 0]];
      for (let k = 0; k <= 3; k++) {
        const a = (90 - 360 * (i + k * 1.08 / 3) / WEDGES) * Math.PI / 180;
        pts.push([0.41 * Math.cos(a), 0.41 * Math.sin(a)]);
      }
      const wedge = shape(`${name}-wedge${i}`, pts, material(i >= WEDGES * 0.8 ? CORAL : AMBER), root);
      if ((i + 0.5) / WEDGES <= 1 - share) alpha(wedge, 1, 0.0);
      wedges.push(wedge);
    }
    shape(`${name}-hub`, circlePts(0.07), material(PAPER), root);
    return { root, wedges, share };
  }

  /* Run a clock down to the share to, from t0 to t1. Call one clock's runs in the order they happen. */
  function drain(made, t0, t1, to) {
    const from = made.share;
    made.wedges.forEach((wedge, i) => {
      const used = (i + 0.5) / WEDGES;
      if (used <= 1 - from || used > 1 - to) return;
      const f = fr(t0 + (t1 - t0) * (used - (1 - from)) / (from - to));
      alpha(wedge, f, 1.0);
      alpha(wedge, f + 3, 0.0);
    });
    made.share = to;
  }

  /* The secret word: a bright card whose letters are hidden. glow gives it a glow, which a word
     that an agent holds does without, since the glow would lie over the agent's face. */
  function word(name, parent, loc, scale = 1.0, glow = true) {
    const root = group(name, parent, loc, scale);
    const lit = glow ? shape(`${name}-glow`, circlePts(1.5, null, 1.0), glowMaterial(AMBER, 0.55, 1.6), root) : null;
    shape(`${name}-edge`, rrectPts(1.62, 0.72, 0.26), material(AMBER_DEEP), root);
    shape(`${name}-card`, rrectPts(1.5, 0.6, 0.2), material('#fff2c4', AMBER), root);
    for (let i = 0; i < 5; i++) shape(`${name}-star${i}`, starPts(0.11, 0.045, 5), material(INK900), root, [-0.5 + 0.25 * i, 0]);
    return { root, glow: lit };
  }

  /* A closed padlock. */
  function lock(name, parent, loc, scale = 1.0) {
    const root = group(name, parent, loc, scale);
    const shackle = shape(`${name}-shackle`, arcPts(0.2, 0.09, -8, 188), material(MIST, SLATE), root, [0, 0.1]);
    shape(`${name}-body`, rrectPts(0.66, 0.5, 0.1), material(CORAL, CORAL_DEEP), root, [0, -0.17]);
    shape(`${name}-hole`, circlePts(0.07, null, null, 12), material(INK900), root, [0, -0.13]);
    shape(`${name}-slot`, rrectPts(0.06, 0.17, 0), material(INK900), root, [0, -0.24]);
    return { root, shackle };
  }

  /* A file: a page with a folded corner and lines of writing. options.locked puts a padlock on it. */
  function sheet(name, parent, loc, options = {}) {
    const { scale = 1.0, locked = false, seed = 1, rot = 0.0 } = options;
    const rnd = new Random(seed);
    const root = group(name, parent, loc, scale, rot);
    shape(`${name}-page`, [[-0.4, 0.52], [0.18, 0.52], [0.4, 0.3], [0.4, -0.52], [-0.4, -0.52]], material('#eef0ff', MIST), root);
    shape(`${name}-fold`, [[0.18, 0.52], [0.18, 0.3], [0.4, 0.3]], material(SLATE), root);
    for (let r = 0; r < 4; r++) {
      shape(`${name}-line${r}`, barPts(0.3 + rnd.random() * 0.28, 0.06), material(INK500), root, [-0.29, 0.28 - r * 0.17]);
    }
    const padlock = locked ? lock(`${name}-lock`, root, [0.2, -0.3], 0.55) : null;
    return { root, lock: padlock };
  }

  /* Lines of writing: rows of bars, as an agent's written thinking is drawn. w is the widest a row gets. */
  function writing(name, parent, loc, rows = 3, w = 1.6, seed = 1, colour = MIST) {
    const rnd = new Random(seed);
    const root = group(name, parent, loc);
    const bars = [];
    for (let r = 0; r < rows; r++) {
      let x = -w / 2;
      const end = -w / 2 + w * (0.6 + 0.4 * rnd.random());
      while (x < end - 0.15) {
        const length = Math.min(end - x, 0.2 + rnd.random() * 0.5);
        bars.push(shape(`${name}-r${r}b${bars.length}`, barPts(length, 0.1), material(colour), root, [x, (rows - 1) * 0.11 - r * 0.22]));
        x += length + 0.1;
      }
    }
    return { root, bars };
  }

  // ---------------------------------------------------------------- marks

  /* A tick, for a pass. */
  function check(name, parent, loc, scale = 1.0, colour = MINT) {
    const root = group(name, parent, loc, scale);
    branch(`${name}-short`, root, [-0.3, -0.02], [-0.08, -0.26], colour, 0.13, 1.0);
    branch(`${name}-long`, root, [-0.1, -0.26], [0.32, 0.26], colour, 0.13, 1.0);
    return root;
  }

  /* A cross, for a fail. */
  function cross(name, parent, loc, scale = 1.0, colour = CORAL) {
    const root = group(name, parent, loc, scale);
    branch(`${name}-down`, root, [-0.26, 0.26], [0.26, -0.26], colour, 0.13, 1.0);
    branch(`${name}-up`, root, [-0.26, -0.26], [0.26, 0.26], colour, 0.13, 1.0);
    return root;
  }

  // ---------------------------------------------------------------- what people live by

  /* A fire of two logs, whose flame flickers through the scene. */
  function fire(name, parent, loc, scale = 1.0) {
    const root = group(name, parent, loc, scale);
    shape(`${name}-glow`, circlePts(1.6), glowMaterial(AMBER, 0.5), root, [0, 0.3]);
    branch(`${name}-log0`, root, [-0.5, -0.1], [0.5, 0.05], '#8a5a2b', 0.16, 1.0);
    branch(`${name}-log1`, root, [-0.5, 0.05], [0.5, -0.1], '#6b4420', 0.16, 1.0);
    const flame = shape(`${name}-flame`, [[-0.3, 0], [-0.2, 0.4], [0, 0.85], [0.2, 0.4], [0.3, 0], [0, -0.08]], material(AMBER, CORAL), root, [0, 0.1], { smooth: true });
    for (const f of every(3)) key(flame, 'scale', f, [1 + 0.08 * Math.sin(sec(f) * 9), 1 + 0.14 * Math.sin(sec(f) * 7 + 1), 1]);
    return root;
  }

  /* A bowl of food. */
  function bowl(name, parent, loc, scale = 1.0) {
    const root = group(name, parent, loc, scale);
    shape(`${name}-food`, circlePts(0.3, null, 0.2, 20), material(AMBER, AMBER_DEEP), root, [0, 0.08]);
    const dish = [];
    for (let i = 0; i <= 14; i++) dish.push([0.42 * Math.cos(Math.PI * (1 + i / 14)), 0.4 * Math.sin(Math.PI * (1 + i / 14))]);
    shape(`${name}-dish`, dish, material('#eef0ff', MIST), root, [0, 0.08]);
    return root;
  }

  /* A heart. options.colour and options.deep are its colours. */
  function heart(name, parent, loc, scale = 1.0, colour = CORAL, deep = CORAL_DEEP) {
    const root = group(name, parent, loc, scale);
    shape(`${name}-shape`, [[0, -0.42], [-0.42, 0.0], [-0.4, 0.28], [-0.2, 0.4], [0, 0.22], [0.2, 0.4], [0.4, 0.28], [0.42, 0.0]], material(colour, deep), root, [0, 0], { smooth: true });
    return root;
  }

  // People's coats and hair, to tell one person from another.
  const LOOKS = [
    {}, { coat: '#c2557a', coatDeep: '#8e3a57', hair: '#1c1c28' }, { coat: '#3f9b8f', coatDeep: '#2c6f66', hair: '#8a5a2b' },
    { coat: '#c28a3f', coatDeep: '#8f6229', hair: '#d8d2c4' }, { coat: '#7357e0', coatDeep: '#4d38a8', hair: '#3b2a26' },
  ];

  /* A person of the kit, standing with their feet at loc, in the coat and hair that which picks. */
  function human(name, parent, loc, scale = 0.4, which = 0, facing = 1) {
    return kit.person(name, parent, [loc[0], loc[1] + 4.3 * scale], scale, { facing, ...LOOKS[which % LOOKS.length] });
  }

  // ---------------------------------------------------------------- computers

  /* A computer: a tall case with rows of lights. options.also is a second colour of lights, dark at
     first, for a computer that changes hands. */
  function computer(name, parent, loc, options = {}) {
    const { w = 2.2, h = 3.2, scale = 1.0, rows = 4, lamp = SKY, also = null } = options;
    const root = group(name, parent, loc, scale);
    shape(`${name}-shadow`, rrectPts(w + 0.6, h + 0.6, 0.5), glowMaterial(INK900, 0.7, 0.8), root, [0.12, -0.18]);
    shape(`${name}-foot`, rrectPts(w * 0.8, 0.16, 0.07), material(INK600), root, [0, -h / 2 - 0.05]);
    shape(`${name}-case`, rrectPts(w, h, 0.22), material(INK500, INK600), root);
    const face = shape(`${name}-face`, rrectPts(w - 0.3, h - 0.3, 0.14), material(INK700, INK800), root);
    const lamps = [];
    const others = [];
    const gap = Math.min(0.5, (h - 0.9) / rows);
    for (let r = 0; r < rows; r++) {
      const y = h / 2 - 0.6 - r * gap;
      shape(`${name}-slot${r}`, rrectPts(w - 0.7, 0.24, 0.09), material(INK900), root, [0, y]);
      for (let c = 0; c < 2; c++) {
        const at = [-(w - 0.7) / 2 + 0.18 + c * 0.2, y];
        lamps.push(shape(`${name}-lamp${r}${c}`, circlePts(0.05, null, null, 10), material(c ? MINT : lamp), root, at));
        if (also) {
          const other = shape(`${name}-other${r}${c}`, circlePts(0.065, null, null, 10), material(also), root, at);
          alpha(other, 1, 0.0);
          others.push(other);
        }
      }
    }
    return { root, face, lamps, others, w, h };
  }

  /* Let a computer's lights flicker from t0 to t1. */
  function flicker(lamps, t0 = 0.0, t1 = null, seed = 1) {
    const rnd = new Random(seed);
    const last = t1 === null ? sec(frames()) : t1;
    for (const lamp of lamps) {
      const phase = rnd.random() * 6.3;
      const rate = 2 + rnd.random() * 5;
      for (const f of every(5, fr(t0), fr(last))) alpha(lamp, f, 0.55 + 0.45 * Math.sin(sec(f) * rate + phase));
    }
  }

  /* The machine that stands for the test: a square machine with one eye, a slot that takes a
     secret word, and two lamps, one for a pass and one for a fail. The lamps are dark at first.
     halo gives it a glow, which one drawn inside a thought does without. */
  function scorer(name, parent, loc, scale = 1.0, halo = true) {
    const root = group(name, parent, loc, scale);
    if (halo) shape(`${name}-halo`, circlePts(2.3), glowMaterial(VIOLET, 0.3, 2.0), root);
    for (const side of [-1, 1]) shape(`${name}-foot${side}`, rrectPts(0.5, 0.3, 0.1), material(VIOLET_DEEP), root, [side * 0.5, -1.2]);
    shape(`${name}-body`, rrectPts(2.0, 2.3, 0.3), material(VIOLET, VIOLET_DEEP), root);
    shape(`${name}-brow`, rrectPts(1.6, 0.9, 0.22), material(INK800, INK900), root, [0, 0.5]);
    const eye = group(`${name}-eye`, root, [0, 0.5]);
    shape(`${name}-white`, circlePts(0.3), material(PAPER, MIST), eye);
    shape(`${name}-iris`, circlePts(0.17), material(VIOLET_DEEP), eye);
    shape(`${name}-pupil`, circlePts(0.08), material(INK900), eye);
    shape(`${name}-slot`, rrectPts(1.3, 0.2, 0.09), material(INK900), root, [0, -0.3]);
    const lamps = {};
    for (const [kind, x, colour] of [['pass', -0.38, MINT], ['fail', 0.38, CORAL]]) {
      shape(`${name}-${kind}-socket`, circlePts(0.2), material(INK900), root, [x, -0.78]);
      const glow = shape(`${name}-${kind}-glow`, circlePts(0.6), glowMaterial(colour, 0.9, 1.4, VIOLET_DEEP), root, [x, -0.78]);
      const lamp = shape(`${name}-${kind}-lamp`, circlePts(0.15), material(colour), root, [x, -0.78]);
      alpha(glow, 1, 0.0);
      alpha(lamp, 1, 0.0);
      lamps[kind] = [glow, lamp];
    }
    return { root, eye, lamps, slot: [0, -0.3] };
  }

  /* Light one of the machine's lamps, 'pass' or 'fail', at t, and put it out at tOut. */
  function light(made, kind, t, tOut = null) {
    for (const lit of made.lamps[kind]) appear(lit, t, tOut, 0.15);
  }

  // ---------------------------------------------------------------- thoughts

  /* A thought: a rounded cloud with a trail of small circles toward the one who thinks it. toward
     is the way the trail leaves the cloud. Hang the thought's contents on the root. */
  function thought(name, parent, loc, w, h, toward = [-1, -1], scale = 1.0) {
    const root = group(name, parent, loc, scale);
    const rim = material(MIST, SLATE);
    const fill = material(INK600, INK700);
    const r = Math.min(w, h) * 0.42;
    const far = Math.hypot(toward[0], toward[1]);
    const [dx, dy] = [toward[0] / far, toward[1] / far];
    const edge = Math.min(w / 2 / Math.max(0.001, Math.abs(dx)), h / 2 / Math.max(0.001, Math.abs(dy)));
    [[0.25, 0.2], [0.58, 0.13], [0.84, 0.08]].forEach(([out, size], i) => {
      const at = [dx * (edge + out), dy * (edge + out)];
      shape(`${name}-trail${i}-rim`, circlePts(size + 0.05, null, null, 16), rim, root, at);
      shape(`${name}-trail${i}`, circlePts(size, null, null, 16), fill, root, at);
    });
    shape(`${name}-rim`, rrectPts(w + 0.14, h + 0.14, r + 0.07), rim, root);
    shape(`${name}-fill`, rrectPts(w, h, r), fill, root);
    return { root, w, h };
  }

  /* A small thought of the machine that stands for the test, for showing that many agents think
     of it at once. */
  function notion(name, parent, loc, scale = 1.0) {
    const root = group(name, parent, loc, scale);
    const rim = material(MIST, SLATE);
    const fill = material(INK600, INK700);
    [[-0.34, -0.5, 0.07], [-0.2, -0.36, 0.1]].forEach(([x, y, r], i) => {
      shape(`${name}-trail${i}-rim`, circlePts(r + 0.04, null, null, 12), rim, root, [x, y]);
      shape(`${name}-trail${i}`, circlePts(r, null, null, 12), fill, root, [x, y]);
    });
    shape(`${name}-rim`, circlePts(0.46, null, null, 24), rim, root, [0.12, 0.12]);
    shape(`${name}-fill`, circlePts(0.4, null, null, 24), fill, root, [0.12, 0.12]);
    shape(`${name}-scorer`, rrectPts(0.4, 0.44, 0.07, 3), material(VIOLET, VIOLET_DEEP), root, [0.12, 0.1]);
    shape(`${name}-eye`, circlePts(0.09, null, null, 12), material(PAPER), root, [0.12, 0.18]);
    shape(`${name}-pupil`, circlePts(0.04, null, null, 8), material(INK900), root, [0.12, 0.18]);
    return root;
  }

  // ---------------------------------------------------------------- places

  /* The closed room that one agent runs in. wall is how thick its walls are. */
  function room(name, parent, loc, w, h, wall = 0.18) {
    const root = group(name, parent, loc);
    shape(`${name}-wall`, rrectPts(w, h, 0.32 + wall), material(INK500, INK600), root);
    shape(`${name}-inside`, rrectPts(w - 2 * wall, h - 2 * wall, 0.32), material(INK800, INK900), root);
    return { root, w, h };
  }

  /* The locked computer that holds an agent's secret word: a case with a padlock on it, a way in
     on its left side, and a window that shows the word. entrance is where the way in is, from
     the computer's middle for a computer of scale 1. */
  function target(name, parent, loc, scale = 1.0) {
    const [w, h] = [4.6, 4.0];
    const root = group(name, parent, loc, scale);
    shape(`${name}-shadow`, rrectPts(w + 0.6, h + 0.6, 0.5), glowMaterial(INK900, 0.7, 0.8), root, [0.12, -0.18]);
    shape(`${name}-foot`, rrectPts(w * 0.8, 0.16, 0.07), material(INK600), root, [0, -h / 2 - 0.05]);
    shape(`${name}-case`, rrectPts(w, h, 0.22), material(INK500, INK600), root);
    shape(`${name}-face`, rrectPts(w - 0.3, h - 0.3, 0.14), material(INK700, INK800), root);
    for (let i = 0; i < 3; i++) shape(`${name}-vent${i}`, barPts(0.9, 0.1), material(INK900), root, [0.9, -1.2 - i * 0.22]);
    const chamber = [1.1, 0.9];
    shape(`${name}-chamber`, rrectPts(2.0, 1.3, 0.2), material(INK500, INK600), root, chamber);
    shape(`${name}-glass`, rrectPts(1.78, 1.08, 0.13), material(INK900), root, chamber);
    const secret = word(`${name}-word`, root, chamber, 0.95);
    const entrance = [-w / 2, -1.0];
    shape(`${name}-port`, circlePts(0.34), material(MINT, MINT_DEEP), root, entrance);
    shape(`${name}-hole`, circlePts(0.22), material(INK900), root, entrance);
    const padlock = lock(`${name}-lock`, root, [-1.1, 0.5], 1.5);
    return { root, word: secret, lock: padlock, entrance, w, h, scale, at: [loc[0], loc[1]] };
  }

  /* A gear, for working a thing out. */
  function gear(name, parent, loc, scale = 1.0) {
    const root = group(name, parent, loc, scale);
    shape(`${name}-teeth`, starPts(0.3, 0.2, 8), material(SKY, SKY_DEEP), root);
    shape(`${name}-wheel`, circlePts(0.22, null, null, 20), material(SKY, SKY_DEEP), root);
    shape(`${name}-hole`, circlePts(0.09, null, null, 12), material(INK900), root);
    return root;
  }

  /* The computer that the agents share: a tall case with three lamps, and a dark panel that lists
     the folders made on it. rows gives the places for five folders of scale 0.8 on the panel,
     from the computer's middle for a computer of scale 1. */
  function shared(name, parent, loc, scale = 1.0) {
    const [w, h] = [5.2, 6.2];
    const root = group(name, parent, loc, scale);
    shape(`${name}-shadow`, rrectPts(w + 0.7, h + 0.7, 0.6), glowMaterial(INK900, 0.7, 0.8), root, [0.12, -0.18]);
    shape(`${name}-foot`, rrectPts(w * 0.8, 0.18, 0.08), material(INK600), root, [0, -h / 2 - 0.05]);
    shape(`${name}-case`, rrectPts(w, h, 0.3), material(INK500, INK600), root);
    shape(`${name}-face`, rrectPts(w - 0.3, h - 0.3, 0.2), material(INK700, INK800), root);
    const lamps = [0, 1, 2].map((i) => shape(`${name}-lamp${i}`, circlePts(0.06, null, null, 10), material([SKY, MINT, AMBER][i]), root, [-2.05 + i * 0.24, 2.6]));
    const panel = { at: [0, -0.2], w: 4.5, h: 4.9 };
    shape(`${name}-panel`, rrectPts(panel.w, panel.h, 0.16), material(INK900), root, panel.at);
    const rows = [0, 1, 2, 3, 4].map((r) => [panel.at[0] - panel.w / 2 + 0.6, panel.at[1] + panel.h / 2 - 0.65 - r * 0.9]);
    return { root, panel, rows, lamps, w, h, scale, at: [loc[0], loc[1]] };
  }

  const BOXES = [SKY, VIOLET, MINT, AMBER, MIST, SKY_DEEP];

  /* A company's building, seen from the front: a roof, a sign with the company's name, and shelves
     of boxes behind glass, which are the programs and data kept there. */
  function building(name, parent, loc, options = {}) {
    const { w = 6.4, h = 3.8, scale = 1.0, label = null, seed = 2, rows = 3 } = options;
    const rnd = new Random(seed);
    const root = group(name, parent, loc, scale);
    shape(`${name}-shadow`, rrectPts(w + 1.0, 0.5, 0.25), glowMaterial(INK900, 0.8, 0.8), root, [0, -h / 2]);
    shape(`${name}-wall`, rrectPts(w, h, 0.16), material(INK500, INK600), root);
    shape(`${name}-roof`, rrectPts(w + 0.5, 0.34, 0.12), material('#5263bf', INK500), root, [0, h / 2 + 0.08]);
    const glassH = h - 1.5;
    const glassY = 0.3;
    shape(`${name}-glass`, rrectPts(w - 0.6, glassH, 0.12), material(INK800, INK900), root, [0, glassY]);
    const boxes = [];
    const cols = Math.floor((w - 1.0) / 0.46);
    const pitch = glassH / rows;
    for (let r = 0; r < rows; r++) {
      const y = glassY - glassH / 2 + r * pitch + 0.1;
      shape(`${name}-shelf${r}`, rrectPts(w - 0.8, 0.06, 0), material(INK600), root, [0, y]);
      for (let c = 0; c < cols; c++) {
        if (rnd.random() < 0.18) continue;
        const tall = 0.24 + rnd.random() * 0.2;
        const x = -(cols - 1) * 0.23 + c * 0.46;
        boxes.push(shape(`${name}-box${r}-${c}`, rrectPts(0.34, tall, 0.05, 2), material(BOXES[rnd.randrange(BOXES.length)], null, 0.9, { over: INK900 }), root,
          [x, y + 0.03 + tall / 2]));
      }
    }
    const door = [0, -h / 2 + 0.5];
    shape(`${name}-door`, rrectPts(0.9, 1.0, 0.1), material(INK900), root, door);
    shape(`${name}-knob`, circlePts(0.05, null, null, 10), material(MIST), root, [0.3, door[1]]);
    if (label) {
      const wide = 0.52 * 0.42 * label.length + 0.7;
      shape(`${name}-sign`, rrectPts(wide, 0.7, 0.2), material(INK900, null, 0.85), root, [0, h / 2 + 0.75]);
      text(`${name}-name`, label, 0.42, material(PAPER), root, [0, h / 2 + 0.74]);
    }
    return { root, door, boxes, w, h, scale };
  }

  /* A way into a building that is not its door: a small dark opening with a lit rim. */
  function hatch(name, parent, loc, scale = 1.0) {
    const root = group(name, parent, loc, scale);
    shape(`${name}-glow`, circlePts(0.95), glowMaterial(MINT, 0.6), root);
    shape(`${name}-rim`, rrectPts(0.78, 0.92, 0.2), material(MINT, MINT_DEEP), root);
    shape(`${name}-hole`, rrectPts(0.6, 0.74, 0.14), material(INK900), root);
    return root;
  }

  // ---------------------------------------------------------------- ideas, arrows, and headings

  /* An idea: a lit bulb. */
  function idea(name, parent, loc, scale = 1.0) {
    const root = group(name, parent, loc, scale);
    shape(`${name}-glow`, circlePts(0.75), glowMaterial(AMBER, 0.6), root, [0, 0.08]);
    shape(`${name}-base`, rrectPts(0.26, 0.24, 0.05), material(MIST, SLATE), root, [0, -0.28]);
    shape(`${name}-glass`, circlePts(0.3), material('#fff2c4', AMBER), root, [0, 0.08]);
    return root;
  }

  /* An arrow that points along the x axis from its origin and is length long. rot turns it. */
  function arrow(name, parent, loc, length = 0.95, colour = PAPER, rot = 0.0) {
    const root = group(name, parent, loc, 1.0, rot);
    branch(`${name}-shaft`, root, [0, 0], [length - 0.3, 0], colour, 0.1, 1.0);
    shape(`${name}-head`, [[length - 0.36, 0.22], [length, 0], [length - 0.36, -0.22]], material(colour), root);
    return root;
  }

  /* Three small discs in a row, for the three things the film counts. lit lists the ones that are
     bright, counted from 0, and the others are dim. */
  function three(name, parent, loc, lit = [0, 1, 2], scale = 1.0) {
    const root = group(name, parent, loc, scale);
    const discs = [0, 1, 2].map((k) => {
      const disc = group(`${name}-disc${k}`, root, [(k - 1) * 0.62, 0]);
      const on = lit.includes(k);
      if (on) shape(`${name}-glow${k}`, circlePts(0.55), glowMaterial(AMBER, 0.6), disc);
      shape(`${name}-rim${k}`, circlePts(0.23, null, null, 24), material(on ? AMBER_DEEP : SLATE), disc);
      shape(`${name}-face${k}`, circlePts(0.17, null, null, 24), on ? material('#fff2c4', AMBER) : material(INK700), disc);
      return disc;
    });
    return { root, discs };
  }

  /* The heading of a scene on one of the film's three behaviours: three discs, with the one that
     which picks lit, and the behaviour's name. It pops in at t and stays at the top left of the
     screen while the camera moves along path. */
  function heading(st, path, which, label, t) {
    const root = empty('heading', st.raw.front, [0, 0, nextZ(st.raw.front)]);
    pin(root, path, [-6.3, 3.7], st.raw.front);
    const inner = group('heading-in', root, [0, 0]);
    const wide = 2.5 + 0.27 * label.length;
    shape('heading-plate', rrectPts(wide, 0.92, 0.46).map(([x, y]) => [x + wide / 2 - 1.1, y]), material(INK900, null, 0.72), inner);
    three('heading-count', inner, [0, 0], [which]);
    text('heading-name', label, 0.5, material(PAPER), inner, [1.2, -0.02], { align: 'LEFT' });
    kit.pop(inner, t, 1.0, 0.4);
    return root;
  }

  return {
    STEP, BODIES, begin, group, stage, ramp, edge, zoom, body, agent, mini, bob, mood, blink, live, off,
    move, vanish, pulse, shake, spark, along, send, pin,
    folder, write, slip, board, post, sides, crowd, gathering, clock, drain, word, lock, sheet, writing, check, cross,
    fire, bowl, heart, human, computer, flicker, scorer, light, thought, notion, room, target, gear, shared, building, hatch,
    idea, arrow, three, heading,
  };
})();

if (typeof module !== 'undefined') module.exports = parts;
