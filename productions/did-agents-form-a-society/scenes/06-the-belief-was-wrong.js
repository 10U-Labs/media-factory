/* Scene 06: The belief was wrong.

Three agents stand under their shared thought: the machine that stands for
the test reads files, and fails an agent. A cross goes over the thought, and
it all falls away. Then the machine as it really was, with the right word
pinned over it. A word comes up beside the pinned one, the two are the same,
and the lamp for a pass lights; a different word comes up, and the lamp for
a fail lights. Files of what an agent did slide past underneath, and the
machine's eye is shut. An agent with a gear beside it sends its word up, and
passes. The picture goes dark.
*/
'use strict';

function build(T) {
  const { fr, sec, key } = kit;
  parts.begin();

  const SCORER = [3.6, 0.0];
  const REF = [SCORER[0] + 0.75, SCORER[1] + 2.75];
  const TRY = [SCORER[0] - 1.05, SCORER[1] + 2.75];
  const MARK = [SCORER[0] + 2.45, SCORER[1] + 2.75];
  const CHEAT = [-1.4, -1.0];
  const BELIEF = [-1.2, 1.5];

  const cues = [];
  const end = sec(kit.frames());
  const tCross = T.at(0, 0.13);
  const tOnly = T.at(0, 0.22);
  const tLooked = T.at(0, 0.49);
  const tSo = T.at(0, 0.74);

  kit.backdrop(4);
  kit.motes(18, 9);
  const st = parts.stage();

  // ------------------------------------------------------------ the agents' belief, which was wrong
  const falls = [];
  [[-2.5, -1.5, 1], [-1.2, -1.85, 4], [0.1, -1.5, 2]].forEach(([x, y, which], k) => {
    const made = parts.mini(`believer${k}`, st.cast, [x, y], 0.7, which);
    parts.bob(made.root, 0, tOnly - 0.4, k * 1.3, 0.04);
    falls.push(made.root);
  });
  const belief = parts.thought('belief', st.front, BELIEF, 4.8, 2.3, [0, -1]);
  parts.scorer('believed', belief.root, [-1.5, -0.02], 0.6, false);
  [0, 1, 2].forEach((k) => parts.sheet(`read${k}`, belief.root, [-0.45 + 0.6 * k, 0.3], { scale: 0.45, seed: 160 + k }));
  parts.mini('judged', belief.root, [1.75, 0.2], 0.42, 3);
  parts.cross('judged-fail', belief.root, [1.75, 0.2], 1.0);
  const wrong = parts.cross('wrong', st.front, BELIEF, 4.0);
  kit.pop(wrong, tCross, 4.0, 0.3);
  cues.push({ t: tCross, type: 'tick', pitch: 0.4, gain: 1.6 }, { t: tCross + 0.05, type: 'whoosh', pitch: 0.6 });
  falls.push(belief.root, wrong);
  falls.forEach((made, k) => parts.vanish(made, tOnly - 0.4 + 0.03 * k, 0.3));

  // ------------------------------------------------------------ the test only checked whether the word was right
  const scorer = parts.scorer('scorer', st.props, SCORER, 1.4);
  kit.pop(scorer.root, tOnly - 0.2, 1.4, 0.5);
  cues.push({ t: tOnly - 0.2, type: 'pop', pitch: 0.6 }, { t: tOnly - 0.1, type: 'chime', gain: 0.5, pitch: 0.7, dur: 1.8 });
  const pin = kit.branch('pin', st.props, [REF[0], SCORER[1] + 1.6], [REF[0], REF[1] - 0.4], kit.MIST, 0.07, 0.8);
  kit.grow(pin, tOnly, 0.3);
  const right = parts.word('right', st.props, REF, 0.85);
  kit.pop(right.root, tOnly + 0.1, 0.85, 0.4);
  cues.push({ t: tOnly + 0.1, type: 'pop', pitch: 1.1 });

  /* A word sent up beside the right one, the lamp it lights, and the mark it gets. */
  const judged = (name, card, from, t, pass, stay = false) => {
    parts.send(card, [from, [(from[0] + TRY[0]) / 2, TRY[1] + 0.6], TRY], t, t + 0.6, { size: 0.85, stay: true });
    const same = kit.ring(`${name}-same`, st.front, [(TRY[0] + REF[0]) / 2, TRY[1]], 1.25, pass ? kit.MINT : kit.CORAL, 0.08);
    kit.flash(same, t + 0.65, 0.6, 0.3);
    parts.light(scorer, pass ? 'pass' : 'fail', t + 0.7, stay ? null : t + 1.3);
    const mark = pass ? parts.check(`${name}-mark`, st.front, MARK, 1.3) : parts.cross(`${name}-mark`, st.front, MARK, 1.3);
    kit.pop(mark, t + 0.75, 1.3, 0.3, stay ? null : t + 1.3, 0.2);
    if (!stay) parts.vanish(card, t + 1.3, 0.2);
    cues.push({ t, type: 'whoosh', gain: 0.5 }, { t: t + 0.7, type: pass ? 'chime' : 'tick', pitch: pass ? 1.0 : 0.45, gain: pass ? 0.5 : 1.4, dur: 1.2 });
  };
  const card = (name, marks) => {
    const root = parts.group(name, st.front, [0, 0], 0.001);
    kit.shape(`${name}-edge`, kit.rrectPts(1.62, 0.72, 0.26), kit.material(kit.AMBER_DEEP), root);
    kit.shape(`${name}-card`, kit.rrectPts(1.5, 0.6, 0.2), kit.material('#fff2c4', kit.AMBER), root);
    for (let i = 0; i < 5; i++) kit.shape(`${name}-mark${i}`, marks(i), kit.material(kit.INK900), root, [-0.5 + 0.25 * i, 0]);
    return root;
  };
  const stars = () => kit.starPts(0.11, 0.045, 5);
  const rounds = (i) => (i % 2 ? kit.rrectPts(0.16, 0.16, 0.02) : kit.circlePts(0.09, null, null, 14));
  judged('first', card('first', stars), [-9.5, 1.0], tOnly + 0.5, true);
  judged('second', card('second', rounds), [-9.5, -0.6], tOnly + 1.9, false);

  // ------------------------------------------------------------ it never looked at how an agent had got it
  for (let k = 0; k < 6; k++) {
    const done = parts.sheet(`done${k}`, st.props, [0, 0], { scale: 0.7, seed: 150 + k });
    key(done.root, 'scale', 1, 0.001);
    parts.send(done.root, [[-9.6, -3.1], [10.2, -3.1]], tLooked - 0.2 + 0.25 * k, tLooked + 2.2 + 0.25 * k, { size: 0.7, ease: (q) => q });
  }
  cues.push({ t: tLooked - 0.2, type: 'swoosh', dur: 2.6, gain: 0.6 });
  key(scorer.eye, 'scale', fr(tLooked - 0.3), [1, 1, 1]);
  key(scorer.eye, 'scale', fr(tLooked), [1, 0.08, 1]);
  key(scorer.eye, 'scale', fr(tSo + 0.1), [1, 0.08, 1]);
  key(scorer.eye, 'scale', fr(tSo + 0.4), [1, 1, 1]);

  // ------------------------------------------------------------ so it would not have discovered that the agents cheated
  const cheat = parts.mini('cheat', st.cast, CHEAT, 0.9, 3);
  kit.pop(cheat.root, tSo - 0.3, 0.9, 0.35);
  const trick = parts.gear('cheat-gear', st.front, [CHEAT[0] - 1.1, CHEAT[1] + 0.2], 1.1);
  kit.pop(trick, tSo - 0.1, 1.1, 0.3);
  cues.push({ t: tSo - 0.3, type: 'pop', pitch: 0.9 });
  judged('third', card('third', stars), [CHEAT[0] + 0.2, CHEAT[1] - 0.9], tSo + 0.7, true, true);
  kit.veil(end - 1.4, 1.1);

  // ------------------------------------------------------------ camera
  kit.camera(parts.ramp([
    [0, [-0.6, 0.2, 19]], [tOnly - 0.3, [-0.5, 0.2, 19.4]], [tOnly + 0.9, [2.0, 0.6, 21]], [tSo, [1.4, 0.4, 20.6]], [end, [1.2, 0.3, 19.8]],
  ]), 1.0);
  return cues;
}
