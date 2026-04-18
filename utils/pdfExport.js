const formatCurrency = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatNumber = (value, digits = 2) =>
  new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(Number(value || 0));

const formatPercent = (value, digits = 2) =>
  `${formatNumber(Number(value || 0) * 100, digits)}%`;

const formatArea = (value) =>
  `${Number(value || 0).toLocaleString("es-CO")} m²`;

const formatPlain = (value) =>
  Number(value || 0).toLocaleString("es-CO");

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const normalizeTypologySafe = (value) => {
  if (!value) return "-";
  return value;
};

const getScenario = (form, calc) => {
  const hasOptimization =
    calc?.optimization?.applied && calc?.optimization?.optimized;

  const activeCalc = hasOptimization ? calc.optimization.optimized : calc;

  const activeForm =
    hasOptimization && calc?.optimization?.optimizedForm
      ? { ...form, ...calc.optimization.optimizedForm }
      : form;

  return { activeCalc, activeForm, hasOptimization };
};

const getBaseStyles = () => `
  <style>
    * {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #0f172a;
      font-family: Arial, Helvetica, sans-serif;
    }

    body {
      font-size: 11px;
      line-height: 1.45;
      padding: 16mm 14mm;
      background: #ffffff;
    }

    h1, h2, h3 {
      margin: 0 0 8px 0;
      color: #0f172a;
    }

    h1 {
      font-size: 18px;
      margin-bottom: 10px;
    }

    h2 {
      font-size: 14px;
      margin-top: 18px;
    }

    h3 {
      font-size: 12px;
      margin-top: 12px;
    }

    p {
      margin: 0 0 8px 0;
    }

    .muted {
      color: #475569;
    }

    .box {
      border: 1px solid #d1d5db;
      border-radius: 14px;
      padding: 14px 16px;
      margin-bottom: 14px;
      page-break-inside: avoid;
      break-inside: avoid;
      background: #f8fafc;
    }

    .section-title {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 6px;
    }

    .doc-title {
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .doc-text {
      font-size: 11px;
      line-height: 1.55;
      color: #1f2937;
    }

    .bold {
      font-weight: 700;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      margin-bottom: 14px;
    }

    th, td {
      border: 1px solid #94a3b8;
      padding: 7px 8px;
      vertical-align: top;
      font-size: 10px;
      word-break: break-word;
    }

    th {
      background: #1f4e78;
      color: #ffffff;
      text-align: center;
      font-weight: bold;
    }

    .section {
      background: #d9e2f3;
      font-weight: bold;
    }

    @page {
      size: A4;
      margin: 12mm;
    }

    @media print {
      body {
        padding: 0;
      }

      .box {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      tr, td, th {
        break-inside: avoid;
        page-break-inside: avoid;
      }
    }
  </style>
`;

const exportPdfWeb = async ({ html, fileName = "documento.pdf" }) => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("La exportación PDF solo está disponible en web.");
  }

  const printWindow = window.open("", "_blank", "width=900,height=1200");

  if (!printWindow) {
    throw new Error(
      "El navegador bloqueó la ventana emergente. Habilita pop-ups para continuar."
    );
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.document.title = fileName.replace(".pdf", "");

  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 800);
};

