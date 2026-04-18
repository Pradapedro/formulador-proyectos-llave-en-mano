import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { formatCOP } from "../utils/formatters";

function getProjectDisplayValues(project) {
  const calc = project?.calc || {};
  const optimization = calc?.optimization;

  if (optimization?.applied && optimization?.optimized) {
    return {
      scenarioLabel: optimization.optimized.capCompliance
        ? "Escenario optimizado"
        : "Optimizado sin cumplimiento",
      totalProject: optimization.optimized.totalProject ?? project.totalProject ?? 0,
      valueM2Project:
        optimization.optimized.valueM2Project ?? project.valueM2Project ?? 0,
      area: optimization.optimized.area ?? project.area ?? calc.area ?? 0,
      savings: optimization.savings ?? 0,
      optimized: true
    };
  }

  return {
    scenarioLabel: "Escenario base",
    totalProject: project.totalProject ?? calc.totalProject ?? 0,
    valueM2Project: project.valueM2Project ?? calc.valueM2Project ?? 0,
    area: project.area ?? calc.area ?? 0,
    savings: 0,
    optimized: false
  };
}

export default function HistoryScreen({
  styles,
  loadingProjects,
  projects,
  openProject,
  deleteProject,
  resetForm,
  setView,
  clearHistory,
  renderCreatorBox,
  normalizeTypology
}) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Historial de proyectos</Text>

      {renderCreatorBox?.()}

      {loadingProjects ? (
        <View style={styles.card}>
          <Text style={styles.value}>Cargando historial...</Text>
        </View>
      ) : projects.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.value}>No hay proyectos guardados.</Text>
        </View>
      ) : (
        projects.map((project) => {
          const display = getProjectDisplayValues(project);

          return (
            <View key={project.id} style={styles.card}>
              <TouchableOpacity onPress={() => openProject(project)}>
                <Text style={styles.label}>Proyecto</Text>
                <Text style={styles.value}>{project.name}</Text>

                <Text style={[styles.label, { marginTop: 10 }]}>Ubicación</Text>
                <Text style={styles.value}>
                  {project.department} · {project.municipality}
                </Text>

                <Text style={[styles.label, { marginTop: 10 }]}>
                  Intervención / Tipología
                </Text>
                <Text style={styles.value}>
                  {project.intervention} · {normalizeTypology(project.typology)}
                </Text>

                <Text style={[styles.label, { marginTop: 10 }]}>Escenario guardado</Text>
                <Text style={styles.value}>{display.scenarioLabel}</Text>

                <Text style={[styles.label, { marginTop: 10 }]}>Área final</Text>
                <Text style={styles.value}>
                  {Number(display.area || 0).toLocaleString("es-CO")} m²
                </Text>

                <Text style={[styles.label, { marginTop: 10 }]}>Valor total</Text>
                <Text style={styles.value}>{formatCOP(display.totalProject)}</Text>

                <Text style={[styles.label, { marginTop: 10 }]}>Valor m²</Text>
                <Text style={styles.value}>{formatCOP(display.valueM2Project)}</Text>

                {display.optimized && (
                  <>
                    <Text style={[styles.label, { marginTop: 10 }]}>
                      Ahorro por optimización
                    </Text>
                    <Text style={styles.value}>{formatCOP(display.savings)}</Text>
                  </>
                )}

                {!!project.createdAt && (
                  <>
                    <Text style={[styles.label, { marginTop: 10 }]}>Fecha de guardado</Text>
                    <Text style={styles.value}>
                      {new Date(project.createdAt).toLocaleString("es-CO")}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.projectActions}>
                <TouchableOpacity
                  style={styles.buttonMini}
                  onPress={() => openProject(project)}
                >
                  <Text style={styles.buttonMiniText}>Abrir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.buttonMiniDanger}
                  onPress={() => deleteProject(project.id)}
                >
                  <Text style={styles.buttonMiniDangerText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

      <View style={styles.rowActions}>
        <TouchableOpacity style={styles.buttonHalf} onPress={resetForm}>
          <Text style={styles.buttonText}>Nuevo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonHalf}
          onPress={() => setView("inicio")}
        >
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.buttonDanger} onPress={clearHistory}>
        <Text style={styles.buttonText}>Borrar historial</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}