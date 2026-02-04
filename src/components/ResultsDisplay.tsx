import type { BeamResults } from '../types/beam';
import { formatNumber } from '../utils/beamCalculations';
import './ResultsDisplay.css';

interface ResultsDisplayProps {
  results: BeamResults | null;
}

export function ResultsDisplay({ results }: ResultsDisplayProps) {
  if (!results) {
    return (
      <div className="results-display">
        <div className="no-results">
          <span className="icon">&#128269;</span>
          <p>Enter beam parameters to see results</p>
        </div>
      </div>
    );
  }

  const getSectionTypeClass = (type: string) => {
    switch (type) {
      case 'tension-controlled':
        return 'status-good';
      case 'transition':
        return 'status-warning';
      case 'compression-controlled':
        return 'status-bad';
      default:
        return '';
    }
  };

  const getSectionTypeLabel = (type: string) => {
    switch (type) {
      case 'tension-controlled':
        return 'Tension-Controlled';
      case 'transition':
        return 'Transition Zone';
      case 'compression-controlled':
        return 'Compression-Controlled';
      default:
        return type;
    }
  };

  return (
    <div className="results-display">
      {/* Primary Results */}
      <div className="results-primary">
        <div className="result-card main-result">
          <span className="result-label">Design Moment Capacity</span>
          <span className="result-value large">
            {formatNumber(results.phiMn_kip_ft, 1)}
            <span className="result-unit">kip-ft</span>
          </span>
          <span className="result-sublabel">
            {'\u03D5'}Mn = {formatNumber(results.phi, 2)} x {formatNumber(results.Mn_kip_ft, 1)} kip-ft
          </span>
        </div>

        <div className="result-card">
          <span className="result-label">Nominal Moment Capacity</span>
          <span className="result-value">
            {formatNumber(results.Mn_kip_ft, 1)}
            <span className="result-unit">kip-ft</span>
          </span>
        </div>

        <div className="result-card">
          <span className="result-label">Strength Reduction Factor</span>
          <span className="result-value">
            {'\u03D5'} = {formatNumber(results.phi, 3)}
          </span>
        </div>
      </div>

      {/* Section Classification */}
      <div className="results-section">
        <h4>Section Classification</h4>
        <div className="classification-box">
          <span className={`section-type ${getSectionTypeClass(results.sectionType)}`}>
            {getSectionTypeLabel(results.sectionType)}
          </span>
          <div className="classification-details">
            <div className="detail-item">
              <span className="detail-label">Tension Steel Strain ({'\u03B5'}t)</span>
              <span className="detail-value">{formatNumber(results.epsilon_t, 5)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Yield Strain ({'\u03B5'}y)</span>
              <span className="detail-value">{formatNumber(results.epsilon_y, 5)}</span>
            </div>
            <div className="strain-bar">
              <div className="strain-zones">
                <span className="zone compression">Comp.</span>
                <span className="zone transition">Trans.</span>
                <span className="zone tension">Tension</span>
              </div>
              <div className="strain-scale">
                <div
                  className="strain-marker"
                  style={{
                    left: `${Math.min(100, Math.max(0, (results.epsilon_t / 0.008) * 100))}%`
                  }}
                  title={`εt = ${formatNumber(results.epsilon_t, 5)}`}
                />
                <span className="scale-mark" style={{ left: '0%' }}>0</span>
                <span className="scale-mark" style={{ left: `${(results.epsilon_y / 0.008) * 100}%` }}>
                  {'\u03B5'}y
                </span>
                <span className="scale-mark" style={{ left: '62.5%' }}>0.005</span>
                <span className="scale-mark" style={{ left: '100%' }}>0.008</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Geometric Results */}
      <div className="results-section">
        <h4>Analysis Parameters</h4>
        <div className="results-grid">
          <div className="result-item">
            <span className="item-label">{'\u03B2'}1 (Stress block factor)</span>
            <span className="item-value">{formatNumber(results.beta1, 3)}</span>
          </div>
          <div className="result-item">
            <span className="item-label">a (Stress block depth)</span>
            <span className="item-value">{formatNumber(results.a, 3)} in</span>
          </div>
          <div className="result-item">
            <span className="item-label">c (Neutral axis depth)</span>
            <span className="item-value">{formatNumber(results.c, 3)} in</span>
          </div>
          <div className="result-item">
            <span className="item-label">{'\u03B5'}cu (Ultimate concrete strain)</span>
            <span className="item-value">{formatNumber(results.epsilon_cu, 4)}</span>
          </div>
        </div>
      </div>

      {/* Reinforcement Ratios */}
      <div className="results-section">
        <h4>Reinforcement Ratios</h4>
        <div className="ratio-comparison">
          <div className="ratio-item">
            <span className="ratio-label">{'\u03C1'}min</span>
            <span className="ratio-value">{(results.rho_min * 100).toFixed(3)}%</span>
            <span className="ratio-description">Minimum</span>
          </div>
          <div className="ratio-item current">
            <span className="ratio-label">{'\u03C1'}</span>
            <span className="ratio-value">{(results.rho * 100).toFixed(3)}%</span>
            <span className="ratio-description">Actual</span>
          </div>
          <div className="ratio-item">
            <span className="ratio-label">{'\u03C1'}max</span>
            <span className="ratio-value">{(results.rho_max * 100).toFixed(3)}%</span>
            <span className="ratio-description">Maximum</span>
          </div>
          <div className="ratio-item">
            <span className="ratio-label">{'\u03C1'}b</span>
            <span className="ratio-value">{(results.rho_b * 100).toFixed(3)}%</span>
            <span className="ratio-description">Balanced</span>
          </div>
        </div>
        <div className="ratio-bar">
          <div
            className="ratio-marker min"
            style={{ left: `${Math.min(100, (results.rho_min / results.rho_b) * 100)}%` }}
          />
          <div
            className="ratio-marker current"
            style={{ left: `${Math.min(100, (results.rho / results.rho_b) * 100)}%` }}
          />
          <div
            className="ratio-marker max"
            style={{ left: `${Math.min(100, (results.rho_max / results.rho_b) * 100)}%` }}
          />
          <div className="ratio-marker balanced" style={{ left: '100%' }} />
        </div>
      </div>

      {/* Code Checks */}
      <div className="results-section">
        <h4>ACI 318 Code Checks</h4>
        <div className="checks-grid">
          <div className={`check-item ${results.isAdequatelyReinforced ? 'pass' : 'fail'}`}>
            <span className="check-icon">{results.isAdequatelyReinforced ? '\u2713' : '\u2717'}</span>
            <span className="check-text">
              Minimum Reinforcement ({'\u03C1'} {'\u2265'} {'\u03C1'}min)
            </span>
          </div>
          <div className={`check-item ${results.isNotOverReinforced ? 'pass' : 'fail'}`}>
            <span className="check-icon">{results.isNotOverReinforced ? '\u2713' : '\u2717'}</span>
            <span className="check-text">
              Maximum Reinforcement ({'\u03C1'} {'\u2264'} {'\u03C1'}max)
            </span>
          </div>
          <div className={`check-item ${results.steelYields ? 'pass' : 'fail'}`}>
            <span className="check-icon">{results.steelYields ? '\u2713' : '\u2717'}</span>
            <span className="check-text">
              Steel Yields ({'\u03B5'}t {'\u2265'} {'\u03B5'}y)
            </span>
          </div>
          <div className={`check-item ${results.sectionType === 'tension-controlled' ? 'pass' : 'warning'}`}>
            <span className="check-icon">
              {results.sectionType === 'tension-controlled' ? '\u2713' : '\u26A0'}
            </span>
            <span className="check-text">
              Tension-Controlled Section ({'\u03B5'}t {'\u2265'} 0.005)
            </span>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {results.warnings.length > 0 && (
        <div className="results-section warnings-section">
          <h4>Warnings & Notes</h4>
          <ul className="warnings-list">
            {results.warnings.map((warning, index) => (
              <li key={index} className={warning.startsWith('Error') ? 'error' : 'warning'}>
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Formulas Reference */}
      <div className="results-section formulas-section">
        <h4>ACI 318-19 Formulas Used</h4>
        <div className="formulas-grid">
          <div className="formula-item">
            <span className="formula">a = As{'\u00B7'}fy / (0.85{'\u00B7'}f'c{'\u00B7'}b)</span>
          </div>
          <div className="formula-item">
            <span className="formula">c = a / {'\u03B2'}1</span>
          </div>
          <div className="formula-item">
            <span className="formula">Mn = As{'\u00B7'}fy{'\u00B7'}(d - a/2)</span>
          </div>
          <div className="formula-item">
            <span className="formula">{'\u03B5'}t = {'\u03B5'}cu{'\u00B7'}(d - c) / c</span>
          </div>
        </div>
      </div>
    </div>
  );
}
