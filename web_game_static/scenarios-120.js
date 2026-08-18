const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const CHINESE_NUMERALS = ['一', '二', '三', '四', '伍', '六', '七', '八', '九'];
const FLOWER_NAMES = ['梅', '兰', '菊', '竹', '春', '夏', '秋', '冬'];
const PIP_POSITIONS = {
  1: [5], 2: [3, 7], 3: [3, 5, 7], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9], 7: [1, 3, 4, 5, 6, 7, 9], 8: [1, 2, 3, 4, 6, 7, 8, 9],
  9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
};

const SCENARIOS = {
  pong: {
    kicker: '牌型验证 · 摸一次',
    title: '碰碰胡：最后摸成一对将',
    summary: '东家已经有五组刻子，手里单独留着一张白板。摸到第二张白板后，牌形成为“五刻子＋一对将”。',
    timeline: ['中局牌形', '摸到白板', '满足胡牌条件'],
    maxSteps: 1,
    controls: [
      ['准备', '现在轮到东家摸牌', '当前是五组刻子＋单张白板，等待另一张白板。', '摸一张牌：白板'],
      ['已成立', '五组刻子和一对将已经齐全', '程序应给出胡牌提示，同时标明碰碰胡附加分取决于房规。', '演示完成'],
    ],
  },
  'clean-suit': {
    kicker: '牌型验证 · 不使用真金',
    title: '清一色：所有组牌都只有筒子',
    summary: '用一个不含真金、白板和花牌的牌例验证清一色。最后摸到九筒，五组牌和一对将全部属于筒子。',
    timeline: ['全筒听牌', '摸到九筒', '清一色牌形成立'],
    maxSteps: 1,
    controls: [
      ['房规牌型', '东家正在单钓九筒', '当前 16 张已经全部是筒子，且能拆成五组牌＋单张九筒。', '摸一张牌：九筒'],
      ['已成立', '17 张全部是筒子', '基础胡牌条件已经满足；清一色是否另加分，交给房间规则决定。', '演示完成'],
    ],
  },
  flower: {
    kicker: '补花验证 · 摸花后再补一次',
    title: '摸到花：亮花，再从牌尾补一张',
    summary: '花牌不进入 16／17 张的胡牌结构。摸到花后先公开放入花区，再从牌墙尾补一张普通牌。',
    timeline: ['正常摸牌', '摸到花并亮出', '牌尾补进普通牌'],
    maxSteps: 2,
    controls: [
      ['准备', '现在轮到东家摸牌', '第一步将固定摸到“梅”。', '摸一张牌：梅'],
      ['需补牌', '摸到花，花牌不进入手牌', '系统必须提示“可以另外再摸一张”。', '从牌尾补一张'],
      ['已补完', '补进普通牌，流程完成', '手牌恢复到 17 张，可以继续出牌。', '演示完成'],
    ],
  },
  'kong-blossom': {
    kicker: '杠补验证 · 两个动作',
    title: '杠上花：暗杠后补进胡牌',
    summary: '东家先摸到第四张五筒并开暗杠，再从牌墙尾补到九筒自摸。补花得到的替补牌不叫杠上花。',
    timeline: ['等待第四张五筒', '开暗杠', '杠尾补到九筒', '杠上花成立'],
    maxSteps: 2,
    controls: [
      ['准备', '手中已有三张五筒', '先摸到第四张五筒，系统应允许开暗杠。', '摸五筒并开暗杠'],
      ['需杠补', '暗杠已经成立', '开杠后不能直接出牌，必须先从牌墙尾补一张。', '杠尾补一张：九筒'],
      ['已成立', '杠补牌正好完成胡牌', '这是杠上花，同时属于自摸；是否另加分由房规决定。', '演示完成'],
    ],
  },
  'gold-capture': {
    kicker: '开局特殊胡法 · 正常摸牌前',
    title: '抢金：开出的金正好完成起手听牌',
    summary: '补花结束后开金。若东家的 16 张起手牌正好等待金牌所代表的那张牌，应在任何人正常摸牌前检查抢金。',
    timeline: ['起手已经听牌', '翻出九条为金', '抢金立即结算'],
    maxSteps: 1,
    controls: [
      ['等待开金', '东家起手单钓九条', '此时还没有进入第一巡正常摸牌。', '翻开真金：九条'],
      ['抢金成立', '开出的金完成起手牌形', '应先处理抢金，再开始庄家的正常摸牌回合。', '演示完成'],
    ],
  },
  'three-gold': {
    kicker: '开局最高优先级 · 只限起手',
    title: '三金倒：开金时手中已有三张真金',
    summary: '牌墙翻出第四张九万作为金，东家起手的另外三张九万同时成为真金。当前 120 张默认只在开局检查三金倒。',
    timeline: ['起手持三张同牌', '翻出第四张为金', '三金倒优先结算'],
    maxSteps: 1,
    controls: [
      ['等待开金', '东家手中有三张九万', '在金牌揭晓前，它们只是普通九万。', '翻开真金：九万'],
      ['立即结算', '起手三张九万全部成为真金', '三金倒优先于抢金；牌中后来摸成三金不能直接套用。', '演示完成'],
    ],
  },
  'double-tour': {
    kicker: '游金验证 · 必须两轮',
    title: '双游：两轮回摸，不能一轮就结算',
    summary: '东家已有两张真金并进入游金流程。第一轮回摸后打出一张金升级双游；其余三家再走最后一轮，东家第二次回摸才完成。',
    timeline: ['已进入游金', '第一轮回摸并打金', '第二轮回摸', '双游成立'],
    maxSteps: 2,
    controls: [
      ['游金中', '准备模拟第一轮回摸', '南、西、北完成一轮后，东家第 1 次回摸并打出一张金。', '模拟第一轮摸牌'],
      ['双游中', '第一轮只完成升级，还必须走第二轮', '再给三家最后一次摸牌机会，然后东家第 2 次回摸。', '模拟第二轮摸牌'],
      ['已成立', '两轮都已走完', '现在才提示双游赢牌条件成立。', '演示完成'],
    ],
  },
};

