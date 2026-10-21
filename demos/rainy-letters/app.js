import {
  witnesses,
  clues,
  claims,
  choices,
  createState,
  hear,
  investigate,
  link,
  submit,
  conclude,
  contradictions,
  contradictionStatus,
  resolvedCount,
} from "./engine.js";
let state = createState(),
  currentTab = "investigate",
  timer;
const $ = (id) => document.getElementById(id);
function notify(text) {
  $("toast").textContent = text;
  $("toast").classList.add("visible");
  clearTimeout(timer);
  timer = setTimeout(() => $("toast").classList.remove("visible"), 4500);
}
function showDialog(id) {
  $(id).showModal();
}
function tab(name) {
  currentTab = name;
  document.querySelectorAll("[data-tab]").forEach((b) => {
    b.classList.toggle("active", b.dataset.tab === name);
    if (b.dataset.tab === name) b.setAttribute("aria-current", "page");
    else b.removeAttribute("aria-current");
  });
  document
    .querySelectorAll(".panel")
    .forEach((p) => (p.hidden = p.id !== name));
}
function render() {
  $("budget").textContent = `${state.budget} / 6 次机会`;
  $("heard").textContent = `${state.heard.length} / 5 人`;
  $("linked").textContent = `${state.links.length} 条连线`;
  $("boardCount").textContent = state.visited.length;
  $("witnesses").innerHTML = witnesses
    .map(
      (w) =>
        `<button class="witness ${state.heard.includes(w.id) ? "visited" : ""}" data-witness="${w.id}"><span class="avatar">${w.mark}</span><span class="person-name">${w.name}</span><span class="role">${w.role}</span><span class="read-state">${state.heard.includes(w.id) ? "已听取 · 复看" : "听取证词 ↗"}</span></button>`,
    )
    .join("");
  $("clues").innerHTML = clues
    .map(
      (c, i) =>
        `<button class="clue ${state.visited.includes(c.id) ? "visited" : ""}" data-clue="${c.id}" ${!state.visited.includes(c.id) && (state.budget === 0 || state.ending) ? "disabled" : ""}><span class="clue-top"><span>${c.place}</span><span>${state.visited.includes(c.id) ? "已收录 ✓" : "调查 −1"}</span></span><span class="clue-symbol" aria-hidden="true">${c.icon}</span><strong>${c.title}</strong><span class="teaser">${c.teaser}</span><span class="clue-number">0${i + 1}</span></button>`,
    )
    .join("");
  $("boardCards").innerHTML = state.visited.length
    ? state.visited
        .map((id) => {
          const c = clues.find((c) => c.id === id);
          return `<article class="evidence-card"><div class="evidence-text"><span class="eyebrow">${c.place} / 已调查</span><h3>${c.title}</h3><p>${c.text}</p></div><fieldset ${state.ending ? "disabled" : ""}><legend>这份证据直接支持……</legend>${claims.map((k) => `<label><input type="checkbox" data-link="${c.id}:${k.id}" ${state.links.includes(`${c.id}:${k.id}`) ? "checked" : ""}><span>${k.title}</span></label>`).join("")}</fieldset></article>`;
        })
        .join("")
    : '<div class="empty"><span>空白，也是开始。</span><p>先去走访与搜证，带回第一份线索。</p><button data-goto="investigate">返回调查 →</button></div>';
  $("answers").innerHTML = Object.entries(choices)
    .map(
      ([key, opts], i) =>
        `<fieldset class="answer-group" ${state.ending ? "disabled" : ""}><legend><span>0${i + 1}</span> ${["谁移走了封套？", "在什么时间？", "真正的动机是什么？"][i]}</legend>${opts.map(([value, label]) => `<label class="answer ${state.answers[key] === value ? "selected" : ""}"><input type="radio" name="${key}" value="${value}" ${state.answers[key] === value ? "checked" : ""}>${label}</label>`).join("")}</fieldset>`,
    )
    .join("");
  renderContradictions();
  $("submit").disabled = !!state.ending;
}
function showAssessment(result) {
  if (!result.ok) {
    notify(result.message);
    return;
  }
  const labels = { who: "人物", when: "时间", why: "动机" };
  let html = '<div class="review"><h3>调查复核</h3>';
  for (const k of ["who", "when", "why"]) {
    html += `<p class="${result.factual[k] && result.evidence[k] ? "pass" : "gap"}">${result.factual[k] && result.evidence[k] ? "✓" : "○"} ${labels[k]}：${!result.factual[k] ? "结论与现有可靠记录冲突，请重新比较。" : !result.evidence[k] ? "结论吻合，但证据桌上缺少直接支持。" : "结论吻合，证据链成立。"}</p>`;
  }
  if (result.unsupported.length) {
    html +=
      '<p class="gap">以下连线缺少直接依据，请回证据桌取消：</p><ul>' +
      result.unsupported
        .map((key) => {
          let [c, k] = key.split(":");
          return `<li>${clues.find((x) => x.id === c).title} → ${claims.find((x) => x.id === k).title}</li>`;
        })
        .join("") +
      "</ul>";
  }
  html += `<p class="${resolvedCount(state) >= 2 ? "pass" : "gap"}">${resolvedCount(state) >= 2 ? "✓" : "○"} 证词矛盾：已化解 ${resolvedCount(state)} / 3 组，结案至少需要 2 组。</p>`;
  if (result.ready) {
    html += `<div class="choice-ending"><h3>真相已厘清。现在，选择怎样讲述。</h3><p>${result.preserved ? "你也证明了信仍完好，可以明确保护它的去向。" : "你尚未证明信的现状。你可以继续搜证，或在不确定中作出决定。"}</p><button data-end="private" class="primary">尊重私人告别</button><button data-end="public">把完整案情交给晚报</button><p class="small">这只是故事中的选择，不会向外发送任何内容。</p></div>`;
  } else html += '<button data-goto="board">返回证据桌 →</button>';
  html += "</div>";
  $("assessment").innerHTML = html;
}
function end(decision) {
  const ending = conclude(state, decision);
  if (!ending) return;
  const endings = {
    shelter: [
      "一封信的避雨处",
      "你向书房说明了真实时间，也纠正了对林岚的怀疑，却没有公开母亲的告别。回声书铺归还了完好的封套。林岚坐在窗边，终于有了不被催促的时间。",
      "真相被确认，隐私被保留。不是所有被找到的东西，都必须被展示。",
    ],
    pause: [
      "把句号留到明天",
      "你澄清了移走信件的人与缘由，并拒绝让这场告别成为新闻。但信如今是否完好，证据还不够。你没有作出超出证据的保证。雨停后，仍需由林岚亲自确认。",
      "你保护了她的选择，却留下了一个尚未证实的去向。",
    ],
    headline: [
      "明日头条",
      "你把案情交给晚报。周禾未经许可的计划被曝光，林岚也不再被怀疑。然而蓝封套、回声书铺与她的悲伤，都成了人们议论的故事。你讲对了事实，却没能替她守住告别。",
      "公开纠正了一个错误，也让另一个人失去了沉默的权利。",
    ],
  };
  const [title, text, after] = endings[ending];
  $("ending").hidden = false;
  $("ending").innerHTML =
    `<p class="eyebrow">雨停了 / ${ending === "shelter" ? "守护" : ending === "pause" ? "留白" : "公开"}结局</p><h2>${title}</h2><p>${text}</p><blockquote>${after}</blockquote><div class="route">本轮：调查 ${state.visited.length} 处 · 核对 ${state.attempts} 次<br>路线：${state.visited.map((id) => clues.find((c) => c.id === id).title).join(" → ")}</div><button id="replay" class="primary">换一条调查路线 ↺</button><p class="small">另有不同结局：是否证明信仍完好，以及是否公开案情，都会改变最后一页。</p>`;
  render();
  $("assessment").innerHTML = "";
  $("ending").scrollIntoView({ behavior: "smooth", block: "start" });
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.tab) {
    tab(b.dataset.tab);
    return;
  }
  if (b.dataset.goto) {
    tab(b.dataset.goto);
    document.querySelector(".tabs").scrollIntoView({ behavior: "smooth" });
    return;
  }
  if (b.dataset.witness) {
    const w = witnesses.find((w) => w.id === b.dataset.witness);
    hear(state, w.id);
    render();
    $("detailContent").innerHTML =
      `<p class="eyebrow">证词 / ${w.role}</p><h2>${w.name}</h2><p class="quote">${w.quote}</p><p class="hint">观察：${w.note}</p>`;
    showDialog("detail");
  }
  if (b.dataset.clue) {
    const c = clues.find((c) => c.id === b.dataset.clue),
      r = investigate(state, c.id);
    if (!r.ok) {
      notify(r.message);
      return;
    }
    render();
    $("detailContent").innerHTML =
      `<p class="eyebrow">${c.place} / ${r.revisit ? "复看不消耗机会" : `已消耗 1 次 · 余 ${state.budget} 次`}</p><h2>${c.title}</h2><p class="quote clue-content">${c.text}</p><p class="hint">记在页边：${c.contradicts}</p><p>已加入证据桌。记得为它连接能直接支持的判断。</p>`;
    showDialog("detail");
  }
  if (b.dataset.checkContradiction) {
    const r = contradictionStatus(state, b.dataset.checkContradiction);
    const area = document.querySelector(
      `[data-feedback="${b.dataset.checkContradiction}"]`,
    );
    area.closest(".contradiction-card").querySelector(".contradiction-head > span").textContent =
      r.ready ? "已化解 ✓" : "待解释 ○";
    area.textContent = (r.ready ? "✓ 已化解：" : "○ 尚未化解：") + r.reason;
    area.className = r.ready
      ? "pass contradiction-feedback"
      : "gap contradiction-feedback";
    $("assessment").innerHTML = "";
  }
  if (b.dataset.end) end(b.dataset.end);
  if (b.id === "replay" || b.id === "restart") showDialog("confirm");
});
document.addEventListener("change", (e) => {
  if (e.target.dataset.resolution) {
    const id = e.target.dataset.resolution;
    state.resolutions[id] ??= { answer: "", evidence: [] };
    state.resolutions[id].answer = e.target.value;
    $("assessment").innerHTML = "";
    const area = document.querySelector(`[data-feedback="${id}"]`);
    area.textContent = "解释已改变，请重新核对。";
    area.className = "contradiction-feedback";
    area.closest(".contradiction-card").querySelector(".contradiction-head > span").textContent = "待核对 ○";
    return;
  }
  if (e.target.dataset.pair) {
    const id = e.target.dataset.pair;
    state.resolutions[id] ??= { answer: "", evidence: [] };
    const r = state.resolutions[id];
    r.evidence = e.target.checked
      ? [...r.evidence, e.target.value]
      : r.evidence.filter((v) => v !== e.target.value);
    $("assessment").innerHTML = "";
    const area = document.querySelector(`[data-feedback="${id}"]`);
    area.textContent = "证据配对已改变，请重新核对。";
    area.className = "contradiction-feedback";
    area.closest(".contradiction-card").querySelector(".contradiction-head > span").textContent = "待核对 ○";
    return;
  }
  if (e.target.dataset.link) {
    const [c, k] = e.target.dataset.link.split(":");
    link(state, c, k);
    $("linked").textContent = `${state.links.length} 条连线`;
    $("assessment").innerHTML = "";
    notify(
      e.target.checked ? "已添加连线。结案核对会检验依据。" : "已取消连线。",
    );
  }
  if (e.target.type === "radio") {
    state.answers[e.target.name] = e.target.value;
    $("assessment").innerHTML = "";
    document
      .querySelectorAll(`input[name="${e.target.name}"]`)
      .forEach((input) =>
        input.closest("label").classList.toggle("selected", input.checked),
      );
  }
});
$("submit").onclick = () => showAssessment(submit(state));
$("guideButton").onclick = () => showDialog("guide");
document
  .querySelectorAll(".close,.close-bottom")
  .forEach((b) => (b.onclick = () => b.closest("dialog").close()));