const buildProjectTableRows = (form, calc) => {
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
    ["Identificación del proyecto", "Nombre del proyecto", form?.projectName || "-"],
    ["", "Municipio", form?.municipality || "-"],
    ["", "Departamento", form?.department || "-"],
    ["", "Región", calc?.region || "-"],
    ["", "Zona logística", calc?.zone || "-"],
    ["", "Tipología", calc?.normalizedTypology || form?.typology || "-"],
    ["", "Tipo de intervención", form?.intervention || "-"],

    ["Dimensionamiento del proyecto", "Área del proyecto", formatArea(calc?.area)],
    ["", "Área urbanismo", formatArea(calc?.urbanArea)],
    ["", "Relación urbanismo / área proyecto", formatPercent(relationUrbanism)],

    ["Parámetros técnicos unitarios", "Valor m² estudios y diseños", `${formatCurrency(calc?.studiesM2)}/m²`],
    ["", "Valor m² construcción", `${formatCurrency(calc?.constructionM2)}/m²`],
    ["", "Valor m² urbanismo", `${formatCurrency(calc?.urbanismM2)}/m²`],
    [
      "",
      "Valor m² sistema fotovoltaico",
      form?.fvType && form?.fvType !== "No aplica"
        ? `${formatCurrency(calc?.fvM2Base)}/m²`
        : "No aplica"
    ],
    ["", "Sistema fotovoltaico", form?.fvType || "No aplica"],
    [
      "",
      "Cobertura sistema fotovoltaico",
      form?.fvType && form?.fvType !== "No aplica"
        ? `${formatPlain(calc?.fvCoverage)}%`
        : "No aplica"
    ],

    ["Costos por componente", "Valor estudios y diseños", formatCurrency(calc?.studies)],
    ["", "Valor construcción", formatCurrency(calc?.construction)],
    ["", "Valor urbanismo", formatCurrency(calc?.urbanism)],
    ["", "Valor infraestructura complementaria", formatCurrency(calc?.infra)],
    ["", "Valor sistema fotovoltaico", formatCurrency(calc?.fv)],

    ["Subtotal técnico de obra", "Total construcción con componentes", formatCurrency(totalConstructionWithComponents)],
    ["", "Valor m² construcción con componentes", `${formatCurrency(valueM2ConstructionWithComponents)}/m²`],

    ["Costos de control y gestión", "% interventoría estudios y diseños", formatPercent(calc?.pctEyD)],
    ["", "Valor interventoría estudios y diseños", formatCurrency(calc?.interventoriaEyD)],
    ["", "% interventoría de obra", formatPercent(calc?.pctObra)],
    ["", "Valor interventoría de obra", formatCurrency(calc?.interventoriaObra)],

    ["Costos logísticos", "Sobrecosto logístico", formatCurrency(calc?.logisticCost)],
    ["", "% sobrecosto logístico", formatPercent(calc?.logisticPct)],

    ["Resultado financiero del proyecto", "Valor total del proyecto", formatCurrency(calc?.totalProject)],
    ["", "Valor promedio del proyecto", `${formatCurrency(calc?.valueM2Project)}/m²`]
  ];
};

