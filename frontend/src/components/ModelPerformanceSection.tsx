import React, { useState } from 'react';
import type { MetricsData } from '../types';
import { Award, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Props {
  metricsData: MetricsData | null;
}

const TARGET_COHORT_DETAILS: Record<string, {
  fullName: string;
  totalPos: number;
  totalNeg: number;
  posLabel: string;
  negLabel: string;
  trainPos: number;
  testPos: number;
}> = {
  CAD: {
    fullName: 'Coronary Artery Disease (CAD)',
    totalPos: 216,
    totalNeg: 87,
    posLabel: 'CAD Positive (71.3%)',
    negLabel: 'Normal / Non-CAD (28.7%)',
    trainPos: 173,
    testPos: 43
  },
  LAD: {
    fullName: 'Left Anterior Descending (LAD) Stenosis',
    totalPos: 177,
    totalNeg: 126,
    posLabel: 'Stenotic >= 50% (58.4%)',
    negLabel: 'Normal < 50% (41.6%)',
    trainPos: 141,
    testPos: 36
  },
  LCX: {
    fullName: 'Left Circumflex (LCX) Stenosis',
    totalPos: 119,
    totalNeg: 184,
    posLabel: 'Stenotic >= 50% (39.3%)',
    negLabel: 'Normal < 50% (60.7%)',
    trainPos: 95,
    testPos: 24
  },
  RCA: {
    fullName: 'Right Coronary Artery (RCA) Stenosis',
    totalPos: 114,
    totalNeg: 189,
    posLabel: 'Stenotic >= 50% (37.6%)',
    negLabel: 'Normal < 50% (62.4%)',
    trainPos: 91,
    testPos: 23
  }
};

export const ModelPerformanceSection: React.FC<Props> = ({ metricsData }) => {
  const [selectedTarget, setSelectedTarget] = useState<string>('CAD');

  if (!metricsData) {
    return (
      <div className="clinical-card" id="performance-section" style={{ padding: '24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading verified evaluation benchmarks...</p>
      </div>
    );
  }

  const targetData = metricsData.metrics[selectedTarget];
  const primary = targetData?.primary_metrics;
  const cv = targetData?.cv_metrics;
  const comparisons = targetData?.model_comparison || {};
  const cohort = TARGET_COHORT_DETAILS[selectedTarget] || TARGET_COHORT_DETAILS['CAD'];

  return (
    <div className="clinical-card" id="performance-section">
      <div className="clinical-card-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0284C7'
            }}>
              <Award size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Model Reliability Center &amp; Empirical Validation
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Independent Holdout Test ($N=61$) &amp; 5-Fold Stratified Cross-Validation ($N=242$) from Verified Tehran Heart Center Cohort ($N=303$)
              </p>
            </div>
          </div>
        </div>

        {/* Target Switcher */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {Object.keys(metricsData.metrics).map(targetKey => (
            <button
              key={targetKey}
              className={`btn btn-secondary btn-sm ${selectedTarget === targetKey ? 'active' : ''}`}
              onClick={() => setSelectedTarget(targetKey)}
              style={selectedTarget === targetKey ? { background: '#0284C7', color: '#FFFFFF', borderColor: '#0284C7' } : {}}
            >
              {targetKey} ({metricsData.metrics[targetKey].best_model})
            </button>
          ))}
        </div>
      </div>

      <div className="clinical-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {targetData && (
          <>
            {/* 1. Cohort Sample Counts & Class Distribution Banner */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              background: '#F8FAFC',
              padding: '14px 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Total Cohort Sample Count
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  N = 303 Patients
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Tehran Heart Center (UCI Archive)
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Train Partition (5-Fold CV)
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#0284C7', marginTop: '2px' }}>
                  N = 242 (80.0%)
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Stratified out-of-fold validation
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Unseen Holdout Test Set
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F766E', marginTop: '2px' }}>
                  N = 61 (20.0%)
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Independent unseen evaluation
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Target Prevalence ({selectedTarget})
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {cohort.totalPos} pos / {cohort.totalNeg} neg
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {cohort.posLabel}
                </div>
              </div>
            </div>

            {/* 2. Primary Metrics Summary Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '12px'
            }}>
              {[
                { label: 'Holdout F1-Score', val: (primary.f1 * 100).toFixed(1) + '%', sub: 'Unseen holdout test (N=61)' },
                { label: 'Holdout ROC-AUC', val: primary.roc_auc ? (primary.roc_auc * 100).toFixed(1) + '%' : 'N/A', sub: 'Discrimination area' },
                { label: 'Holdout Accuracy', val: (primary.accuracy * 100).toFixed(1) + '%', sub: 'Total test concordance' },
                { label: 'Holdout Precision', val: (primary.precision * 100).toFixed(1) + '%', sub: 'Positive predictive value' },
                { label: 'Holdout Recall', val: (primary.recall * 100).toFixed(1) + '%', sub: 'Clinical sensitivity' },
                { label: '5-Fold CV F1', val: (cv.f1 * 100).toFixed(1) + '%', sub: 'Cross-validated mean (N=242)' }
              ].map((m, i) => (
                <div
                  key={i}
                  style={{
                    padding: '14px 16px',
                    background: '#FFFFFF',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    textAlign: 'center',
                    boxShadow: 'var(--shadow-subtle)'
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                    {m.label}
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0 2px' }}>
                    {m.val}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {m.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* 3. Holdout Confusion Matrix */}
            {primary.confusion_matrix && (
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Unseen Holdout Test Confusion Matrix (N = 61 Independent Patients)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                  <div style={{ padding: '12px 14px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '11px', color: '#065F46', fontWeight: 600 }}>True Negatives (TN)</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#065F46' }}>{primary.confusion_matrix[0][0]}</div>
                    <div style={{ fontSize: '10.5px', color: '#047857' }}>Correctly identified non-stenotic</div>
                  </div>
                  <div style={{ padding: '12px 14px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '11px', color: '#92400E', fontWeight: 600 }}>False Positives (FP)</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#92400E' }}>{primary.confusion_matrix[0][1]}</div>
                    <div style={{ fontSize: '10.5px', color: '#B45309' }}>Type I error (False alarm)</div>
                  </div>
                  <div style={{ padding: '12px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '11px', color: '#991B1B', fontWeight: 600 }}>False Negatives (FN)</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#991B1B' }}>{primary.confusion_matrix[1][0]}</div>
                    <div style={{ fontSize: '10.5px', color: '#B91C1C' }}>Type II error (Missed stenosis)</div>
                  </div>
                  <div style={{ padding: '12px 14px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '11px', color: '#065F46', fontWeight: 600 }}>True Positives (TP)</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#065F46' }}>{primary.confusion_matrix[1][1]}</div>
                    <div style={{ fontSize: '10.5px', color: '#047857' }}>Correctly identified stenotic</div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Model Architecture Benchmark Comparison Table */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Architecture Benchmark Comparison ({selectedTarget} Target across 3 Classifiers)
              </div>
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <table className="clinical-table">
                  <thead>
                    <tr>
                      <th>Candidate Architecture</th>
                      <th>5-Fold CV Accuracy</th>
                      <th>5-Fold CV F1</th>
                      <th>5-Fold CV ROC-AUC</th>
                      <th>Holdout Test F1</th>
                      <th>Holdout Test AUC</th>
                      <th>Selection</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(comparisons).map(([mName, mScores]: any) => {
                      const isSelected = targetData.best_model === mName;
                      return (
                        <tr key={mName} style={{ background: isSelected ? '#F0F9FF' : undefined }}>
                          <td style={{ fontWeight: isSelected ? 600 : 500, color: isSelected ? '#0284C7' : 'var(--text-primary)' }}>
                            {mName}
                          </td>
                          <td>{(mScores.cv_5fold.accuracy * 100).toFixed(1)}%</td>
                          <td>{(mScores.cv_5fold.f1 * 100).toFixed(1)}%</td>
                          <td>{(mScores.cv_5fold.roc_auc * 100).toFixed(1)}%</td>
                          <td>{(mScores.holdout_test.f1 * 100).toFixed(1)}%</td>
                          <td>{mScores.holdout_test.roc_auc ? (mScores.holdout_test.roc_auc * 100).toFixed(1) + '%' : 'N/A'}</td>
                          <td>
                            {isSelected ? (
                              <span className="status-badge status-badge-normal">
                                <CheckCircle2 size={11} /> Primary Model
                              </span>
                            ) : (
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Benchmark</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. Probability Calibration Limitation Warning */}
            <div style={{
              padding: '12px 16px',
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderLeft: '4px solid #D97706',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              color: '#78350F',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              lineHeight: 1.5
            }}>
              <AlertTriangle size={16} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Calibration Limitation Notice:</strong> Predicted probabilities (e.g. 78.1%) represent raw algorithmic decision scores generated by the logistic sigmoid or random forest tree vote fraction. They reflect relative ranking capability within the Tehran Heart Center cohort and do <em>not</em> constitute calibrated Bayesian confidence intervals or posterior clinical diagnostic certainties.
              </div>
            </div>

            {/* 6. Target Leakage Prevention Note */}
            <div style={{
              padding: '10px 14px',
              background: '#F8FAFC',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <ShieldCheck size={16} color="#0F766E" style={{ flexShrink: 0 }} />
              <div>
                <strong>Target Leakage Prevention Verified:</strong> Catheterization targets (<code>Cath</code>, <code>LAD</code>, <code>LCX</code>, <code>RCA</code>) were strictly removed from feature inputs prior to modeling. All transformers (imputation, <code>StandardScaler</code>, <code>OneHotEncoder</code>) were fit strictly on training partitions.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
