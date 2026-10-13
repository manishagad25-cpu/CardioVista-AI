import React, { useState, useEffect } from 'react';
import type { ExplanationResponse } from '../types';
import { BarChart3, Info, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';

interface Props {
  onFetchExplanation: (target: string) => Promise<ExplanationResponse | null>;
}

export const ExplainabilityPanel: React.FC<Props> = ({ onFetchExplanation }) => {
  const [selectedTarget, setSelectedTarget] = useState<'CAD' | 'LAD' | 'LCX' | 'RCA'>('CAD');
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    onFetchExplanation(selectedTarget).then(res => {
      if (isMounted) {
        setExplanation(res);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [selectedTarget]);

  const maxImp = explanation?.top_contributing_features?.length
    ? Math.max(...explanation.top_contributing_features.map(f => Math.abs(f.importance)))
    : 1;

  return (
    <div className="clinical-card" id="explainability-section">
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
              <BarChart3 size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Model-Based Explainability &amp; Feature Contributions
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Mathematical attribution decomposing algorithmic decision scores into clinical biomarker drivers
              </p>
            </div>
          </div>
        </div>

        {/* Target Selector Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {(['CAD', 'LAD', 'LCX', 'RCA'] as const).map(target => (
            <button
              key={target}
              type="button"
              className={`btn btn-secondary btn-sm ${selectedTarget === target ? 'active' : ''}`}
              onClick={() => setSelectedTarget(target)}
              style={selectedTarget === target ? { background: '#0284C7', color: '#FFFFFF', borderColor: '#0284C7' } : {}}
            >
              {target} Analysis
            </button>
          ))}
        </div>
      </div>

      <div className="clinical-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Method & Mathematical Foundation Banner */}
        {explanation && (
          <div style={{
            background: '#F0F9FF',
            border: '1px solid #BAE6FD',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            fontSize: '12px',
            color: '#0369A1',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
              <Layers size={15} color="#0284C7" />
              <span>Explanation Methodology: {explanation.method_name || 'Algorithmic Feature Attribution'}</span>
            </div>
            <div style={{ lineHeight: '1.5', color: '#0C4A6E' }}>
              {explanation.method_explanation || 'Decomposition of trained decision weights relative to baseline population characteristics.'}
            </div>
          </div>
        )}

        {/* Association vs Causation Caveat */}
        <div style={{
          background: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderLeft: '4px solid #D97706',
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '12px',
          color: '#78350F',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          lineHeight: '1.45'
        }}>
          <Info size={16} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Statistical Association vs. Clinical Causation:</strong> Ranked contributions reflect weights and splits learned from the Tehran Heart Center cohort. They demonstrate how the algorithm weights each patient parameter and must <em>never</em> be interpreted as direct pathophysiological causation or clinical trial causality.
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Calculating model feature attribution for {selectedTarget}...
          </div>
        ) : explanation ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Top Contributing Biomarkers for {explanation.target_name} ({explanation.model_name})
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Magnitude &amp; Directional Shift
              </span>
            </div>

            {/* Feature Attribution Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {explanation.top_contributing_features.slice(0, 10).map((item, idx) => {
                const pct = (Math.abs(item.importance) / (maxImp || 1)) * 100;
                const isRiskIncreasing = item.direction?.includes('+') || (item.contribution_score !== undefined && item.contribution_score > 0);
                const isRiskDecreasing = item.direction?.includes('-') || (item.contribution_score !== undefined && item.contribution_score < 0);

                return (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 16px',
                      background: '#FFFFFF',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      boxShadow: 'var(--shadow-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', width: '22px' }}>
                          #{idx + 1}
                        </span>
                        <div>
                          <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>
                            {item.feature}
                          </strong>
                          {item.input_value && (
                            <span style={{
                              marginLeft: '8px',
                              fontSize: '11px',
                              background: '#F1F5F9',
                              color: '#334155',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontWeight: 500
                            }}>
                              Patient Value: <strong>{item.input_value}</strong>
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                          Score: {item.importance.toFixed(4)}
                        </span>
                        <span className={`status-badge ${
                          isRiskIncreasing ? 'status-badge-abnormal' : isRiskDecreasing ? 'status-badge-normal' : 'status-badge-neutral'
                        }`} style={{ fontSize: '11px', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {isRiskIncreasing ? <ArrowUpRight size={12} /> : isRiskDecreasing ? <ArrowDownRight size={12} /> : null}
                          {item.direction || 'Contribution'}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Container */}
                    <div style={{ height: '6px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.max(5, pct)}%`,
                        background: isRiskIncreasing ? '#EF4444' : isRiskDecreasing ? '#10B981' : '#0284C7',
                        borderRadius: '3px',
                        transition: 'width 0.4s ease'
                      }} />
                    </div>

                    {/* Clinical Note Description */}
                    {item.clinical_note && (
                      <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        {item.clinical_note}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
