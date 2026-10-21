import {
  STATIONS,
  ROUTES,
  LEVELS,
  seededLevel,
  defaultPlan,
  createSimulation,
  step,
  score,
} from "./engine.js";
const $ = (s) => document.querySelector(s);
let level = LEVELS[0],
  plans = [defaultPlan("east"), defaultPlan("south")],
  state = createSimulation(level, plans),
  timer = null,
  recorded = false,
  records = [],
  log = [];
const fmt = (t) =>
  `${23 + Math.floor((40 + t) / 60)}:${String((40 + t) % 60).padStart(2, "0")}`.replace(
    /^24:/,
    "00:",
  );
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
function stop() {
  clearInterval(timer);
  timer = null;
  $("#play").textContent = "▶ 自动演练";
}
function reset() {
  stop();
  state = createSimulation(level, plans);
  recorded = false;
  log = [];
  render();
}
function choose(index) {
  level =
    index === 3 ? seededLevel(Number($("#seed").value) || 0) : LEVELS[index];
  plans = [defaultPlan("east"), defaultPlan("south")];
  reset();
  renderPlans();
  renderLevel();
}
function renderLevel() {
  document
    .querySelectorAll("#levels button")
    .forEach((b, i) =>
      b.classList.toggle(
        "active",
        level.id === LEVELS[i]?.id || (i === 3 && level.id.startsWith("seed")),
      ),
    );
  $("#level-title").textContent = level.name;
  $("#subtitle").textContent = level.subtitle;
  $("#brief").textContent = level.brief;
  $("#seed-controls").hidden = !level.id.startsWith("seed");
  $("#example").hidden = !level.example;
  $("#limits").innerHTML =
    `<span>${level.budget} 列可用</span><span>每列 ${level.capacity} 座</span><span>${level.horizon} 分钟夜班</span>`;
  renderHistory();
}
function renderPlans() {
  const host = $("#plans");
  host.innerHTML = "";
  plans.forEach((p, i) => {
    const r = ROUTES[p.route],
      card = document.createElement("div");
    card.className = "train-card";
    card.dataset.index = i;
    card.innerHTML = `<div class="train-top"><span class="train-number ${r.line}">${String(i + 1).padStart(2, "0")}</span><select aria-label="${i + 1} 号车线路">${Object.entries(
      ROUTES,
    )
      .map(
        ([k, v]) =>
          `<option value="${k}" ${k === p.route ? "selected" : ""}>${v.name}</option>`,
      )
      .join(
        "",
      )}</select><button class="quiet remove" aria-label="删除 ${i + 1} 号车">×</button></div><div class="train-fields"><label>发车：23:40 后几分钟<input class="departure" type="number" min="0" max="${level.horizon - 1}" value="${p.departure}" aria-label="${i + 1} 号车发车分钟"></label><label>星桥额外候车（分）<input class="hold" type="number" min="0" max="5" value="${p.hold || 0}" ${p.stops.includes("C") ? "" : "disabled"} aria-label="${i + 1} 号车星桥候车分钟"></label></div><div class="stops" aria-label="停靠站">${r.path.map((s, j) => `<button data-station="${s}" aria-pressed="${p.stops.includes(s)}" class="${r.line} ${p.stops.includes(s) ? "selected" : ""}" ${j === 0 || j === r.path.length - 1 ? "disabled" : ""}>${STATIONS[s].name}</button>`).join("")}</div>`;
    card.querySelector("select").onchange = (e) => {
      plans[i] = {
        ...defaultPlan(e.target.value, p.departure),
        hold: p.hold || 0,
      };
      edit();
    };
    card.querySelector(".remove").onclick = () => {
      plans.splice(i, 1);
      edit();
    };
    for (const [field, max] of [
      ["departure", level.horizon - 1],
      ["hold", 5],
    ])
      card.querySelector("." + field).onchange = (e) => {
        p[field] = Math.max(
          0,
          Math.min(max, Math.round(Number(e.target.value) || 0)),
        );
        edit();
      };
    card.querySelectorAll("[data-station]").forEach(
      (b) =>
        (b.onclick = () => {
          const s = b.dataset.station;
          p.stops = p.stops.includes(s)
            ? p.stops.filter((x) => x !== s)
            : [...p.stops, s];
          edit();
        }),
    );
    host.append(card);
  });
  $("#fleet-count").textContent = `${plans.length} / ${level.budget}`;
  $("#add").disabled = plans.length >= level.budget;
}
function edit() {
  const active = document.activeElement;
  const card = active?.closest(".train-card");
  const focus = card
    ? {
        index: card.dataset.index,
        selector: active.matches("select")
          ? "select"
          : active.classList.contains("departure")
            ? ".departure"
            : active.classList.contains("hold")
              ? ".hold"
              : active.dataset.station
                ? '[data-station="' + active.dataset.station + '"]'
                : null,
      }
    : null;
  const had = state.time >= 0;
  reset();
  renderPlans();
  if (focus?.selector)
    $('#plans .train-card[data-index="' + focus.index + '"]')
      ?.querySelector(focus.selector)
      ?.focus();
  $("#edit-note").textContent = had
    ? "计划已修改，演练已回到 23:40。"
    : "所有调整会从 23:40 重新演练。";
}
function drawMap() {
  const s = state;
  let svg = `<svg viewBox="0 0 700 555" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><pattern id="grid" width="35" height="35" patternUnits="userSpaceOnUse"><path d="M35 0H0V35" fill="none" stroke="#38515a" stroke-width=".5" opacity=".25"/></pattern></defs><rect width="700" height="555" fill="url(#grid)"/><path d="M0 440C160 350 210 470 270 390S440 320 700 100" fill="none" stroke="#1d3945" stroke-width="52"/><path d="M0 440C160 350 210 470 270 390S440 320 700 100" fill="none" stroke="#264653" stroke-width="1" stroke-dasharray="3 8"/><text x="55" y="470" fill="#486670" font-size="11" letter-spacing="6" transform="rotate(-12 55 470)">眠 河 / MIAN RIVER</text><text x="45" y="55" class="map-sub">N ↑</text><text x="535" y="505" class="map-sub">NO. 07 / NIGHT NETWORK</text><path d="M70 230H630" fill="none" stroke="#79bdde" stroke-width="5"/><path d="M350 75V500" fill="none" stroke="#eea878" stroke-width="5"/>`;
  for (const [id, p] of Object.entries(STATIONS)) {
    const count = s.passengers.filter(
      (x) =>
        x.status === "waiting" &&
        x.station === id &&
        x.ready <= Math.max(0, s.time),
    ).length;
    const transfer = s.passengers.filter(
      (x) =>
        x.status === "waiting" &&
        x.station === id &&
        x.leg > 0 &&
        x.ready > s.time,
    ).length;
    svg += `<g><circle cx="${p.x}" cy="${p.y}" r="${id === "C" ? 11 : 7}" fill="#14232a" stroke="${id === "C" ? "#d5ef82" : "#d5e4e4"}" stroke-width="3"/><text x="${p.x + (id === "F" || id === "G" || id === "H" ? 22 : 0)}" y="${p.y + (id === "F" || id === "G" || id === "H" ? 4 : 30)}" text-anchor="${id === "F" || id === "G" || id === "H" ? "start" : "middle"}" class="map-label">${p.name}</text>${count || transfer ? `<rect x="${p.x - 18}" y="${p.y - 42}" width="36" height="23" rx="11" fill="${count ? "#d5ef82" : "#4a626c"}"/><text x="${p.x}" y="${p.y - 26}" text-anchor="middle" fill="#13251f" font-size="12" font-weight="700">${count}${transfer ? "+" : ""}</text>` : ""}</g>`;
  }
  for (const tr of s.trains) {
    if (tr.status === "idle" || tr.status === "finished") continue;
    const a = STATIONS[tr.station],
      b = tr.moving ? STATIONS[tr.moving.to] : a;
    const x = (a.x + b.x) / 2,
      y = (a.y + b.y) / 2;
    const offset = tr.moving ? 0 : (tr.id - 2.5) * 14;
    svg += `<g class="train-marker" transform="translate(${x + offset} ${y - 11})"><rect x="-19" y="-10" width="38" height="20" rx="4" fill="${ROUTES[tr.route].line === "blue" ? "#79bdde" : "#eea878"}" stroke="#0f1b20" stroke-width="2"/><text x="0" y="4" text-anchor="middle" font-size="10" fill="#0b1c23">${tr.id}·${tr.load.length}</text></g>`;
  }
  svg += "</svg>";
  $("#map").innerHTML = svg;
  $("#map").setAttribute(
    "aria-label",
    `线路图。${Object.entries(STATIONS)
      .map(
        ([id, p]) =>
          `${p.name}候车${s.passengers.filter((x) => x.status === "waiting" && x.station === id && x.ready <= Math.max(0, s.time)).length}人`,
      )
      .join("，")}`,
  );
}
function render() {
  const v = score(state);
  $("#clock").textContent = fmt(Math.max(0, state.time));
  $("#phase").textContent = state.done
    ? "夜班结束"
    : state.time < 0
      ? "待命 · 规划中"
      : `第 ${state.time} / ${level.horizon} 分钟`;
  $("#progress i").style.width =
    `${(Math.max(0, state.time) / level.horizon) * 100}%`;
  $("#metrics").innerHTML = [
    ["准点抵达", `${v.ontime}/${v.total}`],
    ["仍在候车", v.waiting],
    ["车上乘客", v.onboard],
    ["累计让行 / 分", v.delay],
  ]
    .map(
      ([k, n]) =>
        `<div class="metric"><strong>${n}</strong><span>${k}</span></div>`,
    )
    .join("");
  $("#demand-list").innerHTML = level.demands
    .map((g, i) => {
      const people = state.passengers.filter((p) => p.group === i),
        ok = people.filter(
          (p) => p.arrival !== null && p.arrival <= p.deadline,
        ).length,
        late = people.filter(
          (p) => p.arrival !== null && p.arrival > p.deadline,
        ).length,
        board = people.filter((p) => p.status === "onboard").length;
      return `<div class="demand"><div><strong>${STATIONS[g.from].name} → ${STATIONS[g.to].name}</strong><small>${g.count} 人 · ${people[0].legs.length > 1 ? "星桥换乘" : "无需换乘"}</small></div><div><small>${fmt(g.ready)} 开始候车</small><small>${fmt(g.deadline)} 前抵达</small></div><div class="status">${ok ? `准点 ${ok}` : ""}${late ? ` 迟到 ${late}` : ""}${!ok && !late ? (board ? `车上 ${board} 人` : "等待接车") : ""}<div class="mini-bar"><i style="width:${(ok / g.count) * 100}%"></i><b style="width:${(late / g.count) * 100}%"></b></div></div></div>`;
    })
    .join("");
  $("#events").innerHTML = log.length
    ? log
        .slice(-30)
        .reverse()
        .map(
          (e) =>
            `<div class="event ${e.type}"><time>${fmt(e.time)}</time>${esc(e.text)}</div>`,
        )
        .join("")
    : '<p class="empty">无线电静候你的第一条指令。<br>建议先用“前进 1 分钟”观察上车与换乘。</p>';
  $("#step").disabled = state.done;
  $("#play").disabled = state.done;
  $("#finish").disabled = state.done;
  drawMap();
  if (state.done && !recorded) {
    recorded = true;
    records.unshift({
      level: level.id,
      plans: structuredClone(plans),
      ...v,
      number: records.filter((r) => r.level === level.id).length + 1,
    });
    renderHistory();
  } else if (!state.done)
    $("#result").textContent =
      "完成一次夜班，就能留下成绩与计划。修改时刻、停站与候车时长，比较不同方案。";
}
function advance() {
  state = step(state);
  log.push(...state.events);
  if (state.done) stop();
  render();
}
function renderHistory() {
  const rs = records.filter((r) => r.level === level.id);
  $("#history").innerHTML = rs
    .map(
      (r, i) =>
        `<div class="history-item"><span>方案 ${r.number} ${i === 0 ? "· 最近一次" : ""}</span><strong>${r.points} <small>分</small></strong><span>准点 ${r.ontime}/${r.total} · 迟到 ${r.late} · 让行 ${r.delay}</span><button data-record="${records.indexOf(r)}">恢复此计划</button></div>`,
    )
    .join("");
  $("#history")
    .querySelectorAll("button")
    .forEach(
      (b) =>
        (b.onclick = () => {
          plans = structuredClone(records[Number(b.dataset.record)].plans);
          edit();
        }),
    );
  if (state.done) {
    const v = score(state);
    $("#result").textContent =
      v.ontime === v.total
        ? `全员准点。你把 ${v.total} 个人送回了今晚的目的地。得分 ${v.points}。试试更少让行，或者自己重排一套时刻表。`
        : `${v.ontime} 人准点，${v.late} 人迟到，${v.waiting + v.onboard} 人未送达。得分 ${v.points}。看看换乘是否差了一分钟，或是哪一段座位不够。`;
  }
}
$("#levels").innerHTML = [...LEVELS.map((l) => l.name), "04 / 种子夜班"]
  .map((t, i) => `<button data-index="${i}">${t}</button>`)
  .join("");
$("#levels")
  .querySelectorAll("button")
  .forEach((b) => (b.onclick = () => choose(Number(b.dataset.index))));
$("#reset").onclick = reset;
$("#step").onclick = () => {
  stop();
  advance();
};
$("#play").onclick = () => {
  if (timer) {
    stop();
    return;
  }
  $("#play").textContent = "Ⅱ 暂停演练";
  advance();
  if (!state.done) timer = setInterval(advance, 650);
};
$("#finish").onclick = () => {
  stop();
  while (!state.done) {
    state = step(state);
    log.push(...state.events);
  }
  render();
};
$("#add").onclick = () => {
  if (plans.length < level.budget) {
    plans.push(defaultPlan(plans.length % 2 ? "south" : "east"));
    edit();
  }
};
$("#example").onclick = () => {
  plans = structuredClone(level.example);
  edit();
};
$("#generate").onclick = () => choose(3);
$("#help").onclick = () => $("#manual").showModal();
$("#close-help").onclick = () => $("#manual").close();
$("#manual").onclick = (e) => {
  if (e.target === $("#manual")) $("#manual").close();
};
$("#clear-history").onclick = () => {
  records = records.filter((r) => r.level !== level.id);
  renderHistory();
};
renderLevel();
renderPlans();
render();
