export const INGREDIENTS = {
  rice: { name: "米饭", icon: "🍚", cost: 2, fresh: false },
  noodle: { name: "面条", icon: "🍜", cost: 2, fresh: false },
  egg: { name: "鸡蛋", icon: "🥚", cost: 3, fresh: true },
  tofu: { name: "豆腐", icon: "◻", cost: 3, fresh: true },
  tomato: { name: "番茄", icon: "🍅", cost: 3, fresh: true },
  mushroom: { name: "香菇", icon: "🍄", cost: 4, fresh: true },
};
export const METHODS = { fry: "炒", simmer: "煮", steam: "蒸" };
export const RECIPES = [
  {
    id: "sunrise",
    name: "日出蛋炒饭",
    items: ["rice", "egg"],
    method: "fry",
    price: 13,
    tag: "饱腹",
    icon: "🍳",
    line: "把今天最后一点光，炒进米饭里。",
  },
  {
    id: "red",
    name: "番茄汤面",
    items: ["noodle", "tomato"],
    method: "simmer",
    price: 12,
    tag: "清淡",
    icon: "🍜",
    line: "热汤替没说完的话接了下去。",
  },
  {
    id: "forest",
    name: "山间菇饭",
    items: ["rice", "mushroom"],
    method: "steam",
    price: 15,
    tag: "素食",
    icon: "🍄",
    line: "米饭里藏着一条回山里的路。",
  },
  {
    id: "cloud",
    name: "白云豆腐",
    items: ["tofu", "mushroom"],
    method: "steam",
    price: 16,
    tag: "清淡",
    icon: "☁",
    line: "不用赶路的时候，云也是慢的。",
  },
  {
    id: "home",
    name: "番茄炒蛋",
    items: ["tomato", "egg"],
    method: "fry",
    price: 15,
    tag: "饱腹",
    icon: "🍅",
    line: "记忆里最普通的味道，最难忘记。",
  },
  {
    id: "garden",
    name: "田园豆腐面",
    items: ["noodle", "tofu"],
    method: "simmer",
    price: 13,
    tag: "素食",
    icon: "🌱",
    line: "小小一碗，也能长出春天。",
  },
];
const PEOPLE = [
  {
    name: "阿禾",
    job: "收班的花店店员",
    tag: "素食",
    budget: 16,
    line: "今天剩下的花，我送给路过的人了。",
  },
  {
    name: "周叔",
    job: "夜班公交司机",
    tag: "饱腹",
    budget: 17,
    line: "最后一班车，总有一个等着回家的人。",
  },
  {
    name: "小岚",
    job: "准备考试的学生",
    tag: "清淡",
    budget: 14,
    line: "今晚记住的东西，希望明天还在。",
  },
  {
    name: "林姐",
    job: "刚下夜班的护士",
    tag: "清淡",
    budget: 19,
    line: "终于轮到我，被一碗热饭照顾了。",
  },
  {
    name: "木子",
    job: "修旧物的手艺人",
    tag: "素食",
    budget: 18,
    line: "修不好的东西，先放一晚也没关系。",
  },
  {
    name: "阿远",
    job: "跑夜路的快递员",
    tag: "饱腹",
    budget: 15,
    line: "这一单送完，就给自己送一顿饭。",
  },
];
const EVENTS = [
  { title: "普通的微风夜", text: "街口安静，所有食材原价。", key: null },
  {
    title: "雨落在番茄上",
    text: "雨天运输慢，番茄每份贵 1 元。",
    key: "tomato",
  },
  {
    title: "山里来了一筐菇",
    text: "香菇丰收，每份便宜 1 元。",
    key: "mushroom",
    delta: -1,
  },
  {
    title: "街口灯亮了",
    text: "夜归的人多了，今晚多来一位客人。",
    key: null,
    extra: 1,
  },
];
const clone = (s) => JSON.parse(JSON.stringify(s));
export function hashSeed(seed) {
  let h = 2166136261;
  for (const c of String(seed)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}
function random(seed) {
  let v = seed >>> 0;
  return () => {
    v = (Math.imul(v, 1664525) + 1013904223) >>> 0;
    return v / 4294967296;
  };
}
export function forecast(s) {
  const rnd = random(hashSeed(s.seed + ":" + s.day));
  const event = EVENTS[Math.floor(rnd() * EVENTS.length)];
  const guests = Array.from({ length: 5 + (event.extra || 0) }, (_, i) => ({
    ...PEOPLE[Math.floor(rnd() * PEOPLE.length)],
    id: i,
  }));
  return { event, guests };
}
export function price(s, key) {
  const e = forecast(s).event;
  return INGREDIENTS[key].cost + (e.key === key ? e.delta || 1 : 0);
}
export function createGame(seed = "灯下有饭") {
  return {
    version: 1,
    seed: String(seed).slice(0, 40) || "灯下有饭",
    day: 1,
    phase: "market",
    cash: 80,
    reputation: 50,
    stock: Object.fromEntries(Object.keys(INGREDIENTS).map((k) => [k, 0])),
    menu: ["sunrise", "red", "garden"],
    markup: 0,
    guests: [],
    cursor: 0,
    served: 0,
    lost: 0,
    waste: 0,
    revenue: 0,
    history: [],
    night: { revenue: 0, served: 0, lost: 0, spent: 0 },
    notice: "先看今晚客人的口味，再备货。只买需要的，新鲜食材打烊后不能留。",
  };
}
function fail(s, message) {
  return { ...clone(s), notice: message };
}
export function buy(s, key, qty = 1) {
  if (
    s.phase !== "market" ||
    !INGREDIENTS[key] ||
    !Number.isInteger(qty) ||
    qty === 0
  )
    return fail(s, "现在不能这样采购。");
  const n = clone(s),
    cost = price(s, key);
  if (qty > 0 && (qty > 20 || n.cash < cost * qty || n.stock[key] + qty > 30))
    return fail(s, "预算或储存空间不足。");
  if (qty < 0 && n.stock[key] < -qty)
    return fail(s, "没有足够的食材可以退回。");
  n.stock[key] += qty;
  n.cash -= cost * qty;
  n.night.spent += cost * qty;
  n.notice =
    qty > 0
      ? `已备好 ${qty} 份${INGREDIENTS[key].name}。`
      : `退回 ${-qty} 份${INGREDIENTS[key].name}。`;
  return n;
}
export function toggleMenu(s, id) {
  if (s.phase !== "market" || !RECIPES.some((r) => r.id === id))
    return fail(s, "菜单现在不能更改。");
  let n = clone(s);
  if (n.menu.includes(id)) {
    if (n.menu.length === 1) return fail(s, "至少留一道菜。");
    n.menu = n.menu.filter((x) => x !== id);
  } else {
    if (n.menu.length >= 3)
      return fail(s, "小店只能同时准备三道菜，请先撤下一道。");
    n.menu.push(id);
  }
  return n;
}
export function setMarkup(s, v) {
  if (s.phase !== "market" || ![0, 2, 4].includes(v))
    return fail(s, "开店前可设置加价。");
  return { ...clone(s), markup: v };
}
export function openNight(s) {
  if (s.phase !== "market") return fail(s, "已经开门了。");
  let n = clone(s);
  const f = forecast(s);
  const rnd = random(hashSeed(s.seed + ":orders:" + s.day));
  n.guests = f.guests.map((g) => {
    const opts = n.menu.map((id) => RECIPES.find((r) => r.id === id));
    const liked = opts.filter((r) => r.tag === g.tag);
    const pool = liked.length ? liked : opts;
    return { ...g, order: pool[Math.floor(rnd() * pool.length)].id };
  });
  n.phase = "kitchen";
  n.notice =
    "灯亮了。按点单选两种食材与做法；也可以做另一道菜，但满意度会下降。";
  return n;
}
export function identifyDish(items, method) {
  if (!Array.isArray(items) || items.length !== 2) return null;
  return (
    RECIPES.find(
      (r) =>
        r.method === method &&
        r.items.slice().sort().join() === items.slice().sort().join(),
    ) || null
  );
}
export function cook(s, items, method) {
  if (s.phase !== "kitchen" || s.cursor >= s.guests.length)
    return fail(s, "现在没有等餐的客人。");
  if (
    !Array.isArray(items) ||
    items.length !== 2 ||
    !METHODS[method] ||
    items.some((k) => !INGREDIENTS[k])
  )
    return fail(s, "请选两份食材和一种做法。");
  const need = {};
  for (const k of items) need[k] = (need[k] || 0) + 1;
  if (Object.entries(need).some(([k, v]) => s.stock[k] < v))
    return fail(s, "库存不够，试试另一道菜，或坦诚谢客。");
  const n = clone(s);
  for (const k of items) n.stock[k]--;
  const dish = identifyDish(items, method),
    g = n.guests[n.cursor];
  if (!dish) {
    n.waste += 2;
    n.reputation = Math.max(0, n.reputation - 3);
    n.notice = "火候与搭配没有对上，试菜失败。消耗了两份食材；客人仍在等。";
    return n;
  }
  let satisfaction =
    3 + (dish.id === g.order ? 2 : -2) + (dish.tag === g.tag ? 1 : 0);
  const amount = dish.price + n.markup;
  if (amount > g.budget) satisfaction -= (amount - g.budget) * 2;
  satisfaction = Math.max(0, Math.min(6, satisfaction));
  n.cash += amount;
  n.revenue += amount;
  n.night.revenue += amount;
  n.served++;
  n.night.served++;
  n.reputation = Math.max(0, Math.min(100, n.reputation + satisfaction - 3));
  n.cursor++;
  n.notice = `${g.name}吃到了${dish.name} · 收入 ¥${amount} · 满意 ${satisfaction}/6。${satisfaction >= 5 ? "“" + g.line + "”" : satisfaction <= 2 ? "“下次，希望能更合心意一点。”" : "“谢谢，今晚有热饭真好。”"}`;
  n.history.push({
    day: n.day,
    name: g.name,
    dish: dish.name,
    satisfaction,
    amount,
  });
  if (n.cursor === n.guests.length) n.phase = "closing";
  return n;
}
export function skipGuest(s) {
  if (s.phase !== "kitchen") return fail(s, "没有客人需要谢绝。");
  const n = clone(s),
    g = n.guests[n.cursor];
  n.cursor++;
  n.lost++;
  n.night.lost++;
  n.reputation = Math.max(0, n.reputation - 4);
  n.notice = `向${g.name}道了歉。没有消耗食材，口碑 -4。`;
  if (n.cursor === n.guests.length) n.phase = "closing";
  return n;
}
export function closeNight(s) {
  if (s.phase !== "closing") return fail(s, "请先照顾完等候的客人。");
  const n = clone(s);
  let spoiled = 0;
  for (const [key, data] of Object.entries(INGREDIENTS)) {
    if (data.fresh) {
      spoiled += n.stock[key];
      n.stock[key] = 0;
    }
  }
  n.waste += spoiled;
  n.cash -= 12;
  n.lastNight = { ...n.night, spoiled, rent: 12, day: n.day };
  n.notice = `第 ${n.day} 夜打烊。房租 ¥12，${spoiled} 份鲜食过夜损耗。米饭和面条可以留到明天。`;
  if (n.day === 7 || n.cash < 0) {
    n.phase = "end";
  } else {
    n.phase = "summary";
  }
  return n;
}
export function nextNight(s) {
  if (s.phase !== "summary") return fail(s, "还不能进入下一夜。");
  const n = clone(s);
  n.day++;
  n.phase = "market";
  n.guests = [];
  n.cursor = 0;
  n.night = { revenue: 0, served: 0, lost: 0, spent: 0 };
  n.notice = "新的一夜。看看天气和客人，再调整菜单与库存。";
  return n;
}
export function ending(s) {
  if (s.cash < 0)
    return {
      title: "暂时熄灯",
      text: "这一周的账本没能平衡。可那些热饭，都真实地暖过一个人。换一种采购节奏，再开一次门吧。",
    };
  if (s.reputation >= 85 && s.waste <= 12)
    return {
      title: "一条街的晚安",
      text: "没有招牌的人气，没有多余的浪费。夜归的人记住了这盏灯，也记住了刚刚好的那一碗。",
    };
  if (s.cash >= 220)
    return {
      title: "小店的大账本",
      text: "你把收支算得漂亮，小店有了更长远的明天。下一次，也许可以多听一听客人的心事。",
    };
  if (s.reputation >= 70)
    return {
      title: "有人为你留灯",
      text: "熟客开始把这里叫作第二个厨房。利润不一定最多，但每一个名字都有人记得。",
    };
  return {
    title: "仍然温热的开始",
    text: "七夜过去，灶台还热着。经营和生活一样，没找到最好的办法，也可以再试一次。",
  };
}
