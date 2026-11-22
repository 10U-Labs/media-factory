/* Shared parts for every production's scenes: palette, flat shapes, text, motion, the stage,
and Pip, the round program that several films draw.

What only one production's scenes draw is in scripts in its folder, which use this
one. A scene's page loads this script, then the production's own, then the
scene, and Hyperframes renders the page a frame at a time (see page.py).

Every scene is built from flat 2D shapes set out in depth. The kit works out
where the camera sees each shape and writes that as the shape's SVG transform,
so a moving camera gives parallax, and it blurs what is nearer or farther than
the camera's focus.

Design units are screen units at depth z = 0, seen from the camera's start
height H0: the frame spans x from -8 to 8 and y from -4.5 to 4.5.

Motion is keyed: key(shape, path, frame, value) gives a property a value on a
frame, and between two keyed frames the value eases from one to the other. A
property that is never keyed keeps the value it was made with. Frames count
from 1. A scene is drawn for a time and for nothing else: render(t) gives the
same picture whatever was drawn before it.

The scenes of the first film were first made for Blender, and its look is kept
here. Three things the kit does come from that:

    A gradient runs across a box one unit larger on every side than its
    shape. So a shape shows only the middle of its gradient: a glow ends in a
    hard edge, and a thin bar is nearly one colour.

    A see-through colour is mixed with what is behind it as light. A browser
    mixes the two colours' sRGB numbers, which leaves a light colour over a
    dark one much darker, so seeThrough() works the mix out as light and gives
    the browser the colour and alpha that bring it there.

    Text is drawn at the size and weight in FACES, which are not a browser's
    own.
*/
'use strict';

