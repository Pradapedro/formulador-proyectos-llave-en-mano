import { MODEL_PARAMETERS } from "../../data/constants";
import { roundCOP } from "./normalize";

function getStudiesM2(zone) {
  return MODEL_PARAMETERS.studiesByZone?.[zone] || 0;
}

function getInterventoriaEyD(zone) {
  return MODEL_PARAMETERS.interventoriaEyDByZone?.[zone] || 0;
}

function getInterventoriaObra(zone) {
  return MODEL_PARAMETERS.interventoriaObraByZone?.[zone] || 0;
}

function getConstructionM2(intervention, typology, region) {
  return MODEL_PARAMETERS.constructionTables?.[intervention]?.[typology]?.[region] || 0;
}

function getUrbanismM2(region) {
  return MODEL_PARAMETERS.urbanismByRegion?.[region] || 0;
}

function getInfraM2(infraType) {
  return MODEL_PARAMETERS.infraValues?.[infraType] || 0;
}

function getFvM2(zone, fvType) {
  return MODEL_PARAMETERS.fvValues?.[zone]?.[fvType] || 0;
}

function getLogisticPercent(segments = []) {
  const coeffs = MODEL_PARAMETERS.logisticCoefficients || {};
  return segments.reduce((acc, seg) => {
    const coef = coeffs?.[seg.mode] || 0;
    return acc + coef * seg.distance;
  }, 0);
}

export function calculateProject(project) {
  const studiesM2 = getStudiesM2(project.zone);
  const interventoriaEyDPercent = getInterventoriaEyD(project.zone);
  const interventoriaObraPercent = getInterventoriaObra(project.zone);
  const constructionM2 = getConstructionM2(project.intervention, project.typology, project.region);
  const urbanismM2 = getUrbanismM2(project.region);
  const infraM2 = getInfraM2(project.infraType);
  const fvBaseM2 = getFvM2(project.zone, project.fvType);
  const logisticPercent = project.logisticApplies === "Sí" ? getLogisticPercent(project.segments) : 0;

  const studies = roundCOP(project.area * studiesM2);
  const interventoriaEyD = roundCOP(studies * interventoriaEyDPercent);

  const construction = roundCOP(project.area * constructionM2);
  const urbanism = roundCOP(project.urbanArea * urbanismM2);
  const infra = roundCOP(project.infraArea * infraM2);
  const fv = roundCOP(project.area * (fvBaseM2 * (project.fvCoverage / 100)));

  const constructionSubtotal = roundCOP(construction + urbanism + infra + fv);
  const interventoriaObra = roundCOP(constructionSubtotal * interventoriaObraPercent);
  const logisticOvercost = roundCOP(constructionSubtotal * logisticPercent);

  const totalConsulting = roundCOP(studies + interventoriaEyD);
  const totalConstruction = roundCOP(constructionSubtotal);
  const totalConstructionPlusInterventoria = roundCOP(constructionSubtotal + interventoriaObra);
  const totalProject = roundCOP(
    studies + interventoriaEyD + constructionSubtotal + interventoriaObra + logisticOvercost
  );
  const projectM2 = project.area > 0 ? roundCOP(totalProject / project.area) : 0;

  const lineItems = [
    {
      concept: "Estudios y diseños",
      percent: null,
      valueM2: studiesM2,
      area: project.area,
      total: studies,
    },
    {
      concept: "Interventoría estudios y diseños",
      percent: interventoriaEyDPercent,
      valueM2: null,
      area: null,
      total: interventoriaEyD,
    },
    {
      concept: "Construcción",
      percent: null,
      valueM2: constructionM2,
      area: project.area,
      total: construction,
    },
    {
      concept: "Urbanismo",
      percent: null,
      valueM2: urbanismM2,
      area: project.urbanArea,
      total: urbanism,
    },
    {
      concept: "Infraestructura complementaria",
      percent: null,
      valueM2: infraM2,
      area: project.infraArea,
      total: infra,
    },
    {
      concept: "Sistema fotovoltaico",
      percent: project.fvCoverage / 100,
      valueM2: fvBaseM2,
      area: project.area,
      total: fv,
    },
    {
      concept: "Interventoría de obra",
      percent: interventoriaObraPercent,
      valueM2: null,
      area: null,
      total: interventoriaObra,
    },
    {
      concept: "Sobrecosto logístico",
      percent: logisticPercent,
      valueM2: null,
      area: null,
      total: logisticOvercost,
    },
  ];

  return {
    input: project,
    unitValues: {
      studiesM2,
      constructionM2,
      urbanismM2,
      infraM2,
      fvBaseM2,
      interventoriaEyDPercent,
      interventoriaObraPercent,
      logisticPercent,
    },
    lineItems,
    totals: {
      studies,
      interventoriaEyD,
      construction,
      urbanism,
      infra,
      fv,
      constructionSubtotal,
      interventoriaObra,
      logisticOvercost,
      totalConsulting,
      totalConstruction,
      totalConstructionPlusInterventoria,
      totalProject,
      projectM2,
    },
    cap: {
      valueCap: project.valueCap || 0,
      capDifference: roundCOP((project.valueCap || 0) - totalProject),
      capCompliance: project.valueCap > 0 ? totalProject <= project.valueCap : null,
    },
  };
}