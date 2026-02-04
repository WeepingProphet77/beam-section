// Beam input parameters
export interface BeamInput {
  // Geometry (inches)
  b: number;       // beam width
  h: number;       // total beam height
  d: number;       // effective depth (distance from compression face to centroid of tension steel)
  d_prime: number; // distance from compression face to compression steel (if any)

  // Material properties (psi)
  fc: number;      // concrete compressive strength f'c
  fy: number;      // steel yield strength
  Es: number;      // steel modulus of elasticity (default 29,000,000 psi)

  // Reinforcement (sq inches)
  As: number;      // area of tension steel
  As_prime: number;// area of compression steel (0 if singly reinforced)
}

// Calculation results
export interface BeamResults {
  // Basic parameters
  beta1: number;           // stress block factor
  a: number;               // depth of equivalent stress block (in)
  c: number;               // neutral axis depth (in)

  // Strains
  epsilon_t: number;       // strain in tension steel
  epsilon_y: number;       // yield strain of steel
  epsilon_cu: number;      // ultimate concrete strain (0.003)

  // Reinforcement ratios
  rho: number;             // actual reinforcement ratio As/(b*d)
  rho_b: number;           // balanced reinforcement ratio
  rho_max: number;         // maximum reinforcement ratio
  rho_min: number;         // minimum reinforcement ratio

  // Moment capacity
  Mn: number;              // nominal moment capacity (lb-in)
  Mn_kip_ft: number;       // nominal moment capacity (kip-ft)
  phi: number;             // strength reduction factor
  phiMn: number;           // design moment capacity (lb-in)
  phiMn_kip_ft: number;    // design moment capacity (kip-ft)

  // Section classification
  sectionType: 'tension-controlled' | 'transition' | 'compression-controlled';

  // Checks
  isAdequatelyReinforced: boolean;  // ρ >= ρmin
  isNotOverReinforced: boolean;     // ρ <= ρmax
  steelYields: boolean;             // εt >= εy

  // Warnings and messages
  warnings: string[];
}

// Default values
export const DEFAULT_BEAM_INPUT: BeamInput = {
  b: 12,           // 12 inches wide
  h: 24,           // 24 inches tall
  d: 21.5,         // effective depth
  d_prime: 2.5,    // compression steel depth
  fc: 4000,        // 4000 psi concrete
  fy: 60000,       // Grade 60 steel
  Es: 29000000,    // Steel modulus
  As: 3.0,         // 3 #9 bars ≈ 3.0 sq in
  As_prime: 0,     // singly reinforced
};

// Common rebar areas (sq inches)
export const REBAR_AREAS: { [key: string]: number } = {
  '#3': 0.11,
  '#4': 0.20,
  '#5': 0.31,
  '#6': 0.44,
  '#7': 0.60,
  '#8': 0.79,
  '#9': 1.00,
  '#10': 1.27,
  '#11': 1.56,
  '#14': 2.25,
  '#18': 4.00,
};

// Common concrete strengths (psi)
export const CONCRETE_STRENGTHS = [3000, 4000, 5000, 6000, 7000, 8000];

// Common steel grades (psi)
export const STEEL_GRADES = [40000, 60000, 75000, 80000];
