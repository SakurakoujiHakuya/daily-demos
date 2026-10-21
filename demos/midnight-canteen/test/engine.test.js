import test from "node:test";
import assert from "node:assert/strict";
import {
  INGREDIENTS as I,
  RECIPES as R,
  createGame,
  forecast,
  price,
  buy,
  toggleMenu,
  setMarkup,
  openNight,
  identifyDish,
  cook,
  skipGuest,
  closeNight,
  nextNight,
  ending,
  hashSeed,
} from "../src/engine.js";
function stocked(seed = "test") {
  let s = createGame(seed);
  s.cash = 1000;
  for (const k of Object.keys(I)) s = buy(s, k, 10);
  return s;
}
function perfectNight(s) {
  s = openNight(s);
  while (s.phase === "kitchen") {
    const r = R.find((r) => r.id === s.guests[s.cursor].order);
    for (const k of r.items)
      if (!s.stock[k]) throw new Error("missing inventory");
    s = cook(s, r.items, r.method);
  }
  return closeNight(s);
}
test("new game has 80 cash, 7-night state and independent inventory", () => {
  const a = createGame(),
    b = createGame();
  a.stock.rice = 8;
  assert.equal(b.stock.rice, 0);
  assert.equal(b.cash, 80);
  assert.equal(b.phase, "market");
  assert.equal(b.day, 1);
});
test("same seed forecasts and hash are deterministic", () => {
  assert.deepEqual(forecast(createGame("雨")), forecast(createGame("雨")));
  assert.equal(hashSeed("same"), hashSeed("same"));
});
test("different seeds explore different forecasts", () => {
  assert.notDeepEqual(forecast(createGame("雨")), forecast(createGame("森林")));
});
test("purchase is immutable and debits actual daily price", () => {
  const a = createGame(),
    b = buy(a, "tomato", 2);
  assert.equal(a.stock.tomato, 0);
  assert.equal(b.cash, 80 - price(a, "tomato") * 2);
  assert.equal(b.stock.tomato, 2);
});
test("overspending, invalid ingredient, fractions and excessive stock are rejected", () => {
  const s = createGame();
  for (const [k, q] of [
    ["mushroom", 30],
    ["rice", 1.2],
    ["bogus", 1],
    ["rice", 0],
  ])
    assert.equal(buy(s, k, q).cash, 80);
});
test("refund restores money and cannot refund unowned units", () => {
  let s = createGame();
  const original = s.cash;
  s = buy(s, "egg", 2);
  s = buy(s, "egg", -2);
  assert.equal(s.cash, original);
  assert.equal(buy(s, "egg", -1).stock.egg, 0);
});
test("menu requires one to three valid recipes", () => {
  let s = createGame();
  assert.equal(toggleMenu(s, "forest").menu.length, 3);
  s = toggleMenu(s, "red");
  s = toggleMenu(s, "garden");
  assert.equal(toggleMenu(s, "sunrise").menu.length, 1);
  assert.deepEqual(toggleMenu(s, "bogus").menu, s.menu);
});
test("valid pricing only, locked after opening", () => {
  let s = setMarkup(createGame(), 4);
  assert.equal(s.markup, 4);
  assert.equal(setMarkup(s, 8).markup, 4);
  s = openNight(s);
  assert.equal(setMarkup(s, 0).markup, 4);
  assert.equal(buy(s, "rice").stock.rice, 0);
});
test("guests select only menu dishes and prioritize taste", () => {
  const s = openNight(createGame());
  for (const g of s.guests) {
    assert.ok(s.menu.includes(g.order));
    assert.equal(R.find((r) => r.id === g.order).tag, g.tag);
  }
});
test("recipe matching ignores ingredient order but requires correct method", () => {
  assert.equal(identifyDish(["egg", "rice"], "fry").id, "sunrise");
  assert.equal(identifyDish(["rice", "egg"], "steam"), null);
  assert.equal(identifyDish(["rice", "rice"], "fry"), null);
});
test("correct plate consumes stock pays once and advances guest", () => {
  let s = openNight(stocked());
  const g = s.guests[0],
    r = R.find((r) => r.id === g.order),
    cash = s.cash;
  s = cook(s, r.items, r.method);
  assert.equal(s.cursor, 1);
  assert.equal(s.served, 1);
  assert.equal(s.cash, cash + r.price);
  for (const k of r.items) assert.equal(s.stock[k], 9);
});
test("incomplete or unavailable plate does not consume or advance", () => {
  const s = openNight(createGame());
  for (const items of [[], ["egg"], ["egg", "rice"]]) {
    const n = cook(s, items, "fry");
    assert.equal(n.cash, s.cash);
    assert.equal(n.cursor, 0);
    assert.deepEqual(n.stock, s.stock);
  }
});
test("failed cooking consumes stock and reputation but guest stays", () => {
  let s = openNight(stocked());
  s = cook(s, ["rice", "rice"], "steam");
  assert.equal(s.stock.rice, 8);
  assert.equal(s.waste, 2);
  assert.equal(s.cursor, 0);
  assert.equal(s.reputation, 47);
});
test("duplicate ingredient requires two actual portions", () => {
  let s = buy(createGame(), "rice");
  s = openNight(s);
  const n = cook(s, ["rice", "rice"], "fry");
  assert.equal(n.stock.rice, 1);
  assert.equal(n.waste, 0);
});
test("over-budget price can reduce reputation despite a correct dish", () => {
  let s = openNight(setMarkup(stocked(), 4));
  s.guests[0] = { ...s.guests[0], budget: 10, order: "sunrise", tag: "饱腹" };
  const n = cook(s, ["rice", "egg"], "fry");
  assert.equal(n.history[0].satisfaction, 0);
  assert.equal(n.reputation, 47);
  assert.equal(n.cash - s.cash, 17);
});
test("alternative known dish still pays with less satisfaction", () => {
  let s = openNight(stocked());
  s.guests[0] = { ...s.guests[0], order: "garden", tag: "素食", budget: 20 };
  const n = cook(s, ["rice", "egg"], "fry");
  assert.equal(n.history[0].satisfaction, 1);
  assert.equal(n.served, 1);
});
test("skip all closes queue; repeated skip cannot advance terminal queue", () => {
  let s = openNight(createGame());
  const len = s.guests.length;
  while (s.phase === "kitchen") s = skipGuest(s);
  assert.equal(s.cursor, len);
  assert.equal(s.lost, len);
  assert.equal(skipGuest(s).cursor, len);
  assert.equal(s.phase, "closing");
});
test("closing deducts rent and spoils fresh but preserves dry food", () => {
  let s = openNight(stocked());
  while (s.phase === "kitchen") s = skipGuest(s);
  const cash = s.cash;
  s = closeNight(s);
  assert.equal(s.cash, cash - 12);
  assert.equal(s.stock.rice, 10);
  assert.equal(s.stock.noodle, 10);
  assert.equal(s.stock.egg, 0);
  assert.equal(s.waste, 40);
  assert.equal(s.phase, "summary");
});
test("next night resets only nightly counters and preserves score", () => {
  let s = perfectNight(stocked());
  const served = s.served;
  const n = nextNight(s);
  assert.equal(n.day, 2);
  assert.equal(n.served, served);
  assert.equal(n.phase, "market");
  assert.equal(n.night.revenue, 0);
  assert.equal(n.guests.length, 0);
});
test("premature close and next night cannot skip service", () => {
  const s = createGame();
  assert.equal(closeNight(s).day, 1);
  assert.equal(nextNight(s).day, 1);
  assert.equal(nextNight(s).phase, "market");
});
test("full seven-night game ends deterministically and cannot advance", () => {
  function play() {
    let s = createGame("seven");
    for (let day = 1; day <= 7; day++) {
      const preview = openNight(s);
      const need = {};
      for (const g of preview.guests)
        for (const k of R.find((r) => r.id === g.order).items)
          need[k] = (need[k] || 0) + 1;
      for (const [k, n] of Object.entries(need))
        if (n > s.stock[k]) s = buy(s, k, n - s.stock[k]);
      s = perfectNight(s);
      if (day < 7) s = nextNight(s);
    }
    return s;
  }
  const a = play();
  assert.equal(a.phase, "end");
  assert.equal(a.day, 7);
  assert.deepEqual(a, play());
  assert.equal(nextNight(a).day, 7);
  assert.ok(a.served >= 35);
  assert.equal(a.waste, 0);
  assert.ok(a.cash > 80);
  assert.equal(ending(a).title, "一条街的晚安");
});
test("bankruptcy ends after rent with distinct ending", () => {
  let s = openNight(createGame());
  s.cash = 0;
  while (s.phase === "kitchen") s = skipGuest(s);
  s = closeNight(s);
  assert.equal(s.phase, "end");
  assert.equal(ending(s).title, "暂时熄灯");
});
test("reputation remains bounded on repeated waste or service", () => {
  let s = openNight(stocked());
  s.reputation = 1;
  s = cook(s, ["rice", "rice"], "steam");
  assert.equal(s.reputation, 0);
  s.reputation = 100;
  s.guests[0] = { ...s.guests[0], order: "sunrise", tag: "饱腹", budget: 30 };
  s = cook(s, ["rice", "egg"], "fry");
  assert.equal(s.reputation, 100);
});
test("reset by same seed restores original state not progress", () => {
  let s = buy(createGame("重来"), "rice", 4);
  s = openNight(s);
  assert.deepEqual(createGame(s.seed), createGame("重来"));
  assert.equal(createGame(s.seed).stock.rice, 0);
});
test("endings distinguish reputation, profit and ordinary survival", () => {
  const base = createGame();
  assert.equal(
    ending({ ...base, cash: 250, reputation: 60 }).title,
    "小店的大账本",
  );
  assert.equal(
    ending({ ...base, cash: 100, reputation: 75, waste: 20 }).title,
    "有人为你留灯",
  );
  assert.equal(
    ending({ ...base, cash: 90, reputation: 50, waste: 20 }).title,
    "仍然温热的开始",
  );
});
test("repeated close cannot charge rent twice", () => {
  let s = openNight(createGame());
  while (s.phase === "kitchen") s = skipGuest(s);
  s = closeNight(s);
  assert.equal(closeNight(s).cash, s.cash);
});