let activeScenario = 'pong';
let scenarioStep = 0;

function tileName(id) {
  if (id < 27) return `${id % 9 + 1}${['万', '筒', '条'][Math.floor(id / 9)]}`;
  if (id === 33) return '白板';
  if (id >= 34 && id < 42) return FLOWER_NAMES[id - 34];
  return `未知牌 ${id}`;
}

function pipColorClass(rank, position, index) {
  if (rank === 2) return index === 0 ? 'pip-green' : 'pip-blue';
  if (rank === 3) return ['pip-green', 'pip-red', 'pip-blue'][index];
  if (rank === 4) return [1, 9].includes(position) ? 'pip-green' : 'pip-blue';
  if (rank === 5) return position === 5 ? 'pip-red' : ([1, 9].includes(position) ? 'pip-green' : 'pip-blue');
  if (rank === 6) return position <= 3 ? 'pip-green' : 'pip-red';
  if (rank === 7) return index < 3 ? 'pip-green' : 'pip-red';
  if (rank === 8) return 'pip-blue';
  if (rank === 9) return position <= 3 ? 'pip-green' : (position <= 6 ? 'pip-red' : 'pip-blue');
  return 'pip-blue';
}

function bambooColorClass(rank, position, index) {
  if (rank === 5) return index === 2 ? 'pip-red' : 'pip-green';
  if (rank === 7) return index === 0 ? 'pip-red' : 'pip-green';
  if (rank === 9) return [1, 4, 7].includes(index) ? 'pip-red' : 'pip-green';
  return 'pip-green';
}

