const $ = (selector) => document.querySelector(selector);

const CASES = [
  {
    id: 'standard',
    label: '标准和',
    short: '五组顺子＋一对将',
    kicker: '真实判胡 · 应完整通过',
    title: '标准和：摸到九条完成一对将',
    summary: '16 张手牌已经组成五组顺子并单钓九条；摸到第二张九条后，后端应返回能胡和“标准和”。',
    hand: [0, 1, 2, 3, 4, 5, 9, 10, 11, 12, 13, 14, 18, 19, 20, 26],
    draw: 26,
    gold: 8,
    expectedWinning: true,
    expectedPattern: '标准和',
  },
  {
    id: 'pong',
    label: '碰碰胡',
    short: '检查附加牌型是否实现',
    kicker: '真实判胡 · 暴露识别缺口',
    title: '碰碰胡：五组刻子＋一对将',
    summary: '牌形本身应该能胡；同时检查后端是否真的把它识别为“碰碰胡”，而不只是笼统返回标准和。',
    hand: [1, 1, 1, 13, 13, 13, 25, 25, 25, 5, 5, 5, 17, 17, 17, 8],
    draw: 8,
    gold: 0,
    expectedWinning: true,
    expectedPattern: '碰碰胡',
  },
  {
    id: 'clean-suit',
    label: '清一色',
    short: '检查附加牌型是否实现',
    kicker: '真实判胡 · 暴露识别缺口',
    title: '清一色：17 张全部是筒子',
    summary: '牌形满足五组加一对，且全部是筒子；后端既要判断能胡，也需要明确是否已经实现“清一色”牌型识别。',
    hand: [9, 10, 11, 11, 12, 13, 12, 13, 14, 14, 15, 16, 15, 16, 17, 17],
    draw: 17,
    gold: 8,
    expectedWinning: true,
    expectedPattern: '清一色',
  },
  {
    id: 'single-gold',
    label: '单金万能',
    short: '真金补成缺少的三万',
    kicker: '金牌规则 · 应返回能胡',
    title: '单金万能：真金补成三万',
    summary: '第一组只有一万、二万，摸到一张九万真金后，应由后端把真金作为万能牌补成三万。',
    hand: [0, 1, 3, 4, 5, 9, 10, 11, 12, 13, 14, 18, 19, 20, 26, 26],
    draw: 8,
    gold: 8,
    expectedWinning: true,
    expectedPattern: '标准和',
  },
  {
    id: 'double-gold',
    label: '双金限制',
    short: '普通胡必须被游金规则拦截',
    kicker: '金牌规则 · 应返回不能普通胡',
    title: '双金限制：牌形虽完整，也不能普通胡',
    summary: '五组顺子加一对九条在结构上完整，但九条正好是真金且有两张；当前新厦麻代码应拦截普通胡并要求进入游金。',
    hand: [0, 1, 2, 3, 4, 5, 9, 10, 11, 12, 13, 14, 18, 19, 20, 26],
    draw: 26,
    gold: 26,
    expectedWinning: false,
    expectedPattern: null,
  },
  {
    id: 'white-proxy',
    label: '白板代金',
    short: '白板固定代金牌原面',
    kicker: '白板规则 · 应返回能胡',
    title: '白板代金：白板只当二万使用',
    summary: '本局二万是金牌，手中的白板应固定当作二万，与一万、三万组成顺子；它不是另一张万能牌。',
    hand: [0, 33, 2, 3, 4, 5, 9, 10, 11, 12, 13, 14, 18, 19, 20, 26],
    draw: 26,
    gold: 1,
    expectedWinning: true,
    expectedPattern: '标准和',
  },
];

let activeCase = CASES[0];
let checked = false;
let sending = false;

function createTile(id, { gold = false, drawn = false, next = false, compact = false } = {}) {
  return MahjongTileUI.createTile(id, {
    gold,
    goldProxy: id === 33 && activeCase.gold !== 33,
    drawn,
    compact,
    extraClasses: next ? ['is-next'] : [],
  });
}

function resetResult() {
  checked = false;
  sending = false;
  $('#win-engine-result').className = 'win-engine-result is-idle';
  $('#win-verdict-chip').textContent = '等待验证';
  $('#win-verdict-title').textContent = '后端尚未返回结果';
  $('#win-actual-result').textContent = '—';
  $('#win-verdict-detail').textContent = '点击上方按钮后，这里会显示真实规则代码的返回值。';
  $('#win-engine-checks').replaceChildren();
  $('#win-api-trace').textContent = '';
}