$("cancelReset").onclick = () => $("confirm").close();
$("confirmReset").onclick = () => {
  state = createState();
  $("confirm").close();
  $("ending").hidden = true;
  $("assessment").innerHTML = "";
  tab("investigate");
  render();
  notify("雨夜重新开始。你有 6 次新的调查机会。");
  document.querySelector(".tabs").scrollIntoView({ behavior: "smooth" });
};
render();

function renderContradictions() {
  $("contradictions").innerHTML = contradictions
    .map((c) => {
      const r = state.resolutions[c.id] || { answer: "", evidence: [] },
        ready = contradictionStatus(state, c.id).ready;
      return `<article class="contradiction-card"><div class="contradiction-head"><h3>${c.title}</h3><span>${ready ? "已化解 ✓" : "待解释 ○"}</span></div><p>${c.statement}</p><div class="compare-witnesses">${c.people
        .map((id) => {
          const w = witnesses.find((w) => w.id === id);
          return `<div><button data-witness="${id}">${w.name} · ${state.heard.includes(id) ? "复听证词" : "听取原话 ↗"}</button><p>${state.heard.includes(id) ? w.quote : "尚未听取。先确认这个人究竟说了什么。"}</p></div>`;
        })
        .join(
          "",
        )}</div><fieldset ${state.ending ? "disabled" : ""}><legend>选择因果解释</legend>${c.options.map(([v, text]) => `<label><input type="radio" name="resolve-${c.id}" data-resolution="${c.id}" value="${v}" ${r.answer === v ? "checked" : ""}><span>${text}</span></label>`).join("")}</fieldset><fieldset ${state.ending ? "disabled" : ""}><legend>配对直接解释这组矛盾的材料（可多选，勿混入无关材料）</legend>${state.visited.map((id) => `<label class="pair-choice"><input type="checkbox" data-pair="${c.id}" value="${id}" ${r.evidence.includes(id) ? "checked" : ""}>${clues.find((c) => c.id === id).title}</label>`).join("") || "<p>请先调查线索。</p>"}</fieldset><button data-check-contradiction="${c.id}">核对这组解释 →</button><p data-feedback="${c.id}" class="contradiction-feedback ${ready ? "pass" : ""}" aria-live="polite">${ready ? "✓ " + c.explanation : ""}</p></article>`;
    })
    .join("");
}