function tileFace(id) {
  const face = document.createElement('span');
  face.className = 'tile-face';
  if (id < 9) {
    face.classList.add('tile-wan');
    face.innerHTML = `<span class="tile-rank">${CHINESE_NUMERALS[id]}</span><span class="tile-unit">萬</span>`;
    return face;
  }
  if (id < 27) {
    const isTong = id < 18;
    const rank = id % 9 + 1;
    face.classList.add(isTong ? 'tile-tong' : 'tile-tiao', `rank-${rank}`);
    if (isTong && rank === 1) {
      face.classList.add('tile-one-circle');
      face.innerHTML = '<svg class="one-circle-wheel" viewBox="0 0 48 58" aria-hidden="true"><circle cx="24" cy="29" r="20" fill="#f5ead6" stroke="#226f92" stroke-width="2.4"/><circle cx="24" cy="29" r="16.5" fill="none" stroke="#2f8a5b" stroke-width="2"/><g stroke="#165b79" stroke-width=".8"><ellipse cx="24" cy="17" rx="3.6" ry="7.2" fill="#2a769c"/><ellipse cx="24" cy="17" rx="3.6" ry="7.2" fill="#3b955f" transform="rotate(45 24 29)"/><ellipse cx="24" cy="17" rx="3.6" ry="7.2" fill="#2a769c" transform="rotate(90 24 29)"/><ellipse cx="24" cy="17" rx="3.6" ry="7.2" fill="#3b955f" transform="rotate(135 24 29)"/><ellipse cx="24" cy="17" rx="3.6" ry="7.2" fill="#2a769c" transform="rotate(180 24 29)"/><ellipse cx="24" cy="17" rx="3.6" ry="7.2" fill="#3b955f" transform="rotate(225 24 29)"/><ellipse cx="24" cy="17" rx="3.6" ry="7.2" fill="#2a769c" transform="rotate(270 24 29)"/><ellipse cx="24" cy="17" rx="3.6" ry="7.2" fill="#3b955f" transform="rotate(315 24 29)"/></g><circle cx="24" cy="29" r="8" fill="#f7eddc" stroke="#bb3f35" stroke-width="2"/><path d="M24 20.8l2.2 5.5 5.9-1.4-3.7 4.8 3.7 4.7-5.9-1.3-2.2 5.5-2.2-5.5-5.9 1.3 3.7-4.7-3.7-4.8 5.9 1.4z" fill="#c64638"/><circle cx="24" cy="29" r="2.3" fill="#f2d45d" stroke="#286b8b" stroke-width="1"/></svg>';
      return face;
    }
    if (!isTong && rank === 1) {
      face.classList.add('tile-one-bamboo');
      face.innerHTML = '<svg class="bamboo-bird" viewBox="0 0 44 58" aria-hidden="true"><path d="M14 47c2-12 8-20 17-29-1 12-4 24-11 33z" fill="#19764f"/><path d="M19 45c-1-12 2-24 8-36 4 14 3 27-2 39z" fill="#287baf"/><path d="M24 45c2-10 8-20 14-27-1 13-4 24-10 31z" fill="#c64638"/><ellipse cx="19" cy="24" rx="8" ry="11" fill="#2f8b56"/><path d="M14 22c6 1 11 4 14 9-6 1-11-1-15-5z" fill="#176b9c"/><circle cx="18" cy="12" r="6" fill="#308d59"/><path d="M22 11l8 3-8 3z" fill="#d84b38"/><circle cx="20" cy="11" r="1.2" fill="#102f29"/></svg>';
      return face;
    }
    const grid = document.createElement('span');
    grid.className = 'pip-grid';
    PIP_POSITIONS[rank].forEach((position, index) => {
      const pip = document.createElement('i');
      const color = isTong ? pipColorClass(rank, position, index) : bambooColorClass(rank, position, index);
      pip.className = `pip pip-${position} ${color}`;
      grid.append(pip);
    });
    face.append(grid);
    return face;
  }
  if (id === 33) {
    face.classList.add('tile-dragon', 'dragon-2', 'white-dragon');
    face.innerHTML = '<span class="white-dragon-frame" aria-hidden="true"></span>';
    return face;
  }
  face.classList.add('tile-flower');
  face.innerHTML = `<span>❀</span><small>${tileName(id)}</small>`;
  return face;
}

