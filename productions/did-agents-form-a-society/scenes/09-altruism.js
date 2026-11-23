/* Scene 09: Altruism.

A heading: the third of three discs is lit, beside the word "altruism". Two
people face each other, and one hands the other a bowl of food. They make
way for the agents around their board. Files with crosses on them lie in
front of it. Three ideas light up on the board, and three agents step up
and take one each; over each of the three hangs a faint cross, for the test
it may fail. A file comes back from each of them, and copies of it go out to
the agents around.
*/
'use strict';

function build(T) {
  const { fr, sec, key } = kit;
  parts.begin();

  const IDEAS = [[1.2, 2.5], [1.2, 0.2], [-1.2, 0.0]];
  const STEPS = [[4.0, 1.4], [4.0, -0.9], [-4.0, -1.0]];
  const cues = [];
  const end = sec(kit.frames());
  const tName = T.at(0, 0.2);
  const tGive = T.at(0, 0.45);
  const tWhen = T.start(1);
  const tTried = T.at(1, 0.24);
  const tRisk = T.at(1, 0.5);
  const tLearn = T.at(1, 0.78);

  kit.backdrop(4);
  kit.motes(20, 9);
  const st = parts.stage();
  const path = parts.ramp([[0, [0, 0.2, 19.5]], [tWhen - 0.3, [0, 0.2, 19.8]], [tWhen + 1.0, [0, 0.1, 30]], [end, [0, 0.1, 29.4]]]);
  parts.heading(st, path, 2, 'altruism', tName);
  cues.push({ t: tName, type: 'chime', gain: 0.4, dur: 1.2 });

  // ------------------------------------------------------------ giving something up for the good of others
  const givers = [parts.human('giver', st.cast, [-1.9, -2.5], 0.55, 3, 1), parts.human('taker', st.cast, [1.9, -2.5], 0.55, 1, -1)];
  givers.forEach((made, k) => {
    kit.pop(made.root, 0.3 + 0.15 * k, 0.55, 0.4, tWhen - 0.4 + 0.03 * k);
    cues.push({ t: 0.3 + 0.15 * k, type: 'pop', pitch: 0.7 + 0.1 * k, gain: 0.6 });
  });
  const food = parts.bowl('food', st.front, [-0.95, -0.55], 1.0);
  kit.pop(food, 0.7, 1.0, 0.3, tWhen - 0.4);
  key(givers[0].arm, 'rot', fr(tGive - 0.5), 0.0);
  key(givers[0].arm, 'rot', fr(tGive), 1.2);
  parts.move(food, tGive, [0.95, -0.5], 0.9);
  key(givers[1].arm, 'rot', fr(tGive + 0.4), 0.0);
  key(givers[1].arm, 'rot', fr(tGive + 0.9), -1.2);
  key(givers[0].arm, 'rot', fr(tGive + 0.6), 1.2);
  key(givers[0].arm, 'rot', fr(tGive + 1.1), 0.0);
  cues.push({ t: tGive, type: 'whoosh', gain: 0.4 }, { t: tGive + 0.9, type: 'chime', gain: 0.4, dur: 1.0 });

  // ------------------------------------------------------------ the agents at their board, where the break-in has not helped
  const { board, crowd } = parts.gathering(st, { n: 32, keep: [[-4.7, 6.0], [-6.45, 5.2], [-8.2, 6.0]] });
  kit.pop(board.root, tWhen - 0.2, 1.0, 0.5);
  cues.push({ t: tWhen - 0.2, type: 'pop', pitch: 0.6 }, { t: tWhen - 0.1, type: 'swoosh', dur: 0.9, gain: 0.5 });
  const nearest = (to, taken = []) => crowd.filter((made) => !taken.includes(made))
    .reduce((best, made) => (Math.hypot(made.at[0] - to[0], made.at[1] - to[1]) < Math.hypot(best.at[0] - to[0], best.at[1] - to[1]) ? made : best));
  const brave = [];
  for (const to of [[4.7, 1.6], [4.7, -0.9], [-4.7, -0.6]]) brave.push(nearest(to, brave));
  crowd.forEach((made, i) => {
    kit.pop(made.root, tWhen - 0.1 + 0.012 * i, 0.6, 0.3);
    if (!brave.includes(made)) parts.bob(made.root, tWhen + 1.0, end, i * 0.9, 0.04);
  });
  [[-1.7, -4.1], [0.1, -4.4], [1.9, -4.1]].forEach((at, k) => {
    const useless = parts.sheet(`useless${k}`, st.front, at, { scale: 0.8, seed: 120 + k, rot: -0.2 + 0.2 * k });
    const mark = parts.cross(`useless${k}-mark`, st.front, at, 0.9);
    kit.pop(useless.root, tWhen + 0.15 * k, 0.8, 0.3, tRisk - 0.3);
    kit.pop(mark, tWhen + 0.4 + 0.2 * k, 0.9, 0.3, tRisk - 0.3);
    cues.push({ t: tWhen + 0.4 + 0.2 * k, type: 'tick', pitch: 0.6, gain: 0.8 });
  });

  // ------------------------------------------------------------ some agents try the group's last ideas, at the risk of failing their own tests
  const faint = kit.material(kit.CORAL, null, 0.6);
  const given = [];                                  // the agents that a copy goes to
  brave.forEach((made, k) => {
    const from = [board.at[0] + IDEAS[k][0], board.at[1] + IDEAS[k][1] - 0.4];
    const idea = parts.idea(`idea${k}`, st.front, from, 0.9);
    kit.pop(idea, tWhen + 0.9 + 0.2 * k, 0.9, 0.35);
    cues.push({ t: tWhen + 0.9 + 0.2 * k, type: 'pop', pitch: 1.1 + 0.15 * k });
    const t = tTried + 0.3 * k;
    parts.send(made.root, [made.at, STEPS[k]], t, t + 0.6, { shown: true, size: 0.6, stay: true });
    parts.send(idea, [from, [STEPS[k][0] - 0.1, STEPS[k][1] + 0.95]], t + 0.6, t + 1.1, { shown: true, size: 0.9, to: 0.7, stay: true });
    cues.push({ t, type: 'whoosh', gain: 0.5 });

    const risk = parts.group(`risk${k}`, st.front, [STEPS[k][0] - 0.1 + 0.95 * Math.sign(STEPS[k][0]), STEPS[k][1] + 0.95], 0.001);
    kit.shape(`risk${k}-down`, kit.barPts(0.74, 0.13), faint, risk, [-0.26, 0.26], { rot: -Math.PI / 4 });
    kit.shape(`risk${k}-up`, kit.barPts(0.74, 0.13), faint, risk, [-0.26, -0.26], { rot: Math.PI / 4 });
    kit.pop(risk, tRisk + 0.2 * k, 1.1, 0.3);
    for (let at = tRisk + 0.9 + 0.2 * k; at < end - 0.5; at += 1.0) parts.pulse(risk, at, 1.1, 1.25, 0.5);
    cues.push({ t: tRisk + 0.2 * k, type: 'tick', pitch: 0.55, gain: 1.0 });

    // ---------------------------------------------------------- so that the rest can learn
    const out = [STEPS[k][0], STEPS[k][1] - 0.95];
    const result = parts.sheet(`result${k}`, st.front, out, { scale: 0.6, seed: 130 + k });
    kit.pop(result.root, tLearn + 0.15 * k, 0.6, 0.3);
    cues.push({ t: tLearn + 0.15 * k, type: 'chime', gain: 0.4, pitch: 1.0 + 0.1 * k, dur: 1.2 });
    const taught = [];
    for (let n = 0; n < 4; n++) {
      taught.push(nearest(made.at, [...brave, ...given]));
      given.push(taught[n]);
    }
    taught.forEach((to, n) => {
      const copy = parts.sheet(`learnt${k}_${n}`, st.front, [0, 0], { scale: 0.4, seed: 140 + 4 * k + n });
      key(copy.root, 'scale', 1, 0.001);
      const at = tLearn + 0.5 + 0.15 * k + 0.12 * n;
      parts.send(copy.root, [out, [to.at[0], to.at[1] + 0.95]], at, at + 0.6, { size: 0.4, stay: true });
      cues.push({ t: at + 0.6, type: 'tick', pitch: 1.1 + 0.05 * n, gain: 0.5 });
    });
  });

  kit.camera(path, 1.0);
  return cues;
}
