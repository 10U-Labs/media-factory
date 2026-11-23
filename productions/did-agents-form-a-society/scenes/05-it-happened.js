/* Scene 05: It happened.

Pip stands in the middle. Under him stand four agents of other
colours, each with one thing that Pip did in the story: the call for help,
the secret word, the way in, and the idea he said yes to. A calendar page
says July 2026. Then OpenAI's building, with two people in front of it; four
days tick by; a field of twelve hundred dots fills in, and folders with
names pop up over it.
*/
'use strict';

function build(T) {
  const { sec } = kit;
  parts.begin();

  const PIP = [-0.2, 0.9];
  const ROW = -2.5;
  const OPENAI = [-5.2, -0.4];
  const GROUND = -2.4;
  const FIELD = { x0: -0.9, y0: 1.3, step: 0.172, cols: 50, rows: 24 };
  const NAMED = [[0.2, 0.6], [3.5, 0.9], [5.3, -0.3], [1.7, -0.9], [4.0, -1.9], [0.3, -2.2]];

  const cues = [];
  const end = sec(kit.frames());
  const tMadeUp = T.start(0);
  const tEach = T.at(0, 0.22);
  const tJuly = T.at(0, 0.66);
  const tOpenAI = T.at(0, 0.84);
  const tDays = T.start(1);
  const tTwelve = T.at(1, 0.28);
  const tWrote = T.at(1, 0.6);

  kit.backdrop(5);
  kit.motes(20, 17);
  const st = parts.stage();

  // ------------------------------------------------------------ Pip is made up; a real agent did each thing he did
  const pip = parts.agent('pip', st.cast, PIP, 1.15);
  kit.pop(pip.root, tMadeUp, 1.15, 0.45, tOpenAI - 0.4);
  cues.push({ t: tMadeUp, type: 'pop' });
  kit.pipWave(pip, tMadeUp + 0.4, tMadeUp + 1.4);
  kit.pipLook(pip, tEach + 0.4, 0.0, -0.1);
  parts.live(pip, 31, 0, tOpenAI);

  const deeds = [
    (name, at) => parts.folder(name, st.front, [at[0] - 0.75, at[1]], { scale: 0.62, word: 'HELP', bars: [0.5] }).root,
    (name, at) => parts.word(name, st.front, at, 0.7, false).root,
    (name, at) => parts.hatch(name, st.front, at, 0.85),
    (name, at) => {
      const root = parts.group(name, st.front, at);
      parts.idea(`${name}-idea`, root, [-0.38, 0], 0.8);
      parts.check(`${name}-yes`, root, [0.45, 0], 0.85);
      return root;
    },
  ];
  deeds.forEach((deed, k) => {
    const at = [-4.5 + 3.0 * k, ROW];
    const t = tEach + 0.45 * k;
    const real = parts.mini(`real${k}`, st.cast, at, 0.85, 1 + k);
    kit.pop(real.root, t, 0.85, 0.35, tOpenAI - 0.4 + 0.03 * k);
    const did = deed(`deed${k}`, [at[0], at[1] + 1.35]);
    const size = did.sx;
    kit.pop(did, t + 0.2, size, 0.3, tOpenAI - 0.4 + 0.03 * k);
    const tie = kit.branch(`tie${k}`, st.props, [PIP[0] + (k - 1.5) * 0.4, PIP[1] - 1.0], [at[0], at[1] + 1.95], kit.MIST, 0.07, 0.5);
    kit.grow(tie, t - 0.2, 0.35, tOpenAI - 0.5);
    cues.push({ t, type: 'blip', pitch: 0.8 + 0.1 * k });
  });

  const page = parts.group('calendar', st.front, [5.6, 2.6]);
  kit.shape('calendar-page', kit.rrectPts(2.5, 2.0, 0.16), kit.material('#eef0ff', kit.MIST), page);
  kit.shape('calendar-head', kit.rrectPts(2.5, 0.55, 0.16), kit.material(kit.CORAL, kit.CORAL_DEEP), page, [0, 0.73]);
  kit.text('calendar-month', 'July', 0.7, kit.material(kit.INK900), page, [0, 0.02]);
  kit.text('calendar-year', '2026', 0.5, kit.material(kit.INK600), page, [0, -0.62]);
  kit.pop(page, tJuly, 1.0, 0.4);
  cues.push({ t: tJuly, type: 'pop', pitch: 0.8 });

  // ------------------------------------------------------------ a test run by OpenAI
  const lab = parts.building('openai', st.back, OPENAI, { w: 4.6, h: 3.9, label: 'OpenAI', rows: 3, seed: 8 });
  kit.pop(lab.root, tOpenAI, 1.0, 0.5);
  cues.push({ t: tOpenAI, type: 'pop', pitch: 0.6 });
  [[-1.3, 1, 0], [1.4, -1, 2]].forEach(([dx, facing, look], k) => {
    const made = parts.human(`maker${k}`, st.cast, [OPENAI[0] + dx, GROUND], 0.4, look, facing);
    kit.pop(made.root, tOpenAI + 0.3 + 0.2 * k, 0.4, 0.4);
  });

  // ------------------------------------------------------------ four days, twelve hundred agents, and the names of folders
  [0, 1, 2, 3].forEach((k) => {
    const day = parts.group(`day${k}`, st.front, [0.2 + 1.0 * k, 3.6]);
    kit.shape(`day${k}-glow`, kit.circlePts(0.55), kit.glowMaterial(kit.AMBER, 0.6), day);
    kit.shape(`day${k}-sun`, kit.circlePts(0.26), kit.material('#fff2c4', kit.AMBER), day);
    kit.pop(day, tDays + 0.3 * k, 1.0, 0.3);
    cues.push({ t: tDays + 0.3 * k, type: 'tick', pitch: 1.0 + 0.1 * k });
  });

  const field = kit.empty('field', st.props, [0, 0, kit.nextZ(st.props)]);
  const plain = kit.material(kit.MIST);
  for (let c = 0; c < FIELD.cols; c++) {
    for (let r = 0; r < FIELD.rows; r++) {
      const dot = kit.shape(`dot${c}_${r}`, kit.circlePts(0.058, null, null, 8), plain, field, [FIELD.x0 + c * FIELD.step, FIELD.y0 - r * FIELD.step]);
      kit.appear(dot, tTwelve + 1.4 * c / FIELD.cols, null, 0.1);
    }
  }
  cues.push({ t: tTwelve, type: 'swoosh', dur: 1.5 });
  const all = kit.text('count-all', '1,200', 0.8, kit.material(kit.PAPER), st.front, [1.1, 2.3]);
  kit.appear(all, tTwelve + 0.4, null, 0.3);

  NAMED.forEach((at, k) => {
    const made = parts.folder(`named${k}`, st.front, at, { scale: 0.62, which: 1 + k % 5, bars: [[0.6, 0.9], [0.9, 0.5], [0.5, 0.5, 0.6]][k % 3] });
    const t = tWrote + 0.28 * k;
    kit.pop(made.root, t, 0.62, 0.3);
    cues.push({ t, type: 'pop', pitch: 1.0 + 0.1 * k, gain: 0.7 });
    for (const at2 of parts.write(made, t + 0.2, 0.08)) cues.push({ t: at2, type: 'tick', pitch: 1.3, gain: 0.4 });
  });

  // ------------------------------------------------------------ camera
  kit.camera(parts.ramp([
    [0, [0, 0.2, 20.5]], [tOpenAI - 0.3, [0.1, 0.2, 19.6]], [tOpenAI + 1.2, [0.3, 0.4, 21]], [end, [0.35, 0.3, 20.4]],
  ]), 1.0);
  return cues;
}
