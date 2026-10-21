export const CROPS = {
  radish: {
    name: "樱桃萝卜",
    icon: "●",
    cost: 5,
    days: 4,
    value: 12,
    water: 1,
    light: 1,
    space: 1,
    color: "#cc6b66",
  },
  tomato: {
    name: "阳台番茄",
    icon: "●",
    cost: 10,
    days: 5,
    value: 26,
    water: 2,
    light: 2,
    space: 2,
    color: "#d65c3f",
  },
  basil: {
    name: "甜罗勒",
    icon: "✦",
    cost: 6,
    days: 5,
    value: 15,
    water: 1,
    light: 1,
    space: 1,
    color: "#739c4b",
  },
  flower: {
    name: "蜜源花",
    icon: "✿",
    cost: 7,
    days: 5,
    value: 9,
    water: 1,
    light: 2,
    space: 1,
    color: "#d8a53d",
  },
};
export const SCENARIOS = {
  gentle: {
    name: "春日初试",
    money: 38,
    water: 22,
    seed: 17,
    description: "均衡资源，从一盆萝卜开始。",
  },
  dry: {
    name: "盛夏限水",
    money: 46,
    water: 13,
    seed: 42,
    description: "晴天较多，阴影和储水同样珍贵。",
  },
  rain: {
    name: "秋雨之间",
    money: 30,
    water: 26,
    seed: 89,
    description: "雨水充足，光照成为稀缺资源。",
  },
};
export const WEATHER = {
  sun: { name: "晴朗", sun: 2, rain: 0, icon: "☀" },
  cloud: { name: "多云", sun: 1, rain: 0, icon: "☁" },
  rain: { name: "阵雨", sun: 1, rain: 2, icon: "☂" },
};
export function weatherAt(s, day) {
  let x = (s.seed + day * 7919) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 2246822507) >>> 0;
  const n = x % 10;
  return s.scenario === "dry"
    ? n < 7
      ? "sun"
      : n < 9
        ? "cloud"
        : "rain"
    : s.scenario === "rain"
      ? n < 5
        ? "rain"
        : n < 8
          ? "cloud"
          : "sun"
      : n < 4
        ? "sun"
        : n < 7
          ? "cloud"
          : "rain";
}
export function createGame(scenario = "gentle", seed) {
  if (!SCENARIOS[scenario]) throw Error("未知情景");
  const c = SCENARIOS[scenario];
  return {
    scenario,
    seed: seed ?? c.seed,
    day: 1,
    money: c.money,
    water: c.water,
    harvests: 0,
    revenue: 0,
    companionDays: 0,
    dead: 0,
    plots: Array(12).fill(null),
    logs: ["第 1 天 · 空白阳台，也是一种可能。"],
    over: false,
  };
}
export function neighbors(i) {
  return [i % 4 > 0 ? i - 1 : -1, i % 4 < 3 ? i + 1 : -1, i - 4, i + 4].filter(
    (v) => v >= 0 && v < 12,
  );
}
export function lightAt(s, i) {
  return Math.max(0, WEATHER[weatherAt(s, s.day)].sun - (i % 4 === 0 ? 1 : 0));
}
export function occupied(s, i) {
  return s.plots[i] !== null;
}
const log = (s, m) => {
  s.logs.unshift(`第 ${s.day} 天 · ${m}`);
  s.logs = s.logs.slice(0, 50);
};
export function act(state, action) {
  const s = structuredClone(state);
  if (s.over)
    return { state: s, ok: false, message: "本季已结束，请开启新一季。" };
  const fail = (message) => ({ state, ok: false, message });
  const i = action.index;
  if (
    ["plant", "water", "harvest", "clear"].includes(action.type) &&
    (!Number.isInteger(i) || i < 0 || i >= 12)
  )
    return fail("请选择一个有效花盆。");
  if (action.type === "plant") {
    const c = CROPS[action.crop];
    if (!c) return fail("请选择种子。");
    if (occupied(s, i)) return fail("这块空间已经有植物了。");
    if (s.money < c.cost) return fail("预算不足，先收获或选择便宜种子。");
    if (c.space === 2 && (i % 4 === 3 || occupied(s, i + 1)))
      return fail("番茄需要右侧相邻空位，不能跨行。");
    s.money -= c.cost;
    s.plots[i] = {
      crop: action.crop,
      age: 0,
      health: 3,
      moisture: 2,
      bonus: 0,
    };
    if (c.space === 2) s.plots[i + 1] = { reserved: i };
    log(
      s,
      `播下${c.name}，花费 ¥${c.cost}${c.space === 2 ? "，占用两格" : ""}。`,
    );
  } else if (action.type === "water") {
    const p = s.plots[i];
    if (!p || p.reserved !== undefined) return fail("请先选择有植物的花盆。");
    if (p.moisture >= 4) return fail("土壤已经湿润，不必再浇。");
    if (s.water < 1) return fail("储水用尽，可补水或等雨。");
    p.moisture = Math.min(4, p.moisture + 2);
    s.water--;
    log(s, `${CROPS[p.crop].name}获得 2 格土壤水分，消耗 1 升储水。`);
  } else if (action.type === "harvest") {
    const p = s.plots[i];
    if (!p || p.reserved !== undefined || p.age < CROPS[p.crop].days)
      return fail("还没成熟，继续照料吧。");
    const c = CROPS[p.crop];
    const value = c.value + p.bonus;
    s.money += value;
    s.revenue += value;
    s.harvests++;
    s.plots[i] = null;
    if (c.space === 2) s.plots[i + 1] = null;
    log(s, `收获${c.name}，收入 ¥${value}${p.bonus ? "（含伴生加成）" : ""}。`);
  } else if (action.type === "clear") {
    const p = s.plots[i];
    if (!p || p.reserved !== undefined) return fail("请选择植物主格。");
    if (CROPS[p.crop].space === 2) s.plots[i + 1] = null;
    s.plots[i] = null;
    log(s, "清出了花盆。种子费用不返还。");
  } else if (action.type === "buyWater") {
    if (s.money < 4) return fail("补水需要 ¥4。");
    s.money -= 4;
    s.water += 6;
    log(s, "花费 ¥4，补充 6 升储水。");
  } else if (action.type === "next") {
    const w = WEATHER[weatherAt(s, s.day)];
    if (w.rain) {
      s.water += 3;
      log(s, "雨水收集 +3 升，每盆土壤水分 +2。");
    }
    const original = structuredClone(s.plots);
    let growth = 0,
      stress = 0,
      boost = 0;
    for (let j = 0; j < 12; j++) {
      const p = s.plots[j];
      if (!p || p.reserved !== undefined) continue;
      const c = CROPS[p.crop];
      p.moisture = Math.min(4, p.moisture + w.rain);
      const light = lightAt(s, j);
      const adj = neighbors(j)
        .map((k) => original[k])
        .filter((q) => q && q.reserved === undefined);
      const sheltered = adj.some((q) => q.crop === "basil" && q.age >= 2);
      const need = Math.max(1, c.water - (sheltered ? 1 : 0));
      const hydrated = p.moisture >= need;
      p.moisture = Math.max(0, p.moisture - need);
      if (hydrated && light >= c.light) {
        p.age = Math.min(c.days, p.age + 1);
        p.health = Math.min(3, p.health + 1);
        growth++;
        if (
          p.crop === "tomato" &&
          adj.some((q) => q.crop === "flower" && q.age >= 2)
        ) {
          p.bonus = Math.min(8, p.bonus + 2);
          boost++;
          s.companionDays++;
        }
      } else {
        p.health--;
        stress++;
        log(
          s,
          `${j + 1} 号${c.name}${!hydrated ? "缺水" : "光照不足"}，健康 -1；照料恢复后可回升。`,
        );
      }
      if (p.health <= 0) {
        s.plots[j] = null;
        if (c.space === 2) s.plots[j + 1] = null;
        s.dead++;
        log(s, `${j + 1} 号${c.name}枯萎，空间已释放。`);
      }
    }
    log(
      s,
      `${w.name}结束：${growth} 盆生长，${stress} 盆受压${boost ? `，${boost} 盆番茄获授粉加成` : ""}。`,
    );
    if (s.day === 20) {
      for (let j = 0; j < 12; j++) {
        const p = s.plots[j];
        if (!p || p.reserved !== undefined) continue;
        const c = CROPS[p.crop];
        if (p.age >= c.days) {
          const value = c.value + p.bonus;
          s.money += value;
          s.revenue += value;
          s.harvests++;
          s.plots[j] = null;
          if (c.space === 2) s.plots[j + 1] = null;
          log(s, `季末自动收获${c.name}，收入 ¥${value}。`);
        }
      }
      s.over = true;
      log(s, "20 天结束，成熟植物已自动收获；未成熟植物不折现。");
    } else s.day++;
  } else return fail("未知操作。");
  return { state: s, ok: true, message: s.logs[0] };
}
export function score(s) {
  return s.money + s.harvests * 5 + s.companionDays * 2 - s.dead * 3;
}
