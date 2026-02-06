import { jsPDF } from 'jspdf';
import type { BeamInput, BeamResults } from '../types/beam';
import { formatNumber } from './beamCalculations';

// PDF Configuration
const PAGE_WIDTH = 215.9; // Letter size in mm
const PAGE_HEIGHT = 279.4;
const MARGIN_LEFT = 20;
const MARGIN_RIGHT = 20;
const MARGIN_TOP = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

// Colors
const PRIMARY_COLOR: [number, number, number] = [26, 54, 93]; // Dark blue
const ACCENT_COLOR: [number, number, number] = [66, 153, 225]; // Light blue
const SUCCESS_COLOR: [number, number, number] = [56, 161, 105]; // Green
const WARNING_COLOR: [number, number, number] = [237, 137, 54]; // Orange
const ERROR_COLOR: [number, number, number] = [229, 62, 62]; // Red
const GRAY_COLOR: [number, number, number] = [113, 128, 150];

interface PDFExportOptions {
  projectName?: string;
  projectNumber?: string;
  engineer?: string;
  date?: string;
}

/**
 * Generate a professional PDF calculation sheet
 */
export function generatePDF(
  input: BeamInput,
  results: BeamResults,
  options: PDFExportOptions = {}
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  });

  let y = MARGIN_TOP;

  // Set default font
  doc.setFont('helvetica');

  // === HEADER ===
  y = drawHeader(doc, y, options);

  // === INPUT PARAMETERS ===
  y = drawSectionTitle(doc, y, 'INPUT PARAMETERS');
  y = drawInputParameters(doc, y, input);

  // === MATERIAL PROPERTIES ===
  y = drawSectionTitle(doc, y, 'MATERIAL PROPERTIES');
  y = drawMaterialProperties(doc, y, input, results);

  // === FLEXURAL ANALYSIS ===
  y = drawSectionTitle(doc, y, 'FLEXURAL STRENGTH ANALYSIS');
  y = drawFlexuralAnalysis(doc, y, input, results);

  // Check if we need a new page
  if (y > PAGE_HEIGHT - 100) {
    doc.addPage();
    y = MARGIN_TOP;
  }

  // === STRAIN COMPATIBILITY ===
  y = drawSectionTitle(doc, y, 'STRAIN COMPATIBILITY CHECK');
  y = drawStrainAnalysis(doc, y, input, results);

  // Check if we need a new page
  if (y > PAGE_HEIGHT - 80) {
    doc.addPage();
    y = MARGIN_TOP;
  }

  // === REINFORCEMENT LIMITS ===
  y = drawSectionTitle(doc, y, 'REINFORCEMENT LIMITS CHECK');
  y = drawReinforcementLimits(doc, y, input, results);

  // Check if we need a new page
  if (y > PAGE_HEIGHT - 60) {
    doc.addPage();
    y = MARGIN_TOP;
  }

  // === SUMMARY ===
  y = drawSectionTitle(doc, y, 'DESIGN SUMMARY');
  y = drawSummary(doc, y, results);

  // === FOOTER ===
  drawFooter(doc);

  // Save the PDF
  const filename = options.projectNumber
    ? `Beam_Calc_${options.projectNumber}.pdf`
    : 'Beam_Section_Calculation.pdf';
  doc.save(filename);
}

