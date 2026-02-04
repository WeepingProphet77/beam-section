import type { BeamInput } from '../types/beam';
import { REBAR_AREAS, CONCRETE_STRENGTHS, STEEL_GRADES } from '../types/beam';
import './InputForm.css';

interface InputFormProps {
  input: BeamInput;
  onChange: (input: BeamInput) => void;
}

export function InputForm({ input, onChange }: InputFormProps) {
  const handleChange = (field: keyof BeamInput, value: number) => {
    onChange({ ...input, [field]: value });
  };

  const calculateEffectiveDepth = () => {
    // Estimate effective depth as h - 2.5" (typical cover + bar radius)
    const estimated = input.h - 2.5;
    if (estimated > 0) {
      handleChange('d', Number(estimated.toFixed(2)));
    }
  };

  const getTotalSteelArea = (barSize: string, count: number): number => {
    return REBAR_AREAS[barSize] * count;
  };

  return (
    <div className="input-form">
      <div className="form-section">
        <h3>
          <span className="section-icon">&#9634;</span>
          Section Geometry
        </h3>
        <div className="input-grid">
          <div className="input-group">
            <label htmlFor="b">Width (b)</label>
            <div className="input-with-unit">
              <input
                id="b"
                type="number"
                value={input.b}
                onChange={(e) => handleChange('b', parseFloat(e.target.value) || 0)}
                min="1"
                step="0.5"
              />
              <span className="unit">in</span>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="h">Total Height (h)</label>
            <div className="input-with-unit">
              <input
                id="h"
                type="number"
                value={input.h}
                onChange={(e) => handleChange('h', parseFloat(e.target.value) || 0)}
                min="1"
                step="0.5"
              />
              <span className="unit">in</span>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="d">
              Effective Depth (d)
              <button
                type="button"
                className="calc-btn"
                onClick={calculateEffectiveDepth}
                title="Estimate as h - 2.5 inches"
              >
                Auto
              </button>
            </label>
            <div className="input-with-unit">
              <input
                id="d"
                type="number"
                value={input.d}
                onChange={(e) => handleChange('d', parseFloat(e.target.value) || 0)}
                min="1"
                step="0.25"
              />
              <span className="unit">in</span>
            </div>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>
          <span className="section-icon">&#9679;</span>
          Material Properties
        </h3>
        <div className="input-grid">
          <div className="input-group">
            <label htmlFor="fc">Concrete Strength (f'c)</label>
            <div className="input-with-unit">
              <select
                id="fc"
                value={input.fc}
                onChange={(e) => handleChange('fc', parseFloat(e.target.value))}
              >
                {CONCRETE_STRENGTHS.map((strength) => (
                  <option key={strength} value={strength}>
                    {strength.toLocaleString()}
                  </option>
                ))}
              </select>
              <span className="unit">psi</span>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="fy">Steel Yield Strength (fy)</label>
            <div className="input-with-unit">
              <select
                id="fy"
                value={input.fy}
                onChange={(e) => handleChange('fy', parseFloat(e.target.value))}
              >
                {STEEL_GRADES.map((grade) => (
                  <option key={grade} value={grade}>
                    Grade {grade / 1000}
                  </option>
                ))}
              </select>
              <span className="unit">psi</span>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="Es">Steel Modulus (Es)</label>
            <div className="input-with-unit">
              <input
                id="Es"
                type="number"
                value={input.Es}
                onChange={(e) => handleChange('Es', parseFloat(e.target.value) || 29000000)}
                step="1000000"
              />
              <span className="unit">psi</span>
            </div>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>
          <span className="section-icon">&#9644;</span>
          Tension Reinforcement
        </h3>
        <div className="input-grid">
          <div className="input-group full-width">
            <label htmlFor="As">Area of Tension Steel (As)</label>
            <div className="input-with-unit">
              <input
                id="As"
                type="number"
                value={input.As}
                onChange={(e) => handleChange('As', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.1"
              />
              <span className="unit">in&sup2;</span>
            </div>
          </div>
        </div>

        <div className="rebar-helper">
          <p className="helper-title">Quick Reference - Bar Areas:</p>
          <div className="rebar-grid">
            {Object.entries(REBAR_AREAS).map(([bar, area]) => (
              <div key={bar} className="rebar-item">
                <span className="bar-name">{bar}</span>
                <span className="bar-area">{area.toFixed(2)} in&sup2;</span>
              </div>
            ))}
          </div>

          <div className="rebar-calculator">
            <p className="helper-title">Quick Calculator:</p>
            <div className="rebar-calc-row">
              <select
                id="barSize"
                defaultValue="#8"
                onChange={(e) => {
                  const count = parseInt((document.getElementById('barCount') as HTMLInputElement).value) || 0;
                  const total = getTotalSteelArea(e.target.value, count);
                  handleChange('As', Number(total.toFixed(2)));
                }}
              >
                {Object.keys(REBAR_AREAS).map((bar) => (
                  <option key={bar} value={bar}>{bar}</option>
                ))}
              </select>
              <span>x</span>
              <input
                id="barCount"
                type="number"
                defaultValue={3}
                min={1}
                max={20}
                onChange={(e) => {
                  const barSize = (document.getElementById('barSize') as HTMLSelectElement).value;
                  const total = getTotalSteelArea(barSize, parseInt(e.target.value) || 0);
                  handleChange('As', Number(total.toFixed(2)));
                }}
              />
              <span>bars</span>
            </div>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>
          <span className="section-icon">&#9650;</span>
          Compression Reinforcement (Optional)
        </h3>
        <div className="input-grid">
          <div className="input-group">
            <label htmlFor="As_prime">Area of Compression Steel (A's)</label>
            <div className="input-with-unit">
              <input
                id="As_prime"
                type="number"
                value={input.As_prime}
                onChange={(e) => handleChange('As_prime', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.1"
              />
              <span className="unit">in&sup2;</span>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="d_prime">Depth to Compression Steel (d')</label>
            <div className="input-with-unit">
              <input
                id="d_prime"
                type="number"
                value={input.d_prime}
                onChange={(e) => handleChange('d_prime', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.25"
              />
              <span className="unit">in</span>
            </div>
          </div>
        </div>
        <p className="form-note">
          Note: Compression reinforcement analysis is simplified. For accurate doubly-reinforced beam analysis,
          verify compression steel yields.
        </p>
      </div>
    </div>
  );
}
