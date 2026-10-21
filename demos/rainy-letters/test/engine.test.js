import test from "node:test";
import assert from "node:assert/strict";
import {
  createState,
  hear,
  investigate,
  link,
  supported,
  assess,
  submit,
  conclude,
  clues,
  witnesses,
  contradictionStatus,
  resolvedCount,
} from "../engine.js";
function solve(ids = ["power", "loan", "receipt"]) {
  const s = createState();
  const route = [...ids];
  if (
    !(route.includes("ledger") && route.includes("clock")) &&
    !route.includes("power")
  )
    route.push("power");
  if (!route.includes("loan")) route.push("loan");
  if (!route.includes("proof") && !route.includes("letter"))
    route.push("letter");
  for (const id of route) {
    investigate(s, id);
    for (const claim of clues.find((c) => c.id === id).supports)
      link(s, id, claim);
  }
  witnesses.forEach((w) => hear(s, w.id));
  s.resolutions.permission = {
    answer: "scope",
    evidence: ["loan", s.visited.includes("proof") ? "proof" : "letter"],
  };
  if (s.visited.includes("power"))
    s.resolutions.blackout = { answer: "during", evidence: ["power"] };
  else
    s.resolutions.clockcase = { answer: "fast", evidence: ["ledger", "clock"] };
  s.answers = { who: "lin", when: "21:10", why: "consent" };
  return s;
}

test("new case starts with six investigations and no evidence", () => {
  const s = createState();
  assert.equal(s.budget, 6);
  assert.deepEqual(s.visited, []);
  assert.equal(s.ending, null);
});
test("five distinct witnesses can be heard without budget cost", () => {
  const s = createState();
  witnesses.forEach((w) => hear(s, w.id));
  hear(s, "lin");
  assert.equal(s.heard.length, 5);
  assert.equal(s.budget, 6);
  assert.equal(hear(s, "unknown"), false);
});
test("investigation consumes one unit and revisits are free", () => {
  const s = createState();
  assert.equal(investigate(s, "clock").ok, true);
  assert.equal(s.budget, 5);
  assert.equal(investigate(s, "clock").revisit, true);
  assert.equal(s.budget, 5);
});
test("budget cannot go negative or unlock seventh clue", () => {
  const s = createState();
  clues.slice(0, 6).forEach((c) => investigate(s, c.id));
  assert.equal(investigate(s, "receipt").ok, false);
  assert.equal(s.budget, 0);
  assert.equal(s.visited.length, 6);
  assert.equal(investigate(s, "clock").ok, true);
});
test("unknown clues do not consume time", () => {
  const s = createState();
  assert.equal(investigate(s, "secret").ok, false);
  assert.equal(s.budget, 6);
});
test("unseen clue and unknown claim cannot be linked", () => {
  const s = createState();
  assert.equal(link(s, "power", "time"), false);
  investigate(s, "power");
  assert.equal(link(s, "power", "unknown"), false);
  assert.equal(s.links.length, 0);
});
test("links are toggled, not duplicated", () => {
  const s = createState();
  investigate(s, "power");
  assert.equal(link(s, "power", "time"), true);
  assert.equal(supported(s, "time"), true);
  assert.equal(link(s, "power", "time"), false);
  assert.equal(s.links.length, 0);
});
test("reading alone does not count as proof", () => {
  const s = createState();
  ["power", "loan"].forEach((id) => investigate(s, id));
  s.answers = { who: "lin", when: "21:10", why: "consent" };
  assert.equal(assess(s).ready, false);
});
test("direct precise records solve the case", () => {
  const s = solve();
  assert.equal(submit(s).ready, true);
  assert.equal(assess(s).preserved, true);
});
test("alternate clock correction route solves without power or tram", () => {
  const s = solve(["ledger", "clock", "loan"]);
  assert.equal(assess(s).ready, true);
  assert.equal(assess(s).preserved, false);
});
test("tram route solves without mechanical clock", () => {
  const s = solve(["tram", "proof"]);
  assert.equal(assess(s).ready, true);
});
test("21:20 contradiction fails despite evidence", () => {
  const s = solve();
  s.answers.when = "21:20";
  assert.equal(assess(s).factual.when, false);
  assert.equal(assess(s).ready, false);
});
test("false motive and wrong actor each fail", () => {
  const s = solve();
  s.answers.why = "profit";
  assert.equal(assess(s).ready, false);
  s.answers.why = "consent";
  s.answers.who = "qiao";
  assert.equal(assess(s).ready, false);
});
test("unsupported links invalidate a correct reconstruction", () => {
  const s = solve();
  link(s, "loan", "time");
  assert.deepEqual(assess(s).unsupported, ["loan:time"]);
  assert.equal(assess(s).ready, false);
  link(s, "loan", "time");
  assert.equal(assess(s).ready, true);
});
test("blank submission is not an attempt", () => {
  const s = createState();
  assert.equal(submit(s).ok, false);
  assert.equal(s.attempts, 0);
});
test("reconstruction retries cost no investigation budget", () => {
  const s = solve();
  const before = s.budget;
  submit(s);
  submit(s);
  assert.equal(s.attempts, 2);
  assert.equal(s.budget, before);
});
test("conclusion requires prior checked reconstruction", () => {
  const s = solve();
  assert.equal(conclude(s, "private"), false);
  submit(s);
  assert.equal(conclude(s, "private"), "shelter");
});
test("intact proof changes private ending from pause to shelter", () => {
  const s = solve(["power", "loan"]);
  submit(s);
  assert.equal(conclude(s, "private"), "pause");
});
test("public choice produces headline ending", () => {
  const s = solve();
  submit(s);
  assert.equal(conclude(s, "public"), "headline");
});
test("ending cannot be changed and investigation is closed", () => {
  const s = solve();
  submit(s);
  conclude(s, "private");
  assert.equal(conclude(s, "public"), false);
  assert.equal(investigate(s, "clock").ok, false);
  assert.equal(link(s, "power", "time"), false);
  assert.equal(submit(s).ok, false);
});
test("replay creates fully independent clean route", () => {
  const a = solve();
  submit(a);
  conclude(a, "private");
  const b = createState();
  assert.equal(b.budget, 6);
  assert.deepEqual(b.links, []);
  assert.deepEqual(b.answers, { who: "", when: "", why: "" });
  assert.equal(b.ending, null);
  assert.equal(a.ending, "shelter");
});
test("at least two distinct six-clue routes can solve", () => {
  const a = solve(["ledger", "clock", "loan", "letter", "receipt", "proof"]);
  const b = solve(["tram", "power", "loan", "proof", "letter", "receipt"]);
  assert.equal(a.budget, 0);
  assert.equal(b.budget, 0);
  assert.equal(assess(a).ready, true);
  assert.equal(assess(b).ready, true);
});

