import { normalizeProjectInput } from "../engine/normalize";
import { validateProjectInput } from "../engine/validate";
import { calculateProject } from "../engine/calculate";
import { optimizeProject } from "../engine/optimize";

export function buildProjectStudy(form, segments = []) {
  const normalized = normalizeProjectInput(form, segments);
  const validation = validateProjectInput(normalized);

  if (!validation.isValid) {
    return {
      ok: false,
      stage: "validation",
      normalized,
      validation,
      result: null,
      optimization: null,
    };
  }

  const baseResult = calculateProject(normalized);
  const optimization = optimizeProject(baseResult);

  return {
    ok: true,
    stage: "done",
    normalized,
    validation,
    result: baseResult,
    optimization,
  };
}