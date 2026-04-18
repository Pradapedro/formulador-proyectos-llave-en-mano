import { calculateProject } from "./calculate";
import { scoreScenario } from "./score";

function cloneProject(project) {
  return JSON.parse(JSON.stringify(project));
}

function scenarioAction(key, label, mutate) {
  return { key, label, mutate };
}

function getAvailableActions(project) {
  return [
    scenarioAction("fv_75", "Reducir cobertura FV al 75%", (p) => {
      if (p.fvType !== "No aplica" && p.fvCoverage > 75) p.fvCoverage = 75;
      return p;
    }),
    scenarioAction("fv_50", "Reducir cobertura FV al 50%", (p) => {
      if (p.fvType !== "No aplica" && p.fvCoverage > 50) p.fvCoverage = 50;
      return p;
    }),
    scenarioAction("fv_25", "Reducir cobertura FV al 25%", (p) => {
      if (p.fvType !== "No aplica" && p.fvCoverage > 25) p.fvCoverage = 25;
      return p;
    }),
    scenarioAction("remove_fv", "Excluir sistema fotovoltaico", (p) => {
      p.fvType = "No aplica";
      p.fvCoverage = 0;
      return p;
    }),
    scenarioAction("urban_75", "Reducir urbanismo al 75%", (p) => {
      p.urbanArea = p.urbanArea * 0.75;
      return p;
    }),
    scenarioAction("urban_50", "Reducir urbanismo al 50%", (p) => {
      p.urbanArea = p.urbanArea * 0.5;
      return p;
    }),
    scenarioAction("urban_25", "Reducir urbanismo al 25%", (p) => {
      p.urbanArea = p.urbanArea * 0.25;
      return p;
    }),
    scenarioAction("remove_urban", "Excluir urbanismo", (p) => {
      p.urbanArea = 0;
      return p;
    }),
  ].filter((a) => {
    if (a.key.startsWith("fv") || a.key === "remove_fv") {
      return project.fvType !== "No aplica" && project.fvCoverage > 0;
    }
    if (a.key.startsWith("urban") || a.key === "remove_urban") {
      return project.urbanArea > 0;
    }
    return true;
  });
}

function applyActions(project, actions) {
  return actions.reduce((acc, action) => action.mutate(acc), cloneProject(project));
}

function combinations(actions) {
  const result = [[]];
  for (const action of actions) {
    const copy = result.map((r) => [...r, action]);
    result.push(...copy);
  }
  return result.filter((group) => group.length > 0);
}

export function optimizeProject(baseResult) {
  const baseProject = baseResult.input;
  const valueCap = baseProject.valueCap || 0;

  if (!(valueCap > 0) || baseResult.cap.capCompliance === true) {
    return {
      triggered: false,
      base: baseResult,
      scenarios: [],
      selected: baseResult,
    };
  }

  const actions = getAvailableActions(baseProject);

  const rawCombinations = combinations(actions).filter((group) => {
    const keys = group.map((g) => g.key);

    const hasRemoveFv = keys.includes("remove_fv");
    const hasFvReduction = keys.some((k) => k.startsWith("fv_"));
    if (hasRemoveFv && hasFvReduction) return false;

    const urbanKeys = keys.filter((k) => k.startsWith("urban_") || k === "remove_urban");
    if (urbanKeys.length > 1) return false;

    const fvKeys = keys.filter((k) => k.startsWith("fv_"));
    if (fvKeys.length > 1) return false;

    return true;
  });

  const scenarios = rawCombinations.map((group) => {
    const modifiedProject = applyActions(baseProject, group);
    const result = calculateProject(modifiedProject);

    return {
      key: group.map((g) => g.key).join("+"),
      label: group.map((g) => g.label).join(" + "),
      actions: group.map((g) => ({ key: g.key, label: g.label })),
      result,
      score: scoreScenario(baseResult, result),
    };
  });

  const compliant = scenarios
    .filter((s) => s.result.cap.capCompliance === true)
    .sort((a, b) => b.score - a.score);

  const selected =
    compliant[0]?.result ||
    scenarios.sort((a, b) => a.result.totals.totalProject - b.result.totals.totalProject)[0]?.result ||
    baseResult;

  return {
    triggered: true,
    base: baseResult,
    scenarios,
    selected,
  };
}