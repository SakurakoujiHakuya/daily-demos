// SVG paints later siblings on top. Keep the current target last and suppress
// other labels near its capture circle, without changing any game mechanics.
export function targetLayers(targets, activeIndex) {
  const active = targets[activeIndex];
  return targets.map((target, index) => ({
    target, index,
    showLabel: index === activeIndex || !active || Math.hypot(target.x-active.x,target.y-active.y)>13
  })).sort((a,b) => Number(a.index===activeIndex)-Number(b.index===activeIndex));
}
