import test from "node:test";
import assert from "node:assert/strict";
import {
  LEVELS,
  ROUTES,
  legsFor,
  defaultPlan,
  createSimulation,
  step,
  run,
  score,
  seededLevel,
  validatePlan,
} from "../engine.js";
const fixture = (demands, extras = {}) => ({
  id: "test",
  budget: 4,
  capacity: 3,
  horizon: 15,
  demands,
  ...extras,
});
const demand = (from, to, count = 1, ready = 0, deadline = 15) => ({
  from,
  to,
  count,
  ready,
  deadline,
});
test("same line itinerary is direct", () =>
  assert.deepEqual(legsFor("A", "E"), [{ from: "A", to: "E" }]));
test("cross line itinerary transfers at C", () =>
  assert.deepEqual(legsFor("A", "H"), [
    { from: "A", to: "C" },
    { from: "C", to: "H" },
  ]));
test("central station journeys need no transfer", () =>
  assert.equal(legsFor("C", "H").length, 1));
test("invalid journeys are rejected", () => {
  assert.throws(() => legsFor("Z", "A"));
  assert.throws(() => legsFor("A", "A"));
});
test("capacity leaves overflow at station", () => {
  const s = run(fixture([demand("A", "E", 5)]), [defaultPlan()]);
  assert.equal(score(s).ontime, 3);
  assert.equal(score(s).waiting, 2);
});
test("late passengers cannot board departed train", () => {
  const s = run(fixture([demand("A", "E", 1, 1)]), [defaultPlan()]);
  assert.equal(score(s).waiting, 1);
});
test("arrival exactly on deadline is on time", () => {
  const p = defaultPlan();
  p.stops = ["A", "E"];
  assert.equal(score(run(fixture([demand("A", "E", 1, 0, 4)]), [p])).ontime, 1);
});
test("arrival after deadline scores only late credit", () => {
  const p = defaultPlan();
  p.stops = ["A", "E"];
  const v = score(run(fixture([demand("A", "E", 1, 0, 3)]), [p]));
  assert.equal(v.late, 1);
  assert.equal(v.points, 35);
});
test("skipped destination does not permit boarding", () => {
  const p = defaultPlan();
  p.stops = ["A", "E"];
  assert.equal(score(run(fixture([demand("A", "B")]), [p])).waiting, 1);
});
test("skip stops saves dwell minutes", () => {
  const all = run(fixture([demand("A", "E")]), [defaultPlan()]);
  const express = { ...defaultPlan(), stops: ["A", "E"] };
  const fast = run(fixture([demand("A", "E")]), [express]);
  assert.equal(all.passengers[0].arrival - fast.passengers[0].arrival, 3);
});
test("shared edge admits only one train per minute", () => {
  const s = step(createSimulation(fixture([]), [defaultPlan(), defaultPlan()]));
  assert.equal(s.trains[0].moving.to, "B");
  assert.equal(s.trains[1].moving, null);
  assert.equal(s.trains[1].delay, 1);
});
test("transfer requires a full minute; holding reconnects", () => {
  const l = fixture([demand("A", "H")]);
  const blue = defaultPlan("east");
  const orange = { ...defaultPlan("south", 1), hold: 0 };
  const tooSoon = run(l, [blue, orange]);
  assert.equal(score(tooSoon).waiting, 1);
  const connected = run(l, [blue, { ...orange, hold: 1 }]);
  assert.equal(score(connected).ontime, 1);
});
test("two simultaneous arriving trains cannot exchange immediately", () => {
  const l = fixture([demand("A", "H")]);
  const s0 = createSimulation(l, [
    defaultPlan("east"),
    defaultPlan("south", 2),
  ]);
  let s = s0;
  for (let i = 0; i < 4; i++) s = step(s);
  assert.equal(s.time, 3);
  assert.equal(s.passengers[0].status, "waiting");
  assert.equal(s.passengers[0].ready, 4);
});
test("pure step does not mutate input or plan", () => {
  const plans = [defaultPlan()];
  const before = JSON.stringify(plans);
  const s = createSimulation(fixture([demand("A", "E")]), plans);
  step(s);
  assert.equal(s.time, -1);
  assert.equal(s.trains[0].load.length, 0);
  assert.equal(JSON.stringify(plans), before);
});
test("reset creates pristine state after a completed run", () => {
  const l = fixture([demand("A", "E")]),
    p = [defaultPlan()];
  run(l, p);
  const s = createSimulation(l, p);
  assert.equal(s.time, -1);
  assert.equal(s.passengers[0].status, "waiting");
  assert.equal(s.trains[0].delay, 0);
  assert.deepEqual(s.events, []);
});
test("stepping completed simulation is idempotent", () => {
  const s = run(fixture([]), []);
  assert.deepEqual(step(s), s);
});
test("horizon ends with onboard passengers unserved", () => {
  const s = run(fixture([demand("A", "E")], { horizon: 1 }), [defaultPlan()]);
  assert.equal(score(s).onboard, 1);
  assert.equal(score(s).points, 0);
});
test("negative/fractional departure and excess budget rejected", () => {
  const l = fixture([], { budget: 1 });
  assert.throws(() => validatePlan(l, [defaultPlan("east", -1)]));
  assert.throws(() => validatePlan(l, [defaultPlan("east", 0.5)]));
  assert.throws(() => validatePlan(l, [defaultPlan(), defaultPlan()]));
});
test("mandatory terminals, invalid hold and route rejected", () => {
  const l = fixture([]);
  assert.throws(() => validatePlan(l, [{ ...defaultPlan(), stops: ["A"] }]));
  assert.throws(() => validatePlan(l, [{ ...defaultPlan(), hold: 6 }]));
  assert.throws(() =>
    validatePlan(l, [{ ...defaultPlan(), route: "invalid" }]),
  );
});
test("seed is repeatable and different seeds vary", () => {
  assert.deepEqual(seededLevel(42), seededLevel(42));
  assert.notDeepEqual(seededLevel(42).demands, seededLevel(43).demands);
});
test("every hand-authored level has a full on-time solution", () => {
  for (const l of LEVELS) {
    const v = score(run(l, l.example));
    assert.equal(v.ontime, v.total, l.id);
  }
});
test("every passenger remains in exactly one lifecycle state", () => {
  let s = createSimulation(LEVELS[2], LEVELS[2].example);
  while (!s.done) {
    s = step(s);
    const v = score(s);
    assert.equal(v.ontime + v.late + v.waiting + v.onboard, v.total);
    for (const t of s.trains) assert.ok(t.load.length <= s.level.capacity);
    const loaded = s.trains.flatMap((t) => t.load);
    assert.equal(new Set(loaded).size, loaded.length);
  }
});
test("opposite directions share track capacity and yield deterministically", () => {
  const l = fixture([]);
  const east = { ...defaultPlan("east"), stops: ["A", "E"] };
  const west = { ...defaultPlan("west", 1), stops: ["E", "A"] };
  let s = createSimulation(l, [east, west]);
  for (let i = 0; i < 3; i++) s = step(s);
  assert.equal(s.time, 2);
  assert.deepEqual(s.trains[0].moving, { from: "C", to: "D" });
  assert.equal(s.trains[1].moving, null);
  assert.equal(s.trains[1].station, "D");
  assert.equal(s.trains[1].delay, 1);
});
test("waiting passengers board held train when they become ready", () => {
  const l = fixture([demand("C", "H", 1, 4)]);
  const plan = { ...defaultPlan("south"), hold: 3 };
  const s = run(l, [plan]);
  assert.equal(score(s).ontime, 1);
});
test("repeated same-seed same-plan runs are identical", () => {
  const l = seededLevel(20261021);
  const p = [
    defaultPlan("east"),
    defaultPlan("west", 2),
    { ...defaultPlan("south"), hold: 3 },
    defaultPlan("north", 2),
  ];
  assert.deepEqual(run(l, p), run(l, p));
});
