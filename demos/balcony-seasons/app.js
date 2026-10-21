import {
  CROPS,
  SCENARIOS,
  WEATHER,
  createGame,
  act,
  weatherAt,
  lightAt,
  score,
} from "./engine.js";
let game = createGame(),
  chosen = "radish",
  selected = 1;
const $ = (s) => document.querySelector(s);
function plantSVG(p) {
  const c = CROPS[p.crop],
    stage = Math.min(1, p.age / c.days),
    h = 24 + stage * 40;
  return `<svg viewBox="0 0 110 110" aria-hidden="true"><ellipse cx="55" cy="94" rx="32" ry="7" fill="#5a6242" opacity=".08"/><path d="M55 89 Q48 ${70 - h / 2} 57 ${90 - h}" stroke="#52794d" stroke-width="3" fill="none"/><path d="M54 76 Q24 ${65 - h / 3} 32 ${54 - h / 4} Q57 ${56 - h / 4} 54 76" fill="#6d9559"/><path d="M54 65 Q76 ${44 - h / 5} 83 ${50 - h / 5} Q79 71 54 65" fill="#87a66b"/><path d="M55 ${83 - h} Q36 ${64 - h} 45 ${59 - h / 1.4} Q60 ${68 - h} 55 ${83 - h}" fill="#52794d"/>${p.crop === "flower" ? `<g fill="${c.color}"><circle cx="56" cy="${88 - h}" r="12"/><circle cx="44" cy="${80 - h}" r="9"/><circle cx="67" cy="${79 - h}" r="9"/></g><circle cx="55" cy="${80 - h}" r="5" fill="#735d30"/>` : p.crop === "basil" ? "" : `<circle cx="43" cy="${p.crop === "radish" ? 83 : 70 - h / 3}" r="${6 + stage * 7}" fill="${c.color}"/><circle cx="66" cy="${p.crop === "radish" ? 85 : 80 - h / 3}" r="${4 + stage * 6}" fill="${c.color}"/>`}<path d="M31 85h48l-5 20H36z" fill="#bd8366"/><path d="M28 82h54v7H28z" fill="#d39b7c"/><path d="M38 90l2 11" stroke="#e0b299" stroke-width="3" opacity=".8"/></svg>`;
}
function render() {
  const focused = document.activeElement;
  const focusKey = focused?.dataset?.crop
    ? `[data-crop="${focused.dataset.crop}"]`
    : focused?.dataset?.plot
      ? `[data-plot="${focused.dataset.plot}"]`
      : focused?.dataset?.action
        ? `[data-action="${focused.dataset.action}"]`
        : null;
  $("#dayLabel").textContent = String(game.day).padStart(2, "0") + " / 20";
  $("#scenarioLabel").textContent = SCENARIOS[game.scenario].name;
  $("#money").textContent = "¥ " + game.money;
  $("#water").textContent = game.water + " L";
  $("#harvests").textContent = game.harvests + " 盆";
  const w = WEATHER[weatherAt(game, game.day)];
  $("#weather").textContent = w.icon + " " + w.name;
  $("#seeds").innerHTML = Object.entries(CROPS)
    .map(
      ([key, c]) =>
        `<button class="seed ${chosen === key ? "active" : ""}" data-crop="${key}" aria-pressed="${chosen === key}"><span class="seed-icon" style="--crop:${c.color}">${key === "flower" ? "✿" : key === "basil" ? "❧" : "●"}</span><span><b>${c.name}</b><small>${c.days} 生长日 · ${c.space} 格 · 售 ¥${c.value}<br>光照 ${c.light} / 耗水 ${c.water}</small></span><strong>¥${c.cost}</strong></button>`,
    )
    .join("");
  $("#garden").innerHTML = game.plots
    .map((p, i) => {
      if (p?.reserved !== undefined)
        return `<button class="plot reserved ${selected === p.reserved ? "selected" : ""}" data-plot="${p.reserved}" aria-label="${i + 1} 号格，番茄延伸空间"><span class="plot-no">${String(i + 1).padStart(2, "0")}</span><span class="roots">⌁</span><small>番茄的生长空间</small></button>`;
      return `<button class="plot ${selected === i ? "selected" : ""} ${i % 4 === 0 ? "shade" : ""} ${p && p.age >= CROPS[p.crop].days ? "ripe" : ""}" data-plot="${i}" aria-label="${i + 1} 号格，${p ? CROPS[p.crop].name + "，健康 " + p.health + "，生长 " + p.age + " 天" : "空格，点击种植"}"><span class="plot-no">${String(i + 1).padStart(2, "0")}</span><span class="light">${"·".repeat(lightAt(game, i)) || "阴"}</span>${p ? plantSVG(p) : '<span class="empty-plus">＋</span><small>留一点生长空间</small>'}${p ? `<span class="plant-label">${CROPS[p.crop].name}${p.age >= CROPS[p.crop].days ? " · 可收获" : ""}</span><span class="mini-meter"><i style="width:${(100 * p.age) / CROPS[p.crop].days}%"></i></span><span class="plant-details">水 ${p.moisture}/4 <span style="color:${p.health < 2 ? "#b45140" : "inherit"}">♥ ${p.health}/3</span></span>` : ""}</button>`;
    })
    .join("");
  const p = game.plots[selected];
  $("#selected").innerHTML =
    p && p.reserved === undefined
      ? `<div><b>${selected + 1} 号 · ${CROPS[p.crop].name}</b><small>生长 ${p.age}/${CROPS[p.crop].days} · 健康 ${p.health}/3 · 水分 ${p.moisture}/4${p.bonus ? " · 加成 ¥" + p.bonus : ""}</small></div><div class="care"><button data-action="water" ${game.over ? "disabled" : ""}>浇水 · 1L</button><button data-action="harvest" ${p.age < CROPS[p.crop].days || game.over ? "disabled" : ""}>收获</button><button data-action="clear" ${game.over ? "disabled" : ""} aria-label="移除当前植物，无退款">移除</button></div>`
      : `<div><b>手里有一包${CROPS[chosen].name}</b><small>点击空格即可种下。${CROPS[chosen].space === 2 ? "番茄右侧也需要一个空格。" : "晴天优先种植，可避免连续缺光。"}</small></div>`;
  $("#forecast").innerHTML = Array.from(
    { length: Math.min(3, 21 - game.day) },
    (_, n) => {
      const d = game.day + n;
      const w = WEATHER[weatherAt(game, d)];
      return `<div><small>${n === 0 ? "今日" : `第 ${d} 天`}</small><b>${w.icon}</b><span>${w.name}</span><small>${w.rain ? "盆土 +2 / 储水 +3L" : "向阳光照 " + w.sun}</small></div>`;
    },
  ).join("");
  $("#logs").innerHTML = game.logs.map((t) => `<p>${t}</p>`).join("");
  $("#next").disabled = game.over;
  $("#next").innerHTML = game.over
    ? "本季已结束"
    : game.day === 20
      ? "结束这一季 <span>→</span>"
      : "结束今日，迎接明天 <span>→</span>";
  $("#buyWater").disabled = game.over;
  if (focusKey) $(focusKey)?.focus({ preventScroll: true });
}
function dispatch(action) {
  const r = act(game, action);
  game = r.state;
  $("#toast").textContent = r.message;
  render();
  if (game.over && action.type === "next") {
    $("#summary").innerHTML =
      `<div class="score">${score(game)}<small>阳台印记分</small></div><p>收获 ${game.harvests} 盆 · 收入 ¥${game.revenue}<br>余款 ¥${game.money} · 伴生 ${game.companionDays} 天 · 枯萎 ${game.dead} 盆</p><p class="muted">分数 = 余款 + 收获 × 5 + 伴生天数 × 2 − 枯萎 × 3。<br>不是越忙越好，留下空间也有价值。</p>`;
    $("#ending").showModal();
  }
}
$("#seeds").addEventListener("click", (e) => {
  const b = e.target.closest("[data-crop]");
  if (b) {
    chosen = b.dataset.crop;
    render();
  }
});
$("#garden").addEventListener("click", (e) => {
  const b = e.target.closest("[data-plot]");
  if (!b) return;
  selected = Number(b.dataset.plot);
  if (!game.plots[selected])
    dispatch({ type: "plant", index: selected, crop: chosen });
  else render();
});
$("#selected").addEventListener("click", (e) => {
  const b = e.target.closest("[data-action]");
  if (b) dispatch({ type: b.dataset.action, index: selected });
});
$("#next").onclick = () => dispatch({ type: "next" });
$("#buyWater").onclick = () => dispatch({ type: "buyWater" });
$("#scenario").onchange = () => {
  $("#seed").value = SCENARIOS[$("#scenario").value].seed;
};
$("#restart").onclick = () => {
  if (
    game.logs.length > 1 &&
    !game.over &&
    !confirm("开启新一季会清空当前阳台，确定吗？")
  )
    return;
  game = createGame(
    $("#scenario").value,
    Math.max(0, Math.min(999999, Number($("#seed").value) || 0)),
  );
  selected = 1;
  $("#toast").textContent = "新的季节已开启。";
  render();
};
$("#closeSummary").onclick = () => $("#ending").close();
render();
