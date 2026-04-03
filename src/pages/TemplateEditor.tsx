import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { onSnapshot } from 'firebase/firestore';
import { Editor } from '@tinymce/tinymce-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck, faCode, faFont } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../components/ui';
import {
  getEmailTemplate,
  createEmailTemplate,
  updateEmailTemplate,
} from '../firebase/firestore';
import { NEW_APPLICANT_STEPS, TRANSFER_STEPS } from '../lib/workflow-steps';
import type { EmailTemplate } from '../types/emailTemplate';
import toast from 'react-hot-toast';

// Build flat list of all substeps for selection
const ALL_SUBSTEPS = [
  ...NEW_APPLICANT_STEPS.flatMap(step =>
    step.subSteps.map(ss => ({
      id: ss.id,
      label: `${ss.id} – ${ss.label}`,
      group: `New: Step ${step.step} – ${step.name}`,
    }))
  ),
  ...TRANSFER_STEPS.flatMap(step =>
    step.subSteps.map(ss => ({
      id: ss.id,
      label: `${ss.id} – ${ss.label}`,
      group: `Transfer: Step ${step.step} – ${step.name}`,
    }))
  ),
];

// Pseudo-code placeholders reference
const PSEUDO_CODES = [
  { code: '[Resident]', description: 'Applicant first name' },
  { code: '[PROSPECT]', description: 'Applicant first name' },
  { code: '[Applicant]', description: 'Applicant first name' },
  { code: '[APARTMENT#]', description: 'Unit number' },
  { code: '[Apartment#]', description: 'Unit number' },
  { code: '[APT#]', description: 'Unit number' },
  { code: '[Move-In Date]', description: 'Formatted move-in date' },
];

