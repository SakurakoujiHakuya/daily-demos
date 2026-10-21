export const witnesses = [
  {
    id: "lin",
    name: "林岚",
    role: "修书人 · 寄信人的女儿",
    mark: "林",
    quote: "「停电后我才进书房。我拿走的是一只蓝封套，不是一封信。」",
    note: "她反复说“封套”，却没解释里面装了什么。",
  },
  {
    id: "gu",
    name: "顾叔",
    role: "夜班门房",
    mark: "顾",
    quote: "「走廊钟指着九点二十，我看见林岚从书房出来。那时楼里已经亮了。」",
    note: "他只看过走廊钟，没有核对手表。",
  },
  {
    id: "qiao",
    name: "乔予",
    role: "旧报编辑",
    mark: "乔",
    quote: "「九点整，信还在桌上。要是今晚不登出来，明日拍卖就没了新闻。」",
    note: "他想发表这封信，承认曾提出购买。",
  },
  {
    id: "shen",
    name: "沈絮",
    role: "街对面的电车司机",
    mark: "沈",
    quote: "「末班车到站时，林岚已经站在回声书铺门口。我按的是调度台的时间。」",
    note: "回声书铺距书房约两分钟步行。",
  },
  {
    id: "zhou",
    name: "周禾",
    role: "书房主人",
    mark: "周",
    quote: "「我以为她母亲希望把信公开。今天才发现，借展单最后一页不见了。」",
    note: "展览借件来自林岚家，并不归书房所有。",
  },
];
export const claims = [
  { id: "carrier", title: "拿走封套的人是林岚", dimension: "who" },
  { id: "clock", title: "走廊钟比标准时间快十分钟", dimension: "when" },
  { id: "time", title: "封套在 21:10 被移出书房", dimension: "when" },
  { id: "consent", title: "移走是为阻止未经同意的公开", dimension: "why" },
  { id: "intact", title: "信仍完好，留在回声书铺", dimension: "where" },
];
export const clues = [
  {
    id: "ledger",
    title: "门房出入簿",
    place: "门厅",
    icon: "簿",
    teaser: "雨水只浸湿了左边一列。",
    text: "顾叔记录：“林岚，蓝封套，离室 21:20（走廊钟）。”另一行写着：“乔予 21:00 离开，未再返回。”他确认蓝封套夹在林岚的修书工具袋外侧。",
    supports: ["carrier"],
    contradicts: "林岚并非只路过书房；封套确实随她离开。",
  },
  {
    id: "clock",
    title: "校钟便条",
    place: "走廊",
    icon: "钟",
    teaser: "钟背后夹着一张维修纸。",
    text: "当天 20:00，维修师以广播报时核对：走廊钟显示 20:10。便条注明“发条故障，快十分钟，未修”。这只机械钟没有因停电停走。",
    supports: ["clock"],
    contradicts: "“走廊钟 21:20”不能直接当作真实时间。",
  },
  {
    id: "tram",
    title: "末班车调度条",
    place: "电车站",
    icon: "轨",
    teaser: "一条准确到分钟的到站记录。",
    text: "调度记录：末班车 21:12 到站。沈絮确认，此刻林岚已在书铺门口，手中抱着蓝封套。从书房唯一开放的门步行至书铺，恰需两分钟；沿途店员见她一直步行，未停留。",
    supports: ["carrier", "time"],
    contradicts: "林岚不可能在真实时间 21:20 才离开书房。",
  },
  {
    id: "power",
    title: "供电检修单",
    place: "后院",
    icon: "电",
    teaser: "停电不是整夜，只持续五分钟。",
    text: "停电从 21:05 持续到 21:10。应急门记录显示，来电瞬间林岚提着蓝封套离开书房。这套记录与供电所标准时同步。",
    supports: ["carrier", "time"],
    contradicts: "林岚说“停电后才进书房”，指停电发生后，不是恢复供电后。",
  },
  {
    id: "loan",
    title: "借展单末页",
    place: "废纸篓",
    icon: "约",
    teaser: "纸张被折起来，并未撕碎。",
    text: "林母签字的借展条款：“仅展封套，不展私人信件；未经林岚同意，不得刊印或转售。”周禾在背面写着“原件明日交拍卖行”，没有林岚的授权。",
    supports: ["consent"],
    contradicts: "书房主人并未获得公开或出售的许可。",
  },
  {
    id: "proof",
    title: "晚报校样",
    place: "印刷台",
    icon: "版",
    teaser: "标题已经排好，正文仍是空白。",
    text: "校样夹着林岚 20:50 留下的便笺：“我没有同意刊登。今晚我会先取回借件，放到回声书铺。请尊重母亲，也给我一次自己读完它的机会。”乔予批注：“刊发等原件。”",
    supports: ["consent"],
    contradicts: "移走信件不是为了售卖，而是拒绝未经同意的刊印。",
  },
  {
    id: "receipt",
    title: "书铺寄存回执",
    place: "书铺",
    icon: "存",
    teaser: "封口上的蜡印依然完整。",
    text: "回声书铺 21:12 签收：林岚寄存蓝封套一件，封口及内页完整。备注：“暂不转交编辑；由本人领取。”店主当面展示封套，但不允许拆阅。",
    supports: ["carrier", "intact"],
    contradicts: "没有证据表明信被毁掉，也不是编辑拿去付印。",
  },
  {
    id: "letter",
    title: "未寄出的短笺",
    place: "修书台",
    icon: "笺",
    teaser: "这不是失踪的信，而是女儿的回复。",
    text: "林岚写道：“你留给我的告别，为什么成了别人的标题？我会把它取回，等我能读的时候再读。回声的柜子很干燥，纸不会坏。”信纸有未干的泪痕。",
    supports: ["consent"],
    contradicts: "保护私人告别与抹去历史，是两回事。",
  },
];
export const choices = {
  who: [
    ["lin", "林岚 · 修书人"],
    ["gu", "顾叔 · 门房"],
    ["qiao", "乔予 · 编辑"],
  ],
  when: [
    ["21:00", "21:00 · 编辑离开时"],
    ["21:10", "21:10 · 恢复供电时"],
    ["21:20", "21:20 · 门房所见钟面"],
  ],
  why: [
    ["consent", "取回私信，阻止未经同意的公开"],
    ["profit", "转卖原件，获取拍卖收益"],
    ["destroy", "销毁原件，掩盖往事"],
  ],
};
export function createState() {
  return {
    budget: 6,
    visited: [],
    heard: [],
    resolutions: {},
    links: [],
    answers: { who: "", when: "", why: "" },
    attempts: 0,
    ending: null,
  };
}
export function hear(s, id) {
  if (!witnesses.some((w) => w.id === id)) return false;
  if (!s.heard.includes(id)) s.heard.push(id);
  return true;
}
export function investigate(s, id) {
  if (s.ending) return { ok: false, message: "这条路线已结案，请重新开始。" };
  if (s.visited.includes(id)) return { ok: true, revisit: true };
  if (!clues.some((c) => c.id === id))
    return { ok: false, message: "找不到这处线索。" };
  if (s.budget <= 0)
    return {
      ok: false,
      message: "调查时间已用尽。仍可整理证据与重建，或开始新路线。",
    };
  s.visited.push(id);
  s.budget--;
  return { ok: true, revisit: false };
}
export function link(s, clue, claim) {
  if (
    s.ending ||
    !s.visited.includes(clue) ||
    !claims.some((c) => c.id === claim)
  )
    return false;
  const key = `${clue}:${claim}`;
  if (s.links.includes(key)) {
    s.links = s.links.filter((x) => x !== key);
    return false;
  }
  s.links.push(key);
  return true;
}
export function supported(s, id) {
  return clues.some(
    (c) =>
      s.visited.includes(c.id) &&
      c.supports.includes(id) &&
      s.links.includes(`${c.id}:${id}`),
  );
}
export function assess(s) {
  const factual = {
    who: s.answers.who === "lin",
    when: s.answers.when === "21:10",
    why: s.answers.why === "consent",
  };
  const evidence = {
    who: supported(s, "carrier"),
    when:
      supported(s, "time") ||
      (supported(s, "clock") &&
        supported(s, "carrier") &&
        s.visited.includes("ledger") &&
        s.links.includes("ledger:carrier")),
    why: supported(s, "consent"),
  };
  return {
    factual,
    evidence,
    ready:
      resolvedCount(s) >= 2 &&
      Object.values(factual).every(Boolean) &&
      Object.values(evidence).every(Boolean) &&
      s.links.every((key) => {
        const [c, k] = key.split(":");
        return clues.find((x) => x.id === c)?.supports.includes(k);
      }),
    preserved: supported(s, "intact"),
    unsupported: s.links.filter((key) => {
      const [c, k] = key.split(":");
      return !clues.find((x) => x.id === c)?.supports.includes(k);
    }),
  };
}
export function submit(s) {
  if (s.ending) return { ok: false, message: "已结案。" };
  if (Object.values(s.answers).some((v) => !v))
    return { ok: false, message: "请先选出人物、时间和动机。" };
  s.attempts++;
  return { ok: true, ...assess(s) };
}
export function conclude(s, decision) {
  if (
    s.attempts === 0 ||
    !assess(s).ready ||
    !["private", "public"].includes(decision) ||
    s.ending
  )
    return false;
  s.ending =
    decision === "public"
      ? "headline"
      : assess(s).preserved
        ? "shelter"
        : "pause";
  return s.ending;
}

