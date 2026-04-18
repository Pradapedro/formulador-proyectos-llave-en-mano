// =============================
// DEPARTAMENTOS
// =============================
export const departments = [
  "Amazonas",
  "Antioquia",
  "Arauca",
  "Atlántico",
  "Bolívar",
  "Boyacá",
  "Caldas",
  "Caquetá",
  "Casanare",
  "Cauca",
  "Cesar",
  "Chocó",
  "Córdoba",
  "Cundinamarca",
  "Guainía",
  "Guaviare",
  "Huila",
  "La Guajira",
  "Magdalena",
  "Meta",
  "Nariño",
  "Norte de Santander",
  "Putumayo",
  "Quindío",
  "Risaralda",
  "San Andrés y Providencia",
  "Santander",
  "Sucre",
  "Tolima",
  "Valle del Cauca",
  "Vaupés",
  "Vichada",
];

// =============================
// REGIONES
// =============================
export const regionByDepartment = {
  Antioquia: "Andina",
  Boyacá: "Andina",
  Caldas: "Andina",
  Cundinamarca: "Andina",
  Huila: "Andina",
  "Norte de Santander": "Andina",
  Quindío: "Andina",
  Risaralda: "Andina",
  Santander: "Andina",
  Tolima: "Andina",

  Atlántico: "Caribe",
  Bolívar: "Caribe",
  Cesar: "Caribe",
  Córdoba: "Caribe",
  "La Guajira": "Caribe",
  Magdalena: "Caribe",
  Sucre: "Caribe",
  "San Andrés y Providencia": "Caribe",

  Cauca: "Pacífica",
  Chocó: "Pacífica",
  Nariño: "Pacífica",
  "Valle del Cauca": "Pacífica",

  Arauca: "Orinoquía",
  Casanare: "Orinoquía",
  Meta: "Orinoquía",
  Vichada: "Orinoquía",

  Amazonas: "Amazonía",
  Caquetá: "Amazonía",
  Guainía: "Amazonía",
  Guaviare: "Amazonía",
  Putumayo: "Amazonía",
  Vaupés: "Amazonía",
};

// Alias compatibles con motor v2
export const regionsByDepartment = regionByDepartment;

// =============================
// ZONAS LOGÍSTICAS
// =============================
export const zoneByDepartment = {
  Amazonas: "Z3",
  Antioquia: "Z1",
  Arauca: "Z2",
  Atlántico: "Z1",
  Bolívar: "Z1",
  Boyacá: "Z1",
  Caldas: "Z1",
  Caquetá: "Z2",
  Casanare: "Z2",
  Cauca: "Z2",
  Cesar: "Z1",
  Chocó: "Z2",
  Córdoba: "Z1",
  Cundinamarca: "Z1",
  Guainía: "Z3",
  Guaviare: "Z3",
  Huila: "Z1",
  "La Guajira": "Z2",
  Magdalena: "Z1",
  Meta: "Z2",
  Nariño: "Z2",
  "Norte de Santander": "Z1",
  Putumayo: "Z2",
  Quindío: "Z1",
  Risaralda: "Z1",
  "San Andrés y Providencia": "Z2G",
  Santander: "Z1",
  Sucre: "Z1",
  Tolima: "Z1",
  "Valle del Cauca": "Z1",
  Vaupés: "Z3",
  Vichada: "Z3",
};

// Alias compatibles con motor v2
export const zonesByDepartment = zoneByDepartment;

// =============================
// TIPOS DE INTERVENCIÓN
// =============================
export const interventionTypes = [
  "Adecuación",
  "Obra nueva",
  "Reposición",
  "Terminación",
];

// =============================
// TIPOLOGÍAS
// =============================
export const typologies = [
  "UPS / Puesto de salud",
  "Centro de salud",
  "Hospital mediana complejidad (I–II)",
  "Hospital alta complejidad (III)",
];

// =============================
// FACTORES TIPOLÓGICOS
// =============================
export const typologyFactors = {
  "UPS / Puesto de salud": 0.9,
  "Centro de salud": 0.95,
  "Hospital mediana complejidad (I–II)": 1.05,
  "Hospital alta complejidad (III)": 1.15,
};

// =============================
// ESTUDIOS Y DISEÑOS
// =============================
export const studiesByZone = {
  Z1: 180000,
  Z2: 230000,
  Z2G: 290000,
  Z3: 300000,
};

export const interventoriaEyDByZone = {
  Z1: 0.07,
  Z2: 0.07,
  Z2G: 0.07,
  Z3: 0.08,
};

export const interventoriaObraByZone = {
  Z1: 0.0764,
  Z2: 0.0764,
  Z2G: 0.0764,
  Z3: 0.08,
};

// =============================
// URBANISMO
// =============================
export const urbanismByRegion = {
  Andina: 554634,
  Caribe: 571273,
  Pacífica: 610097,
  Orinoquía: 587912,
  Amazonía: 621190,
};

// =============================
// INFRAESTRUCTURA COMPLEMENTARIA
// =============================
export const infraValues = {
  "No aplica": 0,
  "Infraestructura tradicional rural": 1350000,
  "Infraestructura etnocultural adaptada": 5503000,
};

