import {
  regionByDepartment,
  zoneByDepartment,
  studiesByZone,
  interventoriaEyDByZone,
  interventoriaObraByZone,
  urbanismByRegion,
  infraValues,
  fvValues,
  constructionTables,
  logisticCoefficients
} from "../data/constants";

function toNumber(value) {
  const normalized = String(value ?? "")
    .replace(/\$/g, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function roundCOP(value) {
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

function getRegion(department) {
  return regionByDepartment?.[department] || null;
}

function getZone(department, manualZone) {
  if (manualZone) return manualZone;
  return zoneByDepartment?.[department] || null;
}

function getStudiesM2(zone) {
  return studiesByZone?.[zone] || 0;
}

function getConstructionM2(intervention, typology, region) {
  const normalizedTypology = normalizeTypology(typology);
  return constructionTables?.[intervention]?.[normalizedTypology]?.[region] || 0;
}

function getUrbanismM2(region) {
  return urbanismByRegion?.[region] || 0;
}

function getInfraM2(infraType) {
  return infraValues?.[infraType] || 0;
}

function getFvBaseM2(zone, fvType) {
  return fvValues?.[zone]?.[fvType] || 0;
}

function calculateLogistic(segments = [], logisticApplies = "No") {
  if (logisticApplies !== "Sí") {
    return {
      logisticPct: 0,
      segmentResults: []
    };
  }

  const segmentResults = segments.map((seg) => {
    const mode = seg?.mode || "Mular";
    const distance = toNumber(seg?.distance);
    const coefficient = logisticCoefficients?.[mode] || 0;
    const pct = coefficient * distance;

    return {
      mode,
      distance,
      coefficient,
      pct
    };
  });

  const logisticPct = segmentResults.reduce((acc, item) => acc + item.pct, 0);

  return {
    logisticPct,
    segmentResults
  };
}

const STUDIES_M2_FLOOR_BY_ZONE = {
  Z1: 160000,
  Z2: 180000,
  Z2G: 210000,
  Z3: 250000
};

const MIN_INTERVENTORIA_PERCENT = 0.04;
const INTERVENTORIA_STEP = 0.005;
const URBANISM_FACTORS = [0.75, 0.5, 0.25, 0];
const FV_COVERAGE_STEPS = [80, 70, 60, 50, 40, 30, 20, 10, 0];

function calculateCore(form, segments = [], overrides = {}) {
  const area = toNumber(overrides.area ?? form?.area);
  const urbanArea = toNumber(overrides.urbanArea ?? form?.urbanArea);
  const infraArea = toNumber(overrides.infraArea ?? form?.infraArea);
  const fvCoverage = toNumber(overrides.fvCoverage ?? form?.fvCoverage);
  const valueCap = toNumber(form?.valueCap);

  const normalizedTypology = normalizeTypology(form?.typology);
  const region = getRegion(form?.department);
  const zone = getZone(form?.department, form?.manualZone);

  const studiesM2 = toNumber(
    overrides.studiesM2 !== undefined ? overrides.studiesM2 : getStudiesM2(zone)
  );

  const pctEyD =
    overrides.pctEyD !== undefined
      ? Number(overrides.pctEyD)
      : Number(interventoriaEyDByZone?.[zone] || 0);

  const pctObra =
    overrides.pctObra !== undefined
      ? Number(overrides.pctObra)
      : Number(interventoriaObraByZone?.[zone] || 0);

  const constructionM2 = getConstructionM2(
    form?.intervention,
    normalizedTypology,
    region
  );

  const urbanismM2 = getUrbanismM2(region);
  const infraM2 = getInfraM2(form?.infraType);
  const fvM2Base = getFvBaseM2(zone, form?.fvType);

  const fvM2 =
    form?.fvType === "No aplica"
      ? 0
      : fvM2Base * (fvCoverage / 100);

  const studies = roundCOP(area * studiesM2);
  const interventoriaEyD = roundCOP(studies * pctEyD);

  const construction = roundCOP(area * constructionM2);
  const urbanism = roundCOP(urbanArea * urbanismM2);
  const infra = roundCOP(infraArea * infraM2);
  const fv = roundCOP(area * fvM2);

  const subtotalConstructivo = roundCOP(construction + urbanism + infra + fv);
  const interventoriaObra = roundCOP(subtotalConstructivo * pctObra);

  const { logisticPct, segmentResults } = calculateLogistic(
    segments,
    form?.logisticApplies
  );

  const logisticCost = roundCOP(subtotalConstructivo * logisticPct);

  const totalConsulting = roundCOP(studies + interventoriaEyD);
  const totalConstruction = roundCOP(subtotalConstructivo);
  const totalConstructionPlusInterventoria = roundCOP(
    subtotalConstructivo + interventoriaObra
  );

  const totalProject = roundCOP(
    studies +
      interventoriaEyD +
      subtotalConstructivo +
      interventoriaObra +
      logisticCost
  );

  const valueM2Project = area > 0 ? roundCOP(totalProject / area) : 0;

  const hasValueCap = valueCap > 0;
  const capDifference = hasValueCap ? roundCOP(valueCap - totalProject) : 0;
  const exceedsCap = hasValueCap ? totalProject > valueCap : false;
  const capCompliance = hasValueCap ? !exceedsCap : null;

  return {
    region,
    zone,
    area,
    urbanArea,
    infraArea,
    fvCoverage,
    valueCap,

    hasValueCap,
    capDifference,
    exceedsCap,
    capCompliance,

    normalizedTypology,

    studiesM2,
    studies,

    pctEyD,
    interventoriaEyD,

    constructionM2,
    construction,

    urbanismM2,
    urbanism,

    infraM2,
    infra,

    fvM2Base,
    fvM2,
    fv,

    pctObra,
    interventoriaObra,

    subtotalConstructivo,
    totalConsulting,
    totalConstruction,
    totalConstructionPlusInterventoria,

    logisticPct,
    logisticCost,
    totalProject,
    valueM2Project,
    segmentResults,

    overridesUsed: {
      studiesM2,
      pctEyD,
      pctObra,
      area,
      urbanArea,
      fvCoverage
    }
  };
}

function buildScenarioSnapshot(id, title, calc, formState, adjustments) {
  return {
    id: String(id),
    title,
    calc,
    form: { ...formState },
    adjustments: [...adjustments],
    savings: 0,
    compliesCap: calc.capCompliance === true,
    exceedsCap: calc.exceedsCap
  };
}

function buildOptimization(baseForm, baseCalc, segments = []) {
  if (!baseCalc.hasValueCap || !baseCalc.exceedsCap) {
    return {
      applied: false,
      base: baseCalc,
      optimized: null,
      optimizedForm: null,
      adjustments: [],
      savings: 0,
      scenarios: []
    };
  }

  const workingForm = {
    ...baseForm,
    area: String(toNumber(baseForm.area)),
    urbanArea: String(toNumber(baseForm.urbanArea)),
    infraArea: String(toNumber(baseForm.infraArea)),
    fvCoverage: String(toNumber(baseForm.fvCoverage))
  };

  const state = {
    studiesM2: baseCalc.studiesM2,
    pctEyD: baseCalc.pctEyD,
    pctObra: baseCalc.pctObra,
    area: toNumber(workingForm.area),
    urbanArea: toNumber(workingForm.urbanArea),
    fvCoverage: toNumber(workingForm.fvCoverage)
  };

  const adjustments = [];
  const scenarios = [];
  let scenarioId = 1;

  const recompute = (title) => {
    const calc = calculateCore(
      {
        ...workingForm,
        area: String(state.area),
        urbanArea: String(state.urbanArea),
        fvCoverage: String(state.fvCoverage)
      },
      segments,
      {
        studiesM2: state.studiesM2,
        pctEyD: state.pctEyD,
        pctObra: state.pctObra,
        area: state.area,
        urbanArea: state.urbanArea,
        fvCoverage: state.fvCoverage
      }
    );

    scenarios.push(
      buildScenarioSnapshot(
        scenarioId++,
        title,
        calc,
        {
          ...workingForm,
          area: String(state.area),
          urbanArea: String(state.urbanArea),
          fvCoverage: String(state.fvCoverage),
          optimizationStudiesM2: String(state.studiesM2),
          optimizationPctEyD: String(state.pctEyD),
          optimizationPctObra: String(state.pctObra)
        },
        adjustments
      )
    );

    return calc;
  };

  let currentCalc = recompute("Escenario base de optimización");

  // 1) Bajar valor m² de estudios y diseños según piso por zona
  const targetStudiesM2 = STUDIES_M2_FLOOR_BY_ZONE[currentCalc.zone] || currentCalc.studiesM2;
  if (currentCalc.exceedsCap && state.studiesM2 > targetStudiesM2) {
    state.studiesM2 = targetStudiesM2;
    adjustments.push(
      `Se ajustó el valor de estudios y diseños a ${targetStudiesM2.toLocaleString("es-CO")} COP/m² según la condición mínima aplicable de la zona ${currentCalc.zone}.`
    );
    currentCalc = recompute("Ajuste 1: reducción del m² de estudios y diseños");
  }

  // 2) Bajar interventoría de estudios y diseños progresivamente sin bajar del 4%
  while (currentCalc.exceedsCap && state.pctEyD > MIN_INTERVENTORIA_PERCENT) {
    const nextPct = Math.max(
      MIN_INTERVENTORIA_PERCENT,
      Number((state.pctEyD - INTERVENTORIA_STEP).toFixed(4))
    );

    if (nextPct === state.pctEyD) break;

    state.pctEyD = nextPct;
    adjustments.push(
      `Se ajustó la interventoría de estudios y diseños a ${(state.pctEyD * 100).toFixed(2)}%.`
    );
    currentCalc = recompute("Ajuste 2: reducción progresiva de interventoría E&D");
  }

  // 3) Bajar el área del urbanismo progresivamente
  if (currentCalc.exceedsCap && state.urbanArea > 0) {
    const originalUrbanArea = toNumber(baseForm.urbanArea);

    for (const factor of URBANISM_FACTORS) {
      const nextUrbanArea = roundCOP(originalUrbanArea * factor);

      if (nextUrbanArea >= state.urbanArea) continue;

      state.urbanArea = nextUrbanArea;
      adjustments.push(
        factor === 0
          ? "Se redujo el área de urbanismo a 0 m²."
          : `Se redujo el área de urbanismo al ${(factor * 100).toFixed(0)}% del área inicialmente planteada.`
      );

      currentCalc = recompute("Ajuste 3: reducción progresiva del área de urbanismo");

      if (!currentCalc.exceedsCap) break;
    }
  }

  // 4) Bajar la cobertura del sistema fotovoltaico progresivamente
  if (
    currentCalc.exceedsCap &&
    workingForm.fvType !== "No aplica" &&
    state.fvCoverage > 0
  ) {
    for (const coverage of FV_COVERAGE_STEPS) {
      if (coverage >= state.fvCoverage) continue;

      state.fvCoverage = coverage;
      adjustments.push(
        coverage === 0
          ? "Se redujo la cobertura del sistema fotovoltaico a 0%."
          : `Se redujo la cobertura del sistema fotovoltaico a ${coverage}%.`
      );

      currentCalc = recompute("Ajuste 4: reducción progresiva de cobertura fotovoltaica");

      if (!currentCalc.exceedsCap) break;
    }
  }

  // 5) Bajar progresivamente el % de interventoría de obra sin bajar del 4%
  while (currentCalc.exceedsCap && state.pctObra > MIN_INTERVENTORIA_PERCENT) {
    const nextPct = Math.max(
      MIN_INTERVENTORIA_PERCENT,
      Number((state.pctObra - INTERVENTORIA_STEP).toFixed(4))
    );

    if (nextPct === state.pctObra) break;

    state.pctObra = nextPct;
    adjustments.push(
      `Se ajustó la interventoría de obra a ${(state.pctObra * 100).toFixed(2)}%.`
    );
    currentCalc = recompute("Ajuste 5: reducción progresiva de interventoría de obra");
  }

  // 6) Si aplicado todo esto no se llega al valor techo, bajar el área construida hasta ajustar
  if (currentCalc.exceedsCap && state.area > 0) {
    const startingArea = state.area;
    let low = 1;
    let high = startingArea;
    let bestArea = 0;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);

      const testCalc = calculateCore(
        {
          ...workingForm,
          area: String(mid),
          urbanArea: String(state.urbanArea),
          fvCoverage: String(state.fvCoverage)
        },
        segments,
        {
          studiesM2: state.studiesM2,
          pctEyD: state.pctEyD,
          pctObra: state.pctObra,
          area: mid,
          urbanArea: state.urbanArea,
          fvCoverage: state.fvCoverage
        }
      );

      if (testCalc.totalProject <= testCalc.valueCap) {
        bestArea = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    if (bestArea > 0 && bestArea < state.area) {
      state.area = bestArea;
      adjustments.push(
        `Se ajustó el área construida a ${bestArea.toLocaleString("es-CO")} m² para cumplir el valor techo.`
      );
      currentCalc = recompute("Ajuste 6: reducción del área construida hasta ajustar al techo");
    }
  }

  const optimized = currentCalc;
  const savings = Math.max(0, roundCOP(baseCalc.totalProject - optimized.totalProject));

  const normalizedScenarios = scenarios.map((scenario) => ({
    ...scenario,
    savings: Math.max(0, roundCOP(baseCalc.totalProject - scenario.calc.totalProject))
  }));

  return {
    applied: true,
    base: baseCalc,
    optimized,
    optimizedForm: {
      ...workingForm,
      area: String(state.area),
      urbanArea: String(state.urbanArea),
      fvCoverage: String(state.fvCoverage),
      optimizationStudiesM2: String(state.studiesM2),
      optimizationPctEyD: String(state.pctEyD),
      optimizationPctObra: String(state.pctObra)
    },
    adjustments,
    savings,
    scenarios: normalizedScenarios
  };
}

export function calculateProject(form, segments = []) {
  const baseCalc = calculateCore(form, segments);
  const optimization = buildOptimization(form, baseCalc, segments);

  return {
    ...baseCalc,
    optimization
  };
}