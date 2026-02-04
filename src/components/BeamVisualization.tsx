import type { BeamInput, BeamResults } from '../types/beam';
import './BeamVisualization.css';

interface BeamVisualizationProps {
  input: BeamInput;
  results: BeamResults | null;
}

export function BeamVisualization({ input, results }: BeamVisualizationProps) {
  const { b, h, d, d_prime, As, As_prime } = input;

  // SVG dimensions and scaling
  const svgWidth = 300;
  const svgHeight = 400;
  const padding = 40;
  const dimOffset = 25;

  // Calculate scale to fit beam in SVG
  const maxBeamWidth = svgWidth - 2 * padding - dimOffset;
  const maxBeamHeight = svgHeight - 2 * padding - dimOffset;
  const scale = Math.min(maxBeamWidth / b, maxBeamHeight / h);

  // Scaled dimensions
  const beamW = b * scale;
  const beamH = h * scale;

  // Position beam centered
  const beamX = (svgWidth - beamW - dimOffset) / 2 + dimOffset;
  const beamY = padding;

  // Calculate positions
  const effectiveDepthY = beamY + d * scale;
  const compressionSteelY = beamY + d_prime * scale;
  const neutralAxisY = results ? beamY + results.c * scale : 0;
  const stressBlockY = results ? beamY + results.a * scale : 0;

  // Steel bar representation (simplified)
  const barRadius = Math.max(4, Math.min(10, Math.sqrt(As) * 4));
  const numBars = Math.min(5, Math.max(2, Math.round(As / 0.5)));
  const barSpacing = (beamW - 2 * barRadius - 20) / (numBars - 1);

  return (
    <div className="beam-visualization">
      <h3>Cross-Section View</h3>
      <svg width={svgWidth} height={svgHeight} className="beam-svg">
        {/* Definitions for gradients and patterns */}
        <defs>
          <pattern id="concretePattern" patternUnits="userSpaceOnUse" width="10" height="10">
            <rect width="10" height="10" fill="#e2e8f0" />
            <circle cx="2" cy="2" r="0.5" fill="#cbd5e0" />
            <circle cx="7" cy="7" r="0.5" fill="#cbd5e0" />
            <circle cx="5" cy="4" r="0.3" fill="#a0aec0" />
          </pattern>
          <linearGradient id="compressionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fc8181" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#fc8181" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="stressBlockGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f56565" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fc8181" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Beam outline with concrete pattern */}
        <rect
          x={beamX}
          y={beamY}
          width={beamW}
          height={beamH}
          fill="url(#concretePattern)"
          stroke="#4a5568"
          strokeWidth="2"
          rx="2"
        />

        {/* Stress block (if results available) */}
        {results && results.a <= h && results.a > 0 && (
          <rect
            x={beamX}
            y={beamY}
            width={beamW}
            height={Math.min(results.a * scale, beamH)}
            fill="url(#stressBlockGradient)"
            stroke="#e53e3e"
            strokeWidth="1"
            strokeDasharray="4 2"
          />
        )}

        {/* Neutral axis line */}
        {results && results.c <= h && results.c > 0 && (
          <>
            <line
              x1={beamX - 15}
              y1={neutralAxisY}
              x2={beamX + beamW + 15}
              y2={neutralAxisY}
              stroke="#805ad5"
              strokeWidth="2"
              strokeDasharray="6 3"
            />
            <text
              x={beamX + beamW + 20}
              y={neutralAxisY + 4}
              className="dimension-text na-label"
            >
              N.A.
            </text>
          </>
        )}

        {/* Effective depth line */}
        <line
          x1={beamX}
          y1={effectiveDepthY}
          x2={beamX + beamW}
          y2={effectiveDepthY}
          stroke="#38a169"
          strokeWidth="1"
          strokeDasharray="4 2"
          opacity="0.7"
        />

        {/* Compression steel (if any) */}
        {As_prime > 0 && (
          <>
            <circle
              cx={beamX + 15}
              cy={compressionSteelY}
              r={barRadius * 0.7}
              fill="#2b6cb0"
              stroke="#1a365d"
              strokeWidth="1"
            />
            <circle
              cx={beamX + beamW - 15}
              cy={compressionSteelY}
              r={barRadius * 0.7}
              fill="#2b6cb0"
              stroke="#1a365d"
              strokeWidth="1"
            />
          </>
        )}

        {/* Tension steel bars */}
        {Array.from({ length: numBars }).map((_, i) => (
          <circle
            key={i}
            cx={beamX + 10 + barRadius + i * barSpacing}
            cy={effectiveDepthY}
            r={barRadius}
            fill="#2b6cb0"
            stroke="#1a365d"
            strokeWidth="1.5"
          />
        ))}

        {/* Width dimension */}
        <g className="dimension">
          <line
            x1={beamX}
            y1={beamY + beamH + 15}
            x2={beamX + beamW}
            y2={beamY + beamH + 15}
            stroke="#4a5568"
            strokeWidth="1"
          />
          <line
            x1={beamX}
            y1={beamY + beamH + 10}
            x2={beamX}
            y2={beamY + beamH + 20}
            stroke="#4a5568"
            strokeWidth="1"
          />
          <line
            x1={beamX + beamW}
            y1={beamY + beamH + 10}
            x2={beamX + beamW}
            y2={beamY + beamH + 20}
            stroke="#4a5568"
            strokeWidth="1"
          />
          <text
            x={beamX + beamW / 2}
            y={beamY + beamH + 32}
            className="dimension-text"
          >
            b = {b}"
          </text>
        </g>

        {/* Height dimension */}
        <g className="dimension">
          <line
            x1={beamX - 15}
            y1={beamY}
            x2={beamX - 15}
            y2={beamY + beamH}
            stroke="#4a5568"
            strokeWidth="1"
          />
          <line
            x1={beamX - 20}
            y1={beamY}
            x2={beamX - 10}
            y2={beamY}
            stroke="#4a5568"
            strokeWidth="1"
          />
          <line
            x1={beamX - 20}
            y1={beamY + beamH}
            x2={beamX - 10}
            y2={beamY + beamH}
            stroke="#4a5568"
            strokeWidth="1"
          />
          <text
            x={beamX - 25}
            y={beamY + beamH / 2}
            className="dimension-text vertical"
            transform={`rotate(-90, ${beamX - 25}, ${beamY + beamH / 2})`}
          >
            h = {h}"
          </text>
        </g>

        {/* Effective depth dimension */}
        <g className="dimension">
          <line
            x1={beamX + beamW + 15}
            y1={beamY}
            x2={beamX + beamW + 15}
            y2={effectiveDepthY}
            stroke="#38a169"
            strokeWidth="1"
          />
          <line
            x1={beamX + beamW + 10}
            y1={beamY}
            x2={beamX + beamW + 20}
            y2={beamY}
            stroke="#38a169"
            strokeWidth="1"
          />
          <line
            x1={beamX + beamW + 10}
            y1={effectiveDepthY}
            x2={beamX + beamW + 20}
            y2={effectiveDepthY}
            stroke="#38a169"
            strokeWidth="1"
          />
          <text
            x={beamX + beamW + 25}
            y={beamY + (d * scale) / 2}
            className="dimension-text small"
            fill="#38a169"
          >
            d = {d}"
          </text>
        </g>

        {/* Stress block depth label */}
        {results && results.a <= h && results.a > 0 && (
          <g className="dimension">
            <text
              x={beamX + beamW / 2}
              y={stressBlockY - 5}
              className="dimension-text small stress-label"
            >
              a = {results.a.toFixed(2)}"
            </text>
          </g>
        )}

        {/* Legend */}
        <g transform={`translate(10, ${svgHeight - 80})`}>
          <text className="legend-title" x="0" y="0">Legend:</text>
          <rect x="0" y="10" width="12" height="12" fill="url(#stressBlockGradient)" stroke="#e53e3e" strokeWidth="1" />
          <text className="legend-text" x="18" y="20">Stress Block</text>
          <line x1="0" y1="35" x2="12" y2="35" stroke="#805ad5" strokeWidth="2" strokeDasharray="4 2" />
          <text className="legend-text" x="18" y="39">Neutral Axis</text>
          <circle cx="6" cy="55" r="6" fill="#2b6cb0" stroke="#1a365d" strokeWidth="1" />
          <text className="legend-text" x="18" y="59">Reinforcement</text>
        </g>
      </svg>

      {/* Strain diagram */}
      {results && (
        <div className="strain-diagram">
          <h4>Strain Distribution</h4>
          <svg width={150} height={200} className="strain-svg">
            <defs>
              <linearGradient id="strainGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fc8181" />
                <stop offset="100%" stopColor="#4299e1" />
              </linearGradient>
            </defs>

            {/* Beam outline */}
            <rect
              x={20}
              y={20}
              width={30}
              height={160}
              fill="#e2e8f0"
              stroke="#4a5568"
              strokeWidth="1"
            />

            {/* Neutral axis */}
            <line
              x1={10}
              y1={20 + (results.c / h) * 160}
              x2={140}
              y2={20 + (results.c / h) * 160}
              stroke="#805ad5"
              strokeWidth="1"
              strokeDasharray="3 2"
            />

            {/* Strain distribution triangle */}
            <polygon
              points={`
                50,20
                ${50 + 30},20
                50,${20 + (results.c / h) * 160}
              `}
              fill="#fc8181"
              opacity="0.5"
            />
            <polygon
              points={`
                50,${20 + (results.c / h) * 160}
                ${50 + Math.min(80, results.epsilon_t / 0.003 * 30)},180
                50,180
              `}
              fill="#4299e1"
              opacity="0.5"
            />

            {/* Labels */}
            <text x="85" y="25" className="strain-label">
              {'\u03B5'}c = 0.003
            </text>
            <text x="85" y={25 + (results.c / h) * 160} className="strain-label">
              N.A.
            </text>
            <text x="85" y="190" className="strain-label">
              {'\u03B5'}t = {results.epsilon_t.toFixed(4)}
            </text>
          </svg>
        </div>
      )}
    </div>
  );
}