// =============================
// SISTEMA FOTOVOLTAICO
// =============================
export const fvValues = {
  Z1: {
    "No aplica": 0,
    "ON GRID": 1144222,
    "OFF GRID": 1473308,
  },
  Z2: {
    "No aplica": 0,
    "ON GRID": 1258644,
    "OFF GRID": 1620639,
  },
  Z2G: {
    "No aplica": 0,
    "ON GRID": 1373066,
    "OFF GRID": 1767970,
  },
  Z3: {
    "No aplica": 0,
    "ON GRID": 1487488,
    "OFF GRID": 1915301,
  },
};

// =============================
// COSTOS DE CONSTRUCCIÓN
// =============================
export const constructionTables = {
  Adecuación: {
    "UPS / Puesto de salud": {
      Andina: 1152000,
      Caribe: 1186560,
      Pacífica: 1244160,
      Orinoquía: 1221120,
      Amazonía: 1267200,
    },
    "Centro de salud": {
      Andina: 1216000,
      Caribe: 1252480,
      Pacífica: 1313280,
      Orinoquía: 1288960,
      Amazonía: 1337600,
    },
    "Hospital mediana complejidad (I–II)": {
      Andina: 1344000,
      Caribe: 1384320,
      Pacífica: 1451520,
      Orinoquía: 1424640,
      Amazonía: 1478400,
    },
    "Hospital alta complejidad (III)": {
      Andina: 1472000,
      Caribe: 1516160,
      Pacífica: 1589760,
      Orinoquía: 1560320,
      Amazonía: 1619200,
    },
  },

  "Obra nueva": {
    "UPS / Puesto de salud": {
      Andina: 6030000,
      Caribe: 6210900,
      Pacífica: 6633000,
      Orinoquía: 6391800,
      Amazonía: 6753600,
    },
    "Centro de salud": {
      Andina: 6370000,
      Caribe: 6561100,
      Pacífica: 7007000,
      Orinoquía: 6752200,
      Amazonía: 7134400,
    },
    "Hospital mediana complejidad (I–II)": {
      Andina: 7040000,
      Caribe: 7251200,
      Pacífica: 7744000,
      Orinoquía: 7462400,
      Amazonía: 7884800,
    },
    "Hospital alta complejidad (III)": {
      Andina: 7710000,
      Caribe: 7941300,
      Pacífica: 8481000,
      Orinoquía: 8172600,
      Amazonía: 8635200,
    },
  },

  Reposición: {
    "UPS / Puesto de salud": {
      Andina: 6030000,
      Caribe: 6210900,
      Pacífica: 6633000,
      Orinoquía: 6391800,
      Amazonía: 6753600,
    },
    "Centro de salud": {
      Andina: 6370000,
      Caribe: 6561100,
      Pacífica: 7007000,
      Orinoquía: 6752200,
      Amazonía: 7134400,
    },
    "Hospital mediana complejidad (I–II)": {
      Andina: 7040000,
      Caribe: 7251200,
      Pacífica: 7744000,
      Orinoquía: 7462400,
      Amazonía: 7884800,
    },
    "Hospital alta complejidad (III)": {
      Andina: 7710000,
      Caribe: 7941300,
      Pacífica: 8481000,
      Orinoquía: 8172600,
      Amazonía: 8635200,
    },
  },

  Terminación: {
    "UPS / Puesto de salud": {
      Andina: 2900000,
      Caribe: 2987000,
      Pacífica: 3190000,
      Orinoquía: 3074000,
      Amazonía: 3248000,
    },
    "Centro de salud": {
      Andina: 3100000,
      Caribe: 3193000,
      Pacífica: 3410000,
      Orinoquía: 3286000,
      Amazonía: 3472000,
    },
    "Hospital mediana complejidad (I–II)": {
      Andina: 3300000,
      Caribe: 3399000,
      Pacífica: 3630000,
      Orinoquía: 3498000,
      Amazonía: 3696000,
    },
    "Hospital alta complejidad (III)": {
      Andina: 3600000,
      Caribe: 3708000,
      Pacífica: 3960000,
      Orinoquía: 3816000,
      Amazonía: 4032000,
    },
  },
};

// =============================
// LOGÍSTICA
// =============================
export const logisticModes = [
  "Marítimo",
  "Fluvial mayor",
  "Fluvial menor",
  "Trocha terrestre",
  "Mular",
];

export const logisticCoefficients = {
  Marítimo: 0.0011,
  "Fluvial mayor": 0.0004,
  "Fluvial menor": 0.0005,
  "Trocha terrestre": 0.0045,
  Mular: 0.0185,
};

// =============================
// OBJETO UNIFICADO PARA MOTOR V2
// =============================
export const MODEL_PARAMETERS = {
  departments,
  interventionTypes,
  typologies,
  typologyFactors,

  regionByDepartment,
  zoneByDepartment,

  // nombres compatibles con el motor v2
  regionsByDepartment,
  zonesByDepartment,

  studiesByZone,
  interventoriaEyDByZone,
  interventoriaObraByZone,
  urbanismByRegion,
  infraValues,
  fvValues,
  constructionTables,
  logisticModes,
  logisticCoefficients,
};

// =============================
// EXPORT DEFAULT OPCIONAL
// =============================
export default MODEL_PARAMETERS;