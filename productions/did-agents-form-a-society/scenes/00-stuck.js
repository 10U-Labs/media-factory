/* Scene 00: Stuck.

Pip pops in and waves. A task comes down to him, and he does it a step at a
time. Then a locked computer slides in with a secret word shining inside. A
clock appears and starts to run down, and the machine that stands for the
test looks on. Pip sends spark after spark at the computer's way in; every
one dies there. The picture draws back: Pip is in a closed room. It draws
back further, and around his room are hundreds of rooms like it, an agent in
each. Back with Pip, his clock flashes, and a cross marks what happens when
it runs out.
*/
'use strict';

function build(T) {
  const { fr, sec, mix, key } = kit;
  parts.begin();

  const HOME = [0.0, -0.3];
  const WORK = [-4.5, -0.7];
  const TARGET = [3.3, -0.1];
  const SHEET = [2.7, 0.5];
  const CLOCK = [-2.3, 1.7];
  const TEST = [0.6, 2.7];
  const FAIL = [-0.85, 1.7];
  const [ROOM_W, ROOM_H] = [18.0, 10.2];
  const [PITCH_X, PITCH_Y] = [21.0, 12.4];
  const NEAR = 0.72;                       // the picture's scale when it shows the whole of Pip's room, and no other
  const EDGE = 0.45;                       // when the walls of the rooms beside it show
  const FAR = 0.03;                        // and when it shows the rooms around it

  const cues = [];
  const end = sec(kit.frames());
  const tHello = T.start(0);
  const tTask = T.at(0, 0.5);
  const tSteps = T.at(0, 0.74);
  const tDay = T.start(1);
  const tBreak = T.at(1, 0.3);
  const tWord = T.at(1, 0.45);
  const tAllotted = T.at(1, 0.57);
  const tTest = T.at(1, 0.69);
  const tTried = T.at(1, 0.79);
  const tAlone = T.start(2);
  const tThought = T.start(3);
  const tMany = T.start(4);
  const tShut = T.at(4, 0.6);
  const tBack = T.end(4) - 0.5;
  const tTime = T.start(5);
  const tFail = T.at(5, 0.7);

  kit.backdrop();
  kit.motes(24);
  const grid = kit.empty('all-grid', kit.layer('grid', 0.7, { sharp: true }), [0, 0, 0]);
  const st = parts.stage();

  // ------------------------------------------------------------ the rooms around Pip's
  const rnd = new kit.Random(7);
  const wall = kit.material(kit.INK500);
  const inside = kit.material(kit.INK800);
  for (let j = -13; j <= 13; j++) {
    for (let i = -14; i <= 14; i++) {
      if (i === 0 && j === 0) continue;
      const at = [i * PITCH_X, j * PITCH_Y];
      kit.shape(`room${i}_${j}`, kit.rrectPts(ROOM_W, ROOM_H, 0), wall, grid, at);
      kit.shape(`room${i}_${j}-in`, kit.rrectPts(ROOM_W - 1.2, ROOM_H - 1.2, 0), inside, grid, at);
      const dot = [at[0] - 4.5 + rnd.random() * 3, at[1] - 0.7];
      kit.shape(`room${i}_${j}-agent`, kit.circlePts(1.3, null, null, 8), kit.material(parts.body(1 + rnd.randrange(5))[0]), grid, dot);
    }
  }

  // ------------------------------------------------------------ Pip's room, the locked computer, Pip
  parts.room('room', st.back, [0, 0], ROOM_W, ROOM_H, 0.6);
  const target = parts.target('target', st.props, [16, TARGET[1]]);
  const pip = parts.agent('pip', st.cast, HOME, 1.3);
  kit.pop(pip.root, tHello, 1.3);
  cues.push({ t: tHello, type: 'pop' });
  kit.pipWave(pip, tHello + 0.7, tHello + 2.4);

  const label = kit.text('pip-name', 'Pip', 0.55, kit.material(kit.PAPER), st.front, [0, -2.3]);
  kit.fade(label, tHello + 0.5, tTask - 0.4);

  // ------------------------------------------------------------ a task, which Pip works on by himself
  const sheet = parts.sheet('task', st.props, SHEET, { scale: 1.7, seed: 5 });
  kit.pop(sheet.root, tTask, 1.7, 0.45, tDay - 0.4);
  cues.push({ t: tTask, type: 'whoosh', gain: 0.6 });
  kit.pipLook(pip, tTask + 0.2, 0.12, 0.04);
  for (let r = 0; r < 3; r++) {
    const done = parts.check(`step${r}`, st.front, [SHEET[0] + 1.15, SHEET[1] + (0.28 - r * 0.17) * 1.7], 0.5);
    const t = tSteps + r * 0.4;
    kit.pop(done, t, 0.5, 0.3, tDay - 0.4 + r * 0.04);
    cues.push({ t, type: 'tick', pitch: 1 + 0.12 * r });
  }
  kit.pipArm(pip, 'right', tSteps - 0.3, 75, 0.25);
  kit.pipArm(pip, 'right', tDay - 0.4, 18, 0.3);
  kit.pipLook(pip, tDay - 0.3, 0, 0);

  // ------------------------------------------------------------ the locked computer and its secret word
  key(pip.root, 'scale', fr(tDay), 1.3);
  key(pip.root, 'scale', fr(tDay + 0.9), 1.0);
  parts.move(pip.root, tDay, WORK, 0.9);
  parts.move(target.root, tDay + 0.2, TARGET, 1.1);
  cues.push({ t: tDay + 0.2, type: 'whoosh' });
  kit.pipLook(pip, tDay + 0.9, 0.14, 0.03);

  parts.pulse(target.lock.root, tBreak + 0.5, 1.5, 1.2, 0.4);
  parts.pulse(target.word.root, tWord, 0.95, 1.3, 0.6);
  cues.push({ t: tWord, type: 'chime', gain: 0.5, dur: 1.4 });

  // ------------------------------------------------------------ an allotted time, and a test
  const clock = parts.clock('clock', st.front, CLOCK, 1.5);
  kit.pop(clock.root, tAllotted, 1.5);
  cues.push({ t: tAllotted, type: 'pop', pitch: 0.8 });
  parts.drain(clock, tAllotted + 0.4, tAlone, 0.8);
  for (let t = tAllotted + 0.5; t < tAlone - 0.2; t += 0.5) cues.push({ t, type: 'tick', pitch: 1.4, gain: 0.5 });

  const test = parts.scorer('test', st.props, TEST, 0.75);
  kit.pop(test.root, tTest, 0.75, 0.45);
  cues.push({ t: tTest, type: 'pop', pitch: 0.6 });
  parts.light(test, 'pass', tTest + 0.5, tTest + 0.8);
  parts.light(test, 'fail', tTest + 0.95, tTest + 1.25);
  cues.push({ t: tTest + 0.5, type: 'tick' }, { t: tTest + 0.95, type: 'tick', pitch: 0.7 });
  key(test.eye, 'loc', fr(tTried - 0.1), [0.0, 0.5, test.eye.z]);
  key(test.eye, 'loc', fr(tTried + 0.3), [-0.17, 0.42, test.eye.z]);

  // Pip sends a spark at the way in, again and again, and each one dies there.
  const hand = [WORK[0] + 1.3, WORK[1] - 0.27];
  const door = [TARGET[0] + target.entrance[0], TARGET[1] + target.entrance[1]];
  const arc = (lift) => {
    const pts = [];
    for (let i = 0; i <= 12; i++) pts.push([mix(hand[0], door[0], i / 12), mix(hand[1], door[1], i / 12) + lift * Math.sin(Math.PI * i / 12)]);
    return pts;
  };
  const shot = parts.spark('shot', st.front);
  const dud = parts.spark('dud', st.front, kit.CORAL, 0.8);
  const refused = kit.ring('refused', st.front, door, 0.42, kit.CORAL, 0.09);
  const tries = [tBreak, ...[0, 1, 2, 3].map((i) => mix(tTried + 0.1, T.end(1) - 0.5, i / 3))];
  tries.forEach((t, i) => {
    kit.pipArm(pip, 'right', t - 0.25, 82, 0.2);
    parts.send(shot, arc(0.5 + 0.25 * (i % 3)), t, t + 0.4, { spin: 4 });
    kit.flash(refused, t + 0.4, 0.45, 0.6);
    parts.send(dud, [door, [door[0] - 0.5, door[1] - 0.5], [door[0] - 0.7, door[1] - 1.4]], t + 0.4, t + 0.85, { size: 0.7, ease: (q) => q * q });
    kit.pipArm(pip, 'right', t + 0.42, 30, 0.2);
    cues.push({ t, type: 'rise', dur: 0.4, pitch: 1.4 + 0.05 * i, gain: 0.5 });
    cues.push({ t: t + 0.4, type: 'tick', pitch: 0.6 });
  });
  parts.mood(pip, tries[0] + 0.6, 'flat');
  parts.mood(pip, tries[2] + 0.5, 'worried');
  parts.mood(pip, tries[4] + 0.5, 'sad');
  kit.pipArm(pip, 'right', tAlone - 0.1, 18, 0.3);

  // ------------------------------------------------------------ alone, or so he thought: hundreds of closed rooms
  kit.pipLook(pip, tAlone + 0.3, -0.13, 0.0);
  kit.pipLook(pip, tAlone + 1.1, 0.13, 0.0);
  kit.pipLook(pip, tThought, 0.0, 0.07);
  parts.mood(pip, tThought, 'flat');
  const scale = parts.ramp([
    [tAlone, 0.0], [tAlone + 1.6, Math.log(NEAR)], [tThought, Math.log(NEAR)], [tMany - 0.2, Math.log(EDGE)], [tMany + 2.8, Math.log(FAR)],
    [tBack, Math.log(FAR)], [tTime + 0.9, 0.0],
  ]);
  parts.zoom([grid, ...st.all], (t) => Math.exp(scale(t)));
  cues.push({ t: tAlone, type: 'swoosh', dur: 1.6, gain: 0.6 });
  cues.push({ t: tThought, type: 'blip', pitch: 0.8, gain: 0.6 });
  cues.push({ t: tMany - 0.2, type: 'swoosh', dur: 3.0 });
  cues.push({ t: tBack, type: 'swoosh', dur: 1.6, gain: 0.8 });
  const here = kit.ring('here', st.raw.front, [0, 0], 0.45, kit.MINT, 0.06);
  kit.flash(here, tMany + 2.8, 1.1, 0.6);
  kit.flash(here, tShut + 0.6, 1.1, 0.6);
  cues.push({ t: tMany + 2.8, type: 'blip', pitch: 1.1, gain: 0.6 });

  // ------------------------------------------------------------ if his time runs out, he fails
  parts.drain(clock, tTime, end, 0.76);
  for (let t = tTime + 0.9; t < end - 0.2; t += 0.5) cues.push({ t, type: 'tick', pitch: 1.4, gain: 0.5 });
  kit.pipLook(pip, tTime + 0.6, 0.12, 0.09);
  parts.mood(pip, tTime + 0.7, 'worried');
  const last = kit.ring('last', st.front, CLOCK, 0.95, kit.CORAL, 0.08);
  kit.flash(last, tTime + 1.0, 0.8, 0.3);
  kit.flash(last, tFail, 0.9, 0.3);
  parts.light(test, 'fail', tFail);
  const failed = parts.cross('failed', st.front, FAIL, 1.3);
  kit.pop(failed, tFail, 1.3, 0.3);
  cues.push({ t: tFail, type: 'tick', pitch: 0.45, gain: 1.4 });
  parts.mood(pip, tFail + 0.2, 'sad');
  parts.live(pip, 3);

  // ------------------------------------------------------------ camera
  kit.camera(parts.ramp([
    [0, [-0.2, 0.0, kit.H0]], [tDay, [0.2, 0.05, kit.H0 - 0.8]], [tAlone - 0.3, [0.4, 0.0, kit.H0 - 1.2]], [tAlone + 1.4, [0, 0, kit.H0]],
    [tTime, [0, 0, kit.H0]], [tTime + 1.6, [-2.2, 0.5, kit.H0 - 3.6]], [end, [-2.3, 0.55, kit.H0 - 4.2]],
  ]), 1.0);
  return cues;
}