function renderCase() {
  $('#win-case-kicker').textContent = activeCase.kicker;
  $('#win-case-title').textContent = activeCase.title;
  $('#win-case-summary').textContent = activeCase.summary;
  $('#win-action-title').textContent = `下一张：${MahjongTileUI.tileName(activeCase.draw)}`;
  $('#win-action-detail').textContent = `页面预期：${activeCase.expectedWinning ? '能胡' : '不能胡'}${activeCase.expectedPattern ? ` · ${activeCase.expectedPattern}` : ''}`;
  $('#win-request-state').textContent = checked ? '后端已返回' : '尚未请求后端';
  $('#win-hand-count').textContent = checked ? '摸牌后 17 张' : '摸牌前 16 张';

  const hand = $('#win-test-hand');
  hand.replaceChildren();
  activeCase.hand.forEach((id) => hand.append(createTile(id, { gold: id === activeCase.gold })));
  if (checked) hand.append(createTile(activeCase.draw, { gold: activeCase.draw === activeCase.gold, drawn: true }));

  const drawSlot = $('#win-draw-tile');
  drawSlot.replaceChildren();
  if (!checked) drawSlot.append(createTile(activeCase.draw, { gold: activeCase.draw === activeCase.gold, next: true }));
  else drawSlot.textContent = '已摸入手牌';

  const goldSlot = $('#win-gold-tile');
  goldSlot.replaceChildren(createTile(activeCase.gold, { gold: true, compact: true }));
  const button = $('#run-real-win-check');
  button.disabled = checked || sending;
  button.textContent = checked ? '本次验牌完成' : '摸牌并调用真实判胡';
}

function renderChecks(checks) {
  const list = $('#win-engine-checks');
  list.replaceChildren();
  checks.forEach((check) => {
    const item = document.createElement('li');
    item.className = `is-${check.status}`;
    const statusText = { pass: '通过', fail: '未通过', skip: '未执行' }[check.status];
    item.innerHTML = `<b>${statusText} · ${check.label}</b><span>${check.detail}</span>`;
    list.append(item);
  });
}

function renderVerdict(payload, requestBody) {
  const { result, engine } = payload;
  const winMatches = result.winning === activeCase.expectedWinning;
  const patternMatches = !activeCase.expectedPattern || result.pattern === activeCase.expectedPattern;
  const panel = $('#win-engine-result');
  panel.className = 'win-engine-result';
  let chip;
  let title;
  let detail;
  if (!winMatches) {
    panel.classList.add('is-fail');
    chip = '规则结果错误';
    title = '后端的能胡／不能胡与预期不一致';
    detail = `页面预期${activeCase.expectedWinning ? '能胡' : '不能胡'}，后端实际返回${result.winning ? '能胡' : '不能胡'}。`;
  } else if (!patternMatches) {
    panel.classList.add('is-partial');
    chip = '部分实现';
    title = '基础胡牌已实现，附加牌型尚未实现';
    detail = `后端确认能胡，但只返回“${result.pattern || '未命名'}”，没有识别预期的“${activeCase.expectedPattern}”。`;
  } else {
    panel.classList.add('is-pass');
    chip = '真实代码通过';
    title = '后端结果与这个用例的预期一致';
    detail = `${result.reason}；规则版本 ${engine.version}。`;
  }
  $('#win-verdict-chip').textContent = chip;
  $('#win-verdict-title').textContent = title;
  $('#win-actual-result').textContent = result.winning ? `能胡 · ${result.pattern || '未命名'}` : '不能胡';
  $('#win-verdict-detail').textContent = detail;
  renderChecks(result.checks);
  $('#win-api-trace').textContent = JSON.stringify({ request: requestBody, response: payload }, null, 2);
}

async function runRealCheck() {
  if (sending || checked) return;
  sending = true;
  $('#run-real-win-check').disabled = true;
  $('#run-real-win-check').textContent = '正在请求后端…';
  $('#win-request-state').textContent = 'POST 请求进行中';
  const requestBody = { hand: activeCase.hand, draw: activeCase.draw, gold_tile: activeCase.gold };
  try {
    const response = await fetch('/api/rules-120/check-win', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || '后端验牌失败');
    checked = true;
    renderVerdict(payload, requestBody);
  } catch (error) {
    const panel = $('#win-engine-result');
    panel.className = 'win-engine-result is-fail';
    $('#win-verdict-chip').textContent = '请求失败';
    $('#win-verdict-title').textContent = '没有取得真实规则结果';
    $('#win-actual-result').textContent = 'API 错误';
    $('#win-verdict-detail').textContent = error.message;
    $('#win-api-trace').textContent = JSON.stringify({ request: requestBody, error: error.message }, null, 2);
  } finally {
    sending = false;
    renderCase();
  }
}

function buildPicker() {
  const picker = $('#win-case-buttons');
  CASES.forEach((testCase, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'win-case-button';
    button.dataset.case = testCase.id;
    button.innerHTML = `<span>${String(index + 1).padStart(2, '0')}</span><strong>${testCase.label}</strong><small>${testCase.short}</small>`;
    button.addEventListener('click', () => {
      activeCase = testCase;
      document.querySelectorAll('.win-case-button').forEach((candidate) => candidate.classList.toggle('is-active', candidate === button));
      resetResult();
      renderCase();
    });
    if (!index) button.classList.add('is-active');
    picker.append(button);
  });
}

document.querySelectorAll('.mini-backs').forEach((row) => {
  for (let index = 0; index < 10; index += 1) {
    const back = document.createElement('span');
    back.className = 'tile tile-back';
    row.append(back);
  }
});

$('#run-real-win-check').addEventListener('click', runRealCheck);
$('#win-case-reset').addEventListener('click', () => {
  resetResult();
  renderCase();
});

buildPicker();
resetResult();
renderCase();
