import { MODEL_PARAMETERS } from "../../data/constants";

export function parseNumber(value) {
  if (value === null || value === undefined || value === "") return null;

  const normalized = String(value)
    .replace(/\$/g, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function roundCOP(value) {
  return Math.round(Number(value || 0));
}

export function normalizeTypology(typology) {
  if (typology === "Hospital Nivel I" || typology === "Hospital Nivel II") {
    return "Hospital mediana complejidad (I–II)";
  }
  if (typology === "Hospital Nivel III") {
    return "Hospital alta complejidad (III)";
  }
  return typology;
}

export function getRegionByDepartment(department) {
  return MODEL_PARAMETERS.regionsByDepartment?.[department] || null;
}

export function getZoneByDepartment(department) {
  return MODEL_PARAMETERS.zonesByDepartment?.[department] || null;
}

export function normalizeSegments(segments = []) {
  return segments.map((seg) => ({
    mode: seg?.mode || null,
    distance: parseNumber(seg?.distance) || 0,
  }));
}

export function normalizeProjectInput(form, segments = []) {
  const normalizedTypology = normalizeTypology(form.typology);
  const region = getRegionByDepartment(form.department);
  const zone = form.manualZone || getZoneByDepartment(form.department);

  return {
    projectName: String(form.projectName || "").trim(),
    department: form.department || null,
    municipality: String(form.municipality || "").trim(),
    intervention: form.intervention || null,
    typology: normalizedTypology || null,
    originalTypology: form.typology || null,

    area: parseNumber(form.area),
    urbanArea: parseNumber(form.urbanArea) || 0,
    infraArea: parseNumber(form.infraArea) || 0,
    fvCoverage: parseNumber(form.fvCoverage) || 0,
    valueCap: parseNumber(form.valueCap) || 0,

    infraType: form.infraType || "No aplica",
    fvType: form.fvType || "No aplica",
    logisticApplies: form.logisticApplies || "No",
    manualZone: form.manualZone || null,

    region,
    zone,
    segments: normalizeSegments(segments),
  };
}