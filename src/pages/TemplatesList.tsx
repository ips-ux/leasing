import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faTrash, faTag, faChevronDown, faChevronUp,
  faPen, faCheck, faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '../components/ui';
import {
  getEmailTemplates, deleteEmailTemplate,
  getEmailTemplateCategories, createEmailTemplateCategory,
  updateEmailTemplateCategory, deleteEmailTemplateCategory,
} from '../firebase/firestore';
import { NEW_APPLICANT_STEPS, TRANSFER_STEPS } from '../lib/workflow-steps';
import type { EmailTemplate, EmailTemplateCategory } from '../types/emailTemplate';
import { CATEGORY_COLORS } from '../types/emailTemplate';
import toast from 'react-hot-toast';

const ALL_SUBSTEPS = [...NEW_APPLICANT_STEPS, ...TRANSFER_STEPS].flatMap(step =>
  step.subSteps.map(ss => ({ id: ss.id, label: ss.label, stepName: step.name, stepNum: step.step }))
);

const getSubStepLabel = (id: string): string => {
  const found = ALL_SUBSTEPS.find(ss => ss.id === id);
  return found ? `${found.id} – ${found.label}` : id;
};

const htmlToPreview = (html: string, maxLen = 120): string => {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  const text = (temp.textContent || temp.innerText || '').replace(/\s+/g, ' ').trim();
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
};

