import { useState } from 'react';
import type { Lang, Translations, FeedbackForm as FeedbackFormData } from '../types';
import { Navbar } from '../components/Navbar';
import { submitFeedback, ApiError } from '../api';
import './FeedbackForm.css';

interface FeedbackFormProps {
  t: Translations;
  lang: Lang;
  onLangToggle: () => void;
  onNavigate: (page: 'landing' | 'form' | 'sign' | 'success') => void;
  onSubmit: (data: FeedbackFormData) => void;
}

interface FieldErrors {
  location?: string;
  category?: string;
  businessType?: string;
  why?: string;
  contact?: string;
  _server?: string; // top-level server / network error message
}

// Maps backend field names to form field names
const FIELD_MAP: Record<string, keyof FieldErrors> = {
  category: 'category',
  business_type: 'businessType',
  why: 'why',
  email: 'contact',
};

export function FeedbackForm({ t, lang, onLangToggle, onNavigate, onSubmit }: FeedbackFormProps) {
  // Populated when user arrives via QR code (?s=<id>); empty means manual entry needed
  const qrStorefrontId =
    new URLSearchParams(window.location.search).get('s') ??
    import.meta.env['VITE_DEV_STOREFRONT_ID'] ??
    '';

  const [form, setForm] = useState<FeedbackFormData>({
    category: '',
    businessType: '',
    why: '',
    contact: '',
    lang,
  });
  const [manualLocation, setManualLocation] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const e: FieldErrors = {};
    if (!qrStorefrontId && !manualLocation.trim()) e.location = t.form.required;
    if (!form.category) e.category = t.form.required;
    if (!form.businessType.trim()) e.businessType = t.form.required;
    if (!form.why.trim()) e.why = t.form.required;
    if (form.contact && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact)) {
      e.contact = t.form.invalidEmail;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const storefrontId = qrStorefrontId || manualLocation.trim();

      const result = await submitFeedback({
        storefront_id: storefrontId,
        category: form.category,
        business_type: form.businessType,
        why: form.why,
        email: form.contact || undefined,
        language: lang,
      });

      // Pass the confirmed server data up so the sign preview can use it
      onSubmit({ ...form, lang });
      console.info('Feedback submitted', result.feedback_id);
      onNavigate('success');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 400 && err.issues?.length) {
          // Map backend field errors back onto form fields
          const mapped: FieldErrors = {};
          for (const issue of err.issues) {
            const key = FIELD_MAP[issue.field];
            if (key) mapped[key] = issue.message;
            else mapped._server = issue.message;
          }
          setErrors(mapped);
        } else if (err.status === 429) {
          setErrors({ _server: 'Too many submissions. Please try again later.' });
        } else if (err.status === 404) {
          setErrors({ _server: 'Location not found. Please check the number on the sign and try again.' });
        } else {
          setErrors({ _server: err.message });
        }
      } else {
        setErrors({ _server: 'Something went wrong. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  }

  function setField(field: keyof FeedbackFormData, value: string) {
    setForm(f => ({ ...f, [field]: value }));
    // Clear the relevant error as the user corrects it
    const mapped = FIELD_MAP[field] ?? field;
    if (errors[mapped as keyof FieldErrors]) {
      setErrors(prev => ({ ...prev, [mapped]: undefined, _server: undefined }));
    }
  }

  function setLocation(value: string) {
    setManualLocation(value);
    if (errors.location) setErrors(prev => ({ ...prev, location: undefined, _server: undefined }));
  }

  return (
    <div className="form-page">
      <Navbar t={t} lang={lang} onLangToggle={onLangToggle} onNavigate={onNavigate} />

      <main className="form-page__main">
        <div className="form-card">
          <div className="form-card__header">
            <h1 className="form-card__title">{t.form.title}</h1>
            <p className="form-card__sub">{t.form.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="form-body" noValidate>
            {/* Top-level server / network error */}
            {errors._server && (
              <div className="form-server-error" role="alert">
                {errors._server}
              </div>
            )}

            {!qrStorefrontId && (
              <div className={`field ${errors.location ? 'field--error' : ''}`}>
                <label htmlFor="location" className="field__label">{t.form.location} *</label>
                <input
                  id="location"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={manualLocation}
                  onChange={e => setLocation(e.target.value)}
                  placeholder={t.form.locationPlaceholder}
                  className="field__input"
                  autoComplete="off"
                />
                <span className="field__hint">{t.form.locationHint}</span>
                {errors.location && <span className="field__error">{errors.location}</span>}
              </div>
            )}

            <div className={`field ${errors.category ? 'field--error' : ''}`}>
              <label htmlFor="category" className="field__label">{t.form.category} *</label>
              <select
                id="category"
                value={form.category}
                onChange={e => setField('category', e.target.value)}
                className="field__input field__input--select"
              >
                <option value="">{t.form.categoryPlaceholder}</option>
                {t.categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && <span className="field__error">{errors.category}</span>}
            </div>

            <div className={`field ${errors.businessType ? 'field--error' : ''}`}>
              <label htmlFor="businessType" className="field__label">{t.form.businessType} *</label>
              <input
                id="businessType"
                type="text"
                value={form.businessType}
                onChange={e => setField('businessType', e.target.value)}
                placeholder={t.form.businessTypePlaceholder}
                className="field__input"
              />
              {errors.businessType && <span className="field__error">{errors.businessType}</span>}
            </div>

            <div className={`field ${errors.why ? 'field--error' : ''}`}>
              <label htmlFor="why" className="field__label">{t.form.why} *</label>
              <textarea
                id="why"
                value={form.why}
                onChange={e => setField('why', e.target.value)}
                placeholder={t.form.whyPlaceholder}
                className="field__input field__input--textarea"
                rows={4}
              />
              {errors.why && <span className="field__error">{errors.why}</span>}
            </div>

            <div className={`field ${errors.contact ? 'field--error' : ''}`}>
              <label htmlFor="contact" className="field__label">{t.form.contact}</label>
              <input
                id="contact"
                type="email"
                value={form.contact}
                onChange={e => setField('contact', e.target.value)}
                placeholder={t.form.contactPlaceholder}
                className="field__input"
              />
              {errors.contact && <span className="field__error">{errors.contact}</span>}
            </div>

            <button type="submit" className="form-submit" disabled={loading}>
              {loading ? '…' : t.form.submit}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
