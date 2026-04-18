import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { formatCOP, percent } from "../utils/formatters";
import { buildStudyHtml, exportPdf } from "../utils/pdfExport";

function formatArea(value) {
  return `${Number(value || 0).toLocaleString("es-CO")} m²`;
}

function formatPlain(value) {
  return Number(value || 0).toLocaleString("es-CO");
}

function getActiveCalc(calc) {
  if (calc?.optimization?.applied && calc?.optimization?.optimized) {
    return calc.optimization.optimized;
  }
  return calc;
}

function getActiveForm(form, calc) {
  if (calc?.optimization?.applied && calc?.optimization?.optimizedForm) {
    return {
      ...form,
      ...calc.optimization.optimizedForm,
    };
  }
  return form;
}

function buildProjectTableRows(form, calc) {
  const relationUrbanism =
    Number(calc?.area || 0) > 0
      ? Number(calc?.urbanArea || 0) / Number(calc?.area || 0)
      : 0;

  const totalConstructionWithComponents = Number(
    calc?.subtotalConstructivo || 0
  );

  const valueM2ConstructionWithComponents =
    Number(calc?.area || 0) > 0
      ? Math.round(totalConstructionWithComponents / Number(calc.area))
      : 0;

  return [
    ["Identificación del proyecto", "Nombre del proyecto", form?.projectName || "-"],
    ["", "Municipio", form?.municipality || "-"],
    ["", "Departamento", form?.department || "-"],
    ["", "Región", calc?.region || "-"],
    ["", "Zona logística", calc?.zone || "-"],
    ["", "Tipología", calc?.normalizedTypology || form?.typology || "-"],
    ["", "Tipo de intervención", form?.intervention || "-"],

    ["Dimensionamiento del proyecto", "Área del proyecto", formatArea(calc?.area)],
    ["", "Área urbanismo", formatArea(calc?.urbanArea)],
    ["", "Relación urbanismo / área proyecto", percent(relationUrbanism)],

    [
      "Parámetros técnicos unitarios",
      "Valor m² estudios y diseños",
      `${formatCOP(calc?.studiesM2)}/m²`,
    ],
    ["", "Valor m² construcción", `${formatCOP(calc?.constructionM2)}/m²`],
    ["", "Valor m² urbanismo", `${formatCOP(calc?.urbanismM2)}/m²`],
    [
      "",
      "Valor m² sistema fotovoltaico",
      form?.fvType && form?.fvType !== "No aplica"
        ? `${formatCOP(calc?.fvM2Base)}/m²`
        : "No aplica",
    ],
    ["", "Sistema fotovoltaico", form?.fvType || "No aplica"],
    [
      "",
      "Cobertura sistema fotovoltaico",
      form?.fvType && form?.fvType !== "No aplica"
        ? `${formatPlain(calc?.fvCoverage)}%`
        : "No aplica",
    ],

    ["Costos por componente", "Valor estudios y diseños", formatCOP(calc?.studies)],
    ["", "Valor construcción", formatCOP(calc?.construction)],
    ["", "Valor urbanismo", formatCOP(calc?.urbanism)],
    ["", "Valor infraestructura complementaria", formatCOP(calc?.infra)],
    ["", "Valor sistema fotovoltaico", formatCOP(calc?.fv)],

    [
      "Subtotal técnico de obra",
      "Total construcción con componentes",
      formatCOP(totalConstructionWithComponents),
    ],
    [
      "",
      "Valor m² construcción con componentes",
      `${formatCOP(valueM2ConstructionWithComponents)}/m²`,
    ],

    ["Costos de control y gestión", "% interventoría estudios y diseños", percent(calc?.pctEyD)],
    ["", "Valor interventoría estudios y diseños", formatCOP(calc?.interventoriaEyD)],
    ["", "% interventoría de obra", percent(calc?.pctObra)],
    ["", "Valor interventoría de obra", formatCOP(calc?.interventoriaObra)],

    ["Costos logísticos", "Sobrecosto logístico", formatCOP(calc?.logisticCost)],
    ["", "% sobrecosto logístico", percent(calc?.logisticPct)],

    ["Resultado financiero del proyecto", "Valor total del proyecto", formatCOP(calc?.totalProject)],
    ["", "Valor promedio del proyecto", `${formatCOP(calc?.valueM2Project)}/m²`],
  ];
}

