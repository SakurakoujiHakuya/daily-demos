import {
  INGREDIENTS as I,
  RECIPES as R,
  METHODS,
  createGame,
  forecast,
  price,
  buy,
  toggleMenu,
  setMarkup,
  openNight,
  cook,
  skipGuest,
  closeNight,
  nextNight,
  ending,
} from "./engine.js";
const KEY = "midnight-canteen-v1";
let state = createGame(),
  plate = [],
  method = "fry",
  storageOK = true;
try {
  const raw = JSON.parse(localStorage.getItem(KEY));
  if (
    raw?.version === 1 &&
    raw.stock &&
    Array.isArray(raw.menu) &&
    ["market", "kitchen", "closing", "summary", "end"].includes(raw.phase) &&
    raw.day >= 1 &&
    raw.day <= 7 &&
    Number.isFinite(raw.cash)
  )
    state = raw;
} catch {
  storageOK = false;
}
const el = document.getElementById("app");
const esc = (t) =>
  String(t).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    storageOK = false;
  }
}
const recipeCard = (r, select = false) =>
  `<button class="recipe ${state.menu.includes(r.id) ? "on" : ""}" data-action="${select ? "menu" : "recipe"}" data-id="${r.id}" ${select ? "" : 'title="把这份食谱放到操作台"'}><span class="recipe-icon">${r.icon}</span><span class="recipe-main"><strong>${r.name}</strong><small>${r.items.map((x) => I[x].name).join(" + ")} · ${METHODS[r.method]}</small><span class="recipe-tag">${r.tag} ${select ? (state.menu.includes(r.id) ? "· 已上菜单" : "· 点击上架") : "· 点击配方"}</span></span><b>¥${r.price + state.markup}</b></button>`;
