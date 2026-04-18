export function scoreScenario(baseResult, scenarioResult) {
  const base = baseResult.totals;
  const current = scenarioResult.totals;

  const complies = scenarioResult.cap.capCompliance === true;

  let score = 0;

  if (complies) score += 1000;

  const deltaCost = Math.max(0, base.totalProject - current.totalProject);
  score += Math.min(300, deltaCost / 1000000);

  if (base.fv > 0 && current.fv > 0) score += 100;
  if (base.urbanism > 0 && current.urbanism > 0) score += 100;

  const variationRatio =
    base.totalProject > 0 ? Math.abs(base.totalProject - current.totalProject) / base.totalProject : 0;

  score -= variationRatio * 200;

  return Math.round(score);
}