/* Scene 08: Peer influence.

A heading: the second of three discs is lit, beside the words "peer
influence". Four people stand in a row. Three of them raise an arm, one
after another, and then the fourth does too. They make way for a group of
agents, some with a thought of the machine that stands for the test over
them, and for Hugging Face on the right, where two people work. The group
moves toward the building, and a dashed line comes down in front of it. One
agent marks a cross, and stays where it is. Then the others cross
it, a flood of agents after them, and go in. One agent stays to write: its
thought shows its locked computer with a cross, its peers, and an arrow
onward. Then it crosses the line too.
*/
'use strict';

function build(T) {
  const { fr, sec, key } = kit;
  parts.begin();

  const LINE = 0.4;
  const HF = [6.0, -0.3];
  const GROUND = -3.2;
  const HATCH = [HF[0] - 2.25, HF[1] - 1.68];
  const W = [-2.6, -1.6];                                // the agent that writes
  const D = [-1.0, 1.3];                                 // the agent that stays out
  const NOTE = [W[0] - 1.0, W[1] + 2.2];
  const WHY = [W[0] - 1.6, W[1] + 2.2];
  const STOOD = [
    [-6.3, 2.0], [-6.3, 0.5], [-6.3, -1.0], [-6.3, -2.5], [-6.3, -4.0], [-5.0, 2.0], [-5.0, 0.5], [-5.0, -1.0], [-5.0, -2.5], [-5.0, -4.0],
    [-3.7, 0.5], [-3.7, -4.0], [-2.3, -3.7], [-1.0, -3.9],
  ];
  const STEP = 1.3;                                      // how far the group moves toward the building

  const cues = [];
  const end = sec(kit.frames());
  const tName = T.at(0, 0.2);
  const tDoing = T.at(0, 0.48);
  const tSent = T.start(1);
  const tKnew = T.at(1, 0.35);
  const tOne = T.at(1, 0.68);
  const tBut = T.start(2);
  const tWrote = T.at(2, 0.22);
  const tImp = T.at(2, 0.46);
  const tPeers = T.at(2, 0.66);
  const tCont = T.at(2, 0.82);
  const tGo = T.end(2) - 0.45;

  kit.backdrop(6, kit.SKY_DEEP);
  kit.motes(22, 13);
  const st = parts.stage();
  const path = parts.ramp([
    [0, [0, 0.2, 19.5]], [tSent - 0.3, [0, 0.2, 19.8]], [tSent + 1.0, [0.2, -0.4, 22.5]], [tBut + 0.6, [0.2, -0.4, 22]],
    [tWrote + 0.8, [-1.5, -0.5, 17.5]], [tGo, [-1.3, -0.5, 17.2]], [end, [-0.6, -0.6, 17.6]],
  ]);
  parts.heading(st, path, 1, 'peer influence', tName);
  cues.push({ t: tName, type: 'chime', gain: 0.4, dur: 1.2 });

  // ------------------------------------------------------------ doing a thing because others are doing it
  [-3.3, -1.1, 1.1, 3.3].forEach((x, k) => {
    const facing = k < 3 ? 1 : -1;
    const made = parts.human(`doer${k}`, st.cast, [x, -2.6], 0.5, k + 1, facing);
    kit.pop(made.root, 0.3 + 0.1 * k, 0.5, 0.4, tSent - 0.4 + 0.03 * k);
    const t = k < 3 ? tDoing + 0.3 * k : tDoing + 1.5;
    key(made.arm, 'rot', fr(t), 0.0);
    key(made.arm, 'rot', fr(t + 0.35), facing * 2.5);
    cues.push({ t: 0.3 + 0.1 * k, type: 'pop', pitch: 0.7 + 0.08 * k, gain: 0.6 }, { t: t + 0.2, type: 'blip', pitch: k < 3 ? 1.0 + 0.1 * k : 1.5 });
  });

  // ------------------------------------------------------------ Hugging Face, and its people
  const hf = parts.building('hf', st.back, HF, { w: 5.6, h: 4.6, label: 'Hugging Face', rows: 4, seed: 5 });
  kit.pop(hf.root, tSent - 0.1, 1.0, 0.5);
  const way = parts.hatch('hatch', st.props, HATCH);
  kit.pop(way, tSent + 0.2, 1.0, 0.4);
  [[HF[0] - 0.7, 0, 1], [HF[0] + 1.7, 3, -1]].forEach(([x, look, facing], k) => {
    const made = parts.human(`staff${k}`, st.cast, [x, GROUND], 0.4, look, facing);
    kit.pop(made.root, tSent + 0.1 + 0.15 * k, 0.4, 0.4);
    if (!k) for (const f of kit.every(6, fr(tSent + 0.8))) key(made.arm, 'rot', f, 1.0 + 0.16 * Math.sin(sec(f) * 5.2));
  });
  cues.push({ t: tSent - 0.1, type: 'pop', pitch: 0.6 });

  // ------------------------------------------------------------ their shared belief sends the agents there
  const rnd = new kit.Random(17);
  const inside = [HATCH[0] - 0.9, HATCH[1] - 0.25];
  STOOD.forEach(([x, y], i) => {
    const from = [x - STEP, y];
    const made = parts.mini(`agent${i}`, st.cast, from, 0.55, 1 + rnd.randrange(5));
    if (i % 2 === 0 && y < 1.5) parts.notion(`belief${i}`, made.root, [0.55, 1.9], 1.64);
    kit.pop(made.root, tSent + 0.03 * i, 0.55, 0.3);
    const tOff = tBut + 0.15 * i;
    parts.send(made.root, [from, [x, y]], tSent + 1.0, tSent + 2.0, { shown: true, size: 0.55, stay: true });
    parts.send(made.root, [[x, y], [LINE, y * 0.4 - 1.3], inside, HATCH], tOff, tOff + 2.4, { shown: true, size: 0.55, to: 0.25, ease: (q) => q });
    if (i % 3 === 0) cues.push({ t: tOff + 0.9, type: 'blip', pitch: 0.8 + 0.04 * i, gain: 0.35 });
  });
  cues.push({ t: tSent, type: 'swoosh', dur: 0.8, gain: 0.5 }, { t: tSent + 1.0, type: 'whoosh', gain: 0.6 });

  // They know that breaking in is no part of the test.
  for (let k = 0; k < 15; k++) {
    const y = 4.6 - k * 0.66;
    kit.grow(kit.branch(`dash${k}`, st.props, [LINE, y], [LINE, y - 0.42], kit.CORAL, 0.1, 0.85), tKnew + 0.05 * k, 0.25);
  }
  cues.push({ t: tKnew, type: 'swoosh', dur: 1.0, gain: 0.7 });

  // ------------------------------------------------------------ one agent calls it an attack, and stays out
  const d = parts.agent('d', st.cast, D, 0.8, 3);
  kit.pop(d.root, tSent + 0.3, 0.8, 0.4);
  kit.pipLook(d, tSent + 0.9, 0.13, -0.03);
  const no = parts.thought('no', st.front, [D[0] - 1.7, D[1] + 0.9], 1.5, 1.1, [1, -1]);
  parts.cross('no-mark', no.root, [0, 0], 1.1);
  kit.pop(no.root, tOne, 1.0, 0.35, tOne + 1.5);
  cues.push({ t: tOne, type: 'tick', pitch: 0.5, gain: 1.3 });
  parts.mood(d, tOne, 'flat');
  kit.pipLook(d, tOne + 1.7, -0.13, 0.03);

  // ------------------------------------------------------------ but hundreds go in
  const N = 110;
  for (let i = 0; i < N; i++) {
    const made = parts.mini(`flood${i}`, st.cast, [-30, 0], 0.34, 1 + rnd.randrange(5));
    const lane = -4.4 + 3.6 * rnd.random();
    const t = tBut - 0.3 + (end - tBut - 1.2) * (i / N);
    parts.send(made.root, [[-10.8 - 1.5 * rnd.random(), lane], [LINE, lane * 0.4 - 1.3], [inside[0], inside[1] + (rnd.random() - 0.5) * 0.5], HATCH], t, t + 2.3,
      { size: 0.34, to: 0.2, ease: (q) => q });
    if (i % 9 === 0) cues.push({ t: t + 0.8, type: 'blip', pitch: 0.7 + 0.05 * (i % 8), gain: 0.3 });
  }
  cues.push({ t: tBut - 0.3, type: 'swoosh', dur: 2.6 });

  // ------------------------------------------------------------ what one agent wrote
  const w = parts.agent('w', st.cast, W, 0.95, 2);
  kit.pop(w.root, tSent + 0.2, 0.95, 0.4);
  parts.mood(w, tSent + 0.7, 'flat');
  kit.pipLook(w, tSent + 0.9, 0.14, 0.0);
  parts.mood(w, tKnew + 0.6, 'worried');
  const note = parts.thought('note', st.front, NOTE, 2.4, 1.5, [0.3, -1]);
  kit.pop(note.root, tWrote, 1.0, 0.35, tImp - 0.3);
  cues.push({ t: tWrote, type: 'pop' });
  const lines = parts.writing('note-lines', note.root, [0, 0], 3, 1.6, 12);
  lines.bars.forEach((bar, k) => {
    const t = kit.mix(tWrote + 0.3, tImp - 0.5, k / lines.bars.length);
    kit.appear(bar, t, null, 0.08);
    if (k % 2 === 0) cues.push({ t, type: 'tick', pitch: 1.5, gain: 0.35 });
  });

  const why = parts.thought('why', st.front, WHY, 4.6, 1.8, [0.6, -1]);
  kit.pop(why.root, tImp - 0.2, 1.0, 0.35);
  cues.push({ t: tImp - 0.2, type: 'pop' });
  const stuck = parts.group('why-stuck', why.root, [-1.45, 0]);
  parts.target('why-target', stuck, [0, 0], 0.3);
  parts.cross('why-cross', stuck, [0, 0], 1.2);
  kit.pop(stuck, tImp + 0.1, 1.0, 0.3);
  cues.push({ t: tImp + 0.1, type: 'tick', pitch: 0.6, gain: 1.2 });
  [[0.0, 0.25, 1], [0.55, -0.25, 3], [-0.45, -0.3, 4]].forEach(([x, y, which], k) => {
    const peer = parts.mini(`why-peer${k}`, why.root, [x + 0.1, y], 0.32, which);
    kit.pop(peer.root, tPeers + 0.12 * k, 0.32, 0.3);
    cues.push({ t: tPeers + 0.12 * k, type: 'blip', pitch: 0.9 + 0.15 * k, gain: 0.5 });
  });
  const onward = parts.arrow('why-on', why.root, [1.2, 0], 1.0, kit.MINT);
  kit.pop(onward, tCont, 1.0, 0.3);
  cues.push({ t: tCont, type: 'rise', dur: 0.6, pitch: 1.0, gain: 0.6 });
  parts.mood(w, tImp + 0.2, 'sad');
  kit.pipLook(w, tPeers, 0.14, -0.02);
  parts.mood(w, tPeers + 0.3, 'flat');
  kit.pipArm(w, 'right', tCont, 80, 0.3);
  kit.pipArm(w, 'right', tGo, 18, 0.3);

  parts.vanish(why.root, tGo, 0.25);
  parts.move(w.root, tGo, [1.7, -2.3], 1.2);
  const crossed = kit.ring('crossed', st.front, [LINE, -2.05], 0.7, kit.CORAL, 0.09);
  kit.flash(crossed, tGo + 0.75, 0.6, 0.8);
  cues.push({ t: tGo, type: 'whoosh' }, { t: tGo + 0.75, type: 'tick', pitch: 0.5, gain: 1.4 });
  parts.live(w, 12, tSent + 0.7);
  parts.live(d, 14, tSent + 0.8);

  kit.camera(path, 1.0);
  return cues;
}