const kit = (() => {
  const H0 = 20.0;
  const LENS = 0.036 * H0 / 16;            // the camera's lens and sensor, in metres
  const SENSOR = 0.036;
  const SVG = 'http://www.w3.org/2000/svg';

  // Colours (sRGB hex), one palette for every scene.
  const palette = {
    INK900: '#0b1030', INK800: '#121a47', INK700: '#1b2660', INK600: '#27347d', INK500: '#3a4aa3',
    MINT: '#4fe3c1', MINT_DEEP: '#1fae93', AMBER: '#ffc24b', AMBER_DEEP: '#f09a1f',
    CORAL: '#ff6b6b', CORAL_DEEP: '#d9434f', VIOLET: '#a78bfa', VIOLET_DEEP: '#7357e0',
    SKY: '#5cc8ff', SKY_DEEP: '#2b93e0', PAPER: '#f4f1ff', MIST: '#b9c0ea', SLATE: '#7c86c2',
    SKIN: '#f2c7a5', SKIN_SHADE: '#d9a07f',
  };
  const { INK900, INK800, INK700, INK600, INK500, MINT, MINT_DEEP, AMBER, VIOLET_DEEP, PAPER, MIST, SKIN, SKIN_SHADE } = palette;

  // zstep is how much nearer each new shape sits than the last. over is the colour that a see-through
  // shape lies over where its material names none: the backdrop sets it, to the middle of its sky.
  const state = { fps: 30, frames: 1, width: 1920, height: 1080, zstep: 0.002, over: null };
  let nodes = [];
  let materials = new Map();
  let view = null;
  let drawn = null;                        // every shape's SVG element, in order of depth
  let groups = null;                       // the SVG groups the elements are put in, far to near
  let canvas = null;
  const CLIP = 1.0;                        // the camera draws nothing nearer to it than this

  /* Start a scene: the frame rate, the number of frames, and the frame's size in pixels. */
  function setup(options) {
    Object.assign(state, options, { zstep: 0.002, over: null });
    nodes = [];
    materials = new Map();
    view = null;
    drawn = null;
    groups = null;
    canvas = null;
  }

  // ---------------------------------------------------------------- random numbers

  /* The Mersenne Twister as Python's random module runs it. The first film was
     laid out with Python's numbers, and a seed gives the same layout here. */
  class Random {
    constructor(seed) {
      this.mt = new Uint32Array(624);
      this.seedArray([seed >>> 0]);
    }

    seedArray(key) {
      const mt = this.mt;
      mt[0] = 19650218;
      for (let i = 1; i < 624; i++) {
        mt[i] = (Math.imul(1812433253, mt[i - 1] ^ (mt[i - 1] >>> 30)) + i) >>> 0;
      }
      let i = 1;
      let j = 0;
      for (let k = Math.max(624, key.length); k; k--) {
        mt[i] = ((mt[i] ^ Math.imul(mt[i - 1] ^ (mt[i - 1] >>> 30), 1664525)) + key[j] + j) >>> 0;
        i++;
        j++;
        if (i >= 624) { mt[0] = mt[623]; i = 1; }
        if (j >= key.length) j = 0;
      }
      for (let k = 623; k; k--) {
        mt[i] = ((mt[i] ^ Math.imul(mt[i - 1] ^ (mt[i - 1] >>> 30), 1566083941)) - i) >>> 0;
        i++;
        if (i >= 624) { mt[0] = mt[623]; i = 1; }
      }
      mt[0] = 0x80000000;
      this.at = 624;
    }

    bits() {
      const mt = this.mt;
      if (this.at >= 624) {
        const twist = (y, far) => far ^ (y >>> 1) ^ ((y & 1) ? 0x9908b0df : 0);
        for (let k = 0; k < 624; k++) {
          const y = (mt[k] & 0x80000000) | (mt[(k + 1) % 624] & 0x7fffffff);
          mt[k] = twist(y, mt[(k + 397) % 624]);
        }
        this.at = 0;
      }
      let y = mt[this.at++];
      y ^= y >>> 11;
      y ^= (y << 7) & 0x9d2c5680;
      y ^= (y << 15) & 0xefc60000;
      y ^= y >>> 18;
      return y >>> 0;
    }

    /* A number from 0 up to, and not reaching, 1. */
    random() {
      const a = this.bits() >>> 5;
      const b = this.bits() >>> 6;
      return (a * 67108864 + b) / 9007199254740992;
    }

    /* A whole number from 0 up to, and not reaching, n. */
    randrange(n) {
      const shift = Math.clz32(n);
      let r = this.bits() >>> shift;
      while (r >= n) r = this.bits() >>> shift;
      return r;
    }
  }

  // ---------------------------------------------------------------- timing

  /* Narration timings for one scene, in seconds. */
  class Timing {
    constructor(entry) {
      this.duration = entry.duration;
      this.lines = entry.lines.map((line) => [line.start, line.end]);
    }

    start(i) { return this.lines[i][0]; }

    end(i) { return this.lines[i][1]; }

    /* A moment part way through line i (share 0 is its start, 1 its end). */
    at(i, share) {
      const [s, e] = this.lines[i];
      return s + share * (e - s);
    }
  }

  /* Rounds a half to the even neighbour, as Python does. page.py counts a scene's frames with Python's rounding. */
  function round(x) {
    const low = Math.floor(x);
    const part = x - low;
    if (part < 0.5) return low;
    if (part > 0.5) return low + 1;
    return low % 2 === 0 ? low : low + 1;
  }

  const frames = () => state.frames;

  /* The frame shown at a time in seconds (frames count from 1). */
  const fr = (seconds) => Math.max(1, Math.min(state.frames, round(seconds * state.fps) + 1));

  const sec = (frame) => (frame - 1) / state.fps;

  /* Every step-th frame from f0 to f1, and f1 itself. */
  function every(step = 1, f0 = 1, f1 = null) {
    const last = f1 === null ? state.frames : f1;
    const out = [];
    for (let f = Math.max(1, f0); f <= last; f += step) out.push(f);
    if (out.length && out[out.length - 1] !== last) out.push(last);
    return out;
  }

  // ---------------------------------------------------------------- materials

  const clamp = (p) => Math.min(1.0, Math.max(0.0, p));

  function linear(hex) {
    const out = [];
    for (const i of [1, 3, 5]) {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      out.push(c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    }
    return out;
  }

  const encode = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

  const toHex = (encoded) => '#' + encoded.map((c) => Math.round(255 * clamp(c)).toString(16).padStart(2, '0')).join('');

  /* The colour that a see-through colour gives over another, the two mixed as light. */
  function laid(colour, alpha, over) {
    const back = linear(over);
    const front = linear(colour);
    return toHex(back.map((b, c) => encode(b * (1 - alpha) + front[c] * alpha)));
  }

  // What see-through shapes mostly lie over: the middle of the backdrop's sky, bare and with its glow.
  // backdrop() works the second out again for the colour of its own glow, and keeps it as state.over.
  const DEEP_BEHIND = laid(INK800, 0.5, INK900);
  const skyBehind = (glow) => laid(glow, 0.35 * 0.6 ** 1.2, DEEP_BEHIND);
  const SKY_BEHIND = skyBehind(VIOLET_DEEP);

  /* A flat colour, or a gradient from bottom to top of the shape, with alpha.

     options.alphaBottom is the alpha at the bottom of the shape, where it differs from the top's.
     options.over is the colour that a see-through shape mostly lies over; where none is given
     it is the middle of the backdrop's sky. Every shape's alpha is also multiplied by the shape's own, which is how shapes fade
     in and out. */
  function material(top, bottom = null, alpha = 1.0, options = {}) {
    const alphaBottom = options.alphaBottom === undefined ? null : options.alphaBottom;
    const over = options.over || state.over || SKY_BEHIND;
    const id = ['flat', top, bottom, alpha, alphaBottom, over].join('|');
    if (!materials.has(id)) {
      const kind = bottom === null && alphaBottom === null ? 'flat' : 'linear';
      materials.set(id, { id, kind, top, bottom: bottom || top, alpha, alphaBottom: alphaBottom === null ? alpha : alphaBottom, over, laid: new Map() });
    }
    return materials.get(id);
  }

  /* A soft round glow: bright in the middle, fading toward the edge. */
  function glowMaterial(colour, alpha = 0.5, power = 1.6, over = null) {
    const behind = over || state.over || SKY_BEHIND;
    const id = ['glow', colour, alpha, power, behind].join('|');
    if (!materials.has(id)) materials.set(id, { id, kind: 'radial', top: colour, alpha, power, over: behind });
    return materials.get(id);
  }

  /* The colour and alpha to draw so that a see-through colour looks as it would mixed as light
     with the colour behind it. */
  function seeThrough(colour, alpha, over) {
    if (alpha >= 1) return [colour, 1];
    if (alpha <= 0) return [colour, 0];
    const back = linear(over);
    const front = linear(colour);
    const behind = back.map(encode);
    const wanted = back.map((b, c) => encode(b * (1 - alpha) + front[c] * alpha));
    let draw = alpha;
    wanted.forEach((w, c) => {
      draw = Math.max(draw, w >= behind[c] ? (w - behind[c]) / (1 - behind[c]) : (behind[c] - w) / behind[c]);
    });
    return [toHex(wanted.map((w, c) => behind[c] + (w - behind[c]) / draw)), draw];
  }

  // ---------------------------------------------------------------- shapes

  /* Later shapes sit a hair closer to the camera, so they draw on top. */
  function nextZ(parent, lift = 0.0) {
    if (!parent) return 0.0;
    let root = parent;
    while (root.parent) root = root.parent;
    root.order += 1;
    return lift + root.order * state.zstep;
  }

  function node(kind, name, parent, loc, scale, rot) {
    let nest = 0;
    for (let up = parent; up; up = up.parent) nest += 1;
    const made = {
      kind, name, parent, nest, order: 0, index: nodes.length,
      x: loc[0], y: loc[1], z: loc[2], sx: scale, sy: scale, sz: scale, rot, alpha: 1.0,
      keys: {},           // loc, scale, rot, alpha: the frames each is keyed on
      world: null,
    };
    nodes.push(made);
    return made;
  }

  /* Something with a place and no shape of its own, for other shapes to hang on. */
  function empty(name, parent = null, loc = [0, 0, 0], scale = 1.0, rot = 0.0) {
    const z = loc.length === 3 ? loc[2] : nextZ(parent);
    return node('empty', name, parent, [loc[0], loc[1], z], scale, rot);
  }

  /* A depth layer. Its children use screen units at the camera's start position.
     options.sharp leaves the layer unblurred, for one whose blur would not show. */
  function layer(name, z, options = {}) {
    const made = empty(name, null, [0, 0, z], (H0 - z) / H0);
    made.sharp = options.sharp === true;
    return made;
  }

  /* A filled 2D shape from points given relative to its own origin at loc.

     options.smooth rounds the outline through its points. options.lift moves the shape nearer.
     options.rot turns it. options.inside names another shape, and this one is then drawn only
     where that one is: it is for a see-through shape that lies over two colours and shows over
     one of them alone, since a see-through colour is worked out over a single colour behind it. */
  function shape(name, pts, mat, parent, loc = [0, 0], options = {}) {
    const made = node('shape', name, parent, [loc[0], loc[1], nextZ(parent, options.lift || 0.0)], 1.0, options.rot || 0.0);
    made.pts = pts;
    made.mat = mat;
    made.smooth = options.smooth === true;
    made.inside = options.inside || null;
    return made;
  }

  function circlePts(r, rx = null, ry = null, n = 40) {
    const out = [];
    for (let i = 0; i < n; i++) {
      out.push([(rx || r) * Math.cos(2 * Math.PI * i / n), (ry || r) * Math.sin(2 * Math.PI * i / n)]);
    }
    return out;
  }

  function rrectPts(w, h, r, n = 6) {
    r = Math.min(r, w / 2, h / 2);
    if (r <= 0) return [[w / 2, h / 2], [-w / 2, h / 2], [-w / 2, -h / 2], [w / 2, -h / 2]];
    const out = [];
    const corners = [[w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, 90], [-w / 2 + r, -h / 2 + r, 180], [w / 2 - r, -h / 2 + r, 270]];
    for (const [cx, cy, a0] of corners) {
      for (let i = 0; i <= n; i++) {
        const a = (a0 + 90 * i / n) * Math.PI / 180;
        out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
    }
    return out;
  }

  /* A rounded bar whose left end sits at the origin, so scaling x grows it rightward. */
  const barPts = (w, h) => rrectPts(w, h, h / 2).map(([x, y]) => [x + w / 2, y]);

  /* A rounded bar hanging down from its origin: from (0, 0) to (0, -length). */
  function capsulePts(length, w, n = 10) {
    const r = w / 2;
    const out = [];
    for (let i = 0; i <= n; i++) out.push([r * Math.cos(Math.PI * i / n), r * Math.sin(Math.PI * i / n)]);
    for (let i = 0; i <= n; i++) {
      out.push([r * Math.cos(Math.PI + Math.PI * i / n), -length + r * Math.sin(Math.PI + Math.PI * i / n)]);
    }
    return out;
  }

  /* A curved band, such as a smile: radius r, width w, from angle a0 to a1 in degrees. */
  function arcPts(r, w, a0, a1, n = 16) {
    const at = (radius, angle) => [radius * Math.cos(angle * Math.PI / 180), radius * Math.sin(angle * Math.PI / 180)];
    const out = [];
    for (let i = 0; i <= n; i++) out.push(at(r + w / 2, a0 + (a1 - a0) * i / n));
    for (let i = 0; i <= n; i++) out.push(at(r - w / 2, a1 - (a1 - a0) * i / n));
    return out;
  }

  function starPts(rOut, rIn, points = 4) {
    const out = [];
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? rOut : rIn;
      out.push([r * Math.cos(Math.PI * i / points + Math.PI / 2), r * Math.sin(Math.PI * i / points + Math.PI / 2)]);
    }
    return out;
  }

  /* How each font is drawn. A font is scaled so that the box around all its glyphs is one unit
     tall, where a browser makes the em one unit: scale is the em over that box. The middle of
     that box sits on the text's origin, which leaves the baseline drop ems below it. And a font
     of many weights is drawn at the weight its file names as its default. The numbers are read
     from the files in src/fonts/. */
  const FACES = {
    Figtree: { family: 'Figtree', scale: 1000 / 1132, drop: 0.346, weight: 300 },
    JetBrainsMono: { family: 'JetBrains Mono', scale: 1000 / 1320, drop: 0.36, weight: 400 },
  };

  const ANCHORS = { LEFT: 'start', CENTER: 'middle', RIGHT: 'end' };

  /* A line of text, size units tall, set about loc. options.face names one of FACES, and
     options.align is LEFT, CENTER, or RIGHT. */
  function text(name, body, size, mat, parent, loc, options = {}) {
    const made = node('text', name, parent, [loc[0], loc[1], nextZ(parent)], 1.0, 0.0);
    made.body = body;
    made.size = size;
    made.mat = mat;
    made.face = FACES[options.face || 'Figtree'];
    made.anchor = ANCHORS[options.align || 'CENTER'];
    return made;
  }

  // ---------------------------------------------------------------- motion

  function smooth(p) {
    p = clamp(p);
    return p * p * (3 - 2 * p);
  }

  function easeOut(p) {
    p = clamp(p);
    return 1 - (1 - p) ** 3;
  }

  /* Overshoots a little and settles: for things that pop in. */
  function backOut(p, s = 1.9) {
    p = clamp(p) - 1;
    return 1 + (s + 1) * p ** 3 + s * p ** 2;
  }

  /* Progress from 0 to 1 as time t (seconds) goes from t0 to t1. */
  function span(t, t0, t1, ease = smooth) {
    if (t1 <= t0) return t >= t1 ? 1.0 : 0.0;
    return ease(clamp((t - t0) / (t1 - t0)));
  }

  const mix = (a, b, p) => (Array.isArray(a) ? a.map((x, i) => x + (b[i] - x) * p) : a + (b - a) * p);

  /* The frames one property is keyed on. Between two keys the value eases from one to the
     other, without passing either, and before the first key and after the last it holds. */
  class Track {
    constructor() {
      this.keys = new Map();
      this.curve = null;
    }

    key(frame, row) {
      this.keys.set(frame, row);
      this.curve = null;
    }

    build() {
      const fs = [...this.keys.keys()].sort((a, b) => a - b);
      const rows = fs.map((f) => this.keys.get(f));
      const slopes = rows.map(() => rows[0].map(() => 0));
      for (let c = 0; c < rows[0].length; c++) {
        for (let i = 1; i < fs.length - 1; i++) {
          const h0 = fs[i] - fs[i - 1];
          const h1 = fs[i + 1] - fs[i];
          const d0 = (rows[i][c] - rows[i - 1][c]) / h0;
          const d1 = (rows[i + 1][c] - rows[i][c]) / h1;
          if (d0 * d1 > 0) {
            const w0 = 2 * h1 + h0;
            const w1 = h1 + 2 * h0;
            slopes[i][c] = (w0 + w1) / (w0 / d0 + w1 / d1);
          }
        }
      }
      this.curve = { fs, rows, slopes };
    }

    at(frame) {
      if (!this.curve) this.build();
      const { fs, rows, slopes } = this.curve;
      const last = fs.length - 1;
      if (frame <= fs[0]) return rows[0];
      if (frame >= fs[last]) return rows[last];
      let low = 0;
      let high = last;
      while (high - low > 1) {
        const mid = (low + high) >> 1;
        if (fs[mid] <= frame) low = mid; else high = mid;
      }
      if (fs[low] === frame) return rows[low];
      const h = fs[high] - fs[low];
      const s = (frame - fs[low]) / h;
      const s2 = s * s;
      const s3 = s2 * s;
      return rows[low].map((v0, c) => (2 * s3 - 3 * s2 + 1) * v0 + (s3 - 2 * s2 + s) * h * slopes[low][c]
        + (3 * s2 - 2 * s3) * rows[high][c] + (s3 - s2) * h * slopes[high][c]);
    }
  }

  /* Key a property as it stands, on a frame. */
  function hold(made, path, frame) {
    let row;
    if (path === 'loc') row = [made.x, made.y, made.z];
    else if (path === 'scale') row = [made.sx, made.sy, made.sz];
    else if (path === 'rot') row = [made.rot];
    else if (path === 'alpha') row = [made.alpha];
    else throw new Error(`${made.name}: nothing is keyed by the name ${path}`);
    if (!made.keys[path]) made.keys[path] = new Track();
    made.keys[path].key(frame, row);
  }

  /* Give a property a value on a frame.

     path is 'loc', with [x, y] or [x, y, z]; 'scale', with one number or [x, y, z];
     'rot', with an angle in radians; or 'alpha', with a number from 0 to 1. */
  function key(made, path, frame, value) {
    if (path === 'loc') {
      made.x = value[0];
      made.y = value[1];
      if (value.length > 2) made.z = value[2];
    } else if (path === 'scale') {
      if (typeof value === 'number') {
        made.sx = made.sy = made.sz = value;
      } else {
        made.sx = value[0];
        made.sy = value[1];
        if (value.length > 2) made.sz = value[2];
      }
    } else if (path === 'rot') {
      made.rot = value;
    } else if (path === 'alpha') {
      made.alpha = value;
    }
    hold(made, path, frame);
  }

  const alpha = (made, frame, a) => key(made, 'alpha', frame, a);

  /* Key a property on every step-th frame from fn(seconds). */
  function track(made, path, fn, step = 1, f0 = 1, f1 = null) {
    for (const f of every(step, f0, f1)) key(made, path, f, fn(sec(f)));
  }

  /* Fade a shape in at tIn and out at tOut (seconds); either may be null. */
  function fade(made, tIn = null, tOut = null, dur = 0.4, step = 2) {
    track(made, 'alpha', (t) => {
      let v = 1.0;
      if (tIn !== null) v *= span(t, tIn, tIn + dur);
      if (tOut !== null) v *= 1 - span(t, tOut, tOut + dur);
      return v;
    }, step);
  }

  // ---------------------------------------------------------------- the stage

  /* A deep blue field with a soft glow and faint specks at a few depths. */
  function backdrop(seed = 3, glow = VIOLET_DEEP) {
    const rnd = new Random(seed);
    state.over = skyBehind(glow);
    const back = layer('back', -6.0, { sharp: true });
    shape('sky', rrectPts(28, 16, 0), material(INK800, INK900), back);
    shape('sky-glow', circlePts(9.0, null, 6.5), glowMaterial(glow, 0.35, 1.2, DEEP_BEHIND), back, [0, 0.5]);
    const specks = [];
    for (let i = 0; i < 70; i++) {
      const z = -5.0 + rnd.random() * 5.5;
      const s = (H0 - z) / H0;
      const x = (-9 + rnd.random() * 18) * 1.3;
      const y = (-5 + rnd.random() * 10) * 1.3;
      const r = 0.03 + rnd.random() * 0.04;
      const speck = shape(`speck${i}`, circlePts(r, null, null, 12), material(MIST, null, 0.25 + rnd.random() * 0.4), null);
      [speck.x, speck.y, speck.z] = [x * s, y * s, z];
      specks.push([speck, rnd.random() * 2 * Math.PI]);
    }
    for (const [speck, phase] of specks) {
      for (const f of every(6)) alpha(speck, f, 0.6 + 0.4 * Math.sin(sec(f) * 1.3 + phase));
    }
    return back;
  }

  /* Out-of-focus specks close to the camera, drifting slowly upward. */
  function motes(n = 30, seed = 5, colour = MINT) {
    const rnd = new Random(seed);
    for (let i = 0; i < n; i++) {
      const z = 3.0 + rnd.random() * 9.0;
      const s = (H0 - z) / H0;
      const x = -9 + rnd.random() * 18;
      const y = -5 + rnd.random() * 10;
      const r = 0.03 + rnd.random() * 0.05;
      const mote = shape(`mote${i}`, circlePts(r, null, null, 12), material(colour, null, 0.25 + rnd.random() * 0.35), null);
      const phase = rnd.random() * 2 * Math.PI;
      const speed = 0.05 + rnd.random() * 0.1;
      for (const f of every(4)) {
        const t = sec(f);
        key(mote, 'loc', f, [(x + 0.2 * Math.sin(t * 0.5 + phase)) * s, (y + speed * t) * s, z]);
      }
    }
  }

  /* A camera that looks straight down the z axis.
     path(t) returns [x, y, height] at time t in seconds; focus stays on depth focusZ. */
  function camera(path, focusZ = 1.0, fstop = 0.3) {
    view = { path, focusZ, fstop };
  }

  // ---------------------------------------------------------------- people

  /* A simple standing figure, not anyone's likeness: a jacket, legs, a head with hair and eyes,
     and two arms, of which the one in front works.

     The figure is widest at the shoulders and narrows to the hips, and its legs are about as
     long as its jacket. The origin is at the shoulders, and the feet are 4.3 below it. facing 1
     looks right, -1 looks left. The working arm hangs at angle 0 and rotates about the shoulder
     toward where the figure faces. It holds a pen, which options.pen: false leaves out. */
  function person(name, parent, loc = [0, 0], scale = 1.0, options = {}) {
    const { coat = '#5566c2', coatDeep = INK500, hair = '#3b2a26', facing = 1, pen = true } = options;
    const root = empty(name, parent, [loc[0], loc[1], nextZ(parent)], scale);
    const body = empty(`${name}-body`, root, [0, 0, 0]);
    shape(`${name}-legs`, [[-0.5, -2.1], [0.5, -2.1], [0.46, -4.3], [0.1, -4.3], [0, -2.75], [-0.1, -4.3], [-0.46, -4.3]], material(INK900, INK800), body);
    for (const side of [-1, 1]) {
      shape(`${name}-shoe${side}`, rrectPts(0.5, 0.17, 0.08), material(INK900), body, [side * 0.28 + 0.07 * facing, -4.3]);
    }
    const far = empty(`${name}-far-shoulder`, body, [-0.7 * facing, -0.28, 0], 1.0, -0.06 * facing);     // behind the jacket
    shape(`${name}-far-arm`, capsulePts(1.4, 0.28), material(coat, coatDeep), far);
    shape(`${name}-far-hand`, circlePts(0.14), material(SKIN, SKIN_SHADE), far, [0, -1.45]);
    shape(`${name}-coat`, [[-0.82, -0.22], [-0.5, 0.08], [0, 0.13], [0.5, 0.08], [0.82, -0.22], [0.74, -1.3], [0.62, -2.35], [-0.62, -2.35], [-0.74, -1.3]],
      material(coat, coatDeep), body, [0, 0], { smooth: true });
    shape(`${name}-collar`, [[-0.22, 0.08], [0.22, 0.08], [0, -0.5]], material(PAPER), body);
    shape(`${name}-neck`, rrectPts(0.3, 0.36, 0.12), material(SKIN_SHADE), body, [0, 0.17]);
    const head = empty(`${name}-head`, body, [0.05 * facing, 0.74, nextZ(body)], 1.15);
    shape(`${name}-face`, circlePts(0.44), material(SKIN, SKIN_SHADE), head);
    shape(`${name}-ear`, circlePts(0.08), material(SKIN_SHADE), head, [-0.4 * facing, -0.02]);
    shape(`${name}-hair`, [[-0.47 * facing, 0.02], [-0.44 * facing, 0.32], [-0.12 * facing, 0.52], [0.28 * facing, 0.48], [0.46 * facing, 0.2], [0.3 * facing, 0.26], [-0.2 * facing, 0.22]],
      material(hair), head, [0, 0], { smooth: true });
    for (const side of [-1, 1]) {
      shape(`${name}-eye${side}`, circlePts(0.045, null, 0.06), material(INK900), head, [0.1 * facing + side * 0.13, 0.0]);
    }
    shape(`${name}-smile`, arcPts(0.1, 0.035, 210, 330), material(INK900), head, [0.1 * facing, -0.14]);
    const shoulder = empty(`${name}-shoulder`, body, [0.7 * facing, -0.28, nextZ(body)]);
    shape(`${name}-arm`, capsulePts(1.5, 0.3), material(coat, coatDeep), shoulder);
    shape(`${name}-hand`, circlePts(0.15), material(SKIN, SKIN_SHADE), shoulder, [0, -1.55]);
    if (pen) shape(`${name}-pen`, rrectPts(0.06, 0.42, 0.03).map(([x, y]) => [x, y - 1.75]), material(INK900), shoulder);
    return { root, body, head, arm: shoulder, facing };
  }

  // ---------------------------------------------------------------- Pip

  const radians = (deg) => deg * Math.PI / 180;

  /* Pip: a small round program with a screen for a face, two arms, and an antenna. Several
     films draw their programs as Pip, each in a body colour of its own.

     The origin is the middle of the body. Arms hang down at angle 0 and rotate
     about the shoulder; positive angles swing the right arm outward and up.
     Returns Pip's parts. lights lists the shapes that are lit while the program runs: its
     eyes and its mouth. */
  function pip(name, parent, loc = [0, 0], scale = 1.0, body = MINT, bodyDeep = MINT_DEEP) {
    const root = empty(name, parent, [loc[0], loc[1], nextZ(parent)], scale);
    const rig = empty(`${name}-rig`, root, [0, 0, 0]);          // bobbing and squash live here
    const halo = shape(`${name}-halo`, circlePts(2.0), glowMaterial(body, 0.3, 2.2), rig, [0, 0.1]);
    const arms = {};
    for (const side of [-1, 1]) {
      const shoulder = empty(`${name}-shoulder${side}`, rig, [side * 0.8, -0.18, nextZ(rig)]);
      shape(`${name}-arm${side}`, capsulePts(0.5, 0.22), material(body, bodyDeep), shoulder);
      shape(`${name}-hand${side}`, circlePts(0.15), material(body, bodyDeep), shoulder, [0, -0.52]);
      shoulder.rot = side * radians(18);
      arms[side < 0 ? 'left' : 'right'] = shoulder;
    }
    const antenna = empty(`${name}-antenna`, rig, [0, 0.72, nextZ(rig)]);
    shape(`${name}-stem`, capsulePts(0.34, 0.07), material(bodyDeep), antenna, [0, 0.34]);
    // The bulb's glow lies over the halo, a third of the way out from the halo's middle.
    const haloBehind = laid(body, 0.3 * (2 / 3) ** 2.2, state.over || SKY_BEHIND);
    const bulbGlow = shape(`${name}-bulb-glow`, circlePts(0.45), glowMaterial(AMBER, 0.55, 1.6, haloBehind), antenna, [0, 0.38]);
    shape(`${name}-bulb`, circlePts(0.11), material('#fff2c4', AMBER), antenna, [0, 0.38]);
    shape(`${name}-body`, rrectPts(1.7, 1.5, 0.62), material(body, bodyDeep), rig);
    shape(`${name}-shine`, circlePts(0.2, null, 0.1), material(PAPER, null, 0.45, { over: body }), rig, [-0.48, 0.5], { rot: 0.5 });
    const screen = shape(`${name}-screen`, rrectPts(1.28, 0.86, 0.34), material(INK800, INK900), rig, [0, 0.06]);
    const face = empty(`${name}-face`, rig, [0, 0.06, nextZ(rig)]);
    const eyes = empty(`${name}-eyes`, face, [0, 0.08, nextZ(face)]);
    const eyeList = [];
    const lights = [];
    for (const side of [-1, 1]) {
      const e = empty(`${name}-eye${side}`, eyes, [side * 0.27, 0, nextZ(face)]);
      // The glow has the body's colour, so it shows on the dark screen and not on the body around it.
      lights.push(shape(`${name}-eyeglow${side}`, circlePts(0.3), glowMaterial(body, 0.4, 1.6, DEEP_BEHIND), e, [0, 0], { inside: screen }));
      lights.push(shape(`${name}-eyeball${side}`, circlePts(0.12, null, 0.16), material('#d9fff5', body), e));
      lights.push(shape(`${name}-spark${side}`, circlePts(0.035), material(PAPER), e, [0.04, 0.06]));
      eyeList.push(e);
    }
    const mouth = shape(`${name}-mouth`, arcPts(0.13, 0.05, 200, 340), material(body), face, [0, -0.1]);
    lights.push(mouth);
    return { root, rig, halo, arms, eyes, eyeList, mouth, antenna, bulbGlow, face, lights };
  }

  /* Bob gently, with a slight squash, and let the antenna sway. */
  function pipIdle(p, t0 = 0.0, t1 = null, phase = 0.0, step = 2) {
    const last = t1 === null ? sec(frames()) : t1;
    for (const f of every(step, fr(t0), fr(last))) {
      const t = sec(f) + phase;
      const b = Math.sin(t * 2.2);
      key(p.rig, 'loc', f, [0, 0.08 * b, 0]);
      key(p.rig, 'scale', f, [1 - 0.015 * b, 1 + 0.015 * b, 1]);
      key(p.antenna, 'rot', f, 0.12 * Math.sin(t * 2.2 - 0.9));
      alpha(p.bulbGlow, f, 0.8 + 0.2 * Math.sin(t * 3.1));
    }
  }

  function pipBlink(p, times) {
    for (const t of times) {
      const f = fr(t);
      for (const [df, s] of [[-3, 1.0], [0, 0.08], [3, 1.0]]) {
        for (const e of p.eyeList) key(e, 'scale', f + df, [1, s, 1]);
      }
    }
  }

  /* Glance: the eyes slide across the screen within dur seconds, ending at time t + dur. */
  function pipLook(p, t, dx, dy = 0.0, dur = 0.25) {
    const eyes = p.eyes;
    const z = eyes.z;
    hold(eyes, 'loc', fr(t));
    key(eyes, 'loc', fr(t + dur), [dx, 0.08 + dy, z]);
  }

  /* Swing an arm to deg (0 hangs down, 90 points sideways, 160 straight up) by t + dur. */
  function pipArm(p, side, t, deg, dur = 0.3) {
    const shoulder = p.arms[side];
    const s = side === 'right' ? 1 : -1;
    hold(shoulder, 'rot', fr(t));
    key(shoulder, 'rot', fr(t + dur), s * radians(deg));
  }

  function pipWave(p, t0, t1, rate = 7.0) {
    const shoulder = p.arms.right;
    hold(shoulder, 'rot', fr(t0));
    for (const f of every(2, fr(t0) + 4, fr(t1))) {
      key(shoulder, 'rot', f, radians(135 + 22 * Math.sin((sec(f) - t0) * rate)));
    }
    key(shoulder, 'rot', fr(t1 + 0.35), radians(18));
  }

  /* Widen (above 1) or narrow (below 1) both eyes by time t + dur. */
  function pipEyes(p, t, sx, sy, dur = 0.2) {
    for (const e of p.eyeList) {
      hold(e, 'scale', fr(t));
      key(e, 'scale', fr(t + dur), [sx, sy, 1]);
    }
  }

  // ---------------------------------------------------------------- entrances, branches, and props

  /* Scale a shape up from nothing at t, overshooting a little, and back to nothing at tOut.

     The frame nearest t can fall a little after t, where the shape is already part grown. So
     the shape is also keyed at nothing on the frame before that one, or it would grow toward
     that size from the first frame. */
  function pop(made, t, s = 1.0, dur = 0.45, tOut = null, outDur = 0.3) {
    const first = fr(t);
    key(made, 'scale', 1, 0.001);
    key(made, 'scale', Math.max(1, first - 1), 0.001);
    for (const f of every(1, first, fr(t + dur))) {
      key(made, 'scale', f, Math.max(0.001, s * backOut((sec(f) - t) / dur)));
    }
    if (tOut !== null) {
      key(made, 'scale', fr(tOut), s);
      key(made, 'scale', fr(tOut + outDur), 0.001);
    }
  }

  /* Fade a shape in at tIn and out at tOut, keying only around those moments. */
  function appear(made, tIn = null, tOut = null, dur = 0.3, a = 1.0) {
    alpha(made, 1, tIn !== null ? 0.0 : a);
    if (tIn !== null) {
      alpha(made, fr(tIn), 0.0);
      alpha(made, fr(tIn + dur), a);
    }
    if (tOut !== null) {
      alpha(made, fr(tOut), a);
      alpha(made, fr(tOut + dur), 0.0);
    }
  }

  /* A straight line from point a to point b. It grows out of a when its x scale goes from 0 to 1. */
  function branch(name, parent, a, b, colour = MIST, w = 0.07, opacity = 0.55) {
    const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
    return shape(name, barPts(length, w), material(colour, null, opacity), parent, a,
      { rot: Math.atan2(b[1] - a[1], b[0] - a[0]) });
  }

  /* Grow a branch out from its start at t (and pull it back in at tOut). */
  function grow(made, t, dur = 0.35, tOut = null) {
    key(made, 'scale', 1, [0.001, 1, 1]);
    key(made, 'scale', fr(t), [0.001, 1, 1]);
    key(made, 'scale', fr(t + dur), [1, 1, 1]);
    if (tOut !== null) {
      key(made, 'scale', fr(tOut), [1, 1, 1]);
      key(made, 'scale', fr(tOut + dur), [0.001, 1, 1]);
    }
  }

  /* A score: a number on a small dark pill. Pop its root in to show it. */
  function tag(name, parent, loc, label, colour = PAPER, size = 0.26) {
    const root = empty(name, parent, [loc[0], loc[1], nextZ(parent)]);
    const w = 0.3 + 0.62 * size * label.length;
    const pill = shape(`${name}-pill`, rrectPts(w, size * 1.6, size * 0.8), material(INK900, null, 0.8), root);
    const body = text(`${name}-text`, label, size, material(colour), root, [0, -size * 0.04], { face: 'JetBrainsMono' });
    root.sx = root.sy = root.sz = 0.001;
    return { root, pill, text: body };
  }

  /* A thin circle, hidden at first; light it with flash or appear. */
  function ring(name, parent, loc, r = 0.6, colour = AMBER, w = 0.08, lift = 0.0) {
    const made = shape(name, arcPts(r, w, 0, 360, 48), material(colour), parent, loc, { lift });
    alpha(made, 1, 0.0);
    return made;
  }

  /* Light a ring at t: it swells a little and fades out over dur seconds.

     The ring is dark on the frame before the one nearest t, and on the last frame of the
     flash. Those two frames can fall a little inside the flash, and without a dark key on each
     the ring would show faintly from the first frame until t, and stay faintly lit after the
     flash. */
  function flash(made, t, dur = 0.9, growBy = 0.5) {
    const first = fr(t);
    const last = Math.max(fr(t + dur), first + 1);
    alpha(made, Math.max(1, first - 1), 0.0);
    for (const f of every(1, first, last)) {
      const q = span(sec(f), t, t + dur, (v) => v);
      const s = 1 + growBy * q;
      key(made, 'scale', f, [s, s, 1]);
      alpha(made, f, f === last ? 0.0 : Math.sin(Math.PI * q));
    }
  }

  /* A sheet in front of everything that fades in at t: the scene's fade to dark. */
  function veil(t, dur = 1.0, colour = INK900) {
    const front = layer('veil', 12.5, { sharp: true });
    const made = shape('veil-sheet', rrectPts(30, 18, 0), material(colour), front);
    appear(made, t, null, dur);
    return made;
  }

  /* A large computer screen on a stand. Returns the root and the dark screen face. */
  function screenStand(name, parent, loc, w = 5.6, h = 3.6) {
    const root = empty(name, parent, [loc[0], loc[1], nextZ(parent)]);
    shape(`${name}-foot`, rrectPts(2.4, 0.22, 0.11), material(INK600, INK700), root, [0, -h / 2 - 1.05]);
    shape(`${name}-neck`, [[-0.3, -h / 2 + 0.1], [0.3, -h / 2 + 0.1], [0.45, -h / 2 - 1.0], [-0.45, -h / 2 - 1.0]], material(INK600, INK700), root);
    shape(`${name}-shadow`, rrectPts(w + 0.6, h + 0.6, 0.5), glowMaterial(INK900, 0.7, 0.8), root, [0.15, -0.2]);
    shape(`${name}-frame`, rrectPts(w, h, 0.25), material(INK500, INK600), root);
    const face = shape(`${name}-face`, rrectPts(w - 0.36, h - 0.36, 0.14), material('#16205a', INK900), root);
    return { root, face };
  }

  // ---------------------------------------------------------------- drawing

  /* Where a node is on a frame: a 2D matrix for x and y, its depth, and its alpha. */
  function place(made, frame) {
    const keys = made.keys;
    let { x, y, z, sx, sy, sz, rot, alpha: a } = made;
    if (keys.loc) [x, y, z] = keys.loc.at(frame);
    if (keys.scale) [sx, sy, sz] = keys.scale.at(frame);
    if (keys.rot) rot = keys.rot.at(frame)[0];
    if (keys.alpha) a = keys.alpha.at(frame)[0];
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);
    const local = [sx * cos, sx * sin, -sy * sin, sy * cos, x, y];
    const up = made.parent ? made.parent.world : { m: [1, 0, 0, 1, 0, 0], z: 0, sz: 1 };
    const p = up.m;
    made.world = {
      m: [
        p[0] * local[0] + p[2] * local[1], p[1] * local[0] + p[3] * local[1],
        p[0] * local[2] + p[2] * local[3], p[1] * local[2] + p[3] * local[3],
        p[0] * local[4] + p[2] * local[5] + p[4], p[1] * local[4] + p[3] * local[5] + p[5],
      ],
      z: up.z + up.sz * z,
      sz: up.sz * sz,
      alpha: a,
    };
  }

  function element(tag, attributes, parent = null) {
    const made = document.createElementNS(SVG, tag);
    for (const [name, value] of Object.entries(attributes)) made.setAttribute(name, value);
    if (parent) parent.appendChild(made);
    return made;
  }

  /* The handles that round an outline through its points: at each point they lie along the
     line that bisects the turn there, a set share of the way toward each neighbour. */
  function handles(pts) {
    const n = pts.length;
    return pts.map((p, i) => {
      const before = pts[(i + n - 1) % n];
      const after = pts[(i + 1) % n];
      const a = [p[0] - before[0], p[1] - before[1]];
      const b = [after[0] - p[0], after[1] - p[1]];
      let la = Math.hypot(a[0], a[1]) || 1;
      let lb = Math.hypot(b[0], b[1]) || 1;
      const along = [b[0] / lb + a[0] / la, b[1] / lb + a[1] / la];
      const length = Math.hypot(along[0], along[1]) * 2.5614;
      if (length === 0) return [p, p];
      la = Math.min(la, 5 * lb);
      lb = Math.min(lb, 5 * la);
      return [
        [p[0] - along[0] * la / length, p[1] - along[1] * la / length],
        [p[0] + along[0] * lb / length, p[1] + along[1] * lb / length],
      ];
    });
  }

  const at = ([x, y]) => `${x.toFixed(4)},${y.toFixed(4)}`;

  /* A shape's outline as an SVG path. */
  function outline(made) {
    const pts = made.pts;
    if (!made.smooth) return `M${pts.map(at).join('L')}Z`;
    const hs = handles(pts);
    const steps = pts.map((p, i) => {
      const next = (i + 1) % pts.length;
      return `C${at(hs[i][1])} ${at(hs[next][0])} ${at(pts[next])}`;
    });
    return `M${at(pts[0])}${steps.join('')}Z`;
  }

  /* The fill of a shape with a gradient. The gradient runs across a box one unit larger on
     every side than the shape's points. */
  function paint(made, defs, ids) {
    const mat = made.mat;
    const all = made.smooth ? handles(made.pts).flat() : [];
    const low = (axis) => Math.min(...made.pts.map((pt) => pt[axis] - 1), ...all.map((pt) => pt[axis]));
    const high = (axis) => Math.max(...made.pts.map((pt) => pt[axis] + 1), ...all.map((pt) => pt[axis]));
    const mid = [(low(0) + high(0)) / 2, (low(1) + high(1)) / 2];
    const half = [(high(0) - low(0)) / 2, (high(1) - low(1)) / 2];
    const id = [mat.id, ...mid, ...half].join('|');
    if (!ids.has(id)) {
      const name = `paint${ids.size}`;
      const units = { id: name, gradientUnits: 'userSpaceOnUse' };
      let gradient;
      const stops = [];
      if (mat.kind === 'radial') {
        gradient = element('radialGradient', {
          ...units, cx: 0, cy: 0, r: 1, gradientTransform: `translate(${mid[0]} ${mid[1]}) scale(${half[0]} ${half[1]})`,
        }, defs);
        for (let i = 0; i <= 48; i++) stops.push([i / 48, ...seeThrough(mat.top, mat.alpha * (1 - i / 48) ** mat.power, mat.over)]);
      } else {
        gradient = element('linearGradient', { ...units, x1: 0, y1: mid[1] - half[1], x2: 0, y2: mid[1] + half[1] }, defs);
        const bottom = linear(mat.bottom);
        const top = linear(mat.top);
        for (let i = 0; i <= 12; i++) {
          const colour = toHex(bottom.map((v, c) => encode(mix(v, top[c], i / 12))));
          stops.push([i / 12, ...seeThrough(colour, mix(mat.alphaBottom, mat.alpha, i / 12), mat.over)]);
        }
      }
      for (const [offset, colour, opacity] of stops) {
        element('stop', { offset: offset.toFixed(4), 'stop-color': colour, 'stop-opacity': opacity.toFixed(4) }, gradient);
      }
      ids.set(id, name);
    }
    return `url(#${ids.get(id)})`;
  }

  /* Build the page's SVG once: an element for each shape. render() puts them in groups. */
  function mount(svg) {
    canvas = svg;
    const defs = element('defs', {}, svg);
    const ids = new Map();
    drawn = nodes.filter((made) => made.kind !== 'empty').map((made) => draw(made, defs, ids));
    groups = [];
  }

  /* Make the SVG element of one shape or line of text. */
  function draw(made, defs, ids) {
    let root = made;
    while (root.parent) root = root.parent;
    const shown = { made, root, el: null, top: null, was: {}, window: null, depth: 0, blur: 0 };
    if (made.kind === 'text') {
      shown.el = element('text', {
        'data-name': made.name, 'font-family': made.face.family, 'font-weight': made.face.weight, 'font-size': 100, 'text-anchor': made.anchor,
        y: 100 * made.face.drop,
      });
      shown.el.textContent = made.body;
      shown.top = shown.el;
      return shown;
    }
    shown.el = element('path', { 'data-name': made.name, d: outline(made) });
    shown.top = shown.el;
    if (made.inside) {
      const id = `inside${made.index}`;
      shown.window = { made: made.inside, el: element('path', { d: outline(made.inside) }, element('clipPath', { id }, defs)), was: {} };
      shown.top = element('g', { 'clip-path': `url(#${id})` });
      shown.top.appendChild(shown.el);
    }
    if (made.mat.kind !== 'flat') shown.el.setAttribute('fill', paint(made, defs, ids));
    return shown;
  }

  /* Where the camera at [cx, cy, cz] sees a shape, as an SVG transform. */
  function seen(made, cx, cy, cz) {
    const w = made.world;
    const k = state.width / 16 * H0 / (cz - w.z);
    const size = made.kind === 'text' ? made.size * made.face.scale / 100 : 1;
    const flip = made.kind === 'text' ? -size : 1;
    const m = [k * w.m[0] * size, -k * w.m[1] * size, k * w.m[2] * flip, -k * w.m[3] * flip,
      state.width / 2 + k * (w.m[4] - cx), state.height / 2 - k * (w.m[5] - cy)];
    return `matrix(${m.map((v) => v.toFixed(4)).join(' ')})`;
  }

  function set(shown, name, value) {
    if (shown.was[name] === value) return;
    shown.was[name] = value;
    shown.el.setAttribute(name, value);
  }

  /* Put every shape in the page in order of its depth, far to near, and blur each by its depth.

     Shapes that follow one another in depth, hang on one top-level shape or layer, and are blurred
     alike share a group, and the group is blurred as one. A group keeps to one layer because the
     browser blurs the whole box around a group: specks scattered over the frame, blurred as one
     group, would cost a blur of the whole frame. Two shapes can come out at one depth, and then
     the one nested deeper is in front. The camera blurs a point into a disc; a Gaussian blur a
     quarter as wide spreads light as far, and it is taken to the nearest quarter of a pixel. */
  function arrange(cz) {
    const focus = cz - view.focusZ;
    const spread = LENS * LENS / (view.fstop * (focus - LENS)) / SENSOR * state.width;
    for (const shown of drawn) {
      const z = shown.made.world.z;
      const far = Math.max(cz - z, CLIP);
      const sigma = shown.root.sharp ? 0 : spread * Math.abs(far - focus) / far / 4;
      shown.depth = Math.round(z * 1e7);
      shown.blur = sigma < 0.3 ? 0 : Math.round(sigma * 4);
    }
    drawn.sort((a, b) => a.depth - b.depth || a.made.nest - b.made.nest || a.made.index - b.made.index);
    let used = 0;
    let from = 0;
    for (let i = 1; i <= drawn.length; i++) {
      if (i < drawn.length && drawn[i].blur === drawn[from].blur && drawn[i].root === drawn[from].root) continue;
      if (used === groups.length) groups.push({ el: element('g', {}, canvas), order: '', blur: 0 });
      const group = groups[used];
      const blur = drawn[from].blur;
      if (group.blur !== blur) {
        group.el.style.filter = blur ? `blur(${(blur / 4).toFixed(2)}px)` : '';
        group.blur = blur;
      }
      let order = '';
      for (let k = from; k < i; k++) order += `${drawn[k].made.index} `;
      if (order !== group.order) {
        for (let k = from; k < i; k++) group.el.appendChild(drawn[k].top);
        group.order = order;
      }
      used += 1;
      from = i;
    }
    for (let i = used; i < groups.length; i++) groups[i].order = '';
  }

  /* Draw the scene as it is at time t, in seconds. */
  function render(t) {
    const frame = t * state.fps + 1;
    const [cx, cy, cz] = view.path(t);
    for (const made of nodes) place(made, frame);
    arrange(cz);
    for (const shown of drawn) {
      const made = shown.made;
      const w = made.world;
      const mat = made.mat;
      const own = clamp(w.alpha);
      const size = Math.hypot(w.m[0], w.m[1]) * state.width / 16 * H0 / (cz - w.z);
      let fill = null;
      let opacity = own;
      if (mat.kind === 'flat' || made.kind === 'text') {
        const step = Math.round(own * mat.alpha * 1000);
        if (!mat.laid.has(step)) mat.laid.set(step, seeThrough(mat.top, step / 1000, mat.over));
        [fill, opacity] = mat.laid.get(step);
      }
      if (opacity <= 0.002 || size < 0.5 || cz - w.z < CLIP) {     // faded out, shrunk to less than a pixel, or too near the camera
        set(shown, 'display', 'none');
        continue;
      }
      set(shown, 'display', 'inline');
      if (fill) set(shown, 'fill', fill);
      set(shown, 'opacity', opacity.toFixed(3));
      set(shown, 'transform', seen(made, cx, cy, cz));
      if (shown.window) set(shown.window, 'transform', seen(made.inside, cx, cy, cz));
    }
  }

  /* How many shapes the scene has, for a check that it built. */
  const count = () => nodes.length;

  return {
    ...palette, DEEP_BEHIND, SKY_BEHIND, H0, Random, Timing, setup, state, laid,
    frames, fr, sec, every, clamp, smooth, easeOut, backOut, span, mix,
    key, hold, alpha, track, fade,
    material, glowMaterial, nextZ, empty, layer, shape, text,
    circlePts, rrectPts, barPts, capsulePts, arcPts, starPts,
    backdrop, motes, camera, person, pip, pipIdle, pipBlink, pipLook, pipArm, pipWave, pipEyes,
    pop, appear, branch, grow, tag, ring, flash, veil, screenStand,
    mount, render, count,
  };
})();

if (typeof module !== 'undefined') module.exports = kit;