const buildProjectTableHtml = (rows) => {
  const body = rows
    .map(([section, concept, value]) => {
      const isSectionStart = !!section;
      return `
        <tr>
          <td class="${isSectionStart ? "section" : ""}" style="width: 30%;">${escapeHtml(section || "")}</td>
          <td style="width: 38%;">${escapeHtml(concept || "")}</td>
          <td style="width: 32%;">${escapeHtml(value || "")}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <table>
      <tr>
        <th style="width: 30%;">Grupo</th>
        <th style="width: 38%;">Concepto</th>
        <th style="width: 32%;">Valor</th>
      </tr>
      ${body}
    </table>
  `;
};

export const buildStudyHtml = ({ form, calc, normalizeTypology }) => {
  const { activeCalc, activeForm, hasOptimization } = getScenario(form, calc);

  const normalizedTypology =
    (typeof normalizeTypology === "function"
      ? normalizeTypology(activeForm?.typology)
      : activeCalc?.normalizedTypology || normalizeTypologySafe(activeForm?.typology)) || "-";

  const rows = buildProjectTableRows(
    { ...activeForm, normalizedTypology },
    activeCalc
  );

  const totalConstructionWithComponents = Number(activeCalc?.subtotalConstructivo || 0);
  const optimizedCalc = hasOptimization ? calc.optimization.optimized : null;

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Estudio - ${escapeHtml(activeForm.projectName || "Proyecto")}</title>
        ${getBaseStyles()}
      </head>
      <body>
        <h1>Estudio del proyecto</h1>
        <p class="muted">
          Proyecto: <strong>${escapeHtml(activeForm.projectName || "-")}</strong><br/>
          Municipio: ${escapeHtml(activeForm.municipality || "-")}<br/>
          Departamento: ${escapeHtml(activeForm.department || "-")}<br/>
          Tipología: ${escapeHtml(normalizedTypology)}<br/>
          Escenario analizado: ${hasOptimization ? "Optimizado final" : "Base"}
        </p>

        <div class="box">
          <div class="section-title">11. Aplicación del modelo sectorial de costos al proyecto específico</div>
        </div>

        <div class="box">
          <div class="doc-title">11.1 Base metodológica</div>
          <p class="doc-text">
            Los valores unitarios, coeficientes, porcentajes y parámetros de cálculo aplicados al presente
            ejercicio corresponden a una metodología paramétrica construida a partir del análisis de 482
            proyectos viabilizados por la Subdirección de Infraestructura en Salud del Ministerio de Salud
            y Protección Social. En consecuencia, el resultado obtenido constituye una aproximación técnica
            de referencia para formulación preliminar, comparación sectorial y análisis inicial de viabilidad.
          </p>
          <p class="doc-text" style="margin-top: 10px;">
            La lógica del modelo consiste en asociar variables del proyecto con referencias de costo
            unitario y coeficientes de administración técnica, a partir de atributos como localización
            territorial, región, zona logística, tipología y alcance de intervención. Sobre esa base se
            estiman los componentes de consultoría, construcción, urbanismo, infraestructura complementaria,
            sistema fotovoltaico, interventorías e incidencias logísticas, hasta consolidar un valor total
            preliminar del proyecto.
          </p>
        </div>

        <div class="box">
          <div class="doc-title">11.2 Información del proyecto</div>
          <p class="doc-text">
            El ejercicio corresponde al proyecto “${escapeHtml(activeForm.projectName || "-")}”, localizado en el municipio de
            ${escapeHtml(activeForm.municipality || "-")}, departamento de ${escapeHtml(activeForm.department || "-")}. Conforme a la
            clasificación territorial adoptada, el proyecto se ubica en la región ${escapeHtml(activeCalc.region || "-")},
            dentro de la zona logística ${escapeHtml(activeCalc.zone || "-")}.
          </p>
          <p class="doc-text" style="margin-top: 10px;">
            La tipología seleccionada corresponde a ${escapeHtml(normalizedTypology)} y el
            tipo de intervención es ${escapeHtml(activeForm.intervention || "-")}. El área base de la edificación principal
            es de ${escapeHtml(formatArea(activeCalc.area))} y el componente de urbanismo asociado corresponde a
            ${escapeHtml(formatArea(activeCalc.urbanArea))}.
            ${
              Number(activeCalc.infraArea || 0) > 0
                ? ` Se incorporan ${escapeHtml(formatArea(activeCalc.infraArea))} de infraestructura complementaria.`
                : " No se incorporan áreas de infraestructura complementaria."
            }
            ${
              activeForm.fvType && activeForm.fvType !== "No aplica"
                ? ` Se contempla un sistema fotovoltaico tipo ${escapeHtml(activeForm.fvType)} con cobertura del ${escapeHtml(formatPlain(activeCalc.fvCoverage))}%.`
                : " No se contempla sistema fotovoltaico en el presente ejercicio."
            }
          </p>
        </div>

        <div class="box">
          <div class="doc-title">11.3 Metodología de cálculo</div>

          <p class="doc-text">
            <span class="bold">Estudios y diseños. </span>
            Se obtiene multiplicando el área del proyecto por el valor unitario de referencia del componente:
            ${escapeHtml(formatArea(activeCalc.area))} × ${escapeHtml(formatCurrency(activeCalc.studiesM2))}/m² = ${escapeHtml(formatCurrency(activeCalc.studies))}.
          </p>

          <p class="doc-text" style="margin-top: 10px;">
            <span class="bold">Interventoría de estudios y diseños. </span>
            Se calcula aplicando el ${escapeHtml(formatPercent(activeCalc.pctEyD))} sobre el valor de estudios y diseños:
            ${escapeHtml(formatCurrency(activeCalc.studies))} × ${escapeHtml(formatPercent(activeCalc.pctEyD))} = ${escapeHtml(formatCurrency(activeCalc.interventoriaEyD))}.
          </p>

          <p class="doc-text" style="margin-top: 10px;">
            <span class="bold">Construcción. </span>
            Se estima mediante el producto entre el área principal y el valor unitario de construcción:
            ${escapeHtml(formatArea(activeCalc.area))} × ${escapeHtml(formatCurrency(activeCalc.constructionM2))}/m² = ${escapeHtml(formatCurrency(activeCalc.construction))}.
          </p>

          <p class="doc-text" style="margin-top: 10px;">
            <span class="bold">Urbanismo. </span>
            Se calcula con base en el área de urbanismo y su valor unitario de referencia:
            ${escapeHtml(formatArea(activeCalc.urbanArea))} × ${escapeHtml(formatCurrency(activeCalc.urbanismM2))}/m² = ${escapeHtml(formatCurrency(activeCalc.urbanism))}.
          </p>

          <p class="doc-text" style="margin-top: 10px;">
            <span class="bold">Infraestructura complementaria. </span>
            ${
              Number(activeCalc.infraArea || 0) > 0
                ? `Se calcula con base en ${escapeHtml(formatArea(activeCalc.infraArea))} y un valor unitario de ${escapeHtml(formatCurrency(activeCalc.infraM2))}/m², para un total de ${escapeHtml(formatCurrency(activeCalc.infra))}.`
                : `No aplica en el presente ejercicio, por lo que el valor estimado es ${escapeHtml(formatCurrency(activeCalc.infra))}.`
            }
          </p>

          <p class="doc-text" style="margin-top: 10px;">
            <span class="bold">Sistema fotovoltaico. </span>
            ${
              activeForm.fvType && activeForm.fvType !== "No aplica"
                ? `Se adopta un valor unitario base de ${escapeHtml(formatCurrency(activeCalc.fvM2Base))}/m² y una cobertura del ${escapeHtml(formatPlain(activeCalc.fvCoverage))}%. El valor resultante del componente asciende a ${escapeHtml(formatCurrency(activeCalc.fv))}.`
                : `No aplica en el presente ejercicio, por lo que el valor estimado es ${escapeHtml(formatCurrency(activeCalc.fv))}.`
            }
          </p>

          <p class="doc-text" style="margin-top: 10px;">
            <span class="bold">Interventoría de obra. </span>
            Se aplica el ${escapeHtml(formatPercent(activeCalc.pctObra))} sobre el subtotal constructivo integrado por
            construcción, urbanismo, infraestructura complementaria y sistema fotovoltaico. El subtotal es de
            ${escapeHtml(formatCurrency(totalConstructionWithComponents))}, por lo que la interventoría de obra es de
            ${escapeHtml(formatCurrency(activeCalc.interventoriaObra))}.
          </p>

          <p class="doc-text" style="margin-top: 10px;">
            <span class="bold">Sobrecosto logístico. </span>
            ${
              Number(activeCalc.logisticPct || 0) > 0
                ? `Se aplica un sobrecosto logístico del ${escapeHtml(formatPercent(activeCalc.logisticPct))}, equivalente a ${escapeHtml(formatCurrency(activeCalc.logisticCost))}.`
                : "No se aplica sobrecosto logístico, por cuanto el ejercicio no incorpora incidencias adicionales de transporte especial o condiciones extraordinarias de acceso."
            }
          </p>
        </div>

        <div class="box">
          <div class="doc-title">11.4 Soporte metodológico</div>
          <p class="doc-text">
            El modelo aplicado tiene carácter paramétrico y debe entenderse como una herramienta de
            estimación preliminar. En consecuencia, sus resultados son útiles para orientar la estructuración
            inicial del proyecto, establecer órdenes de magnitud presupuestal y soportar ejercicios
            comparativos dentro del sector salud.
          </p>
          <p class="doc-text" style="margin-top: 10px;">
            No obstante, el valor obtenido no sustituye el presupuesto detallado del proyecto. En etapas
            posteriores deberá ser ajustado con base en estudios y diseños definitivos, memorias de cálculo,
            especificaciones técnicas, cantidades de obra, análisis de precios unitarios y demás soportes
            propios de la fase de factibilidad o ejecución.
          </p>
        </div>

        <div class="box">
          <div class="doc-title">11.5 Resultado del cálculo de componentes</div>
          <p class="doc-text">
            El ejercicio arroja un costo directo predominante en la edificación principal, complementado por
            urbanismo
            ${
              activeForm.fvType && activeForm.fvType !== "No aplica"
                ? " y por la incorporación del sistema fotovoltaico como componente de sostenibilidad energética."
                : "."
            }
            La estructura del presupuesto muestra un peso principal en construcción, seguido por urbanismo,
            ${
              activeForm.fvType && activeForm.fvType !== "No aplica"
                ? " sistema fotovoltaico,"
                : ""
            }
            interventoría de obra y consultoría.
          </p>
          <p class="doc-text" style="margin-top: 10px;">
            Desde la perspectiva técnica, la configuración del presupuesto es coherente con un proyecto de
            ${escapeHtml(String(activeForm.intervention || "-").toLowerCase())} para la tipología
            ${escapeHtml(normalizedTypology)}, en el que la mayor incidencia económica está
            concentrada en la infraestructura física principal y su habilitación funcional.
          </p>
        </div>

        <div class="box">
          <div class="section-title">12. Presupuesto del proyecto</div>
        </div>

        <div class="box">
          <div class="doc-title">12.1 Presupuesto consolidado</div>
          <p class="doc-text">
            El presupuesto consolidado del proyecto asciende a ${escapeHtml(formatCurrency(activeCalc.totalProject))}, valor
            que incluye consultoría, construcción, urbanismo,
            ${
              activeForm.fvType && activeForm.fvType !== "No aplica"
                ? " sistema fotovoltaico,"
                : ""
            }
            interventoría de estudios y diseños, interventoría de obra
            ${
              Number(activeCalc.logisticPct || 0) > 0
                ? " y sobrecosto logístico."
                : " y ausencia de sobrecosto logístico."
            }
          </p>

          ${buildProjectTableHtml(rows)}
        </div>

        <div class="box">
          <div class="doc-title">12.2 Resumen presupuestal</div>
          <p class="doc-text">El total de consultoría es de <span class="bold">${escapeHtml(formatCurrency(activeCalc.totalConsulting))}</span>.</p>
          <p class="doc-text">El total del componente constructivo es de <span class="bold">${escapeHtml(formatCurrency(activeCalc.totalConstruction))}</span>.</p>
          <p class="doc-text">La construcción más interventoría de obra asciende a <span class="bold">${escapeHtml(formatCurrency(activeCalc.totalConstructionPlusInterventoria))}</span>.</p>
          <p class="doc-text">El sobrecosto logístico corresponde a <span class="bold">${escapeHtml(formatCurrency(activeCalc.logisticCost))}</span>.</p>
          <p class="doc-text">El valor total del proyecto es de <span class="bold">${escapeHtml(formatCurrency(activeCalc.totalProject))}</span>.</p>
          <p class="doc-text">El área del proyecto es de <span class="bold">${escapeHtml(formatArea(activeCalc.area))}</span> y el valor promedio del proyecto corresponde a <span class="bold">${escapeHtml(formatCurrency(activeCalc.valueM2Project))}/m²</span>.</p>
        </div>

        <div class="box">
          <div class="section-title">13. Análisis del resultado presupuestal del proyecto</div>

          <p class="doc-text">
            <span class="bold">13.1 Valor m² del proyecto. </span>
            El resultado presupuestal obtenido ubica el proyecto en un valor promedio de
            ${escapeHtml(formatCurrency(activeCalc.valueM2Project))}/m², indicador que integra no solo el costo de la
            edificación principal, sino también los costos asociados de consultoría, urbanismo,
            ${
              activeForm.fvType && activeForm.fvType !== "No aplica"
                ? " sistema fotovoltaico,"
                : ""
            }
            interventorías
            ${Number(activeCalc.logisticPct || 0) > 0 ? " y sobrecosto logístico." : "."}
          </p>

          <p class="doc-text" style="margin-top: 10px;">
            <span class="bold">13.2 Interpretación técnica del resultado. </span>
            Desde el punto de vista técnico, el comportamiento del presupuesto es consistente con una
            intervención de ${escapeHtml(String(activeForm.intervention || "-").toLowerCase())} para un
            ${escapeHtml(normalizedTypology)} en la región ${escapeHtml(activeCalc.region || "-")},
            ${
              Number(activeCalc.logisticPct || 0) > 0
                ? ` con una penalización logística del ${escapeHtml(formatPercent(activeCalc.logisticPct))}.`
                : " sin penalización logística adicional."
            }
          </p>

          <p class="doc-text" style="margin-top: 10px;">
            <span class="bold">13.3 Coherencia con el mercado de infraestructura en salud. </span>
            La distribución del presupuesto guarda coherencia con el comportamiento esperado del mercado de
            infraestructura en salud, en tanto la construcción representa el mayor peso dentro del costo
            total, seguida por urbanismo
            ${
              activeForm.fvType && activeForm.fvType !== "No aplica"
                ? ", sistema fotovoltaico"
                : ""
            }
            e interventorías. Ello se alinea con la lógica de formulación de proyectos comparables dentro del
            sector.
          </p>

          <p class="doc-text" style="margin-top: 10px;">
            <span class="bold">13.4 Alcance del ejercicio paramétrico. </span>
            El presente resultado corresponde a una estimación paramétrica de referencia y no sustituye el
            presupuesto detallado del proyecto. Por consiguiente, deberá ser ajustado en etapas posteriores
            mediante estudios y diseños definitivos, memorias de cálculo, especificaciones técnicas,
            cantidades de obra y análisis de precios unitarios.
          </p>

          ${
            hasOptimization
              ? `
              <p class="doc-text" style="margin-top: 10px;">
                Adicionalmente, el ejercicio incluyó un proceso de ajuste por valor techo. Como resultado, el
                escenario final adoptado por la herramienta corresponde a un valor total de
                <span class="bold">${escapeHtml(formatCurrency(optimizedCalc?.totalProject))}</span>, con un ahorro
                estimado de <span class="bold">${escapeHtml(formatCurrency(calc?.optimization?.savings))}</span>
                frente al escenario base.
                ${
                  optimizedCalc?.capCompliance
                    ? " El escenario optimizado cumple el límite presupuestal definido."
                    : " Aun con la aplicación de los ajustes programados, el proyecto no alcanza a cumplir totalmente el límite presupuestal."
                }
              </p>
            `
              : ""
          }
        </div>
      </body>
    </html>
  `;
};

export const buildCtvHtml = ({ form, calc }) => {
  const { activeCalc, activeForm, hasOptimization } = getScenario(form, calc);

  const rows = buildProjectTableRows(activeForm, activeCalc);

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>CTV - ${escapeHtml(activeForm.projectName || "Proyecto")}</title>
        ${getBaseStyles()}
      </head>
      <body>
        <h1>CTV - Cuadro Técnico de Valores</h1>
        <p class="muted">
          Proyecto: <strong>${escapeHtml(activeForm.projectName || "-")}</strong><br/>
          Municipio: ${escapeHtml(activeForm.municipality || "-")}<br/>
          Departamento: ${escapeHtml(activeForm.department || "-")}<br/>
          Tipología: ${escapeHtml(activeForm.typology || "-")}<br/>
          Intervención: ${escapeHtml(activeForm.intervention || "-")}<br/>
          ${hasOptimization ? "Escenario: Optimizado final" : "Escenario: Base"}
        </p>

        ${buildProjectTableHtml(rows)}
      </body>
    </html>
  `;
};

export const exportPdf = async ({ html, fileName = "documento.pdf" }) => {
  await exportPdfWeb({ html, fileName });
  return fileName;
};