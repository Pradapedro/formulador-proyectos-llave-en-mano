import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
} from "react-native";
import {
  formatCOP,
  formatNumberInput,
  sanitizeNumericInput,
  percent,
} from "../utils/formatters";
import {
  infraValues,
  logisticModes,
  interventionTypes,
  typologies,
} from "../data/constants";

const LOGISTIC_CALCULATION_OPTIONS = [
  {
    key: "automatico_pct",
    label: "Automático % x km",
  },
  {
    key: "vr_ton_km",
    label: "Vr tonelada-km",
  },
  {
    key: "vr_ton_ruta",
    label: "Vr tonelada-ruta",
  },
];

export default function FormScreen({
  styles,
  form,
  setForm,
  calc,
  manualZones,
  departmentModalVisible,
  setDepartmentModalVisible,
  departmentSearch,
  setDepartmentSearch,
  filteredDepartments,
  municipalityModalVisible,
  setMunicipalityModalVisible,
  municipalitySearch,
  setMunicipalitySearch,
  filteredMunicipalities,
  segments,
  updateSegment,
  addSegment,
  removeSegment,
  formErrors,
  saveProject,
  setView,
  renderCreatorBox,
  renderBaseBox,
  renderComponentSummary,
}) {
  const getSegmentCalculationOptions = (mode) => {
    if (mode === "Marítimo") {
      return LOGISTIC_CALCULATION_OPTIONS.filter(
        (item) => item.key !== "automatico_pct"
      );
    }
    return LOGISTIC_CALCULATION_OPTIONS;
  };

  const getUnitValueLabel = (calculationMode) => {
    if (calculationMode === "vr_ton_km") {
      return "Valor unitario ($/ton-km)";
    }
    if (calculationMode === "vr_ton_ruta") {
      return "Valor unitario ($/ton)";
    }
    return "Valor unitario";
  };

  const getUnitValuePlaceholder = (calculationMode) => {
    if (calculationMode === "vr_ton_km") {
      return "Ej: 2500";
    }
    if (calculationMode === "vr_ton_ruta") {
      return "Ej: 1470230";
    }
    return "0";
  };

  const isDistanceRequired = (calculationMode) =>
    calculationMode !== "vr_ton_ruta";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Formulario del proyecto</Text>

      {renderCreatorBox?.()}
      {renderBaseBox?.()}

      <View style={styles.card}>
        <Text style={styles.label}>Nombre del proyecto</Text>
        <TextInput
          style={styles.input}
          value={form.projectName}
          onChangeText={(text) => setForm({ ...form, projectName: text })}
          placeholder="Ingrese el nombre del proyecto"
          placeholderTextColor="#94A3B8"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Departamento</Text>
        <TouchableOpacity
          style={styles.selectBox}
          onPress={() => setDepartmentModalVisible(true)}
        >
          <Text style={styles.selectBoxText}>
            {form.department || "Seleccione un departamento"}
          </Text>
          <Text style={styles.selectBoxArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={departmentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDepartmentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Seleccionar departamento</Text>

            <TextInput
              style={styles.modalSearchInput}
              placeholder="Buscar departamento"
              placeholderTextColor="#94A3B8"
              value={departmentSearch}
              onChangeText={setDepartmentSearch}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredDepartments.map((dep) => (
                <TouchableOpacity
                  key={dep}
                  style={[
                    styles.modalItem,
                    form.department === dep && styles.modalItemActive,
                  ]}
                  onPress={() => {
                    setForm({ ...form, department: dep, municipality: "" });
                    setDepartmentModalVisible(false);
                    setDepartmentSearch("");
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      form.department === dep && styles.modalItemTextActive,
                    ]}
                  >
                    {dep}
                  </Text>
                </TouchableOpacity>
              ))}

              {filteredDepartments.length === 0 && (
                <View style={styles.emptySearchBox}>
                  <Text style={styles.emptySearchText}>
                    No se encontraron departamentos.
                  </Text>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setDepartmentModalVisible(false);
                setDepartmentSearch("");
              }}
            >
              <Text style={styles.modalCloseButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.card}>
        <Text style={styles.label}>Municipio</Text>
        <TouchableOpacity
          style={styles.selectBox}
          onPress={() => form.department && setMunicipalityModalVisible(true)}
        >
          <Text style={styles.selectBoxText}>
            {form.municipality ||
              (form.department
                ? "Seleccione un municipio"
                : "Seleccione primero un departamento")}
          </Text>
          <Text style={styles.selectBoxArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={municipalityModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMunicipalityModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Seleccionar municipio</Text>

            <TextInput
              style={styles.modalSearchInput}
              placeholder="Buscar municipio"
              placeholderTextColor="#94A3B8"
              value={municipalitySearch}
              onChangeText={setMunicipalitySearch}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredMunicipalities.map((municipality) => (
                <TouchableOpacity
                  key={municipality}
                  style={[
                    styles.modalItem,
                    form.municipality === municipality &&
                      styles.modalItemActive,
                  ]}
                  onPress={() => {
                    setForm({ ...form, municipality });
                    setMunicipalityModalVisible(false);
                    setMunicipalitySearch("");
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      form.municipality === municipality &&
                        styles.modalItemTextActive,
                    ]}
                  >
                    {municipality}
                  </Text>
                </TouchableOpacity>
              ))}

              {filteredMunicipalities.length === 0 && (
                <View style={styles.emptySearchBox}>
                  <Text style={styles.emptySearchText}>
                    No se encontraron municipios para este departamento.
                  </Text>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setMunicipalityModalVisible(false);
                setMunicipalitySearch("");
              }}
            >
              <Text style={styles.modalCloseButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.card}>
        <Text style={styles.label}>Tipo de intervención</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {interventionTypes.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.pill,
                form.intervention === item && styles.pillActive,
              ]}
              onPress={() => setForm({ ...form, intervention: item })}
            >
              <Text
                style={[
                  styles.pillText,
                  form.intervention === item && styles.pillTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Tipología</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {typologies.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.pill, form.typology === item && styles.pillActive]}
              onPress={() => setForm({ ...form, typology: item })}
            >
              <Text
                style={[
                  styles.pillText,
                  form.typology === item && styles.pillTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Valor estudios y diseños</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.pill,
              form.studyMode === "automatico" && styles.pillActive,
            ]}
            onPress={() => setForm({ ...form, studyMode: "automatico" })}
          >
            <Text
              style={[
                styles.pillText,
                form.studyMode === "automatico" && styles.pillTextActive,
              ]}
            >
              Automático por zona
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.pill,
              form.studyMode === "minimo" && styles.pillActive,
            ]}
            onPress={() => setForm({ ...form, studyMode: "minimo" })}
          >
            <Text
              style={[
                styles.pillText,
                form.studyMode === "minimo" && styles.pillTextActive,
              ]}
            >
              Valor mínimo ($160.000/m²)
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <Text style={[styles.smallLabel, { marginTop: 10 }]}>
          Valor aplicado actualmente
        </Text>
        <Text style={styles.value}>{formatCOP(calc?.studiesM2 || 0)}/m²</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Interventoría estudios y diseños</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.pill,
              form.eydInterventoriaMode === "automatico" && styles.pillActive,
            ]}
            onPress={() =>
              setForm({
                ...form,
                eydInterventoriaMode: "automatico",
                eydInterventoriaManual: "",
              })
            }
          >
            <Text
              style={[
                styles.pillText,
                form.eydInterventoriaMode === "automatico" &&
                  styles.pillTextActive,
              ]}
            >
              Automático por zona
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.pill,
              form.eydInterventoriaMode === "manual" && styles.pillActive,
            ]}
            onPress={() =>
              setForm({
                ...form,
                eydInterventoriaMode: "manual",
              })
            }
          >
            <Text
              style={[
                styles.pillText,
                form.eydInterventoriaMode === "manual" && styles.pillTextActive,
              ]}
            >
              Manual (%)
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {form.eydInterventoriaMode === "manual" && (
          <>
            <Text style={[styles.smallLabel, { marginTop: 10 }]}>
              Porcentaje manual E&D (4.0% a 7.5%)
            </Text>
            <TextInput
              style={styles.input}
              value={form.eydInterventoriaManual}
              keyboardType="decimal-pad"
              onChangeText={(text) =>
                setForm({
                  ...form,
                  eydInterventoriaManual: text.replace(/[^0-9.,]/g, ""),
                })
              }
              placeholder="Ej: 6.5"
              placeholderTextColor="#94A3B8"
            />
          </>
        )}

        <Text style={[styles.smallLabel, { marginTop: 10 }]}>
          Valor aplicado actualmente
        </Text>
        <Text style={styles.value}>{percent(calc?.pctEyD || 0)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Interventoría de obra</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.pill,
              form.obraInterventoriaMode === "automatico" && styles.pillActive,
            ]}
            onPress={() =>
              setForm({
                ...form,
                obraInterventoriaMode: "automatico",
                obraInterventoriaManual: "",
              })
            }
          >
            <Text
              style={[
                styles.pillText,
                form.obraInterventoriaMode === "automatico" &&
                  styles.pillTextActive,
              ]}
            >
              Automático por zona
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.pill,
              form.obraInterventoriaMode === "manual" && styles.pillActive,
            ]}
            onPress={() =>
              setForm({
                ...form,
                obraInterventoriaMode: "manual",
              })
            }
          >
            <Text
              style={[
                styles.pillText,
                form.obraInterventoriaMode === "manual" &&
                  styles.pillTextActive,
              ]}
            >
              Manual (%)
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {form.obraInterventoriaMode === "manual" && (
          <>
            <Text style={[styles.smallLabel, { marginTop: 10 }]}>
              Porcentaje manual obra (4.0% a 7.5%)
            </Text>
            <TextInput
              style={styles.input}
              value={form.obraInterventoriaManual}
              keyboardType="decimal-pad"
              onChangeText={(text) =>
                setForm({
                  ...form,
                  obraInterventoriaManual: text.replace(/[^0-9.,]/g, ""),
                })
              }
              placeholder="Ej: 6.0"
              placeholderTextColor="#94A3B8"
            />
          </>
        )}

        <Text style={[styles.smallLabel, { marginTop: 10 }]}>
          Valor aplicado actualmente
        </Text>
        <Text style={styles.value}>{percent(calc?.pctObra || 0)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Zona logística manual</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {manualZones.map((item) => (
            <TouchableOpacity
              key={item === "" ? "auto" : item}
              style={[
                styles.pill,
                form.manualZone === item && styles.pillActive,
              ]}
              onPress={() => setForm({ ...form, manualZone: item })}
            >
              <Text
                style={[
                  styles.pillText,
                  form.manualZone === item && styles.pillTextActive,
                ]}
              >
                {item === "" ? "Automática" : item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.rowDouble}>
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.label}>Región calculada</Text>
          <Text style={styles.value}>{calc?.region || "-"}</Text>
        </View>

        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.label}>Zona logística calculada</Text>
          <Text style={styles.value}>{calc?.zone || "-"}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Valor construcción base calculado ($/m²)
        </Text>
        <Text style={styles.value}>{formatCOP(calc?.constructionM2 || 0)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Valor techo del proyecto ($)</Text>
        <TextInput
          style={styles.input}
          value={formatNumberInput(form.valueCap)}
          keyboardType="numeric"
          placeholder="Opcional"
          placeholderTextColor="#94A3B8"
          onChangeText={(text) => {
            setForm({ ...form, valueCap: sanitizeNumericInput(text) });
          }}
        />
      </View>

      {calc?.hasValueCap && (
        <View
          style={[
            styles.card,
            { backgroundColor: calc.capCompliance ? "#ECFDF5" : "#FEF2F2" },
          ]}
        >
          <Text style={styles.label}>Evaluación frente al techo</Text>
          <Text style={styles.value}>
            {calc.capCompliance
              ? "✔ El proyecto cumple el valor techo"
              : "✖ El proyecto supera el valor techo"}
          </Text>
          <Text style={styles.label}>Diferencia</Text>
          <Text style={styles.value}>{formatCOP(calc.capDifference || 0)}</Text>
        </View>
      )}

      <View style={styles.rowDouble}>
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.label}>Área del proyecto (m²)</Text>
          <TextInput
            style={styles.input}
            value={formatNumberInput(form.area)}
            keyboardType="numeric"
            onChangeText={(text) =>
              setForm({ ...form, area: sanitizeNumericInput(text) })
            }
            placeholder="0"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.label}>Área de urbanismo (m²)</Text>
          <TextInput
            style={styles.input}
            value={formatNumberInput(form.urbanArea)}
            keyboardType="numeric"
            onChangeText={(text) =>
              setForm({ ...form, urbanArea: sanitizeNumericInput(text) })
            }
            placeholder="0"
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Infraestructura complementaria</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {Object.keys(infraValues).map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.pill,
                form.infraType === item && styles.pillActive,
              ]}
              onPress={() =>
                setForm({
                  ...form,
                  infraType: item,
                  infraArea: item === "No aplica" ? "0" : form.infraArea,
                })
              }
            >
              <Text
                style={[
                  styles.pillText,
                  form.infraType === item && styles.pillTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Área infraestructura complementaria (m²)
        </Text>
        <TextInput
          style={styles.input}
          value={formatNumberInput(form.infraArea)}
          keyboardType="numeric"
          onChangeText={(text) =>
            setForm({ ...form, infraArea: sanitizeNumericInput(text) })
          }
          placeholder="0"
          placeholderTextColor="#94A3B8"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Sistema fotovoltaico</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {["No aplica", "ON GRID", "OFF GRID"].map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.pill, form.fvType === item && styles.pillActive]}
              onPress={() =>
                setForm({
                  ...form,
                  fvType: item,
                  fvCoverage: item === "No aplica" ? "0" : form.fvCoverage,
                })
              }
            >
              <Text
                style={[
                  styles.pillText,
                  form.fvType === item && styles.pillTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.rowDouble}>
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.label}>Cobertura fotovoltaica (%)</Text>
          <TextInput
            style={styles.input}
            value={formatNumberInput(form.fvCoverage)}
            keyboardType="numeric"
            onChangeText={(text) =>
              setForm({ ...form, fvCoverage: sanitizeNumericInput(text) })
            }
            placeholder="0"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.label}>Valor fotovoltaico base ($/m²)</Text>
          <Text style={styles.value}>{formatCOP(calc?.fvM2Base || 0)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Aplicar sobrecosto logístico</Text>
        <View style={styles.rowPills}>
          {["No", "Sí"].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.pill,
                form.logisticApplies === item && styles.pillActive,
              ]}
              onPress={() => setForm({ ...form, logisticApplies: item })}
            >
              <Text
                style={[
                  styles.pillText,
                  form.logisticApplies === item && styles.pillTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {form.logisticApplies === "Sí" && (
        <View style={styles.card}>
          <Text style={styles.label}>Tramos logísticos</Text>

          {segments.map((seg, index) => {
            const availableCalculationOptions = getSegmentCalculationOptions(
              seg.mode
            );

            const helperText =
              seg.calculationMode === "automatico_pct"
                ? "Este método calcula el tramo con porcentaje por kilómetro sobre la obra base, y ese mismo porcentaje se aplica automáticamente al sistema fotovoltaico."
                : seg.calculationMode === "vr_ton_km"
                ? "Este método calcula el tramo con valor por tonelada-kilómetro usando el peso logístico base del proyecto."
                : "Este método calcula el tramo con valor por tonelada para toda la ruta, sin depender de kilómetros.";

            return (
              <View key={index} style={styles.segmentBox}>
                <Text style={styles.segmentTitle}>Tramo {index + 1}</Text>

                <Text style={styles.smallLabel}>Modalidad</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {logisticModes.map((mode) => (
                    <TouchableOpacity
                      key={mode}
                      style={[
                        styles.pillSmall,
                        seg.mode === mode && styles.pillActive,
                      ]}
                      onPress={() => {
                        const nextCalculationMode =
                          mode === "Marítimo" &&
                          seg.calculationMode === "automatico_pct"
                            ? "vr_ton_km"
                            : seg.calculationMode;

                        updateSegment(index, "mode", mode);
                        updateSegment(
                          index,
                          "calculationMode",
                          nextCalculationMode || "automatico_pct"
                        );
                      }}
                    >
                      <Text
                        style={[
                          styles.pillTextSmall,
                          seg.mode === mode && styles.pillTextActive,
                        ]}
                      >
                        {mode}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.smallLabel}>Método de cálculo</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {availableCalculationOptions.map((option) => (
                    <TouchableOpacity
                      key={option.key}
                      style={[
                        styles.pillSmall,
                        seg.calculationMode === option.key && styles.pillActive,
                      ]}
                      onPress={() =>
                        updateSegment(index, "calculationMode", option.key)
                      }
                    >
                      <Text
                        style={[
                          styles.pillTextSmall,
                          seg.calculationMode === option.key &&
                            styles.pillTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={[styles.smallLabel, { color: "#475569" }]}>
                  {helperText}
                </Text>

                {isDistanceRequired(seg.calculationMode) && (
                  <>
                    <Text style={styles.smallLabel}>Distancia (km)</Text>
                    <TextInput
                      style={styles.input}
                      value={formatNumberInput(seg.distance)}
                      keyboardType="numeric"
                      onChangeText={(text) =>
                        updateSegment(
                          index,
                          "distance",
                          sanitizeNumericInput(text)
                        )
                      }
                      placeholder="0"
                      placeholderTextColor="#94A3B8"
                    />
                  </>
                )}

                {(seg.calculationMode === "vr_ton_km" ||
                  seg.calculationMode === "vr_ton_ruta") && (
                  <>
                    <Text style={styles.smallLabel}>
                      {getUnitValueLabel(seg.calculationMode)}
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={formatNumberInput(seg.unitValue)}
                      keyboardType="numeric"
                      onChangeText={(text) =>
                        updateSegment(
                          index,
                          "unitValue",
                          sanitizeNumericInput(text)
                        )
                      }
                      placeholder={getUnitValuePlaceholder(seg.calculationMode)}
                      placeholderTextColor="#94A3B8"
                    />
                  </>
                )}

                {seg.mode === "Marítimo" && (
                  <Text style={[styles.smallLabel, { color: "#991B1B" }]}>
                    Marítimo solo se calcula por valor tonelada-km o valor
                    tonelada-ruta.
                  </Text>
                )}

                <View style={styles.inlineButtons}>
                  <TouchableOpacity
                    style={styles.smallButton}
                    onPress={() => removeSegment(index)}
                  >
                    <Text style={styles.smallButtonText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          <TouchableOpacity style={styles.buttonSecondary} onPress={addSegment}>
            <Text style={styles.buttonSecondaryText}>Agregar tramo</Text>
          </TouchableOpacity>
        </View>
      )}

      {renderComponentSummary?.()}

      <View style={styles.rowDouble}>
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.label}>Valor total proyecto</Text>
          <Text style={styles.value}>{formatCOP(calc?.totalProject || 0)}</Text>
        </View>

        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.label}>Valor m² del proyecto</Text>
          <Text style={styles.value}>
            {formatCOP(calc?.valueM2Project || 0)}
          </Text>
        </View>
      </View>

      {formErrors.length > 0 && (
        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>Validaciones pendientes</Text>
          {formErrors.map((item, index) => (
            <Text key={index} style={styles.warningText}>
              • {item}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.rowActions}>
        <TouchableOpacity
          style={styles.buttonThird}
          onPress={() => setView("ctv")}
        >
          <Text style={styles.buttonText}>CTV</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonThird}
          onPress={() => setView("estudio")}
        >
          <Text style={styles.buttonText}>Estudio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonThird} onPress={saveProject}>
          <Text style={styles.buttonText}>Guardar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
