/* Scene 08: The question.

A cluster of agents, and then a question mark over it. Four suns for its
four days. Three discs light up, one for each of three things. Then the
cluster moves to the right, and a group of people around a fire appears on
the left.
*/
'use strict';

function build(T) {
  const { sec } = kit;
  parts.begin();

  const cues = [];
  const end = sec(kit.frames());
  const tAsk = T.at(0, 0.42);
  const tDays = T.start(1);
  const tThree = T.at(1, 0.3);
  const tPeople = T.at(1, 0.52);

  kit.backdrop(5);
  kit.motes(20, 17);
  const st = parts.stage();

  // ------------------------------------------------------------ the agents' group, and the question
  const cluster = parts.group('cluster', st.cast, [0, -0.5]);
  const rnd = new kit.Random(71);
  const places = [];
  for (let tries = 0; places.length < 24 && tries < 3000; tries++) {
    const a = rnd.random() * 2 * Math.PI;
    const far = Math.sqrt(rnd.random());
    const at = [3.0 * far * Math.cos(a), 1.75 * far * Math.sin(a)];
    if (places.every(([x, y]) => Math.hypot(at[0] - x, at[1] - y) > 0.78)) places.push(at);
  }
  places.sort((p, q) => q[1] - p[1]).forEach((at, i) => {
    const made = parts.mini(`member${i}`, cluster, at, 0.5, 1 + rnd.randrange(5));
    kit.pop(made.root, 0.2 + 0.03 * i, 0.5, 0.3);
  });
  cues.push({ t: 0.2, type: 'swoosh', dur: 1.0, gain: 0.6 });
  const asked = kit.text('asked', '?', 2.2, kit.material(kit.PAPER), st.front, [0, 2.7]);
  kit.appear(asked, tAsk, tDays - 0.3, 0.3);
  cues.push({ t: tAsk, type: 'blip', pitch: 0.8 });

  // ------------------------------------------------------------ four days, and three things
  [0, 1, 2, 3].forEach((k) => {
    const day = parts.group(`day${k}`, st.front, [-1.35 + 0.9 * k, 2.75]);
    kit.shape(`day${k}-glow`, kit.circlePts(0.55), kit.glowMaterial(kit.AMBER, 0.6), day);
    kit.shape(`day${k}-sun`, kit.circlePts(0.26), kit.material('#fff2c4', kit.AMBER), day);
    kit.pop(day, tDays + 0.1 + 0.25 * k, 1.0, 0.3, tThree - 0.25 + 0.03 * k, 0.2);
    cues.push({ t: tDays + 0.1 + 0.25 * k, type: 'tick', pitch: 1.0 + 0.1 * k });
  });
  const things = parts.three('things', st.front, [0, 2.75], [0, 1, 2], 1.7);
  things.discs.forEach((disc, k) => {
    kit.pop(disc, tThree + 0.25 * k, 1.0, 0.3);
    cues.push({ t: tThree + 0.25 * k, type: 'pop', pitch: 0.9 + 0.15 * k });
  });

  // ------------------------------------------------------------ what people do when they form a society
  parts.move(cluster, tPeople, [3.9, -0.5], 1.2);
  cues.push({ t: tPeople, type: 'whoosh', gain: 0.6 });
  const town = parts.group('town', st.front, [-3.9, -0.5]);
  parts.fire('fire', town, [0, -1.55]);
  kit.pop(town, tPeople + 0.5, 1.0, 0.5);
  [[-2.3, 1], [-1.2, 1], [1.2, -1], [2.3, -1], [0, 1]].forEach(([x, facing], k) => {
    const made = parts.human(`villager${k}`, st.cast, [-3.9 + x, -2.3 + (k === 4 ? 0.9 : 0)], 0.4, k, facing);
    kit.pop(made.root, tPeople + 0.6 + 0.12 * k, 0.4, 0.4);
    cues.push({ t: tPeople + 0.6 + 0.12 * k, type: 'pop', pitch: 0.7 + 0.08 * k, gain: 0.6 });
  });

  // ------------------------------------------------------------ camera
  kit.camera(parts.ramp([[0, [0, 0.4, 18.5]], [tDays, [0, 0.4, 19.2]], [tPeople + 1.2, [0, 0.3, 20]], [end, [0, 0.25, 19.6]]]), 1.0);
  return cues;
}
