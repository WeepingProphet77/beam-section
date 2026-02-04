import { useState, useEffect } from 'react';
import { InputForm } from './components/InputForm';
import { BeamVisualization } from './components/BeamVisualization';
import { ResultsDisplay } from './components/ResultsDisplay';
import type { BeamInput, BeamResults } from './types/beam';
import { DEFAULT_BEAM_INPUT } from './types/beam';
import { analyzeBeam } from './utils/beamCalculations';
import './App.css';

function App() {
  const [input, setInput] = useState<BeamInput>(DEFAULT_BEAM_INPUT);
  const [results, setResults] = useState<BeamResults | null>(null);

  // Calculate results whenever input changes
  useEffect(() => {
    // Validate input before calculating
    if (
      input.b > 0 &&
      input.h > 0 &&
      input.d > 0 &&
      input.d <= input.h &&
      input.fc > 0 &&
      input.fy > 0 &&
      input.Es > 0 &&
      input.As > 0
    ) {
      const newResults = analyzeBeam(input);
      setResults(newResults);
    } else {
      setResults(null);
    }
  }, [input]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">&#9632;</span>
            <div className="logo-text">
              <h1>Beam Section Calculator</h1>
              <span className="subtitle">ACI 318-19 Flexural Analysis</span>
            </div>
          </div>
          <div className="header-info">
            <span className="badge">Reinforced Concrete</span>
            <span className="badge">US Customary Units</span>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="main-content">
          <div className="left-panel">
            <section className="panel-section">
              <h2>Input Parameters</h2>
              <InputForm input={input} onChange={setInput} />
            </section>
          </div>

          <div className="center-panel">
            <section className="panel-section visualization-section">
              <BeamVisualization input={input} results={results} />
            </section>
          </div>

          <div className="right-panel">
            <section className="panel-section">
              <h2>Analysis Results</h2>
              <ResultsDisplay results={results} />
            </section>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>
            <strong>Disclaimer:</strong> This calculator is for educational and preliminary design purposes only.
            All designs must be verified by a licensed professional engineer.
          </p>
          <p className="footer-reference">
            Reference: ACI 318-19 Building Code Requirements for Structural Concrete
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
