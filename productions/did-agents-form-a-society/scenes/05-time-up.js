/* Scene 05: Time up.

At Hugging Face, agents stand by the way in, and locked files come out to
them. A light starts to flash on the building, and the two people in front
of it turn. A shutter comes down over the building, a padlock snaps onto the
way in, and the agents are pushed back. The picture moves left, past the
group, to Pip. His clock is down to a sliver. The last of it goes, and Pip
goes dark.
*/
'use strict';

function build(T) {
  const { fr, sec, key, alpha } = kit;
  parts.begin();

  const BOARD = [-9.6, 0.4];
  const PIP = [-4.6, -2.5];
  const HELD = [PIP[0], PIP[1] - 0.7];
  const CLOCK = [PIP[0] - 1.75, PIP[1] + 0.35];
  const HF = [8.6, -0.5];
  const GROUND = -3.3;
  const HATCH = [HF[0] - 3.15, HF[1] - 1.78];
  const NEAR = [[3.9, -1.1], [2.7, -1.9], [3.6, -3.3], [1.5, -0.9], [1.3, -2.9], [0.2, -1.9], [2.4, 0.4], [0.6, 0.3]];

  const RIGHT = [6.4, -0.4, 19];
  const CLOSE = [PIP[0] - 0.4, PIP[1] + 0.3, 12.5];

  const cues = [];
  const end = sec(kit.frames());
  const tFound = T.start(0) + 0.15;
  const tShut = T.at(0, 0.62);
  const tPan = T.end(0) + 0.3;
  const tUp = T.end(1) - 0.15;
  const tOff = T.end(1) + 0.3;

  kit.backdrop(6, kit.SKY_DEEP);
  kit.motes(18, 13);
  const st = parts.stage();

  // ------------------------------------------------------------ Hugging Face finds the break-in
  parts.building('hf', st.back, HF, { w: 7.4, h: 4.8, label: 'Hugging Face', rows: 4, seed: 5 });
  parts.hatch('hatch', st.props, HATCH);

  const glow = kit.shape('alarm', kit.circlePts(1.6), kit.glowMaterial(kit.CORAL, 0.9, 1.3), st.front, [HF[0] + 3.0, HF[1] + 2.75]);
  kit.shape('alarm-lamp-base', kit.rrectPts(0.5, 0.2, 0.05), kit.material(kit.INK500), st.props, [HF[0] + 3.0, HF[1] + 2.62]);
  const lamp = kit.shape('alarm-lamp', kit.circlePts(0.2), kit.material(kit.CORAL), st.props, [HF[0] + 3.0, HF[1] + 2.85]);
  alpha(glow, 1, 0.0);
  alpha(lamp, 1, 0.25);
  for (const f of kit.every(3, fr(tFound), fr(tPan + 1.2))) {
    const on = 0.5 + 0.5 * Math.sin((sec(f) - tFound) * 9);
    alpha(glow, f, on);
    alpha(lamp, f, 0.25 + 0.75 * on);
  }
  alpha(glow, fr(tPan + 1.3), 0.0);
  for (let t = tFound; t < tShut; t += 0.7) cues.push({ t, type: 'blip', pitch: 0.6, gain: 0.6 });

  const staff = [
    parts.human('staff0', st.cast, [HF[0] - 0.4, GROUND], 0.4, 0, -1),
    parts.human('staff1', st.cast, [HF[0] + 1.9, GROUND], 0.4, 3, -1),
  ];
  staff.forEach((made, k) => {
    key(made.arm, 'rot', fr(tFound + 0.3 + 0.25 * k), 0.0);
    key(made.arm, 'rot', fr(tFound + 0.8 + 0.25 * k), -1.5);
  });

  // ------------------------------------------------------------ and shuts them out
  const shutter = parts.group('shutter', st.props, [HF[0], 9.5]);
  kit.shape('shutter-slab', kit.rrectPts(7.0, 3.3, 0.12), kit.material(kit.INK800, kit.INK900), shutter);
  for (let r = 0; r < 6; r++) kit.shape(`shutter-rib${r}`, kit.rrectPts(6.7, 0.1, 0), kit.material(kit.INK500), shutter, [0, 1.3 - r * 0.5]);
  parts.move(shutter, tShut, [HF[0], HF[1] + 0.45], 0.45);
  parts.shake(shutter, tShut + 0.45, 0.3, 0.05);
  const barred = parts.lock('barred', st.front, [HATCH[0], HATCH[1] + 0.05], 1.25);
  kit.pop(barred.root, tShut + 0.5, 1.25, 0.3);
  const closed = kit.ring('closed', st.front, HATCH, 0.8, kit.CORAL, 0.09);
  kit.flash(closed, tShut + 0.55, 0.8, 0.6);
  cues.push({ t: tShut, type: 'whoosh', pitch: 0.7 }, { t: tShut + 0.45, type: 'tick', pitch: 0.4, gain: 1.5 }, { t: tShut + 0.55, type: 'tick', pitch: 0.5, gain: 1.3 });

  // The agents at the way in, and the files that come out to them until it shuts.
  const rnd = new kit.Random(53);
  const near = parts.crowd('near', st.cast, NEAR, 0.52, 31);
  near.forEach((made, i) => {
    parts.bob(made.root, 0, tShut + 0.5, i * 0.9, 0.04);
    parts.move(made.root, tShut + 0.6, [made.at[0] - 2.2 - rnd.random(), made.at[1] - 0.3 + rnd.random() * 0.6], 0.8);
    if (i > 3) return;
    const file = parts.sheet(`taken${i}`, st.front, [0, 0], { scale: 0.5, locked: true, seed: 60 + i });
    key(file.root, 'scale', 1, 0.001);
    for (let t = 0.1 + 0.3 * i; t + 0.9 < tShut; t += 1.2) {
      parts.send(file.root, [HATCH, [(HATCH[0] + made.at[0]) / 2, made.at[1] + 0.9], [made.at[0], made.at[1] + 0.7]], t, t + 0.8, { size: 0.5, to: 0.4 });
      cues.push({ t: t + 0.7, type: 'tick', pitch: 1.2, gain: 0.4 });
    }
  });
  cues.push({ t: tShut + 0.6, type: 'swoosh', dur: 0.8, gain: 0.6 });

  // ------------------------------------------------------------ the board, the group, and Pip
  parts.board('board', st.props, BOARD, { scale: 0.8 });
  const spots = [];
  for (const x of [-13.4, -12.0, -10.6, -9.2, -7.8, -6.4]) spots.push([x, -3.75 - (spots.length % 2) * 0.4], [x + 0.3, 4.3 + (spots.length % 2) * 0.35]);
  spots.push([-5.9, 2.6], [-6.0, 0.9], [-5.8, -0.8], [-4.4, 1.8], [-4.3, 0.1], [-2.4, 0.9], [-1.9, -0.9], [-1.6, -3.4]);
  parts.crowd('agent', st.cast, spots, 0.52, 27).forEach((made, i) => parts.bob(made.root, 0, end, i * 0.9, 0.04));

  const pip = parts.agent('pip', st.cast, PIP, 0.9);
  parts.mood(pip, 0, 'worried', 0);
  parts.word('held', st.front, HELD, 0.85, false);
  kit.pipLook(pip, 0.2, 0.13, 0.04);
  kit.pipLook(pip, tPan + 1.0, -0.12, 0.09);

  // ------------------------------------------------------------ then Pip's time is up
  const clock = parts.clock('clock', st.front, CLOCK, 1.0, 0.1);
  parts.drain(clock, 0.3, tUp, 0.0);
  for (let t = tPan + 0.8; t < tUp - 0.2; t += 0.5) cues.push({ t, type: 'tick', pitch: 1.4, gain: 0.7 });
  const out = kit.ring('out', st.front, CLOCK, 0.65, kit.CORAL, 0.08);
  kit.flash(out, tUp, 0.9, 0.5);
  cues.push({ t: tUp, type: 'tick', pitch: 0.35, gain: 1.6 });
  parts.mood(pip, tUp - 0.5, 'sad', 0.2);
  parts.off(pip, tOff, 0.6);
  parts.live(pip, 25, 0, tOff);

  // ------------------------------------------------------------ camera
  kit.camera(parts.ramp([
    [0, RIGHT], [tPan, [RIGHT[0] - 0.4, RIGHT[1], RIGHT[2] - 0.6]], [tPan + 1.6, CLOSE], [tOff, [CLOSE[0], CLOSE[1], CLOSE[2] - 0.5]],
    [end, [CLOSE[0] + 0.4, CLOSE[1] + 0.2, 16.5]],
  ]), 1.0);
  return cues;
}
