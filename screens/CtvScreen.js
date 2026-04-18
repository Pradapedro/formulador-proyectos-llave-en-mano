import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { formatCOP, percent } from "../utils/formatters";

function formatArea(value) {
  return `${Number(value || 0).toLocaleString("es-CO")} m²`;
}

function formatPlainNumber(value) {
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
      ...calc.optimization.optimizedForm
    };
  }
  return form;
}

function buildCtvRows(form, calc) {
  const relationUrbanism =
    Number(calc?.area || 0) > 0
      ? Number(calc?.urbanArea || 0) / Number(calc?.area || 0)
      : 0;

  const totalConstructionWithComponents = Number(calc?.subtotalConstructivo || 0);

  const valueM2ConstructionWithComponents =
    Number(calc?.area || 0) > 0
      ? Math.round(totalConstructionWithComponents / Number(calc.area))
      : 0;

  return [
    {
      section: "Identificación del proyecto",
      concept: "Nombre del proyecto",
      value: form?.projectName || "-"
    },
    {
      section: "",
      concept: "Municipio",
      value: form?.municipality || "-"
    },
    {
      section: "",
      concept: "Departamento",
      value: form?.department || "-"
    },
    {
      section: "",
      concept: "Región",
      value: calc?.region || "-"
    },
    {
      section: "",
      concept: "Zona logística",
      value: calc?.zone || "-"
    },
    {
      section: "",
      concept: "Tipología",
      value: calc?.normalizedTypology || form?.typology || "-"
    },
    {
      section: "",
      concept: "Tipo de intervención",
      value: form?.intervention || "-"
    },

    {
      section: "Dimensionamiento del proyecto",
      concept: "Área del proyecto",
      value: formatArea(calc?.area)
    },
    {
      section: "",
      concept: "Área urbanismo",
      value: formatArea(calc?.urbanArea)
    },
    {
      section: "",
      concept: "Relación urbanismo / área proyecto",
      value: percent(relationUrbanism)
    },

    {
      section: "Parámetros técnicos unitarios",
      concept: "Valor m² estudios y diseños",
      value: `${formatCOP(calc?.studiesM2)}/m²`
    },
    {
      section: "",
      concept: "Valor m² construcción",
      value: `${formatCOP(calc?.constructionM2)}/m²`
    },
    {
      section: "",
      concept: "Valor m² urbanismo",
      value: `${formatCOP(calc?.urbanismM2)}/m²`
    },
    {
      section: "",
      concept: "Valor m² sistema fotovoltaico",
      value:
        form?.fvType && form?.fvType !== "No aplica"
          ? `${formatCOP(calc?.fvM2Base)}/m²`
          : "No aplica"
    },
    {
      section: "",
      concept: "Sistema fotovoltaico",
      value: form?.fvType || "No aplica"
    },
    {
      section: "",
      concept: "Cobertura sistema fotovoltaico",
      value:
        form?.fvType && form?.fvType !== "No aplica"
          ? `${formatPlainNumber(calc?.fvCoverage)}%`
          : "No aplica"
    },

    {
      section: "Costos por componente",
      concept: "Valor estudios y diseños",
      value: formatCOP(calc?.studies)
    },
    {
      section: "",
      concept: "Valor construcción",
      value: formatCOP(calc?.construction)
    },
    {
      section: "",
      concept: "Valor urbanismo",
      value: formatCOP(calc?.urbanism)
    },
    {
      section: "",
      concept: "Valor infraestructura complementaria",
      value: formatCOP(calc?.infra)
    },
    {
      section: "",
      concept: "Valor sistema fotovoltaico",
      value: formatCOP(calc?.fv)
    },

    {
      section: "Subtotal técnico de obra",
      concept: "Total construcción con componentes",
      value: formatCOP(totalConstructionWithComponents)
    },
    {
      section: "",
      concept: "Valor m² construcción con componentes",
      value: `${formatCOP(valueM2ConstructionWithComponents)}/m²`
    },

    {
      section: "Costos de control y gestión",
      concept: "% interventoría estudios y diseños",
      value: percent(calc?.pctEyD)
    },
    {
      section: "",
      concept: "Valor interventoría estudios y diseños",
      value: formatCOP(calc?.interventoriaEyD)
    },
    {
      section: "",
      concept: "% interventoría de obra",
      value: percent(calc?.pctObra)
    },
    {
      section: "",
      concept: "Valor interventoría de obra",
      value: formatCOP(calc?.interventoriaObra)
    },

    {
      section: "Costos logísticos",
      concept: "Sobrecosto logístico",
      value: formatCOP(calc?.logisticCost)
    },
    {
      section: "",
      concept: "% sobrecosto logístico",
      value: percent(calc?.logisticPct)
    },

    {
      section: "Resultado financiero del proyecto",
      concept: "Valor total del proyecto",
      value: formatCOP(calc?.totalProject)
    },
    {
      section: "",
      concept: "Valor promedio del proyecto",
      value: `${formatCOP(calc?.valueM2Project)}/m²`
    }
  ];
}

function getRowStyle(styles, section) {
  if (section === "Resultado financiero del proyecto") return styles.ctvFinanceRow;
  if (section === "Subtotal técnico de obra") return styles.ctvSubtotalRow;
  if (section === "Costos por componente" || section === "Costos de control y gestión") {
    return styles.ctvSoftHighlightRow;
  }
  return styles.ctvNormalRow;
}

