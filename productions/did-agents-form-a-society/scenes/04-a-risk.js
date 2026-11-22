/* Scene 04: A risk.

Back at the board. Around Pip lie files with crosses on them, and his clock
is low. Three ideas light up on the board. A thought over the board shows
what trying one can cost: an agent takes an idea, and fails. One of the
ideas comes down to Pip all the same, and waits beside him. Pip looks at his
clock, and at the idea. Then he raises his arm and takes it, and a tick
stays over his head.
*/
'use strict';

function build(T) {
  const { sec } = kit;
  parts.begin();

  const PLACE = [-5.0, -3.6];
  const HELD = [PLACE[0], PLACE[1] - 0.62];
  const CLOCK = [PLACE[0] - 1.55, PLACE[1] + 1.2];
  const YES = [PLACE[0] + 0.05, PLACE[1] + 1.55];
  const OFFER = [PLACE[0] + 1.3, PLACE[1] + 0.35];
  const RISK = [0, 5.9];
  const IDEAS = [[1.2, 2.5], [1.2, 1.2], [-1.6, -1.6]];

  const GROUP = [PLACE[0] + 0.7, PLACE[1] + 1.0, 15];
  const BOARD = [0.6, 1.3, 27.5];

  const cues = [];
  const end = sec(kit.frames());
  const tNothing = T.start(0);
  const tTime = T.at(0, 0.58);
  const tIdeas = T.start(1);
  const tRisk = T.at(1, 0.44);
  const tFail = T.at(1, 0.72);
  const tAsked = T.start(2);
  const tYes = T.start(3);

  kit.backdrop(4);
  kit.motes(20, 9);
  const st = parts.stage();
  const { board, crowd } = parts.gathering(st, { keep: [PLACE, OFFER, CLOCK] });
  crowd.forEach((made, i) => parts.bob(made.root, 0, end, i * 0.9, 0.04));

  // ------------------------------------------------------------ nothing they found helped, and time is running out
  [[-8.3, -1.4], [-7.0, -5.3], [-2.6, -5.2], [-7.9, -3.4]].forEach((at, k) => {
    const useless = parts.sheet(`useless${k}`, st.props, at, { scale: 0.6, seed: 120 + k, rot: -0.3 + 0.2 * k });
    const mark = parts.cross(`useless${k}-mark`, st.front, at, 0.7);
    kit.pop(mark, tNothing + 0.2 + 0.25 * k, 0.7, 0.3, tIdeas - 0.4);
    parts.vanish(useless.root, tIdeas - 0.3, 0.3);
    cues.push({ t: tNothing + 0.2 + 0.25 * k, type: 'tick', pitch: 0.6, gain: 0.8 });
  });

  const pip = parts.agent('pip', st.cast, PLACE, 0.8);
  parts.mood(pip, 0, 'sad', 0);
  parts.word('held', st.front, HELD, 0.8, false);
  const clock = parts.clock('clock', st.front, CLOCK, 0.95, 0.3);
  kit.pop(clock.root, tTime, 0.95);
  parts.drain(clock, tTime + 0.2, end, 0.16);
  cues.push({ t: tTime, type: 'pop', pitch: 0.8 });
  for (let t = tTime + 0.3; t < tIdeas; t += 0.5) cues.push({ t, type: 'tick', pitch: 1.4, gain: 0.5 });
  kit.pipLook(pip, tNothing, 0.1, 0.1);
  kit.pipLook(pip, tTime + 0.2, -0.13, 0.08);
  parts.mood(pip, tTime + 0.3, 'worried');

  // ------------------------------------------------------------ the group has ideas left, and trying one is a risk
  const ideas = IDEAS.map((at, k) => {
    const made = parts.idea(`idea${k}`, st.front, [board.at[0] + at[0], board.at[1] + at[1] - 0.4], 0.9);
    kit.pop(made, tIdeas + 0.4 + 0.3 * k, 0.9, 0.35);
    cues.push({ t: tIdeas + 0.4 + 0.3 * k, type: 'pop', pitch: 1.1 + 0.15 * k });
    return made;
  });

  const risk = parts.thought('risk', st.front, RISK, 6.4, 2.3, [-0.5, -1]);
  kit.pop(risk.root, tRisk - 0.3, 1.0, 0.4, tAsked - 0.2);
  cues.push({ t: tRisk - 0.3, type: 'pop', pitch: 0.7 });
  kit.pop(parts.mini('risk-before', risk.root, [-2.35, -0.05], 0.55, 1).root, tRisk, 0.55, 0.3);
  kit.pop(parts.idea('risk-idea', risk.root, [-1.25, 0], 0.8), tRisk + 0.3, 0.8, 0.3);
  kit.pop(parts.arrow('risk-leads', risk.root, [-0.45, 0]), tFail - 0.5, 1.0, 0.3);
  kit.pop(parts.mini('risk-after', risk.root, [1.75, -0.05], 0.55, 1).root, tFail - 0.2, 0.55, 0.3);
  const lost = parts.cross('risk-lost', risk.root, [1.75, -0.02], 1.5);
  kit.pop(lost, tFail + 0.2, 1.5, 0.3);
  parts.pulse(lost, tFail + 0.9, 1.5, 1.25, 0.5);
  cues.push({ t: tRisk + 0.3, type: 'tick' }, { t: tFail + 0.2, type: 'tick', pitch: 0.5, gain: 1.3 });

  // ------------------------------------------------------------ the group asks Pip to try one anyway
  const call = parts.spark('call', st.front, kit.PAPER, 0.8);
  parts.send(call, [[board.at[0] - 3.2, board.at[1] - 1.4], [PLACE[0] + 1.0, PLACE[1] + 0.6]], tAsked, tAsked + 0.7, { spin: 4 });
  cues.push({ t: tAsked, type: 'rise', dur: 0.7, pitch: 0.9, gain: 0.5 });
  const start = [board.at[0] + IDEAS[2][0], board.at[1] + IDEAS[2][1] - 0.4];
  parts.send(ideas[2], [start, [(start[0] + OFFER[0]) / 2, OFFER[1] + 1.0], OFFER], tAsked + 0.5, tAsked + 1.4, { shown: true, size: 0.9, stay: true });
  cues.push({ t: tAsked + 0.5, type: 'whoosh', gain: 0.6 });
  kit.pipLook(pip, tAsked + 0.5, 0.13, 0.05);
  parts.mood(pip, tAsked + 1.2, 'wide', 0.15);
  const offered = kit.ring('offered', st.front, OFFER, 0.6, kit.AMBER, 0.07);
  kit.flash(offered, tAsked + 1.5, 0.8, 0.5);

  // Pip looks at his clock, and at the idea.
  kit.pipLook(pip, T.end(2) + 0.2, -0.13, 0.08);
  parts.mood(pip, T.end(2) + 0.3, 'worried');
  for (let t = T.end(2) + 0.2; t < tYes; t += 0.5) cues.push({ t, type: 'tick', pitch: 1.4, gain: 0.7 });
  kit.pipLook(pip, tYes - 0.35, 0.13, 0.03);

  // ------------------------------------------------------------ and Pip says yes
  kit.pipArm(pip, 'right', tYes, 150, 0.25);
  parts.mood(pip, tYes + 0.1, 'happy');
  const yes = parts.check('yes', st.front, YES, 0.9);
  kit.pop(yes, tYes + 0.3, 0.9, 0.3);
  cues.push({ t: tYes + 0.3, type: 'chime', gain: 0.5, dur: 1.3 });
  kit.pipArm(pip, 'right', tYes + 0.7, 80, 0.3);
  parts.send(ideas[2], [OFFER, [PLACE[0] + 0.95, PLACE[1] - 0.1]], tYes + 0.75, tYes + 1.2, { shown: true, size: 0.9, to: 0.8, stay: true });
  parts.live(pip, 21);

  // ------------------------------------------------------------ camera
  kit.camera(parts.ramp([
    [0, GROUP], [tIdeas - 0.3, [GROUP[0], GROUP[1], 14.4]], [tIdeas + 1.2, BOARD], [tAsked - 0.2, [0.7, 1.2, 27]], [tAsked + 1.2, GROUP],
    [tYes, [GROUP[0], GROUP[1] - 0.1, 13.6]], [end, [GROUP[0] - 0.1, GROUP[1] - 0.2, 12.8]],
  ]), 1.0);
  return cues;
}
