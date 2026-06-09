import { useRef } from 'react';
import type { Translations, FeedbackForm } from '../types';
import './SignPreview.css';

interface SignPreviewProps {
  t: Translations;
  formData: FeedbackForm | null;
  onNavigate: (page: 'landing' | 'form' | 'sign' | 'success') => void;
}

export function SignPreview({ t, formData, onNavigate }: SignPreviewProps) {
  const signRef = useRef<HTMLDivElement>(null);

  async function handleDownload() {
    if (!signRef.current) return;
    const html2pdf = (await import('html2pdf.js')).default;
    html2pdf()
      .set({
        margin: 0,
        filename: 'bemore-storefront-sign.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' },
      })
      .from(signRef.current)
      .save();
  }

  return (
    <div className="sign-page">
      <div className="sign-page__actions">
        <button className="sign-back" onClick={() => onNavigate('success')}>
          ← {t.sign.back}
        </button>
        <button className="sign-download" onClick={handleDownload}>
          ⬇ {t.sign.download}
        </button>
      </div>

      <div className="sign-preview-wrap">
        <div ref={signRef} className="sign-card">
          <div className="sign-card__top">
            <span className="sign-logo">Be More Inc.</span>
            <span className="sign-tagline">{t.sign.tagline}</span>
          </div>

          <div className="sign-card__body">
            <h2 className="sign-headline">What Should Open Here?</h2>

            {formData && (
              <div className="sign-vision">
                <div className="sign-vision__badge">{formData.category}</div>
                <p className="sign-vision__type">{formData.businessType}</p>
                {formData.why && (
                  <blockquote className="sign-vision__quote">"{formData.why}"</blockquote>
                )}
              </div>
            )}

            {!formData && (
              <div className="sign-vision">
                <div className="sign-vision__badge">Community Vision</div>
                <p className="sign-vision__type">Your neighborhood is listening.</p>
              </div>
            )}
          </div>

          <div className="sign-card__bottom">
            <div className="sign-qr-placeholder">
              <div className="sign-qr-box">QR</div>
              <span>Scan to share your vision</span>
            </div>
            <span className="sign-url">bemoreinc.com/vision</span>
          </div>
        </div>
      </div>

      <p className="sign-hint">{t.sign.title}</p>
    </div>
  );
}
