import { useState } from 'react';
import type { BeamInput, BeamResults } from '../types/beam';
import { generatePDF } from '../utils/pdfExport';
import './ExportModal.css';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  input: BeamInput;
  results: BeamResults;
}

export function ExportModal({ isOpen, onClose, input, results }: ExportModalProps) {
  const [projectName, setProjectName] = useState('');
  const [projectNumber, setProjectNumber] = useState('');
  const [engineer, setEngineer] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);

    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      generatePDF(input, results, {
        projectName: projectName || 'Reinforced Concrete Beam Design',
        projectNumber,
        engineer,
        date: new Date().toLocaleDateString(),
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsExporting(false);
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Export Calculation Sheet</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            Generate a professional PDF calculation sheet suitable for submission to a project reviewer.
            The PDF will include all calculations with ACI 318-19 references.
          </p>

          <div className="form-group">
            <label htmlFor="projectName">Project Name</label>
            <input
              id="projectName"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g., Building A - Floor Beam B-1"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="projectNumber">Project Number</label>
              <input
                id="projectNumber"
                type="text"
                value={projectNumber}
                onChange={(e) => setProjectNumber(e.target.value)}
                placeholder="e.g., 2024-001"
              />
            </div>

            <div className="form-group">
              <label htmlFor="engineer">Engineer</label>
              <input
                id="engineer"
                type="text"
                value={engineer}
                onChange={(e) => setEngineer(e.target.value)}
                placeholder="e.g., John Smith, P.E."
              />
            </div>
          </div>

          <div className="preview-section">
            <h4>PDF Contents Preview</h4>
            <ul className="preview-list">
              <li>Project header with engineer information</li>
              <li>Input parameters (geometry, materials, reinforcement)</li>
              <li>Step-by-step flexural analysis calculations</li>
              <li>Strain compatibility verification</li>
              <li>Reinforcement limit checks per ACI 318-19</li>
              <li>Design summary with capacity and section classification</li>
              <li>All equations with ACI 318-19 section references</li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <span className="spinner"></span>
                Generating...
              </>
            ) : (
              <>
                <span className="icon">&#128196;</span>
                Export PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
