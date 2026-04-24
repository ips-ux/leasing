import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { onSnapshot } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck, faArrowLeft, faPencil } from '@fortawesome/free-solid-svg-icons';
import { getEmailTemplate } from '../firebase/firestore';
import { NEW_APPLICANT_STEPS, TRANSFER_STEPS } from '../lib/workflow-steps';
import type { EmailTemplate } from '../types/emailTemplate';

const ALL_SUBSTEPS = [...NEW_APPLICANT_STEPS, ...TRANSFER_STEPS].flatMap(step =>
  step.subSteps.map(ss => ({ id: ss.id, label: ss.label }))
);

const htmlToText = (html: string) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return (div.textContent || div.innerText || '').replace(/\s+/g, ' ').trim();
};

type CopiedKey = 'richtext' | 'html' | null;

export const EmailScriptViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<CopiedKey>(null);

  useEffect(() => {
    if (!id) return;
    const docRef = getEmailTemplate(id);
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setTemplate({ id: snap.id, ...snap.data() } as EmailTemplate);
      }
      setLoading(false);
    });
  }, [id]);

  const handleCopy = async (key: CopiedKey, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-secondary">Loading…</p>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-secondary">Template not found.</p>
      </div>
    );
  }

  const plainText = htmlToText(template.htmlContent);

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/scripts')}
              className="flex items-center justify-center w-9 h-9 rounded-neuro-sm bg-main hover:bg-surface-highlight transition-all text-secondary hover:text-primary shrink-0"
              title="Back to scripts"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-primary">{template.title}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-neuro-sm bg-neuro-lavender/30 text-primary border border-neuro-lavender/50">
                  {template.buttonText}
                </span>
                {template.linkedSubStepIds.map(sid => {
                  const found = ALL_SUBSTEPS.find(ss => ss.id === sid);
                  return (
                    <span
                      key={sid}
                      title={found?.label}
                      className="text-[10px] font-mono bg-main px-1.5 py-0.5 rounded text-secondary border border-tertiary/30"
                    >
                      {sid}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(`/templates/${id}`)}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-neuro-sm bg-main hover:bg-surface-highlight transition-all text-sm font-semibold text-secondary hover:text-primary"
            title="Open in template editor"
          >
            <FontAwesomeIcon icon={faPencil} className="w-3.5 h-3.5" />
            Edit Template
          </button>
        </div>

        {/* Side-by-side panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Rich Text Panel */}
          <div className="neu-flat flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-tertiary/20 shrink-0">
              <div>
                <p className="text-sm font-bold text-primary">Rich Text</p>
                <p className="text-[11px] text-secondary mt-0.5">Formatted — paste into Gmail, Outlook, Yardi CRM</p>
              </div>
              <button
                onClick={() => handleCopy('richtext', plainText)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-neuro-sm bg-main hover:shadow-soft transition-all text-xs font-semibold text-secondary hover:text-primary"
              >
                <FontAwesomeIcon
                  icon={copied === 'richtext' ? faCheck : faCopy}
                  className={`w-3.5 h-3.5 ${copied === 'richtext' ? 'text-success' : ''}`}
                />
                {copied === 'richtext' ? 'Copied!' : 'Copy Text'}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5" style={{ minHeight: '500px', maxHeight: '70vh' }}>
              <div
                className="prose prose-sm max-w-none"
                style={{ fontFamily: 'Aptos, Calibri, Helvetica, sans-serif', fontSize: '12pt', lineHeight: '1.5', color: '#1D1D1F' }}
                dangerouslySetInnerHTML={{ __html: template.htmlContent }}
              />
            </div>
          </div>

          {/* HTML Source Panel */}
          <div className="neu-flat flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-tertiary/20 shrink-0">
              <div>
                <p className="text-sm font-bold text-primary">HTML Source</p>
                <p className="text-[11px] text-secondary mt-0.5">Raw markup — for template systems or code editors</p>
              </div>
              <button
                onClick={() => handleCopy('html', template.htmlContent)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-neuro-sm bg-main hover:shadow-soft transition-all text-xs font-semibold text-secondary hover:text-primary"
              >
                <FontAwesomeIcon
                  icon={copied === 'html' ? faCheck : faCopy}
                  className={`w-3.5 h-3.5 ${copied === 'html' ? 'text-success' : ''}`}
                />
                {copied === 'html' ? 'Copied!' : 'Copy HTML'}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5" style={{ minHeight: '500px', maxHeight: '70vh' }}>
              <pre className="text-[11px] font-mono text-secondary whitespace-pre-wrap break-all leading-relaxed select-all">
                {template.htmlContent}
              </pre>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
