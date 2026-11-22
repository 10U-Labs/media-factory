/* Scene 12: Not people.

Three pictures of people in a row: two share a bowl of food by a fire; a line
of people stretches back into the distance; two face each other with a heart
between them. Under each, the same picture for an agent: an agent beside a
bowl with a cross on it; an agent with empty rings where the line would be;
two agents with a grey heart between them, and a question mark on it. Then
the pictures of people go, and a large question mark stands in their place.
*/
'use strict';

function build(T) {
  const { sec } = kit;
  parts.begin();

  const COLS = [-5.0, 0.2, 5.2];
  const [TOP, LOW] = [0.55, -3.3];                 // where the people stand, and where the agents do
  const cues = [];
  const end = sec(kit.frames());
  const tNeed = T.at(0, 0.55);
  const tAncestors = T.start(1);
  const tFeel = T.start(2);
  const tNoBody = T.start(3);
  const tNoAncestors = T.start(4);
  const tNoFeel = T.start(5);
  const tWhy = T.start(6);

  kit.backdrop(5);
  kit.motes(20, 17);
  const st = parts.stage();
  const reasons = [];                              // the pictures of people, which go when the scene asks why

  const shown = (root, t, s = 1.0, pitch = 1.0) => {
    kit.pop(root, t, s, 0.4);
    cues.push({ t, type: 'pop', pitch });
  };

  // ------------------------------------------------------------ among people
  [-2.4, -1.2, 0, 1.2, 2.4].forEach((x, k) => {
    const made = parts.human(`among${k}`, st.cast, [x, 0.2 + 0.25 * (k % 2)], 0.46, k, k < 2 ? 1 : -1);
    kit.pop(made.root, 0.5 + 0.1 * k, 0.46, 0.4, tNeed - 0.4 + 0.03 * k);
    cues.push({ t: 0.5 + 0.1 * k, type: 'pop', pitch: 0.7 + 0.08 * k, gain: 0.6 });
  });

  // ------------------------------------------------------------ people need each other to stay alive
  const need = parts.group('need', st.props, [COLS[0], TOP]);
  parts.fire('need-fire', need, [0, 0.25], 1.0);
  shown(need, tNeed, 1.0, 0.8);
  const givers = [parts.human('giver', st.cast, [COLS[0] - 1.65, TOP], 0.46, 3, 1), parts.human('taker', st.cast, [COLS[0] + 1.65, TOP], 0.46, 1, -1)];
  givers.forEach((made, k) => kit.pop(made.root, tNeed + 0.15 * k, 0.46, 0.4));
  const food = parts.bowl('food', st.front, [COLS[0] - 0.75, TOP + 1.55], 0.85);
  kit.pop(food, tNeed + 0.4, 0.85, 0.3);
  kit.key(givers[0].arm, 'rot', kit.fr(tNeed + 0.5), 0.0);
  kit.key(givers[0].arm, 'rot', kit.fr(tNeed + 0.9), 1.2);
  parts.move(food, tNeed + 1.0, [COLS[0] + 0.75, TOP + 1.6], 0.8);
  kit.key(givers[1].arm, 'rot', kit.fr(tNeed + 1.2), 0.0);
  kit.key(givers[1].arm, 'rot', kit.fr(tNeed + 1.7), -1.2);
  cues.push({ t: tNeed + 1.0, type: 'whoosh', gain: 0.4 });
  reasons.push(need, givers[0].root, givers[1].root, food);

  // ------------------------------------------------------------ people come from ancestors who lived in groups
  [0.46, 0.38, 0.31, 0.25, 0.2, 0.16].forEach((s, k) => {
    const back = parts.human(`ancestor${k}`, kit.layer(`far${k}`, 0.5 - 0.02 * k, { sharp: true }), [COLS[1] + 1.4 - 0.8 * k + 0.065 * k * k, TOP + 0.43 * k - 0.015 * k * k], s, k, -1);
    kit.pop(back.root, tAncestors + 0.2 * k, s, 0.35);
    cues.push({ t: tAncestors + 0.2 * k, type: 'blip', pitch: 1.1 - 0.08 * k, gain: 0.5 });
    reasons.push(back.root);
  });

  // ------------------------------------------------------------ people have feelings for each other
  const lovers = [parts.human('lover0', st.cast, [COLS[2] - 1.25, TOP], 0.46, 4, 1), parts.human('lover1', st.cast, [COLS[2] + 1.25, TOP], 0.46, 2, -1)];
  lovers.forEach((made, k) => kit.pop(made.root, tFeel + 0.15 * k, 0.46, 0.4));
  const love = parts.heart('love', st.front, [COLS[2], TOP + 2.95], 1.1);
  shown(love, tFeel + 0.5, 1.1, 1.2);
  for (let t = tFeel + 1.3; t < tWhy - 0.8; t += 1.1) parts.pulse(love, t, 1.1, 1.18, 0.4);
  reasons.push(lovers[0].root, lovers[1].root, love);

  // ------------------------------------------------------------ an agent has no body to keep alive
  const rule = kit.branch('rule', st.props, [-7.6, -0.25], [7.6, -0.25], kit.MIST, 0.04, 0.4);
  kit.grow(rule, tNoBody - 0.5, 0.6);
  const hungry = parts.agent('unfed', st.cast, [COLS[0] - 0.9, LOW + 0.95], 0.8, 1);
  kit.pop(hungry.root, tNoBody, 0.8, 0.4);
  kit.pipLook(hungry, tNoBody + 0.6, 0.13, -0.05);
  const empty = parts.bowl('unneeded', st.props, [COLS[0] + 0.9, LOW + 0.75], 0.9);
  shown(empty, tNoBody + 0.3, 0.9, 0.8);
  const none = parts.cross('unneeded-cross', st.front, [COLS[0] + 0.9, LOW + 0.8], 1.3);
  kit.pop(none, tNoBody + 0.9, 1.3, 0.3);
  cues.push({ t: tNoBody + 0.9, type: 'tick', pitch: 0.55, gain: 1.2 });

  // ------------------------------------------------------------ it has no ancestors who lived in groups
  const lone = parts.agent('lone', st.cast, [COLS[1] + 1.0, LOW + 0.95], 0.8, 2);
  kit.pop(lone.root, tNoAncestors, 0.8, 0.4);
  kit.pipLook(lone, tNoAncestors + 0.7, -0.13, 0.04);
  [0, 1, 2, 3].forEach((k) => {
    const gap = kit.shape(`gap${k}`, kit.arcPts(0.42 - 0.07 * k, 0.05, 0, 360, 28), kit.material(kit.MIST, null, 0.55), st.props, [COLS[1] - 0.25 - 0.85 * k + 0.07 * k * k, LOW + 1.0 + 0.3 * k]);
    kit.appear(gap, tNoAncestors + 0.5 + 0.2 * k, null, 0.25);
    cues.push({ t: tNoAncestors + 0.5 + 0.2 * k, type: 'tick', pitch: 0.9 - 0.08 * k, gain: 0.5 });
  });

  // ------------------------------------------------------------ nobody has shown that an agent feels anything
  const pair = [parts.agent('feels0', st.cast, [COLS[2] - 1.25, LOW + 0.95], 0.75, 4), parts.agent('feels1', st.cast, [COLS[2] + 1.25, LOW + 0.95], 0.75, 3)];
  pair.forEach((made, k) => {
    kit.pop(made.root, tNoFeel + 0.15 * k, 0.75, 0.4);
    kit.pipLook(made, tNoFeel + 0.8, k ? -0.13 : 0.13, 0.0);
  });
  const unknown = parts.heart('unknown', st.front, [COLS[2], LOW + 2.35], 0.9, kit.SLATE, kit.INK500);
  shown(unknown, tNoFeel + 0.6, 0.9, 0.9);
  const what = kit.text('what', '?', 0.62, kit.material(kit.PAPER), parts.group('what-over', st.front, [COLS[2], LOW + 2.37]), [0, 0]);
  kit.appear(what, tNoFeel + 1.0, null, 0.25);
  parts.live(hungry, 41, tNoBody);
  parts.live(lone, 42, tNoAncestors);
  pair.forEach((made, k) => parts.live(made, 43 + k, tNoFeel));

  // ------------------------------------------------------------ so why would a program do any of it?
  reasons.forEach((made, k) => parts.vanish(made, tWhy - 0.2 + 0.015 * k, 0.3));
  const why = kit.text('why', '?', 3.0, kit.material(kit.PAPER), st.front, [0.2, 2.0]);
  kit.appear(why, tWhy + 0.2, null, 0.3);
  const asked = kit.ring('asked', st.front, [0.2, 2.0], 1.6, kit.PAPER, 0.06);
  kit.flash(asked, tWhy + 0.3, 1.0, 0.3);
  cues.push({ t: tWhy - 0.2, type: 'whoosh', gain: 0.5 }, { t: tWhy + 0.2, type: 'blip', pitch: 0.7 });

  // ------------------------------------------------------------ camera
  kit.camera(parts.ramp([[0, [0, 1.6, 18.5]], [tNoBody - 0.6, [0, 1.3, 19]], [tNoBody + 1.0, [0, -0.3, 21]], [end, [0, -0.35, 20.3]]]), 1.0);
  return cues;
}
