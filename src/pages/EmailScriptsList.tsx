import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { getEmailTemplates } from '../firebase/firestore';
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

export const EmailScriptsList = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredTemplate, setHoveredTemplate] = useState<EmailTemplate | null>(null);
  const [tooltipY, setTooltipY] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const q = getEmailTemplates();
    return onSnapshot(q, (snap) => {
      setTemplates(snap.docs.map(d => ({ id: d.id, ...d.data() } as EmailTemplate)));
      setLoading(false);
    });
  }, []);

  const showTooltip = (tmpl: EmailTemplate, e: React.MouseEvent) => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setHoveredTemplate(tmpl);
    setTooltipY(Math.max(80, Math.min(rect.top, window.innerHeight - 440)));
  };

  const hideTooltip = () => {
    hideTimerRef.current = setTimeout(() => setHoveredTemplate(null), 120);
  };

  const keepTooltip = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  };

  const handleCopy = async (tmpl: EmailTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(htmlToText(tmpl.htmlContent));
    setCopiedId(tmpl.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleTooltipCopy = async () => {
    if (!hoveredTemplate) return;
    await navigator.clipboard.writeText(htmlToText(hoveredTemplate.htmlContent));
    setCopiedId(hoveredTemplate.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Email Scripts</h1>
          <p className="text-secondary mt-1">Hover to preview · Click to view full template · Copy to paste into email</p>
        </div>

        {loading ? (
          <div className="neu-flat p-12 text-center text-secondary">Loading…</div>
        ) : templates.length === 0 ? (
          <div className="neu-flat p-12 text-center text-secondary">No templates found.</div>
        ) : (
          <div className="space-y-2">
            {templates.map((tmpl, i) => (
              <motion.div
                key={tmpl.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="neu-flat px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-surface-highlight transition-colors group"
                onMouseEnter={(e) => showTooltip(tmpl, e)}
                onMouseLeave={hideTooltip}
                onClick={() => navigate(`/scripts/${tmpl.id}`)}
              >
                {/* Title + substep chips */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-primary truncate">{tmpl.title}</p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {tmpl.linkedSubStepIds.map(sid => {
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

                {/* Button text badge */}
                <span className="shrink-0 px-3 py-1 text-xs font-bold font-mono rounded-neuro-sm bg-neuro-lavender/30 text-primary border border-neuro-lavender/50">
                  {tmpl.buttonText}
                </span>

                {/* Copy button */}
                <button
                  onClick={(e) => handleCopy(tmpl, e)}
                  className="shrink-0 w-8 h-8 flex items-center justify-center rounded-neuro-sm bg-main hover:shadow-soft transition-all"
                  title="Copy plain text to clipboard"
                >
                  <FontAwesomeIcon
                    icon={copiedId === tmpl.id ? faCheck : faCopy}
                    className={`w-3.5 h-3.5 transition-colors ${copiedId === tmpl.id ? 'text-success' : 'text-secondary'}`}
                  />
                </button>

                <FontAwesomeIcon
                  icon={faChevronRight}
                  className="w-3 h-3 text-tertiary group-hover:text-secondary transition-colors shrink-0"
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Hover Preview Tooltip */}
      <AnimatePresence>
        {hoveredTemplate && (
          <motion.div
            key="tooltip"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.12 }}
            className="fixed z-50 w-72 neu-flat shadow-xl overflow-hidden flex flex-col"
            style={{ right: 24, top: tooltipY, maxHeight: '420px' }}
            onMouseEnter={keepTooltip}
            onMouseLeave={hideTooltip}
          >
            {/* Tooltip header */}
            <div className="px-4 pt-3.5 pb-3 border-b border-tertiary/20 flex items-start justify-between gap-2 shrink-0">
              <div className="min-w-0">
                <p className="font-bold text-sm text-primary leading-snug truncate">{hoveredTemplate.title}</p>
                <span className="text-[10px] font-mono text-secondary">{hoveredTemplate.buttonText}</span>
              </div>
              <button
                onClick={handleTooltipCopy}
                className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-neuro-sm bg-main hover:bg-surface-highlight transition-all text-xs font-semibold text-secondary"
              >
                <FontAwesomeIcon
                  icon={copiedId === hoveredTemplate.id ? faCheck : faCopy}
                  className={`w-3 h-3 ${copiedId === hoveredTemplate.id ? 'text-success' : ''}`}
                />
                {copiedId === hoveredTemplate.id ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Rendered HTML preview */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              <div
                className="text-[11px] leading-relaxed text-secondary pointer-events-none"
                style={{ fontFamily: 'Aptos, Calibri, Helvetica, sans-serif' }}
                dangerouslySetInnerHTML={{ __html: hoveredTemplate.htmlContent }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