function createTile(id, { drawn = false, winning = false, gold = false, discarded = false } = {}) {
  const tile = $('#scenario-tile-template').content.firstElementChild.cloneNode(true);
  tile.dataset.tile = id;
  tile.title = tileName(id);
  tile.setAttribute('aria-label', tileName(id));
  const corner = document.createElement('span');
  corner.className = 'tile-corner';
  corner.textContent = tileName(id);
  tile.append(corner, tileFace(id));
  tile.classList.toggle('is-drawn', drawn);
  tile.classList.toggle('is-winning', winning);
  tile.classList.toggle('gold', gold);
  tile.classList.toggle('is-discarded', discarded);
  return tile;
}

function tileLine(ids, options = {}) {
  const row = document.createElement('div');
  row.className = options.className || 'scenario-hand-line';
  ids.forEach((id, index) => row.append(createTile(id, {
    drawn: options.drawnIndex === index,
    winning: options.winningIndices?.includes(index),
    gold: options.goldIds?.includes(id),
  })));
  return row;
}

function appendLabel(scene, label, meta) {
  const line = document.createElement('div');
  line.className = 'scene-label';
  line.innerHTML = `<strong>${label}</strong><span>${meta}</span>`;
  scene.append(line);
}

function appendResult(scene, title, detail) {
  const result = document.createElement('div');
  result.className = 'scenario-result';
  result.innerHTML = `<span class="scenario-result-icon">✓</span><div><strong>${title}</strong><p>${detail}</p></div>`;
  scene.append(result);
}

function renderPongScenario() {
  const scene = $('#scenario-scene');
  appendLabel(scene, '东家 · 中局牌面', scenarioStep ? '17 张 · 已摸牌' : '16 张 · 等待摸牌');
  const meldLine = document.createElement('div');
  meldLine.className = 'scenario-group-line';
  [[1, 1, 1], [13, 13, 13], [25, 25, 25]].forEach((ids) => {
    const meld = tileLine(ids);
    meld.className = 'scenario-meld';
    meldLine.append(meld);
  });
  scene.append(meldLine);
  scene.append(tileLine([5, 5, 5, 17, 17, 17, 33], { winningIndices: scenarioStep ? [6] : [] }));
  const drawLine = document.createElement('div');
  drawLine.className = 'scenario-draw-line';
  drawLine.innerHTML = '<b>刚摸到</b>';
  if (scenarioStep) drawLine.append(createTile(33, { drawn: true, winning: true }));
  else drawLine.insertAdjacentHTML('beforeend', '<span class="muted">点击下方按钮摸牌</span>');
  scene.append(drawLine);
  if (scenarioStep) appendResult(scene, '满足赢牌条件：碰碰胡', '二万、五筒、八条、六万、九筒组成五组刻子，两张白板作将。是否另加碰碰胡分，由房规决定。');
}

function renderCleanSuitScenario() {
  const scene = $('#scenario-scene');
  const hand = [9, 10, 11, 11, 12, 13, 12, 13, 14, 14, 15, 16, 15, 16, 17, 17];
  appendLabel(scene, '东家 · 全筒子手牌', scenarioStep ? '17 张 · 清一色成立' : '16 张 · 单钓九筒');
  scene.append(tileLine(hand, { winningIndices: scenarioStep ? [15] : [] }));
  const drawLine = document.createElement('div');
  drawLine.className = 'scenario-draw-line';
  drawLine.innerHTML = '<b>刚摸到</b>';
  if (scenarioStep) drawLine.append(createTile(17, { drawn: true, winning: true }));
  else drawLine.insertAdjacentHTML('beforeend', '<span class="scenario-rule-chip">本例无真金、无白板、无花</span>');
  scene.append(drawLine);
  if (scenarioStep) appendResult(scene, '满足赢牌条件：清一色', '一二三筒、三四五筒、四五六筒、六七八筒、七八九筒，加一对九筒；全副牌只有筒子。');
}