function getCtvNote(calc) {
  if (calc?.optimization?.applied && calc?.optimization?.optimized) {
    const optimized = calc.optimization.optimized;

    return optimized.capCompliance
      ? "La presente tabla CTV corresponde al escenario optimizado del proyecto, seleccionado automáticamente por la herramienta debido a que el escenario base superaba el valor techo. En consecuencia, los valores aquí presentados reflejan el presupuesto ajustado que cumple el límite presupuestal definido."
      : "La presente tabla CTV corresponde al escenario optimizado del proyecto, seleccionado automáticamente por la herramienta debido a que el escenario base superaba el valor techo. Aunque se aplicaron todos los ajustes programados, el proyecto aún no logra cumplir el límite presupuestal; por ello, esta tabla muestra el mejor escenario alcanzado por la herramienta.";
  }

  return "La presente tabla CTV corresponde al escenario base del proyecto, calculado a partir de los parámetros técnicos y presupuestales definidos en la formulación.";
}

export default function CtvScreen({
  styles,
  form,
  calc,
  setView,
  showPdfInstallMessage,
  renderCreatorBox,
  renderBaseBox
}) {
  const activeCalc = getActiveCalc(calc);
  const activeForm = getActiveForm(form, calc);
  const rows = buildCtvRows(activeForm, activeCalc);
  const ctvNote = getCtvNote(calc);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Resumen tipo CTV</Text>

      {renderCreatorBox?.()}
      {renderBaseBox?.()}

      <View style={styles.docBox}>
        <Text style={styles.docTitle}>Nota técnica de composición del CTV</Text>
        <Text style={styles.docText}>{ctvNote}</Text>

        {calc?.optimization?.applied && calc?.optimization?.adjustments?.length > 0 && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.docText}>Ajustes aplicados:</Text>
            {calc.optimization.adjustments.map((item, index) => (
              <Text key={`adj-${index}`} style={styles.docText}>
                {index + 1}. {item}
              </Text>
            ))}
          </View>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View style={styles.ctvVerticalTable}>
          <View style={styles.ctvVerticalHeader}>
            <Text style={[styles.ctvVerticalHeadText, { flex: 1.35 }]}>Grupo</Text>
            <Text style={[styles.ctvVerticalHeadText, { flex: 1.45 }]}>Concepto</Text>
            <Text style={[styles.ctvVerticalHeadText, { flex: 1.8 }]}>Valor</Text>
          </View>

          {rows.map((row, index) => {
            const showSection = row.section && row.section.trim() !== "";

            return (
              <View
                key={`ctv-row-${index}`}
                style={[styles.ctvVerticalRow, getRowStyle(styles, row.section)]}
              >
                <View
                  style={[
                    styles.ctvVerticalCell,
                    styles.ctvVerticalSectionCell,
                    { flex: 1.35 }
                  ]}
                >
                  <Text style={styles.ctvVerticalSectionText}>
                    {showSection ? row.section : ""}
                  </Text>
                </View>

                <View
                  style={[
                    styles.ctvVerticalCell,
                    styles.ctvVerticalConceptCell,
                    { flex: 1.45 }
                  ]}
                >
                  <Text style={styles.ctvVerticalConceptText}>{row.concept}</Text>
                </View>

                <View
                  style={[
                    styles.ctvVerticalCell,
                    styles.ctvVerticalValueCell,
                    { flex: 1.8 }
                  ]}
                >
                  <Text
                    style={[
                      styles.ctvVerticalValueText,
                      row.section === "Resultado financiero del proyecto" &&
                        styles.ctvVerticalValueTextStrong
                    ]}
                  >
                    {row.value}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {calc?.hasValueCap && (
        <View
          style={[
            styles.docBox,
            { backgroundColor: activeCalc?.capCompliance ? "#ECFDF5" : "#FEF2F2" }
          ]}
        >
          <Text style={styles.docTitle}>Validación frente al valor techo</Text>
          <Text style={styles.docText}>
            Valor techo: <Text style={styles.docBold}>{formatCOP(calc?.valueCap || 0)}</Text>
          </Text>
          <Text style={styles.docText}>
            Estado final:{" "}
            <Text style={styles.docBold}>
              {activeCalc?.capCompliance ? "Cumple" : "No cumple"}
            </Text>
          </Text>
          <Text style={styles.docText}>
            Diferencia final:{" "}
            <Text style={styles.docBold}>
              {formatCOP(Math.abs(activeCalc?.capDifference || 0))}
            </Text>
          </Text>
        </View>
      )}

      {calc?.optimization?.applied && calc?.optimization?.optimized && (
        <View style={styles.docBox}>
          <Text style={styles.docTitle}>Resumen del ajuste por valor techo</Text>
          <Text style={styles.docText}>
            Escenario base:{" "}
            <Text style={styles.docBold}>{formatCOP(calc?.totalProject || 0)}</Text>
          </Text>
          <Text style={styles.docText}>
            Escenario final mostrado en CTV:{" "}
            <Text style={styles.docBold}>
              {formatCOP(calc?.optimization?.optimized?.totalProject || 0)}
            </Text>
          </Text>
          <Text style={styles.docText}>
            Ahorro estimado:{" "}
            <Text style={styles.docBold}>{formatCOP(calc?.optimization?.savings || 0)}</Text>
          </Text>
          <Text style={styles.docText}>
            Área final del proyecto:{" "}
            <Text style={styles.docBold}>
              {Number(calc?.optimization?.optimized?.area || 0).toLocaleString("es-CO")} m²
            </Text>
          </Text>
        </View>
      )}

      <View style={styles.rowActions}>
        <TouchableOpacity style={styles.buttonHalf} onPress={() => setView("inicio")}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonHalf} onPress={showPdfInstallMessage}>
          <Text style={styles.buttonText}>Exportar PDF</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}