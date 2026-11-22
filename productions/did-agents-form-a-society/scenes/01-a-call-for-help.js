/* Scene 01: A call for help.

Ten closed rooms stand in a ring, an agent in each, and Pip's is at the lower
left. A line grows from every room to the middle, where the computer they
share appears. Pip thinks of a folder, and of name after name for it. His
spark runs to the computer, a folder appears on its panel, and its name is
written: a call for help. Pip waits. A second folder pops in under his, and
its name is written: an answer. Pip throws up his arms. Three more folders
follow, each after a spark from another room. Then sparks run in from every
room, and the list grows into a tall board that stands in front of the
computer.
*/
'use strict';

function build(T) {
  const { fr, sec, span, key } = kit;
  parts.begin();

  const STORE = [0.0, 0.4];
  const [ROOM_W, ROOM_H] = [4.4, 3.2];
  const ROOMS = [];
  for (let i = 0; i < 10; i++) ROOMS.push([11.2 * Math.cos(i * Math.PI / 5), 5.9 * Math.sin(i * Math.PI / 5)]);
  const MINE = 6;
  const HOME = ROOMS[MINE];
  const PIP = [HOME[0] - 0.95, HOME[1] - 0.3];
  const THOUGHT = [HOME[0] + 4.1, HOME[1] + 2.4];
  const colour = (i) => 1 + (i * 3) % 5;                 // the body colour of the agent in room i

  const WIDE = [0, 0, 34];
  const NEAR = [HOME[0] + 1.9, HOME[1] + 1.1, 12.5];
  const PANEL = [0.25, 1.35, 11.0];
  const BOTH = [-3.4, -1.2, 24];

  const cues = [];
  const end = sec(kit.frames());
  const tShared = T.at(0, 0.45);
  const tStore = T.at(0, 0.52);
  const tAny = T.at(0, 0.62);
  const tFolder = T.at(0, 0.72);
  const tName = T.at(0, 0.86);
  const tMade = T.start(1);
  const tWrote = T.at(1, 0.5);
  const tNew = T.at(2, 0.3);
  const tAnswer = T.at(2, 0.68);
  const tGlad = T.end(2) + 0.2;
  const tMore = [T.start(3), T.start(4), T.start(5)];
  const tTalk = T.start(6);

  kit.backdrop(4);
  kit.motes(20, 9);
  const st = parts.stage();

  // ------------------------------------------------------------ the rooms, and a line from each to the middle
  const lines = ROOMS.map((at, i) => {
    const from = parts.edge(at, [ROOM_W / 2, ROOM_H / 2], STORE);
    const to = parts.edge(STORE, [2.6, 3.1], at);
    const line = kit.branch(`line${i}`, st.back, from, to, kit.MIST, 0.1, 0.5);
    kit.grow(line, tShared + 0.07 * i, 0.9);
    return [from, to];
  });
  cues.push({ t: tShared, type: 'swoosh', dur: 1.4, gain: 0.8 });

  ROOMS.forEach((at, i) => {
    parts.room(`room${i}`, st.back, at, ROOM_W, ROOM_H);
    if (i === MINE) return;
    const box = parts.computer(`box${i}`, st.props, [at[0] + 1.05, at[1] - 0.25], { w: 1.3, h: 1.7, rows: 2 });
    parts.lock(`box${i}-lock`, st.props, [at[0] + 1.05, at[1] - 0.5], 0.7);
    parts.flicker(box.lamps, 0, null, i);
    const other = parts.mini(`other${i}`, st.cast, [at[0] - 0.95, at[1] - 0.3], 0.6, colour(i));
    parts.bob(other.root, 0, end, i * 1.3, 0.04);
  });

  // ------------------------------------------------------------ the computer they share
  const store = parts.shared('store', st.props, STORE);
  kit.pop(store.root, tStore, 1.0, 0.5);
  cues.push({ t: tStore, type: 'pop', pitch: 0.7 });
  cues.push({ t: tStore + 0.1, type: 'chime', gain: 0.4, dur: 1.5 });
  parts.flicker(store.lamps, 0, null, 3);
  const row = (r) => [STORE[0] + store.rows[r][0], STORE[1] + store.rows[r][1]];

  // ------------------------------------------------------------ Pip's room
  parts.target('target', st.props, [HOME[0] + 1.2, HOME[1] - 0.5], 0.3);
  const clock = parts.clock('clock', st.props, [HOME[0] - 1.72, HOME[1] + 1.0], 0.42, 0.76);
  parts.drain(clock, 0, end, 0.7);
  const pip = parts.agent('pip', st.cast, PIP, 0.8);
  parts.mood(pip, 0, 'sad', 0);
  kit.pipLook(pip, tStore + 0.3, 0.14, 0.1);
  parts.mood(pip, tStore + 0.5, 'flat');

  // ------------------------------------------------------------ a thought: a folder, with any name
  const cloud = parts.thought('thought', st.front, THOUGHT, 3.6, 2.0, [-1, -0.75]);
  kit.pop(cloud.root, tAny + 0.3, 1.0, 0.45, tMade - 0.2);
  cues.push({ t: tAny + 0.3, type: 'pop' });
  const NAMES = [[0.5, 0.8], [0.9, 0.35, 0.4], [0.3, 0.45, 0.9]];
  NAMES.forEach((bars, k) => {
    const idea = parts.folder(`idea${k}`, cloud.root, [-1.15, 0], { scale: 0.8, bars });
    const tIn = k === 0 ? tFolder : tName + 0.5 * (k - 1);
    const tOut = k === NAMES.length - 1 ? null : tName + 0.5 * k - 0.12;
    kit.pop(idea.root, tIn, 0.8, 0.3, tOut, 0.1);
    cues.push({ t: tIn, type: k ? 'tick' : 'pop', pitch: 1.0 + 0.15 * k });
  });
  parts.mood(pip, tAny + 0.4, 'happy');
  kit.pipLook(pip, tAny + 0.5, 0.12, 0.12);
  kit.pipArm(pip, 'right', tFolder, 120, 0.3);
  parts.mood(pip, tFolder + 0.2, 'glad');
  kit.pipArm(pip, 'right', tMade - 0.3, 18, 0.3);
  parts.mood(pip, tMade - 0.1, 'happy');

  // ------------------------------------------------------------ Pip makes a folder, and names it with a call for help
  const own = parts.spark('own', st.front, kit.MINT, 0.8);
  parts.send(own, [lines[MINE][0], lines[MINE][1], row(0)], tMade + 0.1, tMade + 1.1, { size: 1.0, spin: 3 });
  cues.push({ t: tMade + 0.1, type: 'rise', dur: 1.0, pitch: 1.2, gain: 0.6 });
  const help = parts.folder('help', st.front, row(0), { scale: 0.8, word: 'HELP', bars: [0.8, 0.5, 0.9] });
  kit.pop(help.root, tMade + 1.1, 0.8, 0.4);
  cues.push({ t: tMade + 1.1, type: 'pop', pitch: 1.2 });
  for (const t of parts.write(help, tWrote, 0.2)) cues.push({ t, type: 'tick', pitch: 1.3 });
  cues.push({ t: tWrote + 0.9, type: 'chime', gain: 0.5, dur: 1.6 });
  kit.pipLook(pip, tMade + 1.0, 0.14, 0.09);
  parts.mood(pip, T.end(1) + 0.2, 'flat');
  for (let t = T.end(1) + 0.3; t < tNew - 0.2; t += 0.5) cues.push({ t, type: 'tick', pitch: 1.4, gain: 0.35 });

  // ------------------------------------------------------------ all of a sudden, an answer
  const REPLIES = [
    { which: colour(5), word: 'ANSWER', bars: [0.7, 0.9], room: 5 }, { which: colour(7), bars: [0.6, 1.0, 0.5], room: 7 },
    { which: colour(4), word: 'INFO', bars: [0.8, 0.5, 0.7], room: 4 }, { which: colour(1), bars: [1.1, 0.4, 0.9], room: 1 },
  ];
  const listed = [help.root];
  REPLIES.forEach(({ room, ...name }, k) => {
    const made = parts.folder(`reply${k}`, st.front, row(k + 1), { scale: 0.8, ...name });
    const t = k ? tMore[k - 1] : tNew;
    kit.pop(made.root, t, 0.8, 0.3);
    cues.push({ t, type: 'pop', pitch: 1.0 + 0.12 * k });
    const written = parts.write(made, k ? t + 0.2 : tAnswer, k ? 0.07 : 0.2);
    for (const at of written) cues.push({ t: at, type: 'tick', pitch: 1.3, gain: k ? 0.5 : 1.0 });
    listed.push(made.root);
    if (!k) return;
    const sent = parts.spark(`sent${k}`, st.front, parts.body(name.which)[0], 0.7);
    parts.send(sent, [lines[room][0], lines[room][1], row(k + 1)], t - 0.75, t, { spin: 3 });
  });
  cues.push({ t: tAnswer + 0.5, type: 'chime', gain: 0.6, dur: 1.6 });

  parts.mood(pip, tAnswer + 0.6, 'wide', 0.15);
  parts.mood(pip, tGlad + 0.5, 'glad');
  kit.pipArm(pip, 'left', tGlad + 0.4, 150, 0.2);
  kit.pipArm(pip, 'right', tGlad + 0.4, 150, 0.2);
  for (const f of kit.every(1, fr(tGlad + 0.4), fr(tGlad + 1.2))) {
    const lit = 1 + 0.9 * Math.sin(Math.PI * span(sec(f), tGlad + 0.4, tGlad + 1.1, (v) => v));
    key(pip.bulbGlow, 'scale', f, [lit, lit, 1]);
  }
  cues.push({ t: tGlad + 0.4, type: 'rise', dur: 0.6, pitch: 1.4 });
  kit.pipArm(pip, 'left', tMore[1], 18, 0.3);
  kit.pipArm(pip, 'right', tMore[1], 18, 0.3);
  parts.mood(pip, tMore[2], 'happy');

  // ------------------------------------------------------------ the names of the folders become a conversation
  ROOMS.forEach((at, i) => {
    if (i === MINE) return;
    const said = parts.spark(`said${i}`, st.front, parts.body(colour(i))[0], 0.6);
    for (let t = tTalk - 0.3 + 0.09 * i; t + 0.7 < end; t += 1.1) parts.send(said, [lines[i][0], lines[i][1]], t, t + 0.7, { spin: 3 });
  });
  cues.push({ t: tTalk - 0.3, type: 'swoosh', dur: 1.5, gain: 0.7 });
  for (const made of listed) parts.vanish(made, tTalk + 0.4, 0.2);
  const board = parts.board('board', st.front, STORE);
  kit.pop(board.root, tTalk, 1.0, 0.6);
  cues.push({ t: tTalk, type: 'rise', dur: 0.7, pitch: 0.7 });
  cues.push({ t: tTalk + 0.1, type: 'pop', pitch: 0.6 });
  parts.post(board, 5, 28, tTalk + 0.6, end - 0.3).forEach((t, k) => cues.push({ t, type: 'tick', pitch: 0.9 + 0.05 * (k % 6), gain: 0.4 }));
  parts.live(pip, 5);

  // ------------------------------------------------------------ camera
  kit.camera(parts.ramp([
    [0, WIDE], [tAny - 0.2, [0, 0, 32.5]], [tAny + 1.1, NEAR], [tMade, NEAR], [tMade + 1.2, PANEL], [T.end(2) + 0.1, [PANEL[0], PANEL[1] - 0.15, PANEL[2]]],
    [tGlad + 0.9, BOTH], [T.end(5) + 0.3, [BOTH[0], BOTH[1], 23.4]], [tTalk + 0.6, WIDE], [end, [0, 0, 32.8]],
  ]), 1.0);
  return cues;
}
