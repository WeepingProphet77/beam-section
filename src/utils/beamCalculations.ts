import type { BeamInput, BeamResults } from '../types/beam';

/**
 * ACI 318 Reinforced Concrete Beam Analysis
 * Calculates flexural strength of rectangular beam sections
 */

// Constants
const EPSILON_CU = 0.003; // Ultimate concrete strain per ACI 318

/**
 * Calculate β1 (stress block depth factor) per ACI 318-19 Section 22.2.2.4.3
 * β1 = 0.85 for f'c ≤ 4000 psi
 * β1 decreases by 0.05 for each 1000 psi above 4000 psi
 * β1 minimum = 0.65
 */
export function calculateBeta1(fc: number): number {
  if (fc <= 4000) {
    return 0.85;
  }
  const beta1 = 0.85 - 0.05 * ((fc - 4000) / 1000);
  return Math.max(beta1, 0.65);
}

/**
 * Calculate yield strain of steel
 */
export function calculateEpsilonY(fy: number, Es: number): number {
  return fy / Es;
}

/**
 * Calculate depth of equivalent rectangular stress block
 * a = As * fy / (0.85 * f'c * b)
 */
export function calculateStressBlockDepth(
  As: number,
  fy: number,
  fc: number,
  b: number
): number {
  return (As * fy) / (0.85 * fc * b);
}

/**
 * Calculate neutral axis depth
 * c = a / β1
 */
export function calculateNeutralAxisDepth(a: number, beta1: number): number {
  return a / beta1;
}

/**
 * Calculate strain in tension steel
 * εt = εcu * (d - c) / c
 */
export function calculateTensionStrain(
  d: number,
  c: number,
  epsilon_cu: number = EPSILON_CU
): number {
  if (c <= 0) return Infinity;
  return epsilon_cu * (d - c) / c;
}

/**
 * Calculate strength reduction factor φ per ACI 318-19 Table 21.2.2
 * Tension-controlled (εt ≥ 0.005): φ = 0.90
 * Compression-controlled (εt ≤ εy): φ = 0.65
 * Transition zone: linear interpolation
 */
export function calculatePhi(
  epsilon_t: number,
  epsilon_y: number
): number {
  if (epsilon_t >= 0.005) {
    return 0.90; // Tension-controlled
  }
  if (epsilon_t <= epsilon_y) {
    return 0.65; // Compression-controlled
  }
  // Transition zone - linear interpolation
  return 0.65 + 0.25 * (epsilon_t - epsilon_y) / (0.005 - epsilon_y);
}

/**
 * Determine section classification
 */
export function classifySection(
  epsilon_t: number,
  epsilon_y: number
): 'tension-controlled' | 'transition' | 'compression-controlled' {
  if (epsilon_t >= 0.005) {
    return 'tension-controlled';
  }
  if (epsilon_t <= epsilon_y) {
    return 'compression-controlled';
  }
  return 'transition';
}

/**
 * Calculate balanced reinforcement ratio per ACI 318
 * ρb = (0.85 * β1 * f'c / fy) * (εcu / (εcu + εy))
 */
export function calculateRhoBalanced(
  fc: number,
  fy: number,
  beta1: number,
  epsilon_y: number,
  epsilon_cu: number = EPSILON_CU
): number {
  return (0.85 * beta1 * fc / fy) * (epsilon_cu / (epsilon_cu + epsilon_y));
}

/**
 * Calculate maximum reinforcement ratio
 * Based on ensuring εt ≥ 0.004 for adequate ductility per ACI 318-19
 */
export function calculateRhoMax(
  fc: number,
  fy: number,
  beta1: number,
  epsilon_cu: number = EPSILON_CU
): number {
  // For εt = 0.004 (minimum for non-prestressed members)
  const epsilon_t_min = 0.004;
  return (0.85 * beta1 * fc / fy) * (epsilon_cu / (epsilon_cu + epsilon_t_min));
}

/**
 * Calculate minimum reinforcement ratio per ACI 318-19 Section 9.6.1.2
 * ρmin = max(3 * √f'c / fy, 200 / fy)
 */
export function calculateRhoMin(fc: number, fy: number): number {
  const rho1 = (3 * Math.sqrt(fc)) / fy;
  const rho2 = 200 / fy;
  return Math.max(rho1, rho2);
}

/**
 * Calculate nominal moment capacity Mn
 * Mn = As * fy * (d - a/2)
 */
export function calculateMn(
  As: number,
  fy: number,
  d: number,
  a: number
): number {
  return As * fy * (d - a / 2);
}

/**
 * Convert moment from lb-in to kip-ft
 */
export function convertToKipFt(moment_lb_in: number): number {
  return moment_lb_in / (1000 * 12);
}