function renderFlowerScenario() {
  const scene = $('#scenario-scene');
  const hand = [1, 1, 2, 2, 3, 3, 4, 4, 10, 10, 11, 11, 19, 19, 24, 24];
  if (scenarioStep >= 2) hand.push(15);
  appendLabel(scene, '东家 · 当前手牌', scenarioStep >= 2 ? '补牌后 17 张' : '16 张普通牌');
  scene.append(tileLine(hand, { drawnIndex: scenarioStep >= 2 ? hand.length - 1 : -1 }));
  const flowerLine = document.createElement('div');
  flowerLine.className = 'scenario-flower-line';
  flowerLine.innerHTML = '<b>公开花区</b>';
  if (scenarioStep >= 1) flowerLine.append(createTile(34, { drawn: scenarioStep === 1 }));
  else flowerLine.insertAdjacentHTML('beforeend', '<span class="muted">暂无花牌</span>');
  scene.append(flowerLine);
  if (scenarioStep === 1) appendResult(scene, '摸到“梅”，可以另外再摸一张', '花牌立刻亮出，不计入手牌张数；下一步必须从牌墙尾补牌。');
  if (scenarioStep >= 2) appendResult(scene, '补花完成', '梅花留在公开花区，牌尾补进七筒。手牌恢复到本回合应有的 17 张，可以继续判断胡牌或出牌。');
}

function renderKongBlossomScenario() {
  const scene = $('#scenario-scene');
  const remainder = [0, 1, 2, 3, 4, 5, 18, 19, 20, 21, 22, 23, 17];
  appendLabel(scene, '东家 · 中局牌面', scenarioStep === 0 ? '16 张 · 手中三张五筒' : (scenarioStep === 1 ? '暗杠后等待补牌' : '杠补后胡牌'));

  if (scenarioStep === 0) {
    scene.append(tileLine([13, 13, 13, ...remainder]));
  } else {
    const groupLine = document.createElement('div');
    groupLine.className = 'scenario-group-line';
    const kong = tileLine([13, 13, 13, 13], { drawnIndex: scenarioStep === 1 ? 3 : -1 });
    kong.className = 'scenario-meld is-kong';
    groupLine.append(kong);
    scene.append(groupLine, tileLine(remainder, { winningIndices: scenarioStep >= 2 ? [12] : [] }));
  }

  const drawLine = document.createElement('div');
  drawLine.className = 'scenario-draw-line';
  drawLine.innerHTML = `<b>${scenarioStep === 0 ? '本轮摸牌' : '杠尾补牌'}</b>`;
  if (scenarioStep === 0) drawLine.insertAdjacentHTML('beforeend', '<span class="muted">等待第四张五筒</span>');
  if (scenarioStep === 1) drawLine.insertAdjacentHTML('beforeend', '<span class="scenario-rule-chip">暗杠完成，必须补一张</span>');
  if (scenarioStep >= 2) drawLine.append(createTile(17, { drawn: true, winning: true }));
  scene.append(drawLine);
  if (scenarioStep === 1) appendResult(scene, '暗杠成立：下一动作必须杠补', '四张五筒移到暗杠区；这时牌还没有胡，不能跳过补牌直接出牌。');
  if (scenarioStep >= 2) appendResult(scene, '满足赢牌条件：杠上花', '从牌墙尾补到九筒，与手中九筒组成将牌。因为胡在杠补牌上，所以是杠上花并按自摸处理。');
}

function renderGoldCaptureScenario() {
  const scene = $('#scenario-scene');
  const hand = [0, 1, 2, 3, 4, 5, 9, 10, 11, 12, 13, 14, 18, 19, 20, 26];
  appendLabel(scene, '东家 · 补花后的起手牌', '16 张 · 单钓九条');
  scene.append(tileLine(hand, { winningIndices: scenarioStep ? [15] : [] }));
  const reveal = document.createElement('div');
  reveal.className = 'scenario-special-zone';
  reveal.innerHTML = '<b>开出的真金</b>';
  if (scenarioStep) reveal.append(createTile(26, { gold: true, drawn: true, winning: true }));
  else reveal.insertAdjacentHTML('beforeend', '<span class="hidden-tile-placeholder">?</span><span class="muted">尚未开金</span>');
  scene.append(reveal);
  if (scenarioStep) appendResult(scene, '满足赢牌条件：抢金', '真金九条恰好完成起手单钓。抢金发生在正常摸牌前，应优先结算。');
}

