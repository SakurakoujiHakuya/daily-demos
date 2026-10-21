import test from "node:test";
import assert from "node:assert/strict";
import {
  createGame,
  act,
  weatherAt,
  CROPS,
  neighbors,
  lightAt,
  score,
} from "../engine.js";
const step = (s, a) => act(s, a).state;
const plant = (s, crop = "radish", index = 1) =>
  step(s, { type: "plant", crop, index });
function sunnyState() {
  let s = createGame();
  while (weatherAt(s, s.day) !== "sun") s.day++;
  return s;
}
test("same seed gives identical twenty-day forecast", () => {
  let a = createGame("dry", 125),
    b = createGame("dry", 125);
  assert.deepEqual(
    Array.from({ length: 20 }, (_, i) => weatherAt(a, i + 1)),
    Array.from({ length: 20 }, (_, i) => weatherAt(b, i + 1)),
  );
});
test("scenarios have distinct resources", () =>
  assert.notEqual(createGame("dry").water, createGame("rain").water));
test("plant debits seed cost without mutating previous state", () => {
  let s = createGame(),
    t = plant(s);
  assert.equal(t.money, s.money - CROPS.radish.cost);
  assert.equal(s.plots[1], null);
});
test("overlapping planting is rejected", () => {
  let s = plant(createGame());
  assert.equal(act(s, { type: "plant", crop: "basil", index: 1 }).ok, false);
});
test("tomato reserves two slots and cannot wrap row", () => {
  let s = plant(createGame(), "tomato", 1);
  assert.equal(s.plots[2].reserved, 1);
  assert.equal(
    act(createGame(), { type: "plant", crop: "tomato", index: 3 }).ok,
    false,
  );
});
test("insufficient budget rejects planting", () => {
  let s = createGame();
  s.money = 0;
  assert.equal(act(s, { type: "plant", crop: "tomato", index: 1 }).ok, false);
});
test("watering consumes one reservoir unit and adds two soil units", () => {
  let s = plant(createGame()),
    t = step(s, { type: "water", index: 1 });
  assert.equal(t.water, s.water - 1);
  assert.equal(t.plots[1].moisture, 4);
  assert.equal(act(t, { type: "water", index: 1 }).ok, false);
});
test("water purchase is bounded by budget", () => {
  let s = createGame(),
    t = step(s, { type: "buyWater" });
  assert.equal(t.money, s.money - 4);
  assert.equal(t.water, s.water + 6);
  s.money = 3;
  assert.equal(act(s, { type: "buyWater" }).ok, false);
});
test("light depends on wall shade", () => {
  const s = sunnyState();
  assert.equal(lightAt(s, 0), 1);
  assert.equal(lightAt(s, 1), 2);
});
test("well cared plant grows and recovers health", () => {
  let s = plant(sunnyState());
  s.plots[1].health = 1;
  let t = step(s, { type: "next" });
  assert.equal(t.plots[1].age, 1);
  assert.equal(t.plots[1].health, 2);
});
test("water shortage kills unhealthy plant and releases tomato space", () => {
  let s = plant(sunnyState(), "tomato");
  s.plots[1].health = 1;
  s.plots[1].moisture = 0;
  let t = step(s, { type: "next" });
  assert.equal(t.plots[1], null);
  assert.equal(t.plots[2], null);
  assert.equal(t.dead, 1);
});
test("rain adds soil and reservoir water", () => {
  let s = createGame();
  while (weatherAt(s, s.day) !== "rain") s.day++;
  s = plant(s);
  s.plots[1].moisture = 0;
  const t = step(s, { type: "next" });
  assert.equal(t.water, s.water + 3);
  assert.equal(t.plots[1].moisture, 1);
});
test("mature basil neighbor cuts tomato consumption", () => {
  let s = plant(sunnyState(), "tomato", 1);
  s = plant(s, "basil", 5);
  s.plots[5].age = 2;
  s.plots[1].moisture = 1;
  const t = step(s, { type: "next" });
  assert.equal(t.plots[1].age, 1);
  assert.equal(t.plots[1].health, 3);
});
test("mature flower neighbor awards capped tomato bonus", () => {
  let s = plant(sunnyState(), "tomato", 1);
  s = plant(s, "flower", 5);
  s.plots[5].age = 2;
  s.plots[1].bonus = 7;
  const t = step(s, { type: "next" });
  assert.equal(t.plots[1].bonus, 8);
  assert.equal(t.companionDays, 1);
});
test("neighbors do not wrap columns", () =>
  assert.deepEqual(neighbors(3), [2, 7]));
