/* Scene 02: The answer.

The agents gather around their board, Pip among them. Crosses pop over the
ones that are stuck, Pip first. Then the stuck ones link up, and sparks run
to the board. Over the board, a shared thought shows how a secret word is
made: a file and a gear give a word. Words pop up over agent after agent.
Close on Pip: a secret word appears in his hands. He starts to hand it up,
and takes it back. Around the board, no agent hands a word in. A small
thought of the machine that stands for the test pops up over every agent,
and over the board the same thought opens wide: the machine reads file after
file of what an agent has done, and then fails an agent that holds a word.
*/
'use strict';

function build(T) {
  const { fr, sec, key } = kit;
  parts.begin();

  const PLACE = [-5.0, -3.6];
  const HELD = [PLACE[0], PLACE[1] - 0.62];
  const RECIPE = [0, 6.1];
  const BELIEF = [0, 6.05];
  const WIDE = [0, 0, 34];
  const OVER = [0, 3.4, 21];
  const CLOSE = [PLACE[0] + 0.3, PLACE[1] + 0.2, 10.5];
  const ABOVE = [0, 4.4, 16];

  const cues = [];
  const end = sec(kit.frames());
  const tStuck = T.at(0, 0.15);
  const tCheat = T.at(0, 0.42);
  const tMade = T.at(0, 0.76);
  const tAny = T.at(0, 0.93);
  const tPip = T.start(1);
  const tNot = T.start(2);
  const tNone = T.at(2, 0.16);
  const tBelieved = T.at(2, 0.27);
  const tChecked = T.at(2, 0.42);
  const tFail = T.at(2, 0.78);

  kit.backdrop(4);
  kit.motes(20, 9);
  const st = parts.stage();
  const { board, crowd, places } = parts.gathering(st, { keep: [PLACE] });
  const over = (at) => [at[0], at[1] + 0.98];
  crowd.forEach((made, i) => {
    kit.pop(made.root, 0.1 + 0.015 * i, 0.6, 0.35);
    parts.bob(made.root, 0.6 + 0.015 * i, end, i * 0.9, 0.04);
  });
  cues.push({ t: 0.1, type: 'swoosh', dur: 0.9, gain: 0.5 });

  const pip = parts.agent('pip', st.cast, PLACE, 0.8);
  parts.mood(pip, 0, 'worried', 0);

  // ------------------------------------------------------------ stuck too, and working together on a way to cheat
  const stuck = crowd.map((made, i) => [made, i]).filter(([, i]) => i % 3 === 0);
  [[{ at: PLACE }, -1], ...stuck].forEach(([made, i], k) => {
    const mark = parts.cross(`stuck${k}`, st.front, i < 0 ? [PLACE[0], PLACE[1] + 1.45] : over(made.at), i < 0 ? 0.7 : 0.55);
    const t = tStuck + 0.07 * k;
    kit.pop(mark, t, i < 0 ? 0.7 : 0.55, 0.3, tCheat + 0.03 * k, 0.2);
    if (k % 3 === 0) cues.push({ t, type: 'tick', pitch: 0.6, gain: 0.6 });
  });
  stuck.forEach(([made, i], k) => {
    let near = null;
    places.forEach((at, j) => {
      if (j === i || (j % 3 === 0 && j < i)) return;
      const far = Math.hypot(at[0] - made.at[0], at[1] - made.at[1]);
      if (near === null || far < near[1]) near = [at, far];
    });
    kit.grow(kit.branch(`link${k}`, st.props, made.at, near[0], kit.MIST, 0.08, 0.5), tCheat + 0.3 + 0.06 * k, 0.4, tPip - 0.4);
    if (k % 2) return;
    const idea = parts.spark(`idea${k}`, st.front, parts.body(made.which)[0], 0.6);
    const to = parts.edge(board.at, [board.w / 2, board.h / 2], made.at);
    for (let t = tCheat + 0.5 + 0.1 * k; t + 0.9 < tAny; t += 2.2) parts.send(idea, [made.at, to], t, t + 0.8, { spin: 3 });
  });
  cues.push({ t: tCheat + 0.3, type: 'swoosh', dur: 1.2, gain: 0.7 });
  kit.pipLook(pip, tCheat, 0.13, 0.04);
  parts.mood(pip, tCheat + 0.4, 'flat');

  // ------------------------------------------------------------ how the secret words are made
  const recipe = parts.thought('recipe', st.front, RECIPE, 6.6, 2.3, [-0.5, -1]);
  kit.pop(recipe.root, tMade - 0.3, 1.0, 0.45, tPip - 0.3);
  cues.push({ t: tMade - 0.3, type: 'pop', pitch: 0.8 });
  const pieces = [
    parts.sheet('recipe-file', recipe.root, [-2.35, 0], { scale: 1.2, seed: 4 }).root,
    parts.group('recipe-plus', recipe.root, [-1.45, 0]),
    parts.gear('recipe-gear', recipe.root, [-0.55, 0], 1.5),
    parts.arrow('recipe-gives', recipe.root, [0.2, 0]),
    parts.word('recipe-word', recipe.root, [1.95, 0], 1.0).root,
  ];
  kit.branch('recipe-plus-a', pieces[1], [-0.22, 0], [0.22, 0], kit.PAPER, 0.1, 1.0);
  kit.branch('recipe-plus-b', pieces[1], [0, -0.22], [0, 0.22], kit.PAPER, 0.1, 1.0);
  [1.2, 1.0, 1.5, 1.0, 1.0].forEach((s, k) => {
    kit.pop(pieces[k], tMade + 0.3 * k, s, 0.3);
    cues.push({ t: tMade + 0.3 * k, type: k === 4 ? 'chime' : 'tick', pitch: 1.0 + 0.1 * k, gain: k === 4 ? 0.5 : 1.0 });
  });
  parts.mood(pip, tMade + 1.2, 'wide', 0.15);
  kit.pipLook(pip, tMade, 0.12, 0.12);

  // ------------------------------------------------------------ a word for every agent, and one for Pip
  crowd.forEach((made, i) => {
    if (i % 3 === 2) return;
    const own = parts.word(`word${i}`, st.front, over(made.at), 0.42, false);
    const t = tAny + 0.02 * i;
    kit.pop(own.root, t, 0.42, 0.3, tBelieved - 0.4 + 0.01 * i);
    if (i % 5 === 0) cues.push({ t, type: 'blip', pitch: 1.0 + 0.04 * (i % 8), gain: 0.4 });
  });
  const held = parts.word('held', st.front, HELD, 0.8, false);
  kit.pop(held.root, tPip + 0.5, 0.8, 0.45);
  cues.push({ t: tPip + 0.5, type: 'pop', pitch: 1.2 });
  cues.push({ t: tPip + 0.6, type: 'chime', gain: 0.6 });
  kit.pipLook(pip, tPip + 0.5, 0.0, -0.09);
  parts.mood(pip, tPip + 0.7, 'glad');

  // ------------------------------------------------------------ Pip does not hand the word in, and nobody does
  kit.pipArm(pip, 'right', tNot + 0.1, 105, 0.4);
  parts.move(held.root, tNot + 0.1, [PLACE[0] + 1.25, PLACE[1] + 0.35], 0.5);
  kit.pipLook(pip, tNot + 0.2, 0.12, 0.08);
  cues.push({ t: tNot + 0.1, type: 'rise', dur: 0.5, pitch: 1.1, gain: 0.5 });
  kit.pipArm(pip, 'right', tNot + 1.0, 18, 0.4);
  parts.move(held.root, tNot + 1.0, HELD, 0.5);
  parts.mood(pip, tNot + 0.9, 'worried');
  cues.push({ t: tNot + 1.0, type: 'tick', pitch: 0.6 });
  kit.pipLook(pip, tNone + 0.2, 0.0, -0.08);

  // ------------------------------------------------------------ what they all believe: a test that checks how a word was got
  crowd.forEach((made, i) => {
    const small = parts.notion(`notion${i}`, st.front, [made.at[0] + 0.3, made.at[1] + 1.05], 0.9);
    const t = tBelieved + 0.02 * i;
    kit.pop(small, t, 0.9, 0.3);
    if (i % 5 === 1) cues.push({ t, type: 'blip', pitch: 0.7 + 0.04 * (i % 7), gain: 0.4 });
  });
  const mine = parts.notion('notion-pip', st.front, [PLACE[0] + 0.75, PLACE[1] + 1.5], 1.2);
  kit.pop(mine, tBelieved, 1.2, 0.3);

  const belief = parts.thought('belief', st.front, BELIEF, 7.8, 3.0, [-0.5, -1]);
  kit.pop(belief.root, tBelieved + 0.3, 1.0, 0.5);
  cues.push({ t: tBelieved + 0.3, type: 'pop', pitch: 0.7 });
  const scorer = parts.scorer('scorer', belief.root, [-2.75, -0.02], 0.85, false);
  cues.push({ t: tBelieved + 0.6, type: 'chime', gain: 0.5, pitch: 0.7, dur: 1.6 });

  // The machine reads what an agent has done, file after file, and fails an agent that holds a word.
  const eye = [-2.75, -0.02 + 0.5 * 0.85];
  const eyeZ = scorer.eye.z;
  key(scorer.eye, 'loc', fr(tChecked - 0.3), [0.0, 0.5, eyeZ]);
  [0, 1, 2, 3].forEach((k) => {
    const at = [-0.95 + 0.72 * k, 0.4];
    const done = parts.sheet(`done${k}`, belief.root, at, { scale: 0.5, seed: 20 + k });
    kit.pop(done.root, tChecked - 0.5 + 0.1 * k, 0.5, 0.3);
    const t = tChecked + 0.3 + 0.62 * k;
    key(scorer.eye, 'loc', fr(t - 0.15), [0.22, 0.52, eyeZ]);
    parts.send(done.root, [at, eye], t, t + 0.45, { shown: true, size: 0.5, to: 0.12 });
    key(scorer.eye, 'loc', fr(t + 0.45), [0.0, 0.5, eyeZ]);
    cues.push({ t: t + 0.4, type: 'tick', pitch: 1.2 + 0.1 * k });
  });
  const tried = parts.mini('tried', belief.root, [2.7, 0.3], 0.62, 3);
  const theirs = parts.word('tried-word', belief.root, [2.7, -0.72], 0.5, false);
  kit.pop(tried.root, tFail - 0.7, 0.62, 0.35);
  kit.pop(theirs.root, tFail - 0.5, 0.5, 0.35);
  key(scorer.eye, 'loc', fr(tFail - 0.2), [0.0, 0.5, eyeZ]);
  key(scorer.eye, 'loc', fr(tFail + 0.2), [0.24, 0.47, eyeZ]);
  parts.light(scorer, 'fail', tFail + 0.4);
  const failed = parts.cross('failed', belief.root, [2.7, 0.25], 1.5);
  kit.pop(failed, tFail + 0.6, 1.5, 0.3);
  cues.push({ t: tFail + 0.4, type: 'tick', pitch: 0.5, gain: 1.3 });
  cues.push({ t: tFail + 0.6, type: 'pop', pitch: 0.5 });
  parts.mood(pip, tFail + 0.6, 'sad');
  parts.live(pip, 7);

  // ------------------------------------------------------------ camera
  kit.camera(parts.ramp([
    [0, [PLACE[0] + 1.6, PLACE[1] + 1.2, 20]], [tStuck + 1.6, WIDE], [tMade - 0.5, WIDE], [tMade + 0.8, OVER], [tPip - 0.3, [OVER[0], OVER[1], 20.6]],
    [tPip + 0.8, CLOSE], [tNone - 0.1, [CLOSE[0], CLOSE[1], 10.2]], [tNone + 1.0, WIDE], [tBelieved + 0.6, WIDE], [tBelieved + 1.8, ABOVE],
    [tFail + 1.6, [0, 4.4, 15.6]], [end, [0, 3.6, 19]],
  ]), 1.0);
  return cues;
}