function renderThreeGoldScenario() {
  const scene = $('#scenario-scene');
  const hand = [8, 8, 8, 0, 1, 2, 3, 4, 5, 9, 10, 11, 18, 19, 20, 25];
  appendLabel(scene, '东家 · 补花后的起手牌', '16 张 · 手中三张九万');
  scene.append(tileLine(hand, {
    goldIds: scenarioStep ? [8] : [],
    winningIndices: scenarioStep ? [0, 1, 2] : [],
  }));
  const reveal = document.createElement('div');
  reveal.className = 'scenario-special-zone';
  reveal.innerHTML = '<b>牌墙翻出的牌</b>';
  if (scenarioStep) reveal.append(createTile(8, { gold: true, drawn: true }));
  else reveal.insertAdjacentHTML('beforeend', '<span class="hidden-tile-placeholder">?</span><span class="muted">九万尚未成为金</span>');
  scene.append(reveal);
  if (scenarioStep) appendResult(scene, '满足立即赢牌条件：起手三金倒', '第四张九万在牌墙中被翻为金，东家手里的三张九万同时成为三张真金；本页默认三金倒高于抢金。');
}

function renderDoubleTourScenario() {
  const scene = $('#scenario-scene');
  appendLabel(scene, '东家 · 游金状态', scenarioStep === 0 ? '准备第一轮' : (scenarioStep === 1 ? '已升级双游' : '第二轮完成'));

  const goldWrap = document.createElement('div');
  goldWrap.className = 'tour-gold-count';
  const keptGold = document.createElement('div');
  keptGold.append(createTile(2, { gold: true, winning: scenarioStep >= 2 }), Object.assign(document.createElement('small'), { textContent: '手中真金' }));
  goldWrap.append(keptGold);
  const secondGold = document.createElement('div');
  secondGold.append(createTile(2, { gold: true, discarded: scenarioStep >= 1 }), Object.assign(document.createElement('small'), { textContent: scenarioStep >= 1 ? '第一轮打出的金' : '准备升级的金' }));
  goldWrap.append(secondGold);
  scene.append(goldWrap);

  const lapCounter = document.createElement('div');
  lapCounter.className = 'lap-counter';
  const first = document.createElement('span');
  first.textContent = '第一轮：三家摸打 → 东家第 1 次回摸';
  first.className = scenarioStep >= 1 ? 'is-done' : 'is-current';
  const second = document.createElement('span');
  second.textContent = '第二轮：三家最后机会 → 东家第 2 次回摸';
  second.className = scenarioStep >= 2 ? 'is-done' : (scenarioStep === 1 ? 'is-current' : '');
  lapCounter.append(first, second);
  scene.append(lapCounter);

  const drawLine = document.createElement('div');
  drawLine.className = 'scenario-draw-line';
  drawLine.innerHTML = '<b>回摸记录</b>';
  if (scenarioStep >= 1) drawLine.append(createTile(22, { drawn: scenarioStep === 1 }));
  if (scenarioStep >= 2) drawLine.append(createTile(8, { drawn: true, winning: true }));
  if (!scenarioStep) drawLine.insertAdjacentHTML('beforeend', '<span class="muted">尚未回摸</span>');
  scene.append(drawLine);

  if (scenarioStep === 1) appendResult(scene, '第一轮完成：只升级为双游，尚未结算', '东家第一次回摸后打出一张真金。接下来还要让南、西、北三家各获得最后一次摸牌机会。');
  if (scenarioStep >= 2) appendResult(scene, '第二轮完成：满足双游赢牌条件', '其余三家第二轮都未截胡，东家第二次回摸，双游流程才正式完成。');
}

function renderTimeline() {
  const timeline = $('#scenario-timeline');
  const scenario = SCENARIOS[activeScenario];
  const items = scenario.timeline;
  const progress = scenarioStep >= scenario.maxSteps
    ? items.length
    : activeScenario === 'double-tour' || activeScenario === 'kong-blossom'
      ? scenarioStep * 2
      : scenarioStep;
  timeline.style.setProperty('--timeline-columns', items.length);
  items.forEach((label, index) => {
    const item = document.createElement('li');
    item.textContent = `${index + 1}. ${label}`;
    if (index < progress) item.classList.add('is-done');
    else if (index === progress && progress < items.length) item.classList.add('is-current');
    timeline.append(item);
  });
}

