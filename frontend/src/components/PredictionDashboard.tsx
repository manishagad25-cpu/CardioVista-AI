import React from 'react';
import type { PredictionResponse } from '../types';
import { Heart, GitBranch, CheckCircle2, AlertTriangle, AlertCircle, ShieldCheck } from 'lucide-react';

interface Props {
  prediction: PredictionResponse | null;
  selectedVessel: string | null;
  onSelectVessel: (vessel: string | null) => void;
  isLoading?: boolean;
  onExportReport?: () => void;
}

export const PredictionDashboard: React.FC<Props> = ({
  prediction,
  selectedVessel,
  onSelectVessel,
  isLoading,
  onExportReport
}) => {
  if (isLoading) {
    return (
      <div className="clinical-card" style={{ padding: '32px', textAlign: 'center' }}>
        <div style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '15px', marginBottom: '6px' }}>
          Running Decision-Support Prediction Pipelines...
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Evaluating 54 physiological biomarkers across target-specific trained models for CAD, LAD, LCX, and RCA.
        </p>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="clinical-card" style={{ padding: '32px', textAlign: 'center' }}>
        <Heart size={32} color="#1769AA" style={{ margin: '0 auto 12px', opacity: 0.6 }} />
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '4px', fontSize: '15px' }}>
          No Prediction Evaluated Yet
        </h4>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto' }}>
          Enter patient measurements in the clinical form or load a benchmark case, then click <strong>"Run Decision-Support Prediction"</strong> to evaluate coronary outcomes.
        </p>
      </div>
    );
  }

  const { predictions, composite_summary, vessel_stenosis_count } = prediction;
  const cad = predictions.CAD;
  const lad = predictions.LAD;
  const lcx = predictions.LCX;
  const rca = predictions.RCA;

  const getStatusBadge = (predictedClass: number, prob: number) => {
    if (predictedClass === 1 || prob >= 0.50) {
      return (
        <span className="status-badge status-badge-abnormal">
          <AlertCircle size={12} /> Predicted Stenotic (&ge; 50%)
        </span>
      );
    }
    if (prob >= 0.40) {
      return (
        <span className="status-badge status-badge-warning">
          <AlertTriangle size={12} /> Borderline Risk (40–49%)
        </span>
      );
    }
    return (
      <span className="status-badge status-badge-normal">
        <CheckCircle2 size={12} /> Predicted Normal (&lt; 50%)
      </span>
    );
  };

  const vesselCards = [
    {
      key: 'LAD',
      data: lad,
      name: 'Left Anterior Descending Artery',
      territory: 'Anterior Myocardium & Apex',
      modelUsed: lad.model_name
    },
    {
      key: 'LCX',
      data: lcx,
      name: 'Left Circumflex Artery',
      territory: 'Posterolateral Wall',
      modelUsed: lcx.model_name
    },
    {
      key: 'RCA',
      data: rca,
      name: 'Right Coronary Artery',
      territory: 'Inferior Wall & Conduction Nodes',
      modelUsed: rca.model_name
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. Primary CAD Summary Card */}
      <div className="clinical-card" style={{
        borderLeft: cad.predicted_class === 1 ? '4px solid #C62828' : '4px solid #2E7D32'
      }}>
        <div className="clinical-card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Heart size={18} color={cad.predicted_class === 1 ? '#C62828' : '#2E7D32'} />
              <h3 style={{ fontSize: '15px' }}>Overall Coronary Artery Disease (CAD) Evaluation</h3>
              {getStatusBadge(cad.predicted_class, cad.probability)}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Catheterization Outcome Target: $\ge 50\%$ diameter stenosis in any major epicardial coronary vessel
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {onExportReport && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={onExportReport}
                style={{ height: '32px', gap: '6px' }}
              >
                <span>Export Case Report</span>
              </button>
            )}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: cad.predicted_class === 1 ? '#C62828' : '#2E7D32', lineHeight: 1 }}>
                {(cad.probability * 100).toFixed(1)}%
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Model Probability Score
              </div>
            </div>
          </div>
        </div>

        <div className="clinical-card-body" style={{ padding: '14px 20px', background: '#FAFCFE' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
            {composite_summary}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Pipeline Architecture: <strong>{cad.model_name}</strong> (Stratified 5-Fold CV F1: 89.6%, Holdout ROC-AUC: 0.904)
          </div>
        </div>
      </div>

      {/* 2. Vessel-Specific Decision-Support Panels (LAD, LCX, RCA) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Coronary Branch-Specific Stenosis Estimates
          </h4>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Click a vessel panel to inspect its perfusion territory on the 3D model
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          {vesselCards.map(v => {
            const isSelected = selectedVessel === v.key;
            const isStenotic = v.data.predicted_class === 1;

            return (
              <div
                key={v.key}
                className="clinical-card"
                onClick={() => onSelectVessel(isSelected ? null : v.key)}
                style={{
                  padding: '14px 16px',
                  cursor: 'pointer',
                  borderColor: isSelected ? 'var(--color-primary)' : undefined,
                  boxShadow: isSelected ? '0 0 0 2px rgba(23, 105, 170, 0.2)' : undefined,
                  background: isSelected ? '#FAFCFE' : '#FFFFFF',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <GitBranch size={15} color={isStenotic ? '#C62828' : '#2E7D32'} />
                      <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{v.key} Branch</strong>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {v.territory}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: isStenotic ? '#C62828' : '#2E7D32', lineHeight: 1 }}>
                      {(v.data.probability * 100).toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>probability</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #EEF2F6' }}>
                  {getStatusBadge(v.data.predicted_class, v.data.probability)}
                  <span style={{ fontSize: '11px', color: isSelected ? 'var(--color-primary)' : 'var(--text-muted)', fontWeight: isSelected ? 600 : 400 }}>
                    {isSelected ? 'Active 3D View' : 'Focus in 3D →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Stenosis Burden & Interpretation Disclaimer */}
      <div style={{
        padding: '10px 16px',
        background: '#FFFFFF',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} color="#168C88" />
          <span>
            Vessel Stenosis Burden: <strong>{vessel_stenosis_count} of 3</strong> epicardial branches with predicted significant stenosis (&ge; 50%).
          </span>
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
          Research Model Output • Not an Established Diagnostic Risk Score
        </div>
      </div>
    </div>
  );
};