function renderProjectTable(styles, rows) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator>
      <View style={styles.ctvVerticalTable}>
        <View style={styles.ctvVerticalHeader}>
          <Text style={[styles.ctvVerticalHeadText, { flex: 1.35 }]}>Grupo</Text>
          <Text style={[styles.ctvVerticalHeadText, { flex: 1.45 }]}>Concepto</Text>
          <Text style={[styles.ctvVerticalHeadText, { flex: 1.8 }]}>Valor</Text>
        </View>

        {rows.map((row, index) => {
          const [section, concept, value] = row;

          return (
            <View key={`study-row-${index}`} style={styles.ctvVerticalRow}>
              <View
                style={[
                  styles.ctvVerticalCell,
                  styles.ctvVerticalSectionCell,
                  { flex: 1.35 },
                ]}
              >
                <Text style={styles.ctvVerticalSectionText}>{section || ""}</Text>
              </View>

              <View
                style={[
                  styles.ctvVerticalCell,
                  styles.ctvVerticalConceptCell,
                  { flex: 1.45 },
                ]}
              >
                <Text style={styles.ctvVerticalConceptText}>{concept}</Text>
              </View>

              <View
                style={[
                  styles.ctvVerticalCell,
                  styles.ctvVerticalValueCell,
                  { flex: 1.8 },
                ]}
              >
                <Text style={styles.ctvVerticalValueText}>{value}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

export default function StudyScreen({
  styles,
  form,
  calc,
  setView,
  showPdfInstallMessage,
  renderCreatorBox,
  renderBaseBox,
  normalizeTypology,
}) {
  if (!calc) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Redacción del estudio</Text>

        <View style={styles.docBox}>
          <Text style={styles.docTitle}>Resultado</Text>
          <Text style={styles.docText}>
            No fue posible construir el estudio del proyecto. Verifica que la información
            del formulario esté completa y que el motor de cálculo esté correctamente conectado.
          </Text>
        </View>

        <View style={styles.rowActions}>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => setView("inicio")}>
            <Text style={styles.buttonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const activeCalc = getActiveCalc(calc);
  const activeForm = getActiveForm(form, calc);
  const normalizedTypology = normalizeTypology
    ? normalizeTypology(activeForm.typology)
    : activeCalc?.normalizedTypology || activeForm?.typology || "-";

  const rows = buildProjectTableRows(
    { ...activeForm, normalizedTypology },
    activeCalc
  );

  const hasOptimization =
    calc?.optimization?.applied && calc?.optimization?.optimized;

  const optimizedCalc = hasOptimization ? calc.optimization.optimized : null;
  const totalConstructionWithComponents = Number(
    activeCalc?.subtotalConstructivo || 0
  );

  const handleExportStudyPdf = async () => {
    try {
      const html = buildStudyHtml({
        form,
        calc,
        normalizeTypology,
      });

      await exportPdf({
        html,
        fileName: `Estudio - ${activeForm.projectName || "Proyecto"}.pdf`,
      });
    } catch (error) {
      console.error("Error exportando PDF del estudio:", error);
      showPdfInstallMessage?.();
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Redacción del estudio</Text>

      {renderCreatorBox?.()}
      {renderBaseBox?.()}

      <View style={styles.docBox}>
        <Text style={styles.docTitle}>
          11. Aplicación del modelo sectorial de costos al proyecto específico
        </Text>
      </View>

      <View style={styles.docBox}>
        <Text style={styles.docTitle}>11.1 Base metodológica</Text>
        <Text style={styles.docText}>
          Los valores unitarios, coeficientes, porcentajes y parámetros de cálculo aplicados al presente
          ejercicio corresponden a una metodología paramétrica construida a partir del análisis de 482
          proyectos viabilizados por la Subdirección de Infraestructura en Salud del Ministerio de Salud
          y Protección Social. En consecuencia, el resultado obtenido constituye una aproximación técnica
          de referencia para formulación preliminar, comparación sectorial y análisis inicial de viabilidad.
        </Text>
        <Text style={[styles.docText, { marginTop: 10 }]}>
          La lógica del modelo consiste en asociar variables del proyecto con referencias de costo
          unitario y coeficientes de administración técnica, a partir de atributos como localización
          territorial, región, zona logística, tipología y alcance de intervención. Sobre esa base se
          estiman los componentes de consultoría, construcción, urbanismo, infraestructura complementaria,
          sistema fotovoltaico, interventorías e incidencias logísticas, hasta consolidar un valor total
          preliminar del proyecto.
        </Text>
      </View>

      <View style={styles.docBox}>
        <Text style={styles.docTitle}>11.2 Información del proyecto</Text>
        <Text style={styles.docText}>
          El ejercicio corresponde al proyecto “{activeForm.projectName}”, localizado en el municipio de
          {` ${activeForm.municipality}`}, departamento de {` ${activeForm.department}`}. Conforme a la
          clasificación territorial adoptada, el proyecto se ubica en la región {` ${activeCalc.region}`},
          dentro de la zona logística {` ${activeCalc.zone}`}.
        </Text>
        <Text style={[styles.docText, { marginTop: 10 }]}>
          La tipología seleccionada corresponde a {` ${normalizedTypology}`} y el
          tipo de intervención es {` ${activeForm.intervention}`}. El área base de la edificación principal
          es de {` ${formatArea(activeCalc.area)}`} y el componente de urbanismo asociado corresponde a
          {` ${formatArea(activeCalc.urbanArea)}`}.{" "}
          {Number(activeCalc.infraArea || 0) > 0
            ? `Se incorporan ${formatArea(activeCalc.infraArea)} de infraestructura complementaria.`
            : "No se incorporan áreas de infraestructura complementaria."}{" "}
          {activeForm.fvType && activeForm.fvType !== "No aplica"
            ? `Se contempla un sistema fotovoltaico tipo ${activeForm.fvType} con cobertura del ${formatPlain(activeCalc.fvCoverage)}%.`
            : "No se contempla sistema fotovoltaico en el presente ejercicio."}
        </Text>
      </View>

      <View style={styles.docBox}>
        <Text style={styles.docTitle}>11.3 Metodología de cálculo</Text>

        <Text style={styles.docText}>
          <Text style={styles.docBold}>Estudios y diseños. </Text>
          Se obtiene multiplicando el área del proyecto por el valor unitario de referencia del componente:
          {` ${formatArea(activeCalc.area)} × ${formatCOP(activeCalc.studiesM2)}/m² = ${formatCOP(activeCalc.studies)}.`}
        </Text>

        <Text style={[styles.docText, { marginTop: 10 }]}>
          <Text style={styles.docBold}>Interventoría de estudios y diseños. </Text>
          Se calcula aplicando el {percent(activeCalc.pctEyD)} sobre el valor de estudios y diseños:
          {` ${formatCOP(activeCalc.studies)} × ${percent(activeCalc.pctEyD)} = ${formatCOP(activeCalc.interventoriaEyD)}.`}
        </Text>

        <Text style={[styles.docText, { marginTop: 10 }]}>
          <Text style={styles.docBold}>Construcción. </Text>
          Se estima mediante el producto entre el área principal y el valor unitario de construcción:
          {` ${formatArea(activeCalc.area)} × ${formatCOP(activeCalc.constructionM2)}/m² = ${formatCOP(activeCalc.construction)}.`}
        </Text>

        <Text style={[styles.docText, { marginTop: 10 }]}>
          <Text style={styles.docBold}>Urbanismo. </Text>
          Se calcula con base en el área de urbanismo y su valor unitario de referencia:
          {` ${formatArea(activeCalc.urbanArea)} × ${formatCOP(activeCalc.urbanismM2)}/m² = ${formatCOP(activeCalc.urbanism)}.`}
        </Text>

        <Text style={[styles.docText, { marginTop: 10 }]}>
          <Text style={styles.docBold}>Infraestructura complementaria. </Text>
          {Number(activeCalc.infraArea || 0) > 0
            ? `Se calcula con base en ${formatArea(activeCalc.infraArea)} y un valor unitario de ${formatCOP(activeCalc.infraM2)}/m², para un total de ${formatCOP(activeCalc.infra)}.`
            : `No aplica en el presente ejercicio, por lo que el valor estimado es ${formatCOP(activeCalc.infra)}.`}
        </Text>

        <Text style={[styles.docText, { marginTop: 10 }]}>
          <Text style={styles.docBold}>Sistema fotovoltaico. </Text>
          {activeForm.fvType && activeForm.fvType !== "No aplica"
            ? `Se adopta un valor unitario base de ${formatCOP(activeCalc.fvM2Base)}/m² y una cobertura del ${formatPlain(activeCalc.fvCoverage)}%. El valor resultante del componente asciende a ${formatCOP(activeCalc.fv)}.`
            : `No aplica en el presente ejercicio, por lo que el valor estimado es ${formatCOP(activeCalc.fv)}.`}
        </Text>

        <Text style={[styles.docText, { marginTop: 10 }]}>
          <Text style={styles.docBold}>Interventoría de obra. </Text>
          Se aplica el {percent(activeCalc.pctObra)} sobre el subtotal constructivo integrado por
          construcción, urbanismo, infraestructura complementaria y sistema fotovoltaico. El subtotal es de
          {` ${formatCOP(totalConstructionWithComponents)}`}, por lo que la interventoría de obra es de
          {` ${formatCOP(activeCalc.interventoriaObra)}.`}
        </Text>

        <Text style={[styles.docText, { marginTop: 10 }]}>
          <Text style={styles.docBold}>Sobrecosto logístico. </Text>
          {Number(activeCalc.logisticPct || 0) > 0
            ? `Se aplica un sobrecosto logístico del ${percent(activeCalc.logisticPct)}, equivalente a ${formatCOP(activeCalc.logisticCost)}.`
            : "No se aplica sobrecosto logístico, por cuanto el ejercicio no incorpora incidencias adicionales de transporte especial o condiciones extraordinarias de acceso."}
        </Text>
      </View>

      <View style={styles.docBox}>
        <Text style={styles.docTitle}>11.4 Soporte metodológico</Text>
        <Text style={styles.docText}>
          El modelo aplicado tiene carácter paramétrico y debe entenderse como una herramienta de
          estimación preliminar. En consecuencia, sus resultados son útiles para orientar la estructuración
          inicial del proyecto, establecer órdenes de magnitud presupuestal y soportar ejercicios
          comparativos dentro del sector salud.
        </Text>
        <Text style={[styles.docText, { marginTop: 10 }]}>
          No obstante, el valor obtenido no sustituye el presupuesto detallado del proyecto. En etapas
          posteriores deberá ser ajustado con base en estudios y diseños definitivos, memorias de cálculo,
          especificaciones técnicas, cantidades de obra, análisis de precios unitarios y demás soportes
          propios de la fase de factibilidad o ejecución.
        </Text>
      </View>

      <View style={styles.docBox}>
        <Text style={styles.docTitle}>11.5 Resultado del cálculo de componentes</Text>
        <Text style={styles.docText}>
          El ejercicio arroja un costo directo predominante en la edificación principal, complementado por
          urbanismo
          {activeForm.fvType && activeForm.fvType !== "No aplica"
            ? " y por la incorporación del sistema fotovoltaico como componente de sostenibilidad energética."
            : "."}{" "}
          La estructura del presupuesto muestra un peso principal en construcción, seguido por urbanismo,
          {activeForm.fvType && activeForm.fvType !== "No aplica" ? " sistema fotovoltaico," : ""}{" "}
          interventoría de obra y consultoría.
        </Text>
        <Text style={[styles.docText, { marginTop: 10 }]}>
          Desde la perspectiva técnica, la configuración del presupuesto es coherente con un proyecto de
          {` ${String(activeForm.intervention || "-").toLowerCase()}`} para la tipología
          {` ${normalizedTypology}`}, en el que la mayor incidencia económica está
          concentrada en la infraestructura física principal y su habilitación funcional.
        </Text>
      </View>

      <View style={styles.docBox}>
        <Text style={styles.docTitle}>12. Presupuesto del proyecto</Text>
      </View>

      <View style={styles.docBox}>
        <Text style={styles.docTitle}>12.1 Presupuesto consolidado</Text>
        <Text style={styles.docText}>
          El presupuesto consolidado del proyecto asciende a {formatCOP(activeCalc.totalProject)}, valor
          que incluye consultoría, construcción, urbanismo,
          {activeForm.fvType && activeForm.fvType !== "No aplica" ? " sistema fotovoltaico," : ""}{" "}
          interventoría de estudios y diseños, interventoría de obra
          {Number(activeCalc.logisticPct || 0) > 0
            ? " y sobrecosto logístico."
            : " y ausencia de sobrecosto logístico."}
        </Text>

        <View style={{ marginTop: 12 }}>
          {renderProjectTable(styles, rows)}
        </View>
      </View>

      <View style={styles.docBox}>
        <Text style={styles.docTitle}>12.2 Resumen presupuestal</Text>
        <Text style={styles.docText}>
          El total de consultoría es de <Text style={styles.docBold}>{formatCOP(activeCalc.totalConsulting)}</Text>.
        </Text>
        <Text style={styles.docText}>
          El total del componente constructivo es de <Text style={styles.docBold}>{formatCOP(activeCalc.totalConstruction)}</Text>.
        </Text>
        <Text style={styles.docText}>
          La construcción más interventoría de obra asciende a{" "}
          <Text style={styles.docBold}>{formatCOP(activeCalc.totalConstructionPlusInterventoria)}</Text>.
        </Text>
        <Text style={styles.docText}>
          El sobrecosto logístico corresponde a <Text style={styles.docBold}>{formatCOP(activeCalc.logisticCost)}</Text>.
        </Text>
        <Text style={styles.docText}>
          El valor total del proyecto es de <Text style={styles.docBold}>{formatCOP(activeCalc.totalProject)}</Text>.
        </Text>
        <Text style={styles.docText}>
          El área del proyecto es de <Text style={styles.docBold}>{formatArea(activeCalc.area)}</Text> y
          el valor promedio del proyecto corresponde a{" "}
          <Text style={styles.docBold}>{formatCOP(activeCalc.valueM2Project)}/m²</Text>.
        </Text>
      </View>

      <View style={styles.docBox}>
        <Text style={styles.docTitle}>13. Análisis del resultado presupuestal del proyecto</Text>

        <Text style={styles.docText}>
          <Text style={styles.docBold}>13.1 Valor m² del proyecto. </Text>
          El resultado presupuestal obtenido ubica el proyecto en un valor promedio de{" "}
          {formatCOP(activeCalc.valueM2Project)}/m², indicador que integra no solo el costo de la
          edificación principal, sino también los costos asociados de consultoría, urbanismo,
          {activeForm.fvType && activeForm.fvType !== "No aplica" ? " sistema fotovoltaico," : ""}{" "}
          interventorías
          {Number(activeCalc.logisticPct || 0) > 0 ? " y sobrecosto logístico." : "."}
        </Text>

        <Text style={[styles.docText, { marginTop: 10 }]}>
          <Text style={styles.docBold}>13.2 Interpretación técnica del resultado. </Text>
          Desde el punto de vista técnico, el comportamiento del presupuesto es consistente con una
          intervención de {String(activeForm.intervention || "-").toLowerCase()} para un
          {` ${normalizedTypology}`} en la región {` ${activeCalc.region}`},
          {Number(activeCalc.logisticPct || 0) > 0
            ? ` con una penalización logística del ${percent(activeCalc.logisticPct)}.`
            : " sin penalización logística adicional."}
        </Text>

        <Text style={[styles.docText, { marginTop: 10 }]}>
          <Text style={styles.docBold}>13.3 Coherencia con el mercado de infraestructura en salud. </Text>
          La distribución del presupuesto guarda coherencia con el comportamiento esperado del mercado de
          infraestructura en salud, en tanto la construcción representa el mayor peso dentro del costo
          total, seguida por urbanismo
          {activeForm.fvType && activeForm.fvType !== "No aplica" ? ", sistema fotovoltaico" : ""}{" "}
          e interventorías. Ello se alinea con la lógica de formulación de proyectos comparables dentro del
          sector.
        </Text>

        <Text style={[styles.docText, { marginTop: 10 }]}>
          <Text style={styles.docBold}>13.4 Alcance del ejercicio paramétrico. </Text>
          El presente resultado corresponde a una estimación paramétrica de referencia y no sustituye el
          presupuesto detallado del proyecto. Por consiguiente, deberá ser ajustado en etapas posteriores
          mediante estudios y diseños definitivos, memorias de cálculo, especificaciones técnicas,
          cantidades de obra y análisis de precios unitarios.
        </Text>

        {hasOptimization && (
          <Text style={[styles.docText, { marginTop: 10 }]}>
            Adicionalmente, el ejercicio incluyó un proceso de ajuste por valor techo. Como resultado, el
            escenario final adoptado por la herramienta corresponde a un valor total de{" "}
            <Text style={styles.docBold}>{formatCOP(optimizedCalc?.totalProject)}</Text>, con un ahorro
            estimado de <Text style={styles.docBold}>{formatCOP(calc.optimization.savings)}</Text>{" "}
            frente al escenario base.{" "}
            {optimizedCalc?.capCompliance
              ? "El escenario optimizado cumple el límite presupuestal definido."
              : "Aun con la aplicación de los ajustes programados, el proyecto no alcanza a cumplir totalmente el límite presupuestal."}
          </Text>
        )}
      </View>

      <View style={styles.rowActions}>
        <TouchableOpacity style={styles.buttonHalf} onPress={() => setView("inicio")}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonHalf} onPress={handleExportStudyPdf}>
          <Text style={styles.buttonText}>Exportar PDF</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}