function render() {
  const f = forecast(state),
    k = state.phase === "kitchen",
    market = state.phase === "market";
  el.innerHTML = `<section class="hero"><div><span class="eyebrow">MIDNIGHT CANTEEN / 07 NIGHTS</span><h1>午夜<span>小食堂</span><i>営業中</i></h1><p>人间很大，先吃一碗热的。</p></div><div class="night-clock"><small>今晚是</small><strong>${String(state.day).padStart(2, "0")}<em>/ 07</em></strong><span>${{ market: "黄昏 · 备货", kitchen: "午夜 · 开灶", closing: "深夜 · 收摊", summary: "天明 · 账本", end: "七夜 · 尾声" }[state.phase]}</span></div></section><section class="stats" aria-label="经营状态"><div><small>小店现金</small><strong>¥ ${state.cash}</strong></div><div><small>街坊口碑</small><strong>${state.reputation}<em>/100</em></strong></div><div><small>端出的热饭</small><strong>${state.served}<em> 碗</em></strong></div><div><small>累计食材损耗</small><strong>${state.waste}<em> 份</em></strong></div></section><div class="timeline">${Array.from({ length: 7 }, (_, i) => `<span class="${i + 1 === state.day ? "current" : i + 1 < state.day ? "past" : ""}">${i + 1 < state.day ? "✓" : "夜 " + (i + 1)}</span>`).join("")}</div><div class="notice"><span>✦</span><p>${esc(state.notice)}</p></div>${!storageOK ? '<p class="warning">此浏览器无法保存进度，刷新会重新开始。</p>' : ""}${market ? marketView(f) : k ? kitchenView() : state.phase === "closing" ? closingView() : summaryView()}<footer><span>原创虚构故事 · 没有时限，慢慢来</span><div><button data-action="new" class="text-button">换个故事种子</button><button data-action="reset" class="text-button">重走这七夜 ↺</button></div></footer>`;
}
function marketView(f) {
  return `<div class="layout"><section class="panel market"><div class="section-heading"><div><span class="eyebrow">01 / THE MARKET</span><h2>天黑之前，备好食材</h2></div><span class="badge">鲜食不留过夜</span></div><div class="weather"><b>☾ ${f.event.title}</b><span>${f.event.text}</span></div><div class="ingredients">${Object.entries(
    I,
  )
    .map(
      ([id, i]) =>
        `<article class="ingredient"><span class="ingredient-icon">${i.icon}</span><strong>${i.name}</strong><small>¥${price(state, id)} / 份 · ${i.fresh ? "鲜食" : "可过夜"}</small><div class="stepper"><button data-action="buy" data-id="${id}" data-qty="-1" aria-label="退回一份${i.name}" ${!state.stock[id] ? "disabled" : ""}>−</button><b>${state.stock[id]}</b><button data-action="buy" data-id="${id}" data-qty="1" aria-label="购买一份${i.name}" ${state.cash < price(state, id) || state.stock[id] >= 30 ? "disabled" : ""}>＋</button></div></article>`,
    )
    .join(
      "",
    )}</div><button class="secondary full" data-action="stock">粗配一篮食材 <span>菜单所需食材各补到 2 份，不保证够用</span></button><p class="note">当前进货净支出 ¥${state.night.spent} · 每晚另付 ¥12 房租。备货不会自动调整菜单。</p></section><aside class="panel"><span class="eyebrow">02 / TONIGHT'S MENU</span><h2>写下今夜的菜单 <small>${state.menu.length}/3</small></h2><div class="recipes">${R.map((r) => recipeCard(r, true)).join("")}</div><div class="pricing"><span>每道菜加价</span><div>${[0, 2, 4].map((v) => `<button data-action="markup" data-value="${v}" class="${state.markup === v ? "selected" : ""}">+ ¥${v}</button>`).join("")}</div></div><p class="note">高于客人预算会降低满意度。口碑变化 = 满意度 − 3。</p></aside></div><section class="panel guest-preview"><div class="section-heading"><div><span class="eyebrow">THE PEOPLE / 今晚会来的人</span><h2>每一份口味，都有一个名字</h2></div><span>${f.guests.length} 位客人</span></div><div class="guest-list">${f.guests.map((g) => `<div class="mini-guest"><span class="avatar">${g.name[0]}</span><strong>${g.name}</strong><small>${g.tag} · 预算 ¥${g.budget}</small></div>`).join("")}</div><button class="primary full" data-action="open">点亮门口的灯，开始营业 <span>→</span></button></section>`;
}
function kitchenView() {
  const g = state.guests[state.cursor],
    order = R.find((r) => r.id === g.order);
  return `<div class="layout kitchen-layout"><section class="panel"><div class="section-heading"><div><span class="eyebrow">THE COUNTER / ${state.cursor + 1} OF ${state.guests.length}</span><h2>今晚的客人</h2></div><span class="badge">不必着急</span></div><div class="customer"><span class="avatar large">${g.name[0]}</span><div><h3>${g.name}</h3><p>${g.job}</p><small>偏爱${g.tag} · 预算 ¥${g.budget}</small></div></div><div class="order"><small>“老板，来一份……”</small><h3>${order.icon} ${order.name}</h3><p>${order.items.map((x) => I[x].name).join(" + ")} · ${METHODS[order.method]} · ¥${order.price + state.markup}</p></div><p class="story">${order.line}</p><button class="secondary full" data-action="prepare" data-id="${order.id}">按点单配菜 <span>仍需选择做法并出餐</span></button><button class="text-button full muted" data-action="skip">库存不足，向这位客人道歉离店</button><div class="waiting">${state.guests.map((p, i) => `<span class="${i < state.cursor ? "done" : i === state.cursor ? "active" : ""}" title="${p.name}">${i < state.cursor ? "✓" : p.name[0]}</span>`).join("")}</div></section><section class="panel workstation"><span class="eyebrow">THE KITCHEN / 你的操作台</span><h2>一份食材，一点心意</h2><div class="stock-buttons">${Object.entries(
    I,
  )
    .map(
      ([id, i]) =>
        `<button data-action="ingredient" data-id="${id}" ${state.stock[id] - plate.filter((x) => x === id).length <= 0 || plate.length === 2 ? "disabled" : ""}><span>${i.icon}</span><b>${i.name}</b><small>余 ${state.stock[id]}</small></button>`,
    )
    .join(
      "",
    )}</div><div class="stove"><div class="steam">⌇ ⌇ ⌇</div><div class="plate">${[0, 1].map((i) => (plate[i] ? `<button data-action="remove" data-index="${i}" aria-label="撤回${I[plate[i]].name}">${I[plate[i]].icon}<small>${I[plate[i]].name} ×</small></button>` : '<span class="empty-slot">＋<small>选一份食材</small></span>')).join("")}</div><p>点食材放入盘中，点盘中食材撤回</p></div><div class="methods" role="group" aria-label="烹饪做法">${Object.entries(
    METHODS,
  )
    .map(
      ([id, name]) =>
        `<button class="${method === id ? "selected" : ""}" data-action="method" data-id="${id}">${name}<small>${{ fry: "热锅快炒", simmer: "温汤慢煮", steam: "小火清蒸" }[id]}</small></button>`,
    )
    .join(
      "",
    )}</div><button class="primary full" data-action="cook" ${plate.length !== 2 ? "disabled" : ""}>出餐 · 立即结算 <span>→</span></button></section></div><details class="panel cookbook"><summary>随手翻开食谱本 · 所有六道菜</summary><div class="cookbook-grid">${R.map((r) => recipeCard(r)).join("")}</div><p class="note">可以做菜单以外的菜，但不符合点单会影响满意度。配方必须完全相同。</p></details>`;
}
function closingView() {
  return `<section class="panel interlude"><span class="eyebrow">LAST LIGHT / 最后一位客人走了</span><div class="big-icon">☾</div><h2>灶火小了，夜色还很温柔。</h2><p>今晚端出 ${state.night.served} 碗热饭，收入 ¥${state.night.revenue}。<br>检查一下余料，就可以收起门口的灯。</p><button class="primary" data-action="close">打烊结账 · 支付 ¥12 房租</button></section>`;
}
function summaryView() {
  const end = state.phase === "end",
    e = ending(state),
    n = state.lastNight;
  return `<section class="panel interlude"><span class="eyebrow">${end ? "YOUR ENDING / 七夜之后" : "DAWN / 天快亮了"}</span><div class="big-icon">${end ? "✦" : "☕"}</div><h2>${end ? e.title : "第 " + n.day + " 夜的账本"}</h2><p>${end ? e.text : "有人带走一身疲惫，有人留下一个名字。<br>算完账，明晚继续。"}</p><div class="ledger"><div><span>当夜营业额</span><b>+ ¥${n.revenue}</b></div><div><span>当夜采购</span><b>− ¥${n.spent}</b></div><div><span>当夜房租</span><b>− ¥12</b></div><div><span>当夜鲜食损耗</span><b>${n.spoiled} 份</b></div><div><span>目前结余</span><b>¥${state.cash}</b></div></div>${end ? `<p class="seed">故事种子：${esc(state.seed)}<br>共招待 ${state.served} 人 · 谢客 ${state.lost} 人 · 损耗 ${state.waste} 份</p><button class="primary" data-action="reset">同样的七夜，换一种经营</button>` : '<button class="primary" data-action="next">翻过这一页，准备下一夜 →</button>'}</section>${
    state.history.length
      ? `<section class="panel memories"><span class="eyebrow">THE GUEST BOOK / 柜台边的记录</span><h2>端出去的每一碗</h2><div>${state.history
          .slice(-12)
          .reverse()
          .map(
            (h) =>
              `<p><small>第 ${h.day} 夜</small><strong>${h.name} · ${h.dish}</strong><span>满意 ${h.satisfaction}/6 · ¥${h.amount}</span></p>`,
          )
          .join("")}</div></section>`
      : ""
  }`;
}
function prepare(id) {
  const r = R.find((r) => r.id === id);
  if (r.items.some((x) => state.stock[x] < 1)) {
    state = {
      ...state,
      notice: "这份配方库存不足。可以换一道菜，或向客人道歉。",
    };
    return;
  }
  plate = [...r.items];
  state = {
    ...state,
    notice: `已配好${r.name}的食材。记得选择「${METHODS[r.method]}」再出餐。`,
  };
}
el.addEventListener("click", (e) => {
  const b = e.target.closest("button[data-action]");
  if (!b) return;
  const focusKey = Object.entries(b.dataset)
    .map(
      ([k, v]) =>
        `[data-${k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}="${v}"]`,
    )
    .join("");
  const a = b.dataset.action,
    id = b.dataset.id;
  if (a === "buy") state = buy(state, id, Number(b.dataset.qty));
  if (a === "menu") state = toggleMenu(state, id);
  if (a === "markup") state = setMarkup(state, Number(b.dataset.value));
  if (a === "open") {
    state = openNight(state);
    plate = [];
  }
  if (
    a === "ingredient" &&
    plate.length < 2 &&
    state.stock[id] > plate.filter((x) => x === id).length
  )
    plate.push(id);
  if (a === "remove") plate.splice(Number(b.dataset.index), 1);
  if (a === "method") method = id;
  if (a === "prepare" || a === "recipe") prepare(id);
  if (a === "cook") {
    state = cook(state, plate, method);
    plate = [];
  }
  if (a === "skip") {
    state = skipGuest(state);
    plate = [];
  }
  if (a === "close") state = closeNight(state);
  if (a === "next") state = nextNight(state);
  if (a === "stock") {
    const keys = [
      ...new Set(state.menu.flatMap((id) => R.find((r) => r.id === id).items)),
    ];
    let short = 0;
    for (const k of keys)
      for (let i = state.stock[k]; i < 2; i++) {
        if (state.cash >= price(state, k)) state = buy(state, k);
        else short++;
      }
    state = {
      ...state,
      notice: short
        ? "预算不足，粗配食材未完成。"
        : "已把菜单所需食材各补至 2 份。这不是精确点单预测：请对照客人口味自行增减，避免缺货或浪费。",
    };
  }
  if (a === "reset") {
    if (
      !confirm("放下这本账，使用相同种子从第一夜重新开始？当前进度会被替换。")
    )
      return;
    state = createGame(state.seed);
    plate = [];
    method = "fry";
  }
  if (a === "new") {
    const seed = prompt(
      "给新故事一个名字（相同名字 = 相同天气和客人）。会替换当前进度。",
      `灯下${new Date().toLocaleDateString("zh-CN")}`,
    );
    if (seed === null) return;
    state = createGame(seed);
    plate = [];
    method = "fry";
  }
  save();
  render();
  const focusTarget = el.querySelector("button" + focusKey);
  if (focusTarget && !focusTarget.disabled)
    focusTarget.focus({ preventScroll: true });
  else if (a === "ingredient" && plate.length === 2)
    el.querySelector('[data-action="method"]')?.focus({ preventScroll: true });
  else if (a === "cook" && state.phase === "kitchen")
    el.querySelector('[data-action="prepare"]')?.focus({ preventScroll: true });
  document.getElementById("announcer").textContent = state.notice;
  if (["open", "close", "next", "reset", "new"].includes(a))
    window.scrollTo({ top: 0, behavior: "smooth" });
});
document.getElementById("help").onclick = () =>
  document.getElementById("rules").showModal();
document.getElementById("close-help").onclick = () =>
  document.getElementById("rules").close();
render();
