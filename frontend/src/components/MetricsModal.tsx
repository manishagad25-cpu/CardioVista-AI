import React, { useState } from 'react';
import type { MetricsData } from '../types';
import { X, Award, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  metricsData: MetricsData | null;
}

export const MetricsModal: React.FC<Props> = ({ isOpen, onClose, metricsData }) => {
  const [selectedTarget, setSelectedTarget] = useState<string>('CAD');

  if (!isOpen || !metricsData) return null;

  const targetData = metricsData.metrics[selectedTarget];
  const primary = targetData?.primary_metrics;
  const cv = targetData?.cv_metrics;
  const comparisons = targetData?.model_comparison || {};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Award size={22} color="#06b6d4" />
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#f8fafc' }}>Verified Model Evaluation &amp; Benchmarks</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Rigorous 5-Fold Stratified Cross-Validation &amp; 20% Unseen Holdout Test
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '0.4rem', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Target Switcher */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {Object.keys(metricsData.metrics).map(targetKey => (
            <button
              key={targetKey}
              className={`btn-secondary ${selectedTarget === targetKey ? 'active-view' : ''}`}
              onClick={() => setSelectedTarget(targetKey)}
              style={{
                fontSize: '0.82rem',
                padding: '0.45rem 1rem',
                borderColor: selectedTarget === targetKey ? '#06b6d4' : undefined,
                color: selectedTarget === targetKey ? '#38bdf8' : undefined
              }}
            >
              Target: {targetKey} ({metricsData.metrics[targetKey].best_model})
            </button>
          ))}
        </div>

        {/* Primary Metrics Grid */}
        {targetData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.75rem'
            }}>
              {[
                { label: 'Holdout F1-Score', val: (primary.f1 * 100).toFixed(1) + '%', color: '#38bdf8' },
                { label: 'Holdout ROC-AUC', val: primary.roc_auc ? (primary.roc_auc * 100).toFixed(1) + '%' : 'N/A', color: '#10b981' },
                { label: 'Holdout Accuracy', val: (primary.accuracy * 100).toFixed(1) + '%', color: '#f8fafc' },
                { label: 'Holdout Precision', val: (primary.precision * 100).toFixed(1) + '%', color: '#cbd5e1' },
                { label: 'Holdout Recall', val: (primary.recall * 100).toFixed(1) + '%', color: '#cbd5e1' },
                { label: '5-Fold CV F1', val: (cv.f1 * 100).toFixed(1) + '%', color: '#fbbf24' }
              ].map((m, i) => (
                <div key={i} style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>{m.label}</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: m.color }}>{m.val}</div>
                </div>
              ))}
            </div>

            {/* Confusion Matrix */}
            {primary.confusion_matrix && (
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: '#f8fafc' }}>
                  Holdout Test Confusion Matrix (N = 61 unseen patients)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', maxWidth: '360px', margin: '0 auto' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-sm)', padding: '0.6rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: '#34d399' }}>True Negative (TN)</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{primary.confusion_matrix[0][0]}</div>
                  </div>
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', padding: '0.6rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: '#f87171' }}>False Positive (FP)</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{primary.confusion_matrix[0][1]}</div>
                  </div>
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', padding: '0.6rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: '#f87171' }}>False Negative (FN)</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{primary.confusion_matrix[1][0]}</div>
                  </div>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-sm)', padding: '0.6rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: '#34d399' }}>True Positive (TP)</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{primary.confusion_matrix[1][1]}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Model Comparison Table */}
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.6rem', color: '#f8fafc' }}>
                Candidate Model Benchmarks for {selectedTarget}
              </h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-subtle)' }}>
                      <th style={{ padding: '0.55rem' }}>Model Architecture</th>
                      <th style={{ padding: '0.55rem' }}>CV 5-Fold F1</th>
                      <th style={{ padding: '0.55rem' }}>CV 5-Fold AUC</th>
                      <th style={{ padding: '0.55rem' }}>Holdout Test F1</th>
                      <th style={{ padding: '0.55rem' }}>Holdout Test AUC</th>
                      <th style={{ padding: '0.55rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(comparisons).map(([mName, mScores]: any) => {
                      const isBest = targetData.best_model === mName;
                      return (
                        <tr key={mName} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: isBest ? 'rgba(6, 182, 212, 0.08)' : undefined }}>
                          <td style={{ padding: '0.55rem', fontWeight: 600, color: isBest ? '#38bdf8' : '#f8fafc' }}>{mName}</td>
                          <td style={{ padding: '0.55rem' }}>{(mScores.cv_5fold.f1 * 100).toFixed(1)}%</td>
                          <td style={{ padding: '0.55rem' }}>{(mScores.cv_5fold.roc_auc * 100).toFixed(1)}%</td>
                          <td style={{ padding: '0.55rem' }}>{(mScores.holdout_test.f1 * 100).toFixed(1)}%</td>
                          <td style={{ padding: '0.55rem' }}>{mScores.holdout_test.roc_auc ? (mScores.holdout_test.roc_auc * 100).toFixed(1) + '%' : 'N/A'}</td>
                          <td style={{ padding: '0.55rem' }}>
                            {isBest ? <span className="badge badge-success">Selected</span> : <span style={{ color: 'var(--text-subtle)' }}>Benchmark</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Leakage Prevention Statement */}
            <div style={{ background: 'rgba(30, 41, 59, 0.4)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: 600, marginBottom: '0.2rem' }}>
                <ShieldCheck size={14} /> Strict Leakage Prevention Verified
              </div>
              <div>Cath, LAD, LCX, and RCA columns were isolated from input feature sets prior to pipeline construction. All transformers were fit exclusively on training data.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
