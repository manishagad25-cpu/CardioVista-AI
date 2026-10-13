import React, { useState, useEffect } from 'react';
import type {
  PatientInput,
  PredictionResponse,
  ExplanationResponse,
  MetricsData,
  PatientExample
} from './types';
import { ClinicalForm } from './components/ClinicalForm';
import { HeartVisualizer3D } from './components/HeartVisualizer3D';
import { PredictionDashboard } from './components/PredictionDashboard';
import { ExplainabilityPanel } from './components/ExplainabilityPanel';
import { ModelPerformanceSection } from './components/ModelPerformanceSection';
import { MethodologySection } from './components/MethodologySection';
import { CaseReportModal } from './components/CaseReportModal';

import {
  Heart,
  Activity,
  Award,
  BookOpen,
  ShieldAlert,
  BarChart3,
  Stethoscope,
  AlertCircle,
  FileDown
} from 'lucide-react';

const API_BASE = '/api';

const DEFAULT_PATIENT: PatientInput = {
  Age: 58.0,
  Weight: 74.0,
  Length: 165.0,
  Sex: "Male",
  BMI: 27.18,
  DM: 0,
  HTN: 1,
  "Current Smoker": 0,
  "EX-Smoker": 0,
  FH: 0,
  Obesity: "Y",
  CRF: "N",
  CVA: "N",
  "Airway disease": "N",
  "Thyroid Disease": "N",
  CHF: "N",
  DLP: "N",
  BP: 130.0,
  PR: 75.0,
  Edema: 0,
  "Weak Peripheral Pulse": "N",
  "Lung rales": "N",
  "Systolic Murmur": "N",
  "Diastolic Murmur": "N",
  "Typical Chest Pain": 1,
  Dyspnea: "N",
  "Function Class": 0,
  Atypical: "N",
  Nonanginal: "N",
  "LowTH Ang": "N",
  "Q Wave": 0,
  "St Elevation": 0,
  "St Depression": 0,
  Tinversion: 0,
  LVH: "N",
  "Poor R Progression": "N",
  BBB: "N",
  FBS: 115.0,
  CR: 1.0,
  TG: 145.0,
  LDL: 102.0,
  HDL: 40.0,
  BUN: 17.0,
  ESR: 18.0,
  HB: 13.2,
  K: 4.2,
  Na: 141.0,
  WBC: 7500.0,
  Lymph: 32.0,
  Neut: 60.0,
  PLT: 220.0,
  "EF-TTE": 48.0,
  "Region RWMA": 0,
  VHD: "mild"
};

