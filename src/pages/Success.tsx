import type { Translations } from '../types';
import './Success.css';

interface SuccessProps {
  t: Translations;
  onNavigate: (page: 'landing' | 'form' | 'sign' | 'success') => void;
}

export function Success({ t, onNavigate }: SuccessProps) {
  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1 className="success-title">{t.success.title}</h1>
        <p className="success-body">{t.success.body}</p>
        <button className="success-back" onClick={() => onNavigate('landing')}>
          {t.success.back}
        </button>
        <button className="success-sign" onClick={() => onNavigate('sign')}>
          View Storefront Sign →
        </button>
      </div>
    </div>
  );
}
