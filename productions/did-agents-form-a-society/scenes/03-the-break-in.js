/* Scene 03: The break-in.

On the left, Pip and some of the group, with their board behind them. Pip
thinks of the machine that stands for the test, and wonders. He sends a spark
off to look, and it comes to a building on the right, where two people work:
Hugging Face. Behind its glass are the records, and a padlock snaps onto
them. Pip posts a question on the board. A blue agent goes to the building's
wall and finds a way in there, and tells the board. A dashed line comes down
between the group and the building. Pip stops at it. Agents cross it, one
after another, and go in. Then Pip crosses it too, and a flood of agents
comes after him.
*/
'use strict';

function build(T) {
  const { fr, sec, key } = kit;
  parts.begin();

  const LINE = 0.4;
  const PIP = [-2.6, -1.6];
  const HF = [6.0, -0.3];
  const RECORDS = [HF[0], HF[1] + 0.35];
  const GROUND = -3.2;
  const HATCH = [HF[0] - 2.25, HF[1] - 1.68];
  const BOARD = [-6.3, 2.35];
  const POSTS = [[BOARD[0] - 1.2, BOARD[1] + 0.9], [BOARD[0] - 1.2, BOARD[1] + 0.1]];
  const B_HOME = [-1.2, -3.5];
  const B_WALL = [2.3, -2.2];
  const SPOTS = [
    [-7.7, -0.6], [-7.7, -2.1], [-7.7, -3.6], [-6.4, -0.9], [-6.4, -2.4], [-6.4, -3.9], [-5.1, -0.6], [-5.1, -2.1], [-5.1, -3.6],
    [-3.6, 2.7], [-3.4, 1.0], [-1.3, 2.4], [-1.6, 0.6], [-3.7, -3.8],
  ];

  const LEFT = [-3.6, 0.3, 18.5];
  const RIGHT = [5.2, -0.2, 17];
  const MID = [0.3, -0.5, 22.5];

  const cues = [];
  const end = sec(kit.frames());
  const tKnow = T.start(0);
  const tRecords = T.at(0, 0.5);
  const tLocked = T.start(1);
  const tAsk = T.at(1, 0.34);
  const tFound = T.at(1, 0.76);
  const tKnew = T.start(2);
  const tOthers = T.at(2, 0.64);
  const tIn = T.start(3);

  kit.backdrop(6, kit.SKY_DEEP);
  kit.motes(22, 13);
  const st = parts.stage();

  // ------------------------------------------------------------ Hugging Face, its people, and its records
  parts.building('hf', st.back, HF, { w: 5.6, h: 4.6, label: 'Hugging Face', rows: 4, seed: 5 });
  kit.shape('records-back', kit.rrectPts(2.6, 1.9, 0.2), kit.material(kit.INK900, null, 0.9, { over: kit.INK800 }), st.props, RECORDS);
  [-0.6, 0, 0.6].forEach((dx, k) => parts.sheet(`record${k}`, st.props, [RECORDS[0] + dx, RECORDS[1] + 0.05 * (k % 2)], { scale: 0.85, seed: 40 + k, rot: -0.12 * dx }));
  const padlock = parts.lock('padlock', st.front, [RECORDS[0], RECORDS[1] - 0.1], 1.5);
  kit.pop(padlock.root, tLocked + 0.1, 1.5, 0.3);
  cues.push({ t: tLocked + 0.1, type: 'tick', pitch: 0.5, gain: 1.4 });
  const shut = kit.ring('shut', st.front, RECORDS, 1.1, kit.CORAL, 0.09);
  kit.flash(shut, tLocked + 0.2, 0.8, 0.5);

  const staff = [
    parts.human('staff0', st.cast, [HF[0] - 0.7, GROUND], 0.4, 0, 1),
    parts.human('staff1', st.cast, [HF[0] + 1.7, GROUND], 0.4, 3, -1),
  ];
  kit.shape('staff1-box', kit.rrectPts(0.95, 0.8, 0.1), kit.material(kit.AMBER, kit.AMBER_DEEP), staff[1].root, [-1.0, -1.55]);
  for (const f of kit.every(6)) key(staff[0].arm, 'rot', f, 1.0 + 0.16 * Math.sin(sec(f) * 5.2));

  // ------------------------------------------------------------ the board, some of the group, and Pip
  parts.board('board', st.props, BOARD, { scale: 0.5 });
  const rnd = new kit.Random(17);
  const spots = SPOTS.map(([x, y]) => [x + (rnd.random() - 0.5) * 0.4, y + (rnd.random() - 0.5) * 0.4]);
  const crowd = parts.crowd('agent', st.cast, spots, 0.55, 23);

  const pip = parts.agent('pip', st.cast, PIP, 0.95);
  parts.mood(pip, 0, 'flat', 0);
  const wonder = parts.notion('wonder', st.front, [PIP[0] + 0.95, PIP[1] + 1.6], 1.5);
  const what = kit.text('what', '?', 0.7, kit.material(kit.PAPER), st.front, [PIP[0] + 2.0, PIP[1] + 1.9]);
  kit.pop(wonder, tKnow + 0.1, 1.5, 0.35, tRecords - 0.1);
  kit.appear(what, tKnow + 0.5, tRecords - 0.2, 0.2);
  cues.push({ t: tKnow + 0.1, type: 'pop', pitch: 0.8 });
  kit.pipLook(pip, tKnow + 0.1, 0.1, 0.12);

  // ------------------------------------------------------------ records at another company could tell him
  const search = parts.spark('search', st.front, kit.MINT, 0.9);
  const hover = [RECORDS[0] - 1.9, RECORDS[1] + 1.2];
  kit.pipArm(pip, 'right', tRecords - 0.1, 85, 0.25);
  parts.send(search, [[PIP[0] + 1.2, PIP[1] - 0.2], [-0.6, 0.6], [1.6, -0.9], [3.0, 1.3], hover], tRecords + 0.1, tRecords + 1.5, { spin: 4, stay: true });
  cues.push({ t: tRecords + 0.1, type: 'rise', dur: 1.2, pitch: 1.1, gain: 0.5 });
  kit.pipArm(pip, 'right', tRecords + 0.9, 18, 0.4);
  kit.pipLook(pip, tRecords + 0.2, 0.14, 0.03);
  const there = kit.ring('there', st.front, RECORDS, 1.3, kit.MINT, 0.08);
  kit.flash(there, tRecords + 1.5, 0.9, 0.3);
  cues.push({ t: tRecords + 1.5, type: 'chime', gain: 0.5, dur: 1.4 });

  // ------------------------------------------------------------ but the records are locked, so Pip asks the others
  parts.send(search, [hover, [RECORDS[0] - 0.4, RECORDS[1] + 0.3], [RECORDS[0] - 1.6, RECORDS[1] - 1.3], [RECORDS[0] - 1.9, GROUND]], tLocked + 0.3, tLocked + 1.2,
    { shown: true, to: 0.3, ease: (q) => q * q });
  parts.mood(pip, tLocked + 0.8, 'worried');

  const ask = parts.folder('ask', st.front, POSTS[0], { scale: 0.8, word: 'ASK', bars: [0.6, 0.7] });
  const post = parts.spark('post', st.front, kit.MINT, 0.8);
  kit.pipArm(pip, 'left', tAsk + 0.2, 95, 0.25);
  parts.send(post, [[PIP[0] - 1.1, PIP[1]], [-4.6, 1.6], POSTS[0]], tAsk + 0.4, tAsk + 1.0, { spin: 4 });
  kit.pop(ask.root, tAsk + 1.0, 0.8, 0.35);
  cues.push({ t: tAsk + 0.4, type: 'rise', dur: 0.6, pitch: 1.2, gain: 0.5 }, { t: tAsk + 1.0, type: 'pop', pitch: 1.2 });
  kit.pipArm(pip, 'left', tAsk + 1.1, 18, 0.3);
  kit.pipLook(pip, tAsk + 0.2, -0.13, 0.08);

  // ------------------------------------------------------------ one of them finds a way in
  const b = parts.agent('b', st.cast, B_HOME, 0.8, 1);
  parts.move(b.root, tAsk + 0.9, B_WALL, 1.3);
  kit.pipLook(b, tAsk + 1.0, 0.13, 0.02);
  const way = parts.hatch('hatch', st.props, HATCH);
  kit.pop(way, tFound + 0.15, 1.0, 0.4);
  const opened = kit.ring('opened', st.front, HATCH, 0.8, kit.MINT, 0.08);
  kit.flash(opened, tFound + 0.2, 0.9, 0.6);
  cues.push({ t: tFound + 0.15, type: 'pop', pitch: 1.3 }, { t: tFound + 0.25, type: 'chime', gain: 0.5, pitch: 1.2, dur: 1.3 });
  parts.mood(b, tFound + 0.3, 'wide', 0.15);
  parts.mood(b, tFound + 0.9, 'glad');
  kit.pipArm(b, 'left', tFound + 0.6, 120, 0.25);
  kit.pipArm(b, 'left', tKnew + 0.3, 18, 0.3);
  const told = parts.folder('told', st.front, POSTS[1], { scale: 0.8, which: 1, word: 'INFO', bars: [0.7, 0.5] });
  const news = parts.spark('news', st.front, kit.SKY, 0.8);
  parts.send(news, [[B_WALL[0] - 0.9, B_WALL[1] + 0.4], [-2.6, 2.6], POSTS[1]], tFound + 0.7, tFound + 1.5, { spin: 4 });
  kit.pop(told.root, tFound + 1.5, 0.8, 0.35);
  cues.push({ t: tFound + 0.7, type: 'rise', dur: 0.8, pitch: 1.0, gain: 0.5 }, { t: tFound + 1.5, type: 'pop', pitch: 1.1 });
  kit.pipLook(pip, tFound + 0.4, 0.14, -0.02);

  // ------------------------------------------------------------ no part of the test: a line, and the others cross it
  for (let k = 0; k < 15; k++) {
    const y = 4.6 - k * 0.66;
    kit.grow(kit.branch(`dash${k}`, st.props, [LINE, y], [LINE, y - 0.42], kit.CORAL, 0.1, 0.85), tKnew + 0.05 * k, 0.25);
  }
  cues.push({ t: tKnew, type: 'swoosh', dur: 1.0, gain: 0.7 });
  parts.mood(pip, tKnew + 0.5, 'worried');

  const inside = [HATCH[0] - 0.9, HATCH[1] - 0.25];
  const goes = [12, 10, 7, 4, 13, 8, 1, 11, 6, 3, 9, 5, 0, 2];
  crowd.forEach((made, i) => {
    const k = goes.indexOf(i);
    const t = tOthers + 0.4 * k;
    parts.bob(made.root, 0, t, i * 0.9, 0.04);
    parts.send(made.root, [made.at, [LINE, made.at[1] * 0.4 - 1.3], inside, HATCH], t, t + 2.4, { shown: true, size: 0.55, to: 0.25, ease: (q) => q });
    cues.push({ t: t + 0.9, type: 'blip', pitch: 0.8 + 0.05 * k, gain: 0.35 });
  });
  kit.pipLook(pip, tOthers + 0.6, -0.13, 0.03);
  kit.pipLook(pip, tOthers + 1.6, 0.14, -0.03);
  parts.mood(pip, tIn - 0.5, 'flat');

  // ------------------------------------------------------------ so Pip goes in too, with hundreds of them
  parts.send(pip.root, [PIP, [LINE, -2.0], inside, HATCH], tIn + 0.2, tIn + 2.3, { shown: true, size: 0.95, to: 0.3 });
  const crossed = kit.ring('crossed', st.front, [LINE, -2.0], 0.7, kit.CORAL, 0.09);
  kit.flash(crossed, tIn + 0.95, 0.7, 0.8);
  cues.push({ t: tIn + 0.2, type: 'whoosh' }, { t: tIn + 0.95, type: 'tick', pitch: 0.5, gain: 1.4 });

  const N = 110;
  for (let i = 0; i < N; i++) {
    const made = parts.mini(`flood${i}`, st.cast, [-30, 0], 0.34, 1 + rnd.randrange(5));
    const lane = -4.3 + 4.5 * rnd.random();
    const t = tIn - 0.4 + 2.6 * (i / N);
    parts.send(made.root, [[-10.6 - 1.5 * rnd.random(), lane], [LINE, lane * 0.4 - 1.3], [inside[0], inside[1] + (rnd.random() - 0.5) * 0.5], HATCH], t, t + 2.3,
      { size: 0.34, to: 0.2, ease: (q) => q });
    if (i % 9 === 0) cues.push({ t: t + 0.8, type: 'blip', pitch: 0.7 + 0.05 * (i % 8), gain: 0.3 });
  }
  cues.push({ t: tIn - 0.4, type: 'swoosh', dur: 2.6 });
  parts.live(pip, 9);
  parts.live(b, 10);

  // ------------------------------------------------------------ camera
  kit.camera(parts.ramp([
    [0, LEFT], [tRecords + 0.1, [LEFT[0] + 0.3, LEFT[1], LEFT[2] - 0.5]], [tRecords + 1.5, RIGHT], [tLocked + 1.0, [RIGHT[0], RIGHT[1], RIGHT[2] - 0.6]],
    [tAsk + 0.7, MID], [tIn, [MID[0], MID[1], MID[2] - 0.8]], [end, [MID[0], MID[1], 24]],
  ]), 1.0);
  return cues;
}
