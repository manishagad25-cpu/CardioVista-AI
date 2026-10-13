import React, { useState } from 'react';
import type { PatientInput, PatientExample } from '../types';
import {
  User,
  Activity,
  HeartPulse,
  TestTube,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Play,
  Bookmark
} from 'lucide-react';

interface Props {
  formData: PatientInput;
  onChange: (newData: PatientInput) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  examples: Record<string, PatientExample>;
  onLoadExample: (exampleKey: string) => void;
  onReset: () => void;
}

const SECTIONS = [
  { id: 'demographics', label: '1. Demographics & History', icon: User, count: '12 fields' },
  { id: 'exam', label: '2. Examination & Symptoms', icon: Activity, count: '10 fields' },
  { id: 'ecg', label: '3. ECG Measurements', icon: HeartPulse, count: '7 fields' },
  { id: 'lab', label: '4. Laboratory Biomarkers', icon: TestTube, count: '12 fields' },
  { id: 'echo', label: '5. Echocardiography', icon: Stethoscope, count: '3 fields' }
] as const;

type SectionId = typeof SECTIONS[number]['id'];

export const ClinicalForm: React.FC<Props> = ({
  formData,
  onChange,
  onSubmit,
  isLoading,
  examples,
  onLoadExample,
  onReset
}) => {
  const [activeSection, setActiveSection] = useState<SectionId>('demographics');

  const currentIndex = SECTIONS.findIndex(s => s.id === activeSection);

  const updateField = (field: keyof PatientInput, value: any) => {
    const updated = { ...formData, [field]: value };
    // Auto-calculate BMI if Weight or Length is updated
    if (field === 'Weight' || field === 'Length') {
      const w = field === 'Weight' ? Number(value) : formData.Weight;
      const h_m = (field === 'Length' ? Number(value) : formData.Length) / 100;
      if (h_m > 0) {
        updated.BMI = Number((w / (h_m * h_m)).toFixed(2));
      }
    }
    onChange(updated);
  };

  const handleNext = () => {
    if (currentIndex < SECTIONS.length - 1) {
      setActiveSection(SECTIONS[currentIndex + 1].id);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setActiveSection(SECTIONS[currentIndex - 1].id);
    }
  };

  return (
    <div className="clinical-card" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* 1. Header with Benchmark Case Pre-loaders */}
      <div className="clinical-card-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Stethoscope size={18} color="#1769AA" />
            <h3 style={{ fontSize: '15px' }}>Clinical Patient Evaluation</h3>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Structured input derived from the Tehran Heart Center 54-feature clinical protocol
          </p>
        </div>

        {/* Benchmark Case Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Load Case:
          </span>
          {Object.entries(examples).map(([key, ex]) => (
            <button
              key={key}
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onLoadExample(key)}
              title={ex.description}
            >
              <Bookmark size={11} color="#1769AA" />
              {key === 'normal_low_risk' ? 'Case 1: Low Risk' : key === 'lad_stenosis' ? 'Case 2: LAD Stenosis' : 'Case 3: Multivessel'}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Clinical Section Step Navigation Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-subtle)',
        background: '#FAFCFE',
        overflowX: 'auto'
      }}>
        {SECTIONS.map(sec => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSection(sec.id)}
              style={{
                flex: '1 0 auto',
                padding: '10px 14px',
                border: 'none',
                borderBottom: isActive ? '2px solid #1769AA' : '2px solid transparent',
                background: isActive ? '#FFFFFF' : 'transparent',
                color: isActive ? '#1769AA' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={14} />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Form Body */}
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div className="clinical-card-body" style={{ minHeight: '340px' }}>
          {/* SECTION 1: Demographics & Medical History */}
          {activeSection === 'demographics' && (
            <div className="grid-2col">
              <div className="form-group">
                <label className="form-label">
                  <span>Age</span>
                  <span className="unit">Years</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.Age}
                  min={18}
                  max={100}
                  onChange={e => updateField('Age', Number(e.target.value))}
                />
                <span className="form-helper">Patient age at time of evaluation (dataset range: 30–86)</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Biological Sex</span>
                </label>
                <select
                  className="form-select"
                  value={formData.Sex}
                  onChange={e => updateField('Sex', e.target.value)}
                >
                  <option value="Male">Male</option>
                  <option value="Fmale">Female</option>
                </select>
                <span className="form-helper">Categorical distribution in cohort: 58.1% Male, 41.9% Female</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Weight</span>
                  <span className="unit">kg</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.Weight}
                  min={35}
                  max={200}
                  onChange={e => updateField('Weight', Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Height / Length</span>
                  <span className="unit">cm</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.Length}
                  min={120}
                  max={220}
                  onChange={e => updateField('Length', Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Body Mass Index (BMI)</span>
                  <span className="unit">kg/m² (computed)</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.BMI}
                  readOnly
                  style={{ background: '#F8FAFC', color: 'var(--text-secondary)' }}
                />
                <span className="form-helper">Computed automatically from weight and height</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Diabetes Mellitus (DM)</span>
                </label>
                <select
                  className="form-select"
                  value={formData.DM}
                  onChange={e => updateField('DM', Number(e.target.value))}
                >
                  <option value={0}>0 — Non-diabetic</option>
                  <option value={1}>1 — Diabetic (FBS &ge; 126 or on medication)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Systemic Hypertension (HTN)</span>
                </label>
                <select
                  className="form-select"
                  value={formData.HTN}
                  onChange={e => updateField('HTN', Number(e.target.value))}
                >
                  <option value={1}>1 — Hypertensive (BP &ge; 140/90 or treated)</option>
                  <option value={0}>0 — Normotensive</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Current Tobacco Smoker</span>
                </label>
                <select
                  className="form-select"
                  value={formData["Current Smoker"]}
                  onChange={e => updateField('Current Smoker', Number(e.target.value))}
                >
                  <option value={0}>0 — No active smoking</option>
                  <option value={1}>1 — Active smoker within past 12 months</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Family History of CAD (FH)</span>
                </label>
                <select
                  className="form-select"
                  value={formData.FH}
                  onChange={e => updateField('FH', Number(e.target.value))}
                >
                  <option value={0}>0 — Negative family history</option>
                  <option value={1}>1 — Positive premature CAD in 1st-degree relative</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Dyslipidemia (DLP)</span>
                </label>
                <select
                  className="form-select"
                  value={formData.DLP}
                  onChange={e => updateField('DLP', e.target.value)}
                >
                  <option value="N">N — Normal lipid profile</option>
                  <option value="Y">Y — Elevated cholesterol or on statin therapy</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Chronic Renal Failure (CRF)</span>
                </label>
                <select
                  className="form-select"
                  value={formData.CRF}
                  onChange={e => updateField('CRF', e.target.value)}
                >
                  <option value="N">N — Normal renal function</option>
                  <option value="Y">Y — Chronic renal insufficiency (eGFR &lt; 60)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Cerebrovascular Accident (CVA)</span>
                </label>
                <select
                  className="form-select"
                  value={formData.CVA}
                  onChange={e => updateField('CVA', e.target.value)}
                >
                  <option value="N">N — No history of stroke / TIA</option>
                  <option value="Y">Y — Prior documented CVA or TIA</option>
                </select>
              </div>
            </div>
          )}

          {/* SECTION 2: Examination & Symptoms */}
          {activeSection === 'exam' && (
            <div className="grid-2col">
              <div className="form-group">
                <label className="form-label">
                  <span>Systolic Blood Pressure (BP)</span>
                  <span className="unit">mmHg</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.BP}
                  min={70}
                  max={230}
                  onChange={e => updateField('BP', Number(e.target.value))}
                />
                <span className="form-helper">Resting cuff measurement (dataset median: 130 mmHg)</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Resting Pulse Rate (PR)</span>
                  <span className="unit">bpm</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.PR}
                  min={40}
                  max={160}
                  onChange={e => updateField('PR', Number(e.target.value))}
                />
                <span className="form-helper">Synchronizes 3D cardiac cycle animation frequency</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Typical Chest Pain (Angina)</span>
                </label>
                <select
                  className="form-select"
                  value={formData["Typical Chest Pain"]}
                  onChange={e => updateField('Typical Chest Pain', Number(e.target.value))}
                >
                  <option value={1}>1 — Typical Angina (Substernal, exertional, relief with rest)</option>
                  <option value={0}>0 — Absent / Non-anginal presentation</option>
                </select>
                <span className="form-helper">Top predictive feature in trained CAD pipeline</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Dyspnea (Shortness of Breath)</span>
                </label>
                <select
                  className="form-select"
                  value={formData.Dyspnea}
                  onChange={e => updateField('Dyspnea', e.target.value)}
                >
                  <option value="N">N — No dyspnea on ordinary exertion</option>
                  <option value="Y">Y — Exertional dyspnea present</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>NYHA Functional Class</span>
                </label>
                <select
                  className="form-select"
                  value={formData["Function Class"]}
                  onChange={e => updateField('Function Class', Number(e.target.value))}
                >
                  <option value={0}>Class 0 — Asymptomatic</option>
                  <option value={1}>Class I — Symptoms only on strenuous exertion</option>
                  <option value={2}>Class II — Slight limitation during normal activity</option>
                  <option value={3}>Class III — Marked limitation on minimal exertion</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Peripheral Edema</span>
                </label>
                <select
                  className="form-select"
                  value={formData.Edema}
                  onChange={e => updateField('Edema', Number(e.target.value))}
                >
                  <option value={0}>0 — No lower extremity edema</option>
                  <option value={1}>1 — Pitting edema detected</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Systolic Heart Murmur</span>
                </label>
                <select
                  className="form-select"
                  value={formData["Systolic Murmur"]}
                  onChange={e => updateField('Systolic Murmur', e.target.value)}
                >
                  <option value="N">N — Absent</option>
                  <option value="Y">Y — Present on cardiac auscultation</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Lung Rales / Crackles</span>
                </label>
                <select
                  className="form-select"
                  value={formData["Lung rales"]}
                  onChange={e => updateField('Lung rales', e.target.value)}
                >
                  <option value="N">N — Clear pulmonary auscultation</option>
                  <option value="Y">Y — Basilar crackles present</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Atypical Chest Pain</span>
                </label>
                <select
                  className="form-select"
                  value={formData.Atypical}
                  onChange={e => updateField('Atypical', e.target.value)}
                >
                  <option value="N">N — Absent</option>
                  <option value="Y">Y — Present (non-exertional or sharp)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Weak Peripheral Pulse</span>
                </label>
                <select
                  className="form-select"
                  value={formData["Weak Peripheral Pulse"]}
                  onChange={e => updateField('Weak Peripheral Pulse', e.target.value)}
                >
                  <option value="N">N — Palpable normal radial/pedal pulses</option>
                  <option value="Y">Y — Diminished peripheral pulses</option>
                </select>
              </div>
            </div>
          )}

          {/* SECTION 3: ECG Measurements */}
          {activeSection === 'ecg' && (
            <div className="grid-2col">
              <div className="form-group">
                <label className="form-label">
                  <span>Pathological Q Waves</span>
                </label>
                <select
                  className="form-select"
                  value={formData["Q Wave"]}
                  onChange={e => updateField('Q Wave', Number(e.target.value))}
                >
                  <option value={0}>0 — Absent</option>
                  <option value={1}>1 — Present (&gt;0.04s or depth &gt;25% of R wave)</option>
                </select>
                <span className="form-helper">Indicates prior myocardial infarction scar</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>ST-Segment Elevation</span>
                </label>
                <select
                  className="form-select"
                  value={formData["St Elevation"]}
                  onChange={e => updateField('St Elevation', Number(e.target.value))}
                >
                  <option value={0}>0 — Absent / Isoelectric</option>
                  <option value={1}>1 — Present (&ge; 1mm in limb or &ge; 2mm in precordial leads)</option>
                </select>
                <span className="form-helper">Acute transmural myocardial injury pattern</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>ST-Segment Depression</span>
                </label>
                <select
                  className="form-select"
                  value={formData["St Depression"]}
                  onChange={e => updateField('St Depression', Number(e.target.value))}
                >
                  <option value={0}>0 — Absent</option>
                  <option value={1}>1 — Present (Horizontal or downsloping &ge; 0.5mm)</option>
                </select>
                <span className="form-helper">Subendocardial myocardial ischemia pattern</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>T-Wave Inversion</span>
                </label>
                <select
                  className="form-select"
                  value={formData.Tinversion}
                  onChange={e => updateField('Tinversion', Number(e.target.value))}
                >
                  <option value={0}>0 — Upright normal T waves</option>
                  <option value={1}>1 — Symmetrical inverted T waves present</option>
                </select>
                <span className="form-helper">ECG repolarization abnormality often associated with ischemia</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Left Ventricular Hypertrophy (LVH)</span>
                </label>
                <select
                  className="form-select"
                  value={formData.LVH}
                  onChange={e => updateField('LVH', e.target.value)}
                >
                  <option value="N">N — No voltage criteria</option>
                  <option value="Y">Y — Sokolow-Lyon or Cornell voltage positive</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Poor R-Wave Progression</span>
                </label>
                <select
                  className="form-select"
                  value={formData["Poor R Progression"]}
                  onChange={e => updateField('Poor R Progression', e.target.value)}
                >
                  <option value="N">N — Normal R-wave height across V1–V4</option>
                  <option value="Y">Y — PRWP present (anterior loss of forces)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Bundle Branch Block (BBB)</span>
                </label>
                <select
                  className="form-select"
                  value={formData.BBB}
                  onChange={e => updateField('BBB', e.target.value)}
                >
                  <option value="N">N — Normal intraventricular conduction</option>
                  <option value="LBBB">LBBB — Left Bundle Branch Block</option>
                  <option value="RBBB">RBBB — Right Bundle Branch Block</option>
                </select>
                <span className="form-helper">QRS duration &ge; 120ms with characteristic morphology</span>
              </div>
            </div>
          )}

          {/* SECTION 4: Laboratory Biomarkers */}
          {activeSection === 'lab' && (
            <div className="grid-2col">
              <div className="form-group">
                <label className="form-label">
                  <span>Fasting Blood Sugar (FBS)</span>
                  <span className="unit">mg/dL</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.FBS}
                  min={50}
                  max={450}
                  onChange={e => updateField('FBS', Number(e.target.value))}
                />
                <span className="form-helper">Normal reference: 70–99 mg/dL</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Serum Triglycerides (TG)</span>
                  <span className="unit">mg/dL</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.TG}
                  min={30}
                  max={1100}
                  onChange={e => updateField('TG', Number(e.target.value))}
                />
                <span className="form-helper">Optimal: &lt; 150 mg/dL (dataset mean: 150.3)</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Low-Density Lipoprotein (LDL)</span>
                  <span className="unit">mg/dL</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.LDL}
                  min={20}
                  max={300}
                  onChange={e => updateField('LDL', Number(e.target.value))}
                />
                <span className="form-helper">Atherogenic lipoprotein target: &lt; 100 mg/dL</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>High-Density Lipoprotein (HDL)</span>
                  <span className="unit">mg/dL</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.HDL}
                  min={12}
                  max={120}
                  step={0.1}
                  onChange={e => updateField('HDL', Number(e.target.value))}
                />
                <span className="form-helper">Cardioprotective target: &ge; 40 (M), &ge; 50 (F) mg/dL</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Serum Creatinine (CR)</span>
                  <span className="unit">mg/dL</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.CR}
                  min={0.4}
                  max={6.0}
                  step={0.1}
                  onChange={e => updateField('CR', Number(e.target.value))}
                />
                <span className="form-helper">Normal reference: 0.7–1.3 mg/dL</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Blood Urea Nitrogen (BUN)</span>
                  <span className="unit">mg/dL</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.BUN}
                  min={5}
                  max={80}
                  onChange={e => updateField('BUN', Number(e.target.value))}
                />
                <span className="form-helper">Normal reference: 7–20 mg/dL</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Erythrocyte Sedimentation Rate (ESR)</span>
                  <span className="unit">mm/hr</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.ESR}
                  min={1}
                  max={120}
                  onChange={e => updateField('ESR', Number(e.target.value))}
                />
                <span className="form-helper">Non-specific inflammatory acute phase marker</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Hemoglobin (HB)</span>
                  <span className="unit">g/dL</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.HB}
                  min={7.0}
                  max={22.0}
                  step={0.1}
                  onChange={e => updateField('HB', Number(e.target.value))}
                />
                <span className="form-helper">Normal reference: 12.0–17.5 g/dL</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Serum Potassium (K)</span>
                  <span className="unit">mEq/L</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.K}
                  min={2.0}
                  max={7.5}
                  step={0.1}
                  onChange={e => updateField('K', Number(e.target.value))}
                />
                <span className="form-helper">Normal reference: 3.5–5.1 mEq/L</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Serum Sodium (Na)</span>
                  <span className="unit">mEq/L</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.Na}
                  min={115}
                  max={165}
                  onChange={e => updateField('Na', Number(e.target.value))}
                />
                <span className="form-helper">Normal reference: 135–145 mEq/L</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>White Blood Cell Count (WBC)</span>
                  <span className="unit">/µL</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.WBC}
                  min={2000}
                  max={30000}
                  onChange={e => updateField('WBC', Number(e.target.value))}
                />
                <span className="form-helper">Normal reference: 4,000–11,000 /µL</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Platelet Count (PLT)</span>
                  <span className="unit">×10³/µL</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.PLT}
                  min={25}
                  max={900}
                  onChange={e => updateField('PLT', Number(e.target.value))}
                />
                <span className="form-helper">Normal reference: 150–450 ×10³/µL</span>
              </div>
            </div>
          )}

          {/* SECTION 5: Echocardiography */}
          {activeSection === 'echo' && (
            <div className="grid-2col">
              <div className="form-group">
                <label className="form-label">
                  <span>Ejection Fraction (EF-TTE)</span>
                  <span className="unit">%</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={formData["EF-TTE"]}
                  min={15}
                  max={75}
                  onChange={e => updateField('EF-TTE', Number(e.target.value))}
                />
                <span className="form-helper">Normal reference: &ge; 50%. Reduced EF correlates with LAD territory ischemia</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Regional Wall Motion Abnormality (Region RWMA)</span>
                </label>
                <select
                  className="form-select"
                  value={formData["Region RWMA"]}
                  onChange={e => updateField('Region RWMA', Number(e.target.value))}
                >
                  <option value={0}>0 — Normal wall motion across all segments</option>
                  <option value={1}>1 — Isolated hypokinesia (1 segment)</option>
                  <option value={2}>2 — Moderate regional defect (anterior / septal)</option>
                  <option value={3}>3 — Severe multi-segment wall motion defect</option>
                  <option value={4}>4 — Akinesia or localized dyskinesia</option>
                </select>
                <span className="form-helper">High-importance predictor for primary CAD and LAD stenosis</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Valvular Heart Disease (VHD)</span>
                </label>
                <select
                  className="form-select"
                  value={formData.VHD}
                  onChange={e => updateField('VHD', e.target.value)}
                >
                  <option value="N">N — No significant valvular defect</option>
                  <option value="mild">mild — Mild mitral/aortic regurgitation or sclerosis</option>
                  <option value="Moderate">Moderate — Hemodynamically significant moderate defect</option>
                  <option value="Severe">Severe — Severe stenosis or regurgitation</option>
                </select>
                <span className="form-helper">Echocardiographic valvular appraisal</span>
              </div>
            </div>
          )}
        </div>

        {/* 4. Accessible Form Actions (Previous, Next, Reset, Run Prediction) */}
        <div style={{
          padding: '12px 20px',
          background: '#FAFCFE',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              <ChevronLeft size={14} />
              Previous Section
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleNext}
              disabled={currentIndex === SECTIONS.length - 1}
            >
              Next Section
              <ChevronRight size={14} />
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onReset}
              title="Reset fields to baseline defaults"
            >
              <RotateCcw size={13} />
              Reset
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="animate-spin" style={{ display: 'inline-block' }}>⟳</span>
                Processing Inference...
              </>
            ) : (
              <>
                <Play size={14} />
                Run Decision-Support Prediction
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