export const TemplateEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const editorRef = useRef<any>(null);
  const isNew = id === 'new';

  const [title, setTitle] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [linkedSubStepIds, setLinkedSubStepIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [editorMode, setEditorMode] = useState<'richtext' | 'html'>('richtext');
  const [rawHtml, setRawHtml] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Load existing template
  useEffect(() => {
    if (isNew) return;
    const docRef = getEmailTemplate(id!);
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Omit<EmailTemplate, 'id'>;
        setTitle(data.title);
        setButtonText(data.buttonText);
        setHtmlContent(data.htmlContent);
        setRawHtml(data.htmlContent);
        setLinkedSubStepIds(data.linkedSubStepIds || []);
      }
      setLoading(false);
    });
    return unsub;
  }, [id, isNew]);

  // Sync raw HTML textarea with editor when toggling modes
  useEffect(() => {
    if (editorMode === 'html') {
      // Entering HTML mode — get current content from editor
      if (editorRef.current) {
        setRawHtml(editorRef.current.getContent());
      }
    } else {
      // Entering Rich Text mode — push rawHtml into editor
      if (editorRef.current) {
        editorRef.current.setContent(rawHtml);
      }
      setHtmlContent(rawHtml);
    }
  }, [editorMode]);

  const handleSave = async () => {
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (!buttonText.trim()) { toast.error('Button Text is required'); return; }

    // Get the latest content based on current mode
    let finalHtml = htmlContent;
    if (editorMode === 'html') {
      finalHtml = rawHtml;
    } else if (editorRef.current) {
      finalHtml = editorRef.current.getContent();
    }

    setSaving(true);
    try {
      if (isNew) {
        await createEmailTemplate({
          title: title.trim(),
          buttonText: buttonText.trim(),
          htmlContent: finalHtml,
          linkedSubStepIds,
        });
        toast.success('Template created!');
      } else {
        await updateEmailTemplate(id!, {
          title: title.trim(),
          buttonText: buttonText.trim(),
          htmlContent: finalHtml,
          linkedSubStepIds,
        });
        toast.success('Template updated!');
      }
      navigate('/templates');
    } catch (err: any) {
      toast.error(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleSubStep = (ssId: string) => {
    setLinkedSubStepIds(prev =>
      prev.includes(ssId) ? prev.filter(id => id !== ssId) : [...prev, ssId]
    );
  };

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-secondary">Loading template…</p>
      </div>
    );
  }

  // Group substeps by their group name for organized display
  const groupedSubSteps = ALL_SUBSTEPS.reduce((acc, ss) => {
    if (!acc[ss.group]) acc[ss.group] = [];
    acc[ss.group].push(ss);
    return acc;
  }, {} as Record<string, typeof ALL_SUBSTEPS>);

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary">
            {isNew ? 'Create Template' : 'Edit Template'}
          </h1>
          <p className="text-secondary mt-1">
            {isNew ? 'Create a new email template' : `Editing: ${title}`}
          </p>
        </div>

        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Main Column */}
          <div className="flex-1 space-y-5">
            {/* Title & Button Text */}
            <div className="neu-flat p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-primary mb-1.5">Template Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Application Approved Email"
                  className="w-full px-4 py-2.5 rounded-neuro-sm bg-main shadow-neuro-pressed font-medium focus:outline-none focus:ring-2 focus:ring-neuro-lavender"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-primary mb-1.5">Button Text</label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={e => setButtonText(e.target.value)}
                  placeholder="e.g. APP APRVD"
                  className="w-full px-4 py-2.5 rounded-neuro-sm bg-main shadow-neuro-pressed font-mono font-bold focus:outline-none focus:ring-2 focus:ring-neuro-lavender"
                />
                <p className="text-[11px] text-secondary mt-1">This text appears on the template button in workflow substeps</p>
              </div>
            </div>

            {/* WYSIWYG Editor */}
            <div className="neu-flat p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-primary">Email Content</label>
                <div className="flex items-center gap-1 p-0.5 bg-main rounded-neuro-sm shadow-neuro-pressed">
                  <button
                    onClick={() => setEditorMode('richtext')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-neuro-sm transition-all flex items-center gap-1.5 ${
                      editorMode === 'richtext'
                        ? 'bg-surface shadow-soft text-primary'
                        : 'text-secondary hover:text-primary'
                    }`}
                  >
                    <FontAwesomeIcon icon={faFont} /> Rich Text
                  </button>
                  <button
                    onClick={() => setEditorMode('html')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-neuro-sm transition-all flex items-center gap-1.5 ${
                      editorMode === 'html'
                        ? 'bg-surface shadow-soft text-primary'
                        : 'text-secondary hover:text-primary'
                    }`}
                  >
                    <FontAwesomeIcon icon={faCode} /> HTML Mode
                  </button>
                </div>
              </div>

              <div className={`relative ${editorMode === 'html' ? 'tinymce-html-active' : ''}`}>
                <style>{`
                  .tinymce-html-active .tox-edit-area {
                    display: none !important;
                  }
                  .tinymce-html-active .tox-statusbar {
                    display: none !important;
                  }
                  .tinymce-html-active .tox-tinymce {
                    border-bottom-left-radius: 0;
                    border-bottom-right-radius: 0;
                    border-bottom: none;
                  }
                `}</style>
                <Editor
                  onInit={(_evt, editor) => { editorRef.current = editor; }}
                  tinymceScriptSrc="/tinymce/tinymce.min.js"
                  initialValue={htmlContent}
                  disabled={editorMode === 'html'}
                  onEditorChange={(content) => {
                    if (editorMode === 'richtext') {
                      setHtmlContent(content);
                      setRawHtml(content);
                    }
                  }}
                  licenseKey="gpl"
                  init={{
                    height: 500,
                    menubar: true,
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount',
                      'emoticons',
                    ],
                    toolbar:
                      'undo redo | blocks fontfamily fontsize | ' +
                      'bold italic underline strikethrough | forecolor backcolor | ' +
                      'alignleft aligncenter alignright alignjustify | ' +
                      'bullist numlist outdent indent | ' +
                      'link image table emoticons charmap | ' +
                      'removeformat searchreplace code fullscreen | help',
                    content_style: `
                      body {
                        font-family: Aptos, Calibri, Helvetica, sans-serif;
                        font-size: 12pt;
                        line-height: 1.38;
                        color: #000000;
                        padding: 12px;
                      }
                    `,
                    skin: false,
                    content_css: false,
                    promotion: false,
                    branding: false,
                  }}
                />
                
                {editorMode === 'html' && (
                  <textarea
                    value={rawHtml}
                    onChange={e => setRawHtml(e.target.value)}
                    className="w-full h-[400px] px-4 py-3 bg-white font-mono text-sm focus:outline-none resize-none border border-black/20 border-t-0 rounded-b-neuro-sm"
                    style={{ 
                      marginTop: 0,
                      boxShadow: 'none',
                    }}
                    placeholder="Paste or edit raw HTML here…"
                    spellCheck={false}
                  />
                )}
              </div>
            </div>

            {/* Substep Selector */}
            <div className="neu-flat p-6">
              <label className="block text-sm font-bold text-primary mb-3">Link to Substeps</label>
              <p className="text-xs text-secondary mb-4">
                Select which workflow substeps should display this template as a copyable button.
              </p>

              <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                {Object.entries(groupedSubSteps).map(([group, substeps]) => (
                  <div key={group}>
                    <p className="text-[11px] font-bold text-secondary uppercase tracking-wider mb-1.5">{group}</p>
                    <div className="space-y-1">
                      {substeps.map(ss => {
                        const isSelected = linkedSubStepIds.includes(ss.id);
                        return (
                          <button
                            key={ss.id}
                            onClick={() => toggleSubStep(ss.id)}
                            className={`w-full text-left px-3 py-2 rounded-neuro-sm text-sm transition-all ${
                              isSelected
                                ? 'bg-neuro-lavender/25 text-primary font-semibold border border-neuro-lavender/50'
                                : 'bg-main text-secondary hover:bg-surface-highlight hover:text-primary border border-transparent'
                            }`}
                          >
                            <span className="font-mono text-xs mr-2">{ss.id}</span>
                            {ss.label.replace(`${ss.id} – `, '')}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button variant="primary" onClick={handleSave} isLoading={saving} disabled={saving}>
                {saving ? 'Saving…' : isNew ? 'Create Template' : 'Save Changes'}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/templates')}>
                Cancel
              </Button>
            </div>
          </div>

          {/* Side Panel — Pseudo-Code Guide */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="neu-flat p-5 sticky top-8">
              <h3 className="text-sm font-bold text-primary mb-3">📝 Pseudo-Code Inserts</h3>
              <p className="text-[11px] text-secondary mb-4">
                Use these placeholders in your template. They will be automatically replaced with applicant data when copied.
              </p>

              <div className="space-y-2">
                {PSEUDO_CODES.map(({ code, description }) => (
                  <button
                    key={code}
                    onClick={() => handleCopyCode(code)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-neuro-sm bg-main hover:bg-surface-highlight transition-all group"
                    title={`Click to copy: ${code}`}
                  >
                    <div className="text-left">
                      <span className="text-xs font-mono font-bold text-accent">{code}</span>
                      <p className="text-[10px] text-secondary">{description}</p>
                    </div>
                    <FontAwesomeIcon
                      icon={copiedCode === code ? faCheck : faCopy}
                      className={`w-3 h-3 transition-colors ${
                        copiedCode === code ? 'text-success' : 'text-tertiary group-hover:text-secondary'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