const ColorSwatch = ({
  selected,
  color,
  onClick,
}: {
  selected: boolean;
  color: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="w-5 h-5 rounded-full transition-transform hover:scale-110 shrink-0"
    style={{
      backgroundColor: color,
      outline: selected ? `2px solid ${color}` : '2px solid transparent',
      outlineOffset: '2px',
    }}
  />
);

export const TemplatesList = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [categories, setCategories] = useState<EmailTemplateCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Category panel
  const [catPanelOpen, setCatPanelOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [addingCat, setAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState<string>(CATEGORY_COLORS[0]);
  const [savingCat, setSavingCat] = useState(false);

  useEffect(() => {
    const q = getEmailTemplates();
    return onSnapshot(q, (snap) => {
      setTemplates(snap.docs.map(d => ({ id: d.id, ...d.data() } as EmailTemplate)));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const q = getEmailTemplateCategories();
    return onSnapshot(q, (snap) => {
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() } as EmailTemplateCategory)));
    });
  }, []);

  const getCategoryById = (id: string) => categories.find(c => c.id === id);

  // ── Category handlers ──────────────────────────────────────────
  const handleStartEdit = (cat: EmailTemplateCategory) => {
    setEditingCatId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
    setAddingCat(false);
  };

  const handleCancelEdit = () => {
    setEditingCatId(null);
    setEditName('');
    setEditColor('');
  };

  const handleSaveEdit = async () => {
    if (!editName.trim() || !editingCatId) return;
    setSavingCat(true);
    try {
      await updateEmailTemplateCategory(editingCatId, { name: editName.trim(), color: editColor });
      handleCancelEdit();
    } catch (err: any) {
      toast.error(`Failed to update: ${err.message}`);
    } finally {
      setSavingCat(false);
    }
  };

  const handleDeleteCat = async (cat: EmailTemplateCategory) => {
    if (!confirm(`Delete category "${cat.name}"? Templates will become uncategorized.`)) return;
    try {
      await deleteEmailTemplateCategory(cat.id);
      toast.success(`Deleted "${cat.name}"`);
    } catch (err: any) {
      toast.error(`Failed to delete: ${err.message}`);
    }
  };

  const handleAddCat = async () => {
    if (!newCatName.trim()) return;
    setSavingCat(true);
    try {
      await createEmailTemplateCategory(newCatName.trim(), newCatColor);
      setNewCatName('');
      setNewCatColor(CATEGORY_COLORS[0]);
      setAddingCat(false);
    } catch (err: any) {
      toast.error(`Failed to create: ${err.message}`);
    } finally {
      setSavingCat(false);
    }
  };

  const handleCancelAdd = () => {
    setAddingCat(false);
    setNewCatName('');
    setNewCatColor(CATEGORY_COLORS[0]);
  };

  const handleDeleteTemplate = async (id: string, title: string) => {
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">Email Templates</h1>
            <p className="text-secondary mt-1">Manage email templates linked to workflow substeps</p>
          </div>
          <Button variant="primary" onClick={() => navigate('/templates/new')}>
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            New Template
          </Button>
        </div>

        {/* ── Category Panel ─────────────────────────────────────── */}
        <div className="neu-flat overflow-hidden mb-4">
          <button
            type="button"
            onClick={() => setCatPanelOpen(p => !p)}
            className="w-full flex items-center gap-3 px-6 py-4 hover:bg-surface-highlight transition-colors"
          >
            <FontAwesomeIcon icon={faTag} className="text-secondary w-3.5 h-3.5" />
            <span className="font-bold text-primary text-sm">Categories</span>
            {categories.length > 0 && (
              <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-neuro-lavender/25 text-primary border border-neuro-lavender/40">
                {categories.length}
              </span>
            )}
            <FontAwesomeIcon
              icon={catPanelOpen ? faChevronUp : faChevronDown}
              className="ml-auto text-tertiary w-3 h-3"
            />
          </button>

          <AnimatePresence>
            {catPanelOpen && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.18, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-5 border-t border-tertiary/20">
                  <div className="space-y-0.5 mt-4">
                    {categories.length === 0 && !addingCat && (
                      <p className="text-sm text-secondary py-2">No categories yet.</p>
                    )}

                    {categories.map(cat =>
                      editingCatId === cat.id ? (
                        /* Edit row */
                        <div key={cat.id} className="flex items-center gap-3 py-2">
                          <div className="flex items-center gap-1 shrink-0">
                            {CATEGORY_COLORS.map(c => (
                              <ColorSwatch key={c} color={c} selected={editColor === c} onClick={() => setEditColor(c)} />
                            ))}
                          </div>
                          <input
                            autoFocus
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveEdit();
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                            className="flex-1 px-3 py-1.5 rounded-neuro-sm bg-main shadow-neuro-pressed text-sm font-medium focus:outline-none focus:ring-2 focus:ring-neuro-lavender"
                            placeholder="Category name"
                          />
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            disabled={savingCat || !editName.trim()}
                            className="p-1.5 rounded-neuro-sm bg-main hover:bg-surface-highlight transition-colors text-success disabled:opacity-40"
                          >
                            <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="p-1.5 rounded-neuro-sm bg-main hover:bg-surface-highlight transition-colors text-secondary"
                          >
                            <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        /* View row */
                        <div
                          key={cat.id}
                          className="flex items-center gap-3 px-3 py-2 rounded-neuro-sm hover:bg-surface-highlight transition-colors group"
                        >
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                          <span className="flex-1 text-sm font-semibold text-primary">{cat.name}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(cat)}
                              className="p-1.5 rounded-neuro-sm hover:bg-main transition-colors text-secondary hover:text-primary"
                              title="Rename"
                            >
                              <FontAwesomeIcon icon={faPen} className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCat(cat)}
                              className="p-1.5 rounded-neuro-sm hover:bg-main transition-colors text-error/60 hover:text-error"
                              title="Delete"
                            >
                              <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )
                    )}

                    {/* Add form */}
                    {addingCat && (
                      <div className="flex items-center gap-3 py-2 mt-2 pt-3 border-t border-tertiary/20">
                        <div className="flex items-center gap-1 shrink-0">
                          {CATEGORY_COLORS.map(c => (
                            <ColorSwatch key={c} color={c} selected={newCatColor === c} onClick={() => setNewCatColor(c)} />
                          ))}
                        </div>
                        <input
                          autoFocus
                          value={newCatName}
                          onChange={e => setNewCatName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleAddCat();
                            if (e.key === 'Escape') handleCancelAdd();
                          }}
                          className="flex-1 px-3 py-1.5 rounded-neuro-sm bg-main shadow-neuro-pressed text-sm font-medium focus:outline-none focus:ring-2 focus:ring-neuro-lavender"
                          placeholder="Category name"
                        />
                        <button
                          type="button"
                          onClick={handleAddCat}
                          disabled={savingCat || !newCatName.trim()}
                          className="px-3 py-1.5 text-xs font-bold rounded-neuro-sm bg-neuro-lavender/20 border border-neuro-lavender/40 text-primary hover:bg-neuro-lavender/30 transition-colors disabled:opacity-40"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelAdd}
                          className="p-1.5 rounded-neuro-sm hover:bg-surface-highlight transition-colors text-secondary"
                        >
                          <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {!addingCat && (
                    <button
                      type="button"
                      onClick={() => { setAddingCat(true); setEditingCatId(null); }}
                      className="mt-3 flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-secondary hover:text-primary hover:bg-surface-highlight rounded-neuro-sm transition-colors"
                    >
                      <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                      Add Category
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Template Table ─────────────────────────────────────── */}
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
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Categories</th>
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Button Text</th>
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Linked Substep(s)</th>
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Preview</th>
                  <th className="w-16 px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {templates.map((tmpl, i) => {
                  const cats = (tmpl.categoryIds ?? []).map(id => getCategoryById(id)).filter(Boolean) as EmailTemplateCategory[];
                  return (
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
                        {cats.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {cats.map(cat => (
                              <span
                                key={cat.id}
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                                style={{
                                  backgroundColor: `${cat.color}22`,
                                  color: cat.color,
                                  border: `1px solid ${cat.color}55`,
                                }}
                              >
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                                {cat.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-tertiary text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 text-xs font-bold font-mono rounded-neuro-sm bg-neuro-lavender/30 text-primary border border-neuro-lavender/50">
                          {tmpl.buttonText}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(tmpl.linkedSubStepIds ?? []).map(id => (
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
                          onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(tmpl.id, tmpl.title); }}
                          disabled={deletingId === tmpl.id}
                          className="text-error/60 hover:text-error transition-colors p-1"
                          title="Delete template"
                        >
                          <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};