/**
 * Main calculation function - performs complete beam analysis
 */
export function analyzeBeam(input: BeamInput): BeamResults {
  const { b, d, fc, fy, Es, As } = input;
  const warnings: string[] = [];

  // Calculate basic parameters
  const beta1 = calculateBeta1(fc);
  const epsilon_y = calculateEpsilonY(fy, Es);

  // Calculate stress block and neutral axis
  const a = calculateStressBlockDepth(As, fy, fc, b);
  const c = calculateNeutralAxisDepth(a, beta1);

  // Calculate strain in tension steel
  const epsilon_t = calculateTensionStrain(d, c);

  // Calculate strength reduction factor
  const phi = calculatePhi(epsilon_t, epsilon_y);

  // Classify section
  const sectionType = classifySection(epsilon_t, epsilon_y);

  // Calculate reinforcement ratios
  const rho = As / (b * d);
  const rho_b = calculateRhoBalanced(fc, fy, beta1, epsilon_y);
  const rho_max = calculateRhoMax(fc, fy, beta1);
  const rho_min = calculateRhoMin(fc, fy);

  // Calculate moment capacity
  const Mn = calculateMn(As, fy, d, a);
  const phiMn = phi * Mn;

  // Perform checks
  const steelYields = epsilon_t >= epsilon_y;
  const isAdequatelyReinforced = rho >= rho_min;
  const isNotOverReinforced = rho <= rho_max;

  // Generate warnings
  if (!steelYields) {
    warnings.push('Warning: Tension steel does not yield at ultimate. Section is over-reinforced.');
  }

  if (!isAdequatelyReinforced) {
    warnings.push(`Warning: Reinforcement ratio (${(rho * 100).toFixed(3)}%) is less than minimum (${(rho_min * 100).toFixed(3)}%). Per ACI 318, As,min requirements may govern.`);
  }

  if (!isNotOverReinforced) {
    warnings.push(`Warning: Reinforcement ratio (${(rho * 100).toFixed(3)}%) exceeds maximum (${(rho_max * 100).toFixed(3)}%). Section may not have adequate ductility.`);
  }

  if (sectionType === 'compression-controlled') {
    warnings.push('Warning: Section is compression-controlled. Consider reducing reinforcement for better ductility.');
  }

  if (sectionType === 'transition') {
    warnings.push('Note: Section is in the transition zone between tension and compression controlled.');
  }

  if (a > d) {
    warnings.push('Error: Stress block depth exceeds effective depth. Check input values.');
  }

  if (c >= d) {
    warnings.push('Error: Neutral axis is at or below tension steel. Invalid configuration.');
  }

  return {
    beta1,
    a,
    c,
    epsilon_t,
    epsilon_y,
    epsilon_cu: EPSILON_CU,
    rho,
    rho_b,
    rho_max,
    rho_min,
    Mn,
    Mn_kip_ft: convertToKipFt(Mn),
    phi,
    phiMn,
    phiMn_kip_ft: convertToKipFt(phiMn),
    sectionType,
    isAdequatelyReinforced,
    isNotOverReinforced,
    steelYields,
    warnings,
  };
}

/**
 * Calculate required steel area for a given moment demand
 */
export function calculateRequiredSteel(
  Mu: number, // factored moment demand (lb-in)
  b: number,
  d: number,
  fc: number,
  fy: number
): { As_required: number; isValid: boolean; message: string } {
  // Using the quadratic formula approach
  // Mu = φ * As * fy * (d - a/2)
  // where a = As * fy / (0.85 * f'c * b)

  const phi = 0.9; // Assume tension-controlled initially
  const R_n = Mu / (phi * b * d * d);
  const rho_required = (0.85 * fc / fy) * (1 - Math.sqrt(1 - (2 * R_n) / (0.85 * fc)));

  if (isNaN(rho_required) || rho_required < 0) {
    return {
      As_required: 0,
      isValid: false,
      message: 'Section cannot carry the applied moment. Increase section size.',
    };
  }

  const As_required = rho_required * b * d;
  const rho_max = calculateRhoMax(fc, fy, calculateBeta1(fc));

  if (rho_required > rho_max) {
    return {
      As_required,
      isValid: false,
      message: `Required reinforcement ratio (${(rho_required * 100).toFixed(3)}%) exceeds maximum (${(rho_max * 100).toFixed(3)}%).`,
    };
  }

  return {
    As_required,
    isValid: true,
    message: 'OK',
  };
}

/**
 * Format number for display with appropriate precision
 */
export function formatNumber(value: number, decimals: number = 3): string {
  if (!isFinite(value)) return 'N/A';
  return value.toFixed(decimals);
}