export const contradictions = [
  {
    id: "clockcase",
    title: "两种钟，还是两段行程？",
    people: ["gu", "shen"],
    statement: "顾叔看到离开时是 21:20，沈絮却在 21:12 已看到她抵达书铺。",
    options: [
      ["fast", "门房读到的是快十分钟的机械钟；标准时间没有倒流。"],
      ["lie", "司机把其他人错认成林岚，因此到站记录无效。"],
      ["return", "她先到书铺，再折返书房，在 21:20 第二次离开。"],
    ],
    correct: "fast",
    sets: [["ledger", "clock"]],
    explanation:
      "出入簿锁定顾叔使用的钟，校钟便条给出十分钟偏差。两个时间并不互斥。",
  },
  {
    id: "blackout",
    title: "“停电后”的两个意思",
    people: ["lin", "gu"],
    statement:
      "林岚说停电后才进书房；顾叔却在灯已亮时看到她离开。她是否在掩饰进入时间？",
    options: [
      ["after", "“停电后”指恢复供电后，因此至少还有一次未记录的进出。"],
      ["during", "她在断电发生后进入，在恢复供电瞬间离开；“后”不是“恢复后”。"],
      ["stopped", "停电让走廊钟停走，所以所有时间记录都应舍弃。"],
    ],
    correct: "during",
    sets: [["power"]],
    explanation:
      "标准时同步的检修和应急门记录表明，恢复供电与离开同时发生。机械钟也不依赖电力。",
  },
  {
    id: "permission",
    title: "借展，是否等于同意公开？",
    people: ["lin", "zhou"],
    statement:
      "周禾以为母亲希望公开；林岚却坚持只取回封套。究竟是谁改变了约定？",
    options: [
      ["gift", "交给书房就意味着赠与，林岚改变了母亲的决定。"],
      ["sale", "她想绕开书房自己出售，所以拒绝先在晚报发表。"],
      ["scope", "借展只包含封套；书房扩大了授权范围，而女儿明确拒绝公开。"],
    ],
    correct: "scope",
    sets: [
      ["loan", "proof"],
      ["loan", "letter"],
    ],
    explanation:
      "借展末页划定授权范围，女儿的便笺或回复说明她的拒绝。沉默或借展都不等于刊印许可。",
  },
];
export function contradictionStatus(s, id) {
  const c = contradictions.find((c) => c.id === id),
    r = s.resolutions?.[id];
  if (!c || !r) return { ready: false, reason: "尚未选择解释与证据。" };
  if (!c.people.every((id) => s.heard.includes(id)))
    return { ready: false, reason: "需要先听取双方原始证词，不能只凭转述。" };
  if (r.answer !== c.correct)
    return {
      ready: false,
      reason: "因果解释与记录冲突，请比较措辞、钟表来源或授权范围。",
    };
  if (
    !c.sets.some(
      (set) =>
        set.length === r.evidence.length &&
        set.every((id) => r.evidence.includes(id) && s.visited.includes(id)),
    )
  )
    return {
      ready: false,
      reason: "证据配对不完整或混入无关证据。只选择能共同解释这组矛盾的材料。",
    };
  return { ready: true, reason: c.explanation };
}
export function resolvedCount(s) {
  return contradictions.filter((c) => contradictionStatus(s, c.id).ready)
    .length;
}
