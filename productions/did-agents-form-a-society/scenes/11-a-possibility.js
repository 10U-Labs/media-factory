/* Scene 11: A possibility.

A question mark makes way for three small pictures in a row, each with its
name under it: three agents under one thought, "shared belief"; an agent
that follows two others across a line, "peer influence"; and an agent that
takes an idea, a faint cross over it, while two others get what it learns,
"altruism". A bracket joins the three to a place above them. Two people who
share a bowl by a fire appear there, and go. A line of people who stretch
back into the distance appears there, and goes. A man and a woman with a
heart between them appear there, and go. Then a bracket joins the three to
two pictures below them: an agent with a light over it, and two agents with a
line between them that a spark runs along. Last, the three pictures rise to
the top, and under them stand a circle of people and a circle of agents. In
both, a light comes on over every member, lines grow between the members, and
sparks run along the lines. A line joins the three pictures to the people,
and then to the agents.
*/
'use strict';

function build(T) {
  const { fr, sec, key } = kit;
  parts.begin();

  const XS = [-4.8, 0.0, 4.8];
  const NAMES = ['shared belief', 'peer influence', 'altruism'];
  const SLOT = [0, 2.55];                                // where a reason stands, above the three
  const SOURCES = [[-2.4, -3.35], [2.4, -3.35]];         // where the two things stand, below the three
  const [PEOPLE, AGENTS] = [[-4.0, -1.75], [4.0, -1.75]];
  const RING = [[0, 1.45], [1.7, 0], [0, -1.45], [-1.7, 0]];

  const cues = [];
  const end = sec(kit.frames());
  const tNamed = [T.at(0, 0.24), T.at(0, 0.4), T.at(0, 0.52)];
  const tNeed = T.at(0, 0.66);
  const tAncestors = T.start(1);
  const tFeel = T.start(2);
  const GONE = [T.end(0) + 0.1, T.end(1) + 0.1, T.end(2) + 0.2];
  const tTwo = T.start(3);
  const tMind = T.at(3, 0.5);
  const tTalk = T.at(3, 0.66);
  const tIf = T.start(4);
  const tBeings = T.at(4, 0.3);
  const tLiving = T.at(4, 0.72);
  const tPrograms = T.at(4, 0.89);

  kit.backdrop(5);
  kit.motes(20, 17);
  const st = parts.stage();

  /* A light over the head of one that is intelligent. */
  const light = (name, parent, at, scale = 1.0) => {
    const root = parts.group(name, parent, at, scale);
    kit.shape(`${name}-glow`, kit.circlePts(0.42), kit.glowMaterial(kit.AMBER, 0.7), root);
    kit.shape(`${name}-star`, kit.starPts(0.2, 0.07), kit.material('#fff2c4'), root);
    return root;
  };

  // The question that the scene before ended on, which makes way for one possible answer.
  const asked = kit.text('asked', '?', 3.0, kit.material(kit.PAPER), st.front, [0, 0.6]);
  kit.appear(asked, null, tNamed[0] - 0.6, 0.3);

  // ------------------------------------------------------------ a shared belief, peer influence, and altruism
  const row = parts.group('row', st.front, [0, 0]);
  const emblems = XS.map((x, k) => {
    const root = parts.group(`emblem${k}`, row, [x, 0.5]);
    kit.pop(root, tNamed[k], 1.0, 0.4);
    const label = kit.text(`name${k}`, NAMES[k], 0.42, kit.material(kit.PAPER), row, [x, -1.35]);
    kit.appear(label, tNamed[k] + 0.15, null, 0.3);
    cues.push({ t: tNamed[k], type: 'pop', pitch: 0.8 + 0.1 * k }, { t: tNamed[k] + 0.15, type: 'chime', gain: 0.35, pitch: 0.9 + 0.08 * k, dur: 1.0 });
    return root;
  });

  // Three agents under one thought of the machine that stands for the test.
  [1, 2, 4].forEach((which, i) => parts.mini(`one-m${i}`, emblems[0], [-1.0 + i, -0.62], 0.55, which));
  const cloud = parts.thought('one-thought', emblems[0], [0, 0.88], 2.3, 1.0, [0, -1]);
  parts.scorer('one-scorer', cloud.root, [-0.55, 0.0], 0.32, false);
  parts.sheet('one-read', cloud.root, [0.45, 0.02], { scale: 0.55, seed: 7 });

  // An agent that follows two others across a line.
  for (let d = 0; d < 6; d++) kit.branch(`two-dash${d}`, emblems[1], [0.1, 0.95 - d * 0.36], [0.1, 0.75 - d * 0.36], kit.CORAL, 0.08, 0.85);
  parts.mini('two-m0', emblems[1], [1.1, 0.35], 0.5, 1);
  parts.mini('two-m1', emblems[1], [1.6, -0.5], 0.5, 2);
  const follower = parts.mini('two-follower', emblems[1], [-1.3, -0.1], 0.5, 4);
  parts.send(follower.root, [[-1.3, -0.1], [0.75, -0.75]], tNamed[1] + 0.7, tNamed[1] + 1.5, { shown: true, size: 0.5, stay: true });

  // An agent that takes an idea at a risk to itself, and two that get what it learns.
  parts.mini('three-giver', emblems[2], [-1.2, -0.45], 0.55, 3);
  parts.idea('three-idea', emblems[2], [-1.35, 0.55], 0.6);
  const faint = kit.material(kit.CORAL, null, 0.6);
  kit.shape('three-risk-down', kit.barPts(0.5, 0.1), faint, emblems[2], [-0.85, 0.72], { rot: -Math.PI / 4 });
  kit.shape('three-risk-up', kit.barPts(0.5, 0.1), faint, emblems[2], [-0.85, 0.37], { rot: Math.PI / 4 });
  parts.arrow('three-gives', emblems[2], [-0.5, -0.45], 0.8);
  [[0.95, 0.0, 1], [1.55, -0.8, 5]].forEach(([x, y, which], i) => {
    parts.mini(`three-m${i}`, emblems[2], [x, y], 0.5, which);
    parts.sheet(`three-got${i}`, emblems[2], [x + 0.05, y + 0.72], { scale: 0.42, seed: 9 + i });
  });

  // ------------------------------------------------------------ where they may not come from: need, ancestors, feelings
  const above = [kit.branch('above-bar', st.props, [XS[0], 2.2], [XS[2], 2.2], kit.MIST, 0.05, 0.6)];
  XS.forEach((x, k) => above.push(kit.branch(`above-stem${k}`, st.props, [x, 2.2], [x, 1.95], kit.MIST, 0.05, 0.6)));
  above.push(kit.branch('above-up', st.props, [0, 2.2], [0, 2.45], kit.MIST, 0.05, 0.6));
  above.forEach((made) => kit.grow(made, tNeed - 0.3, 0.4, GONE[2] + 0.2));
  cues.push({ t: tNeed - 0.3, type: 'swoosh', dur: 0.6, gain: 0.5 });

  const need = parts.group('need', st.front, SLOT);
  parts.fire('need-fire', need, [0, 0.2], 0.6);
  parts.human('need-giver', need, [-1.0, 0], 0.27, 3, 1);
  parts.human('need-taker', need, [1.0, 0], 0.27, 1, -1);
  const food = parts.bowl('need-food', need, [-0.45, 0.95], 0.5);
  parts.move(food, tNeed + 0.6, [0.45, 0.95], 0.8);

  const line = parts.group('ancestors', st.front, SLOT);
  [0.27, 0.23, 0.19, 0.16, 0.13].forEach((s, k) => parts.human(`ancestor${k}`, line, [1.1 - 0.6 * k + 0.03 * k * k, 0.22 * k], s, k, -1));

  const feel = parts.group('feelings', st.front, SLOT);
  parts.human('feel0', feel, [-0.85, 0], 0.27, 4, 1);
  parts.woman('feel1', feel, [0.85, 0], 0.27, 2, -1);
  parts.heart('feel-heart', feel, [0, 1.05], 0.5);

  const not = kit.ring('not', st.front, [SLOT[0], SLOT[1] + 0.8], 1.3, kit.CORAL, 0.07);
  [[need, tNeed], [line, tAncestors], [feel, tFeel]].forEach(([made, t], k) => {
    kit.pop(made, t, 1.15, 0.4, GONE[k], 0.35);
    kit.flash(not, GONE[k], 0.6, 0.3);
    cues.push({ t, type: 'pop', pitch: 0.8 + 0.1 * k }, { t: GONE[k], type: 'whoosh', pitch: 0.8, gain: 0.5 });
  });

  // ------------------------------------------------------------ where they may come from: intelligence, and a way to talk
  const below = [kit.branch('below-bar', st.props, [XS[0], -1.9], [XS[2], -1.9], kit.MINT, 0.06, 0.9)];
  XS.forEach((x, k) => below.push(kit.branch(`below-stem${k}`, st.props, [x, -1.9], [x, -1.68], kit.MINT, 0.06, 0.9)));
  SOURCES.forEach(([x], k) => below.push(kit.branch(`below-down${k}`, st.props, [x, -1.9], [x, -2.2], kit.MINT, 0.06, 0.9)));
  below.forEach((made) => kit.grow(made, tTwo + 0.3, 0.5, tIf - 0.1));
  cues.push({ t: tTwo + 0.3, type: 'swoosh', dur: 0.7, gain: 0.6 });

  const mind = parts.group('mind', st.front, SOURCES[0]);
  parts.mini('mind-agent', mind, [0, -0.1], 0.7, 2);
  light('mind-light', mind, [0.55, 0.62], 1.2);
  kit.pop(mind, tMind, 1.0, 0.4, tIf - 0.1);
  cues.push({ t: tMind, type: 'pop', pitch: 1.0 }, { t: tMind + 0.1, type: 'chime', gain: 0.4, pitch: 1.2, dur: 1.0 });

  const talk = parts.group('talk', st.front, SOURCES[1]);
  kit.branch('talk-line', talk, [-0.75, -0.1], [0.75, -0.1], kit.MINT, 0.09, 0.9);
  parts.mini('talk-a', talk, [-1.15, -0.1], 0.7, 1);
  parts.mini('talk-b', talk, [1.15, -0.1], 0.7, 4);
  kit.pop(talk, tTalk, 1.0, 0.4, tIf - 0.1);
  const word = parts.spark('talk-said', talk, kit.MINT, 0.5);
  for (let t = tTalk + 0.5, n = 0; t + 0.6 < tIf - 0.2; t += 0.8, n++) {
    parts.send(word, n % 2 ? [[0.7, -0.1], [-0.7, -0.1]] : [[-0.7, -0.1], [0.7, -0.1]], t, t + 0.6, { spin: 3 });
    cues.push({ t, type: 'tick', pitch: 1.2 + 0.1 * (n % 2), gain: 0.5 });
  }
  cues.push({ t: tTalk, type: 'pop', pitch: 1.15 });

  // ------------------------------------------------------------ wherever intelligent beings can talk: living things, or programs
  key(row, 'loc', fr(tIf), [0, 0, row.z]);
  key(row, 'loc', fr(tIf + 1.0), [0, 2.75, row.z]);
  key(row, 'scale', fr(tIf), 1.0);
  key(row, 'scale', fr(tIf + 1.0), 0.72);
  cues.push({ t: tIf, type: 'whoosh', gain: 0.6 });

  const members = [];
  RING.forEach(([x, y], k) => {
    const made = parts.human(`talker${k}`, st.cast, [PEOPLE[0] + x, PEOPLE[1] + y - 0.8], 0.3, k + 1, x > 0 || (x === 0 && k === 0) ? -1 : 1);
    kit.pop(made.root, tIf + 0.5 + 0.1 * k, 0.3, 0.4);
    members.push([PEOPLE[0] + x + 0.42, PEOPLE[1] + y + 0.95, `p${k}`]);
  });
  RING.forEach(([x, y], k) => {
    const made = parts.agent(`program${k}`, st.cast, [AGENTS[0] + x, AGENTS[1] + y], 0.58, k + 1);
    kit.pop(made.root, tIf + 0.5 + 0.1 * k, 0.58, 0.4);
    kit.pipLook(made, tBeings, -0.1 * Math.sign(x), -0.07 * Math.sign(y));
    parts.live(made, 50 + k, tIf + 0.5);
    members.push([AGENTS[0] + x + 0.5, AGENTS[1] + y + 0.62, `a${k}`]);
  });
  cues.push({ t: tIf + 0.5, type: 'swoosh', dur: 0.9, gain: 0.6 });
  members.forEach(([x, y, name], k) => {
    kit.pop(light(`lit-${name}`, st.front, [x, y], 0.9), tBeings + 0.08 * k, 0.9, 0.3);
    if (k % 2 === 0) cues.push({ t: tBeings + 0.08 * k, type: 'blip', pitch: 1.0 + 0.06 * k, gain: 0.5 });
  });

  const PAIRS = [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3]];
  [[PEOPLE, 0.66, 'p'], [AGENTS, 0.6, 'a']].forEach(([at, pull, name]) => {
    PAIRS.forEach(([i, j], k) => {
      const from = [at[0] + RING[i][0] * pull, at[1] + RING[i][1] * pull];
      const to = [at[0] + RING[j][0] * pull, at[1] + RING[j][1] * pull];
      kit.grow(kit.branch(`${name}-link${k}`, st.props, from, to, kit.MINT, 0.08, 0.75), tBeings + 0.9 + 0.15 * k, 0.4);
      const said = parts.spark(`${name}-said${k}`, st.front, kit.MINT, 0.55);
      for (let t = tBeings + 1.5 + 0.31 * k, n = 0; t + 0.7 < end - 0.2; t += 1.9, n++) parts.send(said, n % 2 ? [to, from] : [from, to], t, t + 0.7, { spin: 3 });
    });
  });
  PAIRS.forEach((pair, k) => cues.push({ t: tBeings + 0.9 + 0.15 * k, type: 'tick', pitch: 1.0 + 0.08 * k, gain: 0.6 }));

  [[PEOPLE, tLiving, -1], [AGENTS, tPrograms, 1]].forEach(([at, t, side], k) => {
    const tie = kit.branch(`appear${k}`, st.props, [side * 1.4, 1.4], [at[0] - side * 0.9, at[1] + 1.85], kit.AMBER, 0.08, 0.9);
    kit.grow(tie, t, 0.4);
    const either = kit.ring(`either${k}`, st.front, at, 2.5, kit.PAPER, 0.07);
    kit.flash(either, t + 0.3, 1.0, 0.15);
    cues.push({ t: t + 0.3, type: 'chime', gain: 0.45, pitch: 0.9 + 0.2 * k, dur: 1.2 });
  });

  // ------------------------------------------------------------ camera
  kit.camera(parts.ramp([
    [0, [0, 0.1, 20.5]], [tNeed - 0.4, [0, 0.2, 20.8]], [tNeed + 0.8, [0, 0.4, 21.5]], [tTwo - 0.6, [0, 0.4, 21.5]], [tTwo + 0.8, [0, -0.3, 21.5]],
    [tIf, [0, -0.3, 21.4]], [tIf + 1.2, [0, 0.05, 21.5]], [end, [0, 0.05, 20.9]],
  ]), 1.0);
  return cues;
}
