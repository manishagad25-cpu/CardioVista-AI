import React from 'react';
import { BookOpen, Database, Cpu, Heart, AlertTriangle, ShieldAlert } from 'lucide-react';

export const MethodologySection: React.FC = () => {
  return (
    <div className="clinical-card" id="methodology-section">
      <div className="clinical-card-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} color="#1769AA" />
            <h3 style={{ fontSize: '15px' }}>Methodology, Dataset Provenance &amp; Limitations</h3>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Clinical data provenance, machine-learning governance, and ethical safety boundaries
          </p>
        </div>
      </div>

      <div className="clinical-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px', fontSize: '13px', lineHeight: '1.6' }}>
        {/* Prominent Restrained Medical Disclaimer */}
        <div className="clinical-disclaimer">
          <ShieldAlert size={18} color="#D4A340" style={{ flexShrink: 0 }} />
          <div>
            <strong>OFFICIAL MEDICAL NOTICE:</strong> CardioVista AI is an educational and research prototype. Its predictions are not a medical diagnosis and have not been validated for clinical use. Do not use this tool to make medical decisions or delay professional medical care.
          </div>
        </div>

        {/* 1. Dataset Provenance */}
        <div>
          <h4 style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Database size={15} color="#1769AA" /> 1. Clinical Cohort &amp; Ground Truth
          </h4>
          <p style={{ color: 'var(--text-secondary)' }}>
            CardioVista AI is trained on the University of California Irvine (UCI) <em>Extension of Z-Alizadeh Sani Dataset</em>, collected at the Tehran Heart Center. The cohort comprises <strong>303 patients</strong> evaluated with catheterization angiography, capturing 59 clinical attributes across demographic, physical examination, resting electrocardiography, blood biomarkers, and transthoracic echocardiography. Ground-truth coronary artery stenosis is defined as $\ge 50\%$ luminal diameter reduction in coronary angiography.
          </p>
        </div>

        {/* 2. Target Leakage Isolation Protocol */}
        <div>
          <h4 style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Cpu size={15} color="#1769AA" /> 2. Target Leakage Prevention Protocol
          </h4>
          <p style={{ color: 'var(--text-secondary)' }}>
            To eliminate target leakage, catheterization outcomes <code>Cath</code>, <code>LAD</code>, <code>LCX</code>, and <code>RCA</code>, along with the zero-variance constant attribute <code>Exertional CP</code>, were strictly excised from model inputs. All preprocessing pipelines—including missing value imputation, continuous feature scaling (<code>StandardScaler</code>), and categorical encoding (<code>OneHotEncoder</code>)—were fit strictly within training folds during stratified cross-validation.
          </p>
        </div>

        {/* 3. 3D Anatomical Heart Representation */}
        <div>
          <h4 style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Heart size={15} color="#1769AA" /> 3. 3D Anatomical Coronary Representation
          </h4>
          <p style={{ color: 'var(--text-secondary)' }}>
            The WebGL heart model provides an anatomically complete representation of the human cardiac chambers (left &amp; right ventricles, atria, auricles), ascending aorta with brachiocephalic arch branching, pulmonary trunk with arterial bifurcation, and superior/inferior venae cavae. Coronary artery branches (LAD, LCX, RCA) are rendered along their clinical anatomical sulci, dynamically updating surface materials based on returned inference probabilities. This visualization represents standard human coronary anatomy for research demonstration and is not an individual patient-specific computed tomography (CT) volumetric segmentation.
          </p>
        </div>

        {/* 4. Documented Clinical Limitations */}
        <div>
          <h4 style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <AlertTriangle size={15} color="#B26A00" /> 4. Documented Limitations &amp; Statistical Uncertainty
          </h4>
          <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <li><strong>Sample Size Constraint:</strong> 303 patient records represent a relatively small academic sample size, which limits sub-group statistical power for rare comorbid conditions.</li>
            <li><strong>Single-Center Referral Bias:</strong> Data originated from a single cardiovascular referral center where baseline CAD pre-test probability is high (71.3% prevalence in catheterized candidates).</li>
            <li><strong>Absence of External Clinical Trial Validation:</strong> While cross-validation demonstrates strong internal validity (89.6% F1 for CAD, 80.6% F1 for LAD), external multicenter prospective validation has not been performed.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