function drawHeader(
  doc: jsPDF,
  y: number,
  options: PDFExportOptions
): number {
  const {
    projectName = 'Reinforced Concrete Beam Design',
    projectNumber = '',
    engineer = '',
    date = new Date().toLocaleDateString(),
  } = options;

  // Title box
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(MARGIN_LEFT, y, CONTENT_WIDTH, 18, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('FLEXURAL STRENGTH CALCULATION', PAGE_WIDTH / 2, y + 7, {
    align: 'center',
  });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Per ACI 318-19', PAGE_WIDTH / 2, y + 14, { align: 'center' });

  y += 22;

  // Project info box
  doc.setFillColor(247, 250, 252);
  doc.setDrawColor(...GRAY_COLOR);
  doc.rect(MARGIN_LEFT, y, CONTENT_WIDTH, 20, 'FD');

  doc.setTextColor(...PRIMARY_COLOR);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');

  const col1 = MARGIN_LEFT + 5;
  const col2 = MARGIN_LEFT + CONTENT_WIDTH / 2;

  doc.text('Project:', col1, y + 6);
  doc.text('Project No.:', col2, y + 6);
  doc.text('Engineer:', col1, y + 14);
  doc.text('Date:', col2, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.text(projectName, col1 + 18, y + 6);
  doc.text(projectNumber || 'N/A', col2 + 25, y + 6);
  doc.text(engineer || 'N/A', col1 + 22, y + 14);
  doc.text(date, col2 + 13, y + 14);

  return y + 28;
}

function drawSectionTitle(doc: jsPDF, y: number, title: string): number {
  doc.setFillColor(...ACCENT_COLOR);
  doc.rect(MARGIN_LEFT, y, CONTENT_WIDTH, 7, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(title, MARGIN_LEFT + 3, y + 5);

  return y + 12;
}

function drawInputParameters(doc: jsPDF, y: number, input: BeamInput): number {
  doc.setTextColor(...PRIMARY_COLOR);
  doc.setFontSize(10);

  // Geometry subsection
  doc.setFont('helvetica', 'bold');
  doc.text('Section Geometry:', MARGIN_LEFT, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  const params = [
    ['Beam Width, b', `${input.b} in`],
    ['Total Height, h', `${input.h} in`],
    ['Effective Depth, d', `${input.d} in`],
  ];

  params.forEach(([label, value]) => {
    doc.text(`${label}:`, MARGIN_LEFT + 5, y);
    doc.text(value, MARGIN_LEFT + 55, y);
    y += 5;
  });

  if (input.As_prime > 0) {
    doc.text("Compression Steel Depth, d':", MARGIN_LEFT + 5, y);
    doc.text(`${input.d_prime} in`, MARGIN_LEFT + 55, y);
    y += 5;
  }

  y += 3;

  // Reinforcement subsection
  doc.setFont('helvetica', 'bold');
  doc.text('Reinforcement:', MARGIN_LEFT, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.text('Tension Steel Area, As:', MARGIN_LEFT + 5, y);
  doc.text(`${input.As} sq.in.`, MARGIN_LEFT + 55, y);
  y += 5;

  if (input.As_prime > 0) {
    doc.text("Compression Steel Area, A's:", MARGIN_LEFT + 5, y);
    doc.text(`${input.As_prime} sq.in.`, MARGIN_LEFT + 55, y);
    y += 5;
  }

  return y + 5;
}

function drawMaterialProperties(
  doc: jsPDF,
  y: number,
  input: BeamInput,
  results: BeamResults
): number {
  doc.setTextColor(...PRIMARY_COLOR);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Material properties table
  const props = [
    ["Concrete Strength, f'c:", `${input.fc.toLocaleString()} psi`, ''],
    ['Steel Yield Strength, fy:', `${input.fy.toLocaleString()} psi`, ''],
    ['Steel Modulus, Es:', `${(input.Es / 1000000).toFixed(0)} x 10^6 psi`, ''],
    ['Ultimate Concrete Strain, ecu:', '0.003', 'ACI 318-19 Sec. 22.2.2.1'],
  ];

  props.forEach(([label, value, ref]) => {
    doc.text(label, MARGIN_LEFT, y);
    doc.text(value, MARGIN_LEFT + 70, y);
    if (ref) {
      doc.setTextColor(...GRAY_COLOR);
      doc.setFontSize(8);
      doc.text(ref, MARGIN_LEFT + 115, y);
      doc.setTextColor(...PRIMARY_COLOR);
      doc.setFontSize(10);
    }
    y += 6;
  });

  // Beta1 calculation
  y += 3;
  doc.setFont('helvetica', 'bold');
  doc.text('Stress Block Factor, B1:', MARGIN_LEFT, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY_COLOR);
  doc.setFontSize(8);
  doc.text('ACI 318-19 Sec. 22.2.2.4.3', MARGIN_LEFT + 50, y);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.setFontSize(10);
  y += 8;

  // Beta1 equation box
  doc.setFillColor(250, 250, 250);
  doc.rect(MARGIN_LEFT + 5, y - 3, CONTENT_WIDTH - 10, 20, 'F');

  if (input.fc <= 4000) {
    doc.text("For f'c <= 4000 psi:", MARGIN_LEFT + 10, y + 4);
    doc.text("B1 = 0.85", MARGIN_LEFT + 10, y + 11);
  } else {
    doc.text("For f'c > 4000 psi:", MARGIN_LEFT + 10, y + 4);
    doc.text("B1 = 0.85 - 0.05 x (f'c - 4000) / 1000, but not less than 0.65", MARGIN_LEFT + 10, y + 11);
  }

  doc.setFont('helvetica', 'bold');
  doc.text(`B1 = ${formatNumber(results.beta1, 3)}`, MARGIN_LEFT + CONTENT_WIDTH - 40, y + 7);

  return y + 26;
}

function drawFlexuralAnalysis(
  doc: jsPDF,
  y: number,
  input: BeamInput,
  results: BeamResults
): number {
  doc.setTextColor(...PRIMARY_COLOR);
  doc.setFontSize(10);

  // Step 1: Stress block depth
  doc.setFont('helvetica', 'bold');
  doc.text('Step 1: Depth of Equivalent Stress Block, a', MARGIN_LEFT, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY_COLOR);
  doc.setFontSize(8);
  doc.text('ACI 318-19 Sec. 22.2.2.4.1', MARGIN_LEFT + 85, y);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.setFontSize(10);
  y += 8;

  // Equation box
  doc.setFillColor(250, 250, 250);
  doc.rect(MARGIN_LEFT + 5, y - 3, CONTENT_WIDTH - 10, 24, 'F');

  doc.text("a = As x fy / (0.85 x f'c x b)", MARGIN_LEFT + 10, y + 4);
  doc.text(
    `a = ${input.As} x ${input.fy.toLocaleString()} / (0.85 x ${input.fc.toLocaleString()} x ${input.b})`,
    MARGIN_LEFT + 10,
    y + 12
  );

  doc.setFont('helvetica', 'bold');
  doc.text(`a = ${formatNumber(results.a, 3)} in`, MARGIN_LEFT + CONTENT_WIDTH - 45, y + 16);
  doc.setFont('helvetica', 'normal');

  y += 30;

  // Step 2: Neutral axis depth
  doc.setFont('helvetica', 'bold');
  doc.text('Step 2: Neutral Axis Depth, c', MARGIN_LEFT, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY_COLOR);
  doc.setFontSize(8);
  doc.text('ACI 318-19 Sec. 22.2.2.4.1', MARGIN_LEFT + 60, y);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.setFontSize(10);
  y += 8;

  doc.setFillColor(250, 250, 250);
  doc.rect(MARGIN_LEFT + 5, y - 3, CONTENT_WIDTH - 10, 18, 'F');

  doc.text('c = a / B1', MARGIN_LEFT + 10, y + 4);
  doc.text(
    `c = ${formatNumber(results.a, 3)} / ${formatNumber(results.beta1, 3)}`,
    MARGIN_LEFT + 10,
    y + 11
  );

  doc.setFont('helvetica', 'bold');
  doc.text(`c = ${formatNumber(results.c, 3)} in`, MARGIN_LEFT + CONTENT_WIDTH - 45, y + 8);
  doc.setFont('helvetica', 'normal');

  y += 24;

  // Step 3: Nominal moment capacity
  doc.setFont('helvetica', 'bold');
  doc.text('Step 3: Nominal Moment Capacity, Mn', MARGIN_LEFT, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY_COLOR);
  doc.setFontSize(8);
  doc.text('ACI 318-19 Sec. 22.2.2.4.1', MARGIN_LEFT + 75, y);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.setFontSize(10);
  y += 8;

  doc.setFillColor(250, 250, 250);
  doc.rect(MARGIN_LEFT + 5, y - 3, CONTENT_WIDTH - 10, 30, 'F');

  doc.text('Mn = As x fy x (d - a/2)', MARGIN_LEFT + 10, y + 4);
  doc.text(
    `Mn = ${input.As} x ${input.fy.toLocaleString()} x (${input.d} - ${formatNumber(results.a, 3)}/2)`,
    MARGIN_LEFT + 10,
    y + 12
  );
  doc.text(
    `Mn = ${formatNumber(results.Mn, 0)} lb-in`,
    MARGIN_LEFT + 10,
    y + 20
  );

  doc.setFont('helvetica', 'bold');
  doc.text(`Mn = ${formatNumber(results.Mn_kip_ft, 1)} kip-ft`, MARGIN_LEFT + CONTENT_WIDTH - 55, y + 22);
  doc.setFont('helvetica', 'normal');

  return y + 38;
}

function drawStrainAnalysis(
  doc: jsPDF,
  y: number,
  input: BeamInput,
  results: BeamResults
): number {
  doc.setTextColor(...PRIMARY_COLOR);
  doc.setFontSize(10);

  // Tension steel strain
  doc.setFont('helvetica', 'bold');
  doc.text('Tension Steel Strain, et', MARGIN_LEFT, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY_COLOR);
  doc.setFontSize(8);
  doc.text('ACI 318-19 Sec. 21.2.2', MARGIN_LEFT + 50, y);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.setFontSize(10);
  y += 8;

  doc.setFillColor(250, 250, 250);
  doc.rect(MARGIN_LEFT + 5, y - 3, CONTENT_WIDTH - 10, 18, 'F');

  doc.text('et = ecu x (d - c) / c', MARGIN_LEFT + 10, y + 4);
  doc.text(
    `et = 0.003 x (${input.d} - ${formatNumber(results.c, 3)}) / ${formatNumber(results.c, 3)}`,
    MARGIN_LEFT + 10,
    y + 11
  );

  doc.setFont('helvetica', 'bold');
  doc.text(`et = ${formatNumber(results.epsilon_t, 5)}`, MARGIN_LEFT + CONTENT_WIDTH - 50, y + 8);
  doc.setFont('helvetica', 'normal');

  y += 24;

  // Yield strain
  doc.text(`Steel Yield Strain: ey = fy / Es = ${input.fy.toLocaleString()} / ${(input.Es / 1000000).toFixed(0)} x 10^6 = ${formatNumber(results.epsilon_y, 5)}`, MARGIN_LEFT, y);
  y += 10;

  // Section classification
  doc.setFont('helvetica', 'bold');
  doc.text('Section Classification:', MARGIN_LEFT, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY_COLOR);
  doc.setFontSize(8);
  doc.text('ACI 318-19 Table 21.2.2', MARGIN_LEFT + 48, y);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.setFontSize(10);
  y += 8;

  // Classification criteria table
  const criteria = [
    ['Tension-Controlled:', 'et >= 0.005', 'phi = 0.90'],
    ['Transition Zone:', 'ey < et < 0.005', '0.65 < phi < 0.90'],
    ['Compression-Controlled:', 'et <= ey', 'phi = 0.65'],
  ];

  doc.setFontSize(9);
  criteria.forEach(([type, condition, phi]) => {
    const isActive =
      (type.includes('Tension') && results.sectionType === 'tension-controlled') ||
      (type.includes('Transition') && results.sectionType === 'transition') ||
      (type.includes('Compression') && results.sectionType === 'compression-controlled');

    if (isActive) {
      doc.setFillColor(232, 245, 233);
      doc.rect(MARGIN_LEFT + 5, y - 3, CONTENT_WIDTH - 10, 6, 'F');
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }

    doc.text(type, MARGIN_LEFT + 8, y);
    doc.text(condition, MARGIN_LEFT + 55, y);
    doc.text(phi, MARGIN_LEFT + 110, y);
    y += 7;
  });

  doc.setFontSize(10);
  y += 5;

  // Section type result
  doc.setFont('helvetica', 'bold');
  let sectionTypeLabel = '';
  let color: [number, number, number] = SUCCESS_COLOR;

  switch (results.sectionType) {
    case 'tension-controlled':
      sectionTypeLabel = 'TENSION-CONTROLLED';
      color = SUCCESS_COLOR;
      break;
    case 'transition':
      sectionTypeLabel = 'TRANSITION ZONE';
      color = WARNING_COLOR;
      break;
    case 'compression-controlled':
      sectionTypeLabel = 'COMPRESSION-CONTROLLED';
      color = ERROR_COLOR;
      break;
  }

  doc.setTextColor(...color);
  doc.text(`Section is ${sectionTypeLabel}`, MARGIN_LEFT, y);
  doc.setTextColor(...PRIMARY_COLOR);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.text(`Strength Reduction Factor: phi = ${formatNumber(results.phi, 3)}`, MARGIN_LEFT, y);
  y += 12;

  // Design moment capacity
  doc.setFont('helvetica', 'bold');
  doc.text('Design Moment Capacity, phi x Mn', MARGIN_LEFT, y);
  doc.setFont('helvetica', 'normal');
  y += 8;

  doc.setFillColor(232, 245, 233);
  doc.rect(MARGIN_LEFT + 5, y - 3, CONTENT_WIDTH - 10, 18, 'F');

  doc.text('phi x Mn = phi x Mn', MARGIN_LEFT + 10, y + 4);
  doc.text(
    `phi x Mn = ${formatNumber(results.phi, 3)} x ${formatNumber(results.Mn_kip_ft, 1)} kip-ft`,
    MARGIN_LEFT + 10,
    y + 11
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`phi x Mn = ${formatNumber(results.phiMn_kip_ft, 1)} kip-ft`, MARGIN_LEFT + CONTENT_WIDTH - 65, y + 8);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  return y + 25;
}

function drawReinforcementLimits(
  doc: jsPDF,
  y: number,
  input: BeamInput,
  results: BeamResults
): number {
  doc.setTextColor(...PRIMARY_COLOR);
  doc.setFontSize(10);

  // Minimum reinforcement
  doc.setFont('helvetica', 'bold');
  doc.text('Minimum Reinforcement Ratio, rho_min', MARGIN_LEFT, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY_COLOR);
  doc.setFontSize(8);
  doc.text('ACI 318-19 Sec. 9.6.1.2', MARGIN_LEFT + 78, y);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.setFontSize(10);
  y += 8;

  doc.setFillColor(250, 250, 250);
  doc.rect(MARGIN_LEFT + 5, y - 3, CONTENT_WIDTH - 10, 20, 'F');

  doc.text("rho_min = max( 3 x sqrt(f'c) / fy , 200 / fy )", MARGIN_LEFT + 10, y + 4);
  const rhoMin1 = (3 * Math.sqrt(input.fc)) / input.fy;
  const rhoMin2 = 200 / input.fy;
  doc.text(
    `rho_min = max( ${formatNumber(rhoMin1, 5)} , ${formatNumber(rhoMin2, 5)} )`,
    MARGIN_LEFT + 10,
    y + 12
  );

  doc.setFont('helvetica', 'bold');
  doc.text(`rho_min = ${(results.rho_min * 100).toFixed(3)}%`, MARGIN_LEFT + CONTENT_WIDTH - 55, y + 12);
  doc.setFont('helvetica', 'normal');

  y += 26;

  // Maximum reinforcement
  doc.setFont('helvetica', 'bold');
  doc.text('Maximum Reinforcement Ratio, rho_max', MARGIN_LEFT, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY_COLOR);
  doc.setFontSize(8);
  doc.text('ACI 318-19 Sec. 9.3.3.1 (et >= 0.004)', MARGIN_LEFT + 80, y);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.setFontSize(10);
  y += 8;

  doc.setFillColor(250, 250, 250);
  doc.rect(MARGIN_LEFT + 5, y - 3, CONTENT_WIDTH - 10, 12, 'F');

  doc.text("rho_max = (0.85 x B1 x f'c / fy) x (ecu / (ecu + 0.004))", MARGIN_LEFT + 10, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.text(`rho_max = ${(results.rho_max * 100).toFixed(3)}%`, MARGIN_LEFT + CONTENT_WIDTH - 55, y + 5);
  doc.setFont('helvetica', 'normal');

  y += 18;

  // Actual reinforcement ratio
  doc.setFont('helvetica', 'bold');
  doc.text('Actual Reinforcement Ratio, rho', MARGIN_LEFT, y);
  doc.setFont('helvetica', 'normal');
  y += 7;

  doc.text(`rho = As / (b x d) = ${input.As} / (${input.b} x ${input.d})`, MARGIN_LEFT + 5, y);
  doc.setFont('helvetica', 'bold');
  doc.text(`rho = ${(results.rho * 100).toFixed(3)}%`, MARGIN_LEFT + CONTENT_WIDTH - 50, y);
  doc.setFont('helvetica', 'normal');

  y += 12;

  // Checks section title
  doc.setFont('helvetica', 'bold');
  doc.text('Code Compliance Checks:', MARGIN_LEFT, y);
  doc.setFont('helvetica', 'normal');
  y += 8;

  // Checks
  const checks = [
    {
      label: 'Minimum Reinforcement',
      condition: `rho >= rho_min: ${(results.rho * 100).toFixed(3)}% >= ${(results.rho_min * 100).toFixed(3)}%`,
      pass: results.isAdequatelyReinforced,
    },
    {
      label: 'Maximum Reinforcement',
      condition: `rho <= rho_max: ${(results.rho * 100).toFixed(3)}% <= ${(results.rho_max * 100).toFixed(3)}%`,
      pass: results.isNotOverReinforced,
    },
    {
      label: 'Steel Yielding',
      condition: `et >= ey: ${formatNumber(results.epsilon_t, 5)} >= ${formatNumber(results.epsilon_y, 5)}`,
      pass: results.steelYields,
    },
  ];

  checks.forEach(({ label, condition, pass }) => {
    const bgColor = pass ? [232, 245, 233] : [254, 215, 215];
    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.rect(MARGIN_LEFT + 5, y - 3, CONTENT_WIDTH - 10, 9, 'F');

    const statusColor = pass ? SUCCESS_COLOR : ERROR_COLOR;
    doc.setTextColor(...statusColor);
    doc.setFont('helvetica', 'bold');
    doc.text(pass ? '[OK]' : '[FAIL]', MARGIN_LEFT + 8, y + 2);
    doc.setTextColor(...PRIMARY_COLOR);
    doc.setFont('helvetica', 'normal');
    doc.text(`${label}: ${condition}`, MARGIN_LEFT + 25, y + 2);
    y += 11;
  });

  return y + 5;
}

function drawSummary(doc: jsPDF, y: number, results: BeamResults): number {
  doc.setTextColor(...PRIMARY_COLOR);
  doc.setFontSize(10);

  // Summary box
  doc.setFillColor(232, 245, 253);
  doc.setDrawColor(...ACCENT_COLOR);
  doc.setLineWidth(0.5);
  doc.rect(MARGIN_LEFT, y, CONTENT_WIDTH, 38, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('DESIGN MOMENT CAPACITY', MARGIN_LEFT + 5, y + 8);

  doc.setFontSize(18);
  doc.text(`phi x Mn = ${formatNumber(results.phiMn_kip_ft, 1)} kip-ft`, MARGIN_LEFT + 5, y + 22);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`(${formatNumber(results.phiMn / 1000, 1)} kip-in)`, MARGIN_LEFT + 5, y + 30);

  // Status
  const statusColor = results.sectionType === 'tension-controlled' ? SUCCESS_COLOR :
    results.sectionType === 'transition' ? WARNING_COLOR : ERROR_COLOR;

  doc.setTextColor(...statusColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);

  let statusText = '';
  switch (results.sectionType) {
    case 'tension-controlled':
      statusText = 'SECTION IS TENSION-CONTROLLED (phi = 0.90)';
      break;
    case 'transition':
      statusText = `SECTION IN TRANSITION ZONE (phi = ${formatNumber(results.phi, 3)})`;
      break;
    case 'compression-controlled':
      statusText = 'SECTION IS COMPRESSION-CONTROLLED (phi = 0.65)';
      break;
  }

  doc.text(statusText, MARGIN_LEFT + CONTENT_WIDTH - 5, y + 14, { align: 'right' });

  // All checks passed?
  const allPassed = results.isAdequatelyReinforced && results.isNotOverReinforced && results.steelYields;
  doc.setFontSize(10);
  const statusResultColor = allPassed ? SUCCESS_COLOR : ERROR_COLOR;
  doc.setTextColor(...statusResultColor);
  doc.text(
    allPassed ? 'ALL CODE CHECKS PASSED' : 'REVIEW REQUIRED - SEE CHECKS ABOVE',
    MARGIN_LEFT + CONTENT_WIDTH - 5,
    y + 30,
    { align: 'right' }
  );

  y += 45;

  // Warnings
  if (results.warnings.length > 0) {
    doc.setTextColor(...WARNING_COLOR);
    doc.setFont('helvetica', 'bold');
    doc.text('Warnings:', MARGIN_LEFT, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    y += 6;

    results.warnings.forEach((warning) => {
      // Clean up warning text - remove Greek symbols
      const cleanWarning = warning
        .replace(/ρ/g, 'rho')
        .replace(/ε/g, 'e')
        .replace(/φ/g, 'phi')
        .replace(/β/g, 'B');

      const lines = doc.splitTextToSize(cleanWarning, CONTENT_WIDTH - 15);
      lines.forEach((line: string) => {
        doc.text(`- ${line}`, MARGIN_LEFT + 3, y);
        y += 5;
      });
    });
  }

  return y + 5;
}

function drawFooter(doc: jsPDF): void {
  const pageCount = doc.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Footer line
    doc.setDrawColor(...GRAY_COLOR);
    doc.setLineWidth(0.3);
    doc.line(MARGIN_LEFT, PAGE_HEIGHT - 20, PAGE_WIDTH - MARGIN_RIGHT, PAGE_HEIGHT - 20);

    // Disclaimer
    doc.setTextColor(...GRAY_COLOR);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.text(
      'This calculation is for preliminary design purposes only. All designs must be verified by a licensed professional engineer.',
      MARGIN_LEFT,
      PAGE_HEIGHT - 15
    );

    // Page number
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${i} of ${pageCount}`, PAGE_WIDTH - MARGIN_RIGHT, PAGE_HEIGHT - 15, {
      align: 'right',
    });

    // Reference
    doc.text('Reference: ACI 318-19 Building Code Requirements for Structural Concrete', MARGIN_LEFT, PAGE_HEIGHT - 10);
  }
}
