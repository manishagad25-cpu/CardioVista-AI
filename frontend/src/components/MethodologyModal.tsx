import React from 'react';
import { X, BookOpen, AlertTriangle, ShieldAlert, Cpu, HeartHandshake, Database } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <BookOpen size={22} color="#06b6d4" />
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#f8fafc' }}>Methodology, Architecture &amp; Clinical Limitations</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Dataset Provenance, Machine-Learning Governance &amp; Ethical Disclaimers
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.4rem', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.86rem', color: '#cbd5e1', lineHeight: '1.55' }}>
          {/* Prominent Medical Disclaimer */}
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            borderLeft: '4px solid #ef4444',
            padding: '0.85rem 1.15rem',
            borderRadius: 'var(--radius-sm)',
            color: '#fca5a5'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, marginBottom: '0.25rem', color: '#f87171' }}>
              <ShieldAlert size={18} /> Official Medical Safety Notice
            </div>
            CardioVista AI is strictly an educational and investigative research prototype. Its machine-learning predictions do not constitute a medical diagnosis and have not been validated for real-world clinical decision-making. Never use this software to alter medication, triage acute cardiac symptoms, or delay certified medical care.
          </div>

          {/* Section 1: Dataset Provenance */}
          <div>
            <h4 style={{ color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.4rem' }}>
              <Database size={16} color="#06b6d4" /> 1. Dataset Provenance &amp; Ground Truth
            </h4>
            <p>
              The system trains on the UCI <em>Extension of Z-Alizadeh Sani Dataset</em> collected at the Tehran Heart Center. The cohort comprises <strong>303 patients</strong> evaluated with catheterization angiography, capturing 59 clinical attributes across demographic, physical examination, resting electrocardiography, blood biomarkers, and transthoracic echocardiography.
            </p>
          </div>

          {/* Section 2: Target Leakage Isolation */}
          <div>
            <h4 style={{ color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.4rem' }}>
              <Cpu size={16} color="#06b6d4" /> 2. Target Leakage Prevention Architecture
            </h4>
            <p>
              To eliminate spurious data leakage, the angiography outcomes <code>Cath</code>, <code>LAD</code>, <code>LCX</code>, and <code>RCA</code> were strictly excluded from predictor matrices. Uninformative zero-variance fields (<code>Exertional CP</code>) were eliminated. Imputation and continuous feature standardization (<code>StandardScaler</code>) and categorical encoders (<code>OneHotEncoder</code>) are fit strictly within training folds during 5-fold cross-validation.
            </p>
          </div>

          {/* Section 3: 3D Visualization Modeling */}
          <div>
            <h4 style={{ color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.4rem' }}>
              <HeartHandshake size={16} color="#06b6d4" /> 3. 3D Anatomical Heart Representation
            </h4>
            <p>
              The WebGL heart model visually represents the epicardial coronary anatomy (Left Anterior Descending, Left Circumflex, and Right Coronary Artery). Dynamic shader colors and emissive glows reflect the output of target-specific machine-learning models. The model is an illustrative anatomical representation designed for visual interpretation and patient education, not a patient-specific volumetric CT reconstruction.
            </p>
          </div>

          {/* Section 4: Documented Limitations */}
          <div>
            <h4 style={{ color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.4rem' }}>
              <AlertTriangle size={16} color="#f59e0b" /> 4. Clinical Limitations &amp; Uncertainty
            </h4>
            <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li><strong>Sample Size:</strong> 303 patient records represent a relatively small sample size, which limits sub-group generalization.</li>
              <li><strong>Single-Center Cohort:</strong> Demographic and clinical biases from a single geographic medical center are present.</li>
              <li><strong>Association vs. Causation:</strong> Feature contribution rankings reflect model weights and cannot be interpreted as pathophysiological causation.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
