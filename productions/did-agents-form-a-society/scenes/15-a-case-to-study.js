/* Scene 15: A case to study.

A question mark, and then a wall of small folders that fills the frame, with
a count on it and the agents' written thinking over it. Three researchers
stand in front of the wall. On the left a card opens: people, an arrow, and
agents. On the right another: four agents by themselves, and lines growing
between them.
*/
'use strict';

function build(T) {
  const { sec } = kit;
  parts.begin();

  const WALL = { x0: -7.56, y0: 3.95, step: 0.245, cols: 63, rows: 20 };
  const [COPIED, OWN] = [[-4.7, -2.45], [4.7, -2.45]];
  const cues = [];
  const end = sec(kit.frames());
  const tCase = T.at(0, 0.24);
  const tSeventy = T.at(0, 0.42);
  const tThinking = T.at(0, 0.7);
  const tCopied = T.start(1);
  const tOr = T.start(2);
  const tSociety = T.at(2, 0.3);

  kit.backdrop(5);
  kit.motes(16, 17);
  const st = parts.stage();

  // ------------------------------------------------------------ the question is open, and there is a case to study it in
  const open = kit.text('open', '?', 2.6, kit.material(kit.PAPER), st.front, [0, 0.6]);
  kit.appear(open, 0.5, tCase + 0.1, 0.3);
  cues.push({ t: 0.5, type: 'blip', pitch: 0.7 });

  const rnd = new kit.Random(83);
  const inks = [0, 1, 2, 3, 4, 5].map((which) => kit.material(parts.body(which)[0], null, 0.85));
  for (let c = 0; c < WALL.cols; c++) {
    for (let r = 0; r < WALL.rows; r++) {
      const slip = kit.shape(`slip${c}_${r}`, kit.rrectPts(0.17, 0.12, 0), inks[1 + rnd.randrange(5)], st.back, [WALL.x0 + c * WALL.step, WALL.y0 - r * WALL.step]);
      kit.appear(slip, tCase + 2.2 * (c / WALL.cols) + 0.4 * rnd.random(), null, 0.12);
    }
  }
  cues.push({ t: tCase, type: 'swoosh', dur: 2.4 });
  const plate = kit.shape('count-plate', kit.rrectPts(4.4, 1.5, 0.4), kit.material(kit.INK900, null, 0.88, { over: kit.INK700 }), st.props, [0, 1.65]);
  const count = kit.text('count', '70,000', 1.1, kit.material(kit.PAPER), st.props, [0, 1.62]);
  kit.appear(plate, tSeventy, null, 0.3);
  kit.appear(count, tSeventy + 0.1, null, 0.3);
  cues.push({ t: tSeventy, type: 'pop', pitch: 0.7 });
  [[-5.2, 2.7], [5.0, 2.9], [-3.4, 0.4], [3.6, 0.5]].forEach((at, k) => {
    const written = parts.thought(`thinking${k}`, st.front, at, 1.7, 1.0, [k % 2 ? -1 : 1, -0.7]);
    parts.writing(`thinking${k}-lines`, written.root, [0, 0], 3, 1.15, 90 + k);
    kit.pop(written.root, tThinking + 0.22 * k, 1.0, 0.35);
    cues.push({ t: tThinking + 0.22 * k, type: 'pop', pitch: 0.9 + 0.1 * k });
  });
  [-1.3, 0, 1.3].forEach((x, k) => {
    const made = parts.human(`researcher${k}`, st.cast, [x, -4.55], 0.4, k + 1, k === 2 ? -1 : 1);
    kit.pop(made.root, tCase + 0.8 + 0.2 * k, 0.4, 0.4);
    kit.key(made.arm, 'rot', kit.fr(tSeventy + 0.3 * k), 0.0);
    kit.key(made.arm, 'rot', kit.fr(tSeventy + 0.6 + 0.3 * k), (k === 2 ? -1 : 1) * 2.3);
  });

  /* A dark card to set one of the two answers on. */
  const cardAt = (name, at, t) => {
    const root = parts.group(name, st.props, at);
    kit.shape(`${name}-rim`, kit.rrectPts(5.0, 3.1, 0.34), kit.material(kit.INK500, kit.INK600), root);
    kit.shape(`${name}-face`, kit.rrectPts(4.78, 2.88, 0.26), kit.material(kit.INK800, kit.INK900), root);
    kit.pop(root, t, 1.0, 0.45);
    cues.push({ t, type: 'pop', pitch: 0.7 });
    return root;
  };

  // ------------------------------------------------------------ it may show that the agents copied all of this from people
  cardAt('copied', COPIED, tCopied);
  [-1.95, -1.25].forEach((dx, k) => kit.pop(parts.human(`model${k}`, st.cast, [COPIED[0] + dx, COPIED[1] - 1.1], 0.3, k + 2, 1).root, tCopied + 0.3 + 0.1 * k, 0.3, 0.35));
  kit.pop(parts.arrow('copied-gives', st.front, [COPIED[0] - 0.55, COPIED[1] - 0.2], 1.0), tCopied + 0.8, 1.0, 0.3);
  [[1.1, 0.15, 1], [1.85, -0.5, 3]].forEach(([dx, dy, which], k) => {
    kit.pop(parts.mini(`copier${k}`, st.cast, [COPIED[0] + dx, COPIED[1] + dy], 0.5, which).root, tCopied + 1.1 + 0.12 * k, 0.5, 0.3);
  });
  cues.push({ t: tCopied + 0.8, type: 'whoosh', gain: 0.5 });

  // ------------------------------------------------------------ or that some of what makes a society does not come from being human
  cardAt('own', OWN, tOr);
  const FOUR = [[-1.3, 0.55, 1], [1.3, 0.55, 4], [-1.3, -0.75, 2], [1.3, -0.75, 5]];
  FOUR.forEach(([dx, dy, which], k) => {
    kit.pop(parts.mini(`own${k}`, st.cast, [OWN[0] + dx, OWN[1] + dy], 0.5, which).root, tOr + 0.4 + 0.12 * k, 0.5, 0.3);
    cues.push({ t: tOr + 0.4 + 0.12 * k, type: 'blip', pitch: 1.0 + 0.1 * k, gain: 0.6 });
  });
  const talk = parts.group('own-talk', st.props, [0, 0]);        // made after the card, so that its lines lie over the card
  [[0, 1], [2, 3], [0, 2], [1, 3], [0, 3], [1, 2]].forEach(([i, j], k) => {
    const from = [OWN[0] + FOUR[i][0] * 0.6, OWN[1] + FOUR[i][1] * 0.6 - 0.05];
    const to = [OWN[0] + FOUR[j][0] * 0.6, OWN[1] + FOUR[j][1] * 0.6 - 0.05];
    kit.grow(kit.branch(`own-link${k}`, talk, from, to, kit.MINT, 0.08, 0.9), tSociety + 0.15 * k, 0.35);
    cues.push({ t: tSociety + 0.15 * k, type: 'tick', pitch: 1.0 + 0.08 * k, gain: 0.6 });
  });
  const which = [kit.ring('which0', st.front, COPIED, 2.3, kit.PAPER, 0.06), kit.ring('which1', st.front, OWN, 2.3, kit.PAPER, 0.06)];
  kit.flash(which[0], tCopied + 1.6, 0.9, 0.15);
  kit.flash(which[1], end - 1.8, 0.9, 0.15);

  // ------------------------------------------------------------ camera
  kit.camera(parts.ramp([[0, [0, 0.6, 18.5]], [tCase + 1.6, [0, -0.1, 20.5]], [tCopied - 0.3, [0, -0.3, 21]], [tCopied + 1.0, [-0.5, -0.45, 21]],
    [tOr - 0.3, [-0.5, -0.45, 21]], [tOr + 1.0, [0.5, -0.45, 21]], [end, [0.2, -0.45, 20.5]]]), 1.0);
  return cues;
}
