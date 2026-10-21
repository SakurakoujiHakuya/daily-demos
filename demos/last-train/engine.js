export const STATIONS = {
  A: { name: "潮汐码头", x: 70, y: 230 },
  B: { name: "旧书街", x: 210, y: 230 },
  C: { name: "星桥", x: 350, y: 230 },
  D: { name: "天文馆", x: 490, y: 230 },
  E: { name: "东岸", x: 630, y: 230 },
  F: { name: "松林", x: 350, y: 75 },
  G: { name: "夜市", x: 350, y: 370 },
  H: { name: "南港", x: 350, y: 500 },
};
export const ROUTES = {
  east: { name: "蓝线 → 东岸", line: "blue", path: ["A", "B", "C", "D", "E"] },
  west: { name: "蓝线 → 码头", line: "blue", path: ["E", "D", "C", "B", "A"] },
  south: { name: "橙线 → 南港", line: "orange", path: ["F", "C", "G", "H"] },
  north: { name: "橙线 → 松林", line: "orange", path: ["H", "G", "C", "F"] },
};
const d = (from, to, count, ready, deadline) => ({
  from,
  to,
  count,
  ready,
  deadline,
});
export const LEVELS = [
  {
    id: "first",
    name: "01 / 星桥最后一班",
    subtitle: "两列车，一次接力",
    brief:
      "码头的乘客需要在星桥换乘。先让蓝线接人，再让橙线等他们一分钟。留心：错过最后一班，就没有下一班。",
    budget: 2,
    capacity: 8,
    horizon: 16,
    demands: [
      d("A", "H", 5, 0, 12),
      d("B", "E", 3, 0, 10),
      d("F", "G", 3, 0, 12),
    ],
    example: [
      { route: "east", departure: 0, stops: ["A", "B", "C", "D", "E"] },
      { route: "south", departure: 5, stops: ["F", "C", "G", "H"] },
    ],
  },
  {
    id: "rush",
    name: "02 / 夜市散场",
    subtitle: "座位有限，直达还是普停？",
    brief:
      "夜市散场时，北行车必须兼顾南港与夜市。第二列北行接走溢出的乘客，还是把车留给横穿城市的人？跳过无人上下车的站可节省一分钟。",
    budget: 4,
    capacity: 6,
    horizon: 18,
    demands: [
      d("H", "F", 6, 0, 11),
      d("G", "F", 5, 1, 12),
      d("A", "E", 4, 0, 10),
      d("F", "H", 4, 2, 14),
      d("B", "D", 2, 0, 11),
    ],
    example: [
      { route: "north", departure: 0, stops: ["H", "G", "C", "F"] },
      { route: "north", departure: 3, stops: ["H", "G", "C", "F"] },
      { route: "east", departure: 0, stops: ["A", "B", "C", "D", "E"] },
      { route: "south", departure: 2, stops: ["F", "C", "G", "H"] },
    ],
  },
  {
    id: "cross",
    name: "03 / 双向星桥",
    subtitle: "相向列车与错峰换乘",
    brief:
      "两组乘客要在星桥转向。相向列车争用同一段单线轨道时，编号小的列车先行，另一列等待。用发车时刻与跳站安排一场精确接力。",
    budget: 4,
    capacity: 7,
    horizon: 20,
    demands: [
      d("A", "H", 5, 0, 14),
      d("E", "F", 5, 0, 14),
      d("F", "E", 2, 0, 14),
      d("H", "A", 2, 0, 14),
      d("B", "D", 2, 1, 12),
    ],
    example: [
      { route: "east", departure: 0, stops: ["A", "B", "C", "D", "E"] },
      { route: "west", departure: 0, stops: ["E", "D", "C", "B", "A"] },
      { route: "south", departure: 0, hold: 3, stops: ["F", "C", "G", "H"] },
      { route: "north", departure: 0, hold: 1, stops: ["H", "G", "C", "F"] },
    ],
  },
];
export function seededLevel(seed = 20261021) {
  let x = Number(seed) >>> 0;
  const rand = () => {
    x = (1664525 * x + 1013904223) >>> 0;
    return x / 4294967296;
  };
  const stations = Object.keys(STATIONS);
  const demands = Array.from({ length: 6 }, () => {
    const from = stations[Math.floor(rand() * 8)];
    let to = stations[Math.floor(rand() * 8)];
    if (to === from) to = stations[(stations.indexOf(from) + 1) % 8];
    return d(
      from,
      to,
      2 + Math.floor(rand() * 4),
      Math.floor(rand() * 4),
      12 + Math.floor(rand() * 6),
    );
  });
  return {
    id: `seed-${seed}`,
    name: "04 / 种子夜班",
    subtitle: `同一种子，同一座城市 · ${seed}`,
    brief:
      "六组随机客流，四列末班车。随机题不保证全员送达：在固定资源里寻找更高的准点率，与朋友比较同一张夜班考卷。",
    budget: 4,
    capacity: 7,
    horizon: 20,
    demands,
  };
}
const lineOf = (s) => ("ABCDE".includes(s) ? "blue" : "orange");
export function legsFor(from, to) {
  if (!STATIONS[from] || !STATIONS[to] || from === to)
    throw Error("Invalid journey");
  if (from === "C" || to === "C" || lineOf(from) === lineOf(to))
    return [{ from, to }];
  return [
    { from, to: "C" },
    { from: "C", to },
  ];
}
export function defaultPlan(route = "east", departure = 0) {
  return { route, departure, stops: [...ROUTES[route].path] };
}
export function validatePlan(level, plans) {
  if (plans.length > level.budget) throw Error("列车数超过本关上限");
  for (const p of plans) {
    if (
      p.hold !== undefined &&
      (!Number.isInteger(p.hold) || p.hold < 0 || p.hold > 5)
    )
      throw Error("星桥候车须为 0–5 分钟");
    const r = ROUTES[p.route];
    if (!r) throw Error("未知线路");
    if (
      !Number.isInteger(p.departure) ||
      p.departure < 0 ||
      p.departure >= level.horizon
    )
      throw Error("发车时间超出夜班范围");
    if (
      !Array.isArray(p.stops) ||
      p.stops.some((s) => !r.path.includes(s)) ||
      !p.stops.includes(r.path[0]) ||
      !p.stops.includes(r.path.at(-1))
    )
      throw Error("始发站和终点站必须停靠");
  }
  return true;
}
export function createSimulation(level, plans) {
  validatePlan(level, plans);
  const passengers = [];
  level.demands.forEach((g, gi) => {
    for (let i = 0; i < g.count; i++)
      passengers.push({
        id: `${gi}-${i}`,
        group: gi,
        origin: g.from,
        destination: g.to,
        legs: legsFor(g.from, g.to),
        leg: 0,
        station: g.from,
        status: "waiting",
        ready: g.ready,
        deadline: g.deadline,
        train: null,
        arrival: null,
      });
  });
  return {
    level: structuredClone(level),
    plans: structuredClone(plans),
    time: -1,
    done: false,
    passengers,
    trains: plans.map((p, i) => ({
      ...structuredClone(p),
      id: i + 1,
      index: 0,
      status: "idle",
      station: ROUTES[p.route].path[0],
      moving: null,
      departAfter: p.departure,
      load: [],
      delay: 0,
    })),
    events: [],
    history: [],
  };
}
const title = (s) => STATIONS[s].name;
function event(state, text, type = "info") {
  state.events.push({ time: state.time, text, type });
}
function canBoard(p, tr) {
  const r = ROUTES[tr.route];
  const leg = p.legs[p.leg];
  return (
    p.status === "waiting" &&
    p.ready <= tr._time &&
    p.station === tr.station &&
    leg.from === tr.station &&
    tr.stops.includes(leg.to) &&
    r.path.indexOf(leg.to) > tr.index
  );
}
export function step(input) {
  const s = structuredClone(input);
  if (s.done) return s;
  s.time++;
  s.events = [];
  for (const tr of s.trains) {
    const r = ROUTES[tr.route];
    if (tr.moving) {
      tr.index++;
      tr.station = r.path[tr.index];
      tr.moving = null;
      const stops = tr.stops.includes(tr.station);
      if (stops) {
        tr.departAfter = s.time + 1 + (tr.station === "C" ? tr.hold || 0 : 0);
        const remaining = [];
        for (const id of tr.load) {
          const p = s.passengers.find((p) => p.id === id);
          if (p.legs[p.leg].to === tr.station) {
            p.train = null;
            if (p.leg === p.legs.length - 1) {
              p.status = "arrived";
              p.arrival = s.time;
              event(
                s,
                `${title(p.destination)}：1 人${s.time <= p.deadline ? "准点" : "迟到"}抵达`,
                s.time <= p.deadline ? "good" : "warn",
              );
            } else {
              p.leg++;
              p.station = tr.station;
              p.ready = s.time + 1;
              p.status = "waiting";
              event(s, `星桥：1 人换乘，${p.ready} 分起可上车`);
            }
          } else remaining.push(id);
        }
        tr.load = remaining;
      }
      if (tr.index === r.path.length - 1) {
        tr.status = "finished";
        event(s, `${tr.id} 号车完成夜班`);
      } else tr.status = "running";
    }
    if (tr.status === "idle" && s.time >= tr.departure) {
      tr.status = "running";
      event(s, `${tr.id} 号车从${title(tr.station)}发车`);
    }
  }
  // All arrivals are processed before boarding, making transfer readiness independent of train order.
  for (const tr of s.trains) {
    if (tr.status !== "running" || !tr.stops.includes(tr.station)) continue;
    tr._time = s.time;
    const candidates = s.passengers
      .filter((p) => canBoard(p, tr))
      .sort(
        (a, b) =>
          a.ready - b.ready || a.group - b.group || a.id.localeCompare(b.id),
      );
    const boarded = candidates.slice(
      0,
      Math.max(0, s.level.capacity - tr.load.length),
    );
    for (const p of boarded) {
      p.status = "onboard";
      p.train = tr.id;
      tr.load.push(p.id);
    }
    if (boarded.length)
      event(s, `${tr.id} 号车在${title(tr.station)}接走 ${boarded.length} 人`);
    delete tr._time;
  }
  const occupied = new Set();
  for (const tr of s.trains) {
    if (tr.status !== "running" || s.time < tr.departAfter) continue;
    const path = ROUTES[tr.route].path;
    const next = path[tr.index + 1];
    const key = [tr.station, next].sort().join("-");
    if (occupied.has(key)) {
      tr.delay++;
      event(s, `${tr.id} 号车在${title(tr.station)}让行 1 分钟`, "warn");
      continue;
    }
    occupied.add(key);
    tr.moving = { from: tr.station, to: next };
  }
  s.done = s.time >= s.level.horizon;
  s.history.push({ time: s.time, ...score(s) });
  return s;
}
export function score(s) {
  const ontime = s.passengers.filter(
    (p) => p.arrival !== null && p.arrival <= p.deadline,
  ).length;
  const late = s.passengers.filter(
    (p) => p.arrival !== null && p.arrival > p.deadline,
  ).length;
  const waiting = s.passengers.filter((p) => p.status === "waiting").length;
  const onboard = s.passengers.filter((p) => p.status === "onboard").length;
  const delay = s.trains.reduce((n, t) => n + t.delay, 0);
  return {
    ontime,
    late,
    waiting,
    onboard,
    total: s.passengers.length,
    delay,
    points: ontime * 100 + late * 35 - delay * 3,
  };
}
export function run(level, plans) {
  let s = createSimulation(level, plans);
  while (!s.done) s = step(s);
  return s;
}