test("planned preservation cannot prove present condition", () => {
  const s = solve(["tram", "proof", "letter"]);
  assert.equal(assess(s).ready, true);
  assert.equal(assess(s).preserved, false);
  link(s, "proof", "intact");
  assert.equal(assess(s).ready, false);
});

test("correct reconstruction without contradiction explanations cannot conclude", () => {
  const s = solve();
  s.resolutions = {};
  assert.equal(assess(s).ready, false);
  submit(s);
  assert.equal(conclude(s, "private"), false);
});
test("two independent causal explanations unlock conclusion", () => {
  const s = solve();
  assert.equal(resolvedCount(s), 2);
  assert.equal(contradictionStatus(s, "blackout").ready, true);
  assert.equal(contradictionStatus(s, "permission").ready, true);
});
test("wrong causal explanation fails even with correct evidence", () => {
  const s = solve();
  s.resolutions.blackout.answer = "after";
  assert.equal(contradictionStatus(s, "blackout").ready, false);
  assert.equal(assess(s).ready, false);
});
test("missing paired evidence fails permission contradiction", () => {
  const s = solve();
  s.resolutions.permission.evidence = ["loan"];
  assert.equal(contradictionStatus(s, "permission").ready, false);
});
test("unrelated extra paired evidence cannot shotgun explanation", () => {
  const s = solve();
  s.resolutions.permission.evidence.push("receipt");
  assert.equal(contradictionStatus(s, "permission").ready, false);
});
test("both original witnesses must be heard", () => {
  const s = solve();
  s.heard = s.heard.filter((x) => x !== "lin");
  assert.equal(resolvedCount(s), 0);
  assert.equal(assess(s).ready, false);
});
test("clock discrepancy has a separate causal paired route", () => {
  const s = solve(["ledger", "clock", "loan", "letter"]);
  assert.equal(contradictionStatus(s, "clockcase").ready, true);
  assert.equal(resolvedCount(s), 2);
  assert.equal(s.budget, 2);
  assert.equal(assess(s).ready, true);
});
test("full protected ending remains solvable within budget", () => {
  const s = solve(["power", "loan", "letter", "receipt"]);
  assert.equal(s.budget, 2);
  assert.equal(submit(s).ready, true);
  assert.equal(conclude(s, "private"), "shelter");
});