export const App: React.FC = () => {
  const [formData, setFormData] = useState<PatientInput>(DEFAULT_PATIENT);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);

  const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
  const [examples, setExamples] = useState<Record<string, PatientExample>>({});
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'predictions' | 'explainability' | 'reliability' | 'methodology'>('predictions');

  useEffect(() => {
    checkHealth();
    fetchExamples();
    fetchMetrics();
    runPrediction(DEFAULT_PATIENT);
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) {
        setBackendOnline(true);
      } else {
        setBackendOnline(false);
      }
    } catch {
      setBackendOnline(false);
    }
  };

  const fetchExamples = async () => {
    try {
      const res = await fetch(`${API_BASE}/example-patients`);
      if (res.ok) {
        const data = await res.json();
        setExamples(data);
      }
    } catch (e) {
      console.warn("Could not load examples:", e);
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${API_BASE}/metrics`);
      if (res.ok) {
        const data = await res.json();
        setMetricsData(data);
      }
    } catch (e) {
      console.warn("Could not load metrics:", e);
    }
  };

  const runPrediction = async (patientPayload: PatientInput) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientPayload)
      });
      if (!res.ok) {
        const err = await res.json();
        const msg = Array.isArray(err.detail)
          ? err.detail.map((d: any) => d.msg || `${d.loc?.slice(-1)[0]}: invalid input`).join(', ')
          : (typeof err.detail === 'string' ? err.detail : 'Prediction failed');
        throw new Error(msg);
      }
      const data: PredictionResponse = await res.json();
      setPrediction(data);
      setBackendOnline(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Unable to connect to clinical prediction backend.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runPrediction(formData);
  };

  const handleLoadExample = (exampleKey: string) => {
    const ex = examples[exampleKey];
    if (ex && ex.data) {
      setFormData(ex.data);
      runPrediction(ex.data);
    }
  };

  const handleResetForm = () => {
    setFormData(DEFAULT_PATIENT);
    runPrediction(DEFAULT_PATIENT);
  };

  const fetchExplanation = async (target: string): Promise<ExplanationResponse | null> => {
    try {
      const res = await fetch(`${API_BASE}/explain?target=${target}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch {
      return null;
    }
  };

  const navigateToTab = (tab: 'predictions' | 'explainability' | 'reliability' | 'methodology') => {
    setActiveTab(tab);
    const el = document.getElementById('clinical-workspace-tabs');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollTo = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-page)' }}>
      {/* 1. Clinical Navigation Header */}
      <header style={{
        background: '#FFFFFF',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{
          maxWidth: '1520px',
          margin: '0 auto',
          padding: '12px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Institutional Brand Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)'
            }}>
              <Heart size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  CardioVista AI
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  background: '#F0F9FF',
                  color: '#0369A1',
                  border: '1px solid #BAE6FD',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  CAD Research Workstation
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '1px' }}>
                Anatomical 3D Coronary Artery Disease Decision-Support Prototype
              </p>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => scrollTo('clinical-form-section')}
            >
              <Stethoscope size={13} color="#0284C7" />
              Patient Input
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => scrollTo('visualization-section')}
            >
              <Heart size={13} color="#0284C7" />
              3D Anatomy
            </button>
            <button
              className={`btn btn-secondary btn-sm ${activeTab === 'predictions' ? 'active' : ''}`}
              onClick={() => navigateToTab('predictions')}
            >
              <Activity size={13} color="#0284C7" />
              Predictions
            </button>
            <button
              className={`btn btn-secondary btn-sm ${activeTab === 'explainability' ? 'active' : ''}`}
              onClick={() => navigateToTab('explainability')}
            >
              <BarChart3 size={13} color="#0284C7" />
              Explainability
            </button>
            <button
              className={`btn btn-secondary btn-sm ${activeTab === 'reliability' ? 'active' : ''}`}
              onClick={() => navigateToTab('reliability')}
            >
              <Award size={13} color="#0284C7" />
              Reliability Center
            </button>
            <button
              className={`btn btn-secondary btn-sm ${activeTab === 'methodology' ? 'active' : ''}`}
              onClick={() => navigateToTab('methodology')}
            >
              <BookOpen size={13} color="#0284C7" />
              Methodology
            </button>

            {/* Export Research Report Button */}
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setIsReportModalOpen(true)}
              style={{ gap: '6px' }}
            >
              <FileDown size={14} />
              Export Report
            </button>

            {/* Backend Connectivity Status Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '20px',
              background: backendOnline ? '#ECFDF5' : '#FEF2F2',
              border: `1px solid ${backendOnline ? '#A7F3D0' : '#FECACA'}`,
              fontSize: '11.5px',
              fontWeight: 500,
              color: backendOnline ? '#065F46' : '#991B1B',
              marginLeft: '4px'
            }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: backendOnline ? '#10B981' : '#EF4444'
              }} />
              <span>{backendOnline ? 'FastAPI Online (4 Models)' : 'Connecting to API...'}</span>
            </div>
          </nav>
        </div>
      </header>

      {/* 2. Medical Safety Notice */}
      <div style={{ maxWidth: '1520px', width: '100%', margin: '16px auto 0', padding: '0 32px' }}>
        <div className="clinical-disclaimer">
          <ShieldAlert size={18} color="#D97706" style={{ flexShrink: 0 }} />
          <div>
            <strong>Educational &amp; Research Prototype:</strong> CardioVista AI is trained on the UCI Tehran Heart Center dataset (N=303). Model predictions and 3D visual representations are intended solely for academic research and educational exploration. They are not cleared for medical diagnosis or clinical decision-making.
          </div>
        </div>
      </div>

      {/* 3. Main Workspace: Balanced Two-Column Clinical Layout */}
      <main style={{
        maxWidth: '1520px',
        width: '100%',
        margin: '20px auto',
        padding: '0 32px 56px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '36px'
      }}>
        {errorMsg && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 18px',
            color: '#991B1B',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Primary Workspace Grid: Clinical Form + 3D Heart */}
        <div className="main-workspace-grid">
          {/* Left Column: Compact Clinical Patient Input Form */}
          <section id="clinical-form-section">
            <ClinicalForm
              formData={formData}
              onChange={setFormData}
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
              examples={examples}
              onLoadExample={handleLoadExample}
              onReset={handleResetForm}
            />
          </section>

          {/* Right Column: Expansive 3D Heart Visualizer */}
          <section id="visualization-section">
            <HeartVisualizer3D
              mapping={prediction?.anatomical_mapping}
              pulseRate={formData.PR}
              selectedVessel={selectedVessel}
              onSelectVessel={setSelectedVessel}
            />
          </section>
        </div>

        {/* 4. Streamlined Clinical Dashboard Navigation Tabs (Reduces Congestion & Scrolling) */}
        <div id="clinical-workspace-tabs" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '2px solid var(--border-subtle)',
            paddingBottom: '2px',
            flexWrap: 'wrap'
          }}>
            <button
              type="button"
              className={`btn btn-secondary ${activeTab === 'predictions' ? 'active' : ''}`}
              onClick={() => setActiveTab('predictions')}
              style={{
                borderRadius: '6px 6px 0 0',
                height: '42px',
                fontSize: '13.5px',
                fontWeight: activeTab === 'predictions' ? 600 : 500,
                borderBottom: activeTab === 'predictions' ? '2px solid #0284C7' : '1px solid var(--border-subtle)'
              }}
            >
              <Activity size={15} color={activeTab === 'predictions' ? '#0284C7' : '#64748B'} />
              <span>Prediction Dashboard &amp; Coronary Risks</span>
            </button>

            <button
              type="button"
              className={`btn btn-secondary ${activeTab === 'explainability' ? 'active' : ''}`}
              onClick={() => setActiveTab('explainability')}
              style={{
                borderRadius: '6px 6px 0 0',
                height: '42px',
                fontSize: '13.5px',
                fontWeight: activeTab === 'explainability' ? 600 : 500,
                borderBottom: activeTab === 'explainability' ? '2px solid #0284C7' : '1px solid var(--border-subtle)'
              }}
            >
              <BarChart3 size={15} color={activeTab === 'explainability' ? '#0284C7' : '#64748B'} />
              <span>Model-Based Explainability (Patient Contributions)</span>
            </button>

            <button
              type="button"
              className={`btn btn-secondary ${activeTab === 'reliability' ? 'active' : ''}`}
              onClick={() => setActiveTab('reliability')}
              style={{
                borderRadius: '6px 6px 0 0',
                height: '42px',
                fontSize: '13.5px',
                fontWeight: activeTab === 'reliability' ? 600 : 500,
                borderBottom: activeTab === 'reliability' ? '2px solid #0284C7' : '1px solid var(--border-subtle)'
              }}
            >
              <Award size={15} color={activeTab === 'reliability' ? '#0284C7' : '#64748B'} />
              <span>Model Reliability Center (N=303 Benchmarks)</span>
            </button>

            <button
              type="button"
              className={`btn btn-secondary ${activeTab === 'methodology' ? 'active' : ''}`}
              onClick={() => setActiveTab('methodology')}
              style={{
                borderRadius: '6px 6px 0 0',
                height: '42px',
                fontSize: '13.5px',
                fontWeight: activeTab === 'methodology' ? 600 : 500,
                borderBottom: activeTab === 'methodology' ? '2px solid #0284C7' : '1px solid var(--border-subtle)'
              }}
            >
              <BookOpen size={15} color={activeTab === 'methodology' ? '#0284C7' : '#64748B'} />
              <span>Methodology &amp; Target-Leakage Prevention</span>
            </button>
          </div>

          {/* Active Tab Panel Content */}
          <div>
            {activeTab === 'predictions' && (
              <section id="results-section">
                <PredictionDashboard
                  prediction={prediction}
                  selectedVessel={selectedVessel}
                  onSelectVessel={setSelectedVessel}
                  isLoading={isLoading}
                  onExportReport={() => setIsReportModalOpen(true)}
                />
              </section>
            )}

            {activeTab === 'explainability' && (
              <section id="explainability-section">
                <ExplainabilityPanel
                  onFetchExplanation={fetchExplanation}
                />
              </section>
            )}

            {activeTab === 'reliability' && (
              <section id="performance-section">
                <ModelPerformanceSection
                  metricsData={metricsData}
                />
              </section>
            )}

            {activeTab === 'methodology' && (
              <section id="methodology-section">
                <MethodologySection />
              </section>
            )}
          </div>
        </div>
      </main>

      {/* 5. Institutional Medical Footer */}
      <footer style={{
        background: '#FFFFFF',
        borderTop: '1px solid var(--border-subtle)',
        padding: '24px 32px',
        marginTop: 'auto',
        fontSize: '12px',
        color: 'var(--text-secondary)'
      }}>
        <div style={{
          maxWidth: '1520px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>CardioVista AI</strong> — Clinical Decision-Support Workstation (v1.0.0)
          </div>
          <div style={{ color: 'var(--text-muted)' }}>
            Tehran Heart Center Cohort (UCI Machine Learning Repository, N=303 records)
          </div>
          <div>
            Research Demonstration • Real-time Three.js PBR Rendering &amp; Scikit-Learn Pipelines
          </div>
        </div>
      </footer>

      {/* 6. Case Report Modal */}
      <CaseReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        patientInput={formData}
        prediction={prediction}
        metricsData={metricsData}
      />
    </div>
  );
};

export default App;
