import { useState } from 'react';
import { Landing } from './pages/Landing';
import { FeedbackForm } from './pages/FeedbackForm';
import { Success } from './pages/Success';
import { SignPreview } from './pages/SignPreview';
import { translations } from './i18n';
import type { Lang, FeedbackForm as FeedbackFormData } from './types';

type Page = 'landing' | 'form' | 'sign' | 'success';

function App() {
  const [page, setPage] = useState<Page>('landing');
  const [lang, setLang] = useState<Lang>('en');
  const [lastSubmission, setLastSubmission] = useState<FeedbackFormData | null>(null);

  const t = translations[lang];

  function toggleLang() {
    setLang(l => (l === 'en' ? 'es' : 'en'));
  }

  function handleSubmit(data: FeedbackFormData) {
    setLastSubmission(data);
    // TODO: POST to backend API
    // fetch('/api/feedback', { method: 'POST', body: JSON.stringify(data) });
  }

  return (
    <>
      {page === 'landing' && (
        <Landing
          t={t}
          lang={lang}
          onLangToggle={toggleLang}
          onNavigate={setPage}
        />
      )}
      {page === 'form' && (
        <FeedbackForm
          t={t}
          lang={lang}
          onLangToggle={toggleLang}
          onNavigate={setPage}
          onSubmit={handleSubmit}
        />
      )}
      {page === 'success' && (
        <Success t={t} onNavigate={setPage} />
      )}
      {page === 'sign' && (
        <SignPreview t={t} formData={lastSubmission} onNavigate={setPage} />
      )}
    </>
  );
}

export default App;
