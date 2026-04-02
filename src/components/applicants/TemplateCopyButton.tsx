import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faFont, faCheck } from '@fortawesome/free-solid-svg-icons';
import { replacePlaceholders } from '../../services/scheduler/outlookEmailService';
import type { Applicant } from '../../types/applicant';
import type { EmailTemplate } from '../../types/emailTemplate';

interface TemplateCopyButtonProps {
  template: EmailTemplate;
  applicant: Applicant;
}

const htmlToPlainText = (html: string): string => {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  temp.querySelectorAll('script, style').forEach(el => el.remove());
  let text = temp.textContent || temp.innerText || '';
  text = text
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
  return text;
};

export const TemplateCopyButton = ({ template, applicant }: TemplateCopyButtonProps) => {
  const [showPopover, setShowPopover] = useState(false);
  const [copiedState, setCopiedState] = useState<'html' | 'rich' | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close popover on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setShowPopover(false);
      }
    };
    if (showPopover) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPopover]);

  const prepareContent = () => {
    let content = replacePlaceholders(template.htmlContent, applicant);
    return content.replace(/\\"/g, '"').replace(/\\/g, '');
  };

  const handleCopyHTML = async () => {
    try {
      const content = prepareContent();
      await navigator.clipboard.writeText(content);
      setCopiedState('html');
      setTimeout(() => { setCopiedState(null); setShowPopover(false); }, 1200);
    } catch {
      alert('Failed to copy HTML');
    }
  };

  const handleCopyRichText = async () => {
    try {
      const sanitizedHtml = prepareContent();
      const plainText = htmlToPlainText(sanitizedHtml);
      const htmlBlob = new Blob([sanitizedHtml], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      await navigator.clipboard.write([
        new ClipboardItem({ 'text/html': htmlBlob, 'text/plain': textBlob }),
      ]);
      setCopiedState('rich');
      setTimeout(() => { setCopiedState(null); setShowPopover(false); }, 1200);
    } catch {
      alert('Failed to copy Rich Text. Please try Copy HTML instead.');
    }
  };

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={() => setShowPopover(v => !v)}
        className="px-2.5 py-1 text-[11px] font-bold font-mono rounded-neuro-sm bg-neuro-lavender/25 text-neuro-primary border border-neuro-lavender/50 hover:bg-neuro-lavender/40 transition-all shadow-sm"
        title={template.title}
      >
        📧 {template.buttonText}
      </button>

      <AnimatePresence>
        {showPopover && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, scale: 0.92, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 left-0 z-50 min-w-[180px]"
          >
            <div className="backdrop-blur-xl rounded-neuro-md shadow-neuro-raised overflow-hidden"
              style={{ background: 'rgba(255, 255, 255, 0.97)' }}
            >
              <div className="p-1.5">
                <p className="text-[10px] font-bold text-black/40 uppercase tracking-wider px-2.5 py-1">
                  Copy "{template.buttonText}"
                </p>
                <button
                  onClick={handleCopyRichText}
                  className="w-full text-left px-2.5 py-2 rounded-neuro-sm text-sm font-medium hover:bg-neuro-lavender/20 transition-all flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={copiedState === 'rich' ? faCheck : faFont} className="w-3.5 h-3.5 text-neuro-lavender" />
                  <span>{copiedState === 'rich' ? 'Copied!' : 'Rich Text'}</span>
                </button>
                <button
                  onClick={handleCopyHTML}
                  className="w-full text-left px-2.5 py-2 rounded-neuro-sm text-sm font-medium hover:bg-neuro-lavender/20 transition-all flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={copiedState === 'html' ? faCheck : faCode} className="w-3.5 h-3.5 text-neuro-lavender" />
                  <span>{copiedState === 'html' ? 'Copied!' : 'HTML'}</span>
                </button>
              </div>
            </div>

            {/* Speech bubble tail */}
            <svg className="absolute -bottom-1.5 left-4" width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path d="M6 8L0 0H12L6 8Z" fill="rgba(255, 255, 255, 0.97)" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
