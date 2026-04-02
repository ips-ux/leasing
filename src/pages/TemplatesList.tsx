import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onSnapshot } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../components/ui';
import { getEmailTemplates, deleteEmailTemplate } from '../firebase/firestore';
import { NEW_APPLICANT_STEPS, TRANSFER_STEPS } from '../lib/workflow-steps';
import type { EmailTemplate } from '../types/emailTemplate';
import toast from 'react-hot-toast';

// Build a lookup for substep labels
const ALL_SUBSTEPS = [...NEW_APPLICANT_STEPS, ...TRANSFER_STEPS].flatMap(step =>
  step.subSteps.map(ss => ({ id: ss.id, label: ss.label, stepName: step.name, stepNum: step.step }))
);

const getSubStepLabel = (id: string): string => {
  const found = ALL_SUBSTEPS.find(ss => ss.id === id);
  return found ? `${found.id} – ${found.label}` : id;
};

// Strip HTML to plain text for preview
const htmlToPreview = (html: string, maxLen = 120): string => {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  const text = (temp.textContent || temp.innerText || '').replace(/\s+/g, ' ').trim();
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
};

export const TemplatesList = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const q = getEmailTemplates();
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmailTemplate));
      setTemplates(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete template "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteEmailTemplate(id);
      toast.success(`Deleted "${title}"`);
    } catch (err: any) {
      toast.error(`Failed to delete: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Email Templates</h1>
            <p className="text-secondary mt-1">Manage email templates linked to workflow substeps</p>
          </div>
          <Button variant="primary" onClick={() => navigate('/templates/new')}>
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            New Template
          </Button>
        </div>

        {/* Table */}
        <div className="neu-flat overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-secondary">Loading templates…</div>
          ) : templates.length === 0 ? (
            <div className="p-12 text-center text-secondary">
              <p className="text-lg font-medium mb-2">No templates yet</p>
              <p className="text-sm">Seed templates from the Data Migration page, or create a new one.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-tertiary/30">
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Template Title</th>
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Button Text</th>
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Linked Substep(s)</th>
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Preview</th>
                  <th className="w-16 px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {templates.map((tmpl, i) => (
                  <motion.tr
                    key={tmpl.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => navigate(`/templates/${tmpl.id}`)}
                    className="border-b border-tertiary/10 hover:bg-surface-highlight cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-primary">{tmpl.title}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 text-xs font-bold font-mono rounded-neuro-sm bg-neuro-lavender/30 text-primary border border-neuro-lavender/50">
                        {tmpl.buttonText}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {tmpl.linkedSubStepIds.map(id => (
                          <span key={id} className="text-[11px] font-mono bg-main px-2 py-0.5 rounded text-secondary border border-tertiary/30" title={getSubStepLabel(id)}>
                            {id}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-secondary max-w-xs truncate font-mono">
                      {htmlToPreview(tmpl.htmlContent)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(tmpl.id, tmpl.title); }}
                        disabled={deletingId === tmpl.id}
                        className="text-error/60 hover:text-error transition-colors p-1"
                        title="Delete template"
                      >
                        <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