function updateOpponentState() {
  $$('.scenario-opponents span').forEach((opponent) => {
    const status = opponent.querySelector('small');
    const isTour = activeScenario === 'double-tour';
    const done = isTour && scenarioStep > 0;
    opponent.classList.toggle('is-done', done);
    status.textContent = isTour ? (done ? `已完成第 ${scenarioStep} 轮` : '等待第一轮') : '旁观本情景';
  });
}

function updateControls() {
  const next = $('#scenario-next');
  const badge = $('#scenario-step-badge');
  const message = $('#scenario-message');
  const detail = $('#scenario-detail');
  const scenario = SCENARIOS[activeScenario];
  const [badgeText, messageText, detailText, buttonText] = scenario.controls[scenarioStep];
  badge.textContent = badgeText;
  message.textContent = messageText;
  detail.textContent = detailText;
  next.textContent = buttonText;
  next.disabled = scenarioStep >= scenario.maxSteps;
}

function renderScenario() {
  const scenario = SCENARIOS[activeScenario];
  $('#scenario-kicker').textContent = scenario.kicker;
  $('#scenario-title').textContent = scenario.title;
  $('#scenario-summary').textContent = scenario.summary;
  $('#scenario-scene').replaceChildren();
  $('#scenario-timeline').replaceChildren();
  if (activeScenario === 'pong') renderPongScenario();
  if (activeScenario === 'clean-suit') renderCleanSuitScenario();
  if (activeScenario === 'flower') renderFlowerScenario();
  if (activeScenario === 'kong-blossom') renderKongBlossomScenario();
  if (activeScenario === 'gold-capture') renderGoldCaptureScenario();
  if (activeScenario === 'three-gold') renderThreeGoldScenario();
  if (activeScenario === 'double-tour') renderDoubleTourScenario();
  updateOpponentState();
  updateControls();
  renderTimeline();
}

function runPongPongStep() {
  if (scenarioStep < SCENARIOS[activeScenario].maxSteps) scenarioStep += 1;
  renderScenario();
}

function runCleanSuitStep() {
  if (scenarioStep < SCENARIOS[activeScenario].maxSteps) scenarioStep += 1;
  renderScenario();
}

function runFlowerStep() {
  if (scenarioStep < SCENARIOS[activeScenario].maxSteps) scenarioStep += 1;
  renderScenario();
}

function runKongBlossomStep() {
  if (scenarioStep < SCENARIOS[activeScenario].maxSteps) scenarioStep += 1;
  renderScenario();
}

function runGoldCaptureStep() {
  if (scenarioStep < SCENARIOS[activeScenario].maxSteps) scenarioStep += 1;
  renderScenario();
}

function runThreeGoldStep() {
  if (scenarioStep < SCENARIOS[activeScenario].maxSteps) scenarioStep += 1;
  renderScenario();
}

function runDoubleTourStep() {
  if (scenarioStep < SCENARIOS[activeScenario].maxSteps) scenarioStep += 1;
  renderScenario();
}

$('#scenario-next').addEventListener('click', () => {
  if (activeScenario === 'pong') runPongPongStep();
  if (activeScenario === 'clean-suit') runCleanSuitStep();
  if (activeScenario === 'flower') runFlowerStep();
  if (activeScenario === 'kong-blossom') runKongBlossomStep();
  if (activeScenario === 'gold-capture') runGoldCaptureStep();
  if (activeScenario === 'three-gold') runThreeGoldStep();
  if (activeScenario === 'double-tour') runDoubleTourStep();
});

$('#scenario-reset').addEventListener('click', () => {
  scenarioStep = 0;
  renderScenario();
});

$$('[data-scenario]').forEach((button) => {
  button.addEventListener('click', () => {
    activeScenario = button.dataset.scenario;
    scenarioStep = 0;
    $$('[data-scenario]').forEach((candidate) => candidate.classList.toggle('is-active', candidate === button));
    renderScenario();
  });
});

renderScenario();