test("harvest only ripe crops and includes companion premium", () => {
  let s = plant(createGame(), "tomato");
  assert.equal(act(s, { type: "harvest", index: 1 }).ok, false);
  s.plots[1].age = 5;
  s.plots[1].bonus = 4;
  const t = step(s, { type: "harvest", index: 1 });
  assert.equal(t.money, s.money + 30);
  assert.equal(t.harvests, 1);
  assert.equal(t.plots[2], null);
});
test("remove frees reserved space without refund", () => {
  let s = plant(createGame(), "tomato"),
    t = step(s, { type: "clear", index: 1 });
  assert.equal(t.money, s.money);
  assert.equal(t.plots[2], null);
});
test("season completes after twenty manual days and blocks further actions", () => {
  let s = createGame();
  for (let i = 0; i < 19; i++) s = step(s, { type: "next" });
  assert.equal(s.over, false);
  assert.equal(s.day, 20);
  s = step(s, { type: "next" });
  assert.equal(s.over, true);
  assert.equal(act(s, { type: "buyWater" }).ok, false);
});
test("final evening auto-harvests ripe crop instead of trapping it", () => {
  let s = plant(createGame());
  s.day = 20;
  s.plots[1].age = 4;
  s.plots[1].moisture = 4;
  const t = step(s, { type: "next" });
  assert.equal(t.harvests, 1);
  assert.equal(t.plots[1], null);
});
test("default spring can grow tomato with care", () => {
  let s = plant(createGame(), "tomato");
  for (let i = 0; i < 15; i++) {
    if (!s.plots[1]) break;
    if (s.plots[1].age === CROPS.tomato.days) {
      s = step(s, { type: "harvest", index: 1 });
      break;
    }
    if (s.plots[1].moisture < 2) s = step(s, { type: "water", index: 1 });
    s = step(s, { type: "next" });
  }
  assert.equal(s.harvests, 1);
});
test("score is transparent", () => {
  let s = createGame();
  s.money = 10;
  s.harvests = 3;
  s.companionDays = 2;
  s.dead = 1;
  assert.equal(score(s), 26);
});
test("invalid cell and action are safe rejections", () => {
  assert.equal(
    act(createGame(), { type: "plant", crop: "radish", index: 99 }).ok,
    false,
  );
  assert.equal(act(createGame(), { type: "bogus" }).ok, false);
});
function radishStrategy(scenario) {
  let s = createGame(scenario);
  for (let day = 1; day <= 20; day++) {
    for (const i of [1, 2, 3]) {
      if (s.plots[i]?.age >= CROPS.radish.days)
        s = step(s, { type: "harvest", index: i });
      if (!s.plots[i] && day <= 16 && s.money >= 5) s = plant(s, "radish", i);
      if (s.plots[i]?.moisture < 1) {
        if (s.water === 0) s = step(s, { type: "buyWater" });
        s = step(s, { type: "water", index: i });
      }
    }
    s = step(s, { type: "next" });
  }
  return s;
}
for (const scenario of ["gentle", "dry", "rain"])
  test(`${scenario}: repeated radish strategy survives and beats doing nothing`, () => {
    const result = radishStrategy(scenario);
    assert.ok(result.harvests >= 9);
    assert.equal(result.dead, 0);
    assert.ok(score(result) > score(createGame(scenario)));
    assert.deepEqual(result, radishStrategy(scenario));
  });
test("default companion layout yields a pollinated tomato harvest", () => {
  let s = plant(createGame(), "tomato", 1);
  s = plant(s, "flower", 5);
  s = plant(s, "basil", 0);
  for (let d = 1; d <= 12; d++) {
    for (const i of [0, 1, 5]) {
      const p = s.plots[i];
      if (p && p.moisture < 2 && s.water > 0)
        s = step(s, { type: "water", index: i });
    }
    if (s.plots[1]?.age >= 5) {
      assert.ok(s.plots[1].bonus > 0);
      const before = s.money;
      s = step(s, { type: "harvest", index: 1 });
      assert.ok(s.money > before + 26);
      return;
    }
    s = step(s, { type: "next" });
  }
  assert.fail("Tomato should mature with a flower bonus");
});
