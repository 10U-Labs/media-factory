/* Scene 07: A shared belief.

A heading: the first of three discs is lit, beside the words "shared
belief". Four people stand in a row, and the same thought pops up over each
of them. They make way for fifteen agents and, on the right, the machine
that stands for the test. Its eye is shut, and files of what agents did
slide past under it, unread. A small thought of the machine, with its eye
open, pops up over every agent.
*/
'use strict';

function build(T) {
  const { fr, sec, key } = kit;
  parts.begin();

  const SCORER = [4.9, -0.2];
  const cues = [];
  const end = sec(kit.frames());
  const tName = T.at(0, 0.2);
  const tEveryone = T.at(0, 0.55);
  const tNo = T.start(1);
  const tSaw = T.at(1, 0.2);
  const tBut = T.at(1, 0.6);

  kit.backdrop(5);
  kit.motes(20, 17);
  const st = parts.stage();
  const path = parts.ramp([[0, [0, 0.2, 19.5]], [tNo - 0.3, [0, 0.2, 19.8]], [tNo + 1.0, [0.6, 0.0, 21]], [end, [0.6, 0.0, 20.4]]]);
  parts.heading(st, path, 0, 'shared belief', tName);
  cues.push({ t: tName, type: 'chime', gain: 0.4, dur: 1.2 });

  // ------------------------------------------------------------ something that everyone in a group believes
  [-3.3, -1.1, 1.1, 3.3].forEach((x, k) => {
    const made = parts.human(`believer${k}`, st.cast, [x, -2.6], 0.5, k + 1, k < 2 ? 1 : -1);
    kit.pop(made.root, 0.3 + 0.1 * k, 0.5, 0.4, tNo - 0.4 + 0.03 * k);
    const held = parts.thought(`held${k}`, st.front, [x + 0.55, 1.45], 1.3, 1.0, [-0.4, -1]);
    kit.shape(`held${k}-glow`, kit.circlePts(0.5), kit.glowMaterial(kit.AMBER, 0.6, 1.6, kit.INK600), held.root);
    kit.shape(`held${k}-star`, kit.starPts(0.3, 0.13, 5), kit.material('#fff2c4', kit.AMBER), held.root);
    kit.pop(held.root, tEveryone + 0.25 * k, 1.0, 0.3, tNo - 0.4 + 0.03 * k);
    cues.push({ t: 0.3 + 0.1 * k, type: 'pop', pitch: 0.7 + 0.08 * k, gain: 0.6 }, { t: tEveryone + 0.25 * k, type: 'blip', pitch: 1.0 });
  });

  // ------------------------------------------------------------ no agent ever saw the test check how a word was got
  const agents = [];
  for (const y of [1.3, -0.8, -2.9]) {
    for (const x of [-6.4, -4.9, -3.4, -1.9, -0.4]) agents.push([x + (y === -0.8 ? 0.4 : 0), y]);
  }
  const rnd = new kit.Random(29);
  agents.forEach((at, i) => {
    const made = parts.mini(`agent${i}`, st.cast, at, 0.6, 1 + rnd.randrange(5));
    kit.pop(made.root, tNo - 0.2 + 0.03 * i, 0.6, 0.3);
    parts.bob(made.root, tNo + 0.6, end, i * 0.9, 0.04);
  });
  cues.push({ t: tNo - 0.2, type: 'swoosh', dur: 0.8, gain: 0.5 });

  const scorer = parts.scorer('scorer', st.props, SCORER, 1.2);
  kit.pop(scorer.root, tNo, 1.2, 0.5);
  cues.push({ t: tNo, type: 'pop', pitch: 0.6 });
  key(scorer.eye, 'scale', fr(tSaw - 0.4), [1, 1, 1]);
  key(scorer.eye, 'scale', fr(tSaw - 0.1), [1, 0.08, 1]);
  for (let k = 0; k < 5; k++) {
    const done = parts.sheet(`done${k}`, st.props, [0, 0], { scale: 0.6, seed: 150 + k });
    key(done.root, 'scale', 1, 0.001);
    const t = tSaw + 0.35 * k;
    parts.send(done.root, [[SCORER[0] - 2.6, SCORER[1] - 2.6], [SCORER[0] + 2.9, SCORER[1] - 2.6]], t, t + 1.9, { size: 0.6, ease: (q) => q });
  }
  cues.push({ t: tSaw, type: 'swoosh', dur: 2.4, gain: 0.6 });

  // ------------------------------------------------------------ but all of them came to believe it did
  agents.forEach((at, i) => {
    const small = parts.notion(`notion${i}`, st.front, [at[0] + 0.3, at[1] + 1.05], 0.9);
    kit.pop(small, tBut + 0.04 * i, 0.9, 0.3);
    if (i % 3 === 0) cues.push({ t: tBut + 0.04 * i, type: 'blip', pitch: 0.7 + 0.04 * i, gain: 0.4 });
  });

  kit.camera(path, 1.0);
  return cues;
}
