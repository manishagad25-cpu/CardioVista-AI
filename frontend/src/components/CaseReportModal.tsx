import React from 'react';
import type { PatientInput, PredictionResponse, MetricsData } from '../types';
import { Download, Printer, X, ShieldAlert, FileText } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patientInput: PatientInput;
  prediction: PredictionResponse | null;
  metricsData?: MetricsData | null;
}

export const CaseReportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  patientInput,
  prediction,
  metricsData
}) => {
  if (!isOpen) return null;

  const reportId = `CV-RESEARCH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
  const timestamp = new Date().toLocaleString();

  const handleDownloadJSON = () => {
    const reportPayload = {
      report_id: reportId,
      timestamp,
      notice: "FOR RESEARCH & EDUCATIONAL USE ONLY - NOT A MEDICAL DIAGNOSIS",
      deidentified_patient_data: {
        age: patientInput.Age,
        sex: patientInput.Sex,
        bmi: patientInput.BMI,
        bp: patientInput.BP,
        pr: patientInput.PR,
        ef_tte: patientInput["EF-TTE"],
        region_rwma: patientInput["Region RWMA"],
        typical_chest_pain: patientInput["Typical Chest Pain"],
        diabetes: patientInput.DM,
        hypertension: patientInput.HTN,
        smoking_history: patientInput["Current Smoker"],
        dyslipidemia: patientInput.DLP,
        lipids: {
          tg: patientInput.TG,
          ldl: patientInput.LDL,
          hdl: patientInput.HDL
        },
        ecg: {
          st_elevation: patientInput["St Elevation"],
          st_depression: patientInput["St Depression"],
          t_inversion: patientInput.Tinversion,
          q_wave: patientInput["Q Wave"]
        }
      },
      model_predictions: prediction ? {
        CAD: prediction.predictions.CAD,
        LAD: prediction.predictions.LAD,
        LCX: prediction.predictions.LCX,
        RCA: prediction.predictions.RCA,
        vessel_stenosis_count: prediction.vessel_stenosis_count,
        summary: prediction.composite_summary
      } : null,
      model_provenance_and_benchmarks: {
        training_cohort: "Tehran Heart Center (UCI Machine Learning Repository, N=303)",
        validation_framework: "5-Fold Stratified Cross-Validation (N=242) + 20% Unseen Holdout Test (N=61)",
        leakage_safeguards: "Catheterization outcomes (Cath, LAD, LCX, RCA) strictly isolated from features",
        benchmark_metrics: metricsData ? metricsData.metrics : null
      },
      disclaimer: "CardioVista AI is an educational and research workstation prototype. Its algorithmic predictions do not constitute a clinical diagnosis, risk assessment, or treatment recommendation."
    };

    const blob = new Blob([JSON.stringify(reportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cardiovista_research_report_${reportId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#FFFFFF',
        width: '100%',
        maxWidth: '860px',
        maxHeight: '90vh',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden'
      }}>
        {/* Modal Toolbar Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#F8FAFC'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={20} color="#0284C7" />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Research Case Evaluation Report
              </h3>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                Report ID: <span style={{ fontFamily: 'var(--font-mono)' }}>{reportId}</span> • Generated {timestamp}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleDownloadJSON}
            >
              <Download size={13} />
              Export JSON
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handlePrint}
            >
              <Printer size={13} />
              Print / Save PDF
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClose}
              style={{ padding: '6px' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Printable Content Body */}
        <div style={{
          padding: '24px 32px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Research Notice Banner */}
          <div style={{
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderLeft: '4px solid #D97706',
            padding: '10px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11.5px',
            color: '#78350F',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <ShieldAlert size={16} color="#D97706" style={{ flexShrink: 0 }} />
            <div>
              <strong>RESEARCH REPORT ONLY — NOT FOR MEDICAL DIAGNOSIS OR CLINICAL TRIAGE:</strong> This summary details algorithmic pipeline inferences generated for investigative purposes from the Tehran Heart Center protocol. No patient health identifiers (PHI) are included.
            </div>
          </div>

          {/* Section 1: De-identified Patient Profile */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
              1. De-Identified Patient Profile &amp; Clinical Parameters
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '12px' }}>
              <div style={{ background: '#F8FAFC', padding: '8px 12px', borderRadius: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Demographics: </span>
                <strong>{patientInput.Age} yrs, {patientInput.Sex}</strong> (BMI {patientInput.BMI})
              </div>
              <div style={{ background: '#F8FAFC', padding: '8px 12px', borderRadius: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Vitals: </span>
                <strong>BP {patientInput.BP} mmHg, PR {patientInput.PR} bpm</strong>
              </div>
              <div style={{ background: '#F8FAFC', padding: '8px 12px', borderRadius: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Anginal Class: </span>
                <strong>{patientInput["Typical Chest Pain"] === 1 ? 'Typical Chest Pain' : 'Non-Typical'}</strong>
              </div>
              <div style={{ background: '#F8FAFC', padding: '8px 12px', borderRadius: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Echocardiography: </span>
                <strong>EF {patientInput["EF-TTE"]}%, RWMA {patientInput["Region RWMA"]}</strong>
              </div>
              <div style={{ background: '#F8FAFC', padding: '8px 12px', borderRadius: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Key Risk Factors: </span>
                <strong>HTN ({patientInput.HTN}), DM ({patientInput.DM}), FH ({patientInput.FH})</strong>
              </div>
              <div style={{ background: '#F8FAFC', padding: '8px 12px', borderRadius: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Lipids: </span>
                <strong>TG {patientInput.TG}, LDL {patientInput.LDL}, HDL {patientInput.HDL}</strong>
              </div>
            </div>
          </div>

          {/* Section 2: Four-Model Multi-Target Predictions */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
              2. Multitask Model Predictions (4 Targets)
            </h4>
            {prediction ? (
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <table className="clinical-table">
                  <thead>
                    <tr>
                      <th>Clinical Target</th>
                      <th>Model Architecture</th>
                      <th>Algorithmic Probability</th>
                      <th>Predicted Classification</th>
                      <th>Risk Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(['CAD', 'LAD', 'LCX', 'RCA'] as const).map(key => {
                      const res = prediction.predictions[key];
                      const isStenotic = res.predicted_class === 1;
                      return (
                        <tr key={key}>
                          <td>
                            <strong>{res.target_name}</strong>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{res.model_name}</td>
                          <td>
                            <strong style={{ fontSize: '13.5px' }}>{(res.probability * 100).toFixed(1)}%</strong>
                          </td>
                          <td>
                            <span className={`status-badge ${isStenotic ? 'status-badge-abnormal' : 'status-badge-normal'}`}>
                              {res.predicted_label}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${
                              res.risk_level === 'High' ? 'status-badge-abnormal' : res.risk_level === 'Moderate' ? 'status-badge-warning' : 'status-badge-normal'
                            }`}>
                              {res.risk_level}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Predictions pending...</div>
            )}
          </div>

          {/* Section 3: Anatomical Perfusion Summary */}
          {prediction && (
            <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '12px' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Summary &amp; Vascular Involvement:
              </div>
              <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {prediction.composite_summary}
              </div>
              <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                Arteries evaluated: Left Anterior Descending (LAD), Left Circumflex (LCX), Right Coronary Artery (RCA).
              </div>
            </div>
          )}

          {/* Section 4: Model Validation Context & Performance */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
              3. Empirical Validation Benchmarks (Tehran Heart Center Cohort)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '11.5px' }}>
              <div style={{ border: '1px solid var(--border-subtle)', padding: '8px 12px', borderRadius: '4px' }}>
                <strong>CAD (Logistic Regression):</strong><br />
                5-Fold CV F1: 89.6% • Holdout AUC: 90.4%
              </div>
              <div style={{ border: '1px solid var(--border-subtle)', padding: '8px 12px', borderRadius: '4px' }}>
                <strong>LAD (Random Forest):</strong><br />
                5-Fold CV F1: 80.6% • Holdout AUC: 85.3%
              </div>
              <div style={{ border: '1px solid var(--border-subtle)', padding: '8px 12px', borderRadius: '4px' }}>
                <strong>LCX (Logistic Regression):</strong><br />
                5-Fold CV F1: 59.8% • Holdout AUC: 69.7%
              </div>
              <div style={{ border: '1px solid var(--border-subtle)', padding: '8px 12px', borderRadius: '4px' }}>
                <strong>RCA (Logistic Regression):</strong><br />
                5-Fold CV F1: 63.7% • Holdout AUC: 72.9%
              </div>
            </div>
          </div>

          {/* Institutional Signature & Disclaimer */}
          <div style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '12px',
            fontSize: '11px',
            color: 'var(--text-muted)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div>
              CardioVista AI Research Engine (Version 1.0.0) • Scikit-Learn Multi-Target Pipeline
            </div>
            <div>
              Verified Non-Leakage Cohort Protocol • UCI Machine Learning Repository
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
