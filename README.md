# Beam Section Calculator

A React application for calculating the flexural strength of reinforced concrete beam sections according to ACI 318-19 (Building Code Requirements for Structural Concrete).

## Features

- **Flexural Analysis**: Calculate nominal and design moment capacity (Mn and φMn)
- **Section Classification**: Automatically determines if section is tension-controlled, compression-controlled, or in the transition zone
- **ACI 318-19 Compliance**:
  - Stress block depth factor (β1) per Section 22.2.2.4.3
  - Strength reduction factor (φ) per Table 21.2.2
  - Reinforcement ratio limits (ρmin, ρmax, ρb)
- **Visual Cross-Section**: Interactive SVG visualization showing:
  - Beam geometry
  - Stress block
  - Neutral axis location
  - Reinforcement placement
  - Strain distribution diagram
- **Code Checks**: Automatic verification of:
  - Minimum reinforcement requirements
  - Maximum reinforcement limits
  - Steel yielding at ultimate
  - Ductility requirements

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

This application is deployed on GitHub Pages and available at:  
**[https://weepingprophet77.github.io/beam-section/](https://weepingprophet77.github.io/beam-section/)**

The deployment is automated via GitHub Actions. Any push to the `main` branch triggers a new build and deployment.

## Usage

1. **Enter Section Geometry**:
   - Beam width (b)
   - Total height (h)
   - Effective depth (d) - can be auto-calculated

2. **Specify Material Properties**:
   - Concrete compressive strength (f'c)
   - Steel yield strength (fy)
   - Steel modulus of elasticity (Es)

3. **Define Reinforcement**:
   - Area of tension steel (As) - use the quick calculator for common bar sizes
   - Compression steel (optional)

4. **View Results**:
   - Design moment capacity (φMn)
   - Section classification
   - Reinforcement ratio checks
   - Warnings and recommendations

## Key Formulas (ACI 318-19)

- **Stress block depth**: `a = As × fy / (0.85 × f'c × b)`
- **Neutral axis depth**: `c = a / β1`
- **Nominal moment**: `Mn = As × fy × (d - a/2)`
- **Tension steel strain**: `εt = εcu × (d - c) / c`

## Tech Stack

- React 19
- TypeScript
- Vite
- CSS3 (no framework dependencies)

## Disclaimer

This calculator is for educational and preliminary design purposes only. All structural designs must be verified by a licensed professional engineer. The authors assume no liability for the use of this tool.

## License

MIT
