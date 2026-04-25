import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { calculateProject } from "./utils/calculations";
import { formatCOP, percent } from "./utils/formatters";
import { buildCtvHtml, buildStudyHtml, exportPdf } from "./utils/pdfExport";
import { municipalitiesByDepartment } from "./data/municipalities";
import FormScreen from "./screens/FormScreen";
import CtvScreen from "./screens/CtvScreen";
import StudyScreen from "./screens/StudyScreen";
import HistoryScreen from "./screens/HistoryScreen";
import LoginScreen from "./screens/LoginScreen";

const STORAGE_KEY = "@formulador_proyectos_historial";
const SESSION_KEY = "@formulador_llave_en_mano_logged_user";
const manualZones = ["", "Z1", "Z2", "Z2G", "Z3"];

const CREATOR = {
  name: "Arq. Pedro Cesar Prada Garcia",
  whatsapp: "3114730319",
  email: "ppedrocgarcia@hotmail.com",
};

const ALL_DEPARTMENTS = [
  "Amazonas",
  "Antioquia",
  "Arauca",
  "Atlántico",
  "Bogotá D.C.",
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

const INITIAL_FORM = {
  projectName: "Centro de Salud Rural La Esperanza",
  department: "Antioquia",
  municipality: "Turbo",
  intervention: "Obra nueva",
  typology: "Centro de salud",
  area: "500",
  urbanArea: "120",
  infraType: "No aplica",
  infraArea: "0",
  fvType: "No aplica",
  fvCoverage: "0",
  logisticApplies: "No",
  manualZone: "",
  valueCap: "",
  studyMode: "automatico",
  eydInterventoriaMode: "automatico",
  eydInterventoriaManual: "",
  obraInterventoriaMode: "automatico",
  obraInterventoriaManual: "",
};

const INITIAL_SEGMENT = {
  mode: "Mular",
  distance: "30",
  calculationMode: "automatico_pct",
  unitValue: "",
};

function normalizeTypology(typology) {
  if (typology === "Hospital Nivel I" || typology === "Hospital Nivel II") {
    return "Hospital mediana complejidad (I-II)";
  }
  if (typology === "Hospital Nivel III") {
    return "Hospital alta complejidad (III)";
  }
  return typology;
}

export default function App() {
  const [view, setView] = useState("inicio");
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [form, setForm] = useState(INITIAL_FORM);
  const [segments, setSegments] = useState([{ ...INITIAL_SEGMENT }]);
  const [projects, setProjects] = useState([]);
  const [departmentModalVisible, setDepartmentModalVisible] = useState(false);
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [municipalityModalVisible, setMunicipalityModalVisible] =
    useState(false);
  const [municipalitySearch, setMunicipalitySearch] = useState("");

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loggedUser, setLoggedUser] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  const normalizedForm = useMemo(
    () => ({
      ...form,
      typology: normalizeTypology(form.typology),
    }),
    [form]
  );

  const calc = useMemo(
    () => calculateProject(normalizedForm, segments),
    [normalizedForm, segments]
  );

  useEffect(() => {
    loadSession();
    loadProjects();
  }, []);

  useEffect(() => {
    if (!loadingProjects) {
      saveProjectsToStorage(projects);
    }
  }, [projects, loadingProjects]);

  useEffect(() => {
    if (form.logisticApplies !== "Sí") {
      setSegments([{ ...INITIAL_SEGMENT }]);
    }
  }, [form.logisticApplies]);

  useEffect(() => {
    if (form.fvType === "No aplica" && form.fvCoverage !== "0") {
      setForm((prev) => ({
        ...prev,
        fvCoverage: "0",
      }));
    }
  }, [form.fvType]);

  useEffect(() => {
    if (form.infraType === "No aplica" && form.infraArea !== "0") {
      setForm((prev) => ({ ...prev, infraArea: "0" }));
    }
  }, [form.infraType]);

  useEffect(() => {
    const normalized = normalizeTypology(form.typology);
    if (normalized !== form.typology) {
      setForm((prev) => ({ ...prev, typology: normalized }));
    }
  }, [form.typology]);

  const loadSession = async () => {
    try {
      const savedUser = await AsyncStorage.getItem(SESSION_KEY);
      if (savedUser) {
        setLoggedUser(savedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.log("Error cargando sesión:", error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (username) => {
    try {
      await AsyncStorage.setItem(SESSION_KEY, username);
      setLoggedUser(username);
      setIsAuthenticated(true);
    } catch (error) {
      console.log("Error guardando sesión:", error);
      Alert.alert("Aviso", "No fue posible iniciar sesión.");
    }
  };

  const handleLogout = async () => {
    Alert.alert("Cerrar sesión", "¿Desea cerrar la sesión actual?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem(SESSION_KEY);
            setLoggedUser("");
            setIsAuthenticated(false);
          } catch (error) {
            console.log("Error cerrando sesión:", error);
            Alert.alert("Aviso", "No fue posible cerrar sesión.");
          }
        },
      },
    ]);
  };

  const filteredDepartments = ALL_DEPARTMENTS.filter((dep) =>
    dep.toLowerCase().includes(departmentSearch.toLowerCase())
  );

  const filteredMunicipalities = (
    municipalitiesByDepartment[form.department] || []
  ).filter((municipality) =>
    municipality.toLowerCase().includes(municipalitySearch.toLowerCase())
  );

  const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const toPercentNumber = (value) => {
    const normalized = String(value ?? "")
      .replace(",", ".")
      .trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const numericArea = toNumber(form.area);
  const numericUrbanArea = toNumber(form.urbanArea);
  const numericInfraArea = toNumber(form.infraArea);
  const numericFvCoverage = toNumber(form.fvCoverage);
  const numericEydInterventoriaManual = toPercentNumber(
    form.eydInterventoriaManual
  );
  const numericObraInterventoriaManual = toPercentNumber(
    form.obraInterventoriaManual
  );

  const formErrors = [];

  if (!form.projectName.trim()) {
    formErrors.push("Debe ingresar el nombre del proyecto.");
  }

  if (!form.department) {
    formErrors.push("Debe seleccionar el departamento.");
  }

  if (!form.municipality.trim()) {
    formErrors.push("Debe ingresar el municipio.");
  }

  if (!form.typology) {
    formErrors.push("Debe seleccionar la tipología.");
  }

  if (numericArea <= 0) {
    formErrors.push("El área del proyecto debe ser mayor que cero.");
  }

  if (numericUrbanArea < 0) {
    formErrors.push("El área de urbanismo no puede ser negativa.");
  }

  if (numericInfraArea < 0) {
    formErrors.push(
      "El área de infraestructura complementaria no puede ser negativa."
    );
  }

  if (form.infraType === "No aplica" && numericInfraArea > 0) {
    formErrors.push(
      "Si la infraestructura complementaria no aplica, el área debe ser 0."
    );
  }

  if (form.fvType !== "No aplica") {
    if (numericFvCoverage <= 0) {
      formErrors.push("La cobertura fotovoltaica debe ser mayor que cero.");
    }
    if (numericFvCoverage > 100) {
      formErrors.push("La cobertura fotovoltaica no puede ser mayor al 100%.");
    }
  }

  if (form.fvType === "No aplica" && numericFvCoverage > 0) {
    formErrors.push(
      "Si el sistema fotovoltaico no aplica, la cobertura debe ser 0."
    );
  }

  if (form.eydInterventoriaMode === "manual") {
    if (!form.eydInterventoriaManual.trim()) {
      formErrors.push(
        "Debe ingresar el porcentaje manual de interventoría de estudios y diseños."
      );
    } else if (
      numericEydInterventoriaManual < 4 ||
      numericEydInterventoriaManual > 7.5
    ) {
      formErrors.push(
        "La interventoría de estudios y diseños manual debe estar entre 4.0% y 7.5%."
      );
    }
  }

  if (form.obraInterventoriaMode === "manual") {
    if (!form.obraInterventoriaManual.trim()) {
      formErrors.push(
        "Debe ingresar el porcentaje manual de interventoría de obra."
      );
    } else if (
      numericObraInterventoriaManual < 4 ||
      numericObraInterventoriaManual > 7.5
    ) {
      formErrors.push(
        "La interventoría de obra manual debe estar entre 4.0% y 7.5%."
      );
    }
  }

  if (form.logisticApplies === "Sí") {
    segments.forEach((seg, index) => {
      const distance = toNumber(seg.distance);
      const unitValue = toNumber(seg.unitValue);

      if (!seg.mode) {
        formErrors.push(
          `Debe seleccionar la modalidad del tramo ${index + 1}.`
        );
      }

      if (seg.mode === "Marítimo" && seg.calculationMode === "automatico_pct") {
        formErrors.push(
          `El tramo ${
            index + 1
          } marítimo no puede calcularse automáticamente por porcentaje. Debe usar valor por tonelada-km o valor por tonelada-ruta.`
        );
      }

      if (seg.calculationMode !== "vr_ton_ruta" && distance <= 0) {
        formErrors.push(
          `La distancia del tramo ${index + 1} debe ser mayor que cero.`
        );
      }

      if (
        (seg.calculationMode === "vr_ton_km" ||
          seg.calculationMode === "vr_ton_ruta") &&
        unitValue <= 0
      ) {
        formErrors.push(
          `Debe ingresar el valor unitario del tramo ${index + 1}.`
        );
      }
    });
  }

  const loadProjects = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setProjects(parsed);
        }
      }
    } catch (error) {
      console.log("Error cargando proyectos:", error);
      Alert.alert("Aviso", "No fue posible cargar el historial guardado.");
    } finally {
      setLoadingProjects(false);
    }
  };

  const saveProjectsToStorage = async (items) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.log("Error guardando proyectos:", error);
      Alert.alert("Aviso", "No fue posible guardar el historial local.");
    }
  };

  const clearHistory = () => {
    if (projects.length === 0) {
      Alert.alert("Historial", "No hay proyectos guardados.");
      return;
    }

    Alert.alert(
      "Eliminar historial",
      "¿Desea borrar todo el historial guardado en este dispositivo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(STORAGE_KEY);
              setProjects([]);
              Alert.alert("Historial", "El historial fue eliminado.");
            } catch (error) {
              console.log("Error borrando historial:", error);
              Alert.alert("Aviso", "No fue posible eliminar el historial.");
            }
          },
        },
      ]
    );
  };

  const deleteProject = (projectId) => {
    Alert.alert(
      "Eliminar proyecto",
      "¿Desea eliminar este proyecto del historial?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const nextProjects = projects.filter(
                (item) => String(item.id) !== String(projectId)
              );

              setProjects(nextProjects);
              await AsyncStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(nextProjects)
              );
            } catch (error) {
              console.log("Error eliminando proyecto:", error);
              Alert.alert("Aviso", "No fue posible eliminar el proyecto.");
            }
          },
        },
      ]
    );
  };

  const updateSegment = (index, key, value) => {
    const next = [...segments];
    next[index][key] = value;
    setSegments(next);
  };

  const addSegment = () => {
    setSegments((prev) => [
      ...prev,
      {
        mode: "Marítimo",
        distance: "0",
        calculationMode: "vr_ton_km",
        unitValue: "",
      },
    ]);
  };

  const removeSegment = (index) => {
    if (segments.length === 1) return;
    setSegments((prev) => prev.filter((_, i) => i !== index));
  };

  const saveProject = async () => {
    if (formErrors.length > 0) {
      Alert.alert("Validación", formErrors.join("\n"));
      return;
    }

    const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const finalCalc =
      calc?.optimization?.applied && calc?.optimization?.optimized
        ? calc.optimization.optimized
        : calc;

    const scenarioLabel =
      calc?.optimization?.applied && calc?.optimization?.optimized
        ? calc.optimization.optimized.capCompliance
          ? "Escenario optimizado"
          : "Optimizado sin cumplimiento"
        : "Escenario base";

    const saved = {
      id: uniqueId,
      name: form.projectName || "Proyecto sin nombre",
      department: form.department,
      municipality: form.municipality,
      intervention: form.intervention,
      typology: normalizeTypology(form.typology),
      zone: finalCalc.zone,
      region: finalCalc.region,
      area: finalCalc.area,
      totalProject: finalCalc.totalProject,
      valueM2Project: finalCalc.valueM2Project,
      scenarioLabel,
      form: {
        ...form,
        typology: normalizeTypology(form.typology),
      },
      segments: segments.map((s) => ({ ...s })),
      calc: { ...calc },
      finalCalc: { ...finalCalc },
      createdAt: new Date().toISOString(),
      savedBy: loggedUser || "usuario",
    };

    const nextProjects = [saved, ...projects];
    setProjects(nextProjects);

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextProjects));
    } catch (error) {
      console.log("Error guardando proyecto:", error);
      Alert.alert("Aviso", "No fue posible guardar el proyecto.");
    }

    setView("historial");
  };

  const openProject = (project) => {
    const normalizedTypology = normalizeTypology(project.form.typology);

    setForm({
      ...project.form,
      typology: normalizedTypology,
      valueCap: project.form.valueCap ?? "",
      studyMode: project.form.studyMode ?? "automatico",
      eydInterventoriaMode: project.form.eydInterventoriaMode ?? "automatico",
      eydInterventoriaManual: project.form.eydInterventoriaManual ?? "",
      obraInterventoriaMode: project.form.obraInterventoriaMode ?? "automatico",
      obraInterventoriaManual: project.form.obraInterventoriaManual ?? "",
    });

    setSegments(
      project.segments.map((s) => ({
        mode: s.mode ?? "Mular",
        distance: s.distance ?? "0",
        calculationMode: s.calculationMode ?? "automatico_pct",
        unitValue: s.unitValue ?? "",
      }))
    );
    setView("ctv");
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setSegments([{ ...INITIAL_SEGMENT }]);
    setView("inicio");
  };

  const getActiveScenario = () => {
    const hasOptimization =
      calc?.optimization?.applied && calc?.optimization?.optimized;

    const activeCalc = hasOptimization ? calc.optimization.optimized : calc;

    const activeForm =
      hasOptimization && calc?.optimization?.optimizedForm
        ? { ...form, ...calc.optimization.optimizedForm }
        : form;

    return { activeCalc, activeForm, hasOptimization };
  };

  const renderLogisticDescription = () => {
    const { activeCalc, activeForm, hasOptimization } = getActiveScenario();

    if (
      activeForm.logisticApplies !== "Sí" ||
      !activeCalc?.segmentResults ||
      activeCalc.segmentResults.length === 0
    ) {
      return "No se aplicó sobrecosto logístico al presente ejercicio, por cuanto para este caso no se incorporaron tramos de transporte con incidencia económica adicional dentro del cálculo preliminar.";
    }

    const tramoTexto = activeCalc.segmentResults
      .map((seg, index) => {
        if (seg.calculationMode === "vr_ton_km") {
          return `Tramo ${index + 1}: modalidad ${seg.mode}, distancia ${
            seg.distance
          } km, calculado por valor tonelada-km, con un costo estimado de ${formatCOP(
            seg.cost
          )}`;
        }

        if (seg.calculationMode === "vr_ton_ruta") {
          return `Tramo ${index + 1}: modalidad ${
            seg.mode
          }, calculado por valor tonelada-ruta, con un costo estimado de ${formatCOP(
            seg.cost
          )}`;
        }

        return `Tramo ${index + 1}: modalidad ${seg.mode}, distancia ${
          seg.distance
        } km, con una incidencia equivalente al ${percent(seg.pct)}`;
      })
      .join(". ");

    const areaProyecto = Number(activeCalc?.area || activeForm?.area || 0);

    return `El sobrecosto logístico se calculó por tramos de transporte, aplicando para cada recorrido el criterio correspondiente a su modalidad. ${tramoTexto}. El costo logístico total estimado para el escenario final analizado, con un área de proyecto de ${areaProyecto.toLocaleString(
      "es-CO"
    )} m², asciende a ${formatCOP(activeCalc.logisticCost)}.${
      hasOptimization
        ? " La presente descripción incorpora el escenario optimizado final del proyecto."
        : ""
    }`;
  };

  const renderCreatorBox = () => (
    <View style={styles.creatorBox}>
      <Text style={styles.creatorTitle}>Creador de la aplicación</Text>
      <Text style={styles.creatorText}>{CREATOR.name}</Text>
      <Text style={styles.creatorText}>WhatsApp: {CREATOR.whatsapp}</Text>
      <Text style={styles.creatorText}>{CREATOR.email}</Text>
    </View>
  );

  const renderBaseBox = () => (
    <View style={styles.baseBox}>
      <Text style={styles.baseTitle}>Base metodológica</Text>
      <Text style={styles.baseText}>
        Los valores unitarios, coeficientes, porcentajes y parámetros de cálculo
        adoptados por esta herramienta resultan del análisis de 482 proyectos
        viabilizados por la Subdirección de Infraestructura en Salud del
        Ministerio de Salud y Protección Social.
      </Text>
    </View>
  );

  const renderComponentSummary = () => {
    const { activeCalc, activeForm } = getActiveScenario();

    const isFvActive = activeForm?.fvType && activeForm?.fvType !== "No aplica";

    return (
      <View style={styles.docBox}>
        <Text style={styles.docTitle}>Resumen paramétrico por componentes</Text>

        <View style={styles.summaryHeader}>
          <Text style={[styles.summaryHeadText, { flex: 2 }]}>Concepto</Text>
          <Text style={styles.summaryHeadText}>Área</Text>
          <Text style={styles.summaryHeadText}>Vr unit</Text>
          <Text style={styles.summaryHeadText}>Valor</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryText, { flex: 2 }]}>
            Estudios y diseños
          </Text>
          <Text style={styles.summaryText}>
            {Number(activeCalc?.area || 0).toLocaleString("es-CO")}
          </Text>
          <Text style={styles.summaryText}>
            {formatCOP(activeCalc?.studiesM2)}
          </Text>
          <Text style={styles.summaryText}>
            {formatCOP(activeCalc?.studies)}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryText, { flex: 2 }]}>Construcción</Text>
          <Text style={styles.summaryText}>
            {Number(activeCalc?.area || 0).toLocaleString("es-CO")}
          </Text>
          <Text style={styles.summaryText}>
            {formatCOP(activeCalc?.constructionM2)}
          </Text>
          <Text style={styles.summaryText}>
            {formatCOP(activeCalc?.construction)}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryText, { flex: 2 }]}>Urbanismo</Text>
          <Text style={styles.summaryText}>
            {Number(activeCalc?.urbanArea || 0).toLocaleString("es-CO")}
          </Text>
          <Text style={styles.summaryText}>
            {formatCOP(activeCalc?.urbanismM2)}
          </Text>
          <Text style={styles.summaryText}>
            {formatCOP(activeCalc?.urbanism)}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryText, { flex: 2 }]}>
            Infraestructura comp.
          </Text>
          <Text style={styles.summaryText}>
            {Number(activeCalc?.infraArea || 0).toLocaleString("es-CO")}
          </Text>
          <Text style={styles.summaryText}>
            {formatCOP(activeCalc?.infraM2)}
          </Text>
          <Text style={styles.summaryText}>{formatCOP(activeCalc?.infra)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryText, { flex: 2 }]}>Fotovoltaico</Text>
          <Text style={styles.summaryText}>
            {isFvActive
              ? Number(activeCalc?.area || 0).toLocaleString("es-CO")
              : "-"}
          </Text>
          <Text style={styles.summaryText}>
            {isFvActive ? formatCOP(activeCalc?.fvM2) : "No aplica"}
          </Text>
          <Text style={styles.summaryText}>{formatCOP(activeCalc?.fv)}</Text>
        </View>
      </View>
    );
  };

  const buildStudyComponentRowsHtml = () => {
    const { activeCalc, activeForm } = getActiveScenario();
    const isFvActive = activeForm?.fvType && activeForm?.fvType !== "No aplica";

    const rows = [
      {
        concepto: "Estudios y diseños",
        pct: "",
        vrM2: formatCOP(activeCalc?.studiesM2),
        area: Number(activeCalc?.area || 0).toLocaleString("es-CO"),
        total: formatCOP(activeCalc?.studies),
      },
      {
        concepto: "Interventoría de estudios y diseños",
        pct: percent(activeCalc?.pctEyD),
        vrM2: "",
        area: "",
        total: formatCOP(activeCalc?.interventoriaEyD),
      },
      {
        concepto: "Construcción",
        pct: "",
        vrM2: formatCOP(activeCalc?.constructionM2),
        area: Number(activeCalc?.area || 0).toLocaleString("es-CO"),
        total: formatCOP(activeCalc?.construction),
      },
      {
        concepto: "Urbanismo",
        pct: "",
        vrM2: formatCOP(activeCalc?.urbanismM2),
        area: Number(activeCalc?.urbanArea || 0).toLocaleString("es-CO"),
        total: formatCOP(activeCalc?.urbanism),
      },
      {
        concepto: "Infraestructura complementaria",
        pct: "",
        vrM2: formatCOP(activeCalc?.infraM2),
        area: Number(activeCalc?.infraArea || 0).toLocaleString("es-CO"),
        total: formatCOP(activeCalc?.infra),
      },
      {
        concepto: "Sistema fotovoltaico",
        pct: isFvActive
          ? `${Number(activeForm?.fvCoverage || 0).toLocaleString("es-CO")}%`
          : "",
        vrM2: isFvActive ? formatCOP(activeCalc?.fvM2) : "No aplica",
        area: isFvActive
          ? Number(activeCalc?.area || 0).toLocaleString("es-CO")
          : "-",
        total: formatCOP(activeCalc?.fv),
      },
      {
        concepto: "Interventoría de obra",
        pct: percent(activeCalc?.pctObra),
        vrM2: "",
        area: "",
        total: formatCOP(activeCalc?.interventoriaObra),
      },
      {
        concepto: "Sobrecosto logístico",
        pct:
          activeCalc?.logisticPct && activeCalc?.logisticPct > 0
            ? percent(activeCalc?.logisticPct)
            : "",
        vrM2: "",
        area: "",
        total: formatCOP(activeCalc?.logisticCost),
      },
    ];

    return rows
      .map(
        (row) => `
          <tr>
            <td>${row.concepto}</td>
            <td style="text-align:center;">${row.pct || ""}</td>
            <td style="text-align:right;">${row.vrM2 || ""}</td>
            <td style="text-align:right;">${row.area || ""}</td>
            <td style="text-align:right;">${row.total || ""}</td>
          </tr>
        `
      )
      .join("");
  };

  const handleExportCtvPdf = async () => {
    try {
      const { activeForm } = getActiveScenario();
      const html = buildCtvHtml({ form, calc });

      await exportPdf({
        html,
        fileName: `CTV - ${activeForm?.projectName || "Proyecto"}.pdf`,
      });
    } catch (error) {
      console.log("Error exportando PDF CTV:", error);
      Alert.alert("Error", "No fue posible generar el PDF del CTV.");
    }
  };

  const handleExportStudyPdf = async () => {
    try {
      const { activeForm } = getActiveScenario();
      const html = buildStudyHtml({
        form,
        calc,
        logisticDescription: renderLogisticDescription(),
        componentRowsHtml: buildStudyComponentRowsHtml(),
      });

      await exportPdf({
        html,
        fileName: `Estudio - ${activeForm?.projectName || "Proyecto"}.pdf`,
      });
    } catch (error) {
      console.log("Error exportando PDF Estudio:", error);
      Alert.alert("Error", "No fue posible generar el PDF del estudio.");
    }
  };

  if (authLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.container, styles.centeredScreen]}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen styles={styles} onLogin={handleLogin} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerText}>Formulador Llave en Mano</Text>
          <Text style={styles.headerSubText}>Usuario: {loggedUser}</Text>
        </View>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {view === "inicio" && (
        <FormScreen
          styles={styles}
          form={form}
          setForm={setForm}
          calc={calc}
          manualZones={manualZones}
          departmentModalVisible={departmentModalVisible}
          setDepartmentModalVisible={setDepartmentModalVisible}
          departmentSearch={departmentSearch}
          setDepartmentSearch={setDepartmentSearch}
          filteredDepartments={filteredDepartments}
          municipalityModalVisible={municipalityModalVisible}
          setMunicipalityModalVisible={setMunicipalityModalVisible}
          municipalitySearch={municipalitySearch}
          setMunicipalitySearch={setMunicipalitySearch}
          filteredMunicipalities={filteredMunicipalities}
          segments={segments}
          updateSegment={updateSegment}
          addSegment={addSegment}
          removeSegment={removeSegment}
          formErrors={formErrors}
          saveProject={saveProject}
          setView={setView}
          renderCreatorBox={renderCreatorBox}
          renderBaseBox={renderBaseBox}
          renderComponentSummary={renderComponentSummary}
        />
      )}

      {view === "ctv" && (
        <CtvScreen
          styles={styles}
          form={form}
          calc={calc}
          setView={setView}
          showPdfInstallMessage={handleExportCtvPdf}
          renderCreatorBox={renderCreatorBox}
          renderBaseBox={renderBaseBox}
        />
      )}

      {view === "estudio" && (
        <StudyScreen
          styles={styles}
          form={form}
          calc={calc}
          setView={setView}
          showPdfInstallMessage={handleExportStudyPdf}
          renderCreatorBox={renderCreatorBox}
          renderBaseBox={renderBaseBox}
          normalizeTypology={normalizeTypology}
          renderLogisticDescription={renderLogisticDescription}
          renderComponentSummary={renderComponentSummary}
        />
      )}

      {view === "historial" && (
        <HistoryScreen
          styles={styles}
          loadingProjects={loadingProjects}
          projects={projects}
          openProject={openProject}
          deleteProject={deleteProject}
          resetForm={resetForm}
          setView={setView}
          clearHistory={clearHistory}
          renderCreatorBox={renderCreatorBox}
          normalizeTypology={normalizeTypology}
        />
      )}

      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={() => setView("inicio")}
          style={styles.bottomBtn}
        >
          <Text
            style={[
              styles.bottomText,
              view === "inicio" && styles.bottomTextActive,
            ]}
          >
            Inicio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setView("ctv")}
          style={styles.bottomBtn}
        >
          <Text
            style={[
              styles.bottomText,
              view === "ctv" && styles.bottomTextActive,
            ]}
          >
            CTV
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setView("estudio")}
          style={styles.bottomBtn}
        >
          <Text
            style={[
              styles.bottomText,
              view === "estudio" && styles.bottomTextActive,
            ]}
          >
            Estudio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setView("historial")}
          style={styles.bottomBtn}
        >
          <Text
            style={[
              styles.bottomText,
              view === "historial" && styles.bottomTextActive,
            ]}
          >
            Historial
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  header: {
    minHeight: 56,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  headerSubText: {
    color: "#CBD5E1",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: "#1E293B",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  centeredScreen: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 110,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  halfCard: {
    flex: 1,
  },
  rowDouble: {
    flexDirection: "row",
    gap: 10,
  },
  creatorBox: {
    backgroundColor: "#E0F2FE",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  creatorTitle: {
    color: "#0369A1",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
  },
  creatorText: {
    color: "#0C4A6E",
    fontSize: 12,
    marginBottom: 3,
    fontWeight: "600",
  },
  baseBox: {
    backgroundColor: "#ECFDF5",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  baseTitle: {
    color: "#047857",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
  },
  baseText: {
    color: "#065F46",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  label: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
  },
  smallLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 8,
  },
  value: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "800",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontWeight: "700",
    color: "#0F172A",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  selectBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectBoxText: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 14,
    flex: 1,
  },
  selectBoxArrow: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 16,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },
  modalSearchInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    color: "#0F172A",
    fontWeight: "700",
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: "#F8FAFC",
  },
  modalItemActive: {
    backgroundColor: "#0F172A",
  },
  modalItemText: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "700",
  },
  modalItemTextActive: {
    color: "#FFFFFF",
  },
  modalCloseButton: {
    marginTop: 12,
    backgroundColor: "#E2E8F0",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "#0F172A",
    fontWeight: "800",
  },
  emptySearchBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  emptySearchText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "700",
  },
  pill: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 4,
  },
  pillSmall: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  pillActive: {
    backgroundColor: "#0F172A",
  },
  pillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  pillTextSmall: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
  },
  pillTextActive: {
    color: "#FFFFFF",
  },
  rowPills: {
    flexDirection: "row",
  },
  segmentBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
  },
  segmentTitle: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 4,
  },
  inlineButtons: {
    flexDirection: "row",
    marginTop: 8,
  },
  smallButton: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  smallButtonText: {
    color: "#991B1B",
    fontWeight: "700",
    fontSize: 12,
  },
  summaryHeader: {
    backgroundColor: "#E2E8F0",
    borderRadius: 12,
    padding: 10,
    flexDirection: "row",
    marginBottom: 8,
  },
  summaryHeadText: {
    flex: 1,
    fontSize: 10,
    fontWeight: "800",
    color: "#334155",
    textAlign: "center",
  },
  summaryRow: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 10,
    flexDirection: "row",
    marginBottom: 8,
  },
  summaryText: {
    flex: 1,
    fontSize: 10,
    color: "#0F172A",
    textAlign: "center",
  },
  ctvTable: {
    minWidth: 760,
  },
  ctvHeader: {
    backgroundColor: "#E2E8F0",
    borderRadius: 14,
    padding: 10,
    flexDirection: "row",
    marginBottom: 8,
  },
  ctvHeadText: {
    flex: 1,
    fontSize: 10,
    fontWeight: "800",
    color: "#334155",
    textAlign: "center",
  },
  ctvRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 10,
    flexDirection: "row",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  ctvRowDark: {
    backgroundColor: "#0F172A",
    borderRadius: 14,
    padding: 10,
    flexDirection: "row",
    marginBottom: 8,
  },
  ctvText: {
    flex: 1,
    fontSize: 10,
    color: "#0F172A",
    textAlign: "center",
  },
  ctvTextDark: {
    flex: 1,
    fontSize: 10,
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "700",
  },
  ctvVerticalTable: {
    minWidth: 760,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#94A3B8",
  },
  ctvVerticalHeader: {
    flexDirection: "row",
    backgroundColor: "#1F4E78",
    borderBottomWidth: 1,
    borderBottomColor: "#94A3B8",
  },
  ctvVerticalHeadText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  ctvVerticalRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#94A3B8",
  },
  ctvVerticalCell: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "#94A3B8",
  },
  ctvVerticalSectionCell: {
    backgroundColor: "#D9E2F3",
  },
  ctvVerticalConceptCell: {
    backgroundColor: "#F2F2F2",
  },
  ctvVerticalValueCell: {
    backgroundColor: "#FFFFFF",
  },
  ctvVerticalSectionText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A",
  },
  ctvVerticalConceptText: {
    fontSize: 11,
    color: "#0F172A",
  },
  ctvVerticalValueText: {
    fontSize: 11,
    color: "#0F172A",
  },
  ctvVerticalValueTextStrong: {
    fontWeight: "800",
  },
  ctvNormalRow: {},
  ctvSoftHighlightRow: {
    backgroundColor: "#FCE4D6",
  },
  ctvSubtotalRow: {
    backgroundColor: "#F4C7AB",
  },
  ctvFinanceRow: {
    backgroundColor: "#ED7D31",
  },
  docBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  docTitle: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 8,
  },
  docText: {
    color: "#334155",
    fontSize: 13,
    lineHeight: 20,
  },
  docBold: {
    fontWeight: "800",
    color: "#0F172A",
  },
  warningBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  warningTitle: {
    color: "#991B1B",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
  },
  warningText: {
    color: "#991B1B",
    fontSize: 12,
    marginBottom: 4,
  },
  rowActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  projectActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  buttonHalf: {
    backgroundColor: "#0F172A",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    flex: 1,
  },
  buttonThird: {
    backgroundColor: "#0F172A",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    flex: 1,
  },
  button: {
    backgroundColor: "#0F172A",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  buttonSecondary: {
    backgroundColor: "#E2E8F0",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonSecondaryText: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "700",
  },
  buttonDanger: {
    backgroundColor: "#B91C1C",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  buttonMini: {
    backgroundColor: "#E2E8F0",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: "center",
    flex: 1,
  },
  buttonMiniText: {
    color: "#0F172A",
    fontSize: 12,
    fontWeight: "700",
  },
  buttonMiniDanger: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: "center",
    flex: 1,
  },
  buttonMiniDangerText: {
    color: "#991B1B",
    fontSize: 12,
    fontWeight: "700",
  },
  bottomBar: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  bottomBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  bottomText: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "700",
  },
  bottomTextActive: {
    color: "#0F172A",
  },
});
