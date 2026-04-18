export function validateProjectInput(project) {
  const errors = [];
  const warnings = [];

  if (!project.projectName) errors.push("Debe ingresar el nombre del proyecto.");
  if (!project.department) errors.push("Debe seleccionar el departamento.");
  if (!project.municipality) errors.push("Debe ingresar el municipio.");
  if (!project.intervention) errors.push("Debe seleccionar el tipo de intervención.");
  if (!project.typology) errors.push("Debe seleccionar la tipología.");

  if (!project.region) errors.push("No se pudo determinar la región del departamento.");
  if (!project.zone) errors.push("No se pudo determinar la zona logística del departamento.");

  if (!(project.area > 0)) errors.push("El área del proyecto debe ser mayor que cero.");
  if (project.urbanArea < 0) errors.push("El área de urbanismo no puede ser negativa.");
  if (project.infraArea < 0) errors.push("El área de infraestructura complementaria no puede ser negativa.");

  if (project.infraType === "No aplica" && project.infraArea > 0) {
    errors.push("Si la infraestructura complementaria no aplica, el área debe ser 0.");
  }

  if (project.fvType === "No aplica" && project.fvCoverage > 0) {
    errors.push("Si el sistema fotovoltaico no aplica, la cobertura debe ser 0.");
  }

  if (project.fvType !== "No aplica") {
    if (!(project.fvCoverage > 0)) {
      errors.push("La cobertura fotovoltaica debe ser mayor que 0.");
    }
    if (project.fvCoverage > 100) {
      errors.push("La cobertura fotovoltaica no puede ser mayor a 100.");
    }
  }

  if (project.logisticApplies === "Sí") {
    if (!project.segments.length) {
      errors.push("Si aplica logística, debe registrar al menos un tramo.");
    }

    project.segments.forEach((seg, i) => {
      if (!seg.mode) errors.push(`Debe seleccionar la modalidad del tramo ${i + 1}.`);
      if (!(seg.distance > 0)) errors.push(`La distancia del tramo ${i + 1} debe ser mayor que cero.`);
    });
  }

  const hasTrochaOrMular = project.segments.some(
    (s) => s.mode === "Trocha terrestre" || s.mode === "Mular"
  );

  if (project.manualZone === "Z1" && hasTrochaOrMular) {
    warnings.push("La zona manual Z1 puede ser inconsistente con tramos por trocha o mula.");
  }

  return { errors, warnings, isValid: errors.length === 0 };
}