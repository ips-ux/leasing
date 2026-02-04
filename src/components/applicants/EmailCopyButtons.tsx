import { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faFont, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../ui';
import { replacePlaceholders } from '../../services/scheduler/outlookEmailService';
import type { Applicant } from '../../types/applicant';
import type { EmailTemplateType } from '../../services/scheduler/outlookEmailService';

interface EmailCopyButtonsProps {
  emailHtml: string;
  emailType: EmailTemplateType;
  buttonPrefix?: 'Copy' | 'Copy Request'; // Defaults to 'Copy'
  compact?: boolean;
  applicant?: Applicant | null; // Applicant data for placeholder replacement
}

// Convert HTML to plain text
const htmlToPlainText = (html: string): string => {
  // Create a temporary div to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Remove script and style elements
  const scripts = temp.querySelectorAll('script, style');
  scripts.forEach((el) => el.remove());

  // Get text content and clean it up
  let text = temp.textContent || temp.innerText || '';

  // Clean up excessive whitespace
  text = text
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace triple+ newlines with double
    .replace(/[ \t]+/g, ' ') // Replace multiple spaces/tabs with single space
    .trim();

  return text;
};

export const EmailCopyButtons = ({
  emailHtml,
  emailType,
  buttonPrefix = 'Copy',
  compact = false,
  applicant = null
}: EmailCopyButtonsProps) => {
  const [copiedState, setCopiedState] = useState<'html' | 'rich' | null>(null);

  // Helper to prepare content with placeholders and sanitation
  const prepareContent = () => {
    let content = replacePlaceholders(emailHtml, applicant);
    // Fix escaped quotes/backslashes
    return content.replace(/\\"/g, '"').replace(/\\/g, '');
  };

  const handleCopyHTML = async () => {
    try {
      const content = prepareContent();
      await navigator.clipboard.writeText(content);
      setCopiedState('html');
      setTimeout(() => setCopiedState(null), 2000);
    } catch (error) {
      console.error('Failed to copy HTML:', error);
      alert('Failed to copy HTML');
    }
  };

  const handleCopyRichText = async () => {
    try {
      const sanitizedHtml = prepareContent();
      const plainText = htmlToPlainText(sanitizedHtml);

      const htmlBlob = new Blob([sanitizedHtml], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });

      const data = [
        new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob,
        }),
      ];

      await navigator.clipboard.write(data);
      setCopiedState('rich');
      setTimeout(() => setCopiedState(null), 2000);
    } catch (error) {
      console.error('Failed to copy Rich Text:', error);
      alert('Failed to copy Rich Text. Please try Copy HTML instead.');
    }
  };

  const emailName =
    emailType === 'application-approved'
      ? 'Application Approved Email'
      : emailType === 'final-steps'
        ? 'Final Steps Email'
        : 'Request Income Email';

  return (
    <div className={`${compact ? '' : 'mt-3 ml-8'} flex items-center gap-2 flex-wrap`}>
      {!compact && <span className="text-xs font-mono text-black/60 mr-2">📧 {emailName}:</span>}

      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          variant="secondary"
          onClick={handleCopyHTML}
          className="!text-xs !px-3 !py-1"
          title={`${buttonPrefix} HTML`}
        >
          <FontAwesomeIcon icon={copiedState === 'html' ? faCheck : faCode} />
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
      >
        <Button
          variant="secondary"
          onClick={handleCopyRichText}
          className="!text-xs !px-3 !py-1"
          title={`${buttonPrefix} Rich Text`}
        >
          <FontAwesomeIcon icon={copiedState === 'rich' ? faCheck : faFont} />
        </Button>
      </motion.div>
    </div>
  );
};